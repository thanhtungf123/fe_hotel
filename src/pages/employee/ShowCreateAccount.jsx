// src/pages/employee/ShowCreateAccount.jsx
import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../api/axiosInstance";

export default function ShowCreateAccount() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    isActive: true,
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName?.trim(),
        email: form.email?.trim(),
        phoneNumber: form.phoneNumber?.trim() || null,
        isActive: !!form.isActive,
      };

      const params = {};
      if (form.password) params.password = form.password;

      // Thử /admin/accounts trước; nếu không có thì fallback /accounts
      try {
        await axios.post("/admin/accounts", payload, { params });
      } catch (ex) {
        const code = ex?.response?.status;
        if (code === 404 || code === 405) {
          await axios.post("/accounts", payload);
        } else {
          throw ex;
        }
      }

      navigate("/employee"); // quay lại trang admin sau khi tạo thành công
    } catch (ex) {
      const msg =
        ex?.response?.data?.message ||
        ex?.response?.data ||
        ex?.message ||
        "Cannot create account.";
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col>
          <h3 className="mb-0">Create Account</h3>
          <div className="text-muted">Add a new account</div>
        </Col>
        <Col className="text-end">
          <Button as={Link} to="/employee" variant="secondary">Back to Employee</Button>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {err && <Alert variant="danger" className="mb-3">{err}</Alert>}

          <Form onSubmit={submit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Full name</Form.Label>
                <Form.Control
                  name="fullName"
                  value={form.fullName}
                  onChange={onChange}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label>Phone number</Form.Label>
                <Form.Control
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={onChange}
                />
              </Col>
              <Col md={6}>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  name="password"                 // ⚠️ trùng với state key
                  type="password"
                  value={form.password}           // ⚠️ controlled bằng string
                  onChange={onChange}
                  required
                  autoComplete="new-password"
                />
                <Form.Text className="text-muted">
                  Mật khẩu sẽ được hash ở server.
                </Form.Text>
              </Col>

              {/* Nếu muốn bật/tắt ngay khi tạo */}
              <Col md={12} className="d-flex align-items-center">
                <Form.Check
                  id="acc-active"
                  type="switch"
                  label="Active"
                  name="isActive"
                  checked={form.isActive}
                  onChange={onChange}
                />
              </Col>
            </Row>

            <div className="mt-4 d-flex gap-2">
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Creating..." : "Create"}
              </Button>
              <Button as={Link} to="/employee" variant="outline-secondary" disabled={submitting}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
