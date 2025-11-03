import React from 'react';
import { Carousel, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../../styles/carousel.css';

export default function RoomCarousel({ rooms, title = "Phòng gợi ý dành cho bạn" }) {
  const navigate = useNavigate();

  // Defensive: ensure rooms is an array before rendering
  if (!Array.isArray(rooms) || rooms.length === 0) {
    return null;
  }

  const handleBookNow = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  const handleViewDetail = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  return (
    <section className="room-carousel-section py-5">
      <div className="container">
        <h2 className="fw-bold mb-4 text-center">{title}</h2>
        <Carousel 
          indicators={true} 
          controls={true}
          interval={4000}
          pause="hover"
          className="room-carousel"
        >
          {rooms.map((room) => (
            <Carousel.Item key={room.id}>
              <div className="carousel-room-card">
                <div className="row g-0 align-items-center">
                  <div className="col-md-6">
                    <div className="carousel-image-wrapper">
                      <img
                        src={room.imageUrl || '/assets/placeholder-room.jpg'}
                        alt={room.name}
                        className="carousel-room-image"
                      />
                      {room.discount && (
                        <Badge 
                          bg="danger" 
                          className="position-absolute top-0 end-0 m-3 fs-6"
                        >
                          -{room.discount}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <Card.Body className="p-5">
                      <div className="mb-3">
                        <Badge bg="primary" className="me-2">
                          {room.type || 'Deluxe'}
                        </Badge>
                        {room.popular && (
                          <Badge bg="warning" text="dark">
                            ⭐ Phổ biến
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="fw-bold mb-3">{room.name}</h3>
                      
                      <div className="room-features mb-4">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-people-fill me-2 text-primary"></i>
                          <span>Sức chứa: {room.capacity} người</span>
                        </div>
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-star-fill me-2 text-warning"></i>
                            <span>{room.amenities.slice(0, 3).join(', ')}</span>
                          </div>
                        )}
                        {room.rating && (
                          <div className="d-flex align-items-center">
                            <i className="bi bi-award-fill me-2 text-success"></i>
                            <span>
                              Đánh giá: {room.rating}/5 
                              {room.reviews && ` (${room.reviews} reviews)`}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <div>
                          <div className="text-muted small">Giá mỗi đêm</div>
                          <h4 className="text-primary fw-bold mb-0">
                            {room.priceVnd?.toLocaleString('vi-VN')} ₫
                          </h4>
                        </div>
                      </div>

                      <div className="d-grid gap-2 d-md-flex">
                        <Button 
                          variant="primary" 
                          size="lg" 
                          onClick={() => handleBookNow(room.id)}
                          className="flex-fill"
                        >
                          Đặt ngay
                        </Button>
                        <Button 
                          variant="outline-primary" 
                          size="lg" 
                          onClick={() => handleViewDetail(room.id)}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </Card.Body>
                  </div>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
    </section>
  );
}


