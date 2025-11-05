// Enhanced RoomCardRow - Clickable Entire Card
import React from 'react'
import { Badge, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { calculateDiscount } from '../../utils/discount'
import 'react-lazy-load-image-component/src/effects/blur.css'

export default function RoomCardRow({ room }) {
  const navigate = useNavigate();
  const rating = room.rating ?? 4.7
  const discount = calculateDiscount(room.priceVnd)
  const reviews = room.reviews ?? 120

  // Navigate to room detail when clicking anywhere on card
  const handleCardClick = (e) => {
    // Don't navigate if clicking on action buttons
    if (e.target.closest('.action-buttons')) {
      return;
    }
    navigate(`/rooms/${room.id}`);
  };

  return (
    <motion.div
      className="card card-soft mb-4 hover-lift"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      style={{ 
        overflow: 'hidden',
        cursor: 'pointer' // Show it's clickable
      }}
      onClick={handleCardClick}
    >
      <div className="row g-0">
        {/* Image Section */}
        <div className="col-md-5 p-0">
          <div className="position-relative overflow-hidden hover-zoom" style={{ height: '100%', minHeight: '280px' }}>
            {discount > 0 && (
              <Badge 
                bg="danger" 
                className="position-absolute top-0 start-0 m-3"
                style={{ 
                  zIndex: 10, 
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  padding: '0.5rem 0.75rem'
                }}
              >
                -{discount}%
              </Badge>
            )}
            
            <LazyLoadImage
              src={room.imageUrl || 'https://via.placeholder.com/400x300/f0f0f0/999999?text=🏨'}
              alt={room.name}
              effect="blur"
              className="w-100 h-100"
              style={{ 
                objectFit: 'cover',
                minHeight: '280px',
                transition: 'transform 0.5s ease'
              }}
              placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' style='font-size:24px'%3E🏨%3C/text%3E%3C/svg%3E"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300/f0f0f0/999999?text=🏨';
              }}
            />

            {/* Reviews Badge Overlay */}
            <div 
              className="position-absolute bottom-0 start-0 end-0 p-3"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              }}
            >
              <Badge bg="dark" className="bg-opacity-75">
                ⭐ {rating} ({reviews} đánh giá)
              </Badge>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="col-md-7 p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h5 
              className="mb-0" 
              style={{ 
                fontFamily: 'Playfair Display, serif',
                fontSize: '1.5rem',
                color: 'var(--primary-dark)'
              }}
            >
              {room.name}
            </h5>
          </div>

          {/* Room Info */}
          <div className="text-muted mb-3" style={{ fontSize: '0.95rem' }}>
            <span className="me-3">
              <strong>👥</strong> {room.capacity} khách
            </span>
            <span className="me-3">
              <strong>🛏️</strong> {room.type || 'Standard'}
            </span>
            {room.sizeSqm && (
              <span>
                <strong>📐</strong> {room.sizeSqm}m²
              </span>
            )}
          </div>

          {/* Amenities Tags */}
          <div className="mb-3">
            <div className="small fw-semibold mb-2 text-muted">Đặc điểm nổi bật:</div>
            <div className="d-flex flex-wrap gap-2">
              {(room.amenities || []).slice(0, 4).map((amenity, i) => (
                <Badge 
                  key={i} 
                  bg="light" 
                  text="dark" 
                  className="border"
                  style={{ 
                    fontWeight: 'normal',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.85rem'
                  }}
                >
                  {amenity}
                </Badge>
              ))}
              {(room.amenities || []).length > 4 && (
                <Badge 
                  bg="light" 
                  text="muted" 
                  className="border"
                  style={{ fontWeight: 'normal' }}
                >
                  +{(room.amenities || []).length - 4}
                </Badge>
              )}
            </div>
          </div>

          {/* Standard Amenities Icons */}
          <div className="d-flex gap-4 text-muted small mb-4">
            <div title="WiFi miễn phí">📶 WiFi</div>
            <div title="Bãi đỗ xe">🅿️ Parking</div>
            <div title="Dịch vụ phòng">🛎️ Room Service</div>
          </div>

          {/* Price & Actions */}
          <div className="d-flex justify-content-between align-items-end">
            <div>
              {discount > 0 && (
                <div className="text-decoration-line-through text-muted small mb-1">
                  {Math.round(room.priceVnd * (1 + discount / 100)).toLocaleString('vi-VN')}₫
                </div>
              )}
              <div className="d-flex align-items-baseline gap-2">
                <span 
                  className="h3 mb-0 fw-bold"
                  style={{ color: 'var(--primary-gold)' }}
                >
                  {room.priceVnd.toLocaleString('vi-VN')}₫
                </span>
                <span className="text-muted">/ đêm</span>
              </div>
            </div>

            {/* Action Buttons - Prevent card click propagation */}
            <div className="d-flex gap-2 action-buttons">
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()} // Stop propagation
              >
                <Button 
                  as={Link} 
                  to={`/booking/${room.id}`}
                  size="lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.6rem 1.5rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(201, 162, 74, 0.3)'
                  }}
                >
                  Đặt ngay
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Hint text */}
          <div className="mt-2 text-center">
            <small className="text-muted">
              💡 Click vào bất kỳ đâu để xem chi tiết phòng
            </small>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
