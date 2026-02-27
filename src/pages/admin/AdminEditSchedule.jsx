import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
// Giờ chúng ta cần useParams để lấy ID từ URL
import { Link, useNavigate, useParams, Navigate } from "react-router-dom"; 
// SỬA LỖI: Lỗi không tìm thấy file, tạm thời đổi về 'axios' gốc
import axios from "../../api/axiosInstance"; 
import { useAuth } from "../../store/auth";
// SỬA LỖI: Lỗi không tìm thấy thư viện icon
// import { ArrowLeft } from "react-bootstrap-icons";

// State ban đầu cho form (giống hệt trang Create)
const initialState = {
  employeeId: "",
  shiftDate: "",
  shiftType: "", 
  startTime: "",
  endTime: "",
  notes: "",
  status: "Pending",
};

export default function AdminEditSchedule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { shiftId } = useParams(); // Lấy ID từ URL, ví dụ: /admin/schedules/1
  
  // Check role - only admin can edit schedules
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
  if (roleName !== "admin") return <Navigate to="/admin" replace />;
  
  const [formData, setFormData] = useState(initialState);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  
  // Thêm state loading cho chính ca làm việc
  const [loadingSchedule, setLoadingSchedule] = useState(true); 
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- Tải danh sách nhân viên (Giống trang Create) ---
  useEffect(() => {
    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        // TODO: Đổi lại đường dẫn API nếu cần
        const { data } = await axios.get("/admin/employees"); 
        setEmployees(data.items || data || []); 
      } catch (err) {
        console.error("Lỗi khi tải nhân viên:", err);
        setError("Không thể tải danh sách nhân viên.");
      } finally {
        setLoadingEmployees(false);
      }
    };
    loadEmployees();
  }, []); // Chỉ chạy 1 lần

  // ---  MỚI: Tải dữ liệu ca làm việc cần sửa ---
  useEffect(() => {
    if (!shiftId) return; // Không làm gì nếu không có ID
    
    const loadSchedule = async () => {
      setLoadingSchedule(true);
      setError("");
      try {
        // 1. Gọi API để lấy chi tiết ca làm việc
        const { data } = await axios.get(`/admin/schedules/${shiftId}`, {
          timeout: 10000 // Thêm timeout 10 giây
        });
        
        // --- ⭐ QUAN TRỌNG: Log dữ liệu thô từ server ---
        console.log("DỮ LIỆU SERVER TRẢ VỀ:", JSON.stringify(data, null, 2));

        // --- ⭐ FIX LỖI TREO: Bọc 'data' trong (data || {}) ---
        // Điều này đảm bảo code không crash nếu API trả về 'null'
        const safeData = data || {};

        // "Dịch ngược" dữ liệu (phiên bản an toàn)
        
        // Tách shiftDetails -> shiftType và notes
        const detailsParts = (safeData.shiftDetails || "").split(" - ");
        const shiftType = detailsParts[0] || ""; // "MORNING"
        const notes = detailsParts[1] || "";     // "Ghi chú"
        
        // Tách startTime -> shiftDate và startTime (cách an toàn)
        const startTimeParts = (safeData.startTime || "").split("T"); 
        const shiftDate = startTimeParts[0] || ""; 
        const startTime = (startTimeParts[1] || "").substring(0, 5); 

        // Tách endTime -> endTime (cách an toàn)
        const endTimeParts = (safeData.endTime || "").split("T");
        const endTime = (endTimeParts[1] || "").substring(0, 5);
        
        const employeeId = safeData.employee?.id || "";
        
        setFormData({
          employeeId: employeeId,
          shiftDate: shiftDate,
          shiftType: shiftType,
          startTime: startTime,
          endTime: endTime,
          notes: notes,
          status: safeData.status || "Pending"
        });
        
      } catch (err) {
        console.error("Lỗi khi tải lịch làm việc:", err);
        if (err.code === 'ECONNABORTED') {
          setError("Không thể kết nối đến server (Timeout). Vui lòng kiểm tra backend.");
        } else {
          setError("Không tìm thấy lịch làm việc hoặc có lỗi xảy ra.");
        }
      } finally {
        setLoadingSchedule(false);
      }
    };
    
    loadSchedule();
  }, [shiftId]); // Chạy lại khi shiftId thay đổi

  // --- Xử lý thay đổi input (Giống trang Create) ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Xử lý submit form (Gần giống trang Create) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    // 1. Kiểm tra (Giống Create)
    if (!formData.employeeId || !formData.shiftDate || !formData.shiftType || !formData.startTime || !formData.endTime) {
      setError("Vui lòng điền đầy đủ tất cả các trường có dấu *");
      setSubmitting(false);
      return; 
    }
    
    // 2. "Biên dịch" dữ liệu sang Payload (Giống Create)
    const shiftDetails = `${formData.shiftType}${formData.notes ? ` - ${formData.notes}` : ''}`;
    const isoStartTime = `${formData.shiftDate}T${formData.startTime}`;
    const isoEndTime = `${formData.shiftDate}T${formData.endTime}`;
    
    const payload = {
      employee: {
        id: parseInt(formData.employeeId) 
      },
      shiftDetails: shiftDetails, 
      startTime: isoStartTime,
      endTime: isoEndTime,
      status: formData.status
    };
    
    console.log("Đang CẬP NHẬT payload lên controller:", JSON.stringify(payload, null, 2));
    
    try {
      // --- ⭐ THAY ĐỔI: Dùng PUT thay vì POST, và thêm ID vào URL ---
      const response = await axios.put(`/admin/schedules/${shiftId}`, payload);
      console.log("API Response:", response.data);

      setSuccess("Cập nhật lịch làm việc thành công!");

      // Chuyển hướng về trang danh sách sau 2 giây
      setTimeout(() => {
        navigate("/admin/schedules"); 
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra, không thể cập nhật.");
      console.error("Lỗi khi submit:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Nếu đang tải dữ liệu ban đầu, hiển thị spinner
  if (loadingSchedule) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
        <p>Đang tải dữ liệu ca làm việc...</p>
      </Container>
    );
  }

  // --- JSX (Gần giống trang Create) ---
  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-light p-3">
              <Row className="align-items-center">
                <Col>
                  {/* --- THAY ĐỔI: Tiêu đề --- */}
                  <h3 className="mb-0">Chỉnh sửa lịch làm việc (ID: {shiftId})</h3>
                  <div className="text-muted">Cập nhật thông tin ca</div>
                </Col>
                <Col className="text-end">
                  <Button as={Link} to="/admin/schedules" variant="outline-secondary">
                    {/* SỬA LỖI: Tạm ẩn icon <ArrowLeft className="me-1" /> */}
                    &larr; Quay lại danh sách
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              {/* --- ⭐ CẢI TIẾN: Luôn hiển thị lỗi (nếu có) trên đầu --- */}
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                {/* --- Hàng 1: Nhân viên & Ngày --- */}
                <Row className="mb-3">
                  <Form.Group as={Col} md={6} controlId="formEmployeeId">
                    <Form.Label>Nhân viên <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      required
                      disabled={loadingEmployees}
                    >
                      <option value="">
                        {loadingEmployees ? "Đang tải nhân viên..." : "--- Chọn nhân viên ---"}
                      </option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                           {emp.fullName || emp.account?.fullName} ({emp.employeeCode})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group as={Col} md={6} controlId="formShiftDate">
                    <Form.Label>Ngày làm việc <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="date"
                      name="shiftDate"
                      value={formData.shiftDate}
                      onChange={handleChange}
                      required
                      // Không dùng minDate cho trang Edit, để admin có thể sửa lịch cũ
                    />
                  </Form.Group>
                </Row>

                {/* --- Hàng 2: Loại ca & Trạng thái --- */}
                <Row className="mb-3">
                  <Form.Group as={Col} md={6} controlId="formShiftType">
                    <Form.Label>Loại ca <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="shiftType"
                      value={formData.shiftType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">--- Chọn loại ca ---</option>
                      <option value="MORNING">Sáng (Morning)</option>
                      <option value="AFTERNOON">Chiều (Afternoon)</option>
                      <option value="NIGHT">Tối (Night)</option>
                      <option value="FULLDAY">Cả ngày (Full-day)</option>
                      <option value="OTHER">Khác (Other)</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group as={Col} md={6} controlId="formStatus">
                    <Form.Label>Trạng thái</Form.Label>
                    {/* --- THAY ĐỔI: Bỏ 'disabled' cho Status --- */}
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Row>
                
                {/* --- Hàng 3: Thời gian Bắt đầu & Kết thúc --- */}
                <Row className="mb-3">
                  <Form.Group as={Col} md={6} controlId="formStartTime">
                    <Form.Label>Giờ bắt đầu <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group as={Col} md={6} controlId="formEndTime">
                    <Form.Label>Giờ kết thúc <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Row>
                
                {/* --- Hàng 4: Ghi chú --- */}
                <Form.Group className="mb-3" controlId="formNotes">
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Thêm ghi chú (ví dụ: tăng cường, nghỉ bù...)"
                  />
                </Form.Group>
                
                {/* --- Thông báo & Nút Submit --- */}
                {/* Lỗi được chuyển lên đầu form
                {error && <Alert variant="danger">{error}</Alert>}
                */}
                {success && <Alert variant="success">{success}</Alert>}
                
                <div className="text-end">
                  {/* --- THAY ĐỔI: Chữ trên nút --- */}
                  <Button variant="primary" type="submit" disabled={submitting || loadingEmployees || loadingSchedule}>
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        {" "} Đang cập nhật...
                      </>
                    ) : "Lưu thay đổi"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

