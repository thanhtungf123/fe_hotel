import React, { useEffect, useState } from 'react'
import { Card, Badge, Spinner, Alert } from 'react-bootstrap'
import { motion } from 'framer-motion'
import axios from '../../api/axiosInstance'

export default function RoomRating({ roomId }) {
  const [rating, setRating] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!roomId) return
    loadRating()
  }, [roomId])

  const loadRating = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.get(`/reviews/room/${roomId}/rating`)
      setRating(data)
    } catch (e) {
      setError(e?.response?.data?.message || '')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-2">
          <Spinner size="sm" />
        </Card.Body>
      </Card>
    )
  }

  if (error || !rating) {
    return null
  }

  const total = rating.totalReviews || 0
  const avg = rating.averageRating || 0

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Card.Title className="h4 mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>
          Đánh giá của khách
        </Card.Title>
        <Badge bg="warning" text="dark" className="px-3 py-2" style={{ fontSize: '1.1rem' }}>
          {avg.toFixed(1)} ({total} đánh giá)
        </Badge>
      </div>

      {rating.ratingHistogram && total > 0 && (
        <div className="mb-4">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = rating.ratingHistogram[star] || 0
            const percentage = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={star} className="d-flex align-items-center gap-3 mb-2">
                <span className="small fw-semibold" style={{ width: '60px' }}>
                  {star} sao
                </span>
                <div
                  className="flex-grow-1 bg-light rounded"
                  style={{ height: '10px', overflow: 'hidden' }}
                >
                  <motion.div
                    className="h-100"
                    style={{
                      background: 'linear-gradient(90deg, #FFB800 0%, #FFA000 100%)'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
                <span className="small text-muted" style={{ width: '50px', textAlign: 'right' }}>
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}


