import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

export default function CancelModal({ show, onClose, onSubmit, loading = false, error = '' }) {
  const [reason, setReason] = useState('');
  useEffect(()=>{ if(!show) setReason(''); }, [show]);

  const submit = (e) => {
    e.preventDefault();
    onSubmit(reason);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title>Yêu cầu huỷ đặt phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Yêu cầu của bạn sẽ chuyển sang trạng thái <b>chờ duyệt huỷ</b>. Nhân viên/Admin sẽ xem xét theo chính sách huỷ.
          </p>
          {error && <Alert variant="danger" className="py-2">{error}</Alert>}
          <Form.Group className="mb-2">
            <Form.Label>Lý do (tuỳ chọn)</Form.Label>
            <Form.Control
              as="textarea" rows={4}
              value={reason}
              onChange={(e)=>setReason(e.target.value)}
              placeholder="VD: thay đổi kế hoạch, sự cố cá nhân..." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" className="border" onClick={onClose}>Đóng</Button>
          <Button type="submit" variant="danger" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu huỷ'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
