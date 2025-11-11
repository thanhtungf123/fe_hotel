import React, { useState, useEffect } from 'react'
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosInstance'
import { useAuth } from '../../store/auth'
import showToast from '../../utils/toast'

export default function ReviewFormForRoom({ roomId, onSuccess }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Load reviewable bookings
  useEffect(() => {
    if (!user || !roomId) return
    loadBookings()
  }, [user, roomId])

  const loadBookings = async () => {
    if (!user?.token) return
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.get(`/reviews/room/${roomId}/reviewable-bookings`)
      const reviewableBookings = Array.isArray(data) 
        ? data.filter(b => !b.hasReview) // Chỉ lấy các booking chưa có review
        : []
      setBookings(reviewableBookings)
      
      // Tự động chọn booking đầu tiên nếu có
      if (reviewableBookings.length > 0 && !selectedBookingId) {
        setSelectedBookingId(reviewableBookings[0].bookingId)
      }
    } catch (e) {
      console.error('Failed to load reviewable bookings:', e)
      // Không hiển thị error nếu là 401/400 (chưa đăng nhập) hoặc 404 (endpoint chưa sẵn sàng)
      // 400 có thể do token không hợp lệ
      if (e?.response?.status === 401 || e?.response?.status === 400 || e?.response?.status === 404) {
        // Ẩn component nếu chưa đăng nhập hoặc endpoint chưa có
        setBookings([])
      } else {
        // Chỉ log error, không hiển thị cho user
        console.error('Unexpected error:', e)
        setBookings([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!selectedBookingId) {
      setError('Vui lòng chọn đặt phòng để đánh giá')
      return
    }
    
    if (!comment.trim()) {
      setError('Vui lòng nhập nội dung đánh giá')
      return
    }
    
    setSubmitting(true)
    try {
      await axios.post('/reviews', {
        bookingId: selectedBookingId,
        rating,
        comment: comment.trim()
      })
      showToast.success('Đánh giá đã được gửi thành công!')
      setComment('')
      setRating(5)
      // Reload bookings để ẩn booking đã review
      await loadBookings()
      // Trigger refresh reviews và rating
      if (onSuccess) {
        onSuccess()
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Gửi đánh giá thất bại'
      setError(msg)
      showToast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Hiển thị thông báo nếu chưa đăng nhập
  if (!user) {
    return (
      <Card className="mb-4" style={{ border: '2px solid #f0f0f0', borderRadius: '12px' }}>
        <Card.Body className="text-center py-4">
          <p className="mb-3 text-muted">Vui lòng đăng nhập để viết đánh giá</p>
          <Button 
            variant="primary"
            onClick={() => navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`)}
            style={{
              background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.5rem',
              fontWeight: '600'
            }}
          >
            Đăng nhập
          </Button>
        </Card.Body>
      </Card>
    )
  }

  // Hiển thị loading
  if (loading) {
    return (
      <Card className="mb-4" style={{ border: '2px solid #f0f0f0', borderRadius: '12px' }}>
        <Card.Body className="text-center py-4">
          <Spinner size="sm" /> <span className="ms-2">Đang kiểm tra đặt phòng...</span>
        </Card.Body>
      </Card>
    )
  }

  // Hiển thị thông báo nếu chưa có booking
  if (bookings.length === 0) {
    return (
      <Card className="mb-4" style={{ border: '2px solid #f0f0f0', borderRadius: '12px' }}>
        <Card.Body>
          <div className="text-center py-3">
            <div className="mb-3">
              <strong style={{ fontSize: '1.1rem', color: '#495057' }}>
                Bạn cần đặt phòng trước khi đánh giá
              </strong>
            </div>
            <Button 
              variant="primary"
              onClick={() => navigate(`/booking/${roomId}`)}
              style={{
                background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.6rem 1.5rem',
                fontWeight: '600'
              }}
            >
              Đặt phòng ngay
            </Button>
          </div>
        </Card.Body>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4" style={{ border: '2px solid #f0f0f0', borderRadius: '12px' }}>
        <Card.Body>
          <Card.Title className="h5 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Viết đánh giá
          </Card.Title>
          
          {error && (
            <Alert variant="danger" className="py-2 mb-3" style={{ fontSize: '0.9rem' }}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* Chọn booking nếu có nhiều booking */}
            {bookings.length > 1 && (
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-muted">
                  Chọn đặt phòng để đánh giá
                </Form.Label>
                <Form.Select
                  value={selectedBookingId || ''}
                  onChange={(e) => setSelectedBookingId(parseInt(e.target.value))}
                  style={{ borderRadius: '8px' }}
                >
                  <option value="">-- Chọn đặt phòng --</option>
                  {bookings.map((booking) => (
                    <option key={booking.bookingId} value={booking.bookingId}>
                      Đặt phòng #{booking.bookingId} - {booking.checkIn} đến {booking.checkOut}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            {/* Hiển thị thông tin booking nếu chỉ có 1 booking */}
            {bookings.length === 1 && (
              <div className="mb-3 p-2 bg-light rounded" style={{ fontSize: '0.9rem' }}>
                <strong>Đặt phòng #{bookings[0].bookingId}</strong>
                <span className="text-muted ms-2">
                  ({bookings[0].checkIn} → {bookings[0].checkOut})
                </span>
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-muted">
                Đánh giá sao <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                style={{ borderRadius: '8px' }}
              >
                <option value={5}>5 sao - Tuyệt vời</option>
                <option value={4}>4 sao - Tốt</option>
                <option value={3}>3 sao - Bình thường</option>
                <option value={2}>2 sao - Tệ</option>
                <option value={1}>1 sao - Rất tệ</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-muted">
                Nội dung đánh giá <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về phòng này..."
                maxLength={1000}
                style={{ borderRadius: '8px' }}
              />
              <Form.Text className="text-muted" style={{ fontSize: '0.85rem' }}>
                {comment.length}/1000 ký tự
              </Form.Text>
            </Form.Group>

            <Button
              type="submit"
              disabled={submitting || !selectedBookingId}
              variant="primary"
              style={{
                background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.6rem 1.5rem',
                fontWeight: '600'
              }}
            >
              {submitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Đang gửi...
                </>
              ) : (
                'Gửi đánh giá'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </motion.div>
  )
}

