import React, { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import axios from "../../api/axiosInstance";
import { useAuth } from "../../store/auth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../../styles/auth.css";
import { googleGetProfile, facebookGetProfile } from "../../utils/oauth";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const next = params.get('next') || '/';

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const { data } = await axios.post("/auth/login", form);
      // data: {token, accountId, fullName, role}
      login(data);
      
      // Redirect admin/staff to admin dashboard
      const role = typeof data.role === "string" ? data.role.toLowerCase() : 
                   (data.role?.name || data.role?.role_name || "").toLowerCase();
      if (role === "admin" || role === "staff") {
        nav("/admin", { replace: true });
      } else {
        nav(next, { replace: true });
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  const oauthLogin = async (profilePromise) => {
    setErr(""); setLoading(true);
    try {
      const profile = await profilePromise; // { provider, providerId, email, fullName, avatarUrl }
      if (!profile?.email && profile?.provider === 'facebook') {
        // Email có thể trống nếu user không cấp quyền
        // Backend yêu cầu email, nên hiển thị hướng dẫn
        throw new Error("Không lấy được email từ Facebook. Vui lòng cấp quyền email hoặc dùng Google.");
      }
      const { data } = await axios.post("/auth/oauth", profile);
      login(data);
      
      // Redirect admin/staff to admin dashboard
      const role = typeof data.role === "string" ? data.role.toLowerCase() : 
                   (data.role?.name || data.role?.role_name || "").toLowerCase();
      if (role === "admin" || role === "staff") {
        nav("/admin", { replace: true });
      } else {
        nav(next, { replace: true });
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-hero">
        <div className="icon">🏨</div>
        <h1>Chào mừng trở lại</h1>
        <p className="auth-muted">Đăng nhập để quản lý đặt phòng của bạn</p>
      </div>

      <Card className="auth-card">
        <Card.Body>
          <h6 className="mb-3">Đăng nhập</h6>
          {err && <Alert variant="danger" className="py-2">{err}</Alert>}

          <Form onSubmit={submit}>
            <Form.Group className="mb-3">
              <Form.Label className="auth-label">Email</Form.Label>
              <Form.Control className="auth-input"
                name="email" type="email" value={form.email}
                onChange={onChange} placeholder="ten@email.com" required/>
            </Form.Group>

            <Form.Group className="mb-2">
              <div className="d-flex justify-content-between">
                <Form.Label className="auth-label mb-1">Mật khẩu</Form.Label>
                <Link className="auth-link small" to="/forgot-password">Quên mật khẩu?</Link>
              </div>
              <Form.Control className="auth-input"
                name="password" type="password" value={form.password}
                onChange={onChange} placeholder="••••••••" required/>
            </Form.Group>

            <Button type="submit" className="auth-action w-100 mt-3" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <div className="text-center mt-3 auth-muted">
              Chưa có tài khoản?{" "}
              <Link to={`/register?next=${encodeURIComponent(next)}`} className="auth-link">Đăng ký ngay</Link>
            </div>

            <hr className="mt-4 mb-3" />
            <div className="text-center auth-muted">Hoặc tiếp tục với</div>
            <div className="auth-social">
              <Button variant="light" onClick={() => oauthLogin(googleGetProfile())} disabled={loading}>
                <span className="me-2">🟢</span> Google
              </Button>
              <Button variant="light" onClick={() => oauthLogin(facebookGetProfile())} disabled={loading}>
                <span className="me-2">🔵</span> Facebook
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </main>
  );
}
