import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import axios from 'axios';
import ModalMensaje from '../administrador/gestores/ModalMensaje';
import { obtenerClientes, obtenerContratos, obtenerPlanesMarketing, obtenerComisionistas, cargarArchivo } from '../administrador/gestores/apisUsuarios'; // Importa la función para obtener usuarios
import '../administrador/gestores/AbmsMobile.css';
import './AbmContratos.css';
import DropdawnSiNo from './DropdawnSiNo'
import SelectorConBuscador from '../nota/Editorial/SelectorConBuscador';
import InputFecha from '../nota/Editorial/InputFecha';
import InputNumerico from '../nota/Editorial/InputNumerico';
import Checkbox from '../nota/Editorial/checkbox';
import FileInput from '../nota/Editorial/FileInput';
import ModalConListado from '../administrador/gestores/ModalConListado';
import { obtenerArchivosDeContrato, obtenerComentariosDeContrato } from '../administrador/gestores/apisUsuarios';
import ModalConInputTexto from '../administrador/gestores/ModalConInputTexto';
import { agregarComentario } from '../administrador/gestores/apisUsuarios';
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

const escaparRegExp = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const comisionistaCoincideConTexto = (comisionista, texto) => {
  const apellido = comisionista?.apellido?.trim();
  if (!texto || !apellido) return false;
  const patron = new RegExp(`\\b${escaparRegExp(apellido)}\\b`, 'i');
  return patron.test(texto);
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
  razon_social: "",
  tipo: "",
  cuit: "",

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

  con_meta: "0",
  con_search: "0",
  con_dv360: "0",
  con_youtube: "0",
  con_x: "0",
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
  ignore: '1',
  margenTercero: "0",
};



const AbmContratos
 = () => {
    const [planes, setPlanes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [contratos, setContratos] = useState([]);
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


    useEffect(() => {
  console.log('contrato seleccionado:', formData);
}, [formData, contratoSeleccionado]);
    const eliminarContrato = (id) => {
      setMensajeModalExito('Eliminando el contrato...');
      setShowModal(true); // mostrar modal
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
          .then((res) => {
            if (res.data?.message) {
              setMensajeModalExito(res.data.message);
              setShowModal(true);
              return;
            }
            setMensajeModalExito('El contrato se elimino correctamente');
            setShowModal(true); // mostrar modal
            setTimeout(() => {
              window.location.reload(); // recargar luego de 3s
            }, 1500);
          })
        .catch((err) => {
          console.log("Error al eliminar contrato:", err);
          setMensajeModalExito('Ocurrió un error al eliminar el contrato. Intentá nuevamente.');
          setShowModal(true);
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
        alcance_x_nota: Number(plan.alcance_x_nota) || 0,
        notas_x_mes: Number(plan.notas_x_mes) || 0,
        con_meta: Number(plan.con_meta) || 0,
        con_dv360: Number(plan.con_dv360) || 0,
        con_search: Number(plan.con_search) || 0,
        con_youtube: Number(plan.con_youtube) || 0,

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
        clientesData,
        planesData,
        contratosData,
        comisionistasData
      ] = await Promise.all([
        obtenerClientes(TOKEN),
        obtenerPlanesMarketing(TOKEN, desdeMarketing, desdeMarketing),
        obtenerContratos(TOKEN),
        obtenerComisionistas(TOKEN)
      ]);

      setClientes(clientesData);
      setPlanes(planesData);
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
  }, [clienteSeleccionado, contratos]);

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

  const claseBadgeEstado = (estado) => {
    switch ((estado || '').toLowerCase()) {
      case 'activa':
        return 'activa';
      case 'pausada':
      case 'en pausa':
        return 'pausa';
      case 'finalizada':
      case 'vencida':
        return 'finalizada';
      default:
        return 'default';
    }
  }

  useEffect(() => {
      if(contratosDelClienteSeleccionado?.length > 0){
      setFormData(fd => ({
        ...fd,
        razon_social: contratosDelClienteSeleccionado.find(c => c.razon_social)?.razon_social || '',
        cuit: contratosDelClienteSeleccionado.find(c => c.cuit)?.cuit || '',
      }));
    }
  }, [contratosDelClienteSeleccionado]);

  const handleEditClick = (contrato) => {
    const comisionista1 = contrato.com1
      ? comisionistas.find(c => comisionistaCoincideConTexto(c, contrato.com1))
      : null;

    const comisionista2 = contrato.com2
      ? comisionistas.find(c => comisionistaCoincideConTexto(c, contrato.com2))
      : null;

    setComisionistasSeleccionados(
      [comisionista1, comisionista2].filter(Boolean) /// solo los que existan
    );
    setModalidadSeleccionada(obtenerModalidadDelContrato(contrato));
    setClienteSeleccionado(clientes.find(c => c.id === contrato.id_cliente) || '');
    setContratoSeleccionado({...contrato, id_usuario: id_usuario});
    setFormData({
      ...contrato,
      id_usuario,
      ignore: '1'
    });
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
  setShowModal(true); // mostrar modal
  setMensajeModalExito('Aguarde un momento... estamos guardando los cambios'); // mensaje de guardado

    const data = {
    ...formData,
    notas_x_mes: Number(formData.notas_x_mes) || 0,
    alcance_x_nota: Number(formData.alcance_x_nota) || 0,
    monto: Number(formData.monto) || 0,
    con_meta: Number(formData.con_meta) || 0,
    con_youtube: Number(formData.con_youtube) || 0,
    con_search: Number(formData.con_search) || 0,
    con_dv360: Number(formData.con_dv360) || 0,
    con_x: Number(formData.con_x) || 0,
  };
  axios
    .post(
      "https://panel.serviciosd.com/app_contrato_edit",
      {
        token: TOKEN,
        ...data,
      },
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
    .then((res) => {
      setMensajeModalExito(res.data.message || 'Los cambios se realizaron correctamente');
      setShowModal(true);
      if (!res.data.message) {
      setTimeout(() => {
        window.location.reload();
      }, 2000)
    }
    })
    .catch((err) => {
      console.log("Error al guardar cambios:", err);
      setMensajeModalExito('Ocurrió un error al guardar los cambios. Intentá nuevamente.');
      setShowModal(true);
    });
  };

  const verComentariosDelContrato = async (contrato) => {
    setShowModalComentariosDelContrato(true);
    const comentarios = await obtenerComentariosDeContrato(TOKEN, contrato.id);
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
    setShowModalInputFile(false);
    await cargarArchivo(TOKEN, id_usuario, archivo, contratoSeleccionado.id);
    setMensajeModalExito('El archivo se cargó correctamente.');
    setShowModal(true);
  }

  const clickearGuardarComentarioContrato = async (contrato, comentario) => {
    setShowModalInputTexto(false);
    await agregarComentario(TOKEN, id_usuario, comentario, contratoSeleccionado.id);
    setMensajeModalExito('El comentario se guardó correctamente.');
    setShowModal(true);
  }

  const verArchivosDelContrato = async (contrato) => {
    setShowModalArchivosDelContrato(true);
    const archivos = await obtenerArchivosDeContrato(TOKEN, contrato.id);
    setArchivosDelContrato(archivos);
  }

  return (
    <div className="content flex-grow-1 crearNotaGlobal contratosPage">
      <div className='row miPerfilContainer soporteContainer'>
        <div className='col p-0'>
          <h3 id="saludo" className='headerTusNotas ml-0'>
            <i className="icon me-2 icono_tusNotas bi bi-bag-fill" alt="Icono 1" /> Gestiona tus Contratos
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
        <div className='col'>
          <div className="filtrosCard">
            <button className="btnNuevoContrato btn btn-primary" onClick={() => handleEditClick(contratoVacio)}>
              <i className="bi bi-plus-lg" />Crear nuevo contrato
            </button>
            <label className="filtroFecha">
              Vencimiento desde
              <input
                type="month"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </label>
            <label className="filtroFecha">
              Vencimiento hasta
              <input
                type="month"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </label>
            <form className='buscadorNotasForm' onSubmit={(e) => e.preventDefault()}>
              <input
                className = 'inputBuscadorNotas'
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar contratos por cliente o id..."
              />
            </form>
          </div>
        </div>
      </div>
      <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-3'>
        <div className='col'>
          <div className="statsRow">
            <div className="statTile">
              <div className="statIcono"><i className="bi bi-cash-stack" /></div>
              <div>
                <div className="statLabel">Total listado</div>
                <div className="statValue">${formatearARS(totales.montosTotal)}</div>
              </div>
            </div>
            <div className="statTile">
              <div className="statIcono"><i className="bi bi-receipt" /></div>
              <div>
                <div className="statLabel">Cantidad facturas</div>
                <div className="statValue">{totales.facturado} / {totales.facturas}</div>
              </div>
            </div>
            <div className="statTile">
              <div className="statIcono"><i className="bi bi-percent" /></div>
              <div>
                <div className="statLabel">Total comisión</div>
                <div className="statValue">${formatearARS(totales.totalComision)}</div>
              </div>
            </div>
            <div className="statTile" style={{ justifyContent: 'center' }}>
              <button className="btn btn-secondary w-100" style={{ borderRadius: '8px' }} onClick={() => {
                descargarExcel(contratosFiltrados, "Contratos");
              }}>
                <i className="bi bi-download me-2" />Descargar Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className='row miPerfilContainer soporteContainer mt-4 p-0'>
        <div>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : pagedItems.length === 0 ? (
            <div className="contratoCard text-center text-muted">No hay resultados.</div>
          ) : (
            <ul className="listaContratos">
              {pagedItems.map((item) => (
                <li key={item.id} className="contratoCard">
                  <div className='row pt-0'>
                    <div className='col-md-3'>
                      <button
                        className="btn btn-link contratoCliente"
                        onClick={() => handleEditClick(item)}
                      >
                        {item.name == null ? 'Sin cliente' : item.name}
                      </button>
                      <div className="contratoMeta">ID: {item.id} · CUIT: {item.cuit}</div>
                      <div className="contratoMeta">{item.empresa}</div>
                      <div className="contratoMeta">{obtenerModalidadDelContrato(item).nombre}</div>
                      <div className={`badgeEstado ${claseBadgeEstado(item.estado)}`}>{item.estado || 'Sin estado'}</div>
                    </div>
                    <div className='col-md-3'>
                      <div className="contratoLabel">Monto total</div>
                      <div className="contratoDato">${formatearARS(item.monto)}</div>
                      <div className="contratoLabel">Avance</div>
                      <div className="contratoDato">{item.avance}</div>
                      <div className="contratoLabel">Orden de compra</div>
                      {item.orden_compra != '' ? (
                        <a className="ordenCompraLink" href={item.orden_compra} target='_blank' rel="noopener noreferrer">Ver orden de compra</a>
                      ) : (
                        <div className="contratoDato text-muted">Sin orden de compra</div>
                      )}
                    </div>
                    <div className='col-md-3'>
                      <div className="contratoLabel">Vigencia</div>
                      <div className="contratoDato">{item.fecha_inicio} a {item.fecha_fin}</div>
                      <div className="contratoLabel">Facturas emitidas</div>
                      <div className="contratoDato">{item.facturado}/{item.facturas}</div>
                      <div className="accionesContrato">
                        <button className="btn btn-outline-secondary" onClick={() => cargarArchivos(item)}>
                          <i className="bi bi-upload" />Cargar archivo
                        </button>
                        <button className="btn btn-outline-secondary" disabled={showModalArchivosDelContrato} onClick={() => verArchivosDelContrato(item)}>
                          <i className="bi bi-folder2-open" />Ver archivos
                        </button>
                      </div>
                    </div>
                    <div className='col-md-3'>
                      <div className="accionesContrato">
                        <button className="btn btn-outline-secondary" onClick={() => cargarComentario(item)}>
                          <i className="bi bi-chat-left-text" />Ingresar comentario
                        </button>
                        <button className="btn btn-outline-secondary" disabled={showModalComentariosDelContrato} onClick={() => verComentariosDelContrato(item)}>
                          <i className="bi bi-chat-square-text" />Ver comentarios
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            handleEditClick(item);
                            setFormData(prev => ({
                              ...prev,
                              id: "0"
                            }));
                          }}
                        >
                          <i className="bi bi-copy" />Duplicar contrato
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Paginación */}
          <div className="paginacionContratos">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
            >
              <i className="bi bi-chevron-left" />
            </button>
            <span>Página {page} de {totalPages || 1}</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
            >
              <i className="bi bi-chevron-right" />
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
                <div className="seccionTitulo">Datos generales</div>
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
                      {contratosDelClienteSeleccionado
                      .sort((a, b) => b.id - a.id).filter(c => c.fecha_fin >= new Date().toISOString().split('T')[0])
                      .map((contrato) => (
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

                  <div className="seccionTitulo">Modalidad y montos</div>
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
                    title=" Margen noticias(d)"
                    selectedValue={formData.margen || '0'}
                    isPercentual ={true}
                    min={0}
                    max={99.9}
                    onSelect={(value) => setFormData({ ...formData, margen: value })}
                    onClear={() => setFormData({ ...formData, margen: '0' })}
                    isDecimal={true}
                  />
                  </div>  

                  <div className="mb-3">
                    <InputNumerico
                      title=" Margen agencia(tercero)"
                      selectedValue={formData.margenTercero || '0'}
                      isPercentual ={true}
                      min={0}
                      max={99.9}
                      onSelect={(value) => setFormData({ ...formData, margenTercero: value })}
                      onClear={() => setFormData({ ...formData, margenTercero: '0' })}
                      isDecimal={true}
                    />
                  </div>    


                  {/* Comision */}
                  <div className="mb-3">
                  {comisionistasSeleccionados.length > 0 && (
                    <InputNumerico
                      title="Comision total ($)"
                      selectedValue={Number(formData.comision) + Number(formData.comision2)}
                      isPercentual ={true}
                      min={0}
                      max={99.9}
                      isDecimal={true}
                    />
                  )}

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
                    selectedValue={formData.monto || ''}
                    isMoney={true}
                    isPercentual={false}
                    onSelect={(value) =>
                      setFormData({
                        ...formData,
                        monto: value
                      })
                    }
                    onClear={() =>
                      setFormData({
                        ...formData,
                        monto: 0
                      })
                    }
                    max={999999999999}
                  />

                  {comisionistasSeleccionados.length > 0 && (
                    <InputNumerico
                      title="Comision total ($)"
                      selectedValue={Number(formData.comision) + Number(formData.comision2)}
                      isPercentual ={true}
                      min={0}
                      max={99.9}
                      isDecimal={true}
                    />
                  )}
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

                <div className="seccionTitulo">Condiciones</div>
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
                <div className="seccionTitulo">Plan y alcance</div>
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
                      value={formData.alcance_x_nota || "0"}
                      onChange={(e) =>
                        setFormData({ ...formData, alcance_x_nota: e.target.value })
                      }
                    />
                  </div>
                  
                  <div className="seccionTitulo">Costos marketing</div>
                  <div className="mb-3">
                    <label className="form-label">Meta</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.con_meta || "0"}
                      onChange={(e) =>
                        setFormData({ ...formData, con_meta: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Youtube</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.con_youtube || "0"}
                      onChange={(e) =>
                        setFormData({ ...formData, con_youtube: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Search</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.con_search || "0"}
                      onChange={(e) =>
                        setFormData({ ...formData, con_search: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Dv 360</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.con_dv360 || "0"}
                      onChange={(e) =>
                        setFormData({ ...formData, con_dv360: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">X</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.con_x || "0"}
                      onChange={(e) =>
                        setFormData({ ...formData, con_x: e.target.value })
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