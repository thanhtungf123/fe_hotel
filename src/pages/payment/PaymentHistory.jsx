import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { Table, Container, Spinner, Alert } from "react-bootstrap";

export default function PaymentHistory() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const { data } = await axios.get("/payments");
        setList(data?.data || []);
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  if (loading) return <Spinner animation="border" className="mt-5" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="py-4">
      <h3>Lịch sử thanh toán</h3>
      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Mã đặt phòng</th>
            <th>Số tiền (VND)</th>
            <th>Phương thức</th>
            <th>Ngày thanh toán</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                Không có giao dịch nào.
              </td>
            </tr>
          ) : (
            list.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.booking?.id}</td>
                <td>{p.amount?.toLocaleString()}</td>
                <td>{p.paymentMethod}</td>
                <td>{new Date(p.paymentDate).toLocaleString()}</td>
                <td>{p.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
}
