// Hero Search Bar - Enhanced for Search Page
import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Dropdown } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaSearch } from 'react-icons/fa';

export default function HeroSearchBar({ filters, onChange, onSearch }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const guestDropdownRef = useRef(null);

  useEffect(() => {
    setLocalFilters((prev) => {
      const prevGuests = (prev.adults || 0) + (prev.children || 0);
      const nextGuests = (filters.adults || 0) + (filters.children || 0);
      const isSame =
        prev.checkin === filters.checkin &&
        prev.checkout === filters.checkout &&
        prevGuests === nextGuests;
      return isSame ? prev : { ...prev, ...filters };
    });
  }, [filters]);

  const update = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleSearch = () => {
    onChange(localFilters);
    if (onSearch) onSearch();
  };

  const totalGuests = (localFilters.adults || 2) + (localFilters.children || 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(event.target)) {
        setShowGuestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className="hero-search-bar py-3 mb-4"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        borderRadius: '0 0 20px 20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}
    >
      <Container style={{ maxWidth: '1200px' }}>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Row className="align-items-end g-2 justify-content-center">
            {/* Location */}
            <Col lg={3} md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="text-white small fw-semibold mb-2">
                  <FaMapMarkerAlt className="me-1" style={{ fontSize: '0.85rem' }} />
                  Địa điểm
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Đà Nẵng, Việt Nam"
                  value="Đà Nẵng, Việt Nam"
                  readOnly
                  style={{
                    borderRadius: '10px',
                    padding: '0.65rem 0.9rem',
                    border: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    height: '42px',
                    backgroundColor: '#f8f9fa',
                    color: '#495057'
                  }}
                />
              </Form.Group>
            </Col>

            {/* Check-in Date */}
            <Col lg={2} md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="text-white small fw-semibold mb-2">
                  <FaCalendarAlt className="me-1" style={{ fontSize: '0.85rem' }} />
                  Nhận phòng
                </Form.Label>
                <Form.Control
                  type="date"
                  value={localFilters.checkin || ''}
                  onChange={(e) => update('checkin', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    borderRadius: '10px',
                    padding: '0.65rem 0.9rem',
                    border: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    height: '42px'
                  }}
                />
              </Form.Group>
            </Col>

            {/* Check-out Date */}
            <Col lg={2} md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="text-white small fw-semibold mb-2">
                  <FaCalendarAlt className="me-1" style={{ fontSize: '0.85rem' }} />
                  Trả phòng
                </Form.Label>
                <Form.Control
                  type="date"
                  value={localFilters.checkout || ''}
                  onChange={(e) => update('checkout', e.target.value)}
                  min={localFilters.checkin || new Date().toISOString().split('T')[0]}
                  style={{
                    borderRadius: '10px',
                    padding: '0.65rem 0.9rem',
                    border: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    height: '42px'
                  }}
                />
              </Form.Group>
            </Col>

            {/* Guests */}
            <Col lg={3} md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="text-white small fw-semibold mb-2">
                  <FaUsers className="me-1" style={{ fontSize: '0.85rem' }} />
                  Số khách & phòng
                </Form.Label>
                <div ref={guestDropdownRef} style={{ position: 'relative' }}>
                  <div 
                    className="bg-white d-flex align-items-center justify-content-between"
                    style={{
                      borderRadius: '10px',
                      padding: '0.65rem 0.9rem',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      height: '42px'
                    }}
                    onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                  >
                    <div>
                      <strong>{totalGuests} khách</strong>
                      <span className="text-muted ms-2">· 1 phòng</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>▼</span>
                  </div>

                  {/* Guest Dropdown */}
                  {showGuestDropdown && (
                    <div
                      className="bg-white shadow-lg"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '0.5rem',
                        borderRadius: '12px',
                        padding: '1rem',
                        zIndex: 1000,
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    >
                      {/* Adults */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <div className="fw-semibold">Người lớn</div>
                          <small className="text-muted">Từ 13 tuổi trở lên</small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => update('adults', Math.max(1, (localFilters.adults || 2) - 1))}
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              padding: 0,
                              borderRadius: '8px',
                              fontSize: '1.2rem',
                              lineHeight: '1'
                            }}
                          >
                            −
                          </Button>
                          <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>
                            {localFilters.adults || 2}
                          </span>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => update('adults', Math.min(20, (localFilters.adults || 2) + 1))}
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              padding: 0,
                              borderRadius: '8px',
                              fontSize: '1.2rem',
                              lineHeight: '1'
                            }}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold">Trẻ em</div>
                          <small className="text-muted">Từ 0-12 tuổi</small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => update('children', Math.max(0, (localFilters.children || 0) - 1))}
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              padding: 0,
                              borderRadius: '8px',
                              fontSize: '1.2rem',
                              lineHeight: '1'
                            }}
                          >
                            −
                          </Button>
                          <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>
                            {localFilters.children || 0}
                          </span>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => update('children', Math.min(10, (localFilters.children || 0) + 1))}
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              padding: 0,
                              borderRadius: '8px',
                              fontSize: '1.2rem',
                              lineHeight: '1'
                            }}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Form.Group>
            </Col>

            {/* Search Button */}
            <Col lg={2}>
              <Form.Group className="mb-0">
                <Form.Label className="text-white small fw-semibold mb-2" style={{ opacity: 0 }}>
                  Search
                </Form.Label>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleSearch}
                    className="w-100"
                    style={{
                      background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.65rem 0.9rem',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      boxShadow: '0 4px 16px rgba(201, 162, 74, 0.4)',
                      height: '42px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FaSearch style={{ fontSize: '0.85rem' }} />
                    Tìm kiếm
                  </Button>
                </motion.div>
              </Form.Group>
            </Col>
          </Row>
        </motion.div>
      </Container>
    </div>
  );
}

