// ModalConInputFile.jsx
import React, { useState } from "react";
import Checkbox from "@/modules/notas/editor/checkbox";
import SelectorFecha from "@/shared/components/form/SelectorFecha";


export default function ModalConInputFile({ show, titulo, setFile, AlGuardar, onClose, fecha, setFecha }) {
  const [distribuir, setDistribuir] = useState(false)

  if (!show) return null; // si no está visible, no se renderiza

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ background: "var(--nd-color-overlay)" }}
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
                type="file"
                className="form-control"
                onChange={(e) => setFile(e.target.files[0])}
            />
            <Checkbox title={'Distribuir'}  value = {distribuir} onChange={setDistribuir} ></Checkbox>
            {distribuir &&
                        <SelectorFecha bloque label="Vencimiento distribución" valor={fecha} onChange={setFecha} />
            }
            </div>
            <button className="btn btn-primary" onClick={() => AlGuardar()}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}