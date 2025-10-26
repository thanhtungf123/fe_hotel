import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import axios from '../../api/axiosInstance';

export default function FilterSidebar({ filters, onChange, onClear }) {
  const update = (k,v)=> onChange({ ...filters, [k]: v })

  // Map đúng các layout trong DB (bed_layouts.layout_name)
  const typeOptions = [
    '1 giường đơn','2 giường đơn','3 giường đơn',
    '1 giường đôi','1 giường đôi lớn','2 giường đôi',
    '1 giường đơn 1 giường đôi'
  ]
  const amenityOptions = ['WiFi miễn phí','Ban công','Tầm nhìn biển','Tầm nhìn thành phố','Bồn tắm jacuzzi','Minibar']

  // ---- Dịch vụ (fetch từ BE)
  const [svcLoading, setSvcLoading] = useState(false)
  const [svcErr, setSvcErr] = useState('')
  const [serviceOptions, setServiceOptions] = useState([]) // [{id,name,price}]
  // ---- Dịch vụ (fetch từ BE) part 2
  const fetchServices = async () => {
    setSvcLoading(true); setSvcErr("");
    try {
      let res;
      try {
        res = await axios.get("/admin/services", { timeout: 5000 });
      } catch (e) {
        const code = e?.response?.status ?? 0;
        if (code === 401 || code === 403 || code === 404 || code === 405 || code >= 500) {
          res = await axios.get("/services", { timeout: 5000 });
        } else { throw e; }
      }
      const data = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
      const mapped = data.map(s => ({
        id: s.id ?? s.service_id,
        name: s.nameService ?? s.service_name ?? s.serviceName ?? s.name,
        price: s.price
      })).filter(s => s.id != null && s.name);
      setServiceOptions(mapped);
    } catch (err) {
      setSvcErr(err?.response?.data?.message || err.message || "Failed to load services");
    } finally { setSvcLoading(false); }
  };

  useEffect(() => { fetchServices(); }, []);
  const formatVND = v => Number(v).toLocaleString('vi-VN') + '₫';
//==============================================================================================================================
  return (
    <div className="side-card">
      <Card className="card-soft mb-3">
        <Card.Body>
          <Card.Title className="h6">Thời gian lưu trú</Card.Title>
          <Form.Group className="mb-2">
            <Form.Label>Ngày nhận phòng</Form.Label>
            <Form.Control type="date" value={filters.checkin||''} onChange={e=>update('checkin', e.target.value)}/>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Ngày trả phòng</Form.Label>
            <Form.Control type="date" value={filters.checkout||''} onChange={e=>update('checkout', e.target.value)}/>
          </Form.Group>
          <Form.Group>
            <Form.Label>Số khách</Form.Label>
            <Form.Control type="number" min={1} value={filters.guests||2} onChange={e=>update('guests', Number(e.target.value))}/>
          </Form.Group>
        </Card.Body>
      </Card>

      <Card className="card-soft mb-3">
        <Card.Body>
          <Card.Title className="h6">Khoảng giá</Card.Title>
          <Form.Range min={1000} max={10000000} step={100000}
            value={filters.priceMax}
            onChange={e=>update('priceMax', Number(e.target.value))}
          />
          <div className="d-flex justify-content-between text-muted small">
            <div>{(1000).toLocaleString('vi-VN')}₫</div>
            <div>{(filters.priceMax).toLocaleString('vi-VN')}₫</div>
          </div>
        </Card.Body>
      </Card>

      <Card className="card-soft mb-3">
        <Card.Body>
          <Card.Title className="h6">Loại giường</Card.Title>
          {typeOptions.map(t=>(
            <Form.Check key={t} type="checkbox" className="mb-2"
              label={`Giường: ${t}`} checked={filters.types?.includes(t)||false}
              onChange={e=>{
                const set = new Set(filters.types||[])
                e.target.checked ? set.add(t) : set.delete(t)
                update('types', Array.from(set))
              }}
            />
          ))}
        </Card.Body>
      </Card>

      <Card className="card-soft mb-3">
        <Card.Body>
          <Card.Title className="h6">Tiện nghi</Card.Title>
          {amenityOptions.map(a=>(
            <Form.Check key={a} type="checkbox" className="mb-2"
              label={a} checked={filters.amenities?.includes(a)||false}
              onChange={e=>{
                const set = new Set(filters.amenities||[])
                e.target.checked ? set.add(a) : set.delete(a)
                update('amenities', Array.from(set))
              }}
            />
          ))}
        </Card.Body>
      </Card>

       {/* ---- Dịch vụ ---- */}
      <Card className="card-soft mb-3">
        <Card.Body>
          <Card.Title className="h6">Dịch vụ</Card.Title>

          {svcLoading ? (
            <div className="py-2 text-center">
              <Spinner animation="border" size="sm" /> Đang tải…
            </div>
          ) : svcErr ? (
            <Alert variant="danger" className="mb-2">{svcErr}</Alert>
          ) : serviceOptions.length === 0 ? (
            <div className="text-muted small">Không có dịch vụ</div>
          ) : (
            serviceOptions.map(s => (
              <Form.Check
                key={s.id}
                type="checkbox"
                className="mb-2"
                label={`${s.name} — ${formatVND(s.price)}`}
                checked={(filters.serviceIds || []).includes(s.id)}
                onChange={e => {
                  const set = new Set(filters.serviceIds || []);
                  e.target.checked ? set.add(s.id) : set.delete(s.id);
                  update('serviceIds', Array.from(set));
                }}
              />
            ))
          )}
        </Card.Body>
      </Card>
      
      <Card className="card-soft mb-3">
        <Card.Body>
          <Card.Title className="h6">Trạng thái phòng</Card.Title>
          {['available', 'occupied', 'maintenance'].map(s=>(
            <Form.Check key={s} type="checkbox" className="mb-2"
              label={s === 'available' ? '✅ Còn trống' : s === 'occupied' ? '🔒 Đã đặt' : '🔧 Bảo trì'}
              checked={filters.status?.includes(s)||false}
              onChange={e=>{
                const set = new Set(filters.status||[])
                e.target.checked ? set.add(s) : set.delete(s)
                update('status', Array.from(set))
              }}
            />
          ))}
          <div className="d-grid mt-3"><Button variant="light" className="border" onClick={onClear}>Xóa bộ lọc</Button></div>
        </Card.Body>
      </Card>
    </div>
  )
}
