import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import { obtenerPerfiles, crearPerfil, editarPerfil, eliminarPerfilPorId } from '../../Apis/perfilesApi.js';
import { obtenerPaginas, crearAcceso, eliminarAccesosId } from '../../Apis/paginasApi.js';
import { ToastContainer } from 'react-toastify';
import { toastExito, toastError } from '../../../utils/toastify/toastify.jsx';
import 'react-toastify/dist/ReactToastify.css';

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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPerfil, setSelectedPerfil] = useState(null);
  const [formData, setFormData] = useState({});
  const [guardando, setGuardando] = useState(false);
  const itemsPerPage = 10;  

  const TOKEN = useSelector((state) => state.formulario.token);
  const permisoAlta = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Perfiles: Alta") || false);
  const permisoEdicion = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Perfiles: Edicion") || false);

  const fetchPerfiles = async () => {
    try {
      const data = await obtenerPerfiles(TOKEN);
      setPerfiles(data || []);
    } catch (error) {
      console.error("Error al obtener perfiles:", error);
    }
  };

  useEffect(() => {
    fetchPerfiles();
    obtenerPaginas(TOKEN).then((data) => setPaginasTodas(data || []));
  }, [TOKEN]);

  // Filtrar por búsqueda
  const perfilesFiltrados = useMemo(() => {
    return perfiles.filter((item) =>  
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
    setFormData({ ...perfil} ); 
    obtenerPaginas(TOKEN, perfil.id).then((data) => setPaginasPerfil(data || []));

    const modal = new window.bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
  };

  useEffect(() => {
    const Paginasfaltantes = paginasTodas.filter(
      item => !paginasPerfil.some(p => p.id === item.id)
    );
    setPaginasFaltantes(Paginasfaltantes);
  }, [paginasPerfil, paginasTodas]);

  const cerrarModal = () => {
    const modalEl = document.getElementById('editModal');
    const modal = window.bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  };

  // Guardar o Crear Perfil
  const handleSave = async () => {
    setGuardando(true);
    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        plataforma: formData.plataforma || null, 
      };

      if (formData.id === "0") {
        await crearPerfil(TOKEN, payload);
        toastExito('¡El perfil fue creado exitosamente!');
      } else {
        await editarPerfil(TOKEN, formData.id, payload);
        toastExito('¡Los cambios se guardaron correctamente!');
      }

      await fetchPerfiles(); 
      cerrarModal();

    } catch (error) {
      console.error("Error al guardar el perfil:", error);
      toastError('Ocurrió un error al guardar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarPerfil = async (id) => {
    try {
      await eliminarPerfilPorId(TOKEN, id);
      toastExito('¡El perfil se eliminó correctamente!');
      await fetchPerfiles(); 
    } catch (error) {
      console.error("Error al eliminar perfil:", error);
      toastError('Ocurrió un error al eliminar el perfil.');
    }
  };

  const handleEliminarPaginaDelPerfil = async (id_perfil, id_pagina) => {
    try {
      await eliminarAccesosId(TOKEN, id_perfil, id_pagina);
      toastExito("¡Acceso eliminado correctamente!");
      const dataActualizada = await obtenerPaginas(TOKEN, id_perfil);
      setPaginasPerfil(dataActualizada || []);
    } catch (error) {
      console.error(error);
      toastError("Ocurrió un error al eliminar el acceso.");
    }
  };

  const handleAgregarPaginaDelPerfil = async (id_perfil, id_pagina) => {
    try {
      const payload = {
        id_perfil: Number(id_perfil),
        id_pagina: Number(id_pagina)
      };
      await crearAcceso(TOKEN, payload);
      toastExito("¡Acceso agregado correctamente!");
      const dataActualizada = await obtenerPaginas(TOKEN, id_perfil);
      setPaginasPerfil(dataActualizada || []);
    } catch (error) {
      console.error(error);
      toastError("Ocurrió un error al agregar el acceso.");
    }
  };

  return (
    <div className="content flex-grow-1 crearNotaGlobal">
      <div className='row miPerfilContainer soporteContainer'>
        <div className='col p-0'>
          <h3 id="saludo" className='headerTusNotas ml-0'>
            <i className="icon me-2 icono_tusNotas bi bi-gear-fill" alt="Icono" /> Gestiona tus perfiles
          </h3>
          <h4 className='infoCuenta'>Gestiona tus perfiles</h4>
          <div className='abajoDeTusNotas'>
            En esta sección podrás gestionar la creación, eliminación y edición de todos los perfiles de la plataforma.
          </div>
        </div>
      </div>
      
      {/* Búsqueda */}
      <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-3'>
        <div className='col buscadorNotas'> 
          {permisoAlta && (
            <button className="mb-2 btn btn-primary" onClick={() => handleEditClick(perfilVacio)}>Crear nuevo perfil</button>
          )}
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
                        className="btn btn-link text-primary p-0"
                        onClick={() => handleEditClick(item)}
                        disabled={!permisoEdicion}
                      >
                        <strong>{item.nombre}</strong>
                      </button>
                    </div>
                    <div className='col-10 text-end'>
                      <span className="text-muted">Descripción: {item.descripcion  || item.nombre}</span>
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

      {/* Modal Edición / Creación */}
      <div className="modal fade" id="editModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {formData.id !== '0' ? "Editar Perfil" : "Nuevo Perfil"}
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

                  {/* Descripcion */}
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.descripcion || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, descripcion: e.target.value })
                      }
                    />
                  </div>


                  {/* Páginas del perfil */}
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
                              className="btn-close ms-2"
                              aria-label="Eliminar"
                              onClick={() => {handleEliminarPaginaDelPerfil(formData.id, c.id)}}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                    )}

                  {/* Páginas disponibles para agregar */}
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

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary ms-2"
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
              
              {formData.id !== '0' && (
                <button
                  type="button"
                  className="btn btn-danger"
                  data-bs-dismiss="modal"
                  onClick={() => eliminarPerfil(formData.id)}
                >
                  Eliminar
                </button>
              )}

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!formData.nombre || guardando}
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

    </div>
  );
};

export default PerfilesAdmin;