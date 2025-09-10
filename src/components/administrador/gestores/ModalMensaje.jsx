// ModalMensaje.jsx
import React from "react";

export default function ModalMensaje({ show, mensaje, onClose }) {
  if (!show) return null; // si no está visible, no se renderiza

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Notificación</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <p>{mensaje}</p>
          </div>
        </div>
      </div>
    </div>
  );
}