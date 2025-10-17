import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card, Row, Col, Badge, Button, Form, Pagination, Alert } from "react-bootstrap";
import axios from "../../api/axiosInstance";
import { useAuth } from "../../store/auth";
import { Link, useNavigate } from "react-router-dom";
import CancelModal from "./CancelModal";
import "../../styles/account.css";

const fmtVnd = (n) => (Number(n) || 0).toLocaleString("vi-VN") + "₫";

export default function BookingHistory() {
  const { user } = useAuth();
  const nav = useNavigate();

  const [status, setStatus] = useState("");            // filter
  const [page, setPage] = useState(0);
  const size = 6;

  const [data, setData] = useState({ items: [], total: 0, page: 0, size });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // cancel modal state
  const [target, setTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelErr, setCancelErr] = useState("");

  // nếu chưa login -> điều hướng
  useEffect(() => {
    if (!user?.token) nav("/login?return=/account/bookings");
  }, [user, nav]);

  const load = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    setErr("");

    const params = new URLSearchParams({ page, size });
    if (status) params.set("status", status);

    try {
      const { data } = await axios.get(`/bookings/my?${params.toString()}`);
      setData(data);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [user, page, size, status]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = useMemo(
    () => Math.ceil((data?.total || 0) / (data?.size || size)),
    [data, size]
  );

  const statusOptions = [
    { key: "", label: "Tất cả" },
    { key: "pending", label: "Chờ xác nhận" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "cancel_requested", label: "Chờ duyệt huỷ" },
    { key: "checked_in", label: "Đã nhận phòng" },
    { key: "checked_out", label: "Đã trả phòng" },
    { key: "cancelled", label: "Đã hủy" },
  ];

  const badge = (s) => {
    const map = {
      pending: "secondary",
      confirmed: "primary",
      cancel_requested: "warning",
      checked_in: "success",
      checked_out: "dark",
      cancelled: "danger",
    };
    return (
      <Badge bg={map[s] || "secondary"} className="text-uppercase">
        {String(s || "").replaceAll("_", " ")}
      </Badge>
    );
  };

  const canRequestCancel = (s) =>
    ["pending", "confirmed"].includes(String(s).toLowerCase());

  const submitCancel = async (reason) => {
    if (!target) return;
    setCancelLoading(true);
    setCancelErr("");

    try {
      await axios.patch(`/bookings/${target.id}/request-cancel`, { reason });
      setTarget(null);
      await load();
    } catch (e) {
      setCancelErr(e?.response?.data?.message || e.message || "Gửi yêu cầu huỷ thất bại");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <main className="py-4">
      <div className="container account-wrap">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 className="m-0">Lịch sử đặt phòng</h3>
            <div className="text-muted small">Xem, lọc theo trạng thái</div>
          </div>
          <Form.Select
            style={{ width: 240 }}
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatus(e.target.value);
            }}
          >
            {statusOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </Form.Select>
        </div>

        {loading && <Alert variant="info">Đang tải...</Alert>}
        {err && <Alert variant="danger" className="mb-3">{err}</Alert>}
        {!loading && !data?.items?.length && (
          <Alert variant="secondary">Không có đặt phòng nào.</Alert>
        )}

        <Row className="g-3">
          {data?.items?.map((b) => (
            <Col md={12} key={b.id}>
              <Card className="card-soft">
                <Card.Body>
                  <div className="d-flex gap-3 align-items-center">
                    <img
                      src={b.roomImageUrl}
                      alt={b.roomName}
                      style={{ width: 140, height: 90, objectFit: "cover", borderRadius: 8 }}
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="fw-semibold">{b.roomName}</div>
                          <div className="text-muted small">
                            🗓 {b.checkIn} → {b.checkOut} &nbsp;•&nbsp; {b.nights} đêm
                          </div>
                          <div className="text-muted small">
                            👥 {b.guests ?? 0} khách &nbsp;•&nbsp; 🛏 {b.bedLayout || "-"}
                          </div>
                        </div>
                        <div className="text-end">
                          {badge(b.status)}
                          <div className="mt-2 fw-bold text-danger">{fmtVnd(b.totalPrice)}</div>
                        </div>
                      </div>

                      <div className="mt-2 d-flex gap-2">
                        <Button as={Link} to={`/rooms/${b.roomId}`} variant="light" className="border">
                          Xem phòng
                        </Button>
                        {canRequestCancel(b.status) && (
                          <Button
                            variant="outline-danger"
                            onClick={() => {
                              setCancelErr("");
                              setTarget(b);
                            }}
                          >
                            Yêu cầu huỷ
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <Pagination>
              <Pagination.Prev disabled={page <= 0} onClick={() => setPage((p) => p - 1)} />
              {Array.from({ length: totalPages }).map((_, i) => (
                <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              />
            </Pagination>
          </div>
        )}

        <CancelModal
          show={!!target}
          onClose={() => {
            setTarget(null);
            setCancelErr("");
          }}
          onSubmit={submitCancel}
          loading={cancelLoading}
          error={cancelErr}
        />
      </div>
    </main>
  );
}
