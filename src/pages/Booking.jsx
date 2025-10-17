// src/pages/Booking.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap'
import axios from '../api/axiosInstance'

const todayStr = (d = new Date()) => d.toISOString().slice(0,10)
const addDays = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return todayStr(d)
}

export default function Booking(){
  const { id } = useParams()
  const nav = useNavigate()
  const loc = useLocation()
  const nextUrl = `/booking/${id}`

  // lấy auth từ localStorage
  const auth = (() => {
    try { return JSON.parse(localStorage.getItem('auth') || '{}') } catch { return {} }
  })()

  // nếu chưa đăng nhập -> chuyển sang login kèm next
  useEffect(()=>{
    if (!auth?.token) {
      nav(`/login?next=${encodeURIComponent(nextUrl)}`, { replace: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [room, setRoom] = useState(null)

  const [form, setForm] = useState({
    checkIn: addDays(1),
    checkOut: addDays(2),
    guests: 2,
    specialRequests: ''
  })
  const onChange = (e)=> setForm({ ...form, [e.target.name]: e.target.value })

  // tải thông tin phòng để hiển thị tóm tắt
  useEffect(()=>{
    let mounted = true
    const API = (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, '')
    setLoading(true); setError('')
    axios.get(`${API}/rooms/${id}`, { headers: { Accept: 'application/json' } })
      .then(res => {
        if (mounted) setRoom(res.data?.room || null)
      })
      .catch(err => setError(err?.response?.data?.message || err.message))
      .finally(()=> mounted && setLoading(false))
    return ()=> { mounted=false }
  }, [id])

  const capacity = room?.capacity ?? 0
  const price = room?.priceVnd ?? 0
  const nights = useMemo(()=>{
    try{
      const inD  = new Date(form.checkIn)
      const outD = new Date(form.checkOut)
      const diff = Math.round((outD - inD) / (1000*60*60*24))
      return Math.max(0, diff)
    }catch{ return 0 }
  }, [form.checkIn, form.checkOut])

  const total = useMemo(()=> price * Math.max(1, nights), [price, nights])

  const validate = () => {
    if (!form.checkIn || !form.checkOut) return 'Vui lòng chọn ngày nhận/trả phòng'
    if (new Date(form.checkOut) <= new Date(form.checkIn)) return 'Ngày trả phòng phải sau ngày nhận phòng'
    if (!form.guests || Number(form.guests) < 1) return 'Số khách không hợp lệ'
    if (capacity && Number(form.guests) > capacity) return `Số khách tối đa: ${capacity}`
    if (auth?.role && auth.role.toLowerCase() !== 'customer') return 'Chỉ tài khoản khách hàng (customer) mới được đặt phòng'
    return ''
  }

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    const msg = validate()
    if (msg) { setError(msg); return }

    setSubmitting(true); setError(''); setSuccess(null)
    try{
      const payload = {
        roomId: Number(id),
        guests: Number(form.guests),
        // Gửi đủ alias để BE map được
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        checkIn: form.checkIn,
        checkOut: form.checkOut
        }
      // BE: POST /api/bookings -> BookingResponse
      const { data } = await axios.post('/bookings', payload)
      setSuccess(data) // {bookingId, totalPrice,...} (tuỳ BE)
      // chuyển về chi tiết phòng hoặc trang chủ sau vài giây nếu muốn
      // nav(`/rooms/${id}?booked=1`, { replace: true })
    }catch(err){
      setError(err?.response?.data?.message || err.message)
    }finally{
      setSubmitting(false)
    }
  }

  return (
    <Container className="py-4" style={{maxWidth: '1100px'}}>
      <h2 className="fw-bold mb-3">Đặt phòng</h2>

      {!auth?.token && (
        <Alert variant="warning">
          Bạn cần đăng nhập để đặt phòng. Đang chuyển hướng…
        </Alert>
      )}

      {loading && <Alert variant="info">Đang tải thông tin phòng…</Alert>}
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {success && (
        <Alert variant="success" className="mb-3">
          Đặt phòng thành công! Mã đơn: <strong>{success.bookingId ?? '—'}</strong> — Tổng tiền:{" "}
          <strong>{(success.totalPrice ?? total).toLocaleString('vi-VN')}₫</strong>
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={7}>
          <Card className="card-soft">
            <Card.Body>
              <Card.Title>Thông tin đặt phòng</Card.Title>
              <Form onSubmit={submit}>
                <Row className="g-3 mt-1">
                  <Col md={6}>
                    <Form.Label className="small">Ngày nhận phòng</Form.Label>
                    <Form.Control
                      type="date"
                      min={todayStr()}
                      name="checkInDate"
                      value={form.checkInDate}
                      onChange={onChange}
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="small">Ngày trả phòng</Form.Label>
                    <Form.Control
                      type="date"
                      min={form.checkInDate || todayStr()}
                      name="checkOutDate"
                      value={form.checkOutDate}
                      onChange={onChange}
                      required
                    />
                  </Col>
                </Row>

                <Form.Group className="mt-3">
                  <Form.Label className="small">Số khách</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    max={capacity || undefined}
                    name="guests"
                    value={form.guests}
                    onChange={onChange}
                    required
                  />
                  {capacity ? <div className="small text-muted mt-1">Tối đa {capacity} khách</div> : null}
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label className="small">Yêu cầu đặc biệt (tuỳ chọn)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="specialRequests"
                    value={form.specialRequests}
                    onChange={onChange}
                    placeholder="VD: Tầng cao, phòng không hút thuốc…"
                  />
                </Form.Group>

                <Button type="submit" className="w-100 mt-3" variant="danger" disabled={submitting || !auth?.token}>
                  {submitting ? 'Đang xử lý…' : 'Xác nhận đặt phòng'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="card-soft">
            <Card.Body>
              <Card.Title>Phòng đã chọn</Card.Title>
              {!room ? (
                <div className="text-muted">Không tìm thấy phòng.</div>
              ) : (
                <>
                  <div className="d-flex gap-3 mt-2">
                    <img
                      src={room.imageUrl}
                      alt={room.name}
                      style={{width: 120, height: 80, objectFit: 'cover', borderRadius: 8}}
                    />
                    <div>
                      <div className="fw-semibold">{room.name}</div>
                      <div className="small text-muted">
                        👥 {room.capacity ?? 0} khách &nbsp;|&nbsp; 🛏️ {room.type || '—'}
                      </div>
                      <div className="small">
                        {(room.amenities || []).slice(0,3).map((a,i)=>(
                          <Badge key={i} bg="light" text="dark" className="me-1">{a}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <hr/>
                  <div className="d-flex justify-content-between">
                    <div>Giá/đêm</div>
                    <div className="fw-semibold">{(room.priceVnd||0).toLocaleString('vi-VN')}₫</div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div>Số đêm</div>
                    <div className="fw-semibold">{nights}</div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div>Thuế & phí</div>
                    <div className="fw-semibold">đã gồm</div>
                  </div>
                  <hr/>
                  <div className="d-flex justify-content-between">
                    <div className="fw-bold">Tổng thanh toán</div>
                    <div className="fw-bold text-danger">{total.toLocaleString('vi-VN')}₫</div>
                  </div>

                  <div className="mt-3">
                    <Link to={`/rooms/${id}`}>← Xem lại chi tiết phòng</Link>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
