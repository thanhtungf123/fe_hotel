import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

export default function HeroSearch(){
  const navigate = useNavigate()
  const [checkin, setCheckin] = useState('')
  const [checkout, setCheckout] = useState('')
  const [guests, setGuests] = useState(2)

  const onSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams({
      checkin, checkout, guests: String(guests)
    })
    navigate(`/search?${params.toString()}`)
  }

  return (
    <section className="hero d-flex align-items-center">
      <Container className="hero-inner">
        <Row className="justify-content-center">
          <Col lg={10} className="text-center">
            <h1 className="display-4 fw-bold mb-3">Trải nghiệm nghỉ dưỡng đẳng cấp quốc tế</h1>
            <p className="lead mb-4">
              Khám phá sự sang trọng và tiện nghi tại LuxeStay – nơi mọi khoảnh khắc đều trở nên đặc biệt
            </p>

            <Form onSubmit={onSubmit} className="bg-white p-3 rounded-2xl shadow-soft">
              <Row className="g-2 align-items-center">
                <Col md>
                  <Form.Control type="date" value={checkin}
                    onChange={(e)=>setCheckin(e.target.value)} placeholder="Ngày nhận phòng"/>
                </Col>
                <Col md>
                  <Form.Control type="date" value={checkout}
                    onChange={(e)=>setCheckout(e.target.value)} placeholder="Ngày trả phòng"/>
                </Col>
                <Col md>
                  <Form.Control type="number" min={1} value={guests}
                    onChange={(e)=>setGuests(Number(e.target.value))} placeholder="Số khách"/>
                </Col>
                <Col md="auto">
                  <Button type="submit" className="px-4" variant="danger">Tìm phòng</Button>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Container>
    </section>
  )
}
