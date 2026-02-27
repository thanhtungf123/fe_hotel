// Enhanced FilterSidebar - Professional Filtering UI
import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Badge, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from '../../api/axiosInstance';
import showToast from '../../utils/toast';

function FilterSidebar({ filters, onChange, onClear }) {
  const update = (k, v) => onChange({ ...filters, [k]: v });

  const amenityOptions = [
    'Chỗ đỗ xe',
    'Nhà hàng',
    'Dịch vụ phòng',
    'Lễ tân 24 giờ',
    'Trung tâm thể dục',
    'Phòng không hút thuốc',
    'Xe đưa đón sân bay',
    'Trung tâm Spa & chăm sóc sức khoẻ',
    'Bồn tắm nóng/bể sục (Jacuzzi)',
    'WiFi miễn phí',
    'Trạm sạc xe điện',
    'Lối vào cho người đi xe lăn',
    'Ban công',
    'Tầm nhìn biển',
    'Tầm nhìn thành phố',
    'Bồn tắm jacuzzi',
    'Minibar',
    'Điều hòa',
    'TV',
    'Phòng tắm riêng',
    'Bàn làm việc',
    'Tủ lạnh',
    'Máy pha cà phê',
    'Két an toàn',
    'Điện thoại',
    'Hệ thống âm thanh',
    'Dịch vụ phòng 24/7',
    'Vòi sen massage',
    'Bồn tắm'
  ];

  // Services
  const [svcLoading, setSvcLoading] = useState(false);
  const [serviceOptions, setServiceOptions] = useState([]);

  // Amenity counts
  const [amenityCounts, setAmenityCounts] = useState({});
  const [loadingAmenityCounts, setLoadingAmenityCounts] = useState(false);

  const fetchAmenityCounts = async () => {
    setLoadingAmenityCounts(true);
    try {
      const { data } = await axios.get('/rooms/amenities/counts');
      setAmenityCounts(data || {});
    } catch (err) {
      console.error('Failed to load amenity counts:', err);
    } finally {
      setLoadingAmenityCounts(false);
    }
  };

  const fetchServices = async () => {
    setSvcLoading(true);
    try {
      let res;
      try {
        res = await axios.get("/admin/services", { timeout: 5000 });
      } catch (e) {
        const code = e?.response?.status ?? 0;
        if (code === 401 || code === 403 || code === 404 || code === 405 || code >= 500) {
          res = await axios.get("/services", { timeout: 5000 });
        } else {
          throw e;
        }
      }
      const data = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
      const mapped = data.map(s => ({
        id: s.id ?? s.service_id,
        name: s.nameService ?? s.service_name ?? s.serviceName ?? s.name,
        price: s.price
      })).filter(s => s.id != null && s.name);
      setServiceOptions(mapped);
    } catch (err) {
      console.error('Failed to load services:', err);
      showToast.error('Không thể tải dịch vụ');
    } finally {
      setSvcLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchAmenityCounts();
  }, []);

  const formatVND = v => Number(v).toLocaleString('vi-VN') + '₫';

  // Count active filters
  const activeFiltersCount = 
    (filters.amenities?.length || 0) + 
    (filters.status?.length || 0) +
    (filters.serviceIds?.length || 0);

  return (
    <>
      <style>{`
        .filter-sidebar .card-soft:hover .map-hover-overlay {
          background: rgba(201, 162, 74, 0.15) !important;
        }
        .filter-sidebar .card-soft:hover .map-view-button {
          opacity: 1 !important;
          transform: scale(1) !important;
        }
      `}</style>
      
      <div className="filter-sidebar">
      {/* Map Preview Card - Aurora Palace Hotel Location */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="card-soft mb-3" style={{ overflow: 'hidden' }}>
          <div 
            className="position-relative"
            style={{
              height: '200px',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
            onClick={() => window.open('https://maps.app.goo.gl/PPc49A4hQBpxCSCw6', '_blank')}
          >
            {/* OpenStreetMap iframe */}
            <iframe
              width="100%"
              height="200"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              src="https://www.openstreetmap.org/export/embed.html?bbox=108.1922%2C16.0444%2C108.2122%2C16.0644&layer=mapnik&marker=16.0544%2C108.2022"
              style={{
                border: 'none',
                pointerEvents: 'none'
              }}
              title="Aurora Palace Hotel Location"
            />
            
            {/* Overlay với thông tin */}
            <div 
              className="position-absolute bottom-0 start-0 end-0 p-3"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
                pointerEvents: 'none'
              }}
            >
              <div className="text-white">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <div style={{ fontSize: '1.2rem' }}>📍</div>
                  <div className="fw-bold">Aurora Palace Hotel</div>
                </div>
                <small className="opacity-90">Đà Nẵng, Việt Nam</small>
              </div>
            </div>
            
            {/* Hover overlay với button */}
            <div 
              className="map-hover-overlay position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center"
              style={{
                background: 'transparent',
                transition: 'all 0.3s ease',
                pointerEvents: 'auto'
              }}
            >
              <Button
                variant="light"
                size="sm"
                className="map-view-button"
                style={{
                  borderRadius: '20px',
                  padding: '0.5rem 1.2rem',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  background: 'white',
                  border: 'none',
                  opacity: 0,
                  transform: 'scale(0.9)',
                  transition: 'all 0.3s ease'
                }}
              >
                🗺️ Xem bản đồ lớn
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Header với active filters count */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>
          Bộ lọc tìm kiếm
        </h5>
        {activeFiltersCount > 0 && (
          <Badge 
            pill
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
              border: 'none',
              color: 'white'
            }}
          >
            {activeFiltersCount}
          </Badge>
        )}
      </div>

      {/* Khoảng giá */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="card-soft mb-3">
          <Card.Body>
            <Card.Title className="h6 mb-3 d-flex align-items-center gap-2">
              Khoảng giá mỗi đêm
            </Card.Title>
            <div className="mb-2">
              <input
                type="range"
                className="form-range"
                min={0}
                max={10000000}
                step={100000}
                value={filters.priceMax}
                onChange={e => update('priceMax', Number(e.target.value))}
                style={{
                  accentColor: '#C9A24A'
                }}
              />
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <Badge style={{ background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)', border: 'none', color: 'white', fontWeight: '600' }}>
                0₫
              </Badge>
              <Badge style={{ background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)', border: 'none', color: 'white', fontWeight: '600' }}>
                {(filters.priceMax).toLocaleString('vi-VN')}₫
              </Badge>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Tiện nghi */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="card-soft mb-3">
          <Card.Body>
            <Card.Title className="h6 mb-3 d-flex align-items-center gap-2">
              Tiện nghi phòng
            </Card.Title>
            {loadingAmenityCounts ? (
              <div className="text-center py-2 text-muted small">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : (
              amenityOptions.map(a => {
                const count = amenityCounts[a] || 0;
                return (
                  <Form.Check 
                    key={a} 
                    type="checkbox" 
                    className="mb-2"
                    label={
                      <div className="d-flex justify-content-between align-items-center w-100">
                        <span>{a}</span>
                        <Badge bg="light" text="dark" className="ms-2" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                          {count}
                        </Badge>
                      </div>
                    }
                    checked={filters.amenities?.includes(a) || false}
                    onChange={e => {
                      const set = new Set(filters.amenities || []);
                      e.target.checked ? set.add(a) : set.delete(a);
                      update('amenities', Array.from(set));
                    }}
                    style={{ fontSize: '0.9rem' }}
                  />
                );
              })
            )}
          </Card.Body>
        </Card>
      </motion.div>

      {/* Dịch vụ */}
      {serviceOptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="card-soft mb-3">
            <Card.Body>
              <Card.Title className="h6 mb-3 d-flex align-items-center gap-2">
                Dịch vụ khách sạn
              </Card.Title>
              {svcLoading ? (
                <div className="text-center py-2 text-muted small">
                  <div className="spinner-luxury mx-auto" style={{ width: '30px', height: '30px' }} />
                </div>
              ) : (
                serviceOptions.map(s => (
                  <Form.Check
                    key={s.id}
                    type="checkbox"
                    className="mb-2"
                    label={
                      <div className="d-flex justify-content-between align-items-center">
                        <span>{s.name}</span>
                        <small className="text-muted">{formatVND(s.price)}</small>
                      </div>
                    }
                    checked={(filters.serviceIds || []).includes(s.id)}
                    onChange={e => {
                      const set = new Set(filters.serviceIds || []);
                      e.target.checked ? set.add(s.id) : set.delete(s.id);
                      update('serviceIds', Array.from(set));
                    }}
                    style={{ fontSize: '0.9rem' }}
                  />
                ))
              )}
            </Card.Body>
          </Card>
        </motion.div>
      )}

      {/* Trạng thái phòng */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="card-soft mb-3">
          <Card.Body>
            <Card.Title className="h6 mb-3 d-flex align-items-center gap-2">
              🔍 Trạng thái phòng
            </Card.Title>
            {[
              { value: 'available', label: '✅ Còn trống', color: 'success' },
              { value: 'occupied', label: '🔒 Đã đặt', color: 'warning' },
              { value: 'maintenance', label: '🔧 Bảo trì', color: 'secondary' }
            ].map(({ value, label }) => (
              <Form.Check 
                key={value} 
                type="checkbox" 
                className="mb-2"
                label={label}
                checked={filters.status?.includes(value) || false}
                onChange={e => {
                  const set = new Set(filters.status || []);
                  e.target.checked ? set.add(value) : set.delete(value);
                  update('status', Array.from(set));
                }}
                style={{ fontSize: '0.9rem' }}
              />
            ))}
          </Card.Body>
        </Card>
      </motion.div> */}

      {/* Clear Filters Button */}
      {activeFiltersCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            className="w-100"
            onClick={onClear}
            style={{ 
              borderRadius: '10px',
              fontWeight: '600',
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
              border: 'none',
              color: 'white',
              boxShadow: '0 4px 12px rgba(201, 162, 74, 0.3)'
            }}
          >
            Xóa tất cả bộ lọc ({activeFiltersCount})
          </Button>
        </motion.div>
      )}
    </div>
    </>
  );
}

export default FilterSidebar;
