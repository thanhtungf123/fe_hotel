import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Container, Alert, Button, Spinner } from "react-bootstrap";
import axios from "../../api/axiosInstance";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        // Gọi BE để xác nhận booking đã thanh toán (PayOS webhook cũng gọi, đây chỉ là fallback)
        if (bookingId) {
          setMsg("Đang xác nhận thanh toán...");
          await axios.get(`/bookings?bookingId=${bookingId}`);
          setMsg("Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.");
        } else {
          setMsg("Thiếu thông tin bookingId, không thể xác nhận thanh toán.");
        }
      } catch (err) {
        setMsg("Xác nhận thanh toán thất bại: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    confirmPayment();
  }, [bookingId]);

  return (
    <Container className="text-center py-5">
      <h2 className="mb-3">🎉 Thanh toán thành công!</h2>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Alert variant="success">{msg}</Alert>
      )}
      <Button as={Link} to="/bookings" variant="primary" className="mt-3">
        Xem lịch sử đặt phòng
      </Button>
    </Container>
  );
}
