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

          {/* ...các card mô tả/tiện nghi/đánh giá... */}
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
