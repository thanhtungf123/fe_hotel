import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Modal, Button } from "react-bootstrap";

function ConfirmModal({ title, message, confirmText = "Đồng ý", cancelText = "Hủy", variant = "primary", onResolve }) {
  const [show, setShow] = useState(true);

  const handleClose = (answer) => {
    setShow(false);
    onResolve(answer);
  };

  return (
    <Modal show={show} onHide={() => handleClose(false)} centered backdrop="static">
      {title && (
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
      )}
      {message && (
        <Modal.Body>
          <div className="text-muted">{message}</div>
        </Modal.Body>
      )}
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={() => handleClose(false)}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={() => handleClose(true)}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function showConfirm(options = {}) {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = () => {
      root.unmount();
      container.remove();
    };

    const handleResolve = (answer) => {
      cleanup();
      resolve(answer);
    };

    root.render(<ConfirmModal {...options} onResolve={handleResolve} />);
  });
}

