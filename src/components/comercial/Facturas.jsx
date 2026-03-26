import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { obtenerMesActual } from '../administrador/gestores/Distribucion.jsx';
import DropdownFiltro from './DropdownFiltro.jsx'; 
import './Facturas.css'
import { obtenerFacturas, editarFactura, unificarFacturas, dividirFactura, 
         cargarFacturaAbierta, obtenerContratos, obtenerFacturasDeContrato, 
         obtenerArchivosDeContrato, obtenerComentariosDeContrato, eliminarFacturaAbierta,
         eliminarArchivo, cargarArchivo, agregarComentario } from '../administrador/gestores/apisUsuarios.jsx';
import { descargarExcel } from '../funciones/creacionCSV';

const SpinnerCarga = ({ texto = "Cargando..." }) => (
    <div className="text-center p-4 border rounded fw-bold w-100">
        <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
        {texto}
    </div>
);

const Facturas = () =>  {
    
    const token = useSelector((state) => state.formulario.token);
    const idUsuario = useSelector((state) => state.formulario.usuario.id);
    const [fechaDesde, setFechaDesde] = useState(obtenerMesActual(-3));
    const [fechaHasta, setFechaHasta] = useState(obtenerMesActual(6));
    const [search, setSearch] = useState("");
    const [emision, setEmision] = useState("Todas");
    const [deuda, setDeuda] = useState("Todas");
    const [empresa, setEmpresa] = useState("Cualquiera");
    const [certificacion, setCertificacion] = useState ("Cualquiera");
    const [facturas, setFacturas] = useState([]);
    const [facturaActual, setFacturaActual] = useState("");
    const [estadoSeleccionado, setEstadoSeleccionado] = useState("");    
    const [numeroSeleccionado, setNumeroSeleccionado] = useState("");    
    const [mesSeleccionado, setMesSeleccionado] = useState("");    
    const [fechaPagoSeleccionada, setFechaPagoSeleccionada] = useState("");    
    const [mensajeExito, setMensajeExito] = useState("");
    const [animarAlerta, setAnimarAlerta] = useState(false);
    const [contratosAbiertos, setContratosAbiertos] = useState([]);
    const [contratoSeleccionado, setContratoSeleccionado] = useState("");
    const [montoSeleccionado, setMontoSeleccionado] = useState("");
    const [facturasContrato, setFacturasContrato] = useState([]);
    const [facturasAUnificar, setFacturasAUnificar] = useState([]);
    const [procesandoUnificacion, setProcesandoUnificacion] = useState(false);
    const [procesandoDivision, setProcesandoDivision] = useState(false);
    const [cargandoContratos, setCargandoContratos] = useState(false);
    const [cargandoFacturasEnContrato, setCargandoFacturasEnContrato] = useState(false);
    const [archivosContrato, setArchivosContrato] = useState([]);
    const [cargandoArchivos, setCargandoArchivos] = useState(false);
    const [comentariosContrato, setComentariosContrato] = useState([]);
    const [cargandoComentarios, setCargandoComentarios] = useState(false);
    const [subiendoArchivo, setSubiendoArchivo] = useState(false);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [guardandoComentario, setGuardandoComentario] = useState(false);

    useEffect(() => {
        if (token && fechaDesde && fechaHasta) {
            obtenerFacturas(token, (fechaDesde + "-01"), (fechaHasta + "-01")).then((facturasRecibidos) => {
                setFacturas(facturasRecibidos);
            });
        }
    }, [token, fechaDesde, fechaHasta]);

    useEffect(() => {
        if(token) {
            setCargandoContratos(true);
            obtenerContratos(token).then((contratosRecibidos) => {
                setContratosAbiertos(contratosRecibidos.filter((contrato) =>
                    contrato.abierto === "SI"));
            })
            .finally(() => setCargandoContratos(false));
        }
    }, [token])

    const accionesBotones = [

        { nombre: "Editar Factura", 
          icono: "bi bi-pencil-square",
          color: "rgb(165, 22, 22)",
          accion: (f) => {
            setFacturaActual(f); 
            setEstadoSeleccionado(f.estado);
            setNumeroSeleccionado(f.numero || "");
            setMesSeleccionado(f.mes ? `${String(f.mes).slice(0, 4)}-${String(f.mes).slice(4)}` : "");
            setFechaPagoSeleccionada(f.fecha_pago);
          },
          modalTarget: "#modalEditarFactura"
        },

        { nombre: "Unificar Facturas", 
          icono: "bi bi-intersect",
          color: "rgb(8, 6, 6)",
          accion: (f) => {
            setFacturaActual(f);
            setFacturasAUnificar([]);
            setCargandoFacturasEnContrato(true);

            obtenerFacturasDeContrato(token, f.id_contrato).then((facturas) => {
                const facturasDeContrato = facturas.filter(factura => factura.id !== f.id);
                setFacturasContrato(facturasDeContrato);
            })
            .finally(() => setCargandoFacturasEnContrato(false));

          },
          mostrar: (f) => !f.numero,
          modalTarget: "#modalUnificarFacturas"
        },
          
        { nombre: "Archivos", 
          icono: "bi bi-folder-fill",
          color: "rgb(221, 194, 76)",
          accion: (f) => {
            setFacturaActual(f);
            setArchivosContrato([]);
            setCargandoArchivos(true);

            obtenerArchivosDeContrato(token, f.id_contrato).then((archivos) => {
                setArchivosContrato(archivos || []);
            })
            .finally(() => setCargandoArchivos(false));
          },
          modalTarget: "#modalArchivos",
        },

        { nombre: "Dividir Factura", 
          icono: "bi bi-back",
          color: "rgb(8, 6, 6)",
          accion: (f) => {
            setFacturaActual(f);
            setNumeroSeleccionado("2");
            setMesSeleccionado(`${String(f.mes).slice(0, 4)}-${String(f.mes).slice(4)}`)
          },
          mostrar: (f) => !f.numero,
          modalTarget: "#modalDividirFactura"
         },
        
        { nombre: "Comentarios", 
          icono: "bi bi-chat-left-text-fill",
          color: "rgb(34, 85, 194)",
          accion: (f) => {
            setFacturaActual(f);
            setComentariosContrato([]); 
            setCargandoComentarios(true); 

            obtenerComentariosDeContrato(token, f.id_contrato).then((comentarios) => {
                setComentariosContrato(comentarios || []);
            })
            .finally(() => setCargandoComentarios(false));
          },
          modalTarget: "#modalComentarios",  
        },

        { nombre: "Eliminar Factura",
          icono: "bi bi-trash3-fill",
          color: "rgb(165, 22, 22)",
          accion: (f) => {
            setFacturaActual(f);
          },  
          mostrar: (f) => f.abierto === "SI",
          modalTarget: "#modalEliminarFactura",
        },
    ];

    {/* FUNCION EDITAR FACTURA */}
    const handleEditFactura = (e) => {
        e.preventDefault(); 
        
        let mesApi = mesSeleccionado ? mesSeleccionado.replace('-', '') : ""; 
        let fechaApi = estadoSeleccionado != "IMPAGA" ? fechaPagoSeleccionada : ""; 

        editarFactura(token, facturaActual.id, numeroSeleccionado, estadoSeleccionado, mesApi, fechaApi).then(() => {
            setFacturas((facturasViejas) => 
                facturasViejas.map((f) => 
                    f.id === facturaActual.id ? 
                        { ...f, numero: numeroSeleccionado, estado: estadoSeleccionado, mes: mesApi, fecha_pago: fechaApi } : f
                )
            );
            mostrarAlertaExito("La factura fue editada exitosamente!");
            document.querySelector('#modalEditarFactura .btn-close').click();
        })
    };

    {/* FUNCIONES CARGAR FACTURA ABIERTA */}
    const abrirModalFacturaAbierta = () => {
        setContratoSeleccionado("");
        setNumeroSeleccionado("");
        setEstadoSeleccionado("IMPAGA");
        setMesSeleccionado(obtenerMesActual(0));
        setFechaPagoSeleccionada("");
        setMontoSeleccionado("");
    };

    const handleCargarFactura = (e) => {
        e.preventDefault(); 
        
        let mesApi = mesSeleccionado ? mesSeleccionado.replace('-', '') : ""; 
        let fechaApi = estadoSeleccionado != "IMPAGA" ? fechaPagoSeleccionada : ""; 

        cargarFacturaAbierta(token, numeroSeleccionado, estadoSeleccionado, mesApi, contratoSeleccionado, montoSeleccionado, fechaApi).then(() => {
            obtenerFacturas(token, (fechaDesde + "-01"), (fechaHasta + "-01")).then((facturasRecibidos) => {
                setFacturas(facturasRecibidos);
            });
            mostrarAlertaExito("La factura abierta fue cargada exitosamente!");
            document.querySelector('#modalCargarFactura .btn-close').click();
        })
    };

    {/* FUNCIONES UNIFICAR FACTURA */}
    const toggleFacturaUnificar = (id) => {
        if (facturasAUnificar.includes(id)) {
            setFacturasAUnificar(facturasAUnificar.filter(fId => fId !== id)); 
        } else {
            setFacturasAUnificar([...facturasAUnificar, id]);
        }
    };

    const handleUnificarFacturas = (e) => {
        e.preventDefault(); 
        if (facturasAUnificar.length === 0) return;
        
        setProcesandoUnificacion(true);

        unificarFacturas(token, facturasAUnificar, facturaActual.id).then(() => {
            obtenerFacturas(token, (fechaDesde + "-01"), (fechaHasta + "-01")).then((facturasActualizadas) => {
                setFacturas(facturasActualizadas);
            });
            mostrarAlertaExito(`¡Se unificaron ${facturasAUnificar.length + 1} facturas exitosamente!`);
            document.querySelector('#modalUnificarFacturas .btn-close').click(); 
        })
        .finally(() => {
            setProcesandoUnificacion(false);
        });
    };

    {/* FUNCION DIVIDIR FACTURA */}
    const handleDividirFactura = (e) => {
        e.preventDefault(); 
        
        if (numeroSeleccionado < 2) return;
        setProcesandoDivision(true);

        let mesApi = mesSeleccionado ? mesSeleccionado.replace('-', '') : ""; 

        dividirFactura(token, facturaActual.id, numeroSeleccionado, mesApi).then(() => {
            obtenerFacturas(token, (fechaDesde + "-01"), (fechaHasta + "-01")).then((facturasActualizadas) => {
                setFacturas(facturasActualizadas);
            });
            mostrarAlertaExito(`¡La factura se dividió en ${numeroSeleccionado} partes exitosamente!`);
            document.querySelector('#modalDividirFactura .btn-close').click(); 
        }).finally(() => {
            setProcesandoDivision(false);
        });
    };

    {/* FUNCION ELIMINAR FACTURA */}
    const handleEliminarFactura = () => {
        eliminarFacturaAbierta(token, facturaActual.id).then(() => {
            obtenerFacturas(token, (fechaDesde + "-01"), (fechaHasta + "-01")).then((facturasActualizadas) => {
                setFacturas(facturasActualizadas);
            });
            mostrarAlertaExito("¡La factura fue eliminada exitosamente!");
            document.querySelector('#modalEliminarFactura .btn-close').click(); 
        })
    };

    {/* FUNCION ELIMINAR ARCHIVO */}
    const handleEliminarArchivo = (idArchivo) => {
        if (window.confirm("¿Estás seguro de que querés eliminar este archivo?")) {
            
            eliminarArchivo(token, idArchivo, idUsuario).then(() => {
                obtenerArchivosDeContrato(token, facturaActual.id_contrato).then((archivosActualizados) => {
                    setArchivosContrato(archivosActualizados || []);
                });
                
                mostrarAlertaExito("¡Archivo eliminado exitosamente!");
            })
        }
    };

    {/* FUNCION SUBIR ARCHIVO */}
    const handleSubirArchivo = (e) => {
        const archivoSeleccionado = e.target.files[0];
        if (!archivoSeleccionado) return; 

        setSubiendoArchivo(true); 

        cargarArchivo(token, idUsuario, archivoSeleccionado, facturaActual.id_contrato).then(() => {
            obtenerArchivosDeContrato(token, facturaActual.id_contrato).then((archivosActualizados) => {
                setArchivosContrato(archivosActualizados || []);
            });
            mostrarAlertaExito("¡Archivo cargado exitosamente!");
        }).finally(() => {
            setSubiendoArchivo(false);
            e.target.value = null; 
        });
    };

    {/* FUNCION AGREGAR COMENTARIO */}
    const handleAgregarComentario = (e) => {
        e.preventDefault();
        
        if (!nuevoComentario.trim()) return; 

        setGuardandoComentario(true);
        agregarComentario(token, idUsuario, nuevoComentario, facturaActual.id_contrato).then(() => {
            obtenerComentariosDeContrato(token, facturaActual.id_contrato).then((comentariosActualizados) => {
                setComentariosContrato(comentariosActualizados || []);
            });
            mostrarAlertaExito("Comentario guardado exitosamente!");
            setNuevoComentario(""); 
            
        }).finally(() => {
            setGuardandoComentario(false);
        });
    };

    {/* FUNCION ALERTA DE EXITO */}
    const mostrarAlertaExito = (mensaje = "Cambios realizados exitosamente") => {
        setMensajeExito(mensaje);
        setAnimarAlerta(true);

        setTimeout(() => {
            setAnimarAlerta(false);
        }, 3500);

        setTimeout(() => {
            setMensajeExito("");
        }, 5000);
    };


    const formatearMoneda = (valor) => {
        if (!valor) return "0,00"; 
        return Number(valor).toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };
    {/* FUNCIONES FILTROS */}
    const borrarTildes = (texto) => {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };
    
    const filtrarPorBusqueda = (factura) => {
        return borrarTildes(factura.cliente.toLowerCase()).includes(borrarTildes(search.toLowerCase())) || 
               borrarTildes(factura.razon_social.toLowerCase()).includes(borrarTildes(search.toLowerCase())) ||
               String(factura.numero).includes(search);
    }
    
    const filtrarPorEmision = (factura) => {
        return emision === "Todas" || 
              (emision === "Emitidas" && factura.numero) || 
              (emision === "No emitidas" && !factura.numero);
    }
    
    const filtrarPorDeuda = (factura) => {
        return deuda === "Todas" || 
              (deuda === "Pagas" && factura.estado === "PAGADA") ||
              (deuda === "Impagas" && factura.estado === "IMPAGA") ||
              (deuda === "Con deuda" && factura.estado != "PAGADA");
    }

    const filtrarPorEmpresa = (factura) => {
        return empresa === "Cualquiera" ||
              (empresa === "Guiad SA" && factura.empresa === "GUIAD SA") ||
              (empresa === "Adlatam SA" && factura.empresa === "ADLATAM SA")
    }

    const filtrarPorCertificacion = (factura) => {
        return certificacion === "Cualquiera" ||
              (certificacion === "Si" && factura.lleva_certificacion === "SI") ||
              (certificacion === "No" && factura.lleva_certificacion === "NO")
    }

    const facturasFiltradas = facturas && facturas.length > 0 ? 
        facturas.filter((factura) => filtrarPorBusqueda(factura) && filtrarPorEmision(factura) && 
                                     filtrarPorDeuda(factura) && filtrarPorEmpresa(factura) && 
                                     filtrarPorCertificacion(factura)) : [];
    
    {/* FUNCION PREPARAR EXCEL */}
    const handleDescargarExcel = () => {
        const datosParaExcel = facturasFiltradas.map((factura) => ({
            "Periodo":`${String(factura.mes).slice(0, 4)}-${String(factura.mes).slice(4)}`,
            "Cliente": factura.cliente,
            "Id Factura": factura.id,
            "Nº Factura": factura.numero,
            "Fecha de Pago": factura.fecha_pago,
            "Monto Factura": `${formatearMoneda(factura.monto_mensual)}`,
            "Comisión 1": `${formatearMoneda(factura.comision)}`,
            "Comisión 2": `${formatearMoneda(factura.comision2)}`,
            "Porcentaje Comisión 1": factura.porcentaje_comision,
            "Porcentaje Comisión 2": factura.porcentaje_comision2,
            "Comisionista 1": factura.com1,
            "Comisionista 2": factura.com2,
            "Id Contrato": factura.id_contrato,
            "Orden": factura.orden_compra,
            "Inicio Contrato": factura.fecha_inicio,
            "Fin Contrato": factura.fecha_fin,
            "Total Contrato": `${formatearMoneda(factura.monto_mensual * factura.cantidad_facturas)}`,
            "Cant. Facturas/Notas": factura.cantidad_facturas,
            "Razón Social": factura.razon_social,
            "CUIT": factura.cuit,
            "Estado": factura.estado,
            "Empresa": factura.empresa,
            "Enviar a": factura.donde,
            "Paga Sellos": factura.requiere_pago,
            "Lleva Certificación": factura.lleva_certificacion,
            "Generada Como Abierta": factura.abierto,
        }));
        descargarExcel(datosParaExcel, `Facturas (${fechaDesde} - ${fechaHasta})`);
    };

    {/*FUNCION PARA LIMPIAR EL LINK DEL CONTRATO */}
    const limpiarNombreOrden = (url) => {
        if (!url) return "- -";
        const nombreConExtension = url.split('/').pop();
        const nombreLimpio = nombreConExtension.split('.')[0];
        return nombreLimpio.replace(/[-_]/g, ' '); 
    };

    return (
        <div className="content flex-grow-1 crearNotaGlobal h-100">
            <div className='row miPerfilContainer soporteContainer gap-5 pb-0 me-5'>
                <div className='col p-0'>
                    {/* Saludo */}
                    <h3 id="saludo" className='headerTusNotas ml-0'>
                        <i className="icon me-2 icono_tusNotas bi bi-bag-fill" alt="Icono 1" /> Gestiona tus Facturas
                    </h3>
                    <h4 className='infoCuenta'>Gestiona tus Facturas</h4>
                    <div className='abajoDeTusNotas'>
                        En esta sección podrás gestionar las facturas de los contratos de tus clientes.
                    </div>
                </div>
                <div className='row justify-content-end align-items-end gap-3'>
                    <button 
                        id='cargar-factura' 
                        className="btn btn-primary col-2 h-100 w-auto" 
                        title='Cargar factura en contrato abierto'
                        onClick={() => abrirModalFacturaAbierta()}
                        data-bs-toggle="modal" 
                        data-bs-target="#modalCargarFactura"
                        style={{maxWidth: '50px'}}
                    > 
                        <i className='bi bi-file-earmark-arrow-up fs-4' style={{color:'rgb(40, 40, 40)'}}></i> {/* bi-file-earmark-arrow-up / bi-file-earmark-plus / bi-receipt / bi-plus-circle*/}
                    </button>
                    <button 
                        id='descargar-excel' 
                        className='btn col-2 h-100 w-auto' 
                        title="Descargar listado en Excel"
                        onClick={() => handleDescargarExcel()}
                    >
                        <i className="bi bi-filetype-xlsx fs-4 m-0" style={{color:'rgb(41, 40, 40)'}}></i> {/**bi-file-earmark-excel-fill / bi-journal-x / bi-filetype-xlsx*/}
                    </button>
                </div>
            </div>
            
            {/* FILTROS */}
            
            <div className='miPerfilContainer soporteContainer mt-4 mb-3 ms-5 me-5 p-0'>
                <div className='row buscadorNotas d-flex flex-wrap align-items-center justify-content-between mt-3 p-0 w-100'>
                    {/* Buscador cuenta */}
                    <form className='col-2 buscadorNotasForm mt-2 ps-0'>
                        <input
                          className='inputBuscadorNotas pe-0'
                          type="text"
                          title= 'Buscar por cuentas, razón social o N° factura'
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="       Buscar cuenta, razón social o N° factura"
                        />
                    </form>                    
                    {/* Fechas */}
                        <div className='col-3 w-auto d-flex align-items-center gap-2 mt-2 me-4 p-0 text-nowrap'>
                            <span className="vencimiento-desde align-items-center d-flex gap-2" style={{ fontSize: "14px"}}>Vencimiento desde:
                                <input 
                                    type="month" 
                                    value={fechaDesde} 
                                    onChange={(e) => setFechaDesde(e.target.value)} 
                                    style={{ fontSize: "13px", border: "1px solid #ccc", borderRadius: "4px", padding: "2px 5px"}}
                                />
                            </span>
                            <span className="vencimiento-hasta align-items-center d-flex gap-2 ms-5" style={{ fontSize: "14px"}}>Vencimiento hasta:
                              <input 
                                  type="month" 
                                  value={fechaHasta} 
                                  onChange={(e) => setFechaHasta(e.target.value)}
                                  style={{ fontSize: "13px", border: "1px solid #ccc", borderRadius: "4px", padding: "2px 5px"}}
                              />
                            </span>
                        </div>
                    {/* Filtros dropdown */}
                    <div id= 'botones-filtros' className="col-5 d-flex flex-wrap align-items-end justify-content-end gap-2 mt-2 w-auto">
                        <DropdownFiltro
                            className= 'boton-filtro'
                            label= "Emisión"
                            valorActual={emision}
                            opciones= {["Todas", "Emitidas", "No emitidas"]}
                            onChange={setEmision}
                        />
                        <DropdownFiltro 
                            className= 'boton-filtro'
                            label= "Deuda"
                            valorActual={deuda}
                            opciones= {["Todas", "Pagas", "Impagas","Con deuda"]}
                            onChange={setDeuda}
                        />
                        <DropdownFiltro 
                            className= 'boton-filtro'
                            label= "Empresa"
                            valorActual={empresa}
                            opciones= {["Cualquiera", "Adlatam SA", "Guiad SA"]}
                            onChange={setEmpresa}
                        />
                        <DropdownFiltro 
                            className= 'boton-filtro'
                            label= "Certificación"
                            valorActual={certificacion}
                            opciones= {["Cualquiera", "Si", "No"]}
                            onChange={setCertificacion}
                        />
                    </div>

                </div>
            </div>
            {/* Listado de Facturas */}
            <ul className= 'list-group gap-1 mx-5 mb-5'>
                {facturasFiltradas && facturasFiltradas.length > 0 ?(
                    facturasFiltradas.map((factura) => (
                        <li className= {`list-group-item py-3 ${factura.numero ? "border border-2 border-success px-1" : ""}`} key= {factura.id}>
                            <div className="row text-start w-100" style={{ fontSize: "13px" }}>
                                <div className="col">
                                    <strong className="datos-factura d-block"><span>{factura.mes ? `${String(factura.mes).slice(0, 4)}-${String(factura.mes).slice(4)}` : ""}</span></strong>
                                    <strong className="datos-factura d-block mb-2"><span>{factura.cliente}</span></strong>
                                    <strong className="datos-factura d-block">Id Factura: <span className="fw-normal">{factura.id}</span></strong>
                                    <strong className="datos-factura d-block">Nº Factura: <span className="fw-normal">{factura.numero ? factura.numero : "- -"}</span></strong>
                                    <strong className="datos-factura d-block">Monto Factura: <span className="fw-normal">${formatearMoneda(factura.monto_mensual)}</span></strong>
                                    <strong className="datos-factura d-block">Fecha de pago: <span className="fw-normal">{factura.fecha_pago ? factura.fecha_pago : "- -"}</span></strong>
                                    <strong className="datos-factura d-block">Cantidad Facturas/Notas: <span className="fw-normal">{factura.cantidad_facturas}</span></strong>
                                </div>
                                <div className="col mt-5">
                                    <strong className="datos-factura d-block">Id Contrato: <span className="fw-normal">{factura.id_contrato}</span></strong>
                                    <strong className="datos-factura d-block">Orden: 
                                        {factura.orden_compra ? (
                                            <a 
                                                href={factura.orden_compra} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="fw-normal ms-1 text-primary text-decoration-underline"
                                            >
                                                {limpiarNombreOrden(factura.orden_compra)}
                                            </a>
                                        ) : (
                                            <span className="fw-normal ms-1">- -</span>
                                        )}
                                    </strong>
                                    <strong className="datos-factura d-block">Inicio: <span className="fw-normal">{factura.fecha_inicio}</span></strong>
                                    <strong className="datos-factura d-block">Fin: <span className="fw-normal">{factura.fecha_fin}</span></strong>
                                    <strong className="datos-factura d-block">Total Contrato: <span className="fw-normal">${formatearMoneda(factura.monto_mensual * factura.cantidad_facturas)}</span></strong>
                                </div>
                                <div className="col mt-5">
                                    <strong className="datos-factura d-block">Razón Social: <span className="fw-normal">{factura.razon_social}</span></strong>
                                    <strong className="datos-factura d-block">CUIT: <span className="fw-normal">{factura.cuit}</span></strong>
                                    <strong className={`datos-factura d-block ${factura.estado === "PAGADA" ? "border border-2 border-success px-1" : ""}`} style={{ width: "fit-content"}}>
                                        Estado: <span className="fw-normal">{factura.estado}</span></strong>
                                    <strong className="datos-factura d-block">Empresa: <span className="fw-normal">{factura.empresa}</span></strong>
                                </div>
                                <div className="col mt-5">
                                    <strong className="datos-factura d-block">Enviar a: <span className="fw-normal">{factura.donde}</span></strong>
                                    <strong className="datos-factura d-block">Paga Sellos: <span className="fw-normal">{factura.requiere_pago}</span></strong>
                                    <strong className="datos-factura d-block">Lleva Certificación: <span className="fw-normal">{factura.lleva_certificacion}</span></strong>
                                    <strong className="datos-factura d-block">Generada Como Abierta: <span className="fw-normal">{factura.abierto}</span></strong>
                                </div>
                                <div className="col mt-5">
                                    <strong className="datos-factura d-block">Comisión 1: <span className="fw-normal">${formatearMoneda(factura.comision)}</span></strong>
                                    <strong className="datos-factura d-block">Porcentaje Comisión 1: <span className="fw-normal">{formatearMoneda(factura.porcentaje_comision)}</span></strong>
                                    <strong className="datos-factura d-block">Comisionista 1: <span className="fw-normal">{(factura.com1 || "- -")}</span></strong>
                                    <strong className="datos-factura d-block">Comisión 2: <span className="fw-normal">${formatearMoneda(factura.comision2)}</span></strong>
                                    <strong className="datos-factura d-block">Porcentaje Comisión 2: <span className="fw-normal">{formatearMoneda(factura.porcentaje_comision2)}</span></strong>
                                    <strong className="datos-factura d-block">Comisionista 2: <span className="fw-normal">{(factura.com2 || "- -")}</span></strong>

                                </div>
                                {/* BOTONES ACCIONES */}
                                <div className='col-auto d-flex flex-wrap ms-2 mt-3 gap-2 h-auto w-auto p-0' style={{maxWidth: '120px'}}>
                                    {accionesBotones
                                            .filter((boton) => !boton.mostrar || boton.mostrar(factura))
                                            .map((boton, index) => (
                                            <button 
                                                key={index}
                                                className='btn col-2 w-auto' 
                                                type='button'
                                                title={boton.nombre}
                                                onClick={() => boton.accion(factura)}
                                                data-bs-toggle={boton.modalTarget ? "modal" : undefined}
                                                data-bs-target={boton.modalTarget}
                                            >
                                                <i className={`${boton.icono} fs-4 m-0 botones-accion`} style={{color: `${boton.color}`}}></i>   
                                            </button>
                                    ))}

                                </div>

                            </div>
                        </li>
                    ))
                ) : (
                    <li className= 'list-group-item text-center text-muted'> No hay resultados. </li>
                        
                )}
                    
            </ul>
            {/* Modal Editar Factura */}
            <div className="modal fade" id="modalEditarFactura" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">Editar Factura</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body text-start">
                            {facturaActual && (
                                <form key={facturaActual.id} id="form-editar-factura" onSubmit={handleEditFactura}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold" style={{fontSize: '14px'}}>Número</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Número de Factura" 
                                            value={numeroSeleccionado}    
                                            onChange={(e) => setNumeroSeleccionado(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold" style={{fontSize: '14px'}}>Estado</label>
                                        <select 
                                            className="form-select" 
                                            value={estadoSeleccionado} 
                                            onChange={(e) => setEstadoSeleccionado(e.target.value)}
                                        >
                                            <option value="IMPAGA">IMPAGA</option>
                                            <option value="PAGADA">PAGADA</option>
                                            <option value="PAGO PARCIAL">PAGO PARCIAL</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold" style={{fontSize: '14px'}}>Periodo</label>
                                        <input 
                                            type="month" 
                                            className="form-control" 
                                            value={mesSeleccionado}  
                                            onChange={(e) => setMesSeleccionado(e.target.value)}    
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold" style={{fontSize: '14px'}}>Fecha de Pago</label>
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            value={fechaPagoSeleccionada} 
                                            onChange={(e) => setFechaPagoSeleccionada(e.target.value)}
                                            disabled={estadoSeleccionado === "IMPAGA"}
                                            required
                                        />
                                    </div>
                                </form>
                            )}
                        </div>
                        <div className="modal-footer justify-content-end gap-1">
                            <button 
                                type="submit" 
                                form="form-editar-factura"
                                className="btn btn-primary text-white" 
                                style={{backgroundColor: '#0d6efd'}}
                                > Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Cargar Factura Abierta */}
            <div className="modal fade" id="modalCargarFactura" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">Factura</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body text-start">
                            <form id="form-cargar-factura" onSubmit={handleCargarFactura}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold" style={{fontSize: '14px'}}>Contrato Abierto <span className="text-danger">*</span></label>
                                    {cargandoContratos ? (
                                        <SpinnerCarga texto="Cargando contratos abiertos..." />
                                    ) : (
                                        <select 
                                            className="form-select" 
                                            value={contratoSeleccionado} 
                                            onChange={(e) => setContratoSeleccionado(e.target.value)} 
                                            required
                                        >
                                            <option value="" disabled hidden>Seleccione un contrato...</option>
                                            {contratosAbiertos.map((c) => (
                                                <option key={c.id} value={c.id}>{`${c.razon_social} (${c.fecha_inicio} hasta ${c.fecha_fin})`}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold" style={{fontSize: '14px'}}>Número</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        placeholder='Número de Factura'
                                        value={numeroSeleccionado} 
                                        onChange={(e) => setNumeroSeleccionado(e.target.value)} 
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold" style={{fontSize: '14px'}}>Estado <span className="text-danger">*</span></label>
                                    <select 
                                        className="form-select" 
                                        value={estadoSeleccionado} 
                                        onChange={(e) => setEstadoSeleccionado(e.target.value)} 
                                        required
                                    >
                                        <option value="IMPAGA">IMPAGA</option>
                                        <option value="PAGADA">PAGADA</option>
                                        <option value="PAGO PARCIAL">PAGO PARCIAL</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold" style={{fontSize: '14px'}}>Periodo <span className="text-danger">*</span></label>
                                    <input 
                                        type="month" 
                                        className="form-control" 
                                        value={mesSeleccionado} 
                                        onChange={(e) => setMesSeleccionado(e.target.value)} 
                                        required 
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold" style={{fontSize: '14px'}}>Fecha de Pago {estadoSeleccionado === "PAGADA" && <span className="text-danger">*</span>}</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        value={fechaPagoSeleccionada} 
                                        onChange={(e) => setFechaPagoSeleccionada(e.target.value)}
                                        disabled={estadoSeleccionado === "IMPAGA"}
                                        required={estadoSeleccionado === "PAGADA"}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold" style={{fontSize: '14px'}}>Monto</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        placeholder='Monto de la Factura'
                                        value={montoSeleccionado} 
                                        onChange={(e) => setMontoSeleccionado(e.target.value)}
                                    />
                                </div>

                            </form>
                        </div>
                        <div className="modal-footer justify-content-end gap-1">
                            <button 
                                type="submit" 
                                form="form-cargar-factura"
                                className="btn btn-primary text-white" 
                                style={{backgroundColor: '#0d6efd'}}
                            > 
                                GUARDAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Unificar Facturas */}
            <div className="modal fade" id="modalUnificarFacturas" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">Unificar Facturas</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body text-start">
                            <p className="text-muted mb-3" style={{fontSize: '14px'}}>
                                Seleccione las facturas que desea unificar con la factura actual:
                            </p>
                            <form id="form-unificar-factura" onSubmit={handleUnificarFacturas}>
                                <div className="list-group">
                                    {cargandoFacturasEnContrato ? (
                                    <SpinnerCarga texto="Cargando facturas del contrato..." />
                                    ) : (
                                        facturasContrato.length > 0 ? (
                                            facturasContrato.map((f) => (
                                                <label key={f.id} className="list-group-item d-flex gap-3 align-items-center list-group-item-action" style={{cursor: 'pointer'}}>
                                                    <input 
                                                        className="form-check-input flex-shrink-0 mt-0" 
                                                        type="checkbox" 
                                                        value={f.id} 
                                                        checked={facturasAUnificar.includes(f.id)}
                                                        onChange={() => toggleFacturaUnificar(f.id)}
                                                        style={{fontSize: '1.2em', cursor: 'pointer'}}
                                                    />
                                                    <span style={{fontSize: '14px'}}>
                                                        <strong>Periodo:</strong> {f.mes ? `${String(f.mes).slice(0, 4)}-${String(f.mes).slice(4)} - ` : "-"} 
                                                        <strong>Monto:</strong> {`${formatearMoneda(f.monto_mensual)} - `} 
                                                        <strong>Estado:</strong> {f.estado}
                                                    </span>
                                                </label>
                                            ))
                                        ) : (
                                            <div className="text-center text-muted p-4 border rounded">
                                                No hay otras facturas disponibles en este contrato.
                                            </div>
                                        )
                                    )}
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer justify-content-end gap-1">
                            <button 
                                type="submit" 
                                form="form-unificar-factura"
                                className="btn btn-primary text-white" 
                                style={{backgroundColor: '#0d6efd'}}
                                disabled={facturasAUnificar.length === 0 || procesandoUnificacion}
                            > 
                                {procesandoUnificacion 
                                    ? "UNIFICANDO..." 
                                    : `UNIFICAR ${facturasAUnificar.length > 0 ? `(${facturasAUnificar.length})` : ""}`
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Dividir Factura */}
            <div className="modal fade" id="modalDividirFactura" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">Dividir Factura</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body text-start">
                            <form id="form-dividir-factura" onSubmit={handleDividirFactura}>
                                
                                <div className="mb-3">
                                    <label className="form-label fw-bold" style={{fontSize: '14px'}}>Cantidad de facturas a generar <span className="text-danger">*</span></label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        min="2"
                                        value={numeroSeleccionado} 
                                        onChange={(e) => setNumeroSeleccionado(e.target.value)} 
                                        required
                                    />
                                    <div className="form-text" style={{fontSize: '12px'}}>Debe ser mayor a 1.</div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold" style={{fontSize: '14px'}}>Periodo de la primera factura <span className="text-danger">*</span></label>
                                    <input 
                                        type="month" 
                                        className="form-control" 
                                        value={mesSeleccionado} 
                                        onChange={(e) => setMesSeleccionado(e.target.value)} 
                                        required 
                                    />
                                </div>

                            </form>
                        </div>
                        <div className="modal-footer justify-content-end gap-1">
                            <button 
                                type="submit" 
                                form="form-dividir-factura"
                                className="btn btn-primary text-white" 
                                style={{backgroundColor: '#0d6efd'}}
                                disabled={procesandoDivision || !numeroSeleccionado || !mesSeleccionado}
                            > 
                                {procesandoDivision ? "DIVIDIENDO..." : "DIVIDIR"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Archivos del Contrato */}
            <div className="modal fade" id="modalArchivos" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header border-0 pb-0">
                            <h5 className="modal-title">Archivos del Contrato</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body text-center pe-4 ps-0">
                            
                            {cargandoArchivos ? (
                                <SpinnerCarga texto="Buscando archivos..." />
                            ) : archivosContrato && archivosContrato.length > 0 ? (
                                <div className="table-responsive mt-2">
                                    <table className="table table-borderless align-middle text-center mb-0">
                                        <thead>
                                            <tr style={{fontSize: '14px', fontWeight: 'bold'}}>
                                                <th>Archivo</th>
                                                <th>Usuario</th>
                                                <th>Fecha Carga</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{fontSize: '14px'}}>
                                            {archivosContrato.map((archivo) => (
                                                <tr key={archivo.id}>
                                                    <td>
                                                        <a href={`https://panel.serviciosd.com/contratos/${archivo.archivo}`}
                                                            className="text-primary text-decoration-underline" 
                                                            download={archivo.nombre_file} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            style={{cursor: 'pointer'}}
                                                        >
                                                            {archivo.nombre_file}
                                                        </a>
                                                    </td>
                                                    <td>{archivo.usuario}</td>
                                                    <td>{archivo.fecha_carga_formato}</td>
                                                    <td>
                                                        {String(archivo.id_usuario) === String(idUsuario) && (
                                                            <button 
                                                                className="btn btn-link bi bi-trash3-fill m-2 fs-2 text-danger text-primary text-decoration-underline p-0" 
                                                                title="Eliminar archivo"
                                                                onClick={() => handleEliminarArchivo(archivo.id)}
                                                            ></button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center text-muted p-4 border rounded mt-3">
                                    No hay archivos cargados para este contrato.
                                </div>
                            )}

                        </div>
                        {/* FOOTER ARCHIVOS */}
                        <div className="modal-footer border-0 justify-content-center">
                            <input 
                                type="file" 
                                id="input-cargar-archivo" 
                                className="d-none" 
                                onChange={handleSubirArchivo}
                            />
                            <label 
                                htmlFor="input-cargar-archivo" 
                                className={`btn btn-primary px-4 shadow-sm ${subiendoArchivo ? 'disabled' : ''}`}
                                style={{cursor: 'pointer'}}
                            >
                                {subiendoArchivo ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span> Subiendo...</>
                                ) : (
                                    <><i className="bi bi-cloud-arrow-up-fill fs-5"></i> Cargar Archivo</>
                                )}
                            </label>

                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Eliminar Factura */}
            <div className="modal fade" id="modalEliminarFactura" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-sm">
                    <div className="modal-content">
                        <div className="modal-header border-0 pb-0">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body text-center pb-4 pt-0">
                            <i className="bi bi-exclamation-circle text-danger mb-2" style={{fontSize: '3.5rem'}}></i>
                            <h5 className="mt-2 fw-bold">¿Estás seguro de que querés eliminar esta factura?</h5>
                            <p className="text-muted" style={{fontSize: '14px'}}>
                                Vas a eliminar esta factura abierta. Esta acción no se puede deshacer.
                            </p>
                            <div className="d-flex justify-content-center gap-2 mt-4">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" className="btn btn-danger" onClick={handleEliminarFactura}>Sí, eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Comentarios del Contrato*/}
            <div className="modal fade" id="modalComentarios" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header border-0 pb-0">
                            <h5 className="modal-title">Historial de comentarios</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body text-center px-4">
                            
                            {cargandoComentarios ? (
                                <SpinnerCarga texto="Buscando comentarios..." />
                            ) : comentariosContrato && comentariosContrato.length > 0 ? (
                                <div className="table-responsive mt-2">
                                    <table className="table table-borderless align-middle text-center mb-0">
                                        <thead>
                                            <tr style={{fontSize: '14px', fontWeight: 'bold'}}>
                                                <th>Fecha</th>
                                                <th>Usuario</th>
                                                <th>Comentario</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{fontSize: '14px'}}>
                                            {comentariosContrato.map((comentario, index) => (
                                                <tr key={index}>
                                                    <td>{comentario.fecha}</td>
                                                    <td>{comentario.usuario}</td>
                                                    <td>{comentario.comentario}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center text-muted p-4 border rounded mt-3">
                                    No hay comentarios registrados para este contrato.
                                </div>
                            )}

                        </div>
                        {/* FOOTER COMENTARIOS */}
                        <div className="modal-footer border-0 px-4 pb-4 pt-0">
                            <form className="w-100 d-flex align-items-start gap-2" onSubmit={handleAgregarComentario}>
                                <input 
                                    className="form-control mb-2" 
                                    rows="1" 
                                    placeholder="Agregar un comentario nuevo..."
                                    value={nuevoComentario}
                                    onChange={(e) => setNuevoComentario(e.target.value)}
                                    disabled={guardandoComentario}
                                    required
                                ></input>
                                
                                <button 
                                    type="submit" 
                                    className="btn btn-primary px-4 fw-bold" 
                                    disabled={guardandoComentario || !nuevoComentario.trim()}
                                >
                                    {guardandoComentario ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>
                                    ) : (
                                        "Guardar"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {/* Alerta de Éxito */}
            {mensajeExito && (
                <div 
                    className={`alert alert-success position-fixed bottom-0 start-50 translate-middle-x mb-4 shadow fade ${animarAlerta ? 'show' : ''}`} 
                    style={{ zIndex: 1050, transition: "opacity 0.4s ease-out" }}
                    role="alert"
                >
                    <i className="bi bi-check-circle-fill me-2 mb-4"></i>
                    {mensajeExito}
                </div>
            )}
            
        </div>
    )
};

export default Facturas;