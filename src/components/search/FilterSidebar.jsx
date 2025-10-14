import React from 'react'
import { Card, Form, Button } from 'react-bootstrap'

export default function FilterSidebar({ filters, onChange, onClear }) {
  const update = (k,v)=> onChange({ ...filters, [k]: v })

  // Map đúng các layout trong DB (bed_layouts.layout_name)
  const typeOptions = [
    '1 giường đơn','2 giường đơn','3 giường đơn',
    '1 giường đôi','1 giường đôi lớn','2 giường đôi',
    '1 giường đơn 1 giường đôi'
  ]
  const amenityOptions = ['WiFi miễn phí','Ban công','Tầm nhìn biển','Tầm nhìn thành phố','Bồn tắm jacuzzi','Minibar']

  return (
    <div className="side-card">
      <Card className="card-soft mb-3">
        <Card.Body>
          <Card.Title className="h6">Thời gian lưu trú</Card.Title>
          <Form.Group className="mb-2">
            <Form.Label>Ngày nhận phòng</Form.Label>
            <Form.Control type="date" value={filters.checkin||''} onChange={e=>update('checkin', e.target.value)}/>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Ngày trả phòng</Form.Label>
            <Form.Control type="date" value={filters.checkout||''} onChange={e=>update('checkout', e.target.value)}/>
          </Form.Group>
          <Form.Group>
            <Form.Label>Số khách</Form.Label>
            <Form.Control type="number" min={1} value={filters.guests||2} onChange={e=>update('guests', Number(e.target.value))}/>
          </Form.Group>
        </Card.Body>
      </Card>

      <Card className="card-soft mb-3">
        <Card.Body>
          <Card.Title className="h6">Khoảng giá</Card.Title>
          <Form.Range min={1000000} max={10000000} step={100000}
            value={filters.priceMax}
            onChange={e=>update('priceMax', Number(e.target.value))}
          />
          <div className="d-flex justify-content-between text-muted small">
            <div>{(1000000).toLocaleString('vi-VN')}₫</div>
            <div>{(filters.priceMax).toLocaleString('vi-VN')}₫</div>
          </div>
        </Card.Body>
      </Card>

      <Card className="card-soft mb-3">
        <Card.Body>
          <Card.Title className="h6">Loại giường</Card.Title>
          {typeOptions.map(t=>(
            <Form.Check key={t} type="checkbox" className="mb-2"
              label={`Giường: ${t}`} checked={filters.types?.includes(t)||false}
              onChange={e=>{
                const set = new Set(filters.types||[])
                e.target.checked ? set.add(t) : set.delete(t)
                update('types', Array.from(set))
              }}
            />
          ))}
        </Card.Body>
      </Card>

      <Card className="card-soft mb-3">
        <Card.Body>
          <Card.Title className="h6">Tiện nghi</Card.Title>
          {amenityOptions.map(a=>(
            <Form.Check key={a} type="checkbox" className="mb-2"
              label={a} checked={filters.amenities?.includes(a)||false}
              onChange={e=>{
                const set = new Set(filters.amenities||[])
                e.target.checked ? set.add(a) : set.delete(a)
                update('amenities', Array.from(set))
              }}
            />
          ))}
          <div className="d-grid"><Button variant="light" className="border mt-2" onClick={onClear}>Xóa bộ lọc</Button></div>
        </Card.Body>
      </Card>
    </div>
  )
}
