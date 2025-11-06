import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Button, Badge, Alert, Form, Row, Col, Modal, Spinner } from "react-bootstrap";
import axios from "../../api/axiosInstance";
import { useAuth } from "../../store/auth";

const fmtVnd = (n) => (Number(n)||0).toLocaleString("vi-VN")+"₫";

export default function StaffBookings(){
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [status, setStatus] = useState("");
  const [paymentState, setPaymentState] = useState("");

  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState("");
  
  // Confirmation modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const params = {};
      if (status) params.status = status;
      if (paymentState) params.paymentState = paymentState;
      const { data } = await axios.get("/staff/bookings", { params });
      setItems(data?.items || []);
    } catch(e){
      setErr(e?.response?.data?.message || e.message || "Không tải được danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [status, paymentState]);

  useEffect(()=>{
    const fetchDetail = async (id) => {
      setDetailLoading(true); setDetailErr("");
      try{
        const { data } = await axios.get(`/staff/bookings/${id}`);
        setDetail(data);
      }catch(e){
        setDetailErr(e?.response?.data?.message || e.message || "Không tải được chi tiết");
      }finally{ setDetailLoading(false); }
    };
    if (detailId) fetchDetail(detailId); else setDetail(null);
  }, [detailId]);

  const Status = ({s}) => (
    <Badge bg={s==="confirmed"?"success": s==="pending"?"secondary": s==="checked_in"?"info": s==="cancelled"?"dark":"warning"} className="text-uppercase">
      {String(s||"").replaceAll("_"," ")}
    </Badge>
  );

  const PayState = ({v}) => (
    <Badge bg={v==="paid_in_full"?"success": v==="deposit_paid"?"warning":"secondary"} className="text-uppercase">
      {String(v||"unpaid").replaceAll("_"," ")}
    </Badge>
  );

  return (
    <div>
      <Card className="mb-3">
        <Card.Body>
          <Row className="g-2 align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Trạng thái đơn</Form.Label>
                <Form.Select value={status} onChange={e=>setStatus(e.target.value)}>
                  <option value="">Tất cả</option>
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="checked_in">checked_in</option>
                  <option value="checked_out">checked_out</option>
                  <option value="cancelled">cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Thanh toán</Form.Label>
                <Form.Select value={paymentState} onChange={e=>setPaymentState(e.target.value)}>
                  <option value="">Tất cả</option>
                  <option value="paid_in_full">paid_in_full</option>
                  <option value="deposit_paid">deposit_paid</option>
                  <option value="unpaid">unpaid</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="text-end">
              <Button variant="outline-secondary" onClick={load} disabled={loading}>Làm mới</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading && <Alert variant="info">Đang tải...</Alert>}
      {err && <Alert variant="danger">{err}</Alert>}
      {!loading && !items.length && <Alert variant="secondary">Chưa có booking phù hợp.</Alert>}

      {!!items.length && (
        <Card className="card-soft">
          <Table hover responsive className="m-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Khách</th>
                <th>Phòng</th>
                <th>Ngày</th>
                <th>Tổng</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Mã check-in</th>
                <th>Dịch vụ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(b => (
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td>{b.customerName || "—"}</td>
                  <td>{b.roomName || "—"}</td>
                  <td>{b.checkIn} → {b.checkOut}</td>
                  <td className="text-danger fw-semibold">{fmtVnd(b.totalPrice)}</td>
                  <td><PayState v={b.paymentState} /></td>
                  <td><Status s={b.status} /></td>
                  <td><code>{b.checkInCode || "—"}</code></td>
                  <td>
                    {b.services && Array.isArray(b.services) && b.services.length > 0 && (
                      <div className="small text-muted">
                        ✨ {b.services.length} dịch vụ
                      </div>
                    )}
                  </td>
                  <td className="text-end">
                    <Button size="sm" variant="outline-primary" onClick={()=>setDetailId(b.id)}>Chi tiết</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal show={!!detailId} onHide={()=>setDetailId(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết booking #{detailId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailLoading && (<div className="py-3 text-center"><Spinner animation="border" /></div>)}
          {detailErr && (<Alert variant="danger">{detailErr}</Alert>)}
          {detail && (
            <>
            <Row className="g-3">
              <Col md={6}>
                <Card className="h-100">
                  <Card.Body>
                    <div className="mb-2"><strong>Phòng:</strong> {detail.roomName || "—"}</div>
                    <div className="mb-2"><strong>Ngày:</strong> {detail.checkIn} → {detail.checkOut}</div>
                    <div className="mb-2"><strong>Tổng tiền:</strong> {fmtVnd(detail.totalPrice)}</div>
                    <div className="mb-2"><strong>Thanh toán:</strong> <PayState v={detail.paymentState} /></div>
                    <div className="mb-2"><strong>Trạng thái:</strong> <Status s={detail.status} /></div>
                    <div className="mb-2"><strong>Mã check-in:</strong> <code className="fs-5 fw-bold text-primary">{detail.checkInCode || "—"}</code></div>
                    {/* ✅ Services */}
                    {detail.services && Array.isArray(detail.services) && detail.services.length > 0 && (
                      <div className="mt-3">
                        <div className="mb-2"><strong>Dịch vụ đã chọn:</strong></div>
                        <div className="d-flex flex-column gap-2">
                          {detail.services.map((svc, idx) => (
                            <div key={idx} className="p-2 bg-light rounded">
                              <div className="fw-semibold">{svc.name || svc.nameService || "Dịch vụ"}</div>
                              {/* {svc.description && (
                                <div className="small text-muted">{svc.description}</div>
                              )} */}
                              <div className="small text-primary fw-bold mt-1">
                                +{fmtVnd(svc.price || 0)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Body>
                    <div className="mb-2"><strong>Khách hàng</strong></div>
                    <div className="mb-2">Họ tên: {detail.customer?.fullName || "—"}</div>
                    <div className="mb-2">SĐT: {detail.customer?.phoneNumber || "—"}</div>
                    <div className="mb-2">CCCD: {detail.customer?.nationalIdNumber || "—"}</div>
                    <Row className="g-2">
                      {detail.customer?.idFrontUrl && (
                        <Col xs={6}><img alt="ID front" src={detail.customer.idFrontUrl} className="img-fluid rounded border" /></Col>
                      )}
                      {detail.customer?.idBackUrl && (
                        <Col xs={6}><img alt="ID back" src={detail.customer.idBackUrl} className="img-fluid rounded border" /></Col>
                      )}
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <div className="mt-3 d-flex gap-2">
              {detail.status === "confirmed" && (() => {
                const checkInDate = detail.checkIn ? new Date(detail.checkIn + 'T00:00:00') : null;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const canCheckIn = checkInDate && checkInDate <= today;
                
                return (
                  <Button 
                    variant="success" 
                    onClick={() => {
                      setConfirmAction({
                        title: "Xác nhận Check-in",
                        message: (
                          <>
                            <p className="mb-2">Bạn có chắc chắn muốn check-in cho booking <strong>#{detailId}</strong>?</p>
                            <div className="small text-muted">
                              <div><strong>Khách hàng:</strong> {detail.customer?.fullName || "—"}</div>
                              <div><strong>Phòng:</strong> {detail.roomName || "—"}</div>
                              <div><strong>Mã check-in:</strong> <code>{detail.checkInCode || "—"}</code></div>
                            </div>
                          </>
                        ),
                        confirmLabel: "Xác nhận Check-in",
                        confirmVariant: "success",
                        onConfirm: async () => {
                          setActionLoading(true);
                          setActionError("");
                          try {
                            await axios.post(`/staff/bookings/${detailId}/check-in`);
                            setDetailId(null);
                            setShowConfirm(false);
                            load();
                          } catch(e) {
                            setActionError(e?.response?.data?.message || e.message || "Lỗi khi check-in");
                          } finally {
                            setActionLoading(false);
                          }
                        }
                      });
                      setShowConfirm(true);
                    }}
                    disabled={!canCheckIn}
                    title={!canCheckIn && checkInDate ? `Chỉ có thể check-in từ ngày ${detail.checkIn}` : ""}
                  >
                    ✓ Check-in {!canCheckIn && checkInDate ? `(từ ${detail.checkIn})` : ""}
                  </Button>
                );
              })()}
              {detail.status === "checked_in" && (
                <Button 
                  variant="warning" 
                  onClick={() => {
                    setConfirmAction({
                      title: "Xác nhận Check-out",
                      message: (
                        <>
                          <p className="mb-2">Bạn có chắc chắn muốn check-out cho booking <strong>#{detailId}</strong>?</p>
                          <div className="small text-muted">
                            <div><strong>Khách hàng:</strong> {detail.customer?.fullName || "—"}</div>
                            <div><strong>Phòng:</strong> {detail.roomName || "—"}</div>
                          </div>
                        </>
                      ),
                      confirmLabel: "Xác nhận Check-out",
                      confirmVariant: "warning",
                      onConfirm: async () => {
                        setActionLoading(true);
                        setActionError("");
                        try {
                          await axios.post(`/staff/bookings/${detailId}/check-out`);
                          setDetailId(null);
                          setShowConfirm(false);
                          load();
                        } catch(e) {
                          setActionError(e?.response?.data?.message || e.message || "Lỗi khi check-out");
                        } finally {
                          setActionLoading(false);
                        }
                      }
                    });
                    setShowConfirm(true);
                  }}
                >
                  🚪 Check-out
                </Button>
              )}
            </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        show={showConfirm}
        onHide={() => {
          if (!actionLoading) {
            setShowConfirm(false);
            setConfirmAction(null);
            setActionError("");
          }
        }}
        centered
        backdrop={actionLoading ? "static" : true}
      >
        <Modal.Header closeButton={!actionLoading} style={{ borderBottom: "2px solid var(--primary-gold, #C9A24A)" }}>
          <Modal.Title style={{ fontFamily: "Playfair Display, serif", fontWeight: "600" }}>
            {confirmAction?.title || "Xác nhận"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionError && (
            <Alert variant="danger" className="mb-3 py-2">
              {actionError}
            </Alert>
          )}
          {typeof confirmAction?.message === "string" ? (
            <p className="mb-0">{confirmAction.message}</p>
          ) : (
            confirmAction?.message
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowConfirm(false);
              setConfirmAction(null);
              setActionError("");
            }}
            disabled={actionLoading}
            style={{ borderRadius: "8px" }}
          >
            Hủy
          </Button>
          <Button
            variant={confirmAction?.confirmVariant || "primary"}
            onClick={() => {
              confirmAction?.onConfirm?.();
            }}
            disabled={actionLoading}
            style={{ 
              borderRadius: "8px",
              ...(confirmAction?.confirmVariant === "success" && {
                background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                border: "none"
              }),
              ...(confirmAction?.confirmVariant === "warning" && {
                background: "linear-gradient(135deg, #ffc107 0%, #ff9800 100%)",
                border: "none",
                color: "#000"
              })
            }}
          >
            {actionLoading ? (
              <>
                <Spinner as="span" size="sm" animation="border" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              confirmAction?.confirmLabel || "Xác nhận"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}



