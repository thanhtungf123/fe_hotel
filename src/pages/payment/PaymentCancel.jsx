// src/pages/payment/PaymentCancel.jsx
import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Container, Alert, Button } from "react-bootstrap";

export default function PaymentCancel() {
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId");

  return (
    <Container className="text-center py-5">
      <h2 className="mb-3 text-danger">❌ Thanh toán bị hủy</h2>
      <Alert variant="warning">
        Giao dịch của bạn đã bị hủy.
        {bookingId && <p>Mã đặt phòng: #{bookingId}</p>}
      </Alert>
      {bookingId && (
        <Button as={Link} to={`/booking/${bookingId}`} variant="outline-primary" className="me-2">
          Thử thanh toán lại
        </Button>
      )}
      <Button as={Link} to="/account/bookings" variant="secondary">
        Quay lại lịch sử đặt phòng
      </Button>
    </Container>
  );
}
