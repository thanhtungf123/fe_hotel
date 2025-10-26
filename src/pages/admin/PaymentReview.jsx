import React, { useEffect, useState } from "react";
import { Container, Table, Alert, Button, Spinner } from "react-bootstrap";
import axios from "../../api/axiosInstance";

export default function PaymentReview() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr(""); setLoading(true);
    try {
      const { data } = await axios.get("/staff/payment-review", {
        params: { page: 0, size: 50 },
      }); // axiosInstance sẽ tự gắn X-Auth-Token
      setItems(data.items || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (bookingId) => {
    if (!window.confirm("Duyệt giao dịch và block phòng?")) return;
    try {
      await axios.post(`/staff/payment-review/${bookingId}/approve`);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  return (
    <Container className="py-4">
      <h4>🧾 Duyệt thanh toán</h4>
      {err && <Alert variant="danger" className="my-3">{err}</Alert>}
      {loading ? (
        <Spinner animation="border" className="mt-3" />
      ) : (
        <Table bordered hover className="mt-3">
          <thead>
            <tr>
              <th>#</th>
              <th>Phòng</th>
              <th>Ngày</th>         
              <th>Đã trả</th>
              <th>Tổng</th>
              <th>Thanh toán</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} className="text-center">Không có đơn nào</td></tr>
            ) : items.map((x, i) => (
              <tr key={x.bookingId}>
                <td>{i + 1}</td>
                <td>{x.roomName}</td>
                <td>{x.checkIn} → {x.checkOut}</td>
                <td>{(+x.totalPrice || 0).toLocaleString("vi-VN")}₫</td>
                <td>{(+x.amountPaid || 0).toLocaleString("vi-VN")}₫</td>
                <td>{x.paymentState}</td>
                <td>
                  <Button size="sm" onClick={() => approve(x.bookingId)}>Duyệt &amp; Block</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
