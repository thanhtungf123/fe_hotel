import React, { useState } from "react";
import { Button, Spinner, Alert } from "react-bootstrap";
import axios from "../api/axiosInstance";

/**
 * Props:
 *   bookingId: number
 *   totalPrice: number (optional, chỉ để hiển thị)
 */
export default function PaymentButton({ bookingId, totalPrice }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`/checkout/${bookingId}/create-payment-link`);
      if (data?.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl; // Redirect thật đến PayOS
      } else {
        throw new Error("Không nhận được đường dẫn thanh toán.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      {error && <Alert variant="danger">{error}</Alert>}
      <Button
        variant="success"
        disabled={loading}
        onClick={handlePayment}
        className="w-100"
      >
        {loading ? (
          <>
            <Spinner animation="border" size="sm" /> &nbsp;Đang tạo liên kết thanh toán...
          </>
        ) : (
          <>
            💳 Thanh toán {totalPrice ? `(${totalPrice.toLocaleString()} VND)` : ""}
          </>
        )}
      </Button>
    </div>
  );
}