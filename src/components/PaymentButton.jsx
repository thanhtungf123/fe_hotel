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
    <div className="btn-payment-container">
      {error && <Alert variant="danger" className="small mb-2">{error}</Alert>}
      <Button 
        className="btn-booking btn-payment" 
        disabled={loading} 
        onClick={handlePayment}
      >
        {loading ? (
          <>
            <Spinner animation="border" size="sm" style={{ width: '0.85rem', height: '0.85rem' }} />
            <span>Đang tạo...</span>
          </>
        ) : (
          <>
            <i className="bi bi-credit-card"></i>
            <span>{label || "Thanh toán"}</span>
          </>
        )}
      </Button>
    </div>
  );
}
