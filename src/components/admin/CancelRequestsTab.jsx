import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Button, Badge, Alert, Modal, Form, Pagination, Row, Col, Spinner } from "react-bootstrap";
import axios from "../../api/axiosInstance";
import { Link } from "react-router-dom";

const fmtVnd = (n) => (Number(n)||0).toLocaleString("vi-VN")+"₫";

export default function CancelRequestsTab(){
  const [page, setPage] = useState(0);
  const size = 10;
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  
  // Filter: all, refundPending
  const [filter, setFilter] = useState("all"); // "all" | "refundPending"

  // modal
  const [target, setTarget] = useState(null);
  const [approved, setApproved] = useState(true);
  const [note, setNote] = useState("");
  const [submitErr, setSubmitErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // detail modal for viewing refund info
  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState("");
  const [confirmRefundLoading, setConfirmRefundLoading] = useState(false);
  
  // Confirmation modal for refund completion
  const [showConfirmRefundModal, setShowConfirmRefundModal] = useState(false);
  const [confirmRefundErr, setConfirmRefundErr] = useState("");

  const load = async () => {
    setLoading(true); setErr("");
    try{
      const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
      if (filter === "refundPending") {
        params.set("refundPending", "true");
      }
      const { data } = await axios.get(`/bookings/cancel-requests?${params.toString()}`);
      setItems(data?.items || []);
      setTotal(data?.total || 0);
    }catch(e){
      setErr(e?.response?.data?.message || e.message || "Không tải được danh sách");
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ 
    setPage(0); // Reset page when filter changes
  }, [filter]);

  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [page, filter]);

  // Load detail when detailId changes
  useEffect(() => {
    const fetchDetail = async (id) => {
      setDetailLoading(true);
      setDetailErr("");
      try {
        const { data } = await axios.get(`/staff/bookings/${id}`);
        setDetail(data);
      } catch (e) {
        setDetailErr(e?.response?.data?.message || e.message || "Không tải được chi tiết");
      } finally {
        setDetailLoading(false);
      }
    };
    if (detailId) {
      fetchDetail(detailId);
    } else {
      setDetail(null);
    }
  }, [detailId]);

  const totalPages = useMemo(()=> Math.ceil(total/size), [total,size]);

  const onSubmit = async () => {
    if (!target) return;
    setSubmitting(true); setSubmitErr("");
    try{
      await axios.patch(`/bookings/${target.id}/approve-cancel`, {
        approve: approved,
        note: note || ""
      });
      setTarget(null);
      setNote(""); setApproved(true);
      await load();
    }catch(e){
      setSubmitErr(e?.response?.data?.message || e.message || "Thao tác thất bại");
    }finally{ setSubmitting(false); }
  };

  const Status = ({s}) => (
    <Badge bg={s==="cancel_requested" ? "warning":"secondary"} className="text-uppercase">
      {String(s||"").replaceAll("_"," ")}
    </Badge>
  );

  return (
    <div>
      {/* Filter */}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex gap-2 align-items-center">
            <Form.Label className="mb-0">Lọc theo:</Form.Label>
            <Button 
              variant={filter === "all" ? "primary" : "outline-primary"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              Tất cả
            </Button>
            <Button 
              variant={filter === "refundPending" ? "warning" : "outline-warning"}
              size="sm"
              onClick={() => setFilter("refundPending")}
            >
              💳 Cần hoàn tiền
            </Button>
          </div>
        </Card.Body>
      </Card>

      {loading && <Alert variant="info">Đang tải...</Alert>}
      {err && <Alert variant="danger">{err}</Alert>}
      {!loading && !items.length && (
        <Alert variant="secondary">
          {filter === "refundPending" 
            ? "Không có đơn nào cần hoàn tiền." 
            : "Không có yêu cầu huỷ nào."}
        </Alert>
      )}

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
                <th>Lý do KH hủy</th>
                <th>Trạng thái</th>
                <th>Hoàn tiền</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(b=>(
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td>{b.customerName || "—"}</td>
                  <td><Link to={`/rooms/${b.roomId}`}>{b.roomName}</Link></td>
                  <td>{b.checkIn} → {b.checkOut}</td>
                  <td className="text-danger fw-semibold">{fmtVnd(b.totalPrice)}</td>
                  <td style={{maxWidth: 260}}>
                    <div className="text-truncate" title={b.cancelReason || ''}>
                      {b.cancelReason || <span className="text-muted">—</span>}
                    </div>
                  </td>
                  <td><Status s={b.status} /></td>
                  <td>
                    {b.status === "cancelled" && (
                      <>
                        {b.refundSubmitted ? (
                          b.refundCompleted ? (
                            <Badge bg="success">✅ Đã hoàn tiền</Badge>
                          ) : (
                            <Badge bg="warning">⏳ Đang chờ hoàn tiền</Badge>
                          )
                        ) : (
                          <Badge bg="secondary">Chưa gửi thông tin</Badge>
                        )}
                      </>
                    )}
                  </td>
                  <td className="text-end">
                    {b.status === "cancel_requested" ? (
                      <>
                        <Button size="sm" variant="outline-success" className="me-2"
                          onClick={()=>{ setTarget(b); setApproved(true); }}>Approve</Button>
                        <Button size="sm" variant="outline-danger"
                          onClick={()=>{ setTarget(b); setApproved(false); }}>Reject</Button>
                      </>
                    ) : b.status === "cancelled" ? (
                      <Button 
                        size="sm" 
                        variant={b.refundSubmitted && !b.refundCompleted ? "warning" : "outline-info"}
                        onClick={() => setDetailId(b.id)}
                      >
                        {b.refundSubmitted && !b.refundCompleted ? "💳 Xử lý hoàn tiền" : "Chi tiết"}
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {totalPages>1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.Prev disabled={page<=0} onClick={()=>setPage(p=>p-1)} />
            {Array.from({length: totalPages}).map((_,i)=>(
              <Pagination.Item key={i} active={i===page} onClick={()=>setPage(i)}>{i+1}</Pagination.Item>
            ))}
            <Pagination.Next disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)} />
          </Pagination>
        </div>
      )}

      <Modal show={!!target} onHide={()=>setTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{approved? "Phê duyệt huỷ": "Từ chối huỷ"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitErr && <Alert variant="danger" className="py-2">{submitErr}</Alert>}
          <div className="small text-muted mb-2">Đơn #{target?.id} — {target?.roomName}</div>
          <Form.Group>
            <Form.Label>Ghi chú</Form.Label>
            <Form.Control as="textarea" rows={3} value={note} onChange={e=>setNote(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" className="border" onClick={()=>setTarget(null)}>Đóng</Button>
          <Button variant={approved? "success":"danger"} onClick={onSubmit} disabled={submitting}>
            {submitting? "Đang xử lý..." : (approved? "Approve":"Reject")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Detail Modal for Refund Info */}
      <Modal show={!!detailId} onHide={() => setDetailId(null)} size="lg" centered>
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
                      <div className="mb-2"><strong>Trạng thái:</strong> <Status s={detail.status} /></div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <div className="mb-2"><strong>Khách hàng</strong></div>
                      <div className="mb-2">Họ tên: {detail.customer?.fullName || "—"}</div>
                      <div className="mb-2">SĐT: {detail.customer?.phoneNumber || "—"}</div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              {/* Refund Information Section */}
              {detail.status === "cancelled" && (
                <Card className="mt-3">
                  <Card.Header className="bg-light">
                    <strong>💳 Thông tin hoàn tiền</strong>
                  </Card.Header>
                  <Card.Body>
                    {detail.refund?.hasRefundInfo ? (
                      <>
                        <div className="mb-2"><strong>Chủ tài khoản:</strong> {detail.refund.accountHolder || "—"}</div>
                        <div className="mb-2"><strong>Số tài khoản:</strong> {detail.refund.accountNumber || "—"}</div>
                        <div className="mb-2"><strong>Ngân hàng:</strong> {detail.refund.bankName || "—"}</div>
                        <div className="mb-2"><strong>Thời gian gửi:</strong> {detail.refund.submittedAt ? new Date(detail.refund.submittedAt).toLocaleString('vi-VN') : "—"}</div>
                        {detail.refund.isCompleted && (
                          <div className="mb-2">
                            <Badge bg="success">✅ Đã hoàn tiền</Badge>
                            <div className="small text-muted mt-1">
                              Hoàn tất: {detail.refund.completedAt ? new Date(detail.refund.completedAt).toLocaleString('vi-VN') : "—"}
                            </div>
                          </div>
                        )}
                        {!detail.refund.isCompleted && (
                          <Button
                            variant="success"
                            className="mt-2"
                            onClick={() => {
                              setShowConfirmRefundModal(true);
                              setConfirmRefundErr("");
                            }}
                            disabled={confirmRefundLoading}
                          >
                            ✅ Xác nhận đã hoàn tiền
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="text-muted">
                        Khách hàng chưa cung cấp thông tin hoàn tiền.
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDetailId(null)}>Đóng</Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal for Refund Completion */}
      <Modal
        show={showConfirmRefundModal}
        onHide={() => {
          if (!confirmRefundLoading) {
            setShowConfirmRefundModal(false);
            setConfirmRefundErr("");
          }
        }}
        centered
        backdrop={confirmRefundLoading ? "static" : true}
      >
        <Modal.Header 
          closeButton={!confirmRefundLoading} 
          style={{ borderBottom: "2px solid #28a745" }}
        >
          <Modal.Title style={{ fontWeight: "600", color: "#28a745" }}>
            💳 Xác nhận hoàn tiền
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmRefundErr && (
            <Alert variant="danger" className="mb-3 py-2">
              {confirmRefundErr}
            </Alert>
          )}
          {detail && detail.refund && (
            <div>
              <p className="mb-3">
                Bạn có chắc chắn muốn xác nhận đã hoàn tiền cho đơn đặt phòng <strong>#{detailId}</strong>?
              </p>
              <Card className="bg-light">
                <Card.Body>
                  <div className="mb-2"><strong>Khách hàng:</strong> {detail.customer?.fullName || "—"}</div>
                  <div className="mb-2"><strong>Số tiền hoàn:</strong> <span className="text-danger fw-bold">{fmtVnd(detail.totalPrice)}</span></div>
                  <div className="mb-2"><strong>Tài khoản:</strong> {detail.refund.accountHolder || "—"}</div>
                  <div className="mb-2"><strong>Số tài khoản:</strong> {detail.refund.accountNumber || "—"}</div>
                  <div className="mb-0"><strong>Ngân hàng:</strong> {detail.refund.bankName || "—"}</div>
                </Card.Body>
              </Card>
              <p className="small text-muted mt-3 mb-0">
                Hành động này sẽ gửi email thông báo hoàn tiền thành công cho khách hàng.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowConfirmRefundModal(false);
              setConfirmRefundErr("");
            }}
            disabled={confirmRefundLoading}
            style={{ borderRadius: "8px" }}
          >
            Hủy
          </Button>
          <Button
            variant="success"
            onClick={async () => {
              setConfirmRefundLoading(true);
              setConfirmRefundErr("");
              try {
                await axios.post(`/staff/bookings/${detailId}/confirm-refund`);
                setShowConfirmRefundModal(false);
                setDetailId(null);
                await load();
              } catch (e) {
                setConfirmRefundErr(e?.response?.data?.message || e.message || "Xác nhận hoàn tiền thất bại");
              } finally {
                setConfirmRefundLoading(false);
              }
            }}
            disabled={confirmRefundLoading}
            style={{ 
              borderRadius: "8px",
              background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
              border: "none"
            }}
          >
            {confirmRefundLoading ? (
              <>
                <Spinner as="span" size="sm" animation="border" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

