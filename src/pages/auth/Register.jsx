import React, { useState } from "react";
import { Form, Button, Card, Alert, Row, Col } from "react-bootstrap";
import axios from "../../api/axiosInstance";
import { useAuth } from "../../store/auth";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/auth.css";

export default function Register() {
  const [form, setForm] = useState({
    lastName: "", firstName: "",
    email: "", phoneNumber: "", password: "", confirm: "", accept:false
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (form.password !== form.confirm) {
      setErr("Xác nhận mật khẩu không khớp."); return;
    }
    if (!form.accept) {
      setErr("Bạn cần đồng ý Điều khoản dịch vụ và Chính sách bảo mật."); return;
    }
    setLoading(true);
    try {
      const payload = {
        fullName: `${form.lastName.trim()} ${form.firstName.trim()}`.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password
      };
      const { data } = await axios.post("/auth/register", payload);
      login(data);
      nav("/");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  return (
    <main className="auth-page">
      <div className="auth-hero">
        <div className="icon">🏨</div>
        <h1>Tạo tài khoản mới</h1>
        <p className="auth-muted">Đăng ký để trải nghiệm dịch vụ tốt nhất</p>
      </div>

      <Card className="auth-card">
        <Card.Body>
          <h6 className="mb-3">Đăng ký</h6>
          {err && <Alert variant="danger" className="py-2">{err}</Alert>}

          <Form onSubmit={submit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="auth-label">Họ</Form.Label>
                <Form.Control className="auth-input"
                  name="lastName" value={form.lastName}
                  onChange={onChange} placeholder="Nguyễn" required/>
              </Col>
              <Col md={6}>
                <Form.Label className="auth-label">Tên</Form.Label>
                <Form.Control className="auth-input"
                  name="firstName" value={form.firstName}
                  onChange={onChange} placeholder="Văn A" required/>
              </Col>

              <Col md={12}>
                <Form.Label className="auth-label">Email</Form.Label>
                <Form.Control className="auth-input"
                  type="email" name="email" value={form.email}
                  onChange={onChange} placeholder="ten@email.com" required/>
              </Col>

              <Col md={12}>
                <Form.Label className="auth-label">Số điện thoại</Form.Label>
                <Form.Control className="auth-input"
                  name="phoneNumber" value={form.phoneNumber}
                  onChange={onChange} placeholder="0912345678"/>
              </Col>

              <Col md={12}>
                <Form.Label className="auth-label">Mật khẩu</Form.Label>
                <Form.Control className="auth-input"
                  type="password" name="password" value={form.password}
                  onChange={onChange} placeholder="••••••••" required/>
                <div className="auth-muted small mt-1">
                  Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số
                </div>
              </Col>

              <Col md={12}>
                <Form.Label className="auth-label">Xác nhận mật khẩu</Form.Label>
                <Form.Control className="auth-input"
                  type="password" name="confirm" value={form.confirm}
                  onChange={onChange} placeholder="••••••••" required/>
              </Col>

              <Col md={12}>
                <Form.Check
                  type="checkbox"
                  name="accept"
                  className="mt-1"
                  checked={form.accept}
                  onChange={onChange}
                  label={<span className="auth-muted">
                    Tôi đồng ý với <a className="auth-link" href="#">Điều khoản dịch vụ</a> và <a className="auth-link" href="#">Chính sách bảo mật</a>
                  </span>}
                />
              </Col>
            </Row>

            <Button type="submit" className="auth-action w-100 mt-3" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>

            <div className="text-center mt-3 auth-muted">
              Đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập</Link>
            </div>

            <hr className="mt-4 mb-3" />
            <div className="text-center auth-muted">Hoặc đăng ký với</div>
            <div className="auth-social">
              <Button variant="light"><span className="me-2">🟢</span> Google</Button>
              <Button variant="light"><span className="me-2">🔵</span> Facebook</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </main>
  );
}
