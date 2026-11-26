import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { obtenerPerfiles, crearPerfil, editarPerfil, eliminarPerfilPorId, sincronizarPaginasPerfil } from '@/api/perfilesApi.js';
import { obtenerPaginas } from '@/api/paginasApi.js';
import SelectorPaginasPerfil from './SelectorPaginasPerfil';
import './PerfilesAdmin.css';
import { ToastContainer } from 'react-toastify';
import { toastExito, toastError } from '@/shared/utils/toastify/toastify.jsx';
import 'react-toastify/dist/ReactToastify.css';

const perfilVacio = {
  nombre: "",
  descripcion: "",  
  id: "0",
};

const PerfilesAdmin = () => {
  const [paginasTodas, setPaginasTodas] = useState([]);
  // Páginas del perfil abierto: lo que se ve marcado (seleccionadas) y lo que estaba guardado
  // (seleccionOriginal). Solo se mandan a la API al tocar Guardar, en un único PUT.
  const [seleccionadas, setSeleccionadas] = useState(new Set());
  const [seleccionOriginal, setSeleccionOriginal] = useState(new Set());
  const [cargandoPaginas, setCargandoPaginas] = useState(false);
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

  // Abrir modal con datos: trae las páginas que ya tiene el perfil y las deja marcadas
  const handleEditClick = (perfil) => {
    setSelectedPerfil(perfil);
    setFormData({ ...perfil });
    setSeleccionadas(new Set());
    setSeleccionOriginal(new Set());

    if (perfil.id !== '0') {
      setCargandoPaginas(true);
      obtenerPaginas(TOKEN, perfil.id)
        .then((data) => {
          const ids = new Set((data || []).map((pagina) => pagina.id));
          setSeleccionadas(ids);
          setSeleccionOriginal(new Set(ids));
        })
        .catch((error) => {
          console.error('Error al obtener las páginas del perfil:', error);
          toastError('No se pudieron cargar las páginas del perfil.');
        })
        .finally(() => setCargandoPaginas(false));
    }

    const modal = new window.bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
  };

  // Cuántas páginas cambiaron respecto de lo guardado (agregadas + quitadas)
  const cambiosPaginas = useMemo(() => {
    let cambios = 0;
    seleccionadas.forEach((id) => { if (!seleccionOriginal.has(id)) cambios += 1; });
    seleccionOriginal.forEach((id) => { if (!seleccionadas.has(id)) cambios += 1; });
    return cambios;
  }, [seleccionadas, seleccionOriginal]);

  const cerrarModal = () => {
    const modalEl = document.getElementById('editModal');
    const modal = window.bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  };

  // Guardar o Crear Perfil: datos del perfil (POST/PATCH) + páginas en un solo PUT
  const handleSave = async () => {
    setGuardando(true);
    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        plataforma: formData.plataforma || null,
      };

      const esNuevo = formData.id === "0";
      let idPerfil = formData.id;
      if (esNuevo) {
        const creado = await crearPerfil(TOKEN, payload);
        idPerfil = creado?.id ?? creado?.perfil?.id;
      } else {
        await editarPerfil(TOKEN, formData.id, payload);
      }

      const hayQueSincronizar = esNuevo ? seleccionadas.size > 0 : cambiosPaginas > 0;
      if (hayQueSincronizar) {
        if (!idPerfil) throw new Error('La API no devolvió el id del perfil creado');
        await sincronizarPaginasPerfil(TOKEN, idPerfil, [...seleccionadas]);
        setSeleccionOriginal(new Set(seleccionadas));
      }

      toastExito(esNuevo ? '¡El perfil fue creado exitosamente!' : '¡Los cambios se guardaron correctamente!');
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

  return (
    <div className="content flex-grow-1 crearNotaGlobal perfilesAdmin">
      <div className='row miPerfilContainer soporteContainer'>
        <div className='col p-0'>
          <h3 id="saludo" className='headerTusNotas ml-0'>
            <i className="bi bi-gear-fill" aria-hidden="true" /> ABM Perfiles
          </h3>
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
              placeholder="Buscar perfiles por nombre"
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
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
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


                  {/* Páginas del perfil: se marcan/desmarcan y se guardan todas juntas */}
                  <div className="mb-1">
                    <div className="perfilesAdmin__paginas-cabecera">
                      <span className="form-label m-0">Páginas del perfil</span>
                      <span className="perfilesAdmin__paginas-resumen">
                        {seleccionadas.size} seleccionadas
                        {cambiosPaginas > 0 && (
                          <span className="nd-badge nd-badge--primary">{cambiosPaginas} sin guardar</span>
                        )}
                      </span>
                    </div>
                    <SelectorPaginasPerfil
                      paginas={paginasTodas}
                      seleccionadas={seleccionadas}
                      onChange={setSeleccionadas}
                      cargando={cargandoPaginas}
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