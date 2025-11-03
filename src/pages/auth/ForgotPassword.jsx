import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import showToast from "../../utils/toast";
import "../../styles/auth.css";

export default function ForgotPassword() {
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [err, setErr] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes in seconds
  const [resendTimer, setResendTimer] = useState(0);
  const nav = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Countdown timer for OTP (10 minutes)
  useEffect(() => {
    if (step === 2 && otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, otpTimer]);

  // Countdown timer for resend button (1 minute)
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await axios.post("/auth/forgot-password", { email: form.email });
      showToast.success("Mã OTP đã được gửi đến email của bạn!");
      setStep(2);
      setOtpTimer(600); // Reset to 10 minutes
      setResendTimer(60); // Start 1 minute cooldown
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
      showToast.error(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setErr("");
    setLoading(true);
    try {
      await axios.post("/auth/forgot-password", { email: form.email });
      showToast.success("Mã OTP mới đã được gửi đến email của bạn!");
      setOtpTimer(600); // Reset to 10 minutes
      setResendTimer(60); // Start 1 minute cooldown
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
      showToast.error(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErr("");
    setVerifying(true);
    try {
      await axios.post("/auth/verify-otp", { email: form.email, otp: form.otp });
      showToast.success("Mã OTP hợp lệ");
      setStep(3);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
      showToast.error(e?.response?.data?.message || e.message);
    } finally {
      setVerifying(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (form.newPassword !== form.confirmPassword) {
      setErr("Mật khẩu mới và xác nhận không khớp");
      showToast.error("Mật khẩu mới và xác nhận không khớp");
      return;
    }

    if (form.newPassword.length < 6) {
      setErr("Mật khẩu phải có ít nhất 6 ký tự");
      showToast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setErr("");
    setResetting(true);
    try {
      await axios.post("/auth/reset-password", { 
        email: form.email, 
        newPassword: form.newPassword 
      });
      showToast.success("Đặt lại mật khẩu thành công!");
      nav("/login");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
      showToast.error(e?.response?.data?.message || e.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-hero">
        <div className="icon">🔐</div>
        <h1>Quên mật khẩu?</h1>
        <p className="auth-muted">Đặt lại mật khẩu của bạn</p>
      </div>

      <Card className="auth-card">
        <Card.Body>
          <h6 className="mb-3">
            {step === 1 && "Nhập email của bạn"}
            {step === 2 && "Nhập mã OTP"}
            {step === 3 && "Nhập mật khẩu mới"}
          </h6>
          {err && <Alert variant="danger" className="py-2">{err}</Alert>}

          {/* Step 1: Email */}
          {step === 1 && (
            <Form onSubmit={handleRequestOtp}>
              <Form.Group className="mb-3">
                <Form.Label className="auth-label">Email</Form.Label>
                <Form.Control
                  className="auth-input"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="ten@email.com"
                  required
                />
              </Form.Group>

              <Button type="submit" className="auth-action w-100" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi mã OTP"}
              </Button>

              <div className="text-center mt-3">
                <Button variant="link" className="auth-link" onClick={() => nav("/login")}>
                  ← Quay lại đăng nhập
                </Button>
              </div>
            </Form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <Form onSubmit={handleVerifyOtp}>
              <Form.Group className="mb-3">
                <Form.Label className="auth-label">Mã OTP (6 số)</Form.Label>
                <Form.Control
                  className="auth-input text-center"
                  name="otp"
                  type="text"
                  value={form.otp}
                  onChange={onChange}
                  placeholder="000000"
                  maxLength={6}
                  required
                  style={{ fontSize: "1.5rem", letterSpacing: "0.5rem" }}
                />
                <Form.Text className="text-muted d-block mt-2">
                  💌 Vui lòng kiểm tra email của bạn để lấy mã OTP
                </Form.Text>
                <div className="mt-2">
                  <Alert variant={otpTimer > 0 ? "info" : "danger"} className="py-2 mb-0">
                    ⏱️ Mã OTP hết hạn trong: <strong>{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</strong>
                  </Alert>
                </div>
              </Form.Group>

              <Button type="submit" className="auth-action w-100" disabled={verifying || otpTimer === 0}>
                {verifying ? "Đang xác thực..." : "Xác thực OTP"}
              </Button>

              <div className="text-center mt-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Button
                    variant="link"
                    className="auth-link p-0"
                    onClick={() => setStep(1)}
                  >
                    ← Quay lại
                  </Button>
                  <Button
                    variant="link"
                    className={`auth-link p-0 ${resendTimer > 0 ? 'text-muted' : ''}`}
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                  >
                    {resendTimer > 0 ? `Gửi lại sau ${resendTimer}s` : 'Gửi lại OTP'}
                  </Button>
                </div>
              </div>
            </Form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <Form onSubmit={handleResetPassword}>
              <Form.Group className="mb-3">
                <Form.Label className="auth-label">Mật khẩu mới</Form.Label>
                <Form.Control
                  className="auth-input"
                  name="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={onChange}
                  placeholder="Tối thiểu 6 ký tự"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="auth-label">Xác nhận mật khẩu</Form.Label>
                <Form.Control
                  className="auth-input"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={onChange}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </Form.Group>

              <Button type="submit" className="auth-action w-100" disabled={resetting}>
                {resetting ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
              </Button>

              <div className="text-center mt-3">
                <Button
                  variant="link"
                  className="auth-link"
                  onClick={() => setStep(2)}
                >
                  ← Quay lại
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </main>
  );
}
