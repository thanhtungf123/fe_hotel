import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import axios from "../../api/axiosInstance";

export default function RoomFormModal({ show, onHide, onSuccess, room, bedLayouts }) {
  const isEditing = !!room;

  const [formData, setFormData] = useState({
    roomNumber: "",
    roomName: "",
    pricePerNight: "",
    description: "",
    amenities: "",
    status: "available",
    capacity: "2",
    bedLayoutId: "",
    imageUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load room data when editing
  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber || "",
        roomName: room.name || "",
        pricePerNight: room.price || "",
        description: room.description || "",
        amenities: Array.isArray(room.amenities) ? room.amenities.join(", ") : (room.amenities || ""),
        status: room.status || "available",
        capacity: room.capacity || "2",
        bedLayoutId: room.bedLayoutId || "",
        imageUrl: room.image || room.imageUrl || "",
      });
    } else {
      // Reset form for creating new room
      setFormData({
        roomNumber: "",
        roomName: "",
        pricePerNight: "",
        description: "",
        amenities: "",
        status: "available",
        capacity: "2",
        bedLayoutId: "",
        imageUrl: "",
      });
    }
    setError("");
  }, [room, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.roomNumber.trim()) {
      setError("Vui lòng nhập số phòng");
      return;
    }
    if (!formData.roomName.trim()) {
      setError("Vui lòng nhập tên phòng");
      return;
    }
    if (!formData.pricePerNight || formData.pricePerNight <= 0) {
      setError("Vui lòng nhập giá hợp lệ");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        roomNumber: formData.roomNumber.trim(),
        roomName: formData.roomName.trim(),
        pricePerNight: parseInt(formData.pricePerNight),
        description: formData.description.trim(),
        amenities: formData.amenities.trim(), // Backend expects string or JSON array string
        status: formData.status,
        capacity: parseInt(formData.capacity),
        bedLayoutId: formData.bedLayoutId ? parseInt(formData.bedLayoutId) : null,
        imageUrl: formData.imageUrl.trim(),
      };

      if (isEditing) {
        await axios.put(`/rooms/${room.id}`, payload);
        alert("Cập nhật phòng thành công!");
      } else {
        await axios.post("/rooms", payload);
        alert("Tạo phòng mới thành công!");
      }

      onSuccess();
    } catch (err) {
      console.error("Form submit error:", err);
      const msg = err?.response?.data?.message || err?.response?.data || err.message || "Có lỗi xảy ra";
      // Convert to string if object
      const errorMsg = typeof msg === 'object' ? JSON.stringify(msg) : String(msg);
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? "Chỉnh sửa phòng" : "Thêm phòng mới"}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Số phòng <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  placeholder="VD: 101, 102A..."
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Tên phòng <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleChange}
                  placeholder="VD: Phòng Deluxe..."
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Giá mỗi đêm (VNĐ) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="pricePerNight"
                  value={formData.pricePerNight}
                  onChange={handleChange}
                  placeholder="1000000"
                  min="0"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Sức chứa (người)</Form.Label>
                <Form.Control
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  max="10"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select name="status" value={formData.status} onChange={handleChange}>
                  <option value="available">Còn trống</option>
                  <option value="occupied">Đã đặt</option>
                  <option value="maintenance">Bảo trì</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Loại giường</Form.Label>
            <Form.Select name="bedLayoutId" value={formData.bedLayoutId} onChange={handleChange}>
              <option value="">-- Chọn loại giường --</option>
              {bedLayouts.map((layout) => (
                <option key={layout.id} value={layout.id}>
                  {layout.layoutName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>URL ảnh chính</Form.Label>
            <Form.Control
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/room.jpg"
            />
            <Form.Text className="text-muted">
              Nhập URL ảnh đại diện của phòng
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tiện nghi</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="VD: Wifi miễn phí, Điều hòa, TV, Minibar..."
            />
            <Form.Text className="text-muted">
              Các tiện nghi cách nhau bởi dấu phẩy
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả chi tiết về phòng..."
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={submitting}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Đang xử lý...
              </>
            ) : isEditing ? (
              "Cập nhật"
            ) : (
              "Tạo mới"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

