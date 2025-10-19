// src/pages/ShowAccountHistory.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Container, Row, Col, Table, Spinner, Alert,
  Form, Badge, Button
} from "react-bootstrap";
import { Link, useParams, Navigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { useAuth } from "../../store/auth";

export default function ShowAccountHistory() {
  const { id } = useParams(); // account id
  const { user } = useAuth();

  // ---- Guards
  if (!user?.token) return <Navigate to="/login" replace />;

  // ---- State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  // ---- Helpers
  const fmtDate = (d) => {
    if (!d) return "-";
    try {
      // accept ISO string or yyyy-MM-dd
      const dt = typeof d === "string" ? new Date(d) : d;
      if (Number.isNaN(dt.getTime())) return d; // show raw if unknown
      return dt.toLocaleString();
    } catch {
      return d?.toString?.() ?? "-";
    }
  };

  const fmtLocalDate = (d) => {
    if (!d) return "-";
    try {
      // For LocalDate (yyyy-MM-dd) -> keep date only
      if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return d;
      return dt.toISOString().slice(0, 10);
    } catch {
      return d?.toString?.() ?? "-";
    }
  };

  const fmtMoney = (v) => {
    if (v == null) return "-";
    const num = Number(v);
    if (Number.isNaN(num)) return String(v);
    return num.toLocaleString(undefined, { style: "currency", currency: "VND", maximumFractionDigits: 0 });
  };

  const StatusBadge = ({ value }) => {
    const val = (value ?? "").toString().toLowerCase();
    const variant =
      val === "confirmed" || val === "checked_in" || val === "completed" || val === "active"
        ? "success"
        : val === "pending" || val === "reserved"
        ? "warning"
        : val === "cancelled" || val === "canceled" || val === "terminated"
        ? "secondary"
        : val === "checked_out"
        ? "info"
        : "dark";
    return <Badge bg={variant} className="text-uppercase">{value ?? "N/A"}</Badge>;
  };

  // ====== 🔧 useEffect: Gọi đúng endpoint /accountHistory/{id} ======
  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const { data } = await axios.get(`/admin/accountHistory/${id}`);
        const items = Array.isArray(data) ? data : data?.items ?? [];
        if (alive) setItems(items);
      } catch (e) {
        if (alive) setErr(e?.response?.data?.message || e.message || "Failed to load account history");
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, [id]);

  // ---- Filters
  const norm = (v) => (v ?? "").toString().toLowerCase();
  const filtered = useMemo(() => {
    const qq = norm(q);
    const ss = norm(status);
    return items.filter((b) => {
      const matchesQ = !qq
        ? true
        : [
            b.id,
            b.room?.roomNumber ?? b.roomNumber,
            b.status,
            b.totalPrice,
            b.cancelReason,
            b.account?.fullName ?? b.account?.name,
          ]
            .map(norm)
            .some((s) => s.includes(qq));
      const matchesS = !ss ? true : norm(b.status) === ss;
      return matchesQ && matchesS;
    });
  }, [items, q, status]);

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col>
          <h3 className="mb-0">Account History</h3>
          <div className="text-muted">Booking history for Account ID: <strong>{id}</strong></div>
        </Col>
        <Col className="text-end">
          <Button as={Link} to="/admin" variant="outline-secondary" className="me-2">← Back to Admin</Button>
          <Button as={Link} to="/" variant="dark">Home</Button>
        </Col>
      </Row>

      <Row className="mb-3 g-2">
        <Col md={6}>
          <Form.Control
            placeholder="Search by booking id, room, status, price, cancel reason…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">— Filter by status —</option>
            <option value="pending">Pending</option>
            <option value="reserved">Reserved</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
            <option value="canceled">Canceled</option>
            <option value="terminated">Terminated</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <div className="py-5 text-center"><Spinner animation="border" /> Loading history…</div>
      ) : err ? (
        <Alert variant="danger">Failed to load: {err}</Alert>
      ) : (
        <div className="table-responsive">
          <Table hover bordered size="sm" className="align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th style={{ width: 110 }}>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Cancel Reason</th>
                <th>Cancel Requested At</th>
                <th>Cancel Approved By</th>
                <th>Cancel Approved At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={11} className="text-center text-muted py-4">No bookings found</td></tr>
              ) : filtered.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.room?.roomNumber ?? b.roomNumber ?? "-"}</td>
                  <td>{fmtLocalDate(b.checkIn)}</td>
                  <td>{fmtLocalDate(b.checkOut)}</td>
                  <td>{fmtMoney(b.totalPrice)}</td>
                  <td><StatusBadge value={b.status} /></td>
                  <td>{fmtDate(b.createdAt)}</td>
                  <td className="text-break" style={{ maxWidth: 260 }}>
                    {b.cancelReason || "-"}
                  </td>
                  <td>{fmtDate(b.cancelRequestedAt)}</td>
                  <td>{b.cancelApprovedBy ?? "-"}</td>
                  <td>{fmtDate(b.cancelApprovedAt)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}
