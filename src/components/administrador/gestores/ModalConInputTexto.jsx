// ModalConInputTexto.jsx
import React, { useState } from "react";
export default function ModalConInputTexto({ show, titulo, actualTexto, setTexto, AlGuardar, onClose }) {
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
            <h5 className="modal-title">{titulo}</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
            <input
                type="email"
                className="form-control"
                value={actualTexto || ""}
                onChange={(e) => setTexto(e.target.value)}
            />
            </div>
            <button className="btn btn-primary" onClick={() => AlGuardar(actualTexto)}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}