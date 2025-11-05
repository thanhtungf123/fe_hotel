// Enhanced FilterSidebar - Professional Filtering UI
import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from '../../api/axiosInstance';
import showToast from '../../utils/toast';

export default function FilterSidebar({ filters, onChange, onClear }) {
  const update = (k, v) => onChange({ ...filters, [k]: v });

  // Map đúng các layout trong DB
  const typeOptions = [
    '1 giường đơn', '2 giường đơn', '3 giường đơn',
    '1 giường đôi', '1 giường đôi lớn', '2 giường đôi',
    '1 giường đơn 1 giường đôi'
  ];
  
  const amenityOptions = [
    'WiFi miễn phí', 'Ban công', 'Tầm nhìn biển', 
    'Tầm nhìn thành phố', 'Bồn tắm jacuzzi', 'Minibar'
  ];

  // Services
  const [svcLoading, setSvcLoading] = useState(false);
  const [serviceOptions, setServiceOptions] = useState([]);

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
  }, []);

  const formatVND = v => Number(v).toLocaleString('vi-VN') + '₫';

  // Count active filters
  const activeFiltersCount = 
    (filters.types?.length || 0) + 
    (filters.amenities?.length || 0) + 
    (filters.status?.length || 0) +
    (filters.serviceIds?.length || 0);

  return (
    <div className="filter-sidebar">
      {/* Header với active filters count */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>
          Bộ lọc
        </h5>
        {activeFiltersCount > 0 && (
          <Badge bg="primary" pill>
            {activeFiltersCount}
          </Badge>
        )}
      </div>

      {/* Thời gian lưu trú */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="card-soft mb-3">
          <Card.Body>
            <Card.Title className="h6 mb-3 d-flex align-items-center gap-2">
              📅 Thời gian lưu trú
            </Card.Title>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-muted">Ngày nhận phòng</Form.Label>
              <Form.Control 
                type="date" 
                value={filters.checkin || ''} 
                onChange={e => update('checkin', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ borderRadius: '8px' }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-muted">Ngày trả phòng</Form.Label>
              <Form.Control 
                type="date" 
                value={filters.checkout || ''} 
                onChange={e => update('checkout', e.target.value)}
                min={filters.checkin || new Date().toISOString().split('T')[0]}
                style={{ borderRadius: '8px' }}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="small fw-semibold text-muted">Số khách</Form.Label>
              <Form.Select
                value={filters.guests || 2}
                onChange={e => update('guests', Number(e.target.value))}
                style={{ borderRadius: '8px' }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'khách' : 'khách'}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Khoảng giá */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="card-soft mb-3">
          <Card.Body>
            <Card.Title className="h6 mb-3 d-flex align-items-center gap-2">
              💰 Khoảng giá
            </Card.Title>
            <div className="mb-2">
              <input
                type="range"
                className="form-range"
                min={1000}
                max={10000000}
                step={100000}
                value={filters.priceMax}
                onChange={e => update('priceMax', Number(e.target.value))}
                style={{
                  accentColor: 'var(--primary-gold)'
                }}
              />
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <Badge bg="light" text="dark" className="border">
                {(1000).toLocaleString('vi-VN')}₫
              </Badge>
              <Badge bg="primary" style={{ background: 'var(--primary-gold)', border: 'none' }}>
                {(filters.priceMax).toLocaleString('vi-VN')}₫
              </Badge>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Loại giường */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="card-soft mb-3">
          <Card.Body>
            <Card.Title className="h6 mb-3 d-flex align-items-center gap-2">
              🛏️ Loại giường
            </Card.Title>
            {typeOptions.map((t, idx) => (
              <Form.Check 
                key={t} 
                type="checkbox" 
                className="mb-2"
                label={t}
                checked={filters.types?.includes(t) || false}
                onChange={e => {
                  const set = new Set(filters.types || []);
                  e.target.checked ? set.add(t) : set.delete(t);
                  update('types', Array.from(set));
                }}
                style={{ fontSize: '0.9rem' }}
              />
            ))}
          </Card.Body>
        </Card>
      </motion.div>

      {/* Tiện nghi */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="card-soft mb-3">
          <Card.Body>
            <Card.Title className="h6 mb-3 d-flex align-items-center gap-2">
              ✨ Tiện nghi
            </Card.Title>
            {amenityOptions.map(a => (
              <Form.Check 
                key={a} 
                type="checkbox" 
                className="mb-2"
                label={a}
                checked={filters.amenities?.includes(a) || false}
                onChange={e => {
                  const set = new Set(filters.amenities || []);
                  e.target.checked ? set.add(a) : set.delete(a);
                  update('amenities', Array.from(set));
                }}
                style={{ fontSize: '0.9rem' }}
              />
            ))}
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
                🛎️ Dịch vụ
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
            variant="outline-danger" 
            className="w-100"
            onClick={onClear}
            style={{ 
              borderRadius: '10px',
              fontWeight: '500',
              padding: '0.75rem'
            }}
          >
            🗑️ Xóa tất cả bộ lọc ({activeFiltersCount})
          </Button>
        </motion.div>
      )}
    </div>
  );
}
