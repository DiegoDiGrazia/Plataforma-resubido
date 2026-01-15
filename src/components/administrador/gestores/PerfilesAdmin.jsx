import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Button } from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import ModalMensaje from './ModalMensaje';
import { obtenerUsuarios, obtenerPaginas, obtenerPerfiles, eliminarPaginaDelPerfil, agregarPaginaDelPerfil } from './apisUsuarios'; // Importa la función para obtener usuarios

const perfilVacio = {
  nombre: "",
  descripcion: "",  
  id: "0",
};



const PerfilesAdmin = () => {
  const [paginasPerfil, setPaginasPerfil] = useState([]);
  const [paginasFaltantes, setPaginasFaltantes] = useState([]);
  const [paginasTodas, setPaginasTodas] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mensajeModalExito, setMensajeModalExito] = useState("Los cambios se realizaron correctamente.");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPerfil, setSelectedPerfil] = useState(null);
  const [formData, setFormData] = useState({});
  const itemsPerPage = 10;  
  const TOKEN = useSelector((state) => state.formulario.token);

  // Cargar usuarios
  useEffect(() => {
    obtenerPerfiles(TOKEN).then(setPerfiles);
    obtenerPaginas(TOKEN, '').then(setPaginasTodas);

}, [TOKEN]);

  // Filtrar por búsqueda
  const perfilesFiltrados = useMemo(() => {
    return perfiles.filter((item) =>  //-- Cambia esto a usuarios cuando tengas la API
      item.nombre.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, perfiles]);

  const totalPages = Math.ceil(perfilesFiltrados.length / itemsPerPage);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return perfilesFiltrados.slice(start, start + itemsPerPage);
  }, [perfilesFiltrados, page]);

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  // Abrir modal con datos
  const handleEditClick = (perfil) => {
    setSelectedPerfil(perfil);
    setFormData({ ...perfil} ); // copia datos
    obtenerPaginas(TOKEN, perfil.id).then(setPaginasPerfil);


    const modal = new window.bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
  };

  useEffect(() => {
    const Paginasfaltantes = paginasTodas.filter(
      item => !paginasPerfil.some(p => p.id === item.id)
    );
    setPaginasFaltantes(Paginasfaltantes);
  }, [paginasPerfil]);

  // Guardar cambios
const handleSave = () => {
  axios
    .post(
      "https://panel.serviciosd.com/app_editar_perfil",
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
      setShowModal(true); // mostrar modal
      setTimeout(() => {
        window.location.reload(); // recargar luego de 3s
      }, 1500);
      
    })
    .catch((err) => {
      console.log("Error al guardar cambios:", err);
    });
};

const eliminarPerfil = (id) => {
  axios
    .post(
      "https://panel.serviciosd.com/app_eliminar_perfil",
      {
        token: TOKEN,
        id: id,
      },
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
      .then(() => {
        setMensajeModalExito('El usuario se elimino correctamente');
        setShowModal(true); // mostrar modal
        setTimeout(() => {
          window.location.reload(); // recargar luego de 3s
        }, 1500);
      })
    .catch((err) => {
      console.log("Error al guardar cambios:", err);
    });
};

const handleEliminarPaginaDelPerfil = (id_perfil, id_pagina) => {
  eliminarPaginaDelPerfil(TOKEN, id_perfil, id_pagina).then(() => {
    obtenerPaginas(TOKEN,  id_perfil).then(setPaginasPerfil);
  });
};

const handleAgregarPaginaDelPerfil = (id_perfil, id_pagina) => {
  agregarPaginaDelPerfil(TOKEN, id_perfil, id_pagina).then(() => {
    obtenerPaginas(TOKEN, id_perfil ).then(setPaginasPerfil);
  });
};




  return (
    <div className="content flex-grow-1 crearNotaGlobal">
      <div className='row miPerfilContainer soporteContainer'>
        <div className='col p-0'>
          <h3 id="saludo" className='headerTusNotas ml-0'>
            <img src="/images/auto_entrevistas_icon.png" alt="Icono 1" className="icon me-2 icono_tusNotas" /> Gestiona tus perfiles
          </h3>
          <h4 className='infoCuenta'>Gestiona tus perfiles</h4>
          <div className='abajoDeTusNotas'>
            En esta seccion podrás gestionar la creación, eliminación y edición de todos los usuarios de la plataforma.
          </div>
        </div>
      </div>
      {/* Búsqueda */}
      <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-3'>
        <div className='col buscadorNotas'> 
          <button className="mb-2 btn btn-primary" onClick={() => handleEditClick(perfilVacio)}>Crear nuevo perfil</button>
          <form className='buscadorNotasForm'>
            <input
              className='inputBuscadorNotas'
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="       Buscar perfiles por nombre"
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
                    <div className='col-10 text-end'>
                      <span className="text-muted">descripcion: {item.descripcion  || item.nombre}</span>
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
                {formData.id != '0' ? "Editar Perfil" : "Nuevo Perfil"}
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

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label">Descripcion</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.descripcion || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, descripcion: e.target.value })
                      }
                    />
                  </div>


                  {/* paginas del perfil */}
                  {formData.id !== "0" && (
                  <div className="mb-3">
                    <label className="form-label">Acceso a:</label>
                    
                      <ul className="list-unstyled d-flex flex-wrap gap-2">
                        {paginasPerfil.map((c) => (
                          <li
                            key={c.id}
                            className="d-flex align-items-center border rounded px-2 py-1"
                          >
                              {c.nombre}

                            {/* Botón con cruz para eliminar */}
                            <button
                              type="button"
                              className="btn-close"
                              aria-label="Eliminar"
                              onClick={() => {handleEliminarPaginaDelPerfil(formData.id, c.id)}}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                    )}
                  {/* todas las paginas para agregar*/}

                  {formData.id !== "0" && (
                  <div className="mb-3">
                    <label className="form-label">Páginas disponibles para agregar</label>
                    
                      <ul className="list-unstyled d-flex flex-wrap gap-2">
                        {paginasFaltantes.map((c) => (
                          <li
                            key={c.id}
                            className="d-flex align-items-center border rounded px-2 py-1"
                          >
                              {c.nombre}

                            {/* Botón con cruz para eliminar */}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary ms-1"
                              onClick={() => {handleAgregarPaginaDelPerfil(formData.id, c.id)}}
                            >
                              +
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    )}

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
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => eliminarPerfil(formData.id)}
                disabled={formData.id == '0'}

              >
                Eliminar
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

export default PerfilesAdmin;