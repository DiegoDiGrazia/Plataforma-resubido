import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import axios from 'axios';
import ModalMensaje from '../gestores/ModalMensaje';
import { obtenerUsuarios, obtenerClientes, obtenerPerfiles, obtenerGeo, obtenerPlanesMarketing } from './apisUsuarios'; // Importa la función para obtener usuarios
import ArbolDistribucion from '../../nota/Editorial/ArbolDistribucion';

const tiposUsuario = [
  {'id': "1", 'nombre': "ENTE"},
  {'id': "2", 'nombre': "EMPRESA"},
  {'id': "3", 'nombre': "CAMPAÑA"},
  {'id': "4", 'nombre': "AGENCIA"},
  {'id': "5", 'nombre': "GESTION"},
];

const tipoJurisdiccion = [
  {'id': "1", 'nombre': "MUNICIPIO"},
  {'id': "2", 'nombre': "PROVINCIA"},
  {'id': "3", 'nombre': "PAIS"}
];

const clienteVacio = {
  id: "0",
  name: "",
  slug: "",
  code: "",
  population_connected: "",
  population_shown: "",
  authors: "",
  fecha_alta: "",
  id_plan: "",
  jurisdiccion: "",
  muestra_consumo: "0",
  municipio_id: "",
  pais_id: "",
  provincia_id: "",
  term_id: "",
  tipo: ""
};

const AbmClientes
 = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [geo, setGeo] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mensajeModalExito, setMensajeModalExito] = useState("Los cambios se realizaron correctamente.");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState(null);
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
    return clientes.filter((item) =>  //-- Cambia esto a usuarios cuando tengas la API
      item.name.toLowerCase().includes(search.toLowerCase()) 
    );
  }, [search, clientes]);

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

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setFormData({ 
        ...client,
        tipo_cliente: client.tipo 
    }); 
    const modal = new window.bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
};

const handleSave = () => {
  axios
    .post(
      "https://panel.serviciosd.com/app_cliente_edit",
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
            <img src="/images/auto_entrevistas_icon.png" alt="Icono 1" className="icon me-2 icono_tusNotas" /> Gestiona tus clientes
          </h3>
          <h4 className='infoCuenta'>Gestiona tus clientes</h4>
          <div className='abajoDeTusNotas'>
            En esta seccion podras gestionar la creacion, eliminacion y edicion <br />
            de todos los clientes de la plataforma.
          </div>
        </div>
      </div>
      {/* Búsqueda */}
      <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-3'>
        <div className='col buscadorNotas'> 
          <button className="mb-2 btn btn-primary" onClick={() => handleEditClick(clienteVacio)}>Crear nuevo usuario</button>
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
                        <strong>{item.name}</strong>
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
                {selectedClient ? "Editar Cliente" : "Nuevo Cliente"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {selectedClient && (
                <>
                  {/* Nombre */}
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  {/* TIPO */}
                  <div className="mb-3">
                    <label className="form-label">TIPO</label>
                    <div className="dropdown">
                      <button
                        className="btn btn-secondary dropdown-toggle w-100 text-start"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                      {formData.tipo || "Seleccionar tipo"}
                      </button>
                      <ul className="dropdown-menu w-100">
                        {tiposUsuario.map((tipo) => (
                        <li id={tipo.id} key={tipo.id}>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                tipo: tipo.nombre,
                                tipo_cliente: tipo.nombre
                              })
                            }
                          >
                            {tipo.nombre}
                          </button>
                        </li>
                        ))}
                      </ul>
                    </div>
                    
                  </div>

                  {/* JURISDICCION */}
                  {formData.tipo == 'GESTION' && 
                  <div className="mb-3">
                    <label className="form-label">Jurisdiccion</label>
                    <div className="dropdown">
                      <button
                        className="btn btn-secondary dropdown-toggle w-100 text-start"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                      {formData.juridisccion || "Seleccionar tipo"}
                      </button>
                      <ul className="dropdown-menu w-100">
                        {tipoJurisdiccion.map((tipoJurisdiccion) => (
                        <li id={tipoJurisdiccion.id} key={tipoJurisdiccion.id}>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() =>
                              setFormData({ ...formData, juridisccion: tipoJurisdiccion.nombre })
                            }
                          >
                            {tipoJurisdiccion.nombre}
                          </button>
                        </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  }
                  {/* localizacion */}
                  <ArbolDistribucion
                    jurisdiccion = {formData.juridisccion || 'NINGUNA'}
                    esGestion = {formData.tipo === 'GESTION' || false}
                    TOKEN={TOKEN}
                    pais={formData.pais_cliente || ""}
                    provincia={formData.provincia_cliente || ""}
                    municipio={formData.municipio_cliente || ""}
                    onSetPais={(e) =>setFormData({ ...formData, pais_cliente: e.target.value })}
                    onSetProvincia={(e) =>setFormData({ ...formData, provincia_cliente: e.target.value })}
                    onSetMunicipio={(e) =>setFormData({ ...formData, municipio_cliente: e.target.value })}
                  />

                  {/* authors */}
                  <div className="mb-3">
                    <label className="form-label">Autor</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.authors || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, authors: e.target.value })
                      }
                    />
                  </div>

                  {/* Administra consumo */}
                  <div className="mb-3">
                    <label className="form-label">Administra consumo</label>
                    <div className="dropdown">
                      <button
                        className="btn btn-secondary dropdown-toggle w-100 text-start"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {formData.muestra_consumo == '0' ? "No" : "Si"}
                      </button>
                      <ul className="dropdown-menu w-100">
                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() =>
                              setFormData({ ...formData, muestra_consumo: "0" })
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
                              setFormData({ ...formData, muestra_consumo: "1" })
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
              {/* plan */}
                  <div className="mb-3">
                    <label className="form-label">Plan</label>
                    <div className="dropdown">
                      <button
                        className="btn btn-secondary dropdown-toggle w-100 text-start"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                      {planes && planes.find((plan =>formData.id_plan == plan.id ))?.nombre || "Seleccionar plan"}
                      </button>
                      <ul className="dropdown-menu w-100">
                        {planes.map((plan) => (
                        <li id={plan.id} key={plan.id}>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() =>
                              setFormData({ ...formData, id_plan: plan.id })
                            }
                          >
                            {plan.nombre}
                          </button>
                        </li>
                        ))}
                      </ul>
                    </div>
                    
                  </div>
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
                disabled={!formData.name}
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

export default AbmClientes
;