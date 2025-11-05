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
            <Row className="g-3">
              <Col md={6}>
                <Card className="h-100">
                  <Card.Body>
                    <div className="mb-2"><strong>Phòng:</strong> {detail.roomName || "—"}</div>
                    <div className="mb-2"><strong>Ngày:</strong> {detail.checkIn} → {detail.checkOut}</div>
                    <div className="mb-2"><strong>Tổng tiền:</strong> {fmtVnd(detail.totalPrice)}</div>
                    <div className="mb-2"><strong>Thanh toán:</strong> <PayState v={detail.paymentState} /></div>
                    <div className="mb-2"><strong>Trạng thái:</strong> <Status s={detail.status} /></div>
                    <div className="mb-2"><strong>Mã check-in:</strong> <code>{detail.checkInCode || "—"}</code></div>
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
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}



