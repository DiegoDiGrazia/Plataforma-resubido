import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import axios from 'axios';
import ModalMensaje from '../administrador/gestores/ModalMensaje';
import { obtenerUsuarios, obtenerClientes, obtenerPerfiles, obtenerGeo, obtenerPlanesMarketing } from '../administrador/gestores/apisUsuarios'; // Importa la función para obtener usuarios
import ArbolDistribucion from '../nota/Editorial/ArbolDistribucion';
import '../administrador/gestores/AbmsMobile.css';
import DropdawnSiNo from './DropdawnSiNo'


const perfilVacio = {
  alcance_x_nota: "0",
  con_dv360: "SI",
  con_meta: "SI",
  con_search: "SI",
  id: "0",
  nombre: "",
  notas_x_mes: "0",
};

const AbmPerfiles
 = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [geo, setGeo] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mensajeModalExito, setMensajeModalExito] = useState("Los cambios se realizaron correctamente.");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPerfil, setselectedPerfil] = useState(null);
  const [formData, setFormData] = useState({});
  const itemsPerPage = 10;  
  const desdeMarketing = new Date().toISOString().split('T')[0];
  const TOKEN = useSelector((state) => state.formulario.token);

  useEffect(() => {
    obtenerUsuarios(TOKEN).then(setUsuarios);
    obtenerClientes(TOKEN).then(setClientes);
    obtenerPlanesMarketing(TOKEN, desdeMarketing, desdeMarketing).then(setPlanes);
    obtenerGeo().then(setGeo);
}, [TOKEN]);

  // Filtrar por búsqueda
  const filteredClientes = useMemo(() => {
    return planes.filter((item) =>  //-- Cambia esto a usuarios cuando tengas la API
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
    console.log(perfil);
    setselectedPerfil(perfil);
    setFormData(perfil);
    const modal = new window.bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
};

const handleSave = () => {
  axios
    .post(
      "https://panel.serviciosd.com/app_plan_edit",
      {
        token: TOKEN,
        ...formData,
      },
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
    .then(() => {
      setMensajeModalExito('Los cambios se realizaron correctamente.');
      setShowModal(true);
      setTimeout(() => {
        window.location.reload(); 
      }, 1500);
    })
    .catch((err) => {
      console.log("Error al guardar cambios:", err);
    });
  };

  return (
    <div className="content flex-grow-1 crearNotaGlobal">
      <div className='row miPerfilContainer soporteContainer'>
        <div className='col p-0'>
          <h3 id="saludo" className='headerTusNotas ml-0'>
            <img src="/images/auto_entrevistas_icon.png" alt="Icono 1" className="icon me-2 icono_tusNotas" /> Gestiona tus perfiles
          </h3>
          <h4 className='infoCuenta'>Gestiona tus Perfiles</h4>
          <div className='abajoDeTusNotas'>
            En esta seccion podras gestionar la creacion, eliminacion y edicion <br />
            de todos los perfiles de la plataforma.
          </div>
        </div>
      </div>
      {/* Búsqueda */}
      <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-3'>
        <div className='col buscadorNotas'> 
          <button className="mb-2 btn btn-primary" onClick={() => handleEditClick(perfilVacio)}>Crear nuevo perfil</button>
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
                        className="btn btn-link p-0"
                        onClick={() => handleEditClick(item)}
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
      <ModalMensaje
        show={showModal}
        mensaje={mensajeModalExito}
        onClose={() => setShowModal(false)}  // 👈 cierra solo con la cruz
      />

    </div>
  );
};

export default AbmPerfiles
;