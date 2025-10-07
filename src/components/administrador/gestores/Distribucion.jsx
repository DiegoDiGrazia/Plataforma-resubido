import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import axios from 'axios';
import ModalMensaje from '../gestores/ModalMensaje';
import { obtenerUsuarios, obtenerClientes, obtenerPerfiles, obtenerGeo, obtenerNotasDeGeneraciones } from './apisUsuarios'; // Importa la función para obtener usuarios

const usuarioVacio = {
  celular_reporte: "",
  clave: "",
  cliente: "",
  email: "",
  email_reporte: "",
  id: "0",
  nombre: "",
  term_id: "",
  tipo: "1",
  id_cliente: '',
  reporte_acceso: "0",
  reporte_whatsapp: "0",
  reporte_email: "0",
  id_pais: null,
};

function generarPassword(longitud = 8) {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < longitud; i++) {
    const indice = Math.floor(Math.random() * caracteres.length);
    password += caracteres[indice];
  }
  return password;
}


const DistribucionAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [notasGeneraciones, setNotasGeneraciones] = useState([]);
  const [geo, setGeo] = useState([]);
  const [llevaCliente, setLlevaCliente] = useState(false);
  const [limitadoAJurisdiccion, setLimitadoAJurisdiccion] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mensajeModalExito, setMensajeModalExito] = useState("Los cambios se realizaron correctamente.");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  const itemsPerPage = 10;  
  const TOKEN = useSelector((state) => state.formulario.token);

  // Cargar usuarios
  useEffect(() => {
    obtenerUsuarios(TOKEN).then(setUsuarios);
    obtenerClientes(TOKEN).then(setClientes);
    obtenerNotasDeGeneraciones(TOKEN).then(setNotasGeneraciones);
}, [TOKEN]);

  // Filtrar por búsqueda
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((item) =>  //-- Cambia esto a usuarios cuando tengas la API
      item.nombre.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, usuarios]);

  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredUsuarios.slice(start, start + itemsPerPage);
  }, [filteredUsuarios, page]);

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  // Abrir modal con datos
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({ ...user,reporte_acceso: '0', tipo: user?.tipo_usuario || `1` } ); // copia datos
    console.log(geo)
    if(user?.cliente){
      setLlevaCliente(true)
    }
    if (user?.id_pais) {
      const paisNombre = geo.paises.find(g => g.pais_id === user.id_pais)?.nombre || '';
      setFormData(prev => ({
        ...prev,
        id_pais: user.id_pais,
        pais: paisNombre,
      }));
      setLimitadoAJurisdiccion(true);
      console.log(paisNombre, "pais");
    }
    const modal = new window.bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
  };

const handleSave = () => {
  axios
    .post(
      "https://panel.serviciosd.com/app_usuario_edit",
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

const eliminarUsuario = (id) => {
  axios
    .post(
      "https://panel.serviciosd.com/app_usuario_eliminar",
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

const generarContrasenia= (id, contrasenia) => {
  axios
    .post(
      "https://panel.serviciosd.com/app_modificar_clave_usuario",
      {
        token: TOKEN,
        id_usuario: id,
        clave: contrasenia,
      },
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
      .then(() => {
        setMensajeModalExito('La nueva contraseña es: '+contrasenia);
        setShowModal(true); // mostrar modal
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
             Gestiona tu contenido
          </h3>
          <h4 className='infoCuenta'>Distribucion</h4>
          <div className='abajoDeTusNotas'>
            En esta seccion podras gestionar la creacion, eliminacion y edicion <br />
            de todos los usuarios de la plataforma.
          </div>
        </div>
      </div>
      {/* Búsqueda */}
      <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-3'>
        <div className='col buscadorNotas'> 
          <button className="mb-2 btn btn-primary" onClick={() => handleEditClick(usuarioVacio)}>Crear nuevo usuario</button>
          <form className='buscadorNotasForm'>
            <input
              className='inputBuscadorNotas'
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="       Buscar clientes"
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
                      <div className='row pt-0'>
                        <button
                          className="btn btn-link p-0 text-start"
                          onClick={() => handleEditClick(item)}
                        >
                          <strong>{'Nombre del cliente'}</strong>
                        </button>
                      </div>
                      <div className='row p-1'>
                        <span> distribuibles: xxx</span>
                      </div>
                      <div className='row p-1'>
                        <span> Por publicar: xxx</span>

                      </div>
                    </div>
                    <div className='col-3'>
                      <div className='row pt-0'>
                          <strong>{'Meta'}</strong>
                      </div>
                      <div className='row p-1'>
                        <span> distribuibles: xxx</span>
                      </div>
                      <div className='row p-1'>
                        <span> Por publicar: xxx</span>

                      </div>
                    </div>
                    <div className='col-3'>
                      <div className='row pt-0'>
                          <strong>{'DV 360'}</strong>
                      </div>
                      <div className='row p-1'>
                        <span> distribuibles: xxx</span>
                      </div>
                      <div className='row p-1'>
                        <span> Por publicar: xxx</span>

                      </div>
                    </div>
                    <div className='col-3'>
                      <div className='row pt-0'>
                          <strong>{'Meta'}</strong>
                      </div>
                      <div className='row p-1'>
                        <span> Por publicar: xxx</span>
                      </div>
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
                {selectedUser ? "Editar Usuario" : "Nuevo Usuario"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {selectedUser && (
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
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  {/* Email Reporte */}
                  <div className="mb-3">
                    <label className="form-label">Email para envio de reporte(Opcional)</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email_reporte || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email_reporte: e.target.value })
                      }
                    />
                  </div>

                  {/* Email Reporte */}
                  <div className="mb-3">
                    <label className="form-label">Numero de celular(opcional)</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.celular_reporte || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, celular_reporte: e.target.value })
                      }
                    />
                  </div>


                  {/* ver si lleva cliente */}
                  <div className="mb-3">
                    <label className="form-label">Acceso</label>
                    <div className="dropdown">
                      <button
                        className="btn btn-secondary dropdown-toggle w-100 text-start"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                      {llevaCliente ? "Limitado a cientes" : "Acceso a todos los clientes"}
                      </button>
                      <ul className="dropdown-menu w-100">
                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() =>
                              setLlevaCliente(true)
                            }
                          >
                            Limitado a cientes
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() => {
                              setLlevaCliente(false);
                              setFormData({
                                ...formData,
                                id_cliente: '',
                                cliente: '',
                              });
                            }}
                            
                          >
                            Acceso a todos los clientes
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  


                  {/* Cliente (dropdown) */}
                  {llevaCliente && (
                  <div className="mb-3">
                    <label className="form-label">Cliente</label>
                    <div className="dropdown">
                      <button
                        className="btn btn-secondary dropdown-toggle w-100 text-start"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {formData.cliente
                          ? formData.cliente
                          : "Seleccionar cliente..."}
                        </button>

                      <ul className="dropdown-menu w-100">
                        {clientes.map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              className="dropdown-item"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  id_cliente: c.id,
                                  cliente: c.name,
                                });
                              }}
                            >
                              {c.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  )}

                  {/* jurisdiccion */}
                  <div className="mb-3">
                    <label className="form-label">Limitado a jurisdiccion</label>
                    <div className="dropdown">
                      <button
                        className="btn btn-secondary dropdown-toggle w-100 text-start"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                      {limitadoAJurisdiccion ? "Limitado a jurisdiccion" : "Acceso a todas las jurisdicciones"}
                      </button>
                      <ul className="dropdown-menu w-100">
                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() =>
                              setLimitadoAJurisdiccion(true)
                            }
                          >
                            Limitado a jurisdiccion
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() => {
                              setLimitadoAJurisdiccion(false);
                              setFormData({
                                ...formData,
                                id_pais: null,
                              });
                            }}
                            
                          >
                            Acceso a todos las jurisdicciones
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* pais (dropdown) */}
                  {limitadoAJurisdiccion && (
                  <div className="mb-3">
                    <label className="form-label">Pais</label>
                    <div className="dropdown">
                      <button
                        className="btn btn-secondary dropdown-toggle w-100 text-start"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {formData.pais
                          ? formData.pais
                          : "Seleccionar pais..."}
                        </button>

                      <ul className="dropdown-menu w-100">
                        {geo.paises.map((pais) => (
                          <li key={pais.pais_id}>
                            <button
                              type="button"
                              className="dropdown-item"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  id_pais: pais.pais_id,
                                  pais: pais.nombre,
                                });
                              }}
                            >
                              {pais.nombre}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  )}

                  {/* Perfil (dropdown) */}
                  <div className="mb-3">
                    <label className="form-label">Perfil</label>
                    <div className="dropdown">
                      <button
                        className="btn btn-secondary dropdown-toggle w-100 text-start"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {formData.tipo
                          ? (perfiles.find((p) => p.id == formData.tipo)).nombre
                          : "Seleccionar cliente..."}
                        </button>

                      <ul className="dropdown-menu w-100">
                        {perfiles.map((p) => (
                          <li key={p.id}>
                            <button
                              type="button"
                              className="dropdown-item"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  tipo: p.id,
                                });
                              }}
                            >
                              {p.nombre}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* reportes automaticos email */}
                  <div className="mb-3">
                    <label className="form-label">Recibir reportes automaticos email</label>
                    <div className="dropdown">
                      <button
                        className="btn btn-secondary dropdown-toggle w-100 text-start"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {formData.reporte_acceso == '0' ? "No" : "Si"}
                      </button>
                      <ul className="dropdown-menu w-100">
                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() =>
                              setFormData({ ...formData, reporte_acceso: "0" })
                            }
                          >
                            No
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() =>
                              setFormData({ ...formData, reporte_acceso: "1" })
                            }
                          >
                            Si
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* reportes automaticos wsp */}
                  <div className="mb-3">
                    <label className="form-label">Recibir reportes celular</label>
                    <div className="dropdown">
                      <button
                        className="btn btn-secondary dropdown-toggle w-100 text-start"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {formData.reporte_whatsapp == '0' ? "No" : "Si"}
                      </button>
                      <ul className="dropdown-menu w-100">
                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() =>
                              setFormData({ ...formData, reporte_whatsapp: "0" })
                            }
                          >
                            No
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() =>
                              setFormData({ ...formData, reporte_whatsapp: "1" })
                            }
                          >
                            Si
                          </button>
                        </li>
                      </ul>
                    </div>
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
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => eliminarUsuario(formData.id)}
                disabled={formData.id == '0'}

              >
                Eliminar
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => generarContrasenia(formData.id, generarPassword(8))}
                disabled={formData.id == '0'}

              >
                Generar clave
              </button>


              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSave()}
                disabled={!formData.email || !formData.nombre}
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

export default DistribucionAdmin;