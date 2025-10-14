// RoomCardRow.jsx
import React from 'react'
import { Badge, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function RoomCardRow({ room }) {
  const rating = room.rating ?? 4.7
  const discount = room.discount ?? (room.priceVnd>3000000?17:0)

  return (
    <div className="card card-soft mb-4">
      <div className="row g-0">
        <div className="col-md-5 p-3">
          <div className="position-relative">
            {discount>0 && <Badge bg="danger" className="position-absolute m-2">-{discount}%</Badge>}
            <img src={room.imageUrl} alt={room.name} className="result-thumb w-100"/>
            <Badge bg="dark" className="position-absolute top-0 end-0 m-2">
              {(room.reviews ?? 120) + ' đánh giá'}
            </Badge>
          </div>
        </div>

        <div className="col-md-7 p-3">
          <div className="d-flex justify-content-between">
            <h5 className="mb-2">{room.name}</h5>
            <div className="text-warning">⭐ {rating}</div>
          </div>

          <div className="text-muted small mb-2">
            👥 {room.capacity} khách &nbsp; | &nbsp; 🛏️ {room.type || '—'} &nbsp; | &nbsp; 📐 {room.sizeSqm}m²
          </div>

          <div className="mb-2 fw-semibold">Đặc điểm nổi bật:</div>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {(room.amenities || []).slice(0,3).map((a,i)=>(
              <Badge key={i} bg="light" text="dark" className="badge-light">{a}</Badge>
            ))}
          </div>
          <div className="d-flex gap-3 text-muted small mb-3">
            <div>📶 Wifi</div><div>🅿️ Parking</div><div>🛎️ Room-Service</div>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div>
              {discount>0 && (
                <div className="text-decoration-line-through text-muted small">
                  {(Math.round(room.priceVnd*1.2)).toLocaleString('vi-VN')}₫
                </div>
              )}
              <div className="fs-4 price-label">
                {room.priceVnd.toLocaleString('vi-VN')}₫ <span className="fs-6 text-muted">/ đêm</span>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Button as={Link} to={`/rooms/${room.id}`} variant="light" className="border">
                Xem chi tiết
              </Button>
              {/* to Booking */}
              <Button as={Link} to={`/booking/${room.id}`} variant="danger">
                Đặt ngay
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
