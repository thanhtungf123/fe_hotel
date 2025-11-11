import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card, Row, Col, Badge, Button, Form, Pagination, Alert, Modal } from "react-bootstrap";
import axios from "../../api/axiosInstance";
import { useAuth } from "../../store/auth";
import { Link, useNavigate } from "react-router-dom";
import CancelModal from "./CancelModal";
import PaymentButton from "../../components/PaymentButton";
import ReviewModal from "../../components/review/ReviewModal";
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

  // review modal state
  const [reviewTarget, setReviewTarget] = useState(null);

  // refund info modal state
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundForm, setRefundForm] = useState({ accountHolder: "", accountNumber: "", bankName: "" });
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundErr, setRefundErr] = useState("");


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

  const canPayBalance = (b) =>
    String(b.paymentState).toLowerCase()==='deposit_paid' &&
    Number(b.amountRemaining || 0) > 0;

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

  const submitRefundInfo = async (e) => {
    e.preventDefault();
    if (!refundTarget) return;
    setRefundLoading(true);
    setRefundErr("");

    try {
      await axios.post(`/bookings/${refundTarget.id}/refund-info`, {
        accountHolder: refundForm.accountHolder.trim(),
        accountNumber: refundForm.accountNumber.trim(),
        bankName: refundForm.bankName.trim()
      });
      setRefundTarget(null);
      setRefundForm({ accountHolder: "", accountNumber: "", bankName: "" });
      await load();
    } catch (e) {
      setRefundErr(e?.response?.data?.message || e.message || "Gửi thông tin hoàn tiền thất bại");
    } finally {
      setRefundLoading(false);
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
                  <img src={b.roomImageUrl} alt={b.roomName} style={{ width: 140, height: 90, objectFit: "cover", borderRadius: 8 }}/>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <div>
                        <div className="fw-semibold">{b.roomName}</div>
                        <div className="text-muted small">🗓 {b.checkIn} → {b.checkOut} &nbsp;•&nbsp; {b.nights} đêm</div>
                        <div className="text-muted small">
                          👥 {b.adults ? `${b.adults} người lớn` : ''} {b.children && b.children > 0 ? `, ${b.children} trẻ em` : ''} {!b.adults && !b.children ? `${b.guests ?? 0} khách` : ''} &nbsp;•&nbsp; 🛏 {b.bedLayout || "-"}
                        </div>
                        {/* NEW: Payment info */}
                        <div className="small mt-1">
                          Thanh toán: <b>{(b.paymentState||'unpaid').replaceAll('_',' ')}</b>
                          {/* ✅ Chỉ hiển thị "Đã trả" và "Còn lại" khi chưa thanh toán đủ */}
                          {String(b.paymentState).toLowerCase() !== 'paid_in_full' && (
                            <>
                              {Number(b.amountPaid||0)>0 && <> &nbsp;• Đã trả: <b>{fmtVnd(b.amountPaid)}</b></>}
                              {Number(b.amountRemaining||0)>0 && <> &nbsp;• Còn lại: <b className="text-danger">{fmtVnd(b.amountRemaining)}</b></>}
                            </>
                          )}
                        </div>
                        {/* NEW: Check-in code */}
                        {b.checkInCode && b.checkInCode.trim() !== "" ? (
                          <div className="small mt-1">
                            🔑 Mã check-in: <code className="fw-bold text-primary">{b.checkInCode}</code>
                          </div>
                        ) : (b.status === "confirmed" && (b.paymentState === "deposit_paid" || b.paymentState === "paid_in_full")) ? (
                          <div className="small mt-1 text-warning">
                            ⏳ Mã check-in đang được tạo...
                          </div>
                        ) : null}
                        {/* ✅ Services */}
                        {b.services && Array.isArray(b.services) && b.services.length > 0 && (
                          <div className="mt-2">
                            <div className="small fw-semibold mb-1">✨ Dịch vụ đã chọn:</div>
                            <div className="d-flex flex-wrap gap-1">
                              {b.services.map((svc, idx) => (
                                <Badge key={idx} bg="info" className="text-dark">
                                  {svc.name || svc.nameService} (+{fmtVnd(svc.price || 0)})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-end">
                        {badge(b.status)}
                        <div className="mt-2 fw-bold text-danger">{fmtVnd(b.totalPrice)}</div>
                      </div>
                    </div>

                    <div className="mt-2 d-flex gap-2 flex-wrap">
                        <Button as={Link} to={`/rooms/${b.roomId}`} variant="light" className="border">
                          Xem phòng
                        </Button>

                        {/* Yêu cầu huỷ như cũ */}
                        {canRequestCancel(b.status) && (
                          <Button variant="outline-danger" onClick={() => { setCancelErr(""); setTarget(b); }}>
                            Yêu cầu huỷ
                          </Button>
                        )}

                        {/* ✅ NEW: Gửi thông tin hoàn tiền - Chỉ hiển thị khi cancelled và chưa gửi */}
                        {String(b.status).toLowerCase() === 'cancelled' && 
                         !b.refundSubmitted && 
                         !b.refundCompleted && (
                          <Button 
                            variant="outline-primary" 
                            onClick={() => {
                              setRefundTarget(b);
                              setRefundForm({ accountHolder: "", accountNumber: "", bankName: "" });
                              setRefundErr("");
                            }}
                          >
                            💳 Gửi thông tin hoàn tiền
                          </Button>
                        )}

                        {/* ✅ Hiển thị trạng thái hoàn tiền */}
                        {String(b.status).toLowerCase() === 'cancelled' && b.refundSubmitted && (
                          <div className="small text-muted">
                            {b.refundCompleted ? (
                              <Badge bg="success">✅ Đã hoàn tiền</Badge>
                            ) : (
                              <Badge bg="warning">⏳ Đang chờ hoàn tiền</Badge>
                            )}
                          </div>
                        )}

                        {/* ✅ NEW: Thanh toán phần còn lại - Chỉ hiển thị khi deposit_paid và còn nợ */}
                        {String(b.status).toLowerCase()==='confirmed' && 
                         String(b.paymentState).toLowerCase()==='deposit_paid' && 
                         Number(b.amountRemaining)>0 && (
                          <div style={{minWidth: 240}}>
                            <PaymentButton
                              bookingId={b.id}
                              totalPrice={b.amountRemaining}
                              purpose="balance"
                              label="Thanh toán phần còn lại"
                            />
                          </div>
                        )}

                        {/* Viết đánh giá - Cho phép khi đã confirmed (đã đặt phòng thành công) */}
                        {(String(b.status).toLowerCase() === 'confirmed' || 
                          String(b.status).toLowerCase() === 'checked_in' ||
                          String(b.status).toLowerCase() === 'checked_out' || 
                          String(b.status).toLowerCase() === 'completed') && (
                          <Button 
                            variant="outline-primary" 
                            onClick={() => setReviewTarget(b)}
                          >
                            Viết đánh giá
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

        <ReviewModal
          show={!!reviewTarget}
          onHide={() => setReviewTarget(null)}
          bookingId={reviewTarget?.id}
          roomId={reviewTarget?.roomId}
          onSuccess={load}
        />

        {/* Refund Info Modal */}
        <Modal show={!!refundTarget} onHide={() => {
          if (!refundLoading) {
            setRefundTarget(null);
            setRefundForm({ accountHolder: "", accountNumber: "", bankName: "" });
            setRefundErr("");
          }
        }} centered>
          <Form onSubmit={submitRefundInfo}>
            <Modal.Header closeButton={!refundLoading}>
              <Modal.Title>💳 Gửi thông tin hoàn tiền</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {refundErr && <Alert variant="danger" className="py-2">{refundErr}</Alert>}
              <div className="small text-muted mb-3">
                Đơn đặt phòng #{refundTarget?.id} - {refundTarget?.roomName}
                <br />
                Vui lòng điền đầy đủ thông tin tài khoản ngân hàng để chúng tôi có thể hoàn tiền cho bạn.
              </div>
              <Form.Group className="mb-3">
                <Form.Label>Chủ tài khoản ngân hàng <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={refundForm.accountHolder}
                  onChange={(e) => setRefundForm({ ...refundForm, accountHolder: e.target.value })}
                  placeholder="Nhập tên chủ tài khoản"
                  required
                  disabled={refundLoading}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Số tài khoản ngân hàng <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={refundForm.accountNumber}
                  onChange={(e) => setRefundForm({ ...refundForm, accountNumber: e.target.value })}
                  placeholder="Nhập số tài khoản"
                  required
                  disabled={refundLoading}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tên ngân hàng <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={refundForm.bankName}
                  onChange={(e) => setRefundForm({ ...refundForm, bankName: e.target.value })}
                  placeholder="VD: Vietcombank, BIDV, Techcombank..."
                  required
                  disabled={refundLoading}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setRefundTarget(null);
                  setRefundForm({ accountHolder: "", accountNumber: "", bankName: "" });
                  setRefundErr("");
                }}
                disabled={refundLoading}
              >
                Hủy
              </Button>
              <Button type="submit" variant="primary" disabled={refundLoading}>
                {refundLoading ? "Đang gửi..." : "Gửi thông tin"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </main>
  );
}
