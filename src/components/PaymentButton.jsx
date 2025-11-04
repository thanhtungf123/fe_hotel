import React, { useState } from "react";
import { Button, Spinner, Alert } from "react-bootstrap";
import axios from "../api/axiosInstance";

export default function PaymentButton({ bookingId, totalPrice, purpose = "full", label }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setError(""); setLoading(true);
    try {
      const { data } = await axios.post(`/checkout/${bookingId}/create-payment-link?purpose=${purpose}`);
      if (data?.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        throw new Error("Không nhận được đường dẫn thanh toán.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      {error && <Alert variant="danger">{error}</Alert>}
      <Button className="w-100" variant="success" disabled={loading} onClick={handlePayment}>
        {loading ? (<><Spinner animation="border" size="sm" /> &nbsp;Đang tạo liên kết...</>)
                 : (<>💳 {label || "Thanh toán"} {totalPrice ? `(${Number(totalPrice).toLocaleString()} VND)` : ""}</>)}
      </Button>
    </div>
  );
}
