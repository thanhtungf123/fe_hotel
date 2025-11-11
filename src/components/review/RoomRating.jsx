import React, { useEffect, useState } from 'react'
import { Card, Badge, Spinner, Alert } from 'react-bootstrap'
import { motion } from 'framer-motion'
import axios from '../../api/axiosInstance'

export default function RoomRating({ roomId }) {
  const [rating, setRating] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadRating = async () => {
    if (!roomId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.get(`/reviews/room/${roomId}/rating`)
      // Đảm bảo luôn có rating data, kể cả khi không có review
      setRating(data || { averageRating: 0, totalReviews: 0, ratingHistogram: {} })
    } catch (e) {
      console.error('Failed to load rating:', e)
      // Tạo rating mặc định khi lỗi
      setRating({ averageRating: 0, totalReviews: 0, ratingHistogram: {} })
      setError(e?.response?.data?.message || '')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRating()
  }, [roomId])

  // Listen for review submission event to refresh
  useEffect(() => {
    const handleReviewSubmitted = (e) => {
      if (e.detail?.roomId === roomId) {
        loadRating()
      }
    }
    window.addEventListener('review-submitted', handleReviewSubmitted)
    return () => window.removeEventListener('review-submitted', handleReviewSubmitted)
  }, [roomId])

  if (loading) {
    return (
      <div className="text-center py-2">
        <Spinner size="sm" />
      </div>
    )
  }

  // Hiển thị ngay cả khi không có rating (totalReviews = 0)
  // Đảm bảo rating luôn có giá trị mặc định
  const ratingData = rating || { averageRating: 0, totalReviews: 0, ratingHistogram: {} }
  const total = ratingData.totalReviews || 0
  const avg = ratingData.averageRating || 0

  // Render stars
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    
    return (
      <div className="d-flex align-items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} style={{ color: '#FFB800', fontSize: '1.2rem' }}>★</span>
        ))}
        {hasHalfStar && (
          <span style={{ color: '#FFB800', fontSize: '1.2rem' }}>☆</span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} style={{ color: '#E0E0E0', fontSize: '1.2rem' }}>★</span>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 pb-3 border-bottom">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <Card.Title className="h4 mb-2" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 'bold' }}>
              Đánh giá của khách
            </Card.Title>
            {total > 0 && (
              <div className="d-flex align-items-center gap-2 mb-2">
                {renderStars(avg)}
                <span className="fw-bold" style={{ fontSize: '1.5rem', color: '#333' }}>
                  {avg.toFixed(1)}
                </span>
                <span className="text-muted" style={{ fontSize: '1rem' }}>
                  / 5.0
                </span>
              </div>
            )}
          </div>
          <Badge 
            bg="warning" 
            text="dark" 
            className="px-4 py-2" 
            style={{ 
              fontSize: '1.1rem',
              fontWeight: '600',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {total > 0 ? `${total} đánh giá` : 'Chưa có đánh giá'}
          </Badge>
        </div>
      </div>

      {ratingData?.ratingHistogram && total > 0 && (
        <div className="mb-4">
          <div className="mb-3">
            <strong style={{ fontSize: '0.95rem', color: '#495057' }}>Phân bố đánh giá:</strong>
          </div>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingData.ratingHistogram[star] || 0
            const percentage = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={star} className="d-flex align-items-center gap-3 mb-3">
                <span className="fw-semibold" style={{ width: '70px', fontSize: '0.95rem', color: '#495057' }}>
                  {star} sao
                </span>
                <div
                  className="flex-grow-1 bg-light rounded"
                  style={{ height: '12px', overflow: 'hidden', borderRadius: '6px' }}
                >
                  <motion.div
                    className="h-100"
                    style={{
                      background: 'linear-gradient(90deg, #FFB800 0%, #FFA000 100%)',
                      borderRadius: '6px'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
                <span className="fw-semibold" style={{ width: '60px', textAlign: 'right', fontSize: '0.95rem', color: '#666' }}>
                  {count} ({percentage.toFixed(0)}%)
                </span>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}


