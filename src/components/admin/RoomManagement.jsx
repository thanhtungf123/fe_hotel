import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Table, Spinner, Alert, Form, Badge, Button, Modal } from "react-bootstrap";
import axios from "../../api/axiosInstance";
import RoomFormModal from "./RoomFormModal";

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [bedLayouts, setBedLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Load rooms and bed layouts
  useEffect(() => {
    loadRooms();
    loadBedLayouts();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      // Use admin endpoint to see ALL rooms (including hidden ones)
      const { data } = await axios.get("/rooms/admin/all");
      console.log("Loaded rooms:", data); // Debug log
      setRooms(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBedLayouts = async () => {
    try {
      const { data } = await axios.get("/bed-layouts");
      if (Array.isArray(data) && data.length > 0) {
        setBedLayouts(data);
      } else {
        // Use fallback if empty
        useFallbackBedLayouts();
      }
    } catch (err) {
      console.error("Failed to load bed layouts:", err);
      // Fallback to hardcoded options
      useFallbackBedLayouts();
    }
  };

  const useFallbackBedLayouts = () => {
    setBedLayouts([
      { id: 1, layoutName: "1 Giường Đôi Lớn" },
      { id: 2, layoutName: "2 Giường Đơn" },
      { id: 3, layoutName: "1 Giường Đôi" },
      { id: 4, layoutName: "3 Giường Đơn" },
    ]);
  };

  // Search filter
  const filteredRooms = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return rooms;
    return rooms.filter(room =>
      [room.name, room.roomNumber, room.status, room.type]
        .filter(Boolean)
        .some(field => field.toString().toLowerCase().includes(q))
    );
  }, [rooms, searchQuery]);

  // Handlers
  const handleCreate = () => {
    setEditingRoom(null);
    setShowModal(true);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setShowModal(true);
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phòng "${room.name}"?`)) return;

    try {
      await axios.delete(`/rooms/${room.id}`);
      await loadRooms();
      alert("Xóa phòng thành công!");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err.message || "Xóa thất bại";
      alert(`Xóa thất bại: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`);
      console.error("Delete error:", err);
    }
  };

  const handleToggleVisibility = async (room) => {
    const action = room.isVisible ? "ẩn" : "hiện";
    if (!window.confirm(`Bạn có chắc muốn ${action} phòng "${room.name}"?`)) return;

    try {
      await axios.patch(`/rooms/${room.id}/visibility`, {
        isVisible: !room.isVisible
      });
      await loadRooms();
      alert(`${action.charAt(0).toUpperCase() + action.slice(1)} phòng thành công!`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err.message;
      alert(`Thất bại: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`);
      console.error("Toggle visibility error:", err);
    }
  };

  const handleStatusChange = async (room, newStatus) => {
    if (room.status === newStatus) return;

    const statusNames = {
      available: "Có sẵn",
      occupied: "Đang sử dụng",
      maintenance: "Bảo trì"
    };

    const reason = newStatus === "maintenance" 
      ? prompt("Lý do bảo trì (tùy chọn):") 
      : null;

    if (newStatus === "maintenance" && reason === null) return; // User clicked cancel

    const confirmMsg = `Chuyển trạng thái phòng "${room.name}" từ "${statusNames[room.status]}" sang "${statusNames[newStatus]}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      console.log("Sending request:", { roomId: room.id, status: newStatus, reason });
      await axios.patch(`/rooms/${room.id}/status`, {
        status: newStatus,
        reason: reason || undefined
      });
      await loadRooms();
      alert("Cập nhật trạng thái thành công!");
    } catch (err) {
      console.error("Update status error:", err);
      console.error("Error response:", err?.response);
      const msg = err?.response?.data?.message || err?.response?.data || err.message;
      alert(`Thất bại: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingRoom(null);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingRoom(null);
    loadRooms();
  };

  // Status badge
  const StatusBadge = ({ status }) => {
    const variants = {
      available: "success",
      occupied: "warning",
      maintenance: "secondary",
      deleted: "danger"
    };
    return (
      <Badge bg={variants[status] || "info"} className="text-capitalize">
        {status === "available" ? "Còn trống" :
         status === "occupied" ? "Đã đặt" :
         status === "maintenance" ? "Bảo trì" :
         status}
      </Badge>
    );
  };

  return (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            placeholder="Tìm theo tên phòng, số phòng, trạng thái..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={handleCreate}>
            + Thêm phòng mới
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="py-5 text-center">
          <Spinner animation="border" /> Đang tải danh sách phòng...
        </div>
      ) : error ? (
        <Alert variant="danger">Lỗi tải dữ liệu: {error}</Alert>
      ) : (
        <div className="table-responsive">
          <Table hover bordered size="sm" className="align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Số phòng</th>
                <th>Tên phòng</th>
                <th>Loại giường</th>
                <th>Sức chứa</th>
                <th>Giá/đêm</th>
                <th>Trạng thái</th>
                <th style={{ width: 100 }}>Hiển thị</th>
                <th style={{ width: 180 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-4">
                    Không tìm thấy phòng nào
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr key={room.id} style={{ opacity: room.isVisible === false ? 0.6 : 1 }}>
                    <td>{room.id}</td>
                    <td>{room.roomNumber || "-"}</td>
                    <td>{room.name || "-"}</td>
                    <td>{room.type || "-"}</td>
                    <td className="text-center">{room.capacity || "-"}</td>
                    <td>{room.priceVnd ? room.priceVnd.toLocaleString("vi-VN") + " ₫" : "-"}</td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={room.status || "available"}
                        onChange={(e) => handleStatusChange(room, e.target.value)}
                        style={{ width: "140px" }}
                      >
                        <option value="available">✅ Có sẵn</option>
                        <option value="occupied">🔒 Đang dùng</option>
                        <option value="maintenance">🔧 Bảo trì</option>
                      </Form.Select>
                    </td>
                    <td className="text-center">
                      {room.isVisible !== false ? (
                        <Badge bg="success">Hiển thị</Badge>
                      ) : (
                        <Badge bg="secondary">Ẩn</Badge>
                      )}
                    </td>
                    <td className="text-nowrap">
                      <Button
                        size="sm"
                        variant={room.isVisible !== false ? "outline-warning" : "outline-success"}
                        className="me-1"
                        onClick={() => handleToggleVisibility(room)}
                        title={room.isVisible !== false ? "Ẩn phòng" : "Hiện phòng"}
                      >
                        {room.isVisible !== false ? "👁️ Ẩn" : "👁️‍🗨️ Hiện"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-1"
                        onClick={() => handleEdit(room)}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(room)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}

      <RoomFormModal
        show={showModal}
        onHide={handleModalClose}
        onSuccess={handleModalSuccess}
        room={editingRoom}
        bedLayouts={bedLayouts}
      />
    </>
  );
}

