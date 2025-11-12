// Quick Filter Tabs - For fast filtering
import React from 'react';
import { ButtonGroup, Button, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaStar, FaMoneyBillWave, FaFire, FaHeart, FaTags } from 'react-icons/fa';

const quickFilters = [
  { 
    key: 'relevant', 
    label: 'Phù hợp nhất', 
    icon: <FaStar />,
    sort: 'popular',
    color: '#C9A24A'
  },
  { 
    key: 'priceAsc', 
    label: 'Giá thấp nhất', 
    icon: <FaMoneyBillWave />,
    sort: 'priceAsc',
    color: '#28a745'
  },
  { 
    key: 'discount', 
    label: 'Ưu đãi lớn', 
    icon: <FaTags />,
    sort: 'discountDesc',
    color: '#dc3545'
  },
  { 
    key: 'rating', 
    label: 'Đánh giá cao', 
    icon: <FaHeart />,
    sort: 'ratingDesc',
    color: '#e83e8c'
  },
];

export default function QuickFilters({ activeSort, onSortChange }) {
  return (
    <motion.div
      className="quick-filters mb-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div 
        className="d-flex align-items-center gap-2 flex-wrap p-3 bg-white rounded-3"
        style={{ 
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <span className="text-muted small fw-semibold me-2">
          Lọc nhanh:
        </span>
        
        {quickFilters.map((filter, index) => {
          const isActive = activeSort === filter.sort;
          
          return (
            <motion.div
              key={filter.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={isActive ? 'dark' : 'outline-secondary'}
                size="sm"
                onClick={() => onSortChange(filter.sort)}
                className="d-flex align-items-center gap-2"
                style={{
                  borderRadius: '20px',
                  padding: '0.5rem 1rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  border: isActive ? 'none' : '1px solid rgba(0,0,0,0.15)',
                  background: isActive 
                    ? `linear-gradient(135deg, ${filter.color} 0%, ${filter.color}dd 100%)`
                    : 'white',
                  color: isActive ? 'white' : '#495057',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive 
                    ? `0 4px 12px ${filter.color}40`
                    : 'none'
                }}
              >
                <span style={{ fontSize: '1rem' }}>
                  {filter.icon}
                </span>
                <span>{filter.label}</span>
                {isActive && (
                  <Badge 
                    bg="light" 
                    text="dark"
                    style={{
                      marginLeft: '0.25rem',
                      fontSize: '0.7rem',
                      padding: '0.15rem 0.4rem'
                    }}
                  >
                    ✓
                  </Badge>
                )}
              </Button>
            </motion.div>
          );
        })}
        
        {/* Hot deals badge */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        >
          <Badge 
            bg="danger" 
            className="ms-2"
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)'
            }}
          >
            <FaFire className="me-1" />
            Nhiều ưu đãi hôm nay!
          </Badge>
        </motion.div>
      </div>
    </motion.div>
  );
}


