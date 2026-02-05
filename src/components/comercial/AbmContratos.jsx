import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import axios from 'axios';
import ModalMensaje from '../administrador/gestores/ModalMensaje';
import { obtenerUsuarios, obtenerClientes, obtenerContratos, obtenerGeo, obtenerPlanesMarketing, obtenerComisionistas } from '../administrador/gestores/apisUsuarios'; // Importa la función para obtener usuarios
import ArbolDistribucion from '../nota/Editorial/ArbolDistribucion';
import '../administrador/gestores/AbmsMobile.css';
import DropdawnSiNo from './DropdawnSiNo'
import { obtenerMesActual } from '../administrador/gestores/Distribucion';
import SelectorConBuscador from '../nota/Editorial/SelectorConBuscador';
import InputFecha from '../nota/Editorial/InputFecha';
import InputNumerico from '../nota/Editorial/InputNumerico';

const Modalidades = [
  {'id': "1", 'nombre': "Facturación mensual", 'unica_factura': "NO", 'bonificado': "NO", 'abierto': "NO"},
  {'id': "2", 'nombre': "Unica factura", 'unica_factura': "SI", 'bonificado': "NO", 'abierto': "NO"},
  {'id': "3", 'nombre': "Bonificado", 'unica_factura': "NO", 'bonificado': "SI", 'abierto': "NO"},
  {'id': "4", 'nombre': "Facturacion abierta", 'unica_factura': "NO", 'bonificado': "NO", 'abierto': "SI"},
];

const Emisor = [
  {'id': "1", 'nombre': "ADLATAM SA"},
  {'id': "2", 'nombre': "GUIAD SA"},
];

const contratoVacio = {
  id: "0",
  id_cliente: "",
  id_usuario: null,
  id_pais: null,
  id_provincia: null,
  id_municipio: null,

  nombre: "",
  empresa: "GUIAD SA",
  razon_social: "test",
  tipo: "",
  cuit: "1234",

  fecha_inicio: '',
  fecha_fin: '',
  duracion: "1",

  estado: "Activa",
  activo: "1",
  abierto: "NO",
  en_pausa: "No",
  avance: "Aprobado",

  monto: "0",
  monto_formato: "0,00",
  monto_mensual: "0,00",
  margen: "0",

  notas_x_mes: "0",
  alcance_x_nota: "0",

  porcentaje_comision: "0",
  porcentaje_comision2: "0",
  comision: "0",
  comision2: "0",

  comisionista1: "",
  comisionista2: "",
  com1: "",
  com2: "",

  con_meta: "",
  con_search: "",
  con_dv360: "",
  con_orden: "",

  orden_compra: "",

  bonificado: "NO",
  requiere_pago: "NO",
  unica_factura: "NO",
  lleva_certificacion: "NO",

  facturado: "1",
  facturas: "0",
  facturas_con_numero: "0",
  tiene_facturas: "0",
  tiene_facturas_con_numero: "0",
  donde: "",
  comentarios: "",
};

const AbmContratos
 = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [contratos, setContratos] = useState([]);
    const [geo, setGeo] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [mensajeModalExito, setMensajeModalExito] = useState("Los cambios se realizaron correctamente.");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
    const [formData, setFormData] = useState({});
    const itemsPerPage = 10;  
    const desdeMarketing = new Date().toISOString().split('T')[0];
    const TOKEN = useSelector((state) => state.formulario.token);
    const [pendientes, setPendientes] = useState('GAM o Meta');
    const [fechaDesde, setFechaDesde] = useState(obtenerMesActual());
    const [fechaHasta, setFechaHasta] = useState(obtenerMesActual());
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [ModalidadSeleccionada, setModalidadSeleccionada] = useState(null);
    const [EmisorSeleccionado, setEmisorSeleccionado] = useState(null);
    const [comisionistas, setComisionistas] = useState([]);
    const [comisionistasSeleccionados, setComisionistasSeleccionados] = useState([]);

    const seleccionarComisionista = (option) => {
      setComisionistasSeleccionados(prev => {
        if (prev.length >= 2) return prev;
        if (prev.some(c => c.id === option.id)) return prev;

        const nuevo = [...prev, option];

        if (nuevo.length === 1) {
          setFormData(fd => ({
            ...fd,
            comisionista1: option.nombre,
            com1: fd.com1 || '0',
          }));
        }

        if (nuevo.length === 2) {
          setFormData(fd => ({
            ...fd,
            comisionista2: option.nombre,
            com2: fd.com2 || '0',
          }));
        }

        return nuevo;
      });
    };

    const eliminarComisionista = (id) => {
      setComisionistasSeleccionados(prev => {
        const nuevos = prev.filter(c => c.id !== id);

        if (nuevos.length === 0) {
          setFormData(fd => ({
            ...fd,
            comisionista1: '',
            comisionista2: '',
            com1: '',
            com2: '',
          }));
        }

        if (nuevos.length === 1) {
          setFormData(fd => ({
            ...fd,
            comisionista1: nuevos[0].nombre,
            com1: fd.com1 || fd.com2 || '',
            comisionista2: '',
            com2: '',
          }));
        }

        return nuevos;
      });
    };
    const actualizarPorcentajeComisionista = (posicion, value) => {
      if (posicion === 1) {
        setFormData(fd => ({ ...fd, com1: value }));
      }
      if (posicion === 2) {
        setFormData(fd => ({ ...fd, com2: value }));
      }
    };    

  useEffect(() => {
    obtenerUsuarios(TOKEN).then(setUsuarios);
    obtenerClientes(TOKEN).then(setClientes);
    obtenerPlanesMarketing(TOKEN, desdeMarketing, desdeMarketing).then(setPlanes);
    obtenerGeo().then(setGeo);
    obtenerContratos(TOKEN).then(setContratos);
    obtenerComisionistas(TOKEN).then(setComisionistas);
  }, [TOKEN]);  

  // Filtrar por búsqueda
  const contratosFiltrados = useMemo(() => {
  if (!fechaDesde || !fechaHasta) return contratos;

  const desde = new Date(fechaDesde);
  const hasta = new Date(fechaHasta);

  return contratos.filter((item) => {
    const inicioContrato = new Date(item.fecha_inicio);
    const finContrato = new Date(item.fecha_fin);

    const cumpleBusqueda =
      item.name.toLowerCase().includes(search.toLowerCase());

    const cumpleFecha =
      inicioContrato <= hasta && finContrato >= desde;

    return cumpleBusqueda && cumpleFecha;
  });
}, [search, contratos, fechaDesde, fechaHasta]);

  const contratosDelClienteSeleccionado = useMemo(() => {
    if (!clienteSeleccionado) return null;
    return contratos.filter(c => c.id_cliente === clienteSeleccionado.id) || null;
  }, [clienteSeleccionado]);

  const totalPages = Math.ceil(contratosFiltrados.length / itemsPerPage);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return contratosFiltrados.slice(start, start + itemsPerPage);
  }, [contratosFiltrados, page]);

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    console.log('formData updated:', formData);
    console.log(comisionistasSeleccionados);
  }
, [formData, comisionistasSeleccionados]);

  const handleEditClick = (contrato) => {
    console.log(contrato);
    setContratoSeleccionado(contrato);
    setFormData(contrato);
    const emisorObj = Emisor.find(
      e => e.nombre === contrato.empresa
    );
    setEmisorSeleccionado(emisorObj || null);
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
            <img src="/images/auto_entrevistas_icon.png" alt="Icono 1" 
            className="icon me-2 icono_tusNotas" /> Gestiona tus Contratos
          </h3>
          <h4 className='infoCuenta'>Gestiona tus Contratos</h4>
          <div className='abajoDeTusNotas'>
            En esta seccion podras gestionar la creacion, eliminacion y edicion <br />
            de todos los contratos de la plataforma.
          </div>
        </div>
      </div>
      {/* Búsqueda */}
      <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-3'>
        <div className='col buscadorNotas'>
             
          <button className="mb-2 btn btn-primary" onClick={() => handleEditClick(contratoVacio)}>Crear nuevo contrato</button>
          <span style={{ fontSize: "14px"}}>Vencimiendo desde:
          <input 
              type="month" 
              value={fechaDesde} 
              onChange={(e) => setFechaDesde(e.target.value)} 
              style={{ fontSize: "14px", border: "1px solid #ccc", borderRadius: "4px", padding: "2px 5px"}}
          />
          </span>
          <span style={{ fontSize: "14px"}}>Vencimiento hasta:
            <input 
                type="month" 
                value={fechaHasta} 
                onChange={(e) => setFechaHasta(e.target.value)} 
                style={{ fontSize: "14px", border: "1px solid #ccc", borderRadius: "4px", padding: "2px 5px"}}
            />
          </span>
          <div className="dropdown">
            <a className="btn btn-secondary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              {pendientes}
            </a>
            <ul className="dropdown-menu">
              <li><button className="dropdown-item" onClick={() => setPendientes('Todos los casos')} >Todos los casos</button></li>
              <li><button className="dropdown-item" onClick={() => setPendientes('solo en Meta')} >solo en Meta</button></li>
              <li><button className="dropdown-item" onClick={() => setPendientes('solo en GAM')} >solo en GAM</button></li>
              <li><button className="dropdown-item" onClick={() => setPendientes('GAM o Meta')} >GAM o Meta</button></li>
            </ul>
          </div>
          <form className='buscadorNotasForm'>
            <input
              className = 'inputBuscadorNotas'
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="       Buscar contratos por nombre"
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
                      <div>inicio: {item.fecha_inicio}</div>
                      <div>fin: {item.fecha_fin}</div   >
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
                {contratoSeleccionado?.id === '0' ? "Nuevo contrato" : "Editar contrato"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {contratoSeleccionado && (
                <>
                {/* cliente */}
                  <SelectorConBuscador
                    title="Cliente"
                    options={clientes}
                    selectedOption={clienteSeleccionado}
                    onSelect={setClienteSeleccionado}
                    onClear={() => setClienteSeleccionado(null)} 
                    />
                  {clienteSeleccionado && (
                  <div className="mb-3">
                    <label className="form-label">Contratos del cliente: {clienteSeleccionado.name}</label>
                    <ul>
                      {contratosDelClienteSeleccionado.map((contrato) => (
                        <li key={contrato.id}>
                          id: {contrato.id} - monto: {contrato.monto} - {contrato.fecha_inicio} a {contrato.fecha_fin}
                        </li>
                      ))}
                    </ul>
                  </div>
                  )}

                  <SelectorConBuscador
                    title="Modalidad"
                    options={Modalidades}
                    selectedOption={ModalidadSeleccionada}
                    onSelect={(option) => {
                      setModalidadSeleccionada(option);
                      setFormData(prev => ({
                        ...prev,
                        bonificado: option.bonificado,
                        unica_factura: option.unica_factura,
                        abierto: option.abierto,
                      }));
                    }}
                    onClear={() => {
                      setModalidadSeleccionada(null);
                      setFormData(prev => ({
                        ...prev,
                        bonificado: "NO",
                        unica_factura: "NO",
                        abierto: "NO",
                      }));
                    }}
                  />
                  <InputFecha
                    label="Fecha inicio:"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  />
                  <InputFecha
                    label="Fecha fin:"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  />
                  <SelectorConBuscador 
                    title="Emisor"
                    options={Emisor}
                    selectedOption={EmisorSeleccionado}
                    onSelect={(option) => {
                      setEmisorSeleccionado(option);
                      setFormData(prev => ({
                        ...prev,
                        empresa: option.nombre
                      }));
                    }}
                    onClear={() => {
                      setEmisorSeleccionado(null);
                      setFormData(prev => ({
                        ...prev,
                        empresa: ''
                      }));
                    }} 
                  />

                  {/* Razon social */}
                  <div className="mb-3">
                    <label className="form-label">Razon social</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.razon_social || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, razon_social: e.target.value })
                      }
                    />
                  </div>
                  {/* Cuit */}
                  <div className="mb-3">
                    <label className="form-label">Cuit</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.cuit || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, cuit: e.target.value })
                      }
                    />
                  </div>
                  {/* correo */}
                  <div className="mb-3">
                    <label className="form-label">Correo a donde enviar la factura</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.donde || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, donde: e.target.value })
                      }
                    />
                  </div>
                    {}
                {/* Margen */}
                  <div className="mb-3">
                  <InputNumerico
                    title="Margen agencia"
                    selectedValue={formData.margen || '0'}
                    isPercentual ={true}
                    min={0}
                    max={99.9}
                    onSelect={(value) => setFormData({ ...formData, margen: value })}
                    onClear={() => setFormData({ ...formData, margen: '0' })}
                    isDecimal={true}
                  />
                  </div>  

                  {/* Comision */}
                  <div className="mb-3">
                  <InputNumerico
                    title="Comision"
                    selectedValue={Number(formData.com1) + Number(formData.com2)}
                    isPercentual ={true}
                    min={0}
                    max={99.9}
                    isDecimal={true}
                  />
                  <InputNumerico
                    title="Monto ($)"
                    selectedValue={formData.monto || '0'}
                    isPercentual ={false}
                    onSelect={(value) => setFormData({ ...formData, monto  : value })}
                    onClear={() => setFormData({ ...formData, monto: '0' })}
                    isDecimal={true}
                    max={999999999999}
                  />
                  </div> 
                  <SelectorConBuscador
                    title="Comisionistas (Max 2)"
                    options={comisionistas}
                    selectedOption={''}
                    onSelect={(option) => { seleccionarComisionista(option)}}
                  />
                  {comisionistasSeleccionados && (
                  <div className="mb-3">
                    <ul>
                      {comisionistasSeleccionados.map((comisionista, index) => {
                        const posicion = index + 1; // 1 o 2

                        return (
                          <li
                            key={comisionista.id}
                            style={{ display: 'flex', alignItems: 'start', gap: '7px' }}
                          >
                            <span style={{ marginTop: '8px', fontSize: '16px' }}>
                              {comisionista.nombre}
                            </span>

                            <span style={{ width: '90px' }}>
                              <InputNumerico
                                title=""
                                selectedValue={formData[`com${posicion}`] || '0'}
                                isPercentual={true}
                                min={0}
                                max={100}
                                onSelect={(value) =>
                                  actualizarPorcentajeComisionista(posicion, value)
                                }
                              />
                            </span>

                            <button
                              type="button"
                              onClick={() => eliminarComisionista(comisionista.id)}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: 'red',
                                fontWeight: 'bold',
                                marginTop: '8px',
                              }}
                            >
                              ✕
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  )}
                    
                  
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

export default AbmContratos;