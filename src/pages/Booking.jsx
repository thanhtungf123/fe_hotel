// src/pages/Booking.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap'
import axios from '../api/axiosInstance'
import PaymentButton from '../components/PaymentButton'

const todayStr = (d = new Date()) => d.toISOString().slice(0,10)
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return todayStr(d) }

export default function Booking(){
  const { id } = useParams()
  const nav = useNavigate()
  const nextUrl = `/booking/${id}`

  const auth = (() => { try { return JSON.parse(localStorage.getItem('auth') || '{}') } catch { return {} } })()

  useEffect(()=>{ if (!auth?.token) nav(`/login?next=${encodeURIComponent(nextUrl)}`, { replace: true }) }, [id])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [room, setRoom] = useState(null)

  const [form, setForm] = useState({ checkIn: addDays(1), checkOut: addDays(2), guests: 1, specialRequests: '' })
  const onChange = (e)=> setForm({ ...form, [e.target.name]: e.target.value })

  useEffect(()=>{
    let mounted = true
    setLoading(true); setError('')
    axios.get(`/rooms/${id}`)
      .then(res => { if (mounted) setRoom(res.data?.room || null) })
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

  // === NEW: KYC & lựa chọn thanh toán ===
  const [kyc, setKyc] = useState({
    fullName: "", dateOfBirth: "", gender: "male", phoneNumber: "",
    nationalIdNumber: "", idFrontUrl: "", idBackUrl: "",
    bankAccountName: "", bankAccountNumber: "", bankName: "", bankCode: "", bankBranch: ""
  })
  const [payChoice, setPayChoice] = useState("deposit") // deposit | full
  const [depositPercent] = useState(30) // cứng 30% theo nghiệp vụ

  const validate = () => {
    if (!form.checkIn || !form.checkOut) return 'Vui lòng chọn ngày nhận/trả phòng'
    if (new Date(form.checkOut) <= new Date(form.checkIn)) return 'Ngày trả phòng phải sau ngày nhận phòng'
    if (!form.guests || Number(form.guests) < 1) return 'Số khách không hợp lệ'
    if (capacity && Number(form.guests) > capacity) return `Số khách tối đa: ${capacity}`
    if (auth?.role && auth.role.toLowerCase() !== 'customer') return 'Chỉ tài khoản khách hàng mới được đặt phòng'
    if (!kyc.fullName) return 'Vui lòng nhập họ tên'
    if (!kyc.phoneNumber) return 'Vui lòng nhập số điện thoại';
    if (!kyc.nationalIdNumber) return 'Vui lòng nhập số CCCD';
    if (!kyc.dateOfBirth) return 'Vui lòng chọn ngày sinh';
    if (!kyc.idFrontUrl) return 'Vui lòng tải ảnh CCCD mặt trước';
    if (!kyc.idBackUrl)  return 'Vui lòng tải ảnh CCCD mặt sau';
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
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          depositPercent,
          paymentChoice: payChoice,
          // KYC phẳng theo BookingRequest (BE)
          fullName: kyc.fullName,
          dateOfBirth: kyc.dateOfBirth,
          gender: kyc.gender,
          phoneNumber: kyc.phoneNumber,
          nationalIdNumber: kyc.nationalIdNumber,
          idFrontUrl: kyc.idFrontUrl,
          idBackUrl: kyc.idBackUrl,
          bankAccountName: kyc.bankAccountName,
          bankAccountNumber: kyc.bankAccountNumber,
          bankName: kyc.bankName,
          bankCode: kyc.bankCode,
          bankBranch: kyc.bankBranch
              }
      const { data } = await axios.post('/bookings', payload)
      setSuccess(data) // { bookingId, status, totalVnd, depositVnd, paymentState }
    }catch(err){
      setError(err?.response?.data?.message || err.message)
    }finally{
      setSubmitting(false)
    }
  }

  return (
    <Container className="py-4" style={{maxWidth: '1100px'}}>
      <h2 className="fw-bold mb-3">Đặt phòng</h2>

      {!auth?.token && (<Alert variant="warning">Bạn cần đăng nhập để đặt phòng. Đang chuyển hướng…</Alert>)}
      {loading && <Alert variant="info">Đang tải thông tin phòng…</Alert>}
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      {success && (
        <Alert variant="success" className="mb-3">
          <div>
            ✅ Đặt phòng thành công!<br />
            Mã đơn: <strong>{success.bookingId}</strong><br />
            Tổng tiền: <strong>{(success.totalVnd ?? total).toLocaleString('vi-VN')}₫</strong><br/>
            {payChoice==="deposit" && <>Tiền cọc: <strong>{(success.depositVnd).toLocaleString('vi-VN')}₫</strong></>}
          </div>
          <div className="mt-3">
            <PaymentButton
              bookingId={success.bookingId}
              totalPrice={payChoice==="deposit" ? success.depositVnd : success.totalVnd}
              purpose={payChoice==="deposit" ? "deposit" : "full"}
              label={payChoice==="deposit" ? `Thanh toán tiền cọc (30%)` : "Thanh toán toàn bộ"}
            />
          </div>
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
                    <Form.Control type="date" min={todayStr()} name="checkIn" value={form.checkIn} onChange={onChange} required />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="small">Ngày trả phòng</Form.Label>
                    <Form.Control type="date" min={form.checkIn || todayStr()} name="checkOut" value={form.checkOut} onChange={onChange} required />
                  </Col>
                </Row>
                <Form.Group className="mt-3">
                  <Form.Label className="small">Số khách</Form.Label>
                  <Form.Control type="number" min={1} max={capacity || undefined} name="guests" value={form.guests} onChange={onChange} required />
                  {capacity ? <div className="small text-muted mt-1">Tối đa {capacity} khách</div> : null}
                </Form.Group>

                {/* KYC */}
                <hr className="my-3"/>
                <h6>Thông tin khách nhận phòng</h6>
                <Row className="g-2">
                  <Col md={6}>
                    <Form.Label>Họ và tên</Form.Label>
                    <Form.Control value={kyc.fullName}
                      onChange={e=>setKyc({...kyc, fullName:e.target.value})}
                      required/>
                  </Col>

                  <Col md={3}>
                    <Form.Label>Ngày sinh</Form.Label>
                    <Form.Control type="date" value={kyc.dateOfBirth}
                      onChange={e=>setKyc({...kyc, dateOfBirth:e.target.value})}
                      required/>
                  </Col>

                  <Col md={3}>
                    <Form.Label>Giới tính</Form.Label>
                    <Form.Select value={kyc.gender}
                      onChange={e=>setKyc({...kyc, gender:e.target.value})}
                      required>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </Form.Select>
                  </Col>

                  <Col md={6}>
                    <Form.Label>Số điện thoại</Form.Label>
                    <Form.Control value={kyc.phoneNumber}
                      onChange={e=>setKyc({...kyc, phoneNumber:e.target.value})}
                      required/>
                  </Col>

                  <Col md={6}>
                    <Form.Label>Số CCCD</Form.Label>
                    <Form.Control value={kyc.nationalIdNumber}
                      onChange={e=>setKyc({...kyc, nationalIdNumber:e.target.value})}
                      required/>
                  </Col>

                  {/* Ảnh CCCD upload từ máy */}
                  <Col md={6}>
                    <Form.Label>Ảnh CCCD mặt trước</Form.Label>
                    <Form.Control type="file" accept="image/*" required
                      onChange={async (e)=>{
                        const f = e.target.files?.[0];
                        if (!f) return;
                        try{
                          const { uploadFile } = await import('../api/upload');
                          const { url } = await uploadFile(f);
                          setKyc(k => ({ ...k, idFrontUrl: url }));
                        }catch(err){ alert('Upload ảnh mặt trước thất bại: ' + (err?.response?.data?.message || err.message)); }
                      }}/>
                    {kyc.idFrontUrl && <div className="mt-2"><img src={kyc.idFrontUrl} alt="CCCD trước" style={{height:80,borderRadius:6}}/></div>}
                  </Col>

                  <Col md={6}>
                    <Form.Label>Ảnh CCCD mặt sau</Form.Label>
                    <Form.Control type="file" accept="image/*" required
                      onChange={async (e)=>{
                        const f = e.target.files?.[0];
                        if (!f) return;
                        try{
                          const { uploadFile } = await import('../api/upload');
                          const { url } = await uploadFile(f);
                          setKyc(k => ({ ...k, idBackUrl: url }));
                        }catch(err){ alert('Upload ảnh mặt sau thất bại: ' + (err?.response?.data?.message || err.message)); }
                      }}/>
                    {kyc.idBackUrl && <div className="mt-2"><img src={kyc.idBackUrl} alt="CCCD sau" style={{height:80,borderRadius:6}}/></div>}
                  </Col>
                </Row>

                <hr className="my-3"/>
                <h6>Phương thức thanh toán</h6>
                <div className="d-flex align-items-center gap-3">
                  <Form.Check type="radio" name="payChoice" id="payDeposit" label="Đặt cọc 30%" checked={payChoice==="deposit"} onChange={()=>setPayChoice("deposit")} />
                  <Form.Check type="radio" name="payChoice" id="payFull" label="Thanh toán toàn bộ" checked={payChoice==="full"} onChange={()=>setPayChoice("full")} />
                </div>

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
                    <img src={room.imageUrl} alt={room.name} style={{width: 120, height: 80, objectFit: 'cover', borderRadius: 8}}/>
                    <div>
                      <div className="fw-semibold">{room.name}</div>
                      <div className="small text-muted">👥 {room.capacity ?? 0} khách &nbsp;|&nbsp; 🛏️ {room.type || '—'}</div>
                      <div className="small">{(room.amenities || []).slice(0,3).map((a,i)=>(<Badge key={i} bg="light" text="dark" className="me-1">{a}</Badge>))}</div>
                    </div>
                  </div>
                  <hr/>
                  <div className="d-flex justify-content-between"><div>Giá/đêm</div><div className="fw-semibold">{(room.priceVnd||0).toLocaleString('vi-VN')}₫</div></div>
                  <div className="d-flex justify-content-between"><div>Số đêm</div><div className="fw-semibold">{nights}</div></div>
                  <hr/>
                  <div className="d-flex justify-content-between"><div className="fw-bold">Tổng thanh toán</div><div className="fw-bold text-danger">{total.toLocaleString('vi-VN')}₫</div></div>
                  <div className="mt-3"><Link to={`/rooms/${id}`}>← Xem lại chi tiết phòng</Link></div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
