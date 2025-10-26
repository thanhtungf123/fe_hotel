// src/components/admin/ShowCreateServices.jsx
import React, { useState } from "react";
import { Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";

/**
 * Create form for Services (service_id, service_name, description, price).
 * Maps fields to JSON: { nameService, description, price }.
 *
 * Props (all optional):
 *  - endpoint:    string  default "/admin/services"
 *  - fallback:    string  default "/services" (used if endpoint fails)
 *  - backTo:      string  default "/admin/services" (navigate after success)
 *  - onCreated:   fn      called with created service
 */
export default function ShowCreateServices({
  endpoint = "/admin/service/create",
  fallback = "/services",
  backTo = "/admin",
  onCreated,
}) {
  const nav = useNavigate();

  const [nameService, setNameService] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const parsePrice = (v) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const submitTo = async (url, body) => {
    // First try with "nameService"; if BE expects "serviceName", retry below.
    try {
      return await axios.post(url, body);
    } catch (err) {
      // Retry with alternative key if server complains about field names
      const code = err?.response?.status ?? 0;
      if (code >= 400) {
        const alt = { ...body, serviceName: body.nameService };
        delete alt.nameService;
        return await axios.post(url, alt);
      }
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    const body = {
      nameService: nameService.trim(),
      description: description.trim() || null,
      price: parsePrice(price),
    };

    if (!body.nameService) return setError("Service name is required.");
    if (body.price === null) return setError("Price must be a number.");
    if (body.price < 0) return setError("Price cannot be negative.");

    setSaving(true);
    try {
      let res;
      try {
        res = await submitTo(endpoint, body);
      } catch (err1) {
        const code = err1?.response?.status ?? 0;
        if (code === 404 || code === 405 || code >= 500) {
          res = await submitTo(fallback, body);
        } else {
          throw err1;
        }
      }

      const created = res?.data;
      setOk("Service created successfully.");
      if (onCreated) onCreated(created);

      if (backTo) {
        nav(backTo);
      } else {
        // stay on page and reset form
        setNameService("");
        setDescription("");
        setPrice("");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to create service."
      );
      // eslint-disable-next-line no-console
      console.error("Create service failed:", err?.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <Card.Body>
        <h5 className="mb-3">Create Service</h5>
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        {ok && <Alert variant="success" className="mb-3">{ok}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="svcName">
                <Form.Label>Service name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter service name"
                  value={nameService}
                  onChange={(e) => setNameService(e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  Maps to column <code>service_name</code> (field <code>nameService</code>).
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="svcPrice">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  Numeric (double) value.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="svcDesc">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Optional description…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button as={Link} to={backTo || "/admin"} variant="outline-secondary" disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? (<><Spinner size="sm" animation="border" /> Saving…</>) : "Create Service"}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
