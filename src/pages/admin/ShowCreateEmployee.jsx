// // src/pages/ShowCreateEmployee.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../api/axiosInstance";

export default function ShowCreateEmployee() {
  const navigate = useNavigate();

  // load danh sách account để liên kết (optional)
  const [accLoading, setAccLoading] = useState(true);
  const [accError, setAccError] = useState("");
  const [accounts, setAccounts] = useState([]);

  // form state
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    accountId: "",        // optional: "" | number as string
    employeeCode: "",
    position: "",
    department: "",
    hireDate: "",         // yyyy-mm-dd
    salary: "",           // string -> server BigDecimal
    status: "Active",     // gợi ý: Active/Disabled/Pending...
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // Load accounts để cho vào select
  useEffect(() => {
    let alive = true;
    (async () => {
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
          } else throw ex1;
        }
        if (!alive) return;
        const list = Array.isArray(data) ? data : (data?.items ?? data?.content ?? []);
        // Chuẩn hoá một chút cho hiển thị
        setAccounts(
          list.map((a) => ({
            id: a.id ?? a.accountId ?? a.account_id,
            fullName: a.fullName ?? a.full_name ?? "(no name)",
            email: a.email ?? "-",
          }))
        );
      } catch (ex) {
        if (!alive) return;
        setAccError(ex?.response?.data?.message || ex.message || "Failed to load accounts");
      } finally {
        if (alive) setAccLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    try {
      // tối thiểu BE cần các field của Employee; accountId là query param nếu chọn
      const payload = {
        employeeCode: form.employeeCode?.trim() || null,
        position: form.position?.trim() || null,
        department: form.department?.trim() || null,
        hireDate: form.hireDate || null,
        salary: form.salary !== "" ? form.salary : null, // BigDecimal string
        status: form.status?.trim() || null,
      };

      const params = {};
      if (form.accountId && form.accountId !== "") {
        const idNum = Number.parseInt(form.accountId, 10);
        if (!Number.isNaN(idNum)) params.accountId = idNum;
      }

      await axios.post("/admin/employees", payload, { params });
      navigate("/admin");
    } catch (ex) {
      const msg =
        ex?.response?.data?.message ||
        ex?.response?.data ||
        ex?.message ||
        "Cannot create employee.";
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col>
          <h3 className="mb-0">Create Employee</h3>
          <div className="text-muted">Add a new employee (link to an account is optional)</div>
        </Col>
        <Col className="text-end">
          <Button as={Link} to="/admin" variant="secondary">Back to Admin</Button>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {err && <Alert variant="danger" className="mb-3">{err}</Alert>}

          <Form onSubmit={submit}>
            <Row className="g-3">
              {/* Account liên kết (optional) */}
              <Col md={6}>
                <Form.Label>Link Account (optional)</Form.Label>
                {accLoading ? (
                  <div className="d-flex align-items-center gap-2">
                    <Spinner animation="border" size="sm" /> Loading accounts…
                  </div>
                ) : accError ? (
                  <Alert variant="warning" className="p-2 mb-0">
                    Cannot load accounts: {accError}. You can still create employee without linking.
                  </Alert>
                ) : (
                  <Form.Select
                    name="accountId"
                    value={form.accountId}
                    onChange={onChange}
                  >
                    <option value="">— No link —</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.fullName} ({a.email})
                      </option>
                    ))}
                  </Form.Select>
                )}
                <Form.Text className="text-muted">
                  Không bắt buộc. Có thể liên kết sau bằng cách cập nhật Employee.
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
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Disabled">Disabled</option>
                </Form.Select>
              </Col>
            </Row>

            <div className="mt-4 d-flex gap-2">
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Creating..." : "Create"}
              </Button>
              <Button as={Link} to="/admin" variant="outline-secondary" disabled={submitting}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
