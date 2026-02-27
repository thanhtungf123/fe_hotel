// Enhanced RoomManagement - Luxury Admin Design với Auto Hide/Show
import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Table, Form, Badge, Button, Modal } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../api/axiosInstance";
import showToast from "../../utils/toast";
import { GridSkeleton } from "../common/LoadingSkeleton";
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
  
  // Confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Load rooms and bed layouts
  useEffect(() => {
    loadRooms();
    loadBedLayouts();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/rooms/admin/all");
      console.log("Loaded rooms:", data);
      setRooms(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setError(msg);
      showToast.error("Không thể tải danh sách phòng: " + msg);
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
        useFallbackBedLayouts();
      }
    } catch (err) {
      console.error("Failed to load bed layouts:", err);
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
    const q = searchQuery.toLowerCase().trim();
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

  const handleDelete = (room) => {
    setConfirmAction({
      title: "Xóa phòng",
      message: `Bạn có chắc muốn xóa phòng "${room.name}"?`,
      confirmLabel: "Xóa",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          await axios.delete(`/rooms/${room.id}`);
          await loadRooms();
          showToast.success(`✅ Đã xóa phòng "${room.name}"`);
        } catch (err) {
          const msg = err?.response?.data?.message || err.message;
          showToast.error(`Xóa thất bại: ${msg}`);
          console.error("Delete error:", err);
        }
      }
    });
    setShowConfirm(true);
  };

  const handleToggleVisibility = (room) => {
    const action = room.isVisible ? "ẩn" : "hiện";
    setConfirmAction({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} phòng`,
      message: `Bạn có chắc muốn ${action} phòng "${room.name}" khỏi danh sách tìm kiếm?`,
      confirmLabel: action.charAt(0).toUpperCase() + action.slice(1),
      confirmVariant: room.isVisible ? "warning" : "success",
      onConfirm: async () => {
        try {
          await axios.patch(`/rooms/${room.id}/visibility`, {
            isVisible: !room.isVisible
          });
          await loadRooms();
          showToast.success(`✅ Đã ${action} phòng "${room.name}"`);
        } catch (err) {
          const msg = err?.response?.data?.message || err.message;
          showToast.error(`${action.charAt(0).toUpperCase() + action.slice(1)} thất bại: ${msg}`);
          console.error("Toggle visibility error:", err);
        }
      }
    });
    setShowConfirm(true);
  };

  /**
   * 🎯 AUTO HIDE/SHOW LOGIC
   * - occupied/maintenance → auto hide (isVisible = false)
   * - available → auto show (isVisible = true)
   */
  const handleStatusChange = (room, newStatus) => {
    if (room.status === newStatus) return;

    const statusNames = {
      available: "Có sẵn",
      occupied: "Đang sử dụng",
      maintenance: "Bảo trì"
    };

    // Determine auto visibility
    const willAutoHide = ["occupied", "maintenance"].includes(newStatus);
    const willAutoShow = newStatus === "available";
    
    let visibilityMsg = "";
    if (willAutoHide) {
      visibilityMsg = " (phòng sẽ tự động ẩn)";
    } else if (willAutoShow && !room.isVisible) {
      visibilityMsg = " (phòng sẽ tự động hiện)";
    }

    setConfirmAction({
      title: "Chuyển trạng thái phòng",
      message: (
        <div>
          <p className="mb-2">
            Chuyển trạng thái phòng <strong>"{room.name}"</strong> từ{" "}
            <Badge bg="secondary">{statusNames[room.status]}</Badge> sang{" "}
            <Badge bg={newStatus === "available" ? "success" : newStatus === "occupied" ? "warning" : "danger"}>
              {statusNames[newStatus]}
            </Badge>
            ?
          </p>
          {visibilityMsg && (
            <p className="small text-muted mb-0">
              <strong>Lưu ý:</strong> {visibilityMsg}
            </p>
          )}
        </div>
      ),
      confirmLabel: "Xác nhận",
      confirmVariant: "primary",
      onConfirm: async () => {
        try {
          // Update status
          await axios.patch(`/rooms/${room.id}/status`, {
            status: newStatus
          });

          // Auto update visibility based on status
          if (willAutoHide && room.isVisible) {
            await axios.patch(`/rooms/${room.id}/visibility`, {
              isVisible: false
            });
            showToast.info(` Phòng "${room.name}" đã được tự động ẩn`);
          } else if (willAutoShow && !room.isVisible) {
            await axios.patch(`/rooms/${room.id}/visibility`, {
              isVisible: true
            });
            showToast.info(` Phòng "${room.name}" đã được tự động hiện`);
          }

          await loadRooms();
          showToast.success(`✅ Đã chuyển trạng thái sang "${statusNames[newStatus]}"`);
        } catch (err) {
          const msg = err?.response?.data?.message || err.message;
          showToast.error(`Chuyển trạng thái thất bại: ${msg}`);
          console.error("Status change error:", err);
        }
      }
    });
    setShowConfirm(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingRoom(null);
  };

  const handleModalSuccess = () => {
    loadRooms();
    setShowModal(false);
    setEditingRoom(null);
  };

  const getStatusBadge = (status) => {
    const variants = {
      available: "success",
      occupied: "warning",
      maintenance: "danger"
    };
    const labels = {
      available: " Có sẵn",
      occupied: " Đang dùng",
      maintenance: " Bảo trì"
    };
    return (
      <Badge bg={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Row className="mb-4 align-items-center">
          <Col md={6}>
            <Form.Control
              placeholder="🔍 Tìm theo tên phòng, số phòng, trạng thái..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: "10px" }}
            />
          </Col>
          <Col md={6} className="text-end">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ display: "inline-block" }}
            >
              <Button
                onClick={handleCreate}
                style={{
                  background: "linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "0.6rem 1.5rem",
                  fontWeight: "600",
                  boxShadow: "0 4px 12px rgba(201, 162, 74, 0.3)"
                }}
              >
                + Thêm phòng mới
              </Button>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* Loading State */}
      {loading && <GridSkeleton cols={1} rows={1} />}

      {/* Error State */}
      {!loading && error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="alert alert-danger"
        >
          ⚠️ Lỗi tải dữ liệu: {error}
        </motion.div>
      )}

      {/* Table */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="table-responsive"
        >
          <Table hover bordered className="align-middle" style={{ background: "white", borderRadius: "12px" }}>
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                <th>ID</th>
                <th>Số phòng</th>
                <th>Tên phòng</th>
                <th>Loại giường</th>
                <th className="text-center">Sức chứa</th>
                <th>Giá/đêm</th>
                <th>Trạng thái</th>
                <th className="text-center">Hiển thị</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-muted">
                      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                      <p className="mb-0">Không tìm thấy phòng nào</p>
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room, index) => (
                    <motion.tr
                      key={room.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: room.isVisible === false ? 0.5 : 1, 
                        x: 0 
                      }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ 
                        backgroundColor: "#f8f9fa",
                        transition: { duration: 0.2 }
                      }}
                    >
                      <td>{room.id}</td>
                      <td><strong>{room.roomNumber || "-"}</strong></td>
                      <td>{room.name || "-"}</td>
                      <td>{room.type || "-"}</td>
                      <td className="text-center">
                        <Badge bg="light" text="dark">
                          👥 {room.capacity || 0}
                        </Badge>
                      </td>
                      <td>
                        <span style={{ color: "var(--primary-gold)", fontWeight: "600" }}>
                          {room.priceVnd ? room.priceVnd.toLocaleString("vi-VN") + " ₫" : "-"}
                        </span>
                      </td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={room.status || "available"}
                          onChange={(e) => handleStatusChange(room, e.target.value)}
                          style={{ 
                            width: "150px",
                            borderRadius: "8px",
                            cursor: "pointer"
                          }}
                        >
                          <option value="available">Có sẵn</option>
                          <option value="occupied">Đang dùng</option>
                          <option value="maintenance">Bảo trì</option>
                        </Form.Select>
                      </td>
                      <td className="text-center">
                        {room.isVisible !== false ? (
                          <Badge bg="success" className="px-3 py-2">Hiển thị</Badge>
                        ) : (
                          <Badge bg="secondary" className="px-3 py-2">Ẩn</Badge>
                        )}
                      </td>
                      <td className="text-nowrap text-center">
                        <motion.div
                          className="d-inline-flex gap-2"
                          whileHover={{ scale: 1.05 }}
                        >
                          {/* <Button
                            size="sm"
                            variant={room.isVisible !== false ? "outline-warning" : "outline-success"}
                            onClick={() => handleToggleVisibility(room)}
                            title={room.isVisible !== false ? "Ẩn phòng" : "Hiện phòng"}
                            style={{ borderRadius: "8px" }}
                          >
                            {room.isVisible !== false ? "👁️ Ẩn" : "👁️‍🗨️ Hiện"}
                          </Button> */}
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEdit(room)}
                            style={{ borderRadius: "8px" }}
                          >
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(room)}
                            style={{ borderRadius: "8px" }}
                          >
                            Xóa
                          </Button>
                        </motion.div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </Table>
        </motion.div>
      )}

      {/* Room Form Modal */}
      <RoomFormModal
        show={showModal}
        onHide={handleModalClose}
        onSuccess={handleModalSuccess}
        room={editingRoom}
      />

      {/* Confirmation Modal */}
      <Modal
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={{ borderBottom: "2px solid var(--primary-gold)" }}>
          <Modal.Title style={{ fontFamily: "Playfair Display, serif" }}>
            {confirmAction?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {typeof confirmAction?.message === "string" ? (
            <p className="mb-0">{confirmAction.message}</p>
          ) : (
            confirmAction?.message
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowConfirm(false)}
            style={{ borderRadius: "8px" }}
          >
            Hủy
          </Button>
          <Button
            variant={confirmAction?.confirmVariant || "primary"}
            onClick={() => {
              confirmAction?.onConfirm?.();
              setShowConfirm(false);
            }}
            style={{ 
              borderRadius: "8px",
              ...(confirmAction?.confirmVariant === "primary" && {
                background: "linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)",
                border: "none"
              })
            }}
          >
            {confirmAction?.confirmLabel || "Xác nhận"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
