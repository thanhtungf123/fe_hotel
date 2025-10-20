import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'   // +++
import axios from 'axios'
import { Container, Row, Col, Badge, Card, Form, Button } from 'react-bootstrap'
import '../styles/room-detail.css'

export default function RoomDetail() {
  const { id } = useParams()
  const nav = useNavigate() // +++
  const API = (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)

    const url = `${API}/rooms/${id}`
    axios.get(url, { headers: { Accept: 'application/json' } })
      .then(r => {
        if (typeof r.data === 'string' && r.data.trim().startsWith('<!')) {
          throw new Error('Proxy returned HTML instead of JSON')
        }
        setData(r.data)
      })
      .catch(async () => {
        const direct = await axios.get(`http://localhost:8080/api/rooms/${id}`)
        setData(direct.data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [API, id])

  const room = data?.room
  const price = room?.priceVnd ?? 0
  const discount = room?.discount ?? 0
  const priceStr = useMemo(() => price.toLocaleString('vi-VN') + '₫', [price])

  if (loading) return <Container className="py-5"><div className="alert alert-info">Đang tải chi tiết phòng…</div></Container>
  if (error)   return <Container className="py-5"><div className="alert alert-danger">Lỗi: {error}</div></Container>
  if (!room)   return <Container className="py-5"><div className="alert alert-warning">Không tìm thấy phòng.</div></Container>

  const bedText = room.type || '—'
  const gallery = data?.gallery && data.gallery.length ? data.gallery : [room.imageUrl]
  const [main, ...thumbs] = gallery

  const goBooking = () => {
    // kiểm tra login nhanh từ localStorage
    let auth = null
    try { auth = JSON.parse(localStorage.getItem('auth') || '{}') } catch { auth = null }
    if (!auth?.token) {
      nav(`/login?next=${encodeURIComponent(`/booking/${id}`)}`)
      return
    }
    nav(`/booking/${id}`)
  }

  return (
    <Container className="detail-wrap py-4">
      <h2 className="fw-bold mb-2">{room.name}</h2>
      <div className="d-flex align-items-center gap-3 text-muted mb-3">
        <div>⭐ {room.rating ?? 4.7} <span className="small">({room.reviews ?? 0} đánh giá)</span></div>
        <div>👥 {room.capacity ?? 0} khách</div>
        <div>🛏️ {bedText}</div>
        <div>📐 {room.sizeSqm ?? 0}m²</div>
        {data?.floorRange && <div>📍 {data.floorRange}</div>}
      </div>

      {/* ...phần ảnh & mô tả giữ nguyên... */}

      <Row className="g-4">
        <Col lg={8}>
          {/* main photo + thumbs + description... */}
          <div className="main-photo position-relative">
            <img src={main} alt={room.name} />
            <span className="photo-count">{gallery.indexOf(main)+1} / {gallery.length}</span>
          </div>
          <div className="thumbs mt-2">
            {[main, ...thumbs].map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`thumb-${i}`}
                onClick={()=>{
                  const g = [...gallery]
                  const first = g[0]; g[0] = g[i]; g[i] = first
                  setData({ ...data, gallery: g })
                }}
              />
            ))}
          </div>

          {/* Mô tả phòng */}
          <Card className="card-soft mt-3">
            <Card.Body>
              <Card.Title className="h5">Mô tả</Card.Title>
              <p className="text-muted">{data?.description || 'Phòng nghỉ hiện đại, trang bị đầy đủ tiện nghi cao cấp.'}</p>
            </Card.Body>
          </Card>

          {/* Điểm nổi bật */}
          {data?.highlights && data.highlights.length > 0 && (
            <Card className="card-soft mt-3">
              <Card.Body>
                <Card.Title className="h5">Điểm nổi bật</Card.Title>
                <Row>
                  {data.highlights.map((h, i) => (
                    <Col md={6} key={i} className="mb-2">
                      <div className="d-flex align-items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>{h}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Tiện nghi */}
          {data?.amenities && Object.keys(data.amenities).length > 0 && (
            <Card className="card-soft mt-3">
              <Card.Body>
                <Card.Title className="h5">Tiện nghi phòng</Card.Title>
                {Object.entries(data.amenities).map(([category, items]) => (
                  <div key={category} className="mb-3">
                    <div className="fw-semibold mb-2">{category}</div>
                    <Row>
                      {items.map((item, i) => (
                        <Col md={6} key={i} className="mb-2">
                          <div className="d-flex align-items-start gap-2">
                            <span className="text-muted">•</span>
                            <span className="small">{item}</span>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}

          {/* Đánh giá */}
          <Card className="card-soft mt-3">
            <Card.Body>
              <Card.Title className="h5 d-flex justify-content-between align-items-center">
                <span>Đánh giá của khách</span>
                <Badge bg="warning" text="dark" className="fs-6">
                  ⭐ {room.rating ?? 4.7}
                </Badge>
              </Card.Title>
              
              {/* Rating histogram */}
              {data?.ratingHistogram && (
                <div className="mb-3">
                  {Object.entries(data.ratingHistogram).sort((a,b) => b[0]-a[0]).map(([star, count]) => (
                    <div key={star} className="d-flex align-items-center gap-2 mb-2">
                      <span className="small" style={{width: '50px'}}>{star} sao</span>
                      <div className="flex-grow-1 bg-light rounded" style={{height: '8px', overflow: 'hidden'}}>
                        <div 
                          className="bg-warning h-100" 
                          style={{width: `${(count / (room.reviews || 1)) * 100}%`}}
                        />
                      </div>
                      <span className="small text-muted" style={{width: '40px', textAlign: 'right'}}>{count}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sample reviews */}
              <div className="mt-3">
                {data?.reviews && data.reviews.length > 0 ? (
                  data.reviews.map((review, i) => (
                    <div key={i} className="mb-3 pb-3 border-bottom">
                      <div className="d-flex align-items-start gap-3">
                        {review.avatarUrl && (
                          <img 
                            src={review.avatarUrl} 
                            alt={review.userName} 
                            className="rounded-circle"
                            style={{width: '48px', height: '48px', objectFit: 'cover'}}
                          />
                        )}
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <div className="fw-semibold">{review.userName}</div>
                            <Badge bg="warning" text="dark">⭐ {review.rating}</Badge>
                          </div>
                          <p className="small mb-1">{review.comment}</p>
                          <div className="small text-muted">{review.date}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted py-3">
                    <p className="mb-2">Chưa có đánh giá nào</p>
                    <p className="small">Hãy là người đầu tiên đánh giá phòng này!</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Booking box */}
        <Col lg={4}>
          <Card className="card-soft sticky">
            <Card.Body>
              {discount>0 && (
                <div className="text-decoration-line-through text-muted small">
                  {(Math.round(price*1.2)).toLocaleString('vi-VN')}₫
                </div>
              )}
              <div className="h3 mb-1 text-danger">{priceStr}</div>
              <div className="small text-muted mb-3">/ đêm</div>

              {/* nút điều hướng booking */}
              <Button className="w-100 mt-1" variant="danger" onClick={goBooking}>
                Đặt phòng ngay
              </Button>
              <ul className="mt-3 small text-muted list-unstyled">
                <li>✔ Miễn phí hủy trong 24 giờ</li>
                <li>✔ Thanh toán khi nhận phòng</li>
                <li>✔ Xác nhận đặt phòng ngay lập tức</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
