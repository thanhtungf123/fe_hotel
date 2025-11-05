// src/pages/ShowEditEmployee.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "../../api/axiosInstance";

/** Ép mọi lỗi về string để không crash UI khi render */
const msgOf = (e) => {
  const d = e?.response?.data;
  if (typeof d === "string") return d;
  if (d?.message) return d.message;
  try { return JSON.stringify(d ?? e?.message ?? "Unknown error"); } catch { return String(e); }
};

export default function ShowEditEmployee() {
  const navigate = useNavigate();
  const { id } = useParams();

  // --- data state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    employeeCode: "",
    position: "",
    department: "",
    hireDate: "",     // yyyy-mm-dd
    salary: "",       // string, server BigDecimal
    status: "active",
    accountId: "",    // select value "" | id as string
  });

  // accounts dropdown
  const [accLoading, setAccLoading] = useState(true);
  const [accError, setAccError] = useState("");
  const [accounts, setAccounts] = useState([]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // load employee + accounts
  useEffect(() => {
    let alive = true;

    const loadEmployee = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`/admin/employees/${id}`);
        if (!alive) return;

        setForm((s) => ({
          ...s,
          employeeCode: data?.employeeCode ?? "",
          position: data?.position ?? "",
          department: data?.department ?? "",
          hireDate: data?.hireDate ?? "",
          salary: (data?.salary ?? "")?.toString(),
          status: (data?.status ?? "active").toLowerCase(),
          accountId: data?.account?.id != null ? String(data.account.id) : "",
        }));
      } catch (ex) {
        if (!alive) return;
        setError(msgOf(ex));
      } finally {
        if (alive) setLoading(false);
      }
    };

    const loadAccounts = async () => {
      setAccLoading(true);
      setAccError("");
      try {
        let data;
        try {
          ({ data } = await axios.get("/admin/accounts"));
        } catch (ex1) {
          const code = ex1?.response?.status;
          if (code === 404 || code === 405) {
            ({ data } = await axios.get("/accounts"));
          } else {
            throw ex1;
          }
        }
        if (!alive) return;
        const list = Array.isArray(data) ? data : (data?.items ?? data?.content ?? []);
        setAccounts(list.map((a) => ({
          id: a.id ?? a.accountId ?? a.account_id,
          fullName: a.fullName ?? a.full_name ?? "(no name)",
          email: a.email ?? "-",
        })));
      } catch (ex) {
        if (!alive) return;
        setAccError(msgOf(ex));
      } finally {
        if (alive) setAccLoading(false);
      }
    };

    loadEmployee();
    loadAccounts();
    return () => { alive = false; };
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        employeeCode: form.employeeCode?.trim() || null,
        position: form.position?.trim() || null,
        department: form.department?.trim() || null,
        hireDate: form.hireDate || null,
        salary: form.salary !== "" ? form.salary : null,
        status: form.status?.trim() || null,
      };

      const params = {};
      if (form.accountId && form.accountId !== "") {
        const aid = Number.parseInt(form.accountId, 10);
        if (!Number.isNaN(aid)) params.accountId = aid;  // controller create có param; update tuỳ bạn có thêm hay chưa
      }

      await axios.put(`/admin/employees/${id}`, payload, { params });
      navigate("/admin");
    } catch (ex) {
      setError(msgOf(ex));
    } finally {
      setSaving(false);
    }
  };

  const accountOptions = useMemo(() => {
    return [
      { id: "", label: "— Keep / Unlink —" },
      ...accounts.map(a => ({ id: String(a.id), label: `${a.fullName} (${a.email})` })),
    ];
  }, [accounts]);

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col>
          <h3 className="mb-0">Edit Employee</h3>
          <div className="text-muted">Update employee #{id}</div>
        </Col>
        <Col className="text-end">
          <Button as={Link} to="/admin" variant="secondary">Back to Admin</Button>
        </Col>
      </Row>

      {loading ? (
        <div className="py-5 text-center">
          <Spinner animation="border" /> Loading employee…
        </div>
      ) : (
        <Card>
          <Card.Body>
            {error && <Alert variant="danger" className="mb-3">{String(error)}</Alert>}

            <Form onSubmit={submit}>
              <Row className="g-3">
                {/* Link / change Account (optional) */}
                <Col md={6}>
                  <Form.Label>Link Account</Form.Label>
                  {accLoading ? (
                    <div className="d-flex align-items-center gap-2">
                      <Spinner animation="border" size="sm" /> Loading accounts…
                    </div>
                  ) : accError ? (
                    <Alert variant="warning" className="p-2 mb-0">
                      Cannot load accounts: {String(accError)}. You can still update other fields.
                    </Alert>
                  ) : (
                    <Form.Select
                      name="accountId"
                      value={form.accountId}
                      onChange={onChange}
                    >
                      {accountOptions.map(opt => (
                        <option key={opt.id || "none"} value={opt.id}>{opt.label}</option>
                      ))}
                    </Form.Select>
                  )}
                  <Form.Text className="text-muted">
                    Để trống để giữ nguyên; chọn “— Keep / Unlink —” để bỏ liên kết account.
                  </Form.Text>
                </Col>

                <Col md={6}>
                  <Form.Label>Employee Code</Form.Label>
                  <Form.Control
                    name="employeeCode"
                    value={form.employeeCode}
                    onChange={onChange}
                    placeholder="VD: EMP-001"
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Position</Form.Label>
                  <Form.Control
                    name="position"
                    value={form.position}
                    onChange={onChange}
                    placeholder="VD: Receptionist"
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    name="department"
                    value={form.department}
                    onChange={onChange}
                    placeholder="VD: Front Office"
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Hire Date</Form.Label>
                  <Form.Control
                    name="hireDate"
                    type="date"
                    value={form.hireDate}
                    onChange={onChange}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Salary</Form.Label>
                  <Form.Control
                    name="salary"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.salary}
                    onChange={onChange}
                    placeholder="VD: 1200.00"
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={form.status}
                    onChange={onChange}
                  >
                    <option value="active">active</option>
                    <option value="on_leave">on_leave</option>
                    <option value="terminated">terminated</option>
                  </Form.Select>
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
