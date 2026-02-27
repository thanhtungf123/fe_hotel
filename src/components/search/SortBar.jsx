// Enhanced SortBar - Professional Sorting & View Controls
import React from 'react';
import { ButtonGroup, ToggleButton, Dropdown } from 'react-bootstrap';
import { motion } from 'framer-motion';

const sorts = [
  { key: 'priceAsc', label: 'Giá thấp đến cao', icon: '' },
  { key: 'priceDesc', label: 'Giá cao đến thấp', icon: '' },
  { key: 'ratingDesc', label: 'Đánh giá cao nhất', icon: '' },
  { key: 'popular', label: 'Phổ biến nhất', icon: '' },
  { key: 'discountDesc', label: 'Giảm giá cao nhất', icon: '' },
];

export default function SortBar({ view, onView, sort, onSort, resultsCount }) {
  const currentSort = sorts.find(s => s.key === sort) || sorts[0];

  return (
    <motion.div 
      className="sort-bar mb-4 p-3 rounded-3 shadow-sm"
      style={{ 
        background: 'white',
        border: '1px solid rgba(0,0,0,0.08)'
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        {/* Left: Title & Count */}
        <div>
          <h4 
            className="mb-1" 
            style={{ 
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.5rem'
            }}
          >
            Kết quả tìm kiếm
          </h4>
          {resultsCount !== undefined && (
            <div className="text-muted small">
              {resultsCount > 0 
                ? `Tìm thấy ${resultsCount} phòng phù hợp` 
                : 'Không tìm thấy phòng nào'
              }
            </div>
          )}
        </div>

        {/* Right: Sort & View Controls */}
        <div className="d-flex align-items-center gap-3">
          {/* Sort Dropdown */}
          <Dropdown>
            <Dropdown.Toggle 
              variant="light" 
              className="border"
              style={{
                borderRadius: '10px',
                padding: '0.5rem 1rem',
                fontWeight: '500',
                background: 'white',
                borderColor: 'rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>Sắp xếp:</span>
              <strong style={{ color: 'var(--primary-gold)' }}>
                {currentSort.label}
              </strong>
            </Dropdown.Toggle>
            <Dropdown.Menu
              style={{
                borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: 'none',
                padding: '0.5rem'
              }}
            >
              {sorts.map(s => (
                <Dropdown.Item 
                  key={s.key} 
                  active={s.key === sort} 
                  onClick={() => onSort(s.key)}
                  style={{
                    borderRadius: '8px',
                    padding: '0.6rem 1rem',
                    fontWeight: s.key === sort ? '600' : 'normal',
                    background: s.key === sort 
                      ? 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)' 
                      : 'transparent',
                    color: s.key === sort ? 'white' : 'inherit',
                    marginBottom: '0.25rem'
                  }}
                >
                  {s.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {/* View Toggle */}
          <ButtonGroup>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ToggleButton 
                id="vlist" 
                type="radio" 
                name="view" 
                value="list"
                variant={view === 'list' ? 'dark' : 'outline-secondary'}
                checked={view === 'list'} 
                onChange={() => onView('list')}
                style={{
                  borderRadius: '10px 0 0 10px',
                  padding: '0.5rem 1rem',
                  fontWeight: '600',
                  background: view === 'list' 
                    ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
                    : 'white',
                  borderColor: 'rgba(0,0,0,0.15)'
                }}
                title="Xem dạng danh sách"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </ToggleButton>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ToggleButton 
                id="vgrid" 
                type="radio" 
                name="view" 
                value="grid"
                variant={view === 'grid' ? 'dark' : 'outline-secondary'}
                checked={view === 'grid'} 
                onChange={() => onView('grid')}
                style={{
                  borderRadius: '0 10px 10px 0',
                  padding: '0.5rem 1rem',
                  fontWeight: '600',
                  background: view === 'grid' 
                    ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
                    : 'white',
                  borderColor: 'rgba(0,0,0,0.15)'
                }}
                title="Xem dạng lưới"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
                </svg>
              </ToggleButton>
            </motion.div>
          </ButtonGroup>
        </div>
      </div>
    </motion.div>
  );
}
