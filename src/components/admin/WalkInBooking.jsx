import React, { useState, useEffect } from "react";
import { Row, Col, Form, Button, Alert, Card, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import axios from "../../api/axiosInstance";
import showToast from "../../utils/toast";
import "react-lazy-load-image-component/src/effects/blur.css";

export default function WalkInBooking() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const [form, setForm] = useState({
    roomId: "",
    checkIn: "",
    checkOut: "",
    fullName: "",
    phoneNumber: "",
    nationalIdNumber: "",
    gender: "male",
  });

  useEffect(() => {
    loadRooms();
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoadingServices(true);
    try {
      const { data } = await axios.get("/services");
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load services:", err);
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    if (form.roomId) {
      loadRoomBookings(form.roomId);
    } else {
      setBookings([]);
    }
  }, [form.roomId]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/rooms/admin/all");
      const available = (data || []).filter((r) => r.status === "available");
      setRooms(available);
      setError("");
    } catch (err) {
      setError("Không thể tải danh sách phòng: " + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadRoomBookings = async (roomId) => {
    try {
      const { data } = await axios.get(`/staff/bookings/room/${roomId}/schedule`);
      setBookings(data.items || []);
    } catch (err) {
      console.error("Failed to load room bookings:", err);
      setBookings([]);
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const validateForm = () => {
    if (!form.roomId) return "Vui lòng chọn phòng";
    if (!form.checkIn || !form.checkOut) return "Vui lòng nhập ngày check-in và check-out";
    if (new Date(form.checkIn) >= new Date(form.checkOut)) {
      return "Ngày check-out phải sau ngày check-in";
    }
    if (!form.fullName) return "Vui lòng nhập tên khách hàng";
    if (!form.phoneNumber) return "Vui lòng nhập số điện thoại";
    if (!form.nationalIdNumber) return "Vui lòng nhập số CMND/CCCD";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validateForm();
    if (msg) {
      showToast.error(msg);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...form,
        serviceIds: selectedServiceIds.length > 0 ? selectedServiceIds : null
      };
      const { data } = await axios.post("/staff/bookings/walk-in", payload);
      showToast.success(`Booking #${data.bookingId} thành công! Phòng đã được block.`);
      // Reset form
      setForm({
        roomId: "",
        checkIn: "",
        checkOut: "",
        fullName: "",
        phoneNumber: "",
        nationalIdNumber: "",
        gender: "male",
      });
      setSelectedServiceIds([]);
      await loadRooms(); // Refresh room list
      if (form.roomId) {
        await loadRoomBookings(form.roomId); // Refresh bookings
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setError(msg);
      showToast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRoom = rooms.find((r) => r.id === parseInt(form.roomId));
  const nights = form.checkIn && form.checkOut
    ? Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / (1000 * 60 * 60 * 24))
    : 0;
  const pricePerNight = selectedRoom?.priceVnd || selectedRoom?.pricePerNight || 0;
  const roomTotal = selectedRoom && nights > 0 ? pricePerNight * nights : 0;
  
  // Calculate services total
  const servicesTotal = selectedServiceIds.reduce((sum, serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return sum + (service ? (service.price || 0) : 0);
  }, 0);
  
  // Total = room + services
  const totalPrice = roomTotal + servicesTotal;

  const toggleService = (serviceId) => {
    setSelectedServiceIds(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <h5 className="mb-4">🏨 Đặt phòng trực tiếp (Walk-in)</h5>

          {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              {/* Chọn phòng */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label><strong>Chọn phòng <span className="text-danger">*</span></strong></Form.Label>
                  <Form.Select
                    value={form.roomId}
                    onChange={(e) => handleChange("roomId", e.target.value)}
                    required
                    disabled={loading}
                    size="lg"
                  >
                    <option value="">-- Chọn phòng --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name || r.roomName || r.roomNumber}
                      </option>
                    ))}
                  </Form.Select>
                  {rooms.length === 0 && !loading && (
                    <Form.Text className="text-danger">Không có phòng available</Form.Text>
                  )}
                </Form.Group>
              </Col>

              {/* Hiển thị thông tin chi tiết phòng */}
              {selectedRoom && (
                <Col md={12}>
                  <Card className="border-primary">
                    <Row className="g-0">
                      <Col md={4}>
                        <LazyLoadImage
                          src={selectedRoom.imageUrl || "/assets/placeholder-room.jpg"}
                          alt={selectedRoom.name || selectedRoom.roomName}
                          effect="blur"
                          className="w-100"
                          style={{
                            height: "100%",
                            minHeight: "200px",
                            objectFit: "cover",
                            borderRadius: "8px 0 0 8px"
                          }}
                        />
                      </Col>
                      <Col md={8}>
                        <Card.Body>
                          <h4 className="mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
                            {selectedRoom.name || selectedRoom.roomName || selectedRoom.roomNumber}
                          </h4>
                          
                          <div className="mb-2">
                            <Badge bg="info" className="me-2">
                              👥 {selectedRoom.capacity || 2} khách
                            </Badge>
                            <Badge bg="secondary" className="me-2">
                              🛏️ {selectedRoom.type || "Standard"}
                            </Badge>
                            <Badge bg="warning">
                              💰 {pricePerNight.toLocaleString()}₫/đêm
                            </Badge>
                          </div>

                          {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                            <div className="mb-2">
                              <strong>Tiện ích:</strong>
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                {(Array.isArray(selectedRoom.amenities) ? selectedRoom.amenities : selectedRoom.amenities.split(",")).slice(0, 5).map((a, i) => (
                                  <Badge key={i} bg="light" text="dark" className="border">
                                    {a.trim()}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </Card.Body>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              )}

              {/* Hiển thị lịch block nếu có bookings */}
              {selectedRoom && bookings.length > 0 && (
                <Col md={12}>
                  <Alert variant="warning">
                    <strong>⚠️ Lịch đã block:</strong>
                    <div className="mt-2">
                      {bookings.map((b, idx) => (
                        <Badge key={idx} bg="danger" className="me-2 mb-2" style={{ fontSize: "0.85rem", padding: "0.5rem" }}>
                          Booking #{b.bookingId}: {new Date(b.checkIn).toLocaleDateString('vi-VN')} → {new Date(b.checkOut).toLocaleDateString('vi-VN')} ({b.status})
                        </Badge>
                      ))}
                    </div>
                  </Alert>
                </Col>
              )}

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Check-in <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    value={form.checkIn}
                    onChange={(e) => handleChange("checkIn", e.target.value)}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    size="lg"
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Check-out <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    value={form.checkOut}
                    onChange={(e) => handleChange("checkOut", e.target.value)}
                    required
                    min={form.checkIn || new Date().toISOString().split("T")[0]}
                    size="lg"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                {selectedRoom && nights > 0 && (
                  <div className="d-flex align-items-end h-100">
                    <div className="w-100">
                      <Form.Label className="text-muted">Tổng tiền</Form.Label>
                      <div className="fs-4 fw-bold text-success" style={{ color: "var(--primary-gold)" }}>
                        {totalPrice.toLocaleString()}₫
                        <Badge bg="secondary" className="ms-2">
                          {nights} đêm
                        </Badge>
                      </div>
                      {selectedServiceIds.length > 0 && (
                        <div className="small text-muted mt-1">
                          (Phòng: {roomTotal.toLocaleString()}₫ + Dịch vụ: {servicesTotal.toLocaleString()}₫)
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Col>

              <Col md={12}>
                <hr />
                <h6 className="mb-3">✨ Dịch vụ bổ sung</h6>
                {loadingServices ? (
                  <div className="text-center py-2">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="small text-muted mt-2">Đang tải dịch vụ...</div>
                  </div>
                ) : services.length > 0 ? (
                  <div className="d-flex flex-column gap-2 mb-3">
                    {services.map((service) => (
                      <Card
                        key={service.id}
                        className={`cursor-pointer ${selectedServiceIds.includes(service.id) ? 'border-primary' : ''}`}
                        onClick={() => toggleService(service.id)}
                        style={{
                          cursor: 'pointer',
                          borderWidth: '2px',
                          borderColor: selectedServiceIds.includes(service.id) ? 'var(--primary-gold)' : 'rgba(0,0,0,0.1)'
                        }}
                      >
                        <Card.Body className="d-flex align-items-center gap-3 py-2">
                          <Form.Check
                            type="checkbox"
                            checked={selectedServiceIds.includes(service.id)}
                            onChange={() => toggleService(service.id)}
                            style={{ transform: 'scale(1.2)' }}
                          />
                          <div className="flex-grow-1">
                            <div className="fw-semibold">{service.nameService || service.name || 'Dịch vụ'}</div>
                            {service.description && (
                              <div className="small text-muted">{service.description}</div>
                            )}
                          </div>
                          <div className="fw-bold" style={{ color: 'var(--primary-gold)' }}>
                            {((service.price || 0)).toLocaleString('vi-VN')}₫
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted small mb-3">Không có dịch vụ nào hiện có.</div>
                )}
              </Col>

              <Col md={12}>
                <hr />
                <h6 className="mb-3">Thông tin khách hàng</h6>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Họ tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={form.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Giới tính <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={form.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    required
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={form.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>CMND/CCCD <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={form.nationalIdNumber}
                    onChange={(e) => handleChange("nationalIdNumber", e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12} className="text-end mt-3">
                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  disabled={submitting || loading}
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận & Block phòng"}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </motion.div>
  );
}

