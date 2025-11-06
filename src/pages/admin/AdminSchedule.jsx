import React, { useEffect, useState, useMemo } from "react";
// --- CẢI TIẾN: Thêm Card và các Icon ---
import { Container, Row, Col, Table, Spinner, Alert, Form, Button, Badge, Card, Modal } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
// SỬA LỖI: Không tìm thấy module, tạm thời comment out
// import { PencilSquare, Trash } from "react-bootstrap-icons"; // <-- Khôi phục icon
// SỬA LỖI: Không tìm thấy module, thay bằng axios gốc
import axios from "../../api/axiosInstance";
import { Trash } from "react-bootstrap-icons";
import { useAuth } from "../../store/auth";

// 1. Hàm helper để định dạng ngày giờ
/**
 * Tách chuỗi ISO "2025-10-29T07:35:00" thành object
 * @param {string} isoString 
 * @returns {{date: string, time: string}} Ví dụ: { date: "29/10/2025", time: "07:35" }
 */
const formatDateTime = (isoString) => {
  if (!isoString) {
    return { date: "-", time: "-" };
  }
  try {
    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) {
      // Xử lý nếu chuỗi không hợp lệ
      return { date: "-", time: "-" };
    }

    // Lấy giờ và phút (thêm '0' nếu cần)
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    
    // Lấy ngày, tháng, năm (thêm '0' nếu cần)
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = dateObj.getFullYear();

    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`
    };
  } catch (e) {
    console.error("Lỗi định dạng ngày:", e);
    return { date: "Lỗi", time: "Lỗi" };
  }
};


export default function AdminSchedules() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    query: "",    // Cho Tên hoặc Mã NV
    status: "",   // Cho Trạng thái
    date: ""      // Cho Ngày (Format YYYY-MM-DD từ input)
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---- Check role ----
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

  // --- Cập nhật state bộ lọc ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const norm = (v) => (v ?? "").toString().toLowerCase();

  // --- Cập nhật Logic filter ---
  const filtered = useMemo(() => {
    const q = norm(filters.query);
    const status = norm(filters.status);
    const dateInput = norm(filters.date); // Format: YYYY-MM-DD

    return schedules.filter(s => {
      const nameMatch = q ? 
        [s.employee?.employeeCode, s.employee?.account?.fullName]
          .map(norm)
          .some(v => v.includes(q)) 
        : true;
      
      const statusMatch = status ? norm(s.status) === status : true;
      const shiftDateRaw = (s.startTime || "").split("T")[0]; // Lấy "2025-10-29" từ "2025-10-29T..."
      const dateMatch = dateInput ? shiftDateRaw === dateInput : true;
      const detailsMatch = q ? 
        [s.employee?.employeeCode, s.employee?.account?.fullName, s.shiftDetails]
          .map(norm)
          .some(v => v.includes(q))
        : true;

      return (nameMatch || detailsMatch) && statusMatch && dateMatch;
    });
  }, [schedules, filters]);

  // ---- Badge component cho Status ----
  const StatusBadge = ({ value }) => {
    // ... (giữ nguyên) ...
    const val = (value ?? "").toLowerCase();
    const variant =
      val === "completed" ? "success" :
      val === "pending" ? "warning" :
      val === "cancelled" ? "danger" : "secondary";
    return <Badge bg={variant}>{value || "N/A"}</Badge>;
  };

  // ---  CẬP NHẬT: Badge cho ShiftDetails  ---
  const ShiftDetailsBadge = ({ value }) => {
    const shiftType = (value || "N/A").split(" ")[0]; // Lấy "MORNING" từ "MORNING - Ghi chú"
    const val = norm(shiftType);
    
    const variant =
      val === "morning" ? "info" :
      val === "afternoon" ? "primary" :
      val === "night" ? "dark" : 
      val === "fullday" ? "success" : "light";
      
    const text = (val === "night" || val === "fullday") ? "light" : "dark";

    return <Badge bg={variant} text={text}>{shiftType}</Badge>;
  };

  // ---- Xử lý Xoá ----
  
  // 1. Mở modal khi nhấn nút Xóa
  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
    setError(""); // Xóa lỗi cũ
  };

  // 2. Đóng modal
  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setDeletingId(null);
  };

  // 3. Xác nhận xóa (Gọi API)
  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    setError("");

    try {
      // Gọi API theo yêu cầu của bạn
      await axios.delete(`/admin/schedules/${deletingId}`);

      // Cập nhật UI: Lọc bỏ ca đã xóa ra khỏi state
      setSchedules(prevSchedules =>
        prevSchedules.filter(schedule => schedule.id !== deletingId)
      );

      // Đóng modal
      handleCloseModal();

    } catch (err) {
      // Hiển thị lỗi (có thể trong modal hoặc alert chung)
      setError(err.response?.data?.message || "Không thể xóa lịch làm việc này.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ---- Main render ----
  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-light p-3">
          {/* ... (giữ nguyên phần Header) ... */}
          <Row className="align-items-center">
            <Col md={6}>
              <h3 className="mb-0">Employee Work Schedules</h3>
              <div className="text-muted">Manage shift assignments for all employees</div>
            </Col>
            <Col md={6} className="text-md-end mt-2 mt-md-0">
              <Button as={Link} to="/admin" variant="outline-secondary" className="me-2">
                Back to Admin
              </Button>
              {isAdmin && (
                <Button as={Link} to="/admin/schedules/create" variant="primary">
                  + Assign Shift
                </Button>
              )}
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* ... (giữ nguyên phần Filters) ... */}
          <Row className="mb-3 gx-2">
            <Col md={5}>
              <Form.Control
                name="query"
                placeholder="Search by Employee, Code, Shift Details..." // Cập nhật placeholder
                value={filters.query}
                onChange={handleFilterChange}
              />
            </Col>
            <Col md={4}>
              <Form.Control
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
              />
            </Col>
            <Col md={3}>
              <Form.Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>
          </Row>

          {loading ? (
            <div className="py-5 text-center"><Spinner animation="border" /> Loading schedules…</div>
          ) : error ? (
            <Alert variant="danger">Failed to load: {error}</Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 70 }}>ID</th>
                    <th>Employee</th>
                    {/* --- ⭐ CẬP NHẬT TÊN CỘT --- */}
                    <th>Shift Date</th>
                    <th>Shift Type</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th style={{ width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={9} className="text-center text-muted py-4">No schedules found</td></tr>
                  ) : filtered.map((s) => {
                    
                    // --- ⭐ BẮT ĐẦU CẬP NHẬT RENDER ⭐ ---
                    // 1. Tách ngày giờ
                    const start = formatDateTime(s.startTime);
                    const end = formatDateTime(s.endTime);
                    
                    // 2. Tách Ghi chú từ ShiftDetails
                    const detailsParts = (s.shiftDetails || "N/A").split(" - ");
                    const shiftType = detailsParts[0]; // "MORNING"
                    const notes = detailsParts[1] || "-"; // "Ghi chú" hoặc "-"

                    return (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>
                          <strong className="text-dark">{s.employee?.account?.fullName || "N/a"}</strong>
                          <div className="text-muted" style={{ fontSize: '0.9em' }}>
                            {s.employee?.employeeCode || "-"}
                          </div>
                        </td>
                        
                        {/* 3. Hiển thị ngày (từ startTime) */}
                        <td>{start.date}</td> 
                        
                        {/* 4. Hiển thị loại ca (từ shiftDetails) */}
                        <td><ShiftDetailsBadge value={shiftType} /></td>
                        
                        {/* 5. Hiển thị giờ (từ startTime) */}
                        <td>{start.time}</td>
                        
                        {/* 6. Hiển thị giờ (từ endTime) */}
                        <td>{end.time}</td>
                        
                        <td><StatusBadge value={s.status} /></td>
                        
                        {/* 7. Hiển thị ghi chú (từ shiftDetails) */}
                        <td style={{ maxWidth: 200, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {notes}
                        </td>
                        
                        <td className="text-nowrap">
                          {isAdmin ? (
                            <>
                              <Button as={Link} to={`/admin/schedules/${s.id}`} size="sm" variant="outline-primary" className="me-2" title="Edit">
                                Edit
                              </Button>
                              <Button 
                                  size="sm" 
                                  variant="outline-danger" 
                                  title="Delete"
                                  onClick={() => handleDeleteClick(s.id)}
                                  disabled={isDeleting && deletingId === s.id}
                                >
                                  {isDeleting && deletingId === s.id ? "..." : "Delete"}
                                </Button>
                            </>
                          ) : (
                            <span className="text-muted">View only</span>
                          )}
                        </td>
                      </tr>
                    );
                    // --- ⭐ KẾT THÚC CẬP NHẬT RENDER ⭐ ---
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
        {/* ---- Modal Xác nhận Xoá ---- */}
        <Modal show={showDeleteModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận xóa</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Bạn có chắc chắn muốn xóa lịch làm việc này không? (ID: {deletingId})
            <br/>
            Hành động này không thể hoàn tác.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={isDeleting}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Spinner as="span" size="sm" animation="border" /> Đang xóa...
                </>
              ) : "Xác nhận Xóa"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card>
    </Container>
  );
}

