// Enhanced Booking Page - Luxury Hotel Design (merged)
import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert, Badge, ProgressBar, Modal } from 'react-bootstrap'
import { motion, AnimatePresence } from 'framer-motion'
import axios from '../api/axiosInstance'
import PaymentButton from '../components/PaymentButton'
import showToast from '../utils/toast'

const todayStr = (d = new Date()) => d.toISOString().slice(0, 10)
const addDays = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return todayStr(d)
}

export default function Booking() {
  const { id } = useParams()
  const nav = useNavigate()
  const nextUrl = `/booking/${id}`

  const auth = (() => {
    try { return JSON.parse(localStorage.getItem('auth') || '{}') } catch { return {} }
  })()

  useEffect(() => {
    if (!auth?.token) {
      showToast.info('Vui lòng đăng nhập để đặt phòng')
      nav(`/login?next=${encodeURIComponent(nextUrl)}`, { replace: true })
    }
  }, [id]) // giữ như code gốc để tránh re-direct loop

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [room, setRoom] = useState(null)
  const [services, setServices] = useState([])
  const [selectedServiceIds, setSelectedServiceIds] = useState([])
  const [loadingServices, setLoadingServices] = useState(false)

  const [form, setForm] = useState({
    checkIn: addDays(1),
    checkOut: addDays(2),
    adults: 1,
    children: 0,
    specialRequests: ''
  })
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Load room detail
  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    axios
      .get(`/rooms/${id}`)
      .then((res) => {
        if (mounted) setRoom(res.data?.room || null)
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err.message
        setError(msg)
        showToast.error('Không thể tải thông tin phòng: ' + msg)
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [id])

  // Load services
  useEffect(() => {
    let mounted = true
    setLoadingServices(true)
    axios
      .get('/services')
      .then((res) => {
        if (mounted) setServices(Array.isArray(res.data) ? res.data : [])
      })
      .catch((err) => {
        console.error('Failed to load services:', err)
        if (mounted) setServices([])
      })
      .finally(() => mounted && setLoadingServices(false))
    return () => { mounted = false }
  }, [])

  const capacity = room?.capacity ?? 0
  const price = room?.priceVnd ?? 0

  const nights = useMemo(() => {
    try {
      const inD = new Date(form.checkIn)
      const outD = new Date(form.checkOut)
      const diff = Math.round((outD - inD) / (1000 * 60 * 60 * 24))
      return Math.max(0, diff)
    } catch { return 0 }
  }, [form.checkIn, form.checkOut])

  // Calculate services total
  const servicesTotal = useMemo(() => {
    return selectedServiceIds.reduce((sum, serviceId) => {
      const service = services.find(s => s.id === serviceId)
      return sum + (service ? (service.price || 0) : 0)
    }, 0)
  }, [selectedServiceIds, services])

  // Total = room price + services price
  const total = useMemo(() => {
    const roomTotal = price * Math.max(1, nights)
    return roomTotal + servicesTotal
  }, [price, nights, servicesTotal])

  // Toggle service selection
  const toggleService = (serviceId) => {
    setSelectedServiceIds(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId)
      } else {
        return [...prev, serviceId]
      }
    })
  }

  // KYC & Payment
  const [kyc, setKyc] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'male',
    phoneNumber: '',
    nationalIdNumber: '',
    idFrontUrl: '',
    idBackUrl: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankName: '',
    bankCode: '',
    bankBranch: ''
  })
  const [payChoice, setPayChoice] = useState('deposit')
  const [depositPercent] = useState(30)
  const [uploadingFront, setUploadingFront] = useState(false)
  const [uploadingBack, setUploadingBack] = useState(false)

  const validate = () => {
    if (!form.checkIn || !form.checkOut) return 'Vui lòng chọn ngày nhận/trả phòng'
    if (new Date(form.checkOut) <= new Date(form.checkIn)) return 'Ngày trả phòng phải sau ngày nhận phòng'
    const adults = Number(form.adults) || 0
    const children = Number(form.children) || 0
    if (adults < 1) return 'Số người lớn phải ≥ 1'
    if (children < 0) return 'Số trẻ em phải ≥ 0'
    // Tính sức chứa: 2 trẻ em = 1 người lớn
    const equivalentAdults = adults + Math.ceil(children / 2)
    if (capacity && equivalentAdults > capacity) return `Số khách quy đổi (${equivalentAdults} người lớn) vượt quá sức chứa phòng (${capacity})`
    if (auth?.role && auth.role.toLowerCase() !== 'customer') return 'Chỉ tài khoản khách hàng mới được đặt phòng'
    if (!kyc.fullName) return 'Vui lòng nhập họ tên'
    if (!kyc.phoneNumber) return 'Vui lòng nhập số điện thoại'
    if (!kyc.nationalIdNumber) return 'Vui lòng nhập số CCCD'
    if (!kyc.dateOfBirth) return 'Vui lòng chọn ngày sinh'
    if (!kyc.idFrontUrl) return 'Vui lòng tải ảnh CCCD mặt trước'
    if (!kyc.idBackUrl) return 'Vui lòng tải ảnh CCCD mặt sau'
    return ''
  }

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  // Progress (huy-roomv2)
  const progress = useMemo(() => {
    let filled = 0
    if (form.checkIn && form.checkOut) filled += 20
    if (Number(form.adults) >= 1) filled += 10
    if (kyc.fullName) filled += 15
    if (kyc.phoneNumber) filled += 10
    if (kyc.nationalIdNumber) filled += 10
    if (kyc.dateOfBirth) filled += 10
    if (kyc.idFrontUrl) filled += 12.5
    if (kyc.idBackUrl) filled += 12.5
    return filled
  }, [form, kyc])

  // Xung đột lịch (dev)
  const [conflict, setConflict] = useState(null) // { message, availableFrom, blocked: [{start,end}] }
  const [showConflict, setShowConflict] = useState(false)

  useEffect(() => {
    if (!id || !form.checkIn || !form.checkOut) return
    let ignore = false
    ;(async () => {
      try {
        const { data } = await axios.get(`/rooms/${id}/availability`, {
          params: { start: form.checkIn, end: form.checkOut }
        })
        if (ignore) return
        if (data && data.available === false) {
          setConflict(data)
          setShowConflict(true)
        } else {
          setConflict(null)
          setShowConflict(false)
        }
      } catch {
        // ignore preview errors
      }
    })()
    return () => { ignore = true }
  }, [id, form.checkIn, form.checkOut])

  // checkOut tối thiểu (ưu tiên availableFrom nếu có)
  const checkOutMin = useMemo(() => {
    const base = form.checkIn || todayStr()
    if (conflict?.availableFrom) {
      try {
        const start = new Date(form.checkIn)
        const avail = new Date(conflict.availableFrom)
        if (start < avail) return conflict.availableFrom
      } catch {}
    }
    return base
  }, [form.checkIn, conflict?.availableFrom])

  const submit = async (e) => {
    e.preventDefault()
    const msg = validate()
    if (msg) {
      setError(msg)
      showToast.error(msg)
      return
    }
    setSubmitting(true)
    setError('')
    setSuccess(null)
    try {
      const payload = {
        roomId: Number(id),
        adults: Number(form.adults),
        children: Number(form.children) || 0,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        depositPercent,
        paymentChoice: payChoice,
        serviceIds: selectedServiceIds.length > 0 ? selectedServiceIds : null, // Services
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
      showToast.success('Đặt phòng thành công! Vui lòng thanh toán để xác nhận.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      if (err?.response?.status === 409) {
        // OverlapException từ BE
        setConflict(err.response.data)
        setShowConflict(true)
      } else {
        const m = err?.response?.data?.message || err.message
        setError(m)
        showToast.error('Đặt phòng thất bại: ' + m)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Container className="py-4" style={{ maxWidth: '1200px' }}>
        <motion.h2
          className="fw-bold mb-4"
          style={{ fontFamily: 'Playfair Display, serif' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🏨 Đặt phòng
        </motion.h2>

        {/* Progress Bar (ẩn khi đã success) */}
        {!success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted fw-semibold">Tiến độ hoàn thành</small>
              <small className="text-muted fw-semibold">{Math.round(progress)}%</small>
            </div>
            <ProgressBar
              now={progress}
              variant={progress < 50 ? 'warning' : progress < 100 ? 'info' : 'success'}
              style={{ height: '8px', borderRadius: '10px' }}
            />
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!auth?.token && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Alert variant="warning">Bạn cần đăng nhập để đặt phòng. Đang chuyển hướng…</Alert>
            </motion.div>
          )}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Alert variant="info">
                <div className="d-flex align-items-center gap-3">
                  <div className="spinner-luxury" style={{ width: '30px', height: '30px' }} />
                  <span>Đang tải thông tin phòng…</span>
                </div>
              </Alert>
            </motion.div>
          )}

          {error && !success && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Alert variant="danger" className="mb-3">⚠️ {error}</Alert>
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Alert variant="success" className="mb-4 p-4">
                <div className="d-flex align-items-start gap-3">
                  <div style={{ fontSize: '3rem' }}>🎉</div>
                  <div className="flex-grow-1">
                    <h5 className="mb-3">Đặt phòng thành công!</h5>
                    <div className="mb-2"><strong>Mã đơn:</strong> #{success.bookingId}</div>
                    <div className="mb-2">
                      <strong>Tổng tiền:</strong>{' '}
                      <span style={{ color: 'var(--primary-gold)', fontSize: '1.2rem' }}>
                        {(success.totalVnd ?? total).toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                    {payChoice === 'deposit' && (
                      <div className="mb-3">
                        <strong>Tiền cọc (30%):</strong>{' '}
                        <span style={{ color: 'var(--primary-gold)', fontSize: '1.1rem' }}>
                          {(success.depositVnd ?? Math.round((success.totalVnd ?? total) * 0.3)).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    )}
                    <div className="mt-4">
                      <PaymentButton
                        bookingId={success.bookingId}
                        totalPrice={payChoice === 'deposit' ? (success.depositVnd ?? Math.round((success.totalVnd ?? total) * 0.3)) : (success.totalVnd ?? total)}
                        purpose={payChoice === 'deposit' ? 'deposit' : 'full'}
                        label={payChoice === 'deposit' ? '💳 Thanh toán tiền cọc (30%)' : '💳 Thanh toán toàn bộ'}
                      />
                    </div>
                  </div>
                </div>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Row className="g-4">
          <Col lg={7}>
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="card-soft">
                <Card.Body>
                  <Card.Title className="h4 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    📝 Thông tin đặt phòng
                  </Card.Title>

                  <Form onSubmit={submit}>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Label className="fw-semibold">Ngày nhận phòng</Form.Label>
                        <Form.Control
                          type="date"
                          min={todayStr()}
                          name="checkIn"
                          value={form.checkIn}
                          onChange={onChange}
                          required
                          style={{ borderRadius: '10px' }}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="fw-semibold">Ngày trả phòng</Form.Label>
                        <Form.Control
                          type="date"
                          min={checkOutMin}
                          name="checkOut"
                          value={form.checkOut}
                          onChange={onChange}
                          required
                          style={{ borderRadius: '10px' }}
                        />
                        {conflict?.availableFrom && (
                          <div className="small text-warning mt-1">
                            * Phòng sẽ trống từ {new Date(conflict.availableFrom).toLocaleDateString()}.
                          </div>
                        )}
                      </Col>
                    </Row>

                    <Form.Group className="mt-3">
                      <Form.Label className="fw-semibold">Số khách</Form.Label>
                      <Row className="g-2">
                        <Col md={6}>
                          <Form.Label className="small text-muted">Người lớn</Form.Label>
                          <Form.Select
                            name="adults"
                            value={form.adults}
                            onChange={onChange}
                            required
                            style={{ borderRadius: '10px' }}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? 'người lớn' : 'người lớn'}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small text-muted">Trẻ em</Form.Label>
                          <Form.Select
                            name="children"
                            value={form.children}
                            onChange={onChange}
                            required
                            style={{ borderRadius: '10px' }}
                          >
                            {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                              <option key={num} value={num}>
                                {num} {num === 0 ? 'trẻ em' : num === 1 ? 'trẻ em' : 'trẻ em'}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                      </Row>
                      {capacity && (
                        <div className="small text-muted mt-2">
                          Sức chứa tối đa: {capacity} khách (2 trẻ em = 1 người lớn)
                        </div>
                      )}
                    </Form.Group>

                    <hr className="my-4" />
                    <h5 className="mb-3">✨ Dịch vụ bổ sung</h5>
                    {loadingServices ? (
                      <div className="text-center py-3">
                        <div className="spinner-luxury mx-auto" style={{ width: '30px', height: '30px' }} />
                        <div className="small text-muted mt-2">Đang tải dịch vụ...</div>
                      </div>
                    ) : services.length > 0 ? (
                      <div className="d-flex flex-column gap-2">
                        {services.map((service) => (
                          <motion.div
                            key={service.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card
                              className={`cursor-pointer ${selectedServiceIds.includes(service.id) ? 'border-primary' : ''}`}
                              onClick={() => toggleService(service.id)}
                              style={{
                                cursor: 'pointer',
                                borderWidth: '2px',
                                borderColor: selectedServiceIds.includes(service.id) ? 'var(--primary-gold)' : 'rgba(0,0,0,0.1)'
                              }}
                            >
                              <Card.Body className="d-flex align-items-center gap-3 py-2">
                                <Form.Check
                                  type="checkbox"
                                  checked={selectedServiceIds.includes(service.id)}
                                  onChange={() => toggleService(service.id)}
                                  style={{ transform: 'scale(1.3)' }}
                                />
                                <div className="flex-grow-1">
                                  <div className="fw-semibold">{service.nameService || service.name || 'Dịch vụ'}</div>
                                  {service.description && (
                                    <div className="small text-muted">{service.description}</div>
                                  )}
                                </div>
                                <div className="fw-bold" style={{ color: 'var(--primary-gold)', fontSize: '1.1rem' }}>
                                  {((service.price || 0)).toLocaleString('vi-VN')}₫
                                </div>
                              </Card.Body>
                            </Card>
                          </motion.div>
                        ))}
                        {selectedServiceIds.length > 0 && (
                          <div className="mt-2 p-2 bg-light rounded">
                            <div className="small text-muted">Đã chọn {selectedServiceIds.length} dịch vụ</div>
                            <div className="fw-semibold">
                              Tổng dịch vụ: <span style={{ color: 'var(--primary-gold)' }}>{servicesTotal.toLocaleString('vi-VN')}₫</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-muted small">Không có dịch vụ nào hiện có.</div>
                    )}

                    <hr className="my-4" />
                    <h5 className="mb-3">👤 Thông tin khách nhận phòng</h5>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Label className="fw-semibold">Họ và tên *</Form.Label>
                        <Form.Control
                          value={kyc.fullName}
                          onChange={(e) => setKyc({ ...kyc, fullName: e.target.value })}
                          required
                          style={{ borderRadius: '10px' }}
                          placeholder="Nguyễn Văn A"
                        />
                      </Col>

                      <Col md={3}>
                        <Form.Label className="fw-semibold">Ngày sinh *</Form.Label>
                        <Form.Control
                          type="date"
                          value={kyc.dateOfBirth}
                          onChange={(e) => setKyc({ ...kyc, dateOfBirth: e.target.value })}
                          required
                          style={{ borderRadius: '10px' }}
                        />
                      </Col>

                      <Col md={3}>
                        <Form.Label className="fw-semibold">Giới tính *</Form.Label>
                        <Form.Select
                          value={kyc.gender}
                          onChange={(e) => setKyc({ ...kyc, gender: e.target.value })}
                          required
                          style={{ borderRadius: '10px' }}
                        >
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </Form.Select>
                      </Col>

                      <Col md={6}>
                        <Form.Label className="fw-semibold">Số điện thoại *</Form.Label>
                        <Form.Control
                          value={kyc.phoneNumber}
                          onChange={(e) => setKyc({ ...kyc, phoneNumber: e.target.value })}
                          required
                          style={{ borderRadius: '10px' }}
                          placeholder="0123456789"
                        />
                      </Col>

                      <Col md={6}>
                        <Form.Label className="fw-semibold">Số CCCD/CMND *</Form.Label>
                        <Form.Control
                          value={kyc.nationalIdNumber}
                          onChange={(e) => setKyc({ ...kyc, nationalIdNumber: e.target.value })}
                          required
                          style={{ borderRadius: '10px' }}
                          placeholder="001234567890"
                        />
                      </Col>

                      {/* CCCD Upload - mặt trước */}
                      <Col md={6}>
                        <Form.Label className="fw-semibold">Ảnh CCCD mặt trước *</Form.Label>
                        <Form.Control
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          required={!kyc.idFrontUrl}
                          disabled={uploadingFront}
                          style={{ borderRadius: '10px' }}
                          onChange={async (e) => {
                            const f = e.target.files?.[0]
                            if (!f) return
                            const { validateImageFile } = await import('../api/upload')
                            const validation = validateImageFile(f)
                            if (!validation.valid) {
                              showToast.error(validation.error)
                              e.target.value = ''
                              return
                            }
                            setUploadingFront(true)
                            try {
                              const { uploadFile } = await import('../api/upload')
                              const { url } = await uploadFile(f)
                              setKyc((k) => ({ ...k, idFrontUrl: url }))
                              showToast.success('✅ Upload ảnh CCCD mặt trước thành công!')
                            } catch (err) {
                              showToast.error(err.message || 'Upload thất bại')
                              e.target.value = ''
                            } finally {
                              setUploadingFront(false)
                            }
                          }}
                        />
                        <Form.Text className="text-muted small">JPG, PNG, WEBP. Tối đa 10MB</Form.Text>
                        {uploadingFront && (
                          <div className="mt-2 text-center">
                            <div className="spinner-luxury mx-auto" style={{ width: '30px', height: '30px' }} />
                          </div>
                        )}
                        {kyc.idFrontUrl && (
                          <motion.div className="mt-2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                            <img src={kyc.idFrontUrl} alt="CCCD trước" style={{ height: 100, borderRadius: 8, border: '2px solid var(--primary-gold)' }} />
                            <Badge bg="success" className="ms-2">✓ Đã tải lên</Badge>
                          </motion.div>
                        )}
                      </Col>

                      {/* CCCD Upload - mặt sau */}
                      <Col md={6}>
                        <Form.Label className="fw-semibold">Ảnh CCCD mặt sau *</Form.Label>
                        <Form.Control
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          required={!kyc.idBackUrl}
                          disabled={uploadingBack}
                          style={{ borderRadius: '10px' }}
                          onChange={async (e) => {
                            const f = e.target.files?.[0]
                            if (!f) return
                            const { validateImageFile } = await import('../api/upload')
                            const validation = validateImageFile(f)
                            if (!validation.valid) {
                              showToast.error(validation.error)
                              e.target.value = ''
                              return
                            }
                            setUploadingBack(true)
                            try {
                              const { uploadFile } = await import('../api/upload')
                              const { url } = await uploadFile(f)
                              setKyc((k) => ({ ...k, idBackUrl: url }))
                              showToast.success('✅ Upload ảnh CCCD mặt sau thành công!')
                            } catch (err) {
                              showToast.error(err.message || 'Upload thất bại')
                              e.target.value = ''
                            } finally {
                              setUploadingBack(false)
                            }
                          }}
                        />
                        <Form.Text className="text-muted small">JPG, PNG, WEBP. Tối đa 10MB</Form.Text>
                        {uploadingBack && (
                          <div className="mt-2 text-center">
                            <div className="spinner-luxury mx-auto" style={{ width: '30px', height: '30px' }} />
                          </div>
                        )}
                        {kyc.idBackUrl && (
                          <motion.div className="mt-2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                            <img src={kyc.idBackUrl} alt="CCCD sau" style={{ height: 100, borderRadius: 8, border: '2px solid var(--primary-gold)' }} />
                            <Badge bg="success" className="ms-2">✓ Đã tải lên</Badge>
                          </motion.div>
                        )}
                      </Col>
                    </Row>

                    <hr className="my-4" />
                    <h5 className="mb-3">💳 Phương thức thanh toán</h5>
                    <div className="d-flex flex-column gap-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Card
                          className={`cursor-pointer ${payChoice === 'deposit' ? 'border-primary' : ''}`}
                          onClick={() => setPayChoice('deposit')}
                          style={{ cursor: 'pointer', borderWidth: '2px', borderColor: payChoice === 'deposit' ? 'var(--primary-gold)' : 'rgba(0,0,0,0.1)' }}
                        >
                          <Card.Body className="d-flex align-items-center gap-3">
                            <Form.Check type="radio" name="payChoice" id="payDeposit" checked={payChoice === 'deposit'} onChange={() => setPayChoice('deposit')} style={{ transform: 'scale(1.3)' }} />
                            <div className="flex-grow-1">
                              <div className="fw-semibold">Đặt cọc 30%</div>
                              <div className="small text-muted">Thanh toán {depositPercent}% ngay, phần còn lại thanh toán khi nhận phòng</div>
                            </div>
                            <Badge bg="success">Khuyến nghị</Badge>
                          </Card.Body>
                        </Card>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Card
                          className={`cursor-pointer ${payChoice === 'full' ? 'border-primary' : ''}`}
                          onClick={() => setPayChoice('full')}
                          style={{ cursor: 'pointer', borderWidth: '2px', borderColor: payChoice === 'full' ? 'var(--primary-gold)' : 'rgba(0,0,0,0.1)' }}
                        >
                          <Card.Body className="d-flex align-items-center gap-3">
                            <Form.Check type="radio" name="payChoice" id="payFull" checked={payChoice === 'full'} onChange={() => setPayChoice('full')} style={{ transform: 'scale(1.3)' }} />
                            <div className="flex-grow-1">
                              <div className="fw-semibold">Thanh toán toàn bộ</div>
                              <div className="small text-muted">Thanh toán 100% ngay, không cần thanh toán thêm</div>
                            </div>
                          </Card.Body>
                        </Card>
                      </motion.div>
                    </div>

                    <motion.div className="mt-4" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        className="w-100 py-3 fw-semibold"
                        size="lg"
                        disabled={submitting || !auth?.token}
                        style={{
                          background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '1.1rem',
                          boxShadow: '0 8px 20px rgba(201, 162, 74, 0.4)'
                        }}
                      >
                        {submitting ? (
                          <span className="d-flex align-items-center justify-content-center gap-2">
                            <div className="spinner-luxury" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                            Đang xử lý…
                          </span>
                        ) : (
                          '✅ Xác nhận đặt phòng'
                        )}
                      </Button>
                    </motion.div>
                  </Form>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          <Col lg={5}>
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="card-soft sticky-booking">
                <Card.Body>
                  <Card.Title className="h4 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    🏨 Phòng đã chọn
                  </Card.Title>
                  {!room ? (
                    <div className="text-center text-muted py-4">
                      <div className="spinner-luxury mx-auto mb-3" style={{ width: '40px', height: '40px' }} />
                      <p>Đang tải...</p>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex gap-3 mb-3">
                        <img
                          src={room.imageUrl}
                          alt={room.name}
                          style={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 12, border: '2px solid #f0f0f0' }}
                        />
                        <div className="flex-grow-1">
                          <div className="fw-semibold mb-1">{room.name}</div>
                          <div className="small text-muted mb-2">
                            👥 {room.capacity ?? 0} khách · 🛏️ {room.type || '—'}
                          </div>
                          {(room.amenities || []).length > 0 && (
                            <div className="small">
                              {(room.amenities || []).slice(0, 2).map((a, i) => (
                                <Badge key={i} bg="light" text="dark" className="me-1">{a}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <hr />

                      <div className="d-flex justify-content-between mb-2">
                        <div>Giá/đêm</div>
                        <div className="fw-semibold">{(room.priceVnd || 0).toLocaleString('vi-VN')}₫</div>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <div>Số đêm</div>
                        <div className="fw-semibold">{nights}</div>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <div>Tiền phòng</div>
                        <div className="fw-semibold">{(price * Math.max(1, nights)).toLocaleString('vi-VN')}₫</div>
                      </div>
                      {selectedServiceIds.length > 0 && (
                        <div className="d-flex justify-content-between mb-2">
                          <div>Dịch vụ ({selectedServiceIds.length})</div>
                          <div className="fw-semibold" style={{ color: 'var(--primary-gold)' }}>
                            +{servicesTotal.toLocaleString('vi-VN')}₫
                          </div>
                        </div>
                      )}

                      <hr />

                      <div className="d-flex justify-content-between mb-3">
                        <div className="fw-bold">Tổng thanh toán</div>
                        <div className="fw-bold" style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', fontFamily: 'Playfair Display, serif' }}>
                          {total.toLocaleString('vi-VN')}₫
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-light rounded-3">
                        <Link to={`/rooms/${id}`} className="text-decoration-none d-flex align-items-center gap-2">
                          ← Xem lại chi tiết phòng
                        </Link>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Modal xung đột lịch */}
        <Modal show={showConflict} onHide={() => setShowConflict(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Phòng đang bận</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="warning" className="mb-3">
              {conflict?.message || 'Khoảng ngày bạn chọn trùng với đơn khác.'}
            </Alert>

            {conflict?.availableFrom && (
              <p>Phòng sẽ trống từ: <b>{new Date(conflict.availableFrom).toLocaleDateString()}</b></p>
            )}

            {Array.isArray(conflict?.blocked) && conflict.blocked.length > 0 && (
              <>
                <div className="mb-1">Các khoảng đang bị chặn:</div>
                <ul className="mb-0">
                  {conflict.blocked.map((r, i) => (
                    <li key={i}>
                      {new Date(r.start).toLocaleDateString()} → {new Date(r.end).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => {
                if (conflict?.availableFrom) {
                  const start = conflict.availableFrom
                  const out = new Date(start); out.setDate(out.getDate() + 1)
                  setForm(f => ({ ...f, checkIn: start, checkOut: out.toISOString().slice(0, 10) }))
                }
                setShowConflict(false)
              }}
            >
              Chọn ngày trống sớm nhất
            </Button>
            <Button variant="secondary" onClick={() => setShowConflict(false)}>Để tôi tự chọn lại</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </motion.div>
  )
}
