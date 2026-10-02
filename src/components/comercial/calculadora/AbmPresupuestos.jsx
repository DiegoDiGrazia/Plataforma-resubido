import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { obtenerPresupuestosPorUser, eliminarPresupuesto } from '../../Apis/presupuestosApi'; 
import { obtenerGeo } from '../../administrador/gestores/apisUsuarios'; 
import { obtenerClientes } from '../../Apis/apis'; 
import { formatearFecha, formatearMoneda, formatearUsd } from '../../../utils/funcionesVarias';
import SelectorCliente from '../../Dashboard/SelectorCliente'; 
import DropdownFiltro from '../DropdownFiltro';
import { ToastContainer } from 'react-toastify';
import { toastExito, toastError } from '../../../utils/toastify/toastify.jsx';
import './AbmPresupuestos.css';

const AbmPresupuestos = ({ onEditar }) => {
    const [presupuestos, setPresupuestos] = useState([]);
    const [geoList, setGeoList] = useState({ paises: [] });
    const [clientesList, setClientesList] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [presupuestoAbierto, setPresupuestoAbierto] = useState(null); 

    const [busqueda, setBusqueda] = useState("");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [filtroUsuario, setFiltroUsuario] = useState("Todos");    
    const [presupuestoAEliminar, setPresupuestoAEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);    
    const TOKEN = useSelector((state) => state.formulario.token);
    const usuario_id = useSelector((state) => state.formulario.usuario?.id || state.formulario.id_usuario);
    const cliente_id = useSelector((state) => state.formulario.id_cliente); 

    useEffect(() => {
        const fetchData = async () => {
          if (!usuario_id) return;
          setCargando(true);
          try {
            const [respuestaTodos, dataGeo, dataClientes] = await Promise.all([
              obtenerPresupuestosPorUser(TOKEN, 0), 
              obtenerGeo(),
              obtenerClientes(TOKEN)
            ]);

            const misPresupuestos = await obtenerPresupuestosPorUser(TOKEN, usuario_id);
            const combinados = [...(misPresupuestos || []), ...(respuestaTodos || [])];
            const presupuestosFinales = Array.from(new Map(combinados.map(p => [p.presupuesto_id, p])).values());

            setPresupuestos(presupuestosFinales);
            setGeoList(dataGeo || { paises: [] });
            setClientesList(dataClientes || []);
          } catch (error) {
            console.error("Error al obtener los datos", error);
          } finally {
            setCargando(false);
          }
        };

        fetchData();

    }, [TOKEN, usuario_id]);

    const handleEliminarPresupuesto = async () => {
        setEliminando(true);
        try {
            await eliminarPresupuesto(TOKEN, presupuestoAEliminar.presupuesto_id);
            toastExito("Presupuesto eliminado correctamente");
            setPresupuestos(prev => prev.filter(p => p.presupuesto_id !== presupuestoAEliminar.presupuesto_id));
            setPresupuestoAEliminar(null);
        } catch (error) {
            toastError("No se pudo eliminar el presupuesto");
        } finally {
            setEliminando(false);
        }
    }

  const toggleAccordion = (id) => {
    setPresupuestoAbierto(prev => (prev === id ? null : id));
  };

  const obtenerNombreCliente = (id) => {
    if (!clientesList.length) return `Cuenta #${id}`;
    const cliente = clientesList.find(c => String(c.id) === String(id));
    return cliente ? cliente.name : `Cuenta #${id}`;
  };

  const obtenerNombresGeo = (pais_id, prov_id, mun_id) => {
    if (!geoList.paises || !pais_id) return 'Alcance General';
    
    let nombres = [];
    const pais = geoList.paises.find(p => String(p.pais_id) === String(pais_id));
    
    if (pais) {
      nombres.push(pais.nombre);
      if (prov_id) {
        const prov = pais.provincias?.find(pr => String(pr.provincia_id) === String(prov_id));
        if (prov) {
          nombres.push(prov.nombre);
          if (mun_id) {
            const mun = prov.municipios?.find(m => String(m.municipio_id) === String(mun_id));
            if (mun) {
              nombres.push(mun.nombre);
            }
          }
        }
      }
    }
    return nombres.length > 0 ? nombres.join(' > ') : 'Alcance General';
  };

  const ordenarProductos = (productos) => {
    if (!productos) return [];
    const ordenRequerido = ["dv360", "Meta", "Youtube", "X", "Search"];
    return [...productos].sort((a, b) => {
      let indexA = ordenRequerido.indexOf(a.producto);
      let indexB = ordenRequerido.indexOf(b.producto);
      indexA = indexA === -1 ? 99 : indexA;
      indexB = indexB === -1 ? 99 : indexB;
      return indexA - indexB;
    });
  };

  // --- LÓGICA DE FILTRADO EN EL FRONTEND ---
  const presupuestosFiltrados = presupuestos.filter((p) => {
    const textoBusqueda = busqueda.toLowerCase();
    const coincideBusqueda = !textoBusqueda || 
        String(p.presupuesto_id).includes(textoBusqueda) || 
        (p.descripcion && p.descripcion.toLowerCase().includes(textoBusqueda));

    const coincideCliente = !cliente_id || cliente_id === '0' || cliente_id === 'Todos' || String(p.cliente_id) === String(cliente_id);

    // NUEVO: Filtro en tiempo real por usuario
    const coincideUsuario = filtroUsuario === "Todos" || String(p.usuario_id) === String(usuario_id);

    let coincideFechas = true;
    if (p.created_at) {
        const fechaCortaP = p.created_at.substring(0, 10); // Toma solo "YYYY-MM-DD"
        if (fechaDesde && fechaCortaP < fechaDesde) coincideFechas = false;
        if (fechaHasta && fechaCortaP > fechaHasta) coincideFechas = false;
    }

    // Agregamos coincideUsuario al return final
    return coincideBusqueda && coincideCliente && coincideFechas && coincideUsuario;
  });

  return (
    <div className="p-4 mt-1 pt-0">

      {/* BARRA DE FILTROS */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-3 filtros-container shadow-sm gap-3">
        
        {/* Buscador */}
        <div className="input-group search-input-container">
            <input
                type="text"
                className="form-control border-end-0"
                placeholder="Buscar ID o nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
            />
            <span className="input-group-text bg-white border-start-0 text-muted">
                <i className="bi bi-search"></i>
            </span>
        </div>

        {/* Filtros de la derecha */}
        <div className="d-flex flex-wrap align-items-center gap-3">
            
            <div className="d-flex align-items-center gap-2">
                <label className="filter-label">Desde:</label>
                <input
                    type="date"
                    className="filter-date-input"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                />
            </div>
            
            <div className="d-flex align-items-center gap-2">
                <label className="filter-label">Hasta:</label>
                <input
                    type="date"
                    className="filter-date-input"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                />
            </div>

            <div className="selector-cliente-container">
                <SelectorCliente incluirTodos={true} editorial={false} />
            </div>

            <div style={{ minWidth: '180px' }}>
                <DropdownFiltro
                    label="Usuario"
                    valorActual={filtroUsuario}
                    opciones={["Todos", "Mis Presupuestos"]}
                    onChange={setFiltroUsuario}
                />
            </div>

        </div>
      </div>

      {/* RESULTADOS */}
      {cargando ? (
        <div className="text-center text-muted my-5">
            <div className="spinner-border spinner-orange mb-2" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p>Cargando presupuestos...</p>
        </div>
      ) : presupuestos.length === 0 ? (
        <div className="text-center text-muted my-5 p-5 border rounded bg-light">
            <i className="bi bi-folder2-open fs-1 mb-3 text-secondary"></i>
            <h5>No hay presupuestos guardados aún</h5>
            <p>Usá la calculadora para crear y guardar tu primer presupuesto.</p>
        </div>
      ) : presupuestosFiltrados.length === 0 ? (
        <div className="text-center text-muted my-5 p-5 border rounded bg-light">
            <i className="bi bi-search fs-1 mb-3 text-secondary"></i>
            <h5>Sin resultados</h5>
            <p>No se encontraron presupuestos que coincidan con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
            {presupuestosFiltrados.map((p) => {
                const isOpen = presupuestoAbierto === p.presupuesto_id;
                const productosOrdenados = ordenarProductos(p.productos);

                let totalAlcance = 0;
                let totalImpresiones = 0;
                let totalCostoMktNota = 0;
                let totalCostoMkt = 0;
                let totalCostoFee = 0;
                let totalPrecioVenta = 0;
                
                let totalCostoMktNotaUsd = 0;
                let totalCostoMktUsd = 0;
                let totalCostoFeeUsd = 0;
                let totalPrecioVentaUsd = 0;

                productosOrdenados.forEach(prod => {
                    totalAlcance += Number(prod.alcance || 0);
                    if (prod.costo_unitario_tipo !== 'CPC') {
                        totalImpresiones += Number(prod.unidades || 0) * 1000;
                    }
                    totalCostoMktNota += Number(prod.costo_x_nota || 0);
                    totalCostoMkt += Number(prod.costo_marketing || 0);
                    totalCostoFee += Number(prod.costo_marketing_fee || 0);
                    totalPrecioVenta += Number(prod.precio_venta || 0);

                    totalCostoMktNotaUsd += Number(prod.costo_x_nota_usd || 0);
                    totalCostoMktUsd += Number(prod.costo_marketing_usd || 0);
                    totalCostoFeeUsd += Number(prod.costo_marketing_fee_usd || 0);
                    totalPrecioVentaUsd += p.valor_usd > 0 ? Number(prod.precio_venta) / Number(p.valor_usd) : 0;
                });

                return (
                <div className="card shadow-sm border-0 rounded-3 hover-panel" key={p.presupuesto_id}>
                    
                    <div className="card-body p-4">
                        <div className="row align-items-center">
                            
                            <div className="col-12 col-xl-3 mb-4 mb-xl-0">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <span className="badge bg-light text-dark border">#{p.presupuesto_id}</span>
                                    <h5 className="fw-bold mb-0 text-truncate text-orange" title={p.descripcion}>
                                        {p.descripcion}
                                    </h5>
                                </div>
                                <div className="text-muted small mb-1">
                                    <i className="bi bi-person me-1"></i> {obtenerNombreCliente(p.cliente_id)}
                                </div>
                                <div className="text-muted small">
                                    <i className="bi bi-calendar3 me-1"></i> Creado {formatearFecha(p.created_at)}
                                </div>
                            </div>

                            <div className="col-12 col-xl-7 mb-4 mb-xl-0">
                                <div className="d-flex flex-wrap justify-content-xl-center gap-3 gap-xl-4 bg-light p-3 rounded">
                                    <div className="text-center">
                                        <span className="metric-label d-block fw-semibold text-muted">Valor USD</span>
                                        <span className="fw-bold fs-5 text-dark">${p.valor_usd}</span>
                                    </div>
                                    <div className="text-center metric-divider ps-md-3">
                                        <span className="metric-label d-block fw-semibold text-muted">Rentabilidad</span>
                                        <span className="fw-bold fs-5">{p.rentabilidad}%</span>
                                    </div>
                                    <div className="text-center metric-divider ps-md-3">
                                        <span className="metric-label d-block fw-semibold text-muted">% Fee</span>
                                        <span className="fw-bold fs-5 text-dark">{p.fee_agencia}%</span>
                                    </div>
                                    <div className="text-center metric-divider ps-md-3">
                                        <span className="metric-label d-block fw-semibold text-muted">Alcance</span>
                                        <span className="fw-bold fs-5 text-dark">{p.usuarios_x_nota}</span>
                                    </div>
                                    <div className="text-center metric-divider ps-md-3">
                                        <span className="metric-label d-block fw-semibold text-muted">Notas</span>
                                        <span className="fw-bold fs-5 text-dark">{p.notas}</span>
                                    </div>
                                </div>
                                
                                <div className="mt-3 text-muted small text-xl-center fw-medium">
                                    <i className="bi bi-geo-alt-fill me-1 text-orange"></i> 
                                    {obtenerNombresGeo(p.pais_id, p.provincia_id, p.municipio_id)}
                                </div>
                            </div>

                            <div className="col-12 col-xl-2 d-flex flex-column justify-content-xl-center gap-2 mb-4">
                                <button 
                                    className="col-12 btn btn-orange btn-sm fw-bold w-100 w-xl-auto"
                                    onClick={() => onEditar(p)}
                                >
                                    <i className="bi bi-pencil-square me-1"></i> Editar Presupuesto
                                </button>
                                <button 
                                    className="col-12 btn btn-danger btn-sm fw-bold w-100 w-xl-auto"
                                    title="Eliminar presupuesto"
                                    onClick={() => setPresupuestoAEliminar(p)}
                                >
                                    <i className="bi bi-trash"></i> Eliminar Presupuesto
                                </button>
                            </div>

                        </div>
                    </div>

                    <div className="border-top">
                        <button 
                            className={`accordion-button-custom py-3 px-4 fw-semibold ${isOpen ? 'open' : ''}`} 
                            onClick={() => toggleAccordion(p.presupuesto_id)}
                        >
                            <span>
                                <i className="bi bi-collection me-2"></i> 
                                Ver detalle por Plataformas ({productosOrdenados.length})
                            </span>
                            <i className="bi bi-chevron-down text-dark"></i>
                        </button>
                        
                        <div className={`react-collapse ${isOpen ? 'show' : ''}`}>
                            <div className="react-collapse-inner">
                                <div className="p-0 bg-white">
                                    {productosOrdenados.length > 0 ? (
                                        <>
                                            {productosOrdenados.map((prod, i) => {
                                                const pvUsd = p.valor_usd > 0 ? Number(prod.precio_venta) / Number(p.valor_usd) : 0;

                                                return (
                                                <div key={i} className="border-bottom p-4">
                                                    <div className="row align-items-center">
                                                        
                                                        <div className="col-12 col-xl-2 mb-3 mb-xl-0">
                                                            <strong className="text-orange d-block fs-5 mb-1">{prod.producto}</strong>
                                                        </div>
                                                        
                                                        <div className="col-12 col-xl-10">
                                                            {prod.costo_unitario_tipo === 'CPC' ? (
                                                                <div className="d-flex text-muted align-items-center w-100 flex-wrap">
                                                                    
                                                                    <div className="text-center px-2 flex-fill d-flex flex-column justify-content-start pt-1">
                                                                        <span className="d-block metric-label fw-semibold text-dark">CPC</span>
                                                                        <span>${prod.costo_unitario_manual}</span>
                                                                    </div>
                                                                    <div className="text-center px-2 flex-fill metric-divider ps-md-3 d-flex flex-column justify-content-start pt-1">
                                                                        <span className="d-block metric-label fw-semibold text-dark">Clics</span>
                                                                        <span>{prod.unidades}</span>
                                                                    </div>
                                                                    <div className="text-center px-2 flex-fill metric-divider ps-md-3 d-flex flex-column justify-content-start pt-1">
                                                                        <span className="d-block metric-label fw-semibold text-dark">% Rentabilidad</span>
                                                                        <span>{prod.rentabilidad_personalizada}%</span>
                                                                    </div>
                                                                    
                                                                    <div className="text-center px-2 flex-fill metric-divider ps-md-3 d-flex flex-column h-100">
                                                                        <div className="pb-2 mb-2 border-bottom">
                                                                            <span className="d-block metric-label fw-semibold text-dark">Costo en pesos</span>
                                                                            <span>{formatearMoneda(prod.costo_marketing)}</span>
                                                                        </div>
                                                                        <div className="mt-auto pt-1">
                                                                            <span className="text-muted opacity-75">{formatearUsd(prod.costo_marketing_usd)}</span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="text-center px-2 flex-fill metric-divider ps-md-3 d-flex flex-column h-100">
                                                                        <div className="pb-2 mb-2 border-bottom">
                                                                            <span className="d-block metric-label fw-semibold text-dark">Costo con Fee</span>
                                                                            <span>{formatearMoneda(prod.costo_marketing_fee)}</span>
                                                                        </div>
                                                                        <div className="mt-auto pt-1">
                                                                            <span className="text-muted opacity-75">{formatearUsd(prod.costo_marketing_fee_usd)}</span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="text-center px-2 flex-fill metric-divider ps-md-3 d-flex flex-column h-100">
                                                                        <div className="pb-2 mb-2 border-bottom">
                                                                            <span className="d-block metric-label fw-bold text-orange">Precio Venta</span>
                                                                            <span className="fw-bold fs-6 text-dark">{formatearMoneda(prod.precio_venta)}</span>
                                                                        </div>
                                                                        <div className="mt-auto pt-1">
                                                                            <span className="text-dark fw-bold">{formatearUsd(pvUsd)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="d-flex text-muted align-items-center w-100 flex-wrap">
                                                                    
                                                                    <div className="text-center px-1 flex-fill d-flex flex-column justify-content-start pt-1">
                                                                        <span className="metric-label fw-semibold text-dark">CPM</span>
                                                                        <span>${prod.costo_unitario_manual}</span>
                                                                    </div>
                                                                    <div className="text-center px-1 flex-fill d-flex flex-column justify-content-start pt-1">
                                                                        <span className="metric-label fw-semibold text-dark">Inversión</span>
                                                                        <span>{prod.porcentaje_inversion * 100}%</span>
                                                                    </div>
                                                                    <div className="text-center px-1 flex-fill metric-divider ps-md-2 d-flex flex-column justify-content-start pt-1">
                                                                        <span className="d-block metric-label fw-semibold text-dark">Alcance</span>
                                                                        <span>{prod.alcance}</span>
                                                                    </div>
                                                                    <div className="text-center px-1 flex-fill metric-divider ps-md-2 d-flex flex-column justify-content-start pt-1">
                                                                        <span className="d-block metric-label fw-semibold text-dark">Frecuencia</span>
                                                                        <span>{prod.factor}</span>
                                                                    </div>
                                                                    <div className="text-center px-1 flex-fill metric-divider ps-md-2 d-flex flex-column justify-content-start pt-1">
                                                                        <span className="d-block metric-label fw-semibold text-dark">Impresiones</span>
                                                                        <span>{prod.unidades * 1000}</span>
                                                                    </div>
                                                                    <div className="text-center px-1 flex-fill metric-divider ps-md-2 d-flex flex-column justify-content-start pt-1">
                                                                        <span className="d-block metric-label fw-semibold text-dark">% Rentab</span>
                                                                        <span>{prod.rentabilidad_personalizada}%</span>
                                                                    </div>
                                                                    
                                                                    <div className="text-center px-1 flex-fill metric-divider ps-md-2 d-flex flex-column h-100">
                                                                        <div className="pb-2 mb-2 border-bottom">
                                                                            <span className="d-block metric-label fw-semibold text-dark">Costo Nota</span>
                                                                            <span>{formatearMoneda(prod.costo_x_nota)}</span>
                                                                        </div>
                                                                        <div className="mt-auto pt-1">
                                                                            <span className="text-muted opacity-75">{formatearUsd(prod.costo_x_nota_usd)}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-center px-1 flex-fill metric-divider ps-md-2 d-flex flex-column h-100">
                                                                        <div className="pb-2 mb-2 border-bottom">
                                                                            <span className="d-block metric-label fw-semibold text-dark">Costo Mkt</span>
                                                                            <span>{formatearMoneda(prod.costo_marketing)}</span>
                                                                        </div>
                                                                        <div className="mt-auto pt-1">
                                                                            <span className="text-muted opacity-75">{formatearUsd(prod.costo_marketing_usd)}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-center px-1 flex-fill metric-divider ps-md-2 d-flex flex-column h-100">
                                                                        <div className="pb-2 mb-2 border-bottom">
                                                                            <span className="d-block metric-label fw-semibold text-dark">Costo c/Fee</span>
                                                                            <span>{formatearMoneda(prod.costo_marketing_fee)}</span>
                                                                        </div>
                                                                        <div className="mt-auto pt-1">
                                                                            <span className="text-muted opacity-75">{formatearUsd(prod.costo_marketing_fee_usd)}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-center px-1 flex-fill metric-divider ps-md-2 d-flex flex-column h-100">
                                                                        <div className="pb-2 mb-2 border-bottom">
                                                                            <span className="d-block metric-label fw-bold text-orange">Precio Venta</span>
                                                                            <span className="fw-bold fs-6 text-dark">{formatearMoneda(prod.precio_venta)}</span>
                                                                        </div>
                                                                        <div className="mt-auto pt-1">
                                                                            <span className="text-dark fw-bold">{formatearUsd(pvUsd)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )})}
                                            
                                            {/* FILA DE TOTALES */}
                                            <div className="bg-light p-4 rounded-bottom">
                                                <div className="row align-items-center">
                                                    <div className="col-12 col-xl-2 mb-3 mb-xl-0">
                                                        <strong className="text-dark d-block fs-5">Totales</strong>
                                                    </div>
                                                    <div className="col-12 col-xl-10">
                                                        <div className="d-flex text-muted align-items-stretch w-100 flex-wrap">
                                                            
                                                            <div className="text-center px-1 flex-fill d-flex flex-column justify-content-start pt-1 opacity-0"><span className="metric-label">CPM</span><span>-</span></div>
                                                            <div className="text-center px-1 flex-fill metric-divider ps-md-2 d-flex flex-column justify-content-start pt-1">
                                                                <span className="d-block metric-label fw-semibold text-dark">Alcance</span>
                                                                <span className="fw-bold text-dark">{totalAlcance}</span>
                                                            </div>
                                                            <div className="text-center px-1 flex-fill metric-divider ps-md-2 d-flex flex-column justify-content-start pt-1 opacity-0"><span className="metric-label">Frec</span><span>-</span></div>
                                                            <div className="text-center px-1 flex-fill metric-divider ps-md-2 d-flex flex-column justify-content-start pt-1">
                                                                <span className="d-block metric-label fw-semibold text-dark">Impresiones</span>
                                                                <span className="fw-bold text-dark">{totalImpresiones}</span>
                                                            </div>
                                                            <div className="text-center px-1 flex-fill metric-divider ps-md-2 d-flex flex-column justify-content-start pt-1 opacity-0"><span className="metric-label">% Rent</span><span>-</span></div>
                                                            
                                                            <div className="text-center px-1 flex-fill metric-divider ps-md-2 d-flex flex-column h-100">
                                                                <div className="pb-2 mb-2 border-bottom">
                                                                    <span className="d-block metric-label fw-semibold text-dark">Costo Nota</span>
                                                                    <span className="fw-bold text-dark">{formatearMoneda(totalCostoMktNota)}</span>
                                                                </div>
                                                                <div className="mt-auto pt-1">
                                                                    <span className="fw-bold text-dark">{formatearUsd(totalCostoMktNotaUsd)}</span>
                                                                </div>
                                                            </div>

                                                            <div className="text-center px-1 flex-fill metric-divider ps-md-2 d-flex flex-column h-100">
                                                                <div className="pb-2 mb-2 border-bottom">
                                                                    <span className="d-block metric-label fw-semibold text-dark">Costo Mkt</span>
                                                                    <span className="fw-bold text-dark">{formatearMoneda(totalCostoMkt)}</span>
                                                                </div>
                                                                <div className="mt-auto pt-1">
                                                                    <span className="fw-bold text-dark">{formatearUsd(totalCostoMktUsd)}</span>
                                                                </div>
                                                            </div>

                                                            <div className="text-center px-1 flex-fill metric-divider ps-md-2 d-flex flex-column h-100">
                                                                <div className="pb-2 mb-2 border-bottom">
                                                                    <span className="d-block metric-label fw-semibold text-dark">Costo c/Fee</span>
                                                                    <span className="fw-bold text-dark">{formatearMoneda(totalCostoFee)}</span>
                                                                </div>
                                                                <div className="mt-auto pt-1">
                                                                    <span className="fw-bold text-dark">{formatearUsd(totalCostoFeeUsd)}</span>
                                                                </div>
                                                            </div>

                                                            <div className="text-center px-1 flex-fill metric-divider ps-md-2 d-flex flex-column h-100">
                                                                <div className="pb-2 mb-2 border-bottom">
                                                                    <span className="d-block metric-label fw-bold text-orange">Precio Venta</span>
                                                                    <span className="fw-bold fs-6 text-dark">{formatearMoneda(totalPrecioVenta)}</span>
                                                                </div>
                                                                <div className="mt-auto pt-1">
                                                                    <span className="fw-bold text-dark">{formatearUsd(totalPrecioVentaUsd)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-muted py-4">Sin plataformas asignadas</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                );
            })}
        </div>
      )}
      {/* FUNCIÓN Y MODAL DE ELIMINAR */}
      {presupuestoAEliminar && (
        <div className="modal fade show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Eliminar Presupuesto
                </h5>
                <button type="button" className="btn-close" onClick={() => setPresupuestoAEliminar(null)} disabled={eliminando}></button>
              </div>
              <div className="modal-body">
                <p className="mb-0 text-muted">
                  ¿Estás seguro de que querés eliminar el presupuesto <strong className="text-dark">#{presupuestoAEliminar.presupuesto_id}</strong>?
                </p>
                <div className="bg-light p-3 rounded mt-3 text-muted small">
                  <span className="d-block mb-1"><strong>Nombre:</strong> {presupuestoAEliminar.descripcion}</span>
                  <span className="d-block"><strong>Cliente:</strong> {obtenerNombreCliente(presupuestoAEliminar.cliente_id)}</span>
                </div>
                <p className="mt-3 mb-0 small text-danger fw-semibold">Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button 
                  className="btn btn-secondary fw-bold" 
                  onClick={() => setPresupuestoAEliminar(null)}
                  disabled={eliminando}
                >
                  Cancelar
                </button>
                <button 
                  className="btn btn-danger fw-bold px-4" 
                  disabled={eliminando}
                  onClick={handleEliminarPresupuesto}
                >
                  {eliminando ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Eliminando...</>
                  ) : (
                    "Sí, eliminar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

    </div>
  );
};

export default AbmPresupuestos;