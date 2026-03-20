import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import axios from 'axios';
import ModalMensaje from '../administrador/gestores/ModalMensaje';
import { obtenerUsuarios, obtenerClientes, obtenerContratos, obtenerGeo, obtenerPlanesMarketing, obtenerComisionistas, guardarArchivoDeUnContrato } from '../administrador/gestores/apisUsuarios'; // Importa la función para obtener usuarios
import '../administrador/gestores/AbmsMobile.css';
import DropdawnSiNo from './DropdawnSiNo'
import SelectorConBuscador from '../nota/Editorial/SelectorConBuscador';
import InputFecha from '../nota/Editorial/InputFecha';
import InputNumerico from '../nota/Editorial/InputNumerico';
import Checkbox from '../nota/Editorial/checkbox';
import FileInput from '../nota/Editorial/FileInput';
import ModalConListado from '../administrador/gestores/ModalConListado';
import { obtenerArchivosDelContrato, obtenerComentariosDelContrato } from '../administrador/gestores/apisUsuarios';
import ModalConInputTexto from '../administrador/gestores/ModalConInputTexto';
import { guardarComentarioDeUnContrato } from '../administrador/gestores/apisUsuarios';
import ModalConInputFile from '../administrador/gestores/ModalConInputFile';
import { descargarExcel } from '../funciones/creacionCSV';

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
export const formatearARS = (valor) => {
  return Number(valor || 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const primerMesDelAnio = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  return `${anio}-01`;
};

export const ultimoMesDelAnio = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  return `${anio}-12`;
};


const contratoVacio = {
  id: "0",
  id_cliente: "",
  id_usuario: '',
  id_pais: '1',
  id_provincia: '1',
  id_municipio: '1',

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

  con_meta: "NO",
  con_search: "NO",
  con_dv360: "NO",
  con_youtube: "NO",
  con_orden: "SI",

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
  id_plan: "",
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
    const [fechaDesde, setFechaDesde] = useState(primerMesDelAnio());
    const [fechaHasta, setFechaHasta] = useState(ultimoMesDelAnio());
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [ModalidadSeleccionada, setModalidadSeleccionada] = useState(null);
    const [EmisorSeleccionado, setEmisorSeleccionado] = useState(null);
    const [comisionistas, setComisionistas] = useState([]);
    const [comisionistasSeleccionados, setComisionistasSeleccionados] = useState([]);
    const id_usuario = useSelector((state) => state.formulario.usuario.id);
    const [showModalComentariosDelContrato, setShowModalComentariosDelContrato] = useState(false);
    const [comentariosContrato, setComentariosDelContrato] = useState([]);
    const [showModalArchivosDelContrato, setShowModalArchivosDelContrato] = useState(false);
    const [archivosContrato, setArchivosDelContrato] = useState([]);
    const [showModalInputTexto, setShowModalInputTexto] = useState(false);
    const [comentarioAAgregar, setComentarioAAgregar] = useState('');
    const [showModalInputFile, setShowModalInputFile] = useState(false);
    const [fileAAgregar, setFileAAgregar] = useState(null);
    const [loading, setLoading] = useState(true);

    const eliminarContrato = (id) => {
      axios
        .post(
          "https://panel.serviciosd.com/app_contrato_eliminar",
          {
            token: TOKEN,
            id: id,
          },
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        )
          .then(() => {
            setMensajeModalExito('El contrato se elimino correctamente');
            setShowModal(true); // mostrar modal
            setTimeout(() => {
              window.location.reload(); // recargar luego de 3s
            }, 1500);
          })
        .catch((err) => {
          console.log("Error al guardar cambios:", err);
        });
    };

    const seleccionarComisionista = (option) => {
      setComisionistasSeleccionados(prev => {
        if (prev.length >= 2) return prev;
        if (prev.some(c => c.id === option.id)) return prev;

        const nuevo = [...prev, option];

        if (nuevo.length === 1) {
          setFormData(fd => ({
            ...fd,
            comisionista1: option.id,
            comision: fd.comision || '0',
          }));
        }

        if (nuevo.length === 2) {
          setFormData(fd => ({
            ...fd,
            comisionista2: option.id,
            comision2: fd.comision2 || '0',
          }));
        }

        return nuevo;
      });
    };
    const SeleccionarPlan = (plan) => {
      setFormData({ ...formData, id_plan: plan.id, 
        alcance_x_nota: plan.alcance_x_nota, 
        notas_x_mes: plan.notas_x_mes,
        con_meta: plan.con_meta,
        con_dv360: plan.con_dv360,
        con_search: plan.con_search,
        con_youtube: plan.con_youtube,

      });

    }

    const eliminarComisionista = (id) => {
    setComisionistasSeleccionados(prev => {
    const nuevos = prev.filter(c => c.id !== id);

    setFormData(fd => ({
      ...fd,
      comisionista1: nuevos[0]?.id || '',
      comision: nuevos[0] ? fd.comision : '0',

      comisionista2: nuevos[1]?.id || '',
      comision2: nuevos[1] ? fd.comision2 : '0',
    }));

    return nuevos;
  });
};

 ///
    const actualizarPorcentajeComisionista = (campo, value) => {
  setFormData(prev => ({
    ...prev,
    [campo]: value
  }));
}; 

  useEffect(() => {
  const cargarDatos = async () => {
    setLoading(true);

    try {
      const [
        usuariosData,
        clientesData,
        planesData,
        geoData,
        contratosData,
        comisionistasData
      ] = await Promise.all([
        obtenerUsuarios(TOKEN),
        obtenerClientes(TOKEN),
        obtenerPlanesMarketing(TOKEN, desdeMarketing, desdeMarketing),
        obtenerGeo(),
        obtenerContratos(TOKEN),
        obtenerComisionistas(TOKEN)
      ]);

      setUsuarios(usuariosData);
      setClientes(clientesData);
      setPlanes(planesData);
      setGeo(geoData);
      setContratos(contratosData);
      setComisionistas(comisionistasData);

    } catch (error) {
      console.log("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

    cargarDatos();
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
      item.name?.toLowerCase().includes(search.toLowerCase());
    
    const cumpleID = item.id.toString().includes(search);

    const cumpleFecha =
      inicioContrato <= hasta && finContrato >= desde;

    return (cumpleBusqueda || cumpleID) && cumpleFecha;
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

  const obtenerModalidadDelContrato = (contrato) => {
    if (!contrato) return '';
    if (contrato.bonificado === "SI") return Modalidades.find(m => m.bonificado === "SI");
    if (contrato.unica_factura === "SI") return Modalidades.find(m => m.unica_factura === "SI");
    if(contrato.abierto === "SI") return Modalidades.find(m => m.abierto === "SI");
    return Modalidades.find(m => m.nombre === "Facturación mensual");

  }

  const handleEditClick = (contrato) => {
    const comisionista1 = contrato.com1
      ? comisionistas.find(c => contrato.com1.includes(c.apellido))
      : null;

    const comisionista2 = contrato.com2
      ? comisionistas.find(c => contrato.com2.includes(c.apellido))
      : null;

    setComisionistasSeleccionados(
      [comisionista1, comisionista2].filter(Boolean) /// solo los que existan
    );
    setModalidadSeleccionada(obtenerModalidadDelContrato(contrato));
    setClienteSeleccionado(clientes.find(c => c.id === contrato.id_cliente) || '');
    setContratoSeleccionado({...contrato, id_usuario: id_usuario});
    setFormData({...contrato, id_usuario: id_usuario});
    const emisorObj = Emisor.find(
      e => e.nombre === contrato.empresa  
    );
    setEmisorSeleccionado(emisorObj || null);
    const modal = new window.bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
};

const totales = useMemo(() => {
  return contratosFiltrados.reduce(
    (acc, item) => {
      acc.facturado += Number(item.facturado || 0);
      acc.facturas += Number(item.facturas || 0);
      acc.montosTotal += Number(item.monto || 0);
      acc.totalComision += Number(item.comision || 0) + Number(item.comision2 || 0);
      return acc;
    },
    { facturado: 0, facturas: 0, montosTotal: 0, totalComision: 0 }
  );
}, [contratosFiltrados]);

const handleSave = () => {
  axios
    .post(
      "https://panel.serviciosd.com/app_contrato_edit",
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

  const verComentariosDelContrato = async (contrato) => {
    setShowModalComentariosDelContrato(true);
    const comentarios = await obtenerComentariosDelContrato(TOKEN, contrato.id); // Aquí deberías hacer una llamada a la API para obtener los comentarios relacionados con el contrato
    setComentariosDelContrato(comentarios);
  }
  const cargarComentario = (contrato) => {
    setShowModalInputTexto(true);
    setContratoSeleccionado(contrato);
  }
  const cargarArchivos = (contrato) => {
    setShowModalInputFile(true);
    setContratoSeleccionado(contrato);
  }
  const clickearEnGuardarUnArchivoContrato = async (contrato, archivo) => {
    console.log("Guardando archivo para contrato", contrato, "Archivo:", archivo);
    setShowModalInputFile(false);
    const respuesta = await guardarArchivoDeUnContrato(TOKEN, contratoSeleccionado.id, id_usuario, archivo);

  }

  const clickearGuardarComentarioContrato = async (contrato, comentario) => {
    console.log("Guardando comentario para contrato", contrato, "Comentario:", comentario);
    setShowModalInputTexto(false);
    const respuesta = await guardarComentarioDeUnContrato(TOKEN, contratoSeleccionado.id, comentario, id_usuario);
  }

  const verArchivosDelContrato = async (contrato) => {
    setShowModalArchivosDelContrato(true);
    const archivos = await obtenerArchivosDelContrato(TOKEN, contrato.id); // Aquí deberías hacer una llamada a la API para obtener los archivos relacionados con el contrato
    setArchivosDelContrato(archivos);
  }

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
          <span style={{ fontSize: "14px", marginLeft: "10px"}}>Vencimiendo desde:
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
          <form className='buscadorNotasForm'>
            <input
              className = 'inputBuscadorNotas'
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="       Buscar contratos por cliente o id..."
            />
          </form>
        </div>
      </div>
      <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-3'>
        <div className='col buscadorNotas'>
          <span style={{ fontSize: "14px"}}>
            Total listado: {
                formatearARS(totales.montosTotal) 
            }
          </span>
        </div>
        <div className='col buscadorNotas'>
          <span style={{ fontSize: "14px"}}>
            Cantidad facturas: {totales.facturado} / {totales.facturas}
          </span>
        </div>
        <div className='col buscadorNotas'>
          <span style={{ fontSize: "14px"}}>
            Total comisión: ${formatearARS(totales.totalComision)}
          </span>
        </div>
        <div className='col buscadorNotas'>
            <button className="mb-2 btn btn-secondary" onClick={() => {
              descargarExcel(contratosFiltrados, "Contratos");
            }}>
              Descargar Excel
            </button>
        </div>
      </div>

      {/* Lista */}
      <div className='row miPerfilContainer soporteContainer mt-4 p-0'>
        <div>
          <ul className="list-group">
            
             {loading ? (
                <li className="list-group-item text-center" style={{ height: "200px" }}>
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                </li>
              ) :
            pagedItems.length === 0 ? (
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
                        <strong>{item.name == null ? 'Sin cliente' : item.name}</strong>
                      </button>
                      <div>Cuit: {item.cuit}</div>
                      <div>Empresa: {item.empresa}</div>
                      <div>ID: {item.id}</div>
                      <div>Modalidad: {obtenerModalidadDelContrato(item).nombre}</div>
                    </div>
                    <div className='col-3'>
                      <div>Monto total: {formatearARS(item.monto)}</div>
                      <div>Avance: {item.avance}</div>
                      {item.orden_compra != '' && <a href={item.orden_compra} target='_blank'>Ver orden de compra</a>}
                      {item.orden_compra == '' && <div>Sin orden de compra</div>}
                    </div>
                    <div className='col-3'>
                      <div>Fecha inicio: {item.fecha_inicio}</div>
                      <div>Fecha fin: {item.fecha_fin}</div>
                      <div>Facturas Emitidas: {item.facturado}/{item.facturas}</div>
                      <div>
                        <button className="mb-2 btn btn-primary" onClick={() => cargarArchivos(item)}>
                          Cargar archivo
                        </button>
                      </div>
                      <div>
                        <button className="mb-2 btn btn-primary" disabled={showModalArchivosDelContrato} onClick={() => verArchivosDelContrato(item)}>
                          Ver Archivos
                        </button>
                      </div>
                    </div> 
                    <div className='col-3'>
                      <div>Distribucion: {item.estado}</div>
                      <div>
                        <button className="mb-2 btn btn-primary" onClick={() => cargarComentario(item)}>
                          ingresar comentarios
                        </button>
                      </div>
                      <div>
                        <button className="mb-2 btn btn-primary" disabled={showModalComentariosDelContrato} onClick={() => verComentariosDelContrato(item)}>
                          Ver comentarios
                        </button>
                      </div>
                      <div>
                        <button
                          className="mb-2 btn btn-secondary"
                          onClick={() => {
                            handleEditClick(item);
                            setFormData(prev => ({
                              ...prev,
                              id: "0"
                            }));
                          }}
                        >
                          Duplicar contrato
                        </button>
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
                    onSelect={(cliente) => {
                      setClienteSeleccionado(cliente);
                      setFormData(prev => ({
                        ...prev,
                        id_cliente: cliente.id
                      }));
                    }}
                    onClear={(cliente) => {
                      setClienteSeleccionado('');
                      setFormData(prev => ({
                        ...prev,
                        id_cliente: ''
                      }));
                    }}
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
                      type="text"
                      className="form-control"
                      value={formData.cuit}
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
              { ModalidadSeleccionada?.abierto === "SI" && (
                <>
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
                    title="Comision total ($)"
                    selectedValue={Number(formData.comision) + Number(formData.comision2)}
                    isPercentual ={true}
                    min={0}
                    max={99.9}
                    isDecimal={true}
                  />

                  <SelectorConBuscador
                    title="Comisionistas (Max 2)"
                    options={comisionistas}
                    selectedOption={''}
                    onSelect={(option) => { seleccionarComisionista(option)}}
                  />
                  {comisionistasSeleccionados.length > 0 && (
                  <div className="mb-3">
                    <ul>
                      {comisionistasSeleccionados.map((comisionista, index) => {
                        const campo = index === 0 ? "comision" : "comision2";
                        const campoPorcentaje = index === 0 ? "porcentaje_comision" : "porcentaje_comision2";


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
                                selectedValue={formData[campoPorcentaje] || '0'}
                                isPercentual={true}
                                min={0}
                                max={99.9}
                                onSelect={(value) =>
                                  actualizarPorcentajeComisionista(campoPorcentaje, value)
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
                  </div> 
                    </>
                  )}
                  {(ModalidadSeleccionada?.nombre == "Facturación mensual" 
                    || ModalidadSeleccionada?.nombre == "Unica factura") && 
                  (<>
                  <InputNumerico
                    title="Monto ($)"
                    selectedValue={formData.monto || '0'}
                    isPercentual ={false}
                    onSelect={(value) => setFormData({ ...formData, monto  : value })}
                    onClear={() => setFormData({ ...formData, monto: '0' })}
                    isDecimal={true}
                    max={999999999999}  
                  />

                  <InputNumerico
                    title="Comision total ($)"
                    selectedValue={(Number(formData.monto) * (Number(formData.porcentaje_comision) / 100) + (Number(formData.monto) * Number(formData.porcentaje_comision2) / 100))}
                    isPercentual ={false}
                    min={0}
                    max={99.9}
                    isDecimal={true}
                  />
                  <SelectorConBuscador
                    title="Comisionistas (Max 2)"
                    options={comisionistas}
                    selectedOption={''}
                    onSelect={(option) => { seleccionarComisionista(option)}}
                  />
                  {comisionistasSeleccionados.length > 0 && (
                    console.log('comisionistasSeleccionados adentro de lenght:', comisionistasSeleccionados) ||
                  <div className="mb-3">
                    <ul>
                      {comisionistasSeleccionados.map((comisionista, index) => {
                       const porcentajeCampo = index === 0 ? "porcentaje_comision" : "porcentaje_comision2";

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
                                selectedValue={formData[porcentajeCampo] || '0'}
                                isPercentual={true}
                                min={0}
                                max={99.9}
                                onSelect={(value) => actualizarPorcentajeComisionista(porcentajeCampo, value)}
                              />
                            </span>
                            <span style={{ marginTop: '8px', fontSize: '16px' }}>
                              {"$" +(Number(formData.monto) * (Number(formData[porcentajeCampo]) / 100)) }
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
                  </>)}
                    
                <Checkbox 
                  title="Requiere pago de sellos"
                  value={formData.requiere_pago === "SI"}
                  onChange={(value) => setFormData({ ...formData, requiere_pago: value ? "SI" : "NO" })}
                />
                <Checkbox 
                  title="Lleva certificacion"
                  value={formData.lleva_certificacion === "SI"}
                  onChange={(value) => setFormData({ ...formData, lleva_certificacion: value ? "SI" : "NO" })}
                />
                <Checkbox 
                  title="El contrato se aprueba sin orden"
                  value={formData.con_orden === "NO"}
                  onChange={(value) => setFormData({ ...formData, con_orden: value ? "NO" : "SI" })}
                />
                {formData.con_orden === "SI" && (
                <FileInput
                  title="Orden de compra"
                  accept = "*"
                  onChange={(file) => setFormData({ ...formData, orden_compra: file })}
                  multiple={false}
                  onClear={() => setFormData({ ...formData, orden_compra: '' })}
                />
                )}
                {formData.orden_compra && (typeof formData.orden_compra === "string") &&  formData.orden_compra.includes('http') && (
                <span>Ultima orden: <a href={formData.orden_compra} target="_blank" rel="noopener noreferrer">{formData.orden_compra}</a></span>
                )}
                <SelectorConBuscador title={'Plan'} options={planes} 
                  selectedOption={planes.find(p => p.id === formData.id_plan) || ''}
                  onSelect={(plan) => SeleccionarPlan(plan)}
                  onClear={() => setFormData({ ...formData, id_plan: ''})} 
                  >
                </SelectorConBuscador>
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

                {/* con meta */}
                  <DropdawnSiNo
                    label="Con Meta"
                    name="con_meta"
                    value={formData.con_meta}
                    setFormData={setFormData}
                  />
                                  {/* con youtube */}
                <DropdawnSiNo
                    label="Con Meta"
                    name="con_youtube"
                    value={formData.con_youtube}
                    setFormData={setFormData}
                  />
                {/* con dv360 */}
                  <DropdawnSiNo
                    label="Con dv360"
                    name="con_dv360"
                    value={formData.con_dv360}
                    setFormData={setFormData}
                  />
                {/* con search */}
                  <DropdawnSiNo
                    label="Con search"
                    name="con_search"
                    value={formData.con_search}
                    setFormData={setFormData}
                  />

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
                onClick={() => eliminarContrato(formData.id)}
                disabled={formData.id == '0'}

              >
                Eliminar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSave()}
                disabled={!formData.razon_social}
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
      <ModalConListado
        show={showModalComentariosDelContrato}
        titulo="Comentarios del contrato"
        lista={comentariosContrato.flatMap(a => [a.comentario, 'fecha: ' + a.fecha, 'usuario: ' + a.usuario])}
        onClose={() => setShowModalComentariosDelContrato(false)}
      />
      <ModalConListado
        show={showModalArchivosDelContrato}
        titulo="Archivos del contrato"
        lista={archivosContrato.flatMap(a => ['nombre archivo: ' + a.nombre_file, 'https://panel.serviciosd.com/contratos/' + a.archivo])}
        onClose={() => setShowModalArchivosDelContrato(false)}
      />
      <ModalConInputTexto
        show={showModalInputTexto}
        titulo="Agregar Comentario"
        actualTexto={comentarioAAgregar}
        setTexto={setComentarioAAgregar}
        AlGuardar={() => {
          clickearGuardarComentarioContrato(contratoSeleccionado, comentarioAAgregar);
          setShowModalInputTexto(false);
        }}
        onClose={() => setShowModalInputTexto(false)}
      />
      <ModalConInputFile
        show={showModalInputFile}
        titulo="Cargar archivo del contrato"
        actualFile={fileAAgregar}
        setFile={setFileAAgregar}
        AlGuardar={() => {
          clickearEnGuardarUnArchivoContrato(contratoSeleccionado, fileAAgregar);
          setShowModalInputFile(false);
        }}
        onClose={() => setShowModalInputFile(false)}
      />

    </div>
  );
};

export default AbmContratos;