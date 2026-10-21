import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { toastExito, toastError } from '../../utils/toastify/toastify.jsx';
import { obtenerPlanes, crearPlan, actualizarPlan, eliminarPlan } from '../Apis/planesApi';
import '../administrador/gestores/AbmsMobile.css';
import DropdawnSiNo from './DropdawnSiNo'


const perfilVacio = {
  alcance_x_nota: "0",
  con_dv360: "SI",
  con_meta: "SI",
  con_search: "SI",
  con_youtube: 'SI',
  id: "0",
  nombre: "",
  notas_x_mes: "0",
};

const AbmPlanes
 = () => {
  const [planes, setPlanes] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPerfil, setselectedPerfil] = useState(null);
  const [formData, setFormData] = useState({});
  const itemsPerPage = 10;
  const TOKEN = useSelector((state) => state.formulario.token);
  
  const permisoAlta = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Planes: Alta") || false);
  const permisoEdicion = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Planes: Edicion") || false);

  const cargarPlanes = () => {
    obtenerPlanes(TOKEN).then((data) => setPlanes(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    cargarPlanes();
}, [TOKEN]);


const handleEliminarPlan = (id) => {
  eliminarPlan(TOKEN, id)
      .then(() => {
        toastExito('¡El plan se eliminó exitosamente!');
        cargarPlanes();
      })
    .catch((err) => {
      console.error("Error al eliminar el plan:", err);
      toastError("Error al eliminar el plan");
    });
};

  // Filtrar por búsqueda
  const filteredClientes = useMemo(() => {
    return planes.filter((item) =>  
      item.nombre.toLowerCase().includes(search.toLowerCase()) 
    );
  }, [search, planes]);

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredClientes.slice(start, start + itemsPerPage);
  }, [filteredClientes, page]);

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

const handleEditClick = (perfil) => {
  const normalizado = {
    ...perfil,
    con_youtube: perfil.con_youtube === "SI" ? "1" : "0",
    con_meta: perfil.con_meta === "SI" ? "1" : "0",
    con_dv360: perfil.con_dv360 === "SI" ? "1" : "0",
    con_search: perfil.con_search === "SI" ? "1" : "0",
  };

  setselectedPerfil(normalizado);
  setFormData(normalizado);

  const modal = new window.bootstrap.Modal(document.getElementById('editModal'));
  modal.show();
};

const handleSave = () => {
  const payload = {
    nombre: formData.nombre,
    notas_x_mes: Number(formData.notas_x_mes) || 0,
    alcance_x_nota: Number(formData.alcance_x_nota) || 0,
    con_youtube: formData.con_youtube === "1" ? "SI" : "NO",
    con_meta: formData.con_meta === "1" ? "SI" : "NO",
    con_dv360: formData.con_dv360 === "1" ? "SI" : "NO",
    con_search: formData.con_search === "1" ? "SI" : "NO",
  };

  const esNuevo = formData.id == '0';
  const guardar = esNuevo
    ? crearPlan(TOKEN, payload)
    : actualizarPlan(TOKEN, formData.id, payload);

  guardar
    .then(() => {
      toastExito('¡El plan se guardó exitosamente!');

      const modalElement = document.getElementById('editModal');
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }

      cargarPlanes();
    })
    .catch((err) => {
      console.error("Error al guardar cambios:", err);
      toastError("Error al guardar cambios");
    });
};

  useEffect(() => {
    console.log(formData)
  }, [formData]);

  return (
    <div className="content flex-grow-1 crearNotaGlobal">
      <div className='row miPerfilContainer soporteContainer'>
        <div className='col p-0'>
          <h3 id="saludo" className='headerTusNotas ml-0'>
            <i className="icon me-2 icono_tusNotas bi bi-bag-fill" alt="Icono 1" /> Gestiona tus Planes
          </h3>
          <h4 className='infoCuenta'>Gestiona tus Planes</h4>
          <div className='abajoDeTusNotas'>
            En esta seccion podras gestionar la creacion, eliminacion y edicion <br />
            de todos los planes de la plataforma.
          </div>
        </div>
      </div>
      {/* Búsqueda */}
      <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-3'>
        <div className='col buscadorNotas'> 
          {permisoAlta && (
            <button className="mb-2 btn btn-primary" onClick={() => handleEditClick(perfilVacio)}>Crear nuevo plan</button>
          )}
          <form className='buscadorNotasForm'>
            <input
              className = 'inputBuscadorNotas'
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="       Buscar usuario por nombre"
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
                <li key={item.id} className="list-group-item">
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
                      <em>notas por mes: {item.notas_x_mes}</em>
                    </div>
                    <div className='col-3'>
                      <span className="text-muted">id: {item.id}</span>
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
                {selectedPerfil ? "Editar Perfil" : "Nuevo Perfil"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {selectedPerfil && (
                <>
                  {/* Nombre */}
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nombre || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                    />
                  </div>
                {/* con meta */}
                  <DropdawnSiNo
                    label="Con Meta"
                    name="con_meta"
                    value={formData.con_meta || "0"}
                    setFormData={setFormData}
                  />
                {/* con youtube */}
                  <DropdawnSiNo
                    label="Con Youtube"
                    name="con_youtube"
                    value={formData.con_youtube || "0"}
                    setFormData={setFormData}
                  />
                {/* con dv360 */}
                  <DropdawnSiNo
                    label="Con dv360"
                    name="con_dv360"
                    value={formData.con_dv360 || "0"}
                    setFormData={setFormData}
                  />
                {/* con search */}
                  <DropdawnSiNo
                    label="Con search"
                    name="con_search"
                    value={formData.con_search || "0"}
                    setFormData={setFormData}
                  />

                  {/* notas por mes */}
                  <div className="mb-3">
                    <label className="form-label">Notas por mes</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.notas_x_mes || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, notas_x_mes: e.target.value })
                      }
                    />
                  </div>

                {/* alcance por nota */}
                  <div className="mb-3">
                    <label className="form-label">alcance_x_nota</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.alcance_x_nota || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, alcance_x_nota: e.target.value })
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
                onClick={() => handleEliminarPlan(formData.id)}
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
                disabled={!formData.nombre}
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

export default AbmPlanes
;