import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "../../api/axiosInstance";

export default function ShowEditAccount() {
  const navigate = useNavigate();
  const { id } = useParams();

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
          roleId: data?.role?.id ?? ""
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

      // map role_id -> role object (nếu user chọn)
if (form.roleId && form.roleId !== "") {
  const rid = Number(form.roleId); // "1" | "2" -> 1 | 2
  // vì Form.Select chỉ cho 1 hoặc 2 nên không cần validate thêm,
  // nhưng nếu muốn chắc chắn:
  if (rid !== 1 && rid !== 2) {
    setError("Role ID chỉ được 1 (Account) hoặc 2 (Employee).");
    setSaving(false);
    return;
  }
  payload.role = { id: rid };
} else {
  // không chọn -> giữ nguyên role hiện tại (không gửi field role)
  // nếu bạn muốn ép clear role (hiếm khi cần), có thể đặt payload.role = null;
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

                <Col md={3}>
                  <Form.Label>Role ID</Form.Label>
                  <Form.Select
                    name="roleId"
                    value={form.roleId}
                    onChange={(e) => setForm(s => ({ ...s, roleId: e.target.value }))}
                  >
                    <option value="">— Keep current —</option>
                    <option value="1">1 — Account</option>
                    <option value="2">2 — Employee</option>
                  </Form.Select>
                </Col>

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
