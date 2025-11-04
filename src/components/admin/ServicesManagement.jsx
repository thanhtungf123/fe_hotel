// src/components/admin/ServiceManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Table, Spinner, Alert, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "../../api/axiosInstance";
/**
 * ServiceManagement
 * - Lists services with { id, nameService, price }
 * - Search, Edit, Delete, and Create actions
 * - Tries /admin/services first, falls back to /services
 *
 * Props (optional):
 *   endpoint        : string   default "/admin/services"
 *   fallback        : string   default "/services"
 *   createPath      : string   default "/admin/service/create"
 *   editBasePath    : string   default "/admin/services"
 */
export default function ServiceManagement({
  endpoint = "/admin/services",
  fallback = "/services",
  createPath = "/admin/service/create",
  editBasePath = "/admin/services",
}) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        let res;
        try {
          res = await axios.get(endpoint);
        } catch (e) {
          const code = e?.response?.status;
          if (code === 404 || code === 405) {
            res = await axios.get(fallback);
          } else {
            throw e;
          }
        }
        if (!alive) return;
        const data = res.data;
        setServices(Array.isArray(data) ? data : data?.items ?? []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message || e.message || "Failed to load services");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => { alive = false; };
  }, [endpoint, fallback]);

  const norm = (v) => (v ?? "").toString().toLowerCase();
  const formatPrice = (v) => {
    if (v == null || v === "") return "-";
    const num = Number(v);
    if (Number.isNaN(num)) return String(v);
    return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const filtered = useMemo(() => {
    const k = norm(q);
    if (!k) return services;
    return services.filter((s) => {
      const idStr = s?.id != null ? String(s.id) : "";
      const name = s?.nameService ?? s?.serviceName ?? s?.name ?? "";
      const priceStr = s?.price != null ? String(s.price) : "";
      return [idStr, name, priceStr].map(norm).some((x) => x.includes(k));
    });
  }, [services, q]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    const msgOf = (err) =>
      err?.response?.data?.message || err?.response?.data || err?.message || "Unknown error";

    try {
      try {
        await axios.delete(`${endpoint}/${id}`);
      } catch (e) {
        const code = e?.response?.status;
        if (code === 404 || code === 405) {
          await axios.delete(`${fallback}/${id}`);
        } else {
          throw e;
        }
      }
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      alert(`Delete failed: ${msgOf(e)}`);
    }
  };

  return (
    <>
      {/* Filter + Create */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            placeholder="Search by id, name, or price…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Col>
        <Col className="text-end">
          <Button as={Link} to={createPath} variant="primary">
            + Create Service
          </Button>
        </Col>
      </Row>

      {/* Table */}
      {loading ? (
        <div className="py-5 text-center">
          <Spinner animation="border" /> Loading services…
        </div>
      ) : err ? (
        <Alert variant="danger">Failed to load services: {err}</Alert>
      ) : (
        <div className="table-responsive">
          <Table hover bordered size="sm" className="align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 90 }}>ID</th>
                <th>Name</th>
                <th style={{ width: 180 }}>Price</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    No services found
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const name = s.nameService ?? s.serviceName ?? s.name ?? "-";
                  return (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{name}</td>
                      <td>{formatPrice(s.price)}</td>
                      <td className="text-nowrap">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="me-2"
                          onClick={() => handleDelete(s.id)}
                        >
                          Delete
                        </Button>
                        <Button
                          as={Link}
                          to={`${editBasePath}/${s.id}`}
                          size="sm"
                          variant="outline-secondary"
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      )}
    </>
  );
}
