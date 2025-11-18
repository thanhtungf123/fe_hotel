import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { useAuth } from "../../store/auth";

export default function ShowEditAccount() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    isActive: true,
    // password chỉ để đổi mật khẩu; để trống nếu không đổi
    password: "",
    // Nếu bạn cần roleId thì mở thêm:
    roleId: ""
  });
const [roleInfo, setRoleInfo] = useState({ id: "", name: "" });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const currentRoleName = (() => {
    let rn =
      (typeof user?.role === "string" ? user.role : undefined) ??
      user?.role?.name ??
      user?.role?.role_name;
    return typeof rn === "string" ? rn.toLowerCase() : undefined;
  })();
  const isAdmin = currentRoleName === "admin";

  // Fetch account by id
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        let data;
        try {
          ({ data } = await axios.get(`/admin/accounts/${id}`));
        } catch (ex1) {
          // fallback nếu không có route /admin
          const code = ex1?.response?.status;
          if (code === 404 || code === 405) {
            ({ data } = await axios.get(`/accounts/${id}`));
          } else {
            throw ex1;
          }
        }

        if (!alive) return;

        setForm({
          fullName: data?.fullName ?? "",
          email: data?.email ?? "",
          phoneNumber: data?.phoneNumber ?? data?.phone ?? "",
          isActive: data?.isActive ?? (data?.status ? String(data.status).toLowerCase() === "active" : true),
          password: "",
          roleId: data?.role?.id != null ? String(data.role.id) : ""
        });
        setRoleInfo({
          id: data?.role?.id ?? "",
          name:
            data?.role?.name ??
            data?.role?.role_name ??
            data?.role?.roleName ??
            ""
        });
      } catch (ex) {
        if (!alive) return;
        const msg =
          ex?.response?.data?.message ||
          ex?.response?.data ||
          ex?.message ||
          "Failed to load account.";
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Chỉ gửi các field cần thiết
      const payload = {
        fullName: form.fullName?.trim(),
        email: form.email?.trim(),
        phoneNumber: form.phoneNumber?.trim(),
        isActive: !!form.isActive,
        // isActive: form.isActive === true,
        // active:   form.isActive === true,
        // Nếu có roleId:
        // role: form.roleId ? { id: Number(form.roleId) } : undefined
      };

      if (isAdmin && form.roleId && form.roleId !== "") {
        const rid = Number(form.roleId);
        if (![1, 3].includes(rid)) {
          setError("Role chỉ hợp lệ: 1 (Customer), 3 (Staff).");
          setSaving(false);
          return;
        }
        payload.role = { id: rid };
      }

      const params = {};
      if (form.password && form.password.length > 0) { //password
        // Gửi password plain qua query param để BE hash
        params.password = form.password;
      }
      params.active = form.isActive === true; //active
      // if (form.roleId && form.roleId !== "") { // roleId
      //   const rid = Number.parseInt(form.roleId, 10);
      //   if (rid !== 1 && rid !== 2) {
      //     setError("Role ID chỉ được 1 (Account) hoặc 2 (Employee).");
      //     setSaving(false);
      //     return;
      //   }
      //   params.roleId = rid;
      // }



      let ok = false;
      try {
        await axios.put(`/admin/accounts/${id}`, payload, { params });
        ok = true;
      } catch (ex1) {
        const code = ex1?.response?.status;
        if (code === 404 || code === 405) {
          await axios.put(`/accounts/${id}`, payload, { params });
          ok = true;
        } else {
          throw ex1;
        }
      }

      if (ok) navigate("/admin");
    } catch (ex) {
      const msg =
        ex?.response?.data?.message ||
        ex?.response?.data ||
        ex?.message ||
        "Failed to update account.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col>
          <h3 className="mb-0">Edit Account</h3>
          <div className="text-muted">Update account #{id}</div>
        </Col>
        <Col className="text-end">
          <Button as={Link} to="/admin" variant="secondary">Back to Admin</Button>
        </Col>
      </Row>

      {loading ? (
        <div className="py-5 text-center">
          <Spinner animation="border" /> Loading account…
        </div>
      ) : (
        <Card>
          <Card.Body>
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

            <Form onSubmit={onSubmit}>
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

                <Col md={3} className="d-flex align-items-end">
                  <Form.Check
                    name="isActive"
                    type="switch"
                    id="acc-active"
                    label="Active"
                    checked={!!form.isActive}
                    onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
                  />
                </Col>

                {isAdmin ? (
                  <Col md={3}>
                    <Form.Label>Role</Form.Label>
                    <Form.Select
                      name="roleId"
                      value={form.roleId}
                      onChange={(e) => setForm(s => ({ ...s, roleId: e.target.value }))}
                    >
                      <option value="">— Giữ nguyên —</option>
                      <option value="1">Customer</option>
                      <option value="3">Staff</option>
                    </Form.Select>
                  </Col>
                ) : (
                  <Col md={3}>
                    <Form.Label>Role</Form.Label>
                    <Form.Control value={roleInfo.name || (form.roleId === "2" ? "Staff" : "Customer")} disabled readOnly />
                    <Form.Text className="text-muted">Chỉ admin mới được thay đổi vai trò.</Form.Text>
                  </Col>
                )}

                <Col md={6}>
                  <Form.Label>New Password (optional)</Form.Label>
                  <Form.Control
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="Leave blank to keep current password"
                  />
                  <Form.Text className="text-muted">
                    Nếu nhập, password sẽ được hash ở server.
                  </Form.Text>
                </Col>
              </Row>

              <div className="mt-4 d-flex gap-2">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button as={Link} to="/admin" variant="outline-secondary" disabled={saving}>
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
