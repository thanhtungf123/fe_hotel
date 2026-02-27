// src/pages/payment/PaymentSuccess.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Container, Alert, Button, Card, Spinner } from "react-bootstrap";
import axios from "../../api/axiosInstance";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId");
  const purpose = params.get("purpose"); // ✅ Lấy purpose từ URL để phân biệt loại thanh toán
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setError("Không tìm thấy mã đơn hàng");
      setLoading(false);
      return;
    }

    // Load booking details với polling mechanism
    const loadBooking = async (retryCount = 0) => {
      try {
        const { data } = await axios.get(`/bookings/${bookingId}`);
        console.log(`✅ Loaded booking (attempt ${retryCount + 1}):`, data);
        
        // ✅ CRITICAL: Check if payment status is correct
        const hasPayment = Number(data.amountPaid || 0) > 0;
        const isPending = data.status === "pending";
        const isUnpaid = data.paymentState === "unpaid";
        
        // Nếu status vẫn pending/unpaid nhưng có payment record, trigger manual sync
        if ((isPending || (isUnpaid && hasPayment)) && hasPayment) {
          console.log("⚠️ Payment detected but status not updated. Triggering sync...");
          try {
            // Gọi endpoint để sync payment status
            await axios.post(`/bookings/${bookingId}/sync-payment-status`);
            console.log("✅ Triggered payment status sync. Reloading...");
            // Reload sau 1 giây
            setTimeout(() => loadBooking(retryCount + 1), 1000);
            return;
          } catch (syncError) {
            console.error("❌ Failed to sync payment status:", syncError);
            // Continue với retry logic bình thường
          }
        }
        
        // ✅ Check nếu booking đã confirmed nhưng chưa có check-in code → Trigger sync
        const isConfirmed = data.status === "confirmed";
        const hasCheckInCode = data.checkInCode && data.checkInCode.trim() !== "";
        if (isConfirmed && !hasCheckInCode && (data.paymentState === "deposit_paid" || data.paymentState === "paid_in_full")) {
          console.log("⚠️ Booking confirmed but missing check-in code. Triggering sync...");
          try {
            await axios.post(`/bookings/${bookingId}/sync-payment-status`);
            console.log("✅ Triggered sync to generate check-in code. Reloading...");
            setTimeout(() => loadBooking(retryCount + 1), 1000);
            return;
          } catch (syncError) {
            console.error("❌ Failed to sync:", syncError);
            // Continue to display even if sync fails
          }
        }
        
        // Nếu status vẫn pending/unpaid, continue polling để đợi return handler tạo payment record
        if (isPending || isUnpaid) {
          console.log("⚠️ Status still pending/unpaid. Continuing to poll...");
          // Retry sau 2 giây
          if (retryCount < 5) {
            setTimeout(() => loadBooking(retryCount + 1), 2000);
            return;
          }
        }
        
        // Nếu status đã đúng hoặc đã retry đủ lần → Display
        setBooking(data);
        setLoading(false);
      } catch (e) {
        console.error(`❌ Failed to load booking (attempt ${retryCount + 1}):`, e);
        console.error("Response:", e?.response?.data);
        console.error("Status:", e?.response?.status);
        
        // Retry up to 5 times với exponential backoff
        if (retryCount < 5) {
          const delay = Math.min((retryCount + 1) * 2000, 10000); // Max 10s
          console.log(`⏳ Retrying in ${delay}ms... (${retryCount + 1}/5)`);
          setTimeout(() => loadBooking(retryCount + 1), delay);
        } else {
          setError(`Không thể tải thông tin đơn hàng. ${e?.response?.data?.message || e.message}`);
          setLoading(false);
        }
      }
    };

    // Đợi 1 giây đầu tiên để return handler xử lý xong
    setTimeout(() => loadBooking(0), 1000);
  }, [bookingId]);

  const fmtVnd = (n) => (Number(n) || 0).toLocaleString("vi-VN") + "₫";

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang xác nhận thanh toán...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center py-5">
        <Alert variant="warning">{error}</Alert>
        <Button as={Link} to="/account/bookings" variant="primary">
          Xem lịch sử đặt phòng
        </Button>
      </Container>
    );
  }

  const paymentStateLabel = (state) => {
    const map = {
      unpaid: "Chưa thanh toán",
      deposit_paid: "Đã thanh toán cọc",
      paid_in_full: "Đã thanh toán toàn bộ",
    };
    return map[state] || state;
  };

  return (
    <Container className="py-5" style={{ maxWidth: "600px" }}>
      <div className="text-center mb-4">
        <div style={{ fontSize: "4rem" }}></div>
        <h2 className="fw-bold">Thanh toán thành công!</h2>
        <p className="text-muted">
          Đơn hàng của bạn đã được xác nhận. Cảm ơn bạn đã tin tưởng <b>Aurora Palace</b>!
        </p>
      </div>

      {booking && (
        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="mb-3">Thông tin đặt phòng</h5>
            <div className="mb-2">
              <strong>Mã đơn:</strong> #{booking.id}
            </div>
            <div className="mb-2">
              <strong>Phòng:</strong> {booking.roomName || "N/A"}
            </div>
            <div className="mb-2">
              <strong>Ngày nhận phòng:</strong>{" "}
              {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString("vi-VN") : "N/A"}
            </div>
            <div className="mb-2">
              <strong>Ngày trả phòng:</strong>{" "}
              {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString("vi-VN") : "N/A"}
            </div>
            <hr />
            <div className="mb-2">
              <strong>Tổng tiền:</strong>{" "}
              <span className="text-primary fs-5">{fmtVnd(booking.totalPrice)}</span>
            </div>
            <div className="mb-2">
              <strong>Trạng thái thanh toán:</strong>{" "}
              <span className={`badge ${booking.paymentState === 'paid_in_full' ? 'bg-success' : 'bg-warning'}`}>
                {paymentStateLabel(booking.paymentState)}
              </span>
            </div>
            {/* ✅ Chỉ hiển thị "Đã thanh toán" và "Còn lại" khi chưa thanh toán đủ */}
            {String(booking.paymentState).toLowerCase() !== 'paid_in_full' && (
              <>
                <div className="mb-2">
                  <strong>Đã thanh toán:</strong>{" "}
                  <span className="text-success fw-bold">{fmtVnd(booking.amountPaid)}</span>
                </div>
                {Number(booking.amountRemaining || 0) > 0 && (
                  <div className="mb-2">
                    <strong>Còn lại:</strong>{" "}
                    <span className="text-danger fw-bold">{fmtVnd(booking.amountRemaining)}</span>
                  </div>
                )}
              </>
            )}
            {/* ✅ Khi đã thanh toán đủ, hiển thị thông báo rõ ràng dựa vào purpose */}
            {String(booking.paymentState).toLowerCase() === 'paid_in_full' && (
              <div className="mb-2 p-3 bg-success bg-opacity-10 rounded border border-success">
                <div className="text-success fw-bold">
                  {String(purpose).toLowerCase() === 'balance' ? (
                    <>✅ Đã thanh toán tiền còn lại: {fmtVnd(booking.totalPrice)}</>
                  ) : (
                    <>✅ Đã thanh toán toàn bộ: {fmtVnd(booking.totalPrice)}</>
                  )}
                </div>
                <div className="small text-muted mt-1">
                  {String(purpose).toLowerCase() === 'balance' ? (
                    <>Bạn đã hoàn tất thanh toán cho đơn hàng này.</>
                  ) : (
                    <>Bạn đã thanh toán đầy đủ cho đơn hàng này.</>
                  )}
                </div>
              </div>
            )}
            <hr />
            <div className="mb-2">
              <strong>Trạng thái đơn hàng:</strong>{" "}
              <span className="badge bg-primary text-uppercase">
                {(booking.status || "").replaceAll("_", " ")}
              </span>
            </div>
            {(booking.checkInCode && booking.checkInCode.trim() !== "") ? (
              <div className="mb-2 mt-3 p-3 bg-light rounded border border-primary">
                <strong>🔑 Mã Check-in:</strong>{" "}
                <code className="fs-4 fw-bold text-primary">{booking.checkInCode}</code>
                <div className="small text-muted mt-1">
                  Vui lòng cung cấp mã này tại quầy lễ tân khi nhận phòng
                </div>
              </div>
            ) : (booking.status === "confirmed" && (booking.paymentState === "deposit_paid" || booking.paymentState === "paid_in_full")) ? (
              <div className="mb-2 mt-3 p-3 bg-warning bg-opacity-10 rounded border border-warning">
                <div className="small text-muted">
                  ⏳ Mã check-in đang được tạo. Vui lòng refresh trang sau vài giây.
                </div>
              </div>
            ) : null}
          </Card.Body>
        </Card>
      )}

      <div className="text-center mt-4">
        <Button as={Link} to="/account/bookings" variant="primary" size="lg" className="me-2">
          Xem lịch sử đặt phòng
        </Button>
        <Button as={Link} to="/" variant="outline-secondary" size="lg">
          Về trang chủ
        </Button>
      </div>
    </Container>
  );
}
