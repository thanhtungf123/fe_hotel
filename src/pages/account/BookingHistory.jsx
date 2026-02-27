import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card, Row, Col, Badge, Button, Form, Pagination, Alert, Modal } from "react-bootstrap";
import axios from "../../api/axiosInstance";
import { useAuth } from "../../store/auth";
import { Link, useNavigate } from "react-router-dom";
import CancelModal from "./CancelModal";
import PaymentButton from "../../components/PaymentButton";
import ReviewModal from "../../components/review/ReviewModal";
import "../../styles/account.css";
import "../../styles/booking-buttons.css";

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

  // invoice modal state
  const [invoiceTarget, setInvoiceTarget] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceErr, setInvoiceErr] = useState("");


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
    { key: "pending_verification", label: "Chờ kiểm tra phòng" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "cancel_requested", label: "Chờ duyệt huỷ" },
    { key: "checked_in", label: "Đã nhận phòng" },
    { key: "checked_out", label: "Đã trả phòng" },
    { key: "cancelled", label: "Đã hủy" },
  ];

  const badge = (s) => {
    const map = {
      pending: "secondary",
      pending_verification: "warning",
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

  const loadInvoice = async (bookingId) => {
    setInvoiceTarget(bookingId);
    setInvoiceLoading(true);
    setInvoiceErr("");
    setInvoice(null);

    try {
      const { data } = await axios.get(`/invoices/${bookingId}`);
      setInvoice(data);
    } catch (e) {
      setInvoiceErr(e?.response?.data?.error || e?.response?.data?.message || e.message || "Không thể tải hóa đơn");
      setInvoiceTarget(null);
    } finally {
      setInvoiceLoading(false);
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
                        {/* ✅ NEW: Pending Verification Alert */}
                        {String(b.status).toLowerCase() === 'pending_verification' && (
                          <Alert className="pending-verification-alert small py-2 mt-2 mb-1">
                            <i className="bi bi-hourglass-split me-2"></i>
                            <strong>Đang chờ nhân viên kiểm tra phòng</strong> - Vui lòng đợi xác nhận từ khách sạn
                          </Alert>
                        )}

                        {b.checkInCode && b.checkInCode.trim() !== "" ? (
                          <div className="checkin-code-display small mt-1">
                            <i className="bi bi-key-fill me-2"></i>
                            Mã check-in: <code>{b.checkInCode}</code>
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

                    <div className="booking-actions">
                        <Button 
                          as={Link} 
                          to={`/rooms/${b.roomId}`} 
                          className="btn-booking btn-view-room"
                        >
                          <i className="bi bi-eye"></i>
                          Xem phòng
                        </Button>

                        {/* Yêu cầu huỷ */}
                        {canRequestCancel(b.status) && (
                          <Button 
                            className="btn-booking btn-cancel-request"
                            onClick={() => { setCancelErr(""); setTarget(b); }}
                          >
                            <i className="bi bi-x-circle"></i>
                            Yêu cầu huỷ
                          </Button>
                        )}

                        {/* ✅ NEW: Gửi thông tin hoàn tiền */}
                        {String(b.status).toLowerCase() === 'cancelled' && 
                         !b.refundSubmitted && 
                         !b.refundCompleted && (
                          <Button 
                            className="btn-booking btn-refund-info"
                            onClick={() => {
                              setRefundTarget(b);
                              setRefundForm({ accountHolder: "", accountNumber: "", bankName: "" });
                              setRefundErr("");
                            }}
                          >
                            <i className="bi bi-credit-card-2-back"></i>
                            Hoàn tiền
                          </Button>
                        )}

                        {/* ✅ Hiển thị trạng thái hoàn tiền */}
                        {String(b.status).toLowerCase() === 'cancelled' && b.refundSubmitted && (
                          <div className="refund-status-badge">
                            {b.refundCompleted ? (
                              <Badge bg="success" className="booking-status-badge">
                                <i className="bi bi-check-circle-fill me-1"></i>
                                Đã hoàn tiền
                              </Badge>
                            ) : (
                              <Badge bg="warning" className="booking-status-badge">
                                <i className="bi bi-clock-fill me-1"></i>
                                Đang chờ hoàn tiền
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* ✅ NEW: Thanh toán phần còn lại */}
                        {String(b.status).toLowerCase()==='confirmed' && 
                         String(b.paymentState).toLowerCase()==='deposit_paid' && 
                         Number(b.amountRemaining)>0 && (
                          <PaymentButton
                            bookingId={b.id}
                            totalPrice={b.amountRemaining}
                            purpose="balance"
                            label="Thanh toán"
                          />
                        )}

                        {/* Viết đánh giá */}
                        {(String(b.status).toLowerCase() === 'confirmed' || 
                          String(b.status).toLowerCase() === 'checked_in' ||
                          String(b.status).toLowerCase() === 'checked_out' || 
                          String(b.status).toLowerCase() === 'completed') && (
                          <Button 
                            className="btn-booking btn-review"
                            onClick={() => setReviewTarget(b)}
                          >
                            <i className="bi bi-star-fill"></i>
                            Đánh giá
                          </Button>
                        )}

                        {/* ✅ NEW: Xem hóa đơn */}
                        {(String(b.paymentState).toLowerCase() === 'deposit_paid' ||
                          String(b.paymentState).toLowerCase() === 'paid_in_full') && (
                          <Button 
                            className="btn-booking btn-invoice"
                            onClick={() => loadInvoice(b.id)}
                          >
                            <i className="bi bi-receipt"></i>
                            Hóa đơn
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

        {/* ✅ Invoice Modal */}
        <Modal 
          show={invoiceTarget !== null} 
          onHide={() => setInvoiceTarget(null)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title> Hóa đơn đặt phòng</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {invoiceLoading && <Alert variant="info">Đang tải hóa đơn...</Alert>}
            {invoiceErr && <Alert variant="danger">{invoiceErr}</Alert>}
            
            {invoice && !invoiceLoading && (
              <div className="invoice-content" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                <div className="text-center mb-4">
                  <h5>HÓA ĐƠN THANH TOÁN</h5>
                  <div className="text-muted">Aurora Palace Hotel</div>
                </div>
                
                <hr />
                
                <Row className="mb-3">
                  <Col xs={6}>
                    <small className="text-muted">Mã hóa đơn:</small><br />
                    <strong>{invoice.invoiceNumber}</strong>
                  </Col>
                  <Col xs={6} className="text-end">
                    <small className="text-muted">Ngày xuất:</small><br />
                    <strong>{invoice.issueDate ? new Date(invoice.issueDate).toLocaleString('vi-VN') : ''}</strong>
                  </Col>
                </Row>
                
                {invoice.checkInCode && (
                  <Alert variant="success" className="py-2">
                    <small className="text-muted">Mã check-in:</small> <strong className="fs-5">{invoice.checkInCode}</strong>
                  </Alert>
                )}
                
                <hr />
                
                <div className="mb-3">
                  <h6>THÔNG TIN KHÁCH HÀNG</h6>
                  <div><small className="text-muted">Họ tên:</small> {invoice.customerName}</div>
                  <div><small className="text-muted">Số điện thoại:</small> {invoice.customerPhone}</div>
                  <div><small className="text-muted">Email:</small> {invoice.customerEmail}</div>
                </div>
                
                <hr />
                
                <div className="mb-3">
                  <h6>THÔNG TIN PHÒNG</h6>
                  <div><small className="text-muted">Phòng:</small> {invoice.roomName}</div>
                  <div><small className="text-muted">Check-in:</small> {invoice.checkIn}</div>
                  <div><small className="text-muted">Check-out:</small> {invoice.checkOut}</div>
                  <div>
                    <small className="text-muted">Số đêm:</small> {invoice.nights} đêm &nbsp;•&nbsp; 
                    {invoice.adults} người lớn{invoice.children > 0 && `, ${invoice.children} trẻ em`}
                  </div>
                  
                  {invoice.services && invoice.services.length > 0 && (
                    <div className="mt-2">
                      <small className="text-muted d-block mb-1">Dịch vụ đã chọn:</small>
                      <ul className="mb-0 ps-4">
                        {invoice.services.map((s, idx) => (
                          <li key={idx}>
                            {s.name}: {fmtVnd(s.price)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <hr />
                
                <div className="mb-3">
                  <h6>CHI TIẾT GIÁ</h6>
                  <Row className="mb-1">
                    <Col xs={7}>Tiền phòng ({invoice.nights} đêm):</Col>
                    <Col xs={5} className="text-end">{fmtVnd(invoice.roomTotal)}</Col>
                  </Row>
                  <Row className="mb-1">
                    <Col xs={7}>Dịch vụ bổ sung:</Col>
                    <Col xs={5} className="text-end">{fmtVnd(invoice.servicesTotal)}</Col>
                  </Row>
                  <hr className="my-2" />
                  <Row className="mb-1">
                    <Col xs={7}>Tạm tính:</Col>
                    <Col xs={5} className="text-end">{fmtVnd(invoice.subtotal)}</Col>
                  </Row>
                  <Row className="mb-1">
                    <Col xs={7}>Thuế VAT (10%):</Col>
                    <Col xs={5} className="text-end">{fmtVnd(invoice.tax)}</Col>
                  </Row>
                  <Row className="mb-1">
                    <Col xs={7}>Phí dịch vụ (5%):</Col>
                    <Col xs={5} className="text-end">{fmtVnd(invoice.serviceFee)}</Col>
                  </Row>
                  <hr className="my-2" />
                  <Row className="fw-bold fs-5">
                    <Col xs={7}>TỔNG CỘNG:</Col>
                    <Col xs={5} className="text-end text-primary">{fmtVnd(invoice.total)}</Col>
                  </Row>
                </div>
                
                <hr />
                
                <div className="mb-3">
                  <h6>THÔNG TIN THANH TOÁN</h6>
                  <Row className="mb-1">
                    <Col xs={7}>Trạng thái:</Col>
                    <Col xs={5} className="text-end">
                      <Badge bg={invoice.paymentState === 'paid_in_full' ? 'success' : 'warning'}>
                        {invoice.paymentState === 'paid_in_full' ? 'Đã thanh toán đủ' : 'Đã đặt cọc'}
                      </Badge>
                    </Col>
                  </Row>
                  <Row className="mb-1">
                    <Col xs={7}>Đã thanh toán:</Col>
                    <Col xs={5} className="text-end text-success fw-bold">{fmtVnd(invoice.paidAmount)}</Col>
                  </Row>
                  {invoice.depositAmount > 0 && (
                    <Row className="mb-1">
                      <Col xs={7}>Tiền cọc:</Col>
                      <Col xs={5} className="text-end">{fmtVnd(invoice.depositAmount)}</Col>
                    </Row>
                  )}
                </div>
                
                <Alert variant="info" className="mt-3 small">
                  <div>⏰ <strong>Thời gian check-in:</strong> 14:00</div>
                  <div>⏰ <strong>Thời gian check-out:</strong> 12:00</div>
                </Alert>
                
                <div className="text-center text-muted small mt-4">
                  <div>Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ!</div>
                  <div>📞 Hotline: +84 123 456 789 &nbsp;•&nbsp; ✉️ Email: info@aurorapalacehotel.com</div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setInvoiceTarget(null)}>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Review Modal */}
        <ReviewModal
          show={reviewTarget !== null}
          onHide={() => setReviewTarget(null)}
          bookingId={reviewTarget?.id}
          roomId={reviewTarget?.roomId}
          onSuccess={() => {
            setReviewTarget(null);
            load();
          }}
        />
      </div>
    </main>
  );
}
