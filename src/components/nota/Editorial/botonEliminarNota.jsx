import React, { useState } from 'react';
import axios from 'axios';

const BotonEliminarNota = ({ id, token }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleEliminar = async () => {
    setCargando(true);
    try {
      const response = await axios.post(
        "https://panel.serviciosd.com/app_cambiar_estado_nota",
        { id: id, token: token, estado: "ELIMINADO" },
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.status === "true") {
        window.location.reload();
      } else {
        console.error('Error al cambiar de estado:', response.data.message);
      }
    } catch (error) {
      console.error('Error al cambiar de estado:', error);
    } finally {
      setCargando(false);
      setMostrarModal(false);
    }
  };

  return (
    <>
      {/* Botón de eliminar */}
      <button
        onClick={() => setMostrarModal(true)}
        className="p-0 m-2 border-0 bg-transparent"
        title="Eliminar nota"
      >
        <i className="bi bi-trash3-fill m-2 fs-2 text-danger"></i>
      </button>

      {/* Modal de confirmación */}
      {mostrarModal && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar eliminación</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMostrarModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que querés eliminar esta nota?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setMostrarModal(false)}
                  disabled={cargando}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleEliminar}
                  disabled={cargando}
                >
                  {cargando ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BotonEliminarNota;
