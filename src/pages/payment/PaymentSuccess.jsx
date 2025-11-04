// src/pages/payment/PaymentSuccess.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Container, Alert, Button } from "react-bootstrap";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setMsg("Thanh toán thành công! Đơn hàng của bạn đã được xác nhận giữ chỗ. Cảm ơn bạn.");
  }, [bookingId]);

  return (
    <Container className="text-center py-5">
      <h2 className="mb-3">🎉 Thanh toán thành công!</h2>
      <Alert variant="success">{msg}</Alert>
      <Button as={Link} to="/account/bookings" variant="primary" className="mt-3">
        Xem lịch sử đặt phòng
      </Button>
      {bookingId && (
        <div className="mt-2">
          <Button as={Link} to={`/account/bookings`} variant="outline-secondary">
            Mã đơn: #{bookingId}
          </Button>
        </div>
      )}
    </Container>
  );
}
