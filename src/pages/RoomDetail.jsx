// Enhanced RoomDetail - Luxury Hotel Design
import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Container, Row, Col, Badge, Card, Button } from 'react-bootstrap'
import { motion, AnimatePresence } from 'framer-motion'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import axios from 'axios'
import showToast from '../utils/toast'
import { GridSkeleton } from '../components/common/LoadingSkeleton'
import RoomRating from '../components/review/RoomRating'
import ReviewList from '../components/review/ReviewList'
import ReviewFormForRoom from '../components/review/ReviewFormForRoom'
import '../styles/room-detail.css'

export default function RoomDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const API = (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [mainImageIndex, setMainImageIndex] = useState(0)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setLoading(true)
    setError(null)

    const url = `${API}/rooms/${id}`
    axios.get(url, { headers: { Accept: 'application/json' } })
      .then(r => {
        if (typeof r.data === 'string' && r.data.trim().startsWith('<!')) {
          throw new Error('Proxy returned HTML instead of JSON')
        }
        setData(r.data)
      })
      .catch(async (e) => {
        try {
          const direct = await axios.get(`http://localhost:8080/api/rooms/${id}`)
          setData(direct.data)
        } catch (err) {
          setError(err?.response?.data?.message || err.message || 'Không thể tải chi tiết phòng')
          showToast.error('Không thể tải chi tiết phòng')
        }
      })
      .finally(() => setLoading(false))
  }, [API, id])

  const room = data?.room
  const price = room?.priceVnd ?? 0
  const discount = room?.discount ?? 0
  const priceStr = useMemo(() => price.toLocaleString('vi-VN') + '₫', [price])

  const goBooking = () => {
    let auth = null
    try { auth = JSON.parse(localStorage.getItem('auth') || '{}') } catch { auth = null }
    if (!auth?.token) {
      showToast.info('Vui lòng đăng nhập để đặt phòng')
      nav(`/login?next=${encodeURIComponent(`/booking/${id}`)}`)
      return
    }
    nav(`/booking/${id}`)
  }

  if (loading) {
    return (
      <Container className="detail-wrap py-5">
        <GridSkeleton cols={1} rows={1} />
        <div className="mt-4">
          <GridSkeleton cols={2} rows={2} />
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="detail-wrap py-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-danger text-center"
        >
          <h4>Đã xảy ra lỗi</h4>
          <p>{error}</p>
          <Button variant="primary" as={Link} to="/search">
            ← Quay lại tìm kiếm
          </Button>
        </motion.div>
      </Container>
    )
  }

  if (!room) {
    return (
      <Container className="detail-wrap py-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-warning text-center"
        >
          <h4>Không tìm thấy phòng</h4>
          <Button variant="primary" as={Link} to="/search">
            ← Quay lại tìm kiếm
          </Button>
        </motion.div>
      </Container>
    )
  }

  const bedText = room.type || '—'
  const gallery = data?.gallery && data.gallery.length ? data.gallery : [room.imageUrl]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="detail-wrap py-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 
            className="fw-bold mb-2" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {room.name}
          </h1>
          <div className="d-flex align-items-center gap-3 text-muted mb-4 flex-wrap">
            <Badge 
              bg="warning" 
              text="dark" 
              className="px-3 py-2"
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <strong>{room.rating ?? 4.7}</strong> điểm ({room.reviews ?? 0} đánh giá)
            </Badge>
            <div>{room.capacity ?? 0} khách</div>
            <div>{bedText}</div>
            <div>{room.sizeSqm ?? 0}m²</div>
            {data?.floorRange && <div>{data.floorRange}</div>}
          </div>
        </motion.div>

        <Row className="g-4">
          <Col lg={8}>
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="main-photo-wrapper position-relative overflow-hidden rounded-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mainImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LazyLoadImage
                      src={gallery[mainImageIndex]}
                      alt={room.name}
                      effect="blur"
                      className="main-photo"
                      wrapperClassName="main-photo-container"
                    />
                  </motion.div>
                </AnimatePresence>
                <Badge
                  bg="dark"
                  className="photo-count"
                  style={{ opacity: 0.9 }}
                >
                  {mainImageIndex + 1} / {gallery.length}
                </Badge>
              </div>

              {/* Thumbnails */}
              <motion.div
                className="thumbs mt-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {gallery.map((src, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMainImageIndex(i)}
                    style={{ cursor: 'pointer' }}
                  >
                    <LazyLoadImage
                      src={src}
                      alt={`thumb-${i}`}
                      effect="blur"
                      className={`thumb-image ${i === mainImageIndex ? 'active' : ''}`}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="card-soft mt-4">
                <Card.Body>
                  <Card.Title 
                    className="h4 mb-3"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    Mô tả phòng
                  </Card.Title>
                  <p className="text-muted" style={{ lineHeight: '1.8' }}>
                    {data?.description || 'Phòng nghỉ hiện đại, trang bị đầy đủ tiện nghi cao cấp với thiết kế sang trọng và thoải mái.'}
                  </p>
                </Card.Body>
              </Card>
            </motion.div>

            {/* Highlights */}
            {data?.highlights && data.highlights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="card-soft mt-4">
                  <Card.Body>
                    <Card.Title 
                      className="h4 mb-3"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      Điểm nổi bật
                    </Card.Title>
                    <Row>
                      {data.highlights.map((h, i) => (
                        <Col md={6} key={i} className="mb-3">
                          <motion.div
                            className="d-flex align-items-start gap-3"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span style={{ lineHeight: '1.8' }}>{h}</span>
                          </motion.div>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              </motion.div>
            )}

            {/* Amenities */}
            {data?.amenities && Object.keys(data.amenities).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="card-soft mt-4">
                  <Card.Body>
                    <Card.Title 
                      className="h4 mb-4"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      Tiện nghi phòng
                    </Card.Title>
                    {Object.entries(data.amenities).map(([category, items]) => (
                      <div key={category} className="mb-4">
                        <div className="fw-semibold mb-3 text-primary">
                          {category}
                        </div>
                        <Row>
                          {items.map((item, i) => (
                            <Col md={6} key={i} className="mb-2">
                              <motion.div
                                className="d-flex align-items-start gap-2"
                                whileHover={{ x: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                <span style={{ color: 'var(--primary-gold)' }}>•</span>
                                <span className="small">{item}</span>
                              </motion.div>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </motion.div>
            )}

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="card-soft mt-4">
                <Card.Body>
                  <RoomRating roomId={parseInt(id)} />
                  <ReviewFormForRoom 
                    roomId={parseInt(id)} 
                    onSuccess={() => {
                      // Dispatch event to refresh reviews and rating
                      window.dispatchEvent(new CustomEvent('review-submitted', { 
                        detail: { roomId: parseInt(id) } 
                      }))
                    }}
                  />
                  <ReviewList roomId={parseInt(id)} />
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          {/* Booking Sidebar */}
          <Col lg={4}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="card-soft booking-card sticky-booking">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    {/* Rating với icon sao */}
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: '1.3rem', color: '#FFB800' }}>★</span>
                      <div>
                        <div className="fw-bold" style={{ fontSize: '1.1rem', color: '#333' }}>
                          {room.rating ?? 4.7}
                        </div>
                        <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                          {room.reviews ?? 0} đánh giá
                        </div>
                      </div>
                    </div>
                    
                    {/* Discount màu đỏ */}
                    {discount > 0 && (
                      <div className="d-flex align-items-center gap-2">
                        <Badge bg="danger" className="px-2 py-1" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                          -{discount}%
                        </Badge>
                        <span className="text-decoration-line-through text-muted small">
                          {Math.round(price * (1 + discount / 100)).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className="mb-1"
                    style={{ 
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: 'var(--primary-gold)',
                      fontFamily: 'Playfair Display, serif'
                    }}
                  >
                    {priceStr}
                  </div>
                  <div className="text-muted mb-4">/ đêm</div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      className="w-100 py-3 fw-semibold"
                      size="lg"
                      onClick={goBooking}
                      style={{
                        background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        boxShadow: '0 8px 20px rgba(201, 162, 74, 0.4)'
                      }}
                    >
                      Đặt phòng ngay
                    </Button>
                  </motion.div>

                  <ul className="mt-4 list-unstyled">
                    {[
                      'Miễn phí hủy trong 24 giờ',
                      'Thanh toán khi nhận phòng',
                      'Xác nhận đặt phòng ngay lập tức'
                    ].map((text, i) => (
                      <motion.li
                        key={i}
                        className="mb-2 d-flex align-items-start gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <span className="small text-muted">{text}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-3 border-top">
                    <div className="small text-muted text-center">
                      <strong>Mẹo:</strong> Đặt sớm để được giá tốt nhất!
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </motion.div>
  )
}
