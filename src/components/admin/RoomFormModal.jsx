import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import axios from "../../api/axiosInstance";
import { uploadRoomImage, validateImageFile } from "../../api/upload";
import showToast from "../../utils/toast";

// Danh sách tiện nghi có sẵn
const AVAILABLE_AMENITIES = [
  "WiFi miễn phí",
  "Điều hòa",
  "TV",
  "Minibar",
  "Ban công",
  "Tầm nhìn biển",
  "Tầm nhìn thành phố",
  "Bồn tắm jacuzzi",
  "Phòng tắm riêng",
  "Bàn làm việc",
  "Tủ lạnh",
  "Máy pha cà phê",
  "Két an toàn",
  "Điện thoại",
  "Hệ thống âm thanh",
  "Dịch vụ phòng 24/7",
  "Vòi sen massage",
  "Bồn tắm",
];

export default function RoomFormModal({ show, onHide, onSuccess, room }) {
  const isEditing = !!room;

  const [formData, setFormData] = useState({
    roomNumber: "",
    roomName: "",
    pricePerNight: "",
    description: "",
    amenities: [], // Changed to array
    status: "available",
    capacity: "2",
    imageUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load room data when editing
  useEffect(() => {
    if (room) {
      const imageUrl = room.image || room.imageUrl || "";
      // Parse amenities: có thể là array hoặc string
      let amenitiesArray = [];
      if (Array.isArray(room.amenities)) {
        amenitiesArray = room.amenities;
      } else if (typeof room.amenities === 'string' && room.amenities.trim()) {
        // Parse từ string "item1, item2" hoặc "item1; item2"
        amenitiesArray = room.amenities.split(/[,;]/).map(s => s.trim()).filter(Boolean);
      }
      
      setFormData({
        roomNumber: room.roomNumber || "",
        roomName: room.name || "",
        pricePerNight: room.price || "",
        description: room.description || "",
        amenities: amenitiesArray,
        status: room.status || "available",
        capacity: room.capacity || "2",
        imageUrl: imageUrl,
      });
      setImagePreview(imageUrl);
    } else {
      // Reset form for creating new room
      setFormData({
        roomNumber: "",
        roomName: "",
        pricePerNight: "",
        description: "",
        amenities: [],
        status: "available",
        capacity: "2",
        imageUrl: "",
      });
      setImagePreview("");
    }
    setError("");
    setShowSuccessModal(false);
    setSuccessMessage("");
    setShowErrorModal(false);
    setErrorMessage("");
    
    // Cleanup preview URL on unmount
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [room, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => {
      const currentAmenities = prev.amenities || [];
      const isSelected = currentAmenities.includes(amenity);
      return {
        ...prev,
        amenities: isSelected
          ? currentAmenities.filter(a => a !== amenity)
          : [...currentAmenities, amenity]
      };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      showToast.error(validation.error);
      e.target.value = ""; // Reset input
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Upload to Cloudinary
      const result = await uploadRoomImage(file);
      const cloudinaryUrl = result.url;

      // Update form data with Cloudinary URL
      setFormData(prev => ({ ...prev, imageUrl: cloudinaryUrl }));
      showToast.success("Upload ảnh thành công!");
    } catch (err) {
      console.error("Upload error:", err);
      const errorMsg = err.message || "Upload ảnh thất bại";
      setError(errorMsg);
      showToast.error(errorMsg);
      setImagePreview("");
      setFormData(prev => ({ ...prev, imageUrl: "" }));
    } finally {
      setUploadingImage(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setFormData(prev => ({ ...prev, imageUrl: "" }));
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
    if (!formData.imageUrl.trim()) {
      setError("Vui lòng upload ảnh phòng");
      return;
    }

    setSubmitting(true);

    try {
      // Convert amenities array to comma-separated string
      const amenitiesString = Array.isArray(formData.amenities) 
        ? formData.amenities.join(", ")
        : (formData.amenities || "");

      const payload = {
        roomNumber: formData.roomNumber.trim(),
        roomName: formData.roomName.trim(),
        pricePerNight: parseInt(formData.pricePerNight),
        description: formData.description.trim(),
        amenities: amenitiesString,
        status: formData.status,
        capacity: parseInt(formData.capacity),
        imageUrl: formData.imageUrl.trim(),
      };

      if (isEditing) {
        await axios.put(`/rooms/${room.id}`, payload);
        setSuccessMessage(`Phòng "${formData.roomName}" đã được cập nhật thành công!`);
      } else {
        await axios.post("/rooms", payload);
        setSuccessMessage(`Phòng "${formData.roomName}" đã được tạo mới thành công!`);
      }

      // Refresh danh sách ngay lập tức
      onSuccess();
      
      // Đóng form modal và hiển thị success modal
      onHide();
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Form submit error:", err);
      console.error("Error response:", err?.response);
      
      // Try to extract meaningful error message from Spring Boot response
      let errorMsg = "Có lỗi xảy ra khi tạo/cập nhật phòng";
      
      // Spring Boot error response format: { timestamp, status, error, message, path }
      if (err?.response?.data) {
        const data = err.response.data;
        
        // Priority 1: Direct message field (Spring Boot exception message)
        if (data.message && typeof data.message === 'string') {
          errorMsg = data.message;
        }
        // Priority 2: If data is a string directly
        else if (typeof data === 'string') {
          errorMsg = data;
        }
        // Priority 3: Error field with fallback
        else if (data.error) {
          errorMsg = data.message || data.error || 'Vui lòng kiểm tra lại thông tin';
        }
        // Priority 4: Status text
        else if (err?.response?.statusText) {
          errorMsg = err.response.statusText;
        }
      } 
      // Fallback to error message
      else if (err.message) {
        errorMsg = err.message;
      }
      
      // Translate common error messages to Vietnamese if needed
      if (errorMsg.includes("Room number already exists") || errorMsg.includes("already exists")) {
        errorMsg = `Số phòng "${formData.roomNumber}" đã tồn tại. Vui lòng chọn số phòng khác.`;
      } else if (errorMsg.includes("Room number is required")) {
        errorMsg = "Vui lòng nhập số phòng";
      } else if (errorMsg.includes("Room name is required")) {
        errorMsg = "Vui lòng nhập tên phòng";
      } else if (errorMsg.includes("Valid price is required") || errorMsg.includes("Price must be positive")) {
        errorMsg = "Vui lòng nhập giá hợp lệ (lớn hơn 0)";
      }
      
      // Set error for inline display (optional, can remove if only using modal)
      setError(errorMsg);
      // Show error modal
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <Modal 
      show={show} 
      onHide={onHide} 
      size="xl" 
      backdrop="static"
      centered
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <Modal.Header 
        closeButton 
        style={{ 
          backgroundColor: '#f8f9fa',
          borderBottom: '2px solid #e9ecef',
          padding: '1.25rem 1.5rem'
        }}
      >
        <Modal.Title style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600',
          color: '#212529',
          fontFamily: 'Playfair Display, serif'
        }}>
          {isEditing ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>

          <Row className="g-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: '600',
                  color: '#495057',
                  marginBottom: '0.5rem'
                }}>
                  Số phòng <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  placeholder="VD: 101, 102A, 201B..."
                  required
                  style={{
                    fontSize: '0.95rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ced4da'
                  }}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: '600',
                  color: '#495057',
                  marginBottom: '0.5rem'
                }}>
                  Tên phòng <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleChange}
                  placeholder="VD: Phòng Deluxe, Suite Premium..."
                  required
                  style={{
                    fontSize: '0.95rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ced4da'
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-3">
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: '600',
                  color: '#495057',
                  marginBottom: '0.5rem'
                }}>
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
                  style={{
                    fontSize: '0.95rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ced4da'
                  }}
                />
                <Form.Text className="text-muted" style={{ fontSize: '0.85rem' }}>
                  Ví dụ: 1.000.000 VNĐ
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: '600',
                  color: '#495057',
                  marginBottom: '0.5rem'
                }}>
                  Sức chứa (người)
                </Form.Label>
                <Form.Control
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  style={{
                    fontSize: '0.95rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ced4da'
                  }}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: '600',
                  color: '#495057',
                  marginBottom: '0.5rem'
                }}>
                  Trạng thái
                </Form.Label>
                <Form.Select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  style={{
                    fontSize: '0.95rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ced4da'
                  }}
                >
                  <option value="available">Còn trống</option>
                  <option value="occupied">Đã đặt</option>
                  <option value="maintenance">Bảo trì</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label style={{ 
              fontSize: '0.95rem', 
              fontWeight: '600',
              color: '#495057',
              marginBottom: '0.5rem'
            }}>
              Ảnh chính <span className="text-danger">*</span>
            </Form.Label>
            
            {imagePreview && (
              <motion.div 
                className="mb-3 position-relative" 
                style={{ maxWidth: '400px' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="img-fluid rounded shadow-sm"
                  style={{
                    maxHeight: '200px',
                    objectFit: 'cover',
                    width: '100%',
                    border: '2px solid #dee2e6'
                  }}
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="position-absolute top-0 end-0 m-2"
                  style={{ zIndex: 10, borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
                >
                  ✕
                </Button>
              </motion.div>
            )}

            <Form.Control
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              style={{
                fontSize: '0.95rem',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ced4da'
              }}
            />
            {uploadingImage && (
              <div className="mt-2 d-flex align-items-center">
                <Spinner size="sm" className="me-2" />
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                  Đang upload ảnh lên Cloudinary...
                </span>
              </div>
            )}
            <Form.Text className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
              Chọn ảnh đại diện của phòng (JPG, PNG, GIF, WEBP - tối đa 10MB)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label style={{ 
              fontSize: '0.95rem', 
              fontWeight: '600',
              color: '#495057',
              marginBottom: '0.75rem'
            }}>
              Tiện nghi
            </Form.Label>
            <Card 
              className="border" 
              style={{ 
                maxHeight: '200px', 
                overflowY: 'auto',
                padding: '1rem',
                backgroundColor: '#f8f9fa'
              }}
            >
              <Row className="g-2">
                {AVAILABLE_AMENITIES.map((amenity) => {
                  const isSelected = (formData.amenities || []).includes(amenity);
                  return (
                    <Col xs={6} md={4} key={amenity}>
                      <Form.Check
                        type="checkbox"
                        id={`amenity-${amenity}`}
                        label={amenity}
                        checked={isSelected}
                        onChange={() => handleAmenityToggle(amenity)}
                        style={{
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}
                      />
                    </Col>
                  );
                })}
              </Row>
            </Card>
            <Form.Text className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
              Đã chọn: <strong>{formData.amenities?.length || 0}</strong> tiện nghi
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ 
              fontSize: '0.95rem', 
              fontWeight: '600',
              color: '#495057',
              marginBottom: '0.5rem'
            }}>
              Mô tả
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả chi tiết về phòng, không gian, view, đặc điểm nổi bật..."
              style={{
                fontSize: '0.95rem',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ced4da',
                lineHeight: '1.5'
              }}
            />
            <Form.Text className="text-muted" style={{ fontSize: '0.85rem' }}>
              {formData.description.length} / 1000 ký tự
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer style={{ 
          backgroundColor: '#f8f9fa',
          borderTop: '2px solid #e9ecef',
          padding: '1rem 1.5rem'
        }}>
          <Button 
            variant="secondary" 
            onClick={onHide} 
            disabled={submitting}
            style={{
              fontSize: '0.95rem',
              padding: '0.5rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500'
            }}
          >
            Hủy
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={submitting}
            style={{
              fontSize: '0.95rem',
              padding: '0.5rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500',
              background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
              border: 'none',
              boxShadow: '0 2px 8px rgba(201, 162, 74, 0.3)'
            }}
          >
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

    {/* Success Modal - giống popup xóa */}
    <Modal
      show={showSuccessModal}
      onHide={() => {
        setShowSuccessModal(false);
      }}
      centered
      backdrop="static"
    >
      <Modal.Header closeButton style={{ borderBottom: "2px solid var(--primary-gold)" }}>
        <Modal.Title style={{ fontFamily: "Playfair Display, serif", color: "#155724" }}>
          Thành công
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-0" style={{ fontSize: '1.05rem' }}>
          {successMessage}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() => {
            setShowSuccessModal(false);
          }}
          style={{ 
            borderRadius: "8px",
            background: "linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)",
            border: "none",
            padding: "0.6rem 1.5rem"
          }}
        >
          OK
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Error Modal - Popup cảnh báo lỗi màu đỏ */}
    <Modal
      show={showErrorModal}
      onHide={() => {
        setShowErrorModal(false);
      }}
      centered
      backdrop="static"
    >
      <Modal.Header 
        closeButton 
        style={{ 
          borderBottom: "2px solid #dc3545",
          backgroundColor: "#fff5f5"
        }}
      >
        <Modal.Title style={{ 
          fontFamily: "Playfair Display, serif", 
          color: "#dc3545",
          fontSize: '1.25rem',
          fontWeight: '600'
        }}>
          Lỗi
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '1.5rem' }}>
        <p className="mb-0" style={{ 
          fontSize: '1.05rem',
          color: '#721c24',
          fontWeight: '500',
          lineHeight: '1.5'
        }}>
          {errorMessage}
        </p>
      </Modal.Body>
      <Modal.Footer style={{ borderTop: "1px solid #f5c6cb" }}>
        <Button
          variant="danger"
          onClick={() => {
            setShowErrorModal(false);
            setError(""); // Clear inline error too
          }}
          style={{ 
            borderRadius: "8px",
            background: "#dc3545",
            border: "none",
            padding: '0.5rem 1.5rem',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}
        >
          Đã hiểu
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
}

