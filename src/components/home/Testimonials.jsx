import React, { useEffect, useState } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import Spinner from 'react-bootstrap/Spinner'
import { motion } from 'framer-motion'
import axios from '../../api/axiosInstance'

function Stars({ rating }) { 
  return (
    <div className="text-warning mb-2" style={{ fontSize: '1.2rem' }}>
      {"★".repeat(rating || 5)}{"☆".repeat(5 - (rating || 5))}
    </div>
  ) 
}

export default function Testimonials(){
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get('/reviews/featured?limit=6')
      setReviews(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load featured reviews:', e)
      setError('Không thể tải đánh giá')
      // Fallback to empty array, component will show empty state
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })
  }

  if (loading) {
    return (
      <section className="py-5">
        <h2 className="fw-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Khách hàng nói gì về chúng tôi
        </h2>
        <div className="text-center py-5">
          <Spinner animation="border" variant="warning" />
          <p className="text-muted mt-3">Đang tải đánh giá...</p>
        </div>
      </section>
    )
  }

  if (error || reviews.length === 0) {
    return (
      <section className="py-5">
        <h2 className="fw-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Khách hàng nói gì về chúng tôi
        </h2>
        {error ? (
          <div className="text-center text-muted py-5">
            <p>{error}</p>
          </div>
        ) : (
          <div className="text-center text-muted py-5">
            <p>Chưa có đánh giá nào</p>
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="fw-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Khách hàng nói gì về chúng tôi
        </h2>
        <Row className="g-4">
          {reviews.map((review, idx) => (
            <Col md={6} lg={4} key={review.id || idx}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="h-100 rounded-2xl shadow-soft" style={{ border: 'none' }}>
                  <Card.Body>
                    <Stars rating={review.rating} />
                    <Card.Text className="fst-italic mb-3" style={{ lineHeight: '1.6', minHeight: '80px' }}>
                      "{review.comment || 'Đánh giá tuyệt vời!'}"
                    </Card.Text>
                    <div className="d-flex align-items-center gap-2 mt-3 pt-3 border-top">
                      {review.accountAvatar ? (
                        <img
                          src={review.accountAvatar}
                          alt={review.accountName || 'Khách hàng'}
                          className="rounded-circle"
                          style={{
                            width: 48,
                            height: 48,
                            objectFit: 'cover',
                            border: '2px solid #f0f0f0'
                          }}
                        />
                      ) : (
                        <div 
                          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{ width: 48, height: 48, fontSize: '1.2rem' }}
                        >
                          {(review.accountName || 'K')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{review.accountName || 'Khách hàng'}</div>
                        <div className="text-muted small">
                          {review.roomName && `${review.roomName} • `}
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                      <Badge bg="warning" text="dark" className="px-2">
                        {review.rating} sao
                      </Badge>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>
    </section>
  )
}
