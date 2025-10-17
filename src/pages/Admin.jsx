// src/pages/Admin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table, Spinner, Alert, Form, Badge, Tabs, Tab, Button } from "react-bootstrap";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import { useAuth } from "../store/auth";

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // ---- Handlers
const handleDeleteAccount = async (id) => {
  if (!window.confirm("Are you sure you want to delete this account?")) return;

  // helper hiển thị lỗi rõ ràng
  const showError = (err) => {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data ||
      err?.message ||
      "Unknown error";
    alert(`Delete failed: ${msg}`);
  };

  try {
    // Thử endpoint chuẩn Admin trước
    let res;
    try {
      res = await axios.delete(`/admin/accounts/${id}`);
    } catch (e) {
      // Fallback nếu BE không có /admin/... (405/404)
      const code = e?.response?.status;
      if (code === 404 || code === 405) {
        res = await axios.delete(`/accounts/${id}`);
      } else {
        throw e;
      }
    }

    // Thành công (200/204)
    // Cập nhật UI tại chỗ (không cần navigate)
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  } catch (error) {
    const code = error?.response?.status;

    if (code === 401 || code === 403) {
      alert("You are not authorized to delete this account.");
      return;
    }
    if (code === 404) {
      alert("Account not found. It may have been deleted already.");
      // Có thể loại bỏ khỏi UI luôn
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      return;
    }
    if (code === 409) {
      // thường là ràng buộc FK (account đang được link với employee/payments/...)
      alert("Cannot delete: this account is referenced by other data (e.g., an employee). Unlink/remove dependencies first.");
      return;
    }

    console.error("Failed to delete account", error);
    showError(error);
  }
};

  // ---- Create handlers
  const submitCreateAccount = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Gửi đúng field theo entity BE
      const payload = {
        fullName: accForm.fullName?.trim(),
        email: accForm.email?.trim(),
        phoneNumber: accForm.phoneNumber?.trim(),
        passwordHash: accForm.passwordHash || "",
        isActive: !!accForm.isActive,
        // role: { id: Number(accForm.roleId) } // nếu BE yêu cầu role object
      };
      await axios.post("/admin/accounts", payload);
      setShowCreateAcc(false);
      setAccForm({ fullName: "", email: "", phoneNumber: "", passwordHash: "", isActive: true });
      await reloadAccounts();
    } catch (err) {
      alert(err?.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitCreateEmployee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // BE không dùng DTO → nhận trực tiếp entity fields
      const payload = {
        position: empForm.position?.trim() || null,
        department: empForm.department?.trim() || null,
        hireDate: empForm.hireDate || null,
        salary: empForm.salary ? Number(empForm.salary) : null,
        status: empForm.status?.trim() || null
      };
      const params = {};
      if (empForm.accountId) params.accountId = Number(empForm.accountId);

      await axios.post("/employees", payload, { params });
      setShowCreateEmp(false);
      setEmpForm({ position: "", department: "", hireDate: "", salary: "", status: "Active", accountId: "" });
      await reloadEmployees();
    } catch (err) {
      alert(err?.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Guard: only Admin (role === "admin") can view this page
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
      } catch { }
    }
    return typeof rn === "string" ? rn.toLowerCase() : undefined;
  };

  const roleName = getRoleName();
  if (!user?.token) return <Navigate to="/login" replace />;
  if (roleName !== "admin") return <Navigate to="/" replace />;

  // ---- State
  const [accounts, setAccounts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState({ accounts: true, employees: true });
  const [error, setError] = useState({ accounts: "", employees: "" });
  const [qAcc, setQAcc] = useState("");
  const [qEmp, setQEmp] = useState("");

  // ---- Fetch data (điều chỉnh endpoint phù hợp BE của bạn)
  useEffect(() => {
    let alive = true;

    const loadAccounts = async () => {
      try {
        const { data } = await axios.get("/admin/accounts");
        // const { data } = await axios.get(endpoints.accounts());

        if (!alive) return;
        setAccounts(Array.isArray(data) ? data : data?.items ?? []);
      } catch (e) {
        if (!alive) return;
        setError((s) => ({ ...s, accounts: e?.response?.data?.message || e.message }));
      } finally {
        if (alive) setLoading((s) => ({ ...s, accounts: false }));
      }
    };

    const loadEmployees = async () => {
      try {
        const { data } = await axios.get("/admin/employees");
        if (!alive) return;
        setEmployees(Array.isArray(data) ? data : data?.items ?? []);
      } catch (e) {
        if (!alive) return;
        setError((s) => ({ ...s, employees: e?.response?.data?.message || e.message }));
      } finally {
        if (alive) setLoading((s) => ({ ...s, employees: false }));
      }
    };

    loadAccounts();
    loadEmployees();
    return () => { alive = false; };
  }, []);




  // ---- Helpers
  const norm = (v) => (v ?? "").toString().toLowerCase();

  const filteredAccounts = useMemo(() => {
    const q = norm(qAcc);
    if (!q) return accounts;
    return accounts.filter((a) =>
      [
        a.id,
        a.fullName,
        a.email,
        a.username,
        a.phone,
        // role có thể là string hoặc object
        typeof a.role === "string" ? a.role : a.role?.name,
        a.status,
      ]
        .map(norm)
        .some((s) => s.includes(q))
    );
  }, [accounts, qAcc]);

  const filteredEmployees = useMemo(() => {
    const q = norm(qEmp);
    if (!q) return employees;
    return employees.filter((e) =>
      [e.id, e.name || e.fullName, e.email, e.phone, e.position, e.department, e.status]
        .map(norm)
        .some((s) => s.includes(q))
    );
  }, [employees, qEmp]);

  const StatusBadge = ({ value }) => {
    const val = (value ?? "").toString().toLowerCase();
    const variant =
      val === "active" || val === "enabled" || val === "online" ? "success" :
        val === "pending" || val === "applying" ? "warning" :
          val === "banned" || val === "disabled" || val === "offline" ? "secondary" :
            "info";
    return <Badge bg={variant} className="text-uppercase">{value ?? "N/A"}</Badge>;
  };

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col>
          <h3 className="mb-0">Admin Dashboard</h3>
          <div className="text-muted">Manage Accounts & Employees</div>
        </Col>
        <Col className="text-end">
          <Button as={Link} to="/employee" variant="outline-secondary" className="me-2">Go to Employee</Button>
          <Button as={Link} to="/" variant="dark">Back to Home</Button>
        </Col>
      </Row>


      <Tabs defaultActiveKey="accounts" id="admin-tabs" className="mb-4">
        {/* -------- Accounts -------- */}
        <Tab eventKey="accounts" title={`Accounts (${accounts.length})`}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control
                placeholder="Search by name, email, username, phone, role, status..."
                value={qAcc}
                onChange={(e) => setQAcc(e.target.value)}
              />
            </Col>
            <Col className="text-end">
              <Button as={Link} to="/admin/account/create" variant="primary">
                + Create Account
              </Button>
            </Col>
          </Row>

          {loading.accounts ? (
            <div className="py-5 text-center"><Spinner animation="border" /> Loading accounts…</div>
          ) : error.accounts ? (
            <Alert variant="danger">Failed to load accounts: {error.accounts}</Alert>
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
                    <th style={{ width: 120 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-muted py-4">No accounts found</td></tr>
                  ) : filteredAccounts.map((a) => {
                    const roleLabel = typeof a.role === "string" ? a.role : (a.role?.name ?? "-");
                    return (
                      <tr key={a.id}>
                        <td>{a.id}</td>
                        <td>{a.fullName || "-"}</td>
                        <td>{a.email || "-"}</td>
                        <td>{a.phone || "-"}</td>
                        <td className="text-capitalize">{roleLabel || "-"}</td>
                        <td><StatusBadge value={a.isActive ? "Active" : "Disabled"} /></td>
                        <td className="text-nowrap">
                          <Button size="sm" variant="outline-danger" className="me-2" onClick={() => handleDeleteAccount(a.id)}> Delete </Button>
                          <Button as={Link} to={`/admin/accounts/${a.id}`} size="sm" variant="outline-secondary">Edit</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Tab>

        {/* -------- Employees -------- */}
        <Tab eventKey="employees" title={`Employees (${employees.length})`}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control
                placeholder="Search by name, email, phone, position, department, status..."
                value={qEmp}
                onChange={(e) => setQEmp(e.target.value)}
              />
            </Col>
            <Col className="text-end">
              <Button onClick={() => setShowCreateEmp(true)} variant="primary">
                + Create Employee
              </Button>
            </Col>
          </Row>

          {loading.employees ? (
            <div className="py-5 text-center"><Spinner animation="border" /> Loading employees…</div>
          ) : error.employees ? (
            <Alert variant="danger">Failed to load employees: {error.employees}</Alert>
          ) : (
            <div className="table-responsive">
              <Table hover bordered size="sm" className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 80 }}>ID</th>
                    <th>Employee ID</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Salary</th>
                    <th>Hire Date</th>
                    <th>Status</th>
                    <th style={{ width: 120 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-muted py-4">No employees found</td></tr>
                  ) : filteredEmployees.map((e) => (
                    <tr key={e.id}>
                      <td>{e.id}</td>
                      <td>{e.employeeCode || e.fullName || "-"}</td>
                      <td>{e.account || "-"}</td>
                      <td>{e.account.phone || "-"}</td>
                      <td>{e.position || "-"}</td>
                      <td>{e.department || "-"}</td>
                      <td>{e.salary || "-"}</td>
                      <td>{e.hireDate || "-"}</td>
                      <td><StatusBadge value={e.status} /></td>
                      <td className="text-nowrap">
                        <Button as={Link} to={`/employee/${e.id}/delete`} size="sm" variant="outline-primary" className="me-2">Deactive</Button>
                        <Button as={Link} to={`/employee/${e.id}/edit`} size="sm" variant="outline-secondary">Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
}
