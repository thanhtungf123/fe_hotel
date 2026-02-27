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
import { Link, useNavigate, Navigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { ArrowLeft } from "react-bootstrap-icons"; // Tạm thời bỏ icon do lỗi build
import { useAuth } from "../../store/auth";

// --- Dữ liệu giả lập đã bị xóa ---

export default function AdminCreateSchedule() {
  const { user } = useAuth();
  
  // Check role - only admin can create schedules
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

// --- ⭐ BẮT ĐẦU CẬP NHẬT (Ràng buộc ngày) ⭐ ---
// Lấy ngày hôm nay theo múi giờ địa phương (không dùng UTC)
// và định dạng thành YYYY-MM-DD để dùng cho thuộc tính 'min'
const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, '0'); // +1 vì tháng (0-11)
const day = today.getDate().toString().padStart(2, '0');
const minDate = `${year}-${month}-${day}`;
// Kết quả: ví dụ '2025-10-29'
// --- ⭐ KẾT THÚC CẬP NHẬT ⭐ ---

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId: "",
    shiftDate: "",
    shiftType: "", // ví dụ: MORNING, AFTERNOON, NIGHT
    startTime: "",
    endTime: "",
    notes: "",
    status: "Pending", // Mặc định là 'Pending' khi mới tạo
  });
  
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- Tải danh sách nhân viên (Sử dụng API thật) ---
  useEffect(() => {
    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        // TODO: Đảm bảo endpoint này là chính xác
        const { data } = await axios.get("/admin/employees");
        
        // Giả sử API trả về một mảng nhân viên, có thể nằm trong data.items hoặc data
        setEmployees(data.items || data || []); 
        
      } catch (err) {
        console.error("Lỗi khi tải nhân viên:", err);
        setError("Không thể tải danh sách nhân viên. Vui lòng thử lại.");
      } finally {
        setLoadingEmployees(false);
      }
    };
    
    loadEmployees();
  }, []); // Chỉ chạy 1 lần khi component mount

  // --- Xử lý thay đổi input ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Xử lý submit form ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    // --- ⭐ BẮT ĐẦU CẬP NHẬT ⭐ ---
    // Biên dịch dữ liệu từ React state (formData) sang Java Model (payload)

    // ⭐ THÊM BƯỚC VALIDATION (KIỂM TRA) ⭐
    // Kiểm tra các trường bắt buộc, đặc biệt là ngày
    if (!formData.employeeId || !formData.shiftDate || !formData.shiftType || !formData.startTime || !formData.endTime) {
      setError("Vui lòng điền đầy đủ tất cả các trường có dấu *");
      setSubmitting(false);
      return; // Dừng hàm tại đây
    }
    // 1. Ghép shiftType và notes thành shiftDetails
    const shiftDetails = `${formData.shiftType}${formData.notes ? ` - ${formData.notes}` : ''}`;
    
    // 2. Ghép ngày và giờ thành chuỗi ISO LocalDateTime
    // Kết quả: "2025-10-29T09:00"
    const isoStartTime = `${formData.shiftDate}T${formData.startTime}`;
    const isoEndTime = `${formData.shiftDate}T${formData.endTime}`;
    
    // 3. Tạo đối tượng payload khớp với WorkShift.java
    const payload = {
      // Gửi employee dưới dạng object { "id": ... }
      // Spring Boot sẽ tự động hiểu đây là foreign key
      employee: {
        id: parseInt(formData.employeeId) 
      },
      
      // Gửi chuỗi đã ghép
      shiftDetails: shiftDetails, 
      
      // Gửi chuỗi ISO đã ghép (khắc phục lỗi 400)
      startTime: isoStartTime,
      endTime: isoEndTime,
      
      // Status đã khớp
      status: formData.status
    };
    
    // Log để kiểm tra payload
    console.log("Đang gửi payload lên controller:", JSON.stringify(payload, null, 2));
    
    // --- ⭐ KẾT THÚC CẬP NHẬT ⭐ ---

    // Log dữ liệu để kiểm tra
    console.log("Đang gửi dữ liệu:", formData);

    try {
      // --- TODO: Đảm bảo endpoint này là chính xác --- // Done
      const response = await axios.post("/admin/schedules/create", payload);
      console.log("API Response:", response.data);
      
      // ---- Xóa bỏ Giả lập API call ----
      // await new Promise(resolve => setTimeout(resolve, 1500)); 

      setSuccess("Tạo lịch làm việc thành công!");

      // Reset form
      setFormData({
        employeeId: "", shiftDate: "", shiftType: "",
        startTime: "", endTime: "", notes: "", status: "Pending"
      });

      // Chuyển hướng về trang danh sách sau 2 giây
      setTimeout(() => {
        navigate("/admin/schedules"); // Điều chỉnh đường dẫn nếu cần
      }, 2000);

    } catch (err) {
      // Xử lý lỗi thật
      setError(err.response?.data?.message || "Có lỗi xảy ra, không thể tạo lịch.");
      console.error("Lỗi khi submit:", err);
      
      // ---- Xóa bỏ Lỗi giả lập ----
      // setError("Có lỗi xảy ra, không thể tạo lịch. (Lỗi giả lập)");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-light p-3">
              <Row className="align-items-center">
                <Col>
                  <h3 className="mb-0">Tạo lịch làm việc mới</h3>
                  <div className="text-muted">Hoàn thành biểu mẫu để gán ca</div>
                </Col>
                <Col className="text-end">
                  <Button as={Link} to="/admin/schedules" variant="outline-secondary">
                    {/* <ArrowLeft className="me-1" /> */}
                    &larr; Quay lại danh sách
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
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
                      {/* TODO: Điều chỉnh key và value dựa trên cấu trúc data nhân viên thật */}
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName} ({emp.employeeCode})
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
                      min={minDate}
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
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled // Thường trạng thái mới luôn là Pending
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </Form.Select>
                    <Form.Text muted>
                      Mặc định là "Pending" khi tạo mới.
                    </Form.Text>
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
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                
                <div className="text-end">
                  <Button variant="primary" type="submit" disabled={submitting || loadingEmployees}>
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        {" "} Đang lưu...
                      </>
                    ) : "Lưu lịch làm việc"}
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


