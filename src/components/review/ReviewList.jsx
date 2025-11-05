import React, { useEffect, useState } from 'react'
import { Card, Badge, Spinner, Alert } from 'react-bootstrap'
import { motion } from 'framer-motion'
import axios from '../../api/axiosInstance'

export default function ReviewList({ roomId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!roomId) return
    loadReviews()
  }, [roomId])

  const loadReviews = async () => {
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="d-flex align-items-start gap-3">
              {review.accountAvatar && (
                <img
                  src={review.accountAvatar}
                  alt={review.accountName}
                  className="rounded-circle"
                  style={{
                    width: '56px',
                    height: '56px',
                    objectFit: 'cover',
                    border: '3px solid #f0f0f0'
                  }}
                />
              )}
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="fw-semibold">{review.accountName || 'Khách hàng'}</div>
                  <Badge bg="warning" text="dark">
                    {review.rating} sao
                  </Badge>
                </div>
                {review.comment && (
                  <p className="mb-2" style={{ lineHeight: '1.6' }}>
                    {review.comment}
                  </p>
                )}
                <div className="small text-muted">
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


