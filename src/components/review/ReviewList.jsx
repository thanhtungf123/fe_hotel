import React, { useEffect, useState } from 'react'
import { Card, Badge, Spinner, Alert, Button } from 'react-bootstrap'
import { motion } from 'framer-motion'
import axios from '../../api/axiosInstance'
import { useAuth } from '../../store/auth'
import showConfirm from '../common/ConfirmModal'
import showToast from '../../utils/toast'

export default function ReviewList({ roomId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const auth = useAuth()
  const currentAccountId = auth?.user?.accountId

  const loadReviews = async () => {
    if (!roomId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.get(`/reviews/room/${roomId}`)
      setReviews(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể tải đánh giá')
    } finally {
      setLoading(false)
    }
  }

  const emitReviewUpdated = () => {
    const detail = { roomId }
    window.dispatchEvent(new CustomEvent('review-submitted', { detail }))
    window.dispatchEvent(new CustomEvent('review-deleted', { detail }))
  }

  const handleDelete = async (reviewId) => {
    const confirmed = await showConfirm({
      title: 'Xóa đánh giá',
      message: 'Bạn có chắc muốn xóa đánh giá này? Bạn có thể viết lại sau.',
      confirmText: 'Xóa',
      variant: 'danger'
    })
    if (!confirmed) return

    try {
      setDeletingId(reviewId)
      await axios.delete(`/reviews/${reviewId}`)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      emitReviewUpdated()
      showToast.success('Đã xóa đánh giá')
    } catch (e) {
      showToast.error(e?.response?.data?.message || 'Xóa đánh giá thất bại')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [roomId])

  // Listen for review submission event to refresh
  useEffect(() => {
    const handleReviewSubmitted = (e) => {
      if (e.detail?.roomId === roomId) {
        loadReviews()
      }
    }
    window.addEventListener('review-submitted', handleReviewSubmitted)
    return () => window.removeEventListener('review-submitted', handleReviewSubmitted)
  }, [roomId])

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Hôm nay'
    if (diffDays === 1) return 'Hôm qua'
    if (diffDays < 7) return `${diffDays} ngày trước`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`
    return `${Math.floor(diffDays / 365)} năm trước`
  }

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-4">
          <Spinner size="sm" /> Đang tải đánh giá...
        </Card.Body>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <Card.Body>
          <Alert variant="warning">{error}</Alert>
        </Card.Body>
      </Card>
    )
  }

  return (
    <div>
      {reviews.length === 0 ? (
        <Card>
          <Card.Body className="text-center text-muted py-5">
            <p className="mb-2 fw-semibold">Chưa có đánh giá nào</p>
            <p className="small">Hãy là người đầu tiên đánh giá phòng này!</p>
          </Card.Body>
        </Card>
      ) : (
        reviews.map((review, i) => (
          <motion.div
            key={review.id}
            className="mb-4 pb-4 border-bottom"
            style={{
              borderBottom: '1px solid #e9ecef',
              paddingBottom: '1.5rem'
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="d-flex align-items-start gap-3">
              {review.accountAvatar ? (
                <img
                  src={review.accountAvatar}
                  alt={review.accountName}
                  className="rounded-circle"
                  style={{
                    width: '56px',
                    height: '56px',
                    objectFit: 'cover',
                    border: '3px solid #f0f0f0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
              ) : (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: '#C9A24A',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {(review.accountName || 'K')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-grow-1">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="fw-semibold" style={{ fontSize: '1rem', color: '#333' }}>
                    {review.accountName || 'Khách hàng'}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {currentAccountId && currentAccountId === review.accountId && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="me-2"
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                      >
                        {deletingId === review.id ? 'Đang xóa...' : 'Xóa'}
                      </Button>
                    )}
                    <div className="d-flex align-items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i}
                          style={{ 
                            color: i < review.rating ? '#FFB800' : '#E0E0E0',
                            fontSize: '1rem'
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <Badge 
                      bg="warning" 
                      text="dark"
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        padding: '0.25rem 0.5rem'
                      }}
                    >
                      {review.rating}/5
                    </Badge>
                  </div>
                </div>
                {review.comment && (
                  <p 
                    className="mb-2" 
                    style={{ 
                      lineHeight: '1.7',
                      color: '#495057',
                      fontSize: '0.95rem'
                    }}
                  >
                    {review.comment}
                  </p>
                )}
                <div 
                  className="small text-muted"
                  style={{ fontSize: '0.85rem' }}
                >
                  {formatDate(review.createdAt)}
                </div>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  )
}


