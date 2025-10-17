import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "../../api/axiosInstance";

export default function ShowEditAccount() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

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
        // Nếu có roleId:
        // role: form.roleId ? { id: Number(form.roleId) } : undefined
      };

      // map role_id -> role object nếu user nhập
      if (form.roleId !== "" && form.roleId !== null) {
        const rid = Number(form.roleId);
        if (!Number.isNaN(rid)) payload.role = { id: rid };
      }

      const params = {};
      if (form.password && form.password.length > 0) {
        // Gửi password plain qua query param để BE hash
        params.password = form.password;
      }

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
                    onChange={onChange}
                  />
                </Col>

                <Col md={3}>
                  <Form.Label>Role ID</Form.Label>
                  <Form.Control
                    name="roleId"
                    type="number"
                    value={form.roleId}
                    onChange={onChange}
                    placeholder={roleInfo.id ? `Current: ${roleInfo.id} (${roleInfo.name})` : "Enter role id"}
                  />
                  <Form.Text className="text-muted">
                    {roleInfo.name ? `Current role: ${roleInfo.name} (id=${roleInfo.id})` : "Leave blank to keep current role."}
                  </Form.Text>
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
