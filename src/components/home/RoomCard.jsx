// Enhanced RoomCard - Clickable Entire Card
import React from 'react'
import { Badge, Button, Card } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { calculateDiscount } from '../../utils/discount'
import 'react-lazy-load-image-component/src/effects/blur.css'

export default function RoomCard({ room }) {
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
    <Card 
      className="card-soft h-100 hover-lift"
      style={{ cursor: 'pointer' }}
      onClick={handleCardClick}
    >
      <div className="position-relative overflow-hidden hover-zoom">
        {/* Discount badge - góc trên bên trái */}
        {discount > 0 && (
          <Badge 
            bg="danger" 
            className="position-absolute top-0 start-0 m-3"
            style={{ 
              zIndex: 10, 
              fontSize: '0.9rem',
              fontWeight: '600',
              padding: '0.4rem 0.6rem'
            }}
          >
            -{discount}%
          </Badge>
        )}
        
        {/* Rating với icon sao - góc trên bên phải (đối diện discount) */}
        <div 
          className="position-absolute top-0 end-0 m-3"
          style={{ 
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '8px',
            padding: '0.35rem 0.5rem',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div className="d-flex align-items-center gap-0">
            {[...Array(5)].map((_, i) => {
              const fullStars = Math.floor(rating)
              const hasHalfStar = rating % 1 >= 0.5
              let starType = 'empty'
              if (i < fullStars) {
                starType = 'full'
              } else if (i === fullStars && hasHalfStar) {
                starType = 'half'
              }
              
                  return (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.9rem',
                        color: starType === 'full' ? '#FFB800' : '#E0E0E0',
                        lineHeight: '1',
                        position: starType === 'half' ? 'relative' : 'static',
                        display: 'inline-block',
                        width: starType === 'half' ? '0.9rem' : 'auto'
                      }}
                    >
                      {starType === 'half' ? (
                        <span style={{ position: 'relative', display: 'inline-block' }}>
                          <span style={{ color: '#E0E0E0' }}>★</span>
                          <span 
                            style={{ 
                              color: '#FFB800',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              width: '50%',
                              overflow: 'hidden'
                            }}
                          >
                            ★
                          </span>
                        </span>
                      ) : (
                        '★'
                      )}
                    </span>
                  )
            })}
          </div>
        </div>
        
        <LazyLoadImage
          src={room.imageUrl || 'https://via.placeholder.com/400x300/f0f0f0/999999?text=🏨'}
          alt={room.name}
          effect="blur"
          className="w-100"
          style={{ 
            height: '220px', 
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' style='font-size:24px'%3E🏨%3C/text%3E%3C/svg%3E"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300/f0f0f0/999999?text=🏨';
          }}
        />
      </div>

      <Card.Body className="d-flex flex-column">
        <h5 className="card-title mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          {room.name}
        </h5>
        
        <div className="text-muted small mb-3">
          <span className="me-3">{room.capacity} khách</span>
          <span className="me-3">{room.type || 'Standard'}</span>
          {room.sizeSqm && <span>{room.sizeSqm}m²</span>}
        </div>

        {/* Amenities Tags */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {(room.amenities || []).slice(0, 3).map((amenity, i) => (
            <Badge 
              key={i} 
              bg="light" 
              text="dark" 
              className="border"
              style={{ fontWeight: 'normal' }}
            >
              {amenity}
            </Badge>
          ))}
          {(room.amenities || []).length > 3 && (
            <Badge bg="light" text="muted" className="border">
              +{(room.amenities || []).length - 3}
            </Badge>
          )}
        </div>

        {/* Price Section */}
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-end mb-3">
            <div>
              {discount > 0 && (
                <div className="text-decoration-line-through text-muted small">
                  {Math.round(room.priceVnd * (1 + discount / 100)).toLocaleString('vi-VN')}₫
                </div>
              )}
              <div className="h4 mb-0 text-gold fw-bold">
                {room.priceVnd.toLocaleString('vi-VN')}₫
              </div>
              <small className="text-muted">/ đêm</small>
            </div>
          </div>

          {/* Action Buttons - Prevent card click propagation */}
          <div className="d-flex gap-2 action-buttons">
            <motion.div 
              className="flex-grow-1"
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Button 
                as={Link} 
                to={`/booking/${room.id}`} 
                variant="danger"
                size="sm"
                className="w-100"
                style={{ 
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
                  border: 'none'
                }}
              >
                Đặt ngay
              </Button>
            </motion.div>
          </div>

          {/* Hint text */}
          <div className="mt-2 text-center">
            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
              Click để xem chi tiết
            </small>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}
