// Enhanced RoomCardRow - Modern Hotel Booking Style
import React from 'react'
import { Badge, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { calculateDiscount } from '../../utils/discount'
import 'react-lazy-load-image-component/src/effects/blur.css'

export default function RoomCardRow({ room }) {
  const navigate = useNavigate();
  
  // Use actual rating from backend (room.rating and room.reviews)
  const rating = room.rating || 0;
  const reviews = room.reviews || 0;
  const discount = calculateDiscount(room.priceVnd);

  // Rating text
  const getRatingText = (rating) => {
    if (rating >= 4.8) return { text: 'Tuyệt vời', color: '#10b981' };
    if (rating >= 4.5) return { text: 'Rất tốt', color: '#3b82f6' };
    if (rating >= 4.0) return { text: 'Tốt', color: '#8b5cf6' };
    if (rating >= 3.5) return { text: 'Khá tốt', color: '#6b7280' };
    return { text: 'Chưa có đánh giá', color: '#9ca3af' };
  };

  const ratingInfo = getRatingText(rating);

  // Navigate to room detail when clicking anywhere on card
  const handleCardClick = (e) => {
    if (e.target.closest('.action-buttons')) {
      return;
    }
    navigate(`/rooms/${room.id}`);
  };

  return (
    <motion.div
      className="card card-soft mb-3 hover-lift"
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
      style={{ 
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid rgba(0,0,0,0.08)'
      }}
      onClick={handleCardClick}
    >
      <div className="row g-0">
        {/* Image Section */}
        <div className="col-md-4 p-0">
          <div className="position-relative overflow-hidden hover-zoom" style={{ height: '100%', minHeight: '240px' }}>
            {/* Discount badge - góc trên bên trái */}
            {discount > 0 && (
              <Badge 
                bg="danger" 
                className="position-absolute top-0 start-0 m-2"
                style={{ 
                  zIndex: 10, 
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  padding: '0.4rem 0.7rem',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.4)'
                }}
              >
                GIẢM {discount}%
              </Badge>
            )}
            
            {/* Image count indicator */}
            <div 
              className="position-absolute bottom-0 end-0 m-2"
              style={{ 
                zIndex: 10,
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '6px',
                padding: '0.35rem 0.6rem',
                backdropFilter: 'blur(4px)',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'white'
              }}
            >
              1/10
            </div>
            
            <LazyLoadImage
              src={room.imageUrl || 'https://via.placeholder.com/400x300/f0f0f0/999999?text=🏨'}
              alt={room.name}
              effect="blur"
              className="w-100 h-100"
              style={{ 
                objectFit: 'cover',
                minHeight: '240px',
                transition: 'transform 0.5s ease'
              }}
              placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' style='font-size:24px'%3E🏨%3C/text%3E%3C/svg%3E"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300/f0f0f0/999999?text=🏨';
              }}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="col-md-8">
          <div className="p-3 d-flex flex-column h-100">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="flex-grow-1">
                {/* Rating Badge - Always show */}
                <div className="d-flex align-items-center gap-2 mb-2">
                  {rating > 0 ? (
                    <>
                      {/* Rating Badge khi có đánh giá */}
                      <div 
                        className="d-flex align-items-center gap-1"
                        style={{
                          background: ratingInfo.color,
                          color: 'white',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '0.85rem'
                        }}
                      >
                        <span>{rating.toFixed(1)}</span>
                        <span style={{ fontSize: '0.9rem' }}>★</span>
                      </div>
                      
                      <span 
                        className="fw-semibold"
                        style={{ 
                          color: ratingInfo.color,
                          fontSize: '0.9rem'
                        }}
                      >
                        {ratingInfo.text}
                      </span>

                      {reviews > 0 && (
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                          ({reviews.toLocaleString()} đánh giá)
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Badge khi chưa có đánh giá */}
                      <div 
                        className="d-flex align-items-center gap-1"
                        style={{
                          background: '#f3f4f6',
                          color: '#6b7280',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <span>Mới</span>
                      </div>
                      
                      <span 
                        className="text-muted"
                        style={{ 
                          fontSize: '0.9rem'
                        }}
                      >
                        Chưa có đánh giá
                      </span>
                    </>
                  )}
                </div>

                <h5 
                  className="mb-2" 
                  style={{ 
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '1.3rem',
                    color: '#1a1a1a',
                    fontWeight: '600',
                    lineHeight: '1.4'
                  }}
                >
                  {room.name}
                </h5>
              </div>

              {/* Favorite Heart Icon */}
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle favorite toggle
                }}
                style={{ cursor: 'pointer', padding: '0.5rem' }}
              >
                <span style={{ fontSize: '1.5rem', color: '#ddd' }}>♡</span>
              </motion.div>
            </div>

            {/* Room Info Tags */}
            {discount > 0 && (
              <div className="mb-2">
                <Badge bg="light" text="dark" className="border" style={{ fontWeight: 'normal', padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}>
                  Ưu Đãi Jingle
                </Badge>
              </div>
            )}

            {/* Room Info */}
            <div className="text-muted mb-auto" style={{ fontSize: '0.85rem' }}>
              <div className="mb-1">
                <span className="me-3">{room.capacity || 2} khách</span>
                <span className="me-3">{room.type || 'Standard'}</span>
                {room.sizeSqm && (<span>{room.sizeSqm}m²</span>)}
              </div>
              <div>
                WiFi • Đỗ xe • Dịch vụ phòng
              </div>
            </div>

            {/* Bottom: Price & Action */}
            <div className="d-flex justify-content-between align-items-end pt-2 border-top">
              {/* Price Section */}
              <div>
                {discount > 0 && (
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="text-decoration-line-through text-muted" style={{ fontSize: '0.95rem' }}>
                      {Math.round(room.priceVnd * (1 + discount / 100)).toLocaleString('vi-VN')}₫
                    </span>
                    <Badge bg="danger" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
                      -{discount}%
                    </Badge>
                  </div>
                )}
                <div className="d-flex align-items-baseline gap-2">
                  <div>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                      Giá mới đến chưa gồm thuế và phí
                    </small>
                    <div className="d-flex align-items-baseline gap-1">
                      <span 
                        className="fw-bold"
                        style={{ 
                          color: '#1a1a1a',
                          fontSize: '1.75rem',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      >
                        {room.priceVnd.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.9rem' }}>₫</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="action-buttons">
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button 
                    as={Link} 
                    to={`/booking/${room.id}`}
                    size="lg"
                    style={{ 
                      background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.75rem 2rem',
                      fontWeight: '700',
                      fontSize: '1rem',
                      boxShadow: '0 4px 16px rgba(201, 162, 74, 0.35)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Đặt ngay
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
