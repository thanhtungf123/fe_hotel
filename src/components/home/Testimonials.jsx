import React from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'

const reviews = [
  { name: 'Nguyễn Minh Anh', city: 'Hà Nội', quote: 'Khách sạn tuyệt vời với dịch vụ hoàn hảo. Nhân viên rất thân thiện và chuyên nghiệp. Tôi sẽ quay lại lần nữa!' },
  { name: 'Trần Văn Hùng', city: 'TP.HCM', quote: 'Phòng nghỉ sang trọng, sạch sẽ và thoải mái. Vị trí thuận tiện, gần trung tâm thành phố. Rất đáng giá tiền!' },
  { name: 'Lê Thị Mai', city: 'Đà Nẵng', quote: 'Kỳ nghỉ tuyệt vời tại LuxeStay. Spa và nhà hàng đều xuất sắc. Tôi cảm thấy thực sự được thư giãn và nghỉ ngơi.' },
]

function Stars(){ return <div className="text-warning mb-2">{"★".repeat(5)}</div> }

export default function Testimonials(){
  return (
    <section className="py-5">
      <h2 className="fw-bold mb-4">Khách hàng nói gì về chúng tôi</h2>
      <Row className="g-4">
        {reviews.map((r, idx) => (
          <Col md={6} lg={4} key={idx}>
            <Card className="h-100 rounded-2xl shadow-soft">
              <Card.Body>
                <Stars />
                <Card.Text className="fst-italic">"{r.quote}"</Card.Text>
                <div className="d-flex align-items-center gap-2 mt-3">
                  <div className="rounded-circle bg-secondary" style={{width:40, height:40}}></div>
                  <div>
                    <div className="fw-semibold">{r.name}</div>
                    <div className="text-muted small">{r.city}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  )
}
