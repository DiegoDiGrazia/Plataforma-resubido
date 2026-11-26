import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { toastExito, toastError } from '@/shared/utils/toastify/toastify.jsx';
import { obtenerComisionistas, crearComisionista, actualizarComisionista, eliminarComisionista } from '@/api/comisionistasApi';

const comisionistaVacio = {
  nombre: "",
  apellido: "",
  mail: "",
  whatsapp: "",
  id: "0",
  cbu: ""
};

const AbmComisionistas
 = () => {
  const [planes] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedComisionista, setselectedComisionista] = useState(null);
  const [formData, setFormData] = useState({});
  const itemsPerPage = 10;  
  const TOKEN = useSelector((state) => state.formulario.token);
  const [comisionistas, setComisionistas] = useState([]);

  const permisoAlta = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Comisionistas: Alta") || false);
  const permisoEdicion = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Comisionistas: Edicion") || false);

  const cargarComisionistas = () => {
    obtenerComisionistas(TOKEN).then((data) => setComisionistas(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    cargarComisionistas();
}, [TOKEN]);

const handleEliminarComisionista = (id) => {
  eliminarComisionista(TOKEN, id)
    .then(() => {
      toastExito('¡El Comisionista se eliminó exitosamente!');
      cargarComisionistas();
    })
    .catch((err) => {
      console.error("Error al eliminar el comisionista:", err);
      toastError("Error al eliminar el comisionista");
    });
};

  const comisionistasFiltrados = useMemo(() => {
    return comisionistas.filter((item) => 
      item.nombre.toLowerCase().includes(search.toLowerCase()) 
    );
  }, [search, comisionistas]);
  const totalPages = Math.ceil(comisionistasFiltrados.length / itemsPerPage);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return comisionistasFiltrados.slice(start, start + itemsPerPage);
  }, [comisionistasFiltrados, page]);

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleEditClick = (perfil) => {
    console.log(perfil);
    setselectedComisionista(perfil);
    setFormData(perfil);
    const modal = new window.bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
};

const handleSave = () => {
  const payload = {
    nombre: formData.nombre,
    apellido: formData.apellido,
    mail: formData.mail,
    whatsapp: formData.whatsapp,
    cbu: formData.cbu,
  };

  const esNuevo = formData.id == '0';
  const guardar = esNuevo
    ? crearComisionista(TOKEN, payload)
    : actualizarComisionista(TOKEN, formData.id, payload);

  guardar
    .then(() => {
      toastExito('¡Los cambios se realizaron exitosamente!');

      const modalElement = document.getElementById('editModal');
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }

      cargarComisionistas();
    })
    .catch((err) => {
      console.error("Error al guardar cambios:", err);
      toastError("Error al guardar cambios");
    });
  };

  return (
    <div className="content flex-grow-1 crearNotaGlobal">
      <div className='row miPerfilContainer soporteContainer'>
        <div className='col p-0'>
          <h3 id="saludo" className='headerTusNotas ml-0'>
            <i className="bi bi-bag-fill" aria-hidden="true" /> ABM Comisionistas
          </h3>
        </div>
      </div>
      {/* Búsqueda */}
      <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-3'>
        <div className='col buscadorNotas'> 
          {permisoAlta && (
            <button className="mb-2 btn btn-primary" onClick={() => handleEditClick(comisionistaVacio)}>Crear nuevo Comisionista</button>
          )}
          <form className='buscadorNotasForm'>
            <input
              className = 'inputBuscadorNotas'
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar usuario por nombre"
            />
          </form>
        </div>
      </div>

      {/* Lista */}
      <div className='row miPerfilContainer soporteContainer mt-4 p-0'>
        <div>
          <ul className="list-group">
            {pagedItems.length === 0 ? (
              <li className="list-group-item">No hay resultados.</li>
            ) : (
              pagedItems.map((item) => (
                <li key={item.id} className="list-group-item nd-hover-elevate">
                  <div className='row pt-0'>
                    <div className='col-2'>
                      <button
                        className="btn btn-link text-primary p-0"
                        onClick={() => handleEditClick(item)}
                        disabled={!permisoEdicion}
                      >
                        <strong>{item.nombre}</strong>
                      </button>
                    </div>
                    <div className='col-3'>
                      <em>plan: {(planes.find((plan) => plan.id == item.id_plan))?.nombre}</em>
                    </div>
                    <div className='col-3'>
                      <span className="text-muted">Creado: {item.fecha_creacion}</span>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>

          {/* Paginación */}
          <div className="d-flex justify-content-center mt-3">
            <button
              className="btn btn-secondary btn-sm me-2"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
            >
              Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button
              className="btn btn-secondary btn-sm ms-2"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div className="modal fade" id="editModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {selectedComisionista ? "Editar Comisionista" : "Nuevo Comisionista"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {selectedComisionista && (
                <>
                  {/* Nombre */}
                  <div className="mb-3">
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nombre || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                    />
                  </div>
                {/* apellido */}
                  <div className="mb-3">
                    <label className="form-label">Apellido *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.apellido || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, apellido: e.target.value })
                      }
                    />
                  </div>
                {/* Email */}
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.mail || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, mail: e.target.value })
                      }
                    />
                  </div>

                {/* WhatsApp */}
                  <div className="mb-3">
                    <label className="form-label">WhatsApp</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.whatsapp || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                    />
                  </div>
                  {/* CBU */}
                  <div className="mb-3">
                    <label className="form-label">CBU *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.cbu || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, cbu: e.target.value })
                      }
                    />
                  </div>

                </>
              )}

            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => handleEliminarComisionista(formData.id)}
                disabled={formData.id == '0'}
              >
                Eliminar
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSave()}
                disabled={!formData.nombre || !formData.apellido || !formData.cbu}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

    </div>
  );
};

export default AbmComisionistas;