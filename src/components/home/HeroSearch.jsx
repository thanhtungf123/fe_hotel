// Enhanced Hero Section with Parallax Effect & Animations
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function HeroSearch() {
  const navigate = useNavigate()
  const [checkin, setCheckin] = useState('')
  const [checkout, setCheckout] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  
  // Parallax effect
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  // Set minimum dates
  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    setCheckin(today.toISOString().split('T')[0])
    setCheckout(tomorrow.toISOString().split('T')[0])
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    const totalGuests = adults + children
    const params = new URLSearchParams({
      checkin,
      checkout,
      guests: String(totalGuests)
    })
    navigate(`/search?${params.toString()}`)
  }

  return (
    <motion.section
      className="hero d-flex align-items-center"
      style={{ y }}
    >
      <motion.div
        className="hero-inner w-100"
        style={{ opacity }}
      >
        <Container>
        <Row className="justify-content-center">
          <Col lg={10} className="text-center">
              {/* Animated Heading */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h1 
                  className="display-3 fw-bold mb-3"
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                    lineHeight: '1.2'
                  }}
                >
                  <span style={{ color: '#FFD700' }}>Trải nghiệm nghỉ dưỡng<br />
                                          đẳng cấp quốc tế</span>
                </h1>
              </motion.div>

              {/* Animated Subtitle */}
              <motion.p
                className="lead mb-5"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                style={{
                  fontSize: '1.25rem',
                  textShadow: '1px 1px 4px rgba(0,0,0,0.5)'
                }}
              >
                Khám phá sự sang trọng và tiện nghi tại Aurora Palace – <br className="d-none d-md-block" />
                nơi mọi khoảnh khắc đều trở nên đặc biệt
              </motion.p>

              {/* Animated Search Form */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              >
                <Form 
                  onSubmit={onSubmit} 
                  className="bg-white p-4 shadow-soft"
                  style={{
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                    background: 'rgba(255, 255, 255, 0.98)'
                  }}
                >
                  <Row className="g-3 align-items-center">
                    <Col md={12} lg={3}>
                      <Form.Group>
                        <Form.Label className="text-start w-100 mb-1 small fw-semibold text-muted">
                          Ngày nhận phòng
                        </Form.Label>
                        <Form.Control
                          type="date"
                          value={checkin}
                          onChange={(e) => setCheckin(e.target.value)}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          style={{ borderRadius: '8px', padding: '0.75rem' }}
                        />
                      </Form.Group>
                </Col>
                    
                    <Col md={12} lg={3}>
                      <Form.Group>
                        <Form.Label className="text-start w-100 mb-1 small fw-semibold text-muted">
                          Ngày trả phòng
                        </Form.Label>
                        <Form.Control
                          type="date"
                          value={checkout}
                          onChange={(e) => setCheckout(e.target.value)}
                          required
                          min={checkin}
                          style={{ borderRadius: '8px', padding: '0.75rem' }}
                        />
                      </Form.Group>
                </Col>
                    
                    <Col md={12} lg={3}>
                      <Form.Group>
                        <Form.Label className="text-start w-100 mb-1 small fw-semibold text-muted">
                          Số khách
                        </Form.Label>
                        <Row className="g-2">
                          <Col xs={6}>
                            <Form.Control
                              type="number"
                              min="1"
                              max="20"
                              value={adults}
                              onChange={(e) => setAdults(Number(e.target.value) || 1)}
                              placeholder="Người lớn"
                              style={{ borderRadius: '8px', padding: '0.75rem', fontSize: '0.9rem' }}
                            />
                            <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                              Người lớn
                            </Form.Text>
                          </Col>
                          <Col xs={6}>
                            <Form.Control
                              type="number"
                              min="0"
                              max="10"
                              value={children}
                              onChange={(e) => setChildren(Number(e.target.value) || 0)}
                              placeholder="Trẻ em"
                              style={{ borderRadius: '8px', padding: '0.75rem', fontSize: '0.9rem' }}
                            />
                            <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                              Trẻ em
                            </Form.Text>
                          </Col>
                        </Row>
                      </Form.Group>
                </Col>
                    
                    <Col md={12} lg={3}>
                      <motion.div
                        className="d-grid"
                        style={{ marginTop: '1.5rem' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="submit"
                          size="lg"
                          style={{
                            background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(201, 162, 74, 0.3)'
                          }}
                        >
                          🔍 Tìm phòng ngay
                        </Button>
                      </motion.div>
                </Col>
              </Row>
            </Form>
              </motion.div>

              {/* Scroll Indicator */}
              <motion.div
                className="mt-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </motion.div>
              </motion.div>
          </Col>
        </Row>
      </Container>
      </motion.div>
    </motion.section>
  )
}
