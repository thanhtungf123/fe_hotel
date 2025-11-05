import React, { useState } from 'react'
import { Card, Form, Button, Alert } from 'react-bootstrap'
import axios from '../../api/axiosInstance'
import { useAuth } from '../../store/auth'
import showToast from '../../utils/toast'

export default function ReviewForm({ bookingId, roomId, onSuccess }) {
  const { user } = useAuth()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center text-muted">
          <p className="mb-0">Vui lòng đăng nhập để viết đánh giá</p>
        </Card.Body>
      </Card>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!comment.trim()) {
      setError('Vui lòng nhập nội dung đánh giá')
      return
    }
    setLoading(true)
    try {
      await axios.post('/reviews', {
        bookingId,
        rating,
        comment: comment.trim()
      })
      showToast.success('✅ Đánh giá đã được gửi!')
      setComment('')
      setRating(5)
      onSuccess?.()
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Gửi đánh giá thất bại'
      setError(msg)
      showToast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-3">
      <Card.Body>
        <h6 className="mb-3">Viết đánh giá</h6>
        {error && <Alert variant="danger" className="py-2">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Đánh giá sao</Form.Label>
            <Form.Select
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
            >
              <option value={5}>5 ⭐ - Tuyệt vời</option>
              <option value={4}>4 ⭐ - Tốt</option>
              <option value={3}>3 ⭐ - Bình thường</option>
              <option value={2}>2 ⭐ - Tệ</option>
              <option value={1}>1 ⭐ - Rất tệ</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nội dung đánh giá</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về phòng này..."
              maxLength={1000}
            />
            <Form.Text className="text-muted">
              {comment.length}/1000 ký tự
            </Form.Text>
          </Form.Group>
          <Button type="submit" disabled={loading} variant="primary">
            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}


