import React, { useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Table, Spinner, Alert, Form, Button, Badge } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { useAuth } from "../../store/auth";

export default function AdminSchedules() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  // ---- Check role ----
  // const roleName = user?.role?.name?.toLowerCase() || user?.role?.role_name?.toLowerCase() || "";
  // if (!user?.token) return <Navigate to="/login" replace />;
  // if (roleName !== "admin") return <Navigate to="/" replace />;

  // ---- Load work shifts ----
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const { data } = await axios.get("/admin/workshifts"); // BE endpoint
        if (alive) setSchedules(Array.isArray(data) ? data : data?.items ?? []);
      } catch (e) {
        if (alive) setError(e?.response?.data?.message || e.message);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, []);

  // ---- Filter ----
  const norm = (v) => (v ?? "").toString().toLowerCase();
  const filtered = useMemo(() => {
    const q = norm(query);
    if (!q) return schedules;
    return schedules.filter(s =>
      [s.employee?.employeeCode, s.employee?.account?.fullName, s.shiftDate, s.shiftType, s.status]
        .map(norm)
        .some(v => v.includes(q))
    );
  }, [schedules, query]);

  // ---- Badge component ----
  const StatusBadge = ({ value }) => {
    const val = (value ?? "").toLowerCase();
    const variant =
      val === "completed" ? "success" :
      val === "pending" ? "warning" :
      val === "cancelled" ? "danger" : "secondary";
    return <Badge bg={variant}>{value || "N/A"}</Badge>;
  };

  // ---- Main render ----
  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col>
          <h3>Employee Work Schedules</h3>
          <div className="text-muted">Manage shift assignments for all employees</div>
        </Col>
        <Col className="text-end">
          <Button as={Link} to="/admin" variant="outline-secondary" className="me-2">Back to Admin</Button>
          <Button as={Link} to="/admin/schedules/create" variant="primary">+ Assign Shift</Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            placeholder="Search by employee, date, shift type, status..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Col>
      </Row>

      {loading ? (
        <div className="py-5 text-center"><Spinner animation="border" /> Loading schedules…</div>
      ) : error ? (
        <Alert variant="danger">Failed to load: {error}</Alert>
      ) : (
        <div className="table-responsive">
          <Table hover bordered size="sm" className="align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Employee</th>
                <th>Shift Date</th>
                <th>Shift Type</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th>Notes</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-muted py-4">No schedules found</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.employee?.account?.fullName || s.employee?.employeeCode || "-"}</td>
                  <td>{s.shiftDate || "-"}</td>
                  <td>{s.shiftType || "-"}</td>
                  <td>{s.startTime || "-"}</td>
                  <td>{s.endTime || "-"}</td>
                  <td><StatusBadge value={s.status} /></td>
                  <td>{s.notes || "-"}</td>
                  <td className="text-nowrap">
                    <Button as={Link} to={`/admin/schedules/${s.id}`} size="sm" variant="outline-secondary" className="me-2">Edit</Button>
                    <Button size="sm" variant="outline-danger">Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}
