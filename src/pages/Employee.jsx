// src/pages/Employee.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table, Spinner, Alert, Form, Badge, Button } from "react-bootstrap";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import { useAuth } from "../store/auth";

export default function Employee() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ---- State
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qAcc, setQAcc] = useState("");

  // ---- Helpers
  const norm = (v) => (v ?? "").toString().toLowerCase();

  const getRoleName = () => {
    let rn =
      (typeof user?.role === "string" ? user.role : undefined) ??
      user?.role?.name ??
      user?.role?.role_name;

    if (!rn) {
      try {
        const raw = sessionStorage.getItem("auth") || localStorage.getItem("auth");
        const auth = raw ? JSON.parse(raw) : undefined;
        rn =
          (typeof auth?.role === "string" ? auth.role : undefined) ??
          auth?.role?.name ??
          auth?.role?.role_name;
      } catch { /* ignore */ }
    }
    return typeof rn === "string" ? rn.toLowerCase() : undefined;
  };

  const roleName = getRoleName();

  // ---- Data fetch: chỉ lấy Account role = CUSTOMER
  useEffect(() => {
    let alive = true;

    const loadAccounts = async () => {
      try {
        // Ưu tiên endpoint chuẩn trong khu vực admin:
        //   GET /admin/accounts?role=customer
        // Fallback nếu BE không có: 
        //   GET /accounts?role=customer
        let res;
        try {
          res = await axios.get("/admin/employees/accounts", { params: { role: "customer" } });
        } catch (e) {
          const code = e?.response?.status;
          if (code === 404 || code === 405) {
            res = await axios.get("/employees/accounts", { params: { role: "customer" } });
          } else {
            throw e;
          }
        }

        if (!alive) return;
        const data = res?.data;
        setAccounts(Array.isArray(data) ? data : data?.items ?? []);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || e.message || "Load accounts failed");
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadAccounts();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAccounts = useMemo(() => {
    const q = norm(qAcc);
    if (!q) return accounts;
    return accounts.filter((a) =>
      [
        a.id,
        a.fullName,
        a.email,
        a.username,
        a.phoneNumber ?? a.phone,
        typeof a.role === "string" ? a.role : a.role?.name,
        a.status,
        a.isActive ? "active" : "disabled"
      ]
        .map(norm)
        .some((s) => s.includes(q))
    );
  }, [accounts, qAcc]);

  // ---- Guard: chỉ cho employee hoặc admin
  if (!user?.token) return <Navigate to="/login" replace />;
  if (!["employee", "admin"].includes(roleName ?? "")) return <Navigate to="/" replace />;

  // ---- Actions
  const handleDeleteAccount = async (id) => {
    if (!window.confirm("Xóa tài khoản này?")) return;

    const showError = (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Unknown error";
      alert(`Delete failed: ${msg}`);
    };

    try {
      let res;
      try {
        res = await axios.delete(`/admin/accounts/${id}`);
      } catch (e) {
        const code = e?.response?.status;
        if (code === 404 || code === 405) {
          res = await axios.delete(`/accounts/${id}`);
        } else {
          throw e;
        }
      }
      // Xóa thành công -> cập nhật UI
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      const code = error?.response?.status;
      if (code === 401 || code === 403) {
        alert("Bạn không có quyền xóa tài khoản.");
        return;
      }
      if (code === 404) {
        alert("Không tìm thấy tài khoản (có thể đã bị xóa).");
        setAccounts((prev) => prev.filter((a) => a.id !== id));
        return;
      }
      if (code === 409) {
        alert("Không thể xóa: tài khoản đang được tham chiếu bởi dữ liệu khác.");
        return;
      }
      console.error("Failed to delete account", error);
      showError(error);
    }
  };

  const StatusBadge = ({ value, isActive }) => {
    // Ưu tiên isActive nếu có; nếu không dùng value
    const label = typeof isActive === "boolean" ? (isActive ? "Active" : "Disabled") : (value ?? "N/A");
    const val = norm(label);
    const variant =
      val.includes("active") ? "success" :
        val.includes("pending") ? "warning" :
          val.includes("disabled") || val.includes("banned") ? "secondary" :
            "info";
    return <Badge bg={variant} className="text-uppercase">{label}</Badge>;
  };

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col>
          <h3 className="mb-0">Customer Management</h3>
          <div className="text-muted">Dành cho nhân viên quản lý tài khoản khách hàng</div>
        </Col>
        <Col className="text-end">
          <Button as={Link} to="/" variant="dark">Back to Home</Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            placeholder="Tìm theo tên, email, username, phone, trạng thái…"
            value={qAcc}
            onChange={(e) => setQAcc(e.target.value)}
          />
        </Col>
        <Col className="text-end">
          <Button as={Link} to="/employee/account/create" variant="primary">
            + Tạo Customer
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="py-5 text-center"><Spinner animation="border" /> Đang tải danh sách…</div>
      ) : error ? (
        <Alert variant="danger">Không tải được danh sách: {error}</Alert>
      ) : (
        <div className="table-responsive">
          <Table hover bordered size="sm" className="align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Full name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted py-4">Không có khách hàng nào</td></tr>
              ) : filteredAccounts.map((a) => {
                const roleLabel = typeof a.role === "string" ? a.role : (a.role?.name ?? "-");
                return (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.fullName || "-"}</td>
                    <td>{a.email || "-"}</td>
                    <td>{a.phoneNumber || a.phone || "-"}</td>
                    <td className="text-capitalize">{roleLabel || "customer"}</td>
                    <td><StatusBadge value={a.status} isActive={a.isActive} /></td>
                    <td className="text-nowrap">
                      <Button as={Link} to={`/admin/accountHistory/${a.id}`} size="sm" variant="outline-info" className="me-2">
                        History
                      </Button>
                      <Button as={Link} to={`/employee/accounts/${a.id}`} size="sm" variant="outline-secondary" className="me-2">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDeleteAccount(a.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}
