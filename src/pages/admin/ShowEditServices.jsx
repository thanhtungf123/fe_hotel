
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "../../api/axiosInstance";

export default function ShowEditServices() {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy ID dịch vụ từ URL

  const [formData, setFormData] = useState({
    nameService: "",
    description: "",
    price: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Tải dữ liệu dịch vụ cần chỉnh sửa
  useEffect(() => {
    if (!id) return;

    const fetchService = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/admin/services/${id}`);
        setFormData({
          nameService: data.nameService || "",
          description: data.description || "",
          price: data.price?.toString() || "",
        });
      } catch (err) {
        setError("Không thể tải dữ liệu dịch vụ.");
        console.error("Lỗi khi tải dịch vụ:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const priceValue = parseFloat(formData.price);
    if (!formData.nameService.trim()) {
      setError("Tên dịch vụ là bắt buộc.");
      return;
    }
    if (isNaN(priceValue) || priceValue < 0) {
      setError("Giá phải là một số không âm.");
      return;
    }

    setSaving(true);
    const payload = {
      nameService: formData.nameService.trim(),
      description: formData.description.trim(),
      price: priceValue,
    };

    try {
      await axios.put(`/admin/services/${id}`, payload);
      setSuccess("Cập nhật dịch vụ thành công!");
      setTimeout(() => {
        navigate("/admin"); // Điều hướng về trang admin
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật.");
      console.error("Lỗi khi cập nhật dịch vụ:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
        <p>Đang tải dữ liệu dịch vụ...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-light p-3">
              <Row className="align-items-center">
                <Col>
                  <h3 className="mb-0">Chỉnh sửa Dịch vụ (ID: {id})</h3>
                  <div className="text-muted">Cập nhật thông tin chi tiết dịch vụ</div>
                </Col>
                <Col className="text-end">
                  <Button as={Link} to="/admin" variant="outline-secondary">
                    &larr; Quay lại Admin
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formNameService">
                  <Form.Label>Tên dịch vụ <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="nameService"
                    value={formData.nameService}
                    onChange={handleChange}
                    required
                    placeholder="Ví dụ: Giặt ủi"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPrice">
                  <Form.Label>Giá <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Ví dụ: 50000"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDescription">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mô tả chi tiết về dịch vụ (không bắt buộc)"
                  />
                </Form.Group>

                <div className="text-end">
                  <Button variant="primary" type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" />
                        {" "} Đang lưu...
                      </>
                    ) : "Lưu thay đổi"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
