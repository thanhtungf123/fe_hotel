// Enhanced Admin Page - Luxury Design
import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table, Alert, Form, Badge, Tabs, Tab, Button } from "react-bootstrap";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../api/axiosInstance";
import { useAuth } from "../store/auth";
import showToast from "../utils/toast";
import { GridSkeleton } from "../components/common/LoadingSkeleton";
import RoomManagement from "../components/admin/RoomManagement";
import ServicesManagement from "../components/admin/ServicesManagement";
import WalkInBooking from "../components/admin/WalkInBooking";
import CancelRequestsTab from "../components/admin/CancelRequestsTab";
import StaffBookings from "../components/admin/StaffBookings";
import AdminSchedule from "../pages/admin/AdminSchedule";

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState({ accounts: true, employees: true });
  const [error, setError] = useState({ accounts: "", employees: "" });
  const [qAcc, setQAcc] = useState("");
  const [qEmp, setQEmp] = useState("");

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
  const isAdmin = roleName === "admin";

  useEffect(() => {
    let alive = true;

    const loadAccounts = async () => {
      try {
        const { data } = await axios.get("/admin/accounts");
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
      // Only load employees if user is admin
      if (!isAdmin) {
        if (alive) setLoading((s) => ({ ...s, employees: false }));
        return;
      }
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
  }, [isAdmin]);

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

  if (!user?.token) return <Navigate to="/login" replace />;
  // Allow both admin and staff to access
  if (roleName !== "admin" && roleName !== "staff") return <Navigate to="/" replace />;

  const handleDeleteAccount = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;

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
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      const code = error?.response?.status;
      if (code === 401 || code === 403) {
        alert("You are not authorized to delete this account.");
        return;
      }
      if (code === 404) {
        alert("Account not found. It may have been deleted already.");
        setAccounts((prev) => prev.filter((a) => a.id !== id));
        return;
      }
      if (code === 409) {
        alert("Cannot delete: this account is referenced by other data.");
        return;
      }
      console.error("Failed to delete account", error);
      alert(`Delete failed: ${error?.message || "Unknown error"}`);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await axios.delete(`/admin/employees/${id}`);
      setEmployees((prev) =>
        prev.map((it) => (it.id === id ? { ...it, status: "terminated" } : it))
      );
    } catch (e) {
      alert(`Deactivate failed: ${e?.response?.data?.message || e?.message || "Unknown error"}`);
    }
  };

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Container className="py-4" style={{ maxWidth: "1400px" }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Row className="mb-4 align-items-center">
            <Col>
              <h2
                className="mb-1"
                style={{
                  fontFamily: "Playfair Display, serif",
                  color: "var(--primary-dark)"
                }}
              >
                🏨 {isAdmin ? "Admin Dashboard" : "Staff Dashboard"}
              </h2>
              <div className="text-muted">
                {isAdmin ? "Quản lý Khách hàng, Nhân viên & Phòng" : "Quản lý Khách hàng & Phòng"}
              </div>
            </Col>
            <Col className="text-end">
              {isAdmin && (
                <>
                  <Button as={Link} to="/admin/reports" variant="warning" className="me-2" style={{ borderRadius: "10px" }}>
                    Báo cáo
                  </Button>
                  <Button as={Link} to="/employee" variant="outline-secondary" className="me-2" style={{ borderRadius: "10px" }}>
                    Đến trang Nhân viên
                  </Button>
                </>
              )}
              <Button as={Link} to="/" style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)", border: "none", borderRadius: "10px" }}>
                Về trang chủ
              </Button>
            </Col>
          </Row>
        </motion.div>

        <Tabs defaultActiveKey="accounts" id="admin-tabs" className="mb-4" style={{ borderBottom: "2px solid rgba(201, 162, 74, 0.3)" }}>
          {/* -------- Accounts -------- */}
          <Tab eventKey="accounts" title={`Customer (${accounts.length})`}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Control placeholder="Search by name, email, username, phone, role, status..." value={qAcc} onChange={(e) => setQAcc(e.target.value)} />
              </Col>
              <Col className="text-end">
                <Button as={Link} to="/admin/account/create" variant="primary">+ Create Account</Button>
              </Col>
            </Row>

            {loading.accounts ? (
              <GridSkeleton cols={1} rows={1} />
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
                          <td>{a.phoneNumber || "-"}</td>
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

          <Tab eventKey="rooms" title="Quản lý phòng">
            <RoomManagement />
          </Tab>

          {isAdmin && (
            <Tab eventKey="employees" title={`Employees (${employees.length})`}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Control placeholder="Search by name, email, phone, position, department, status..." value={qEmp} onChange={(e) => setQEmp(e.target.value)} />
                </Col>
                <Col className="text-end">
                  <Button as={Link} to="/admin/employee/create" variant="primary">+ Create Employee</Button>
                </Col>
              </Row>

              {loading.employees ? (
                <GridSkeleton cols={1} rows={1} />
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
                        <tr><td colSpan={9} className="text-center text-muted py-4">No employees found</td></tr>
                      ) : filteredEmployees.map((e) => (
                        <tr key={e.id}>
                          <td>{e.id}</td>
                          <td>{e.employeeCode || e.fullName || "-"}</td>
                          <td>{e.account?.email || "-"}</td>
                          <td>{e.account?.phone || "-"}</td>
                          <td>{e.position || "-"}</td>
                          <td>{e.department || "-"}</td>
                          <td>{e.salary || "-"}</td>
                          <td>{e.hireDate || "-"}</td>
                          <td><StatusBadge value={e.status} /></td>
                          <td className="text-nowrap">
                            <Button size="sm" variant="outline-warning" className="me-2" onClick={() => handleDeleteEmployee(e.id)}>Deactivate</Button>
                            <Button as={Link} to={`/admin/employees/${e.id}`} size="sm" variant="outline-secondary">Edit</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Tab>
          )}

          <Tab eventKey="services" title="Quản lý dịch vụ">
            <ServicesManagement />
          </Tab>

          <Tab eventKey="walkin" title="Đặt phòng trực tiếp">
            <WalkInBooking />
          </Tab>

          <Tab eventKey="cancels" title="Duyệt huỷ đặt phòng">
            <CancelRequestsTab />
          </Tab>

          <Tab eventKey="staffBookings" title="Quản lý booking">
            <StaffBookings />
          </Tab>

          <Tab eventKey="schedule" title="Lịch làm việc">
            <AdminSchedule />
          </Tab>
        </Tabs>
      </Container>
    </motion.div>
  );
}
