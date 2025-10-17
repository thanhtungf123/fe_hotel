import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Button, Badge, Alert, Modal, Form, Pagination } from "react-bootstrap";
import axios from "../../api/axiosInstance";
import { useAuth } from "../../store/auth";
import { useNavigate, Link } from "react-router-dom";

const fmtVnd = (n) => (Number(n)||0).toLocaleString("vi-VN")+"₫";

export default function CancelRequests(){
  const { user } = useAuth();
  const nav = useNavigate();

  const [page, setPage] = useState(0);
  const size = 10;
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // modal
  const [target, setTarget] = useState(null);
  const [approved, setApproved] = useState(true);
  const [note, setNote] = useState("");
  const [submitErr, setSubmitErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(()=>{
    if (!user?.token) return nav("/login");
    const role = String(user?.role||"").toLowerCase();
    if (!["staff","admin"].includes(role)) nav("/");
  }, [user, nav]);

  const load = async () => {
    setLoading(true); setErr("");
    try{
      const { data } = await axios.get(`/bookings/cancel-requests?page=${page}&size=${size}`);
      setItems(data?.items || []);
      setTotal(data?.total || 0);
    }catch(e){
      setErr(e?.response?.data?.message || e.message || "Không tải được danh sách");
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [page]);

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
    <main className="py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 className="m-0">Duyệt huỷ đặt phòng</h3>
            <div className="text-muted small">Hiển thị các đơn <b>cancel_requested</b></div>
          </div>
        </div>

        {loading && <Alert variant="info">Đang tải...</Alert>}
        {err && <Alert variant="danger">{err}</Alert>}
        {!loading && !items.length && <Alert variant="secondary">Không có yêu cầu huỷ nào.</Alert>}

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
                    <td className="text-end">
                      <Button size="sm" variant="outline-success" className="me-2"
                        onClick={()=>{ setTarget(b); setApproved(true); }}>Approve</Button>
                      <Button size="sm" variant="outline-danger"
                        onClick={()=>{ setTarget(b); setApproved(false); }}>Reject</Button>
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
      </div>
    </main>
  );
}
