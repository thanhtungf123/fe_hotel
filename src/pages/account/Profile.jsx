import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import axios from "../../api/axiosInstance";
import { useAuth } from "../../store/auth";
import showToast from "../../utils/toast";
import { Navigate } from "react-router-dom";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    avatarUrl: "",
    role: null,
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!user?.token) return;
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/auth/profile");
      setProfile(data);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
      showToast.error("Không thể tải thông tin: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await axios.put("/auth/profile", {
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        avatarUrl: profile.avatarUrl,
      });
      
      // Update user in auth context
      updateUser({
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
      });
      
      showToast.success("Cập nhật thông tin thành công!");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setError(msg);
      showToast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast.error("Chỉ chấp nhận file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("File ảnh không được vượt quá 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post("/uploads/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile({ ...profile, avatarUrl: data.url });
      
      // Update user in auth context immediately
      updateUser({ avatarUrl: data.url });
      
      showToast.success("Tải ảnh đại diện thành công!");

      // Auto save after upload
      await axios.put("/auth/profile", {
        avatarUrl: data.url,
      });
    } catch (err) {
      showToast.error("Tải ảnh thất bại: " + (err?.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm({ ...passwordForm, [field]: value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast.error("Mật khẩu mới và xác nhận không khớp");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setChangingPassword(true);
    try {
      await axios.post("/auth/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      showToast.success("Đổi mật khẩu thành công!");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      showToast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user?.token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  const getRoleBadgeColor = (roleName) => {
    switch (roleName?.toLowerCase()) {
      case "admin":
        return "danger";
      case "staff":
        return "warning";
      case "customer":
        return "primary";
      default:
        return "secondary";
    }
  };

  const getRoleDisplayName = (roleName) => {
    switch (roleName?.toLowerCase()) {
      case "admin":
        return "Quản trị viên";
      case "staff":
        return "Nhân viên";
      case "customer":
        return "Khách hàng";
      default:
        return roleName;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Container className="py-5" style={{ maxWidth: 900 }}>
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold mb-2">Thông tin cá nhân</h2>
            <p className="text-muted">Quản lý thông tin tài khoản của bạn</p>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                {/* Avatar */}
                <Col md={12}>
                  <div className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                      <img
                        src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || "User")}&size=200&background=d4af37&color=fff&bold=true`}
                        alt="Avatar"
                        className="rounded-circle border border-3"
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                          borderColor: "#d4af37 !important"
                        }}
                      />
                      <motion.label
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2"
                        style={{ cursor: "pointer" }}
                        htmlFor="avatar-upload"
                      >
                        {uploading ? "⏳" : "📷"}
                      </motion.label>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                        style={{ display: "none" }}
                      />
                    </div>
                    <div className="mt-2">
                      <small className="text-muted">
                        {uploading ? "Đang tải..." : "Nhấn vào biểu tượng 📷 để đổi ảnh đại diện"}
                      </small>
                    </div>
                  </div>
                </Col>

                {/* Họ tên */}
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>
                      <strong>Họ và tên <span className="text-danger">*</span></strong>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={profile.fullName || ""}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      required
                      size="lg"
                      placeholder="Nhập họ và tên"
                    />
                  </Form.Group>
                </Col>

                {/* Email - Read only */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      <strong>Email</strong>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={profile.email || ""}
                      disabled
                      size="lg"
                      className="bg-light"
                    />
                    <Form.Text className="text-muted">
                      Email không thể thay đổi
                    </Form.Text>
                  </Form.Group>
                </Col>

                {/* Số điện thoại */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      <strong>Số điện thoại</strong>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={profile.phoneNumber || ""}
                      onChange={(e) => handleChange("phoneNumber", e.target.value)}
                      size="lg"
                      placeholder="VD: 0901234567"
                    />
                  </Form.Group>
                </Col>

                {/* Vai trò - Read only */}
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>
                      <strong>Vai trò</strong>
                    </Form.Label>
                    <div>
                      <Badge
                        bg={getRoleBadgeColor(profile.role?.name || user?.role)}
                        className="fs-6 p-2"
                      >
                        {getRoleDisplayName(profile.role?.name || user?.role)}
                      </Badge>
                    </div>
                  </Form.Group>
                </Col>

                {/* Submit */}
                <Col md={12} className="mt-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted small">
                      * Thông tin bắt buộc
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={submitting}
                    >
                      {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Đổi mật khẩu */}
        <Card className="border-0 shadow-sm mt-3">
          <Card.Body className="p-4">
            <h5 className="mb-3">Đổi mật khẩu</h5>
            <Form onSubmit={handlePasswordSubmit}>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>
                      <strong>Mật khẩu cũ <span className="text-danger">*</span></strong>
                    </Form.Label>
                    <Form.Control
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={(e) => handlePasswordChange("oldPassword", e.target.value)}
                      required
                      size="lg"
                      placeholder="Nhập mật khẩu cũ"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      <strong>Mật khẩu mới <span className="text-danger">*</span></strong>
                    </Form.Label>
                    <Form.Control
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      required
                      size="lg"
                      placeholder="Tối thiểu 6 ký tự"
                      minLength={6}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      <strong>Xác nhận mật khẩu <span className="text-danger">*</span></strong>
                    </Form.Label>
                    <Form.Control
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                      required
                      size="lg"
                      placeholder="Nhập lại mật khẩu mới"
                      minLength={6}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <div className="d-flex justify-content-end">
                    <Button
                      type="submit"
                      variant="warning"
                      size="lg"
                      disabled={changingPassword}
                    >
                      {changingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Thông tin bổ sung
        <Card className="border-0 shadow-sm mt-3">
          <Card.Body className="p-4">
            <h5 className="mb-3">📋 Thông tin bổ sung</h5>
            <Row className="g-3">
              <Col md={6}>
                <div className="d-flex align-items-center gap-3">
                  <div className="fs-4">🆔</div>
                  <div>
                    <div className="text-muted small">Mã tài khoản</div>
                    <div className="fw-bold">#{profile.id || user?.accountId}</div>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-center gap-3">
                  <div className="fs-4">🔐</div>
                  <div>
                    <div className="text-muted small">Trạng thái</div>
                    <div>
                      <Badge bg={profile.isActive ? "success" : "danger"}>
                        {profile.isActive ? "Hoạt động" : "Khóa"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card> */}
      </Container>
    </motion.div>
  );
}
