import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import axios from 'axios';
import ModalMensaje from '../administrador/gestores/ModalMensaje';
import { obtenerUsuarios, obtenerClientes, obtenerPerfiles, obtenerGeo, obtenerPlanesMarketing, obtenerComisionistas } from '../administrador/gestores/apisUsuarios'; // Importa la función para obtener usuarios
import ArbolDistribucion from '../nota/Editorial/ArbolDistribucion';
import '../administrador/gestores/AbmsMobile.css';
import DropdawnSiNo from './DropdawnSiNo'


const comisionistaVacio = {
  nombre: "",
  apellido: "",
  mail: "",
  whatsapp: "",
  id: "0",
  cbu: ""
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
  const [selectedComisionista, setselectedComisionista] = useState(null);
  const [formData, setFormData] = useState({});
  const itemsPerPage = 10;  
  const desdeMarketing = new Date().toISOString().split('T')[0];
  const TOKEN = useSelector((state) => state.formulario.token);
  const [comisionistas, setComisionistas] = useState([]);

  useEffect(() => {
    obtenerComisionistas(TOKEN).then(setComisionistas);
    obtenerGeo().then(setGeo);
}, [TOKEN]);

  // Filtrar por búsqueda
  const comisionistasFiltrados = useMemo(() => {
    return comisionistas.filter((item) =>  //-- Cambia esto a usuarios cuando tengas la API
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
  axios
    .post(
      "https://panel.serviciosd.com/app_comisionista_edit",
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
            <img src="/images/auto_entrevistas_icon.png" alt="Icono 1" className="icon me-2 icono_tusNotas" /> Gestiona comisionistas
          </h3>
          <h4 className='infoCuenta'>Gestiona tus comisionstas</h4>
          <div className='abajoDeTusNotas'>
            En esta seccion podras gestionar los comisionistas de la plataforma.
          </div>
        </div>
      </div>
      {/* Búsqueda */}
      <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-3'>
        <div className='col buscadorNotas'> 
          <button className="mb-2 btn btn-primary" onClick={() => handleEditClick(comisionistaVacio)}>Crear nuevo comisionista</button>
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
                {selectedComisionista ? "Editar Perfil" : "Nuevo Perfil"}
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
      <ModalMensaje
        show={showModal}
        mensaje={mensajeModalExito}
        onClose={() => setShowModal(false)}  // 👈 cierra solo con la cruz
      />

    </div>
  );
};

export default AbmPerfiles;