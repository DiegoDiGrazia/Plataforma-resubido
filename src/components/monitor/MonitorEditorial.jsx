import './MonitorEditorial.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { borrarTildes } from '../../utils/funcionesVarias';
import { obtenerGrupos, obtenerAutores, obtenerClientes, obtenerGruposClientes, crearGrupo, 
         crearAutor, actualizarGrupo, actualizarAutor, eliminarGrupo, eliminarAutor, 
         obtenerMonitor, editarComentarioCliente } from '../Apis/apis.js';
import DropdownFiltro from '../comercial/DropdownFiltro.jsx';

const MonitorEditorial = () => {
    
    const [monitorData, setMonitorData] = useState([]);
    const categorias = useSelector((state) => state.crearNota.categorias);
    const categoriasNombres = categorias.map(c => c.unidad);

    const TOKEN = useSelector((state) => state.formulario.token);
    const [cargandoMonitor, setCargandoMonitor] = useState(false);
    const [loading, setLoading] = useState(false);

    const [grupos, setGrupos] = useState([]);
    const [autores, setAutores] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [clientesRelacionados, setClientesRelacionados] = useState([]);

    const [refreshData, setRefreshData] = useState(false)
    const [activeTab, setActiveTab] = useState('grupos'); 
    const [searchIzq, setSearchIzq] = useState("");
    const [searchDer, setSearchDer] = useState("");
    const [nuevoItem, setNuevoItem] = useState("");

    const [selectedGrupo, setSelectedGrupo] = useState("");
    const [selectedAutor, setSelectedAutor] = useState("");

    // Qué editores están en qué grupo: { grupoId: [editorId1, editorId2] }
    const [relGruposEditores, setRelGruposEditores] = useState({}); 
    // Qué clientes tiene cada editor: { editorId: [clienteId1] }
    const [relEditoresClientes, setRelEditoresClientes] = useState({ });

    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [grupoFiltro, setGrupoFiltro] = useState("");

    // MANEJAN LA APERTURA Y CIERRE DE LOS ACCORDION
    const [editorAbierto, setEditorAbierto] = useState(null);
    const [clienteAbierto, setClienteAbierto] = useState(null);

    // FILTROS
    const [filtroAmplificadas, setFiltroAmplificadas] = useState("Todas");
    const [filtroCategoria, setFiltroCategoria] = useState("Todas");
    const [filtroCrawler, setFiltroCrawler] = useState("Todas");
    const [filtroTag, setFiltroTag] = useState("");
    const [mostrarGeo, setMostrarGeo] = useState(false);

    const toggleEditor = (id) => {
        setEditorAbierto(prev => (prev === id ? null : id));
        setClienteAbierto(null); 
    };

    const toggleCliente = (e, id) => {
        e.preventDefault();
        e.stopPropagation(); 
        setClienteAbierto(prev => (prev === id ? null : id));
    };

    const autoresUnicos = Array.from(new Map((autores || []).map(a => [a.autor, a])).values());
    const clientesUnicos = Array.from(new Map((clientes || []).map(c => [c.name, c])).values());

    const gruposFiltrados = (grupos || []).filter(g => borrarTildes(g.nombre.toLowerCase()).includes(borrarTildes(searchIzq.toLowerCase())));
    const autoresFiltrados = autoresUnicos.filter(a => borrarTildes(a.autor.toLowerCase()).includes(borrarTildes(searchIzq.toLowerCase())));

    const editoresDerecha = autoresUnicos
        .filter(a => borrarTildes((a?.autor || "").toLowerCase()).includes(borrarTildes(searchDer.toLowerCase())))
        .sort((a, b) => (a?.autor || "").localeCompare(b?.autor || ""));

    const clientesDerecha = clientesUnicos
        .filter(c => borrarTildes((c?.name || "").toLowerCase()).includes(borrarTildes(searchDer.toLowerCase())))
        .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
    

    
    useEffect(() => { 
        Promise.all([
            obtenerGrupos(TOKEN),
            obtenerAutores(TOKEN),
            obtenerClientes(TOKEN),
            obtenerGruposClientes(TOKEN)
        ])
        .then(([resGrupos, resAutores, resClientes, resRelaciones]) => {
            setGrupos(resGrupos);
            setAutores(resAutores);
            setClientes(resClientes);
            setClientesRelacionados(resRelaciones);
        })
    }, [TOKEN, refreshData]);

    useEffect(() => { // DEJA MARCADOS LOS CHECKBOXES CORRESPONDIENTES EN EL MODAL 
        if (autores && autores.length > 0) {
            let mapeoGrupos = {};
            autores.forEach(a => {
                if (a.id_grupo) {
                    if (!mapeoGrupos[a.id_grupo]) mapeoGrupos[a.id_grupo] = [];
                    if (!mapeoGrupos[a.id_grupo].includes(a.autor)) {
                        mapeoGrupos[a.id_grupo].push(a.autor);
                    }
                }
            });
            setRelGruposEditores(mapeoGrupos);
        }

        if (clientesRelacionados && clientesRelacionados.length > 0 && autores && autores.length > 0) {
            let mapeoClientes = {};
            clientesRelacionados.forEach(rel => {
                const autorObj = autores.find(a => a.id === rel.id_autores_grupo);
                if (autorObj && rel.cliente) {
                    const nombreAutor = autorObj.autor;
                    if (!mapeoClientes[nombreAutor]) mapeoClientes[nombreAutor] = [];
                    if (!mapeoClientes[nombreAutor].includes(rel.cliente)) {
                        mapeoClientes[nombreAutor].push(rel.cliente);
                    }
                }
            });
            setRelEditoresClientes(mapeoClientes);
        }
    }, [autores, clientesRelacionados]);
    
    useEffect(() => { // Busca los datos del monitor según los filtros de fecha y grupo
        if (!fechaDesde || !fechaHasta || !grupoFiltro) return;

        const grupoSeleccionado = grupos.find(g => g.nombre === grupoFiltro);
        if (!grupoSeleccionado) return;

        const nombresAutores = relGruposEditores[grupoSeleccionado.id] || [];
        const clientesSet = new Set();
        
        nombresAutores.forEach(nombreEditor => {
            const clientesDelEditorNombres = relEditoresClientes[nombreEditor] || [];
            clientesDelEditorNombres.forEach(nombreCliente => clientesSet.add(nombreCliente));
        });
        
        const clientesNombresFiltrados = Array.from(clientesSet);
        
        const clientesIDFiltrados = clientesNombresFiltrados.map(nombre => {
            const c = clientes.find(c => c.name === nombre);
            return c ? c.id : null;
        }).filter(Boolean);

        if (clientesIDFiltrados.length === 0 && nombresAutores.length === 0) {
            setMonitorData([]);
            return;
        }

        setCargandoMonitor(true);

        obtenerMonitor(TOKEN, clientesIDFiltrados, nombresAutores, fechaDesde, fechaHasta)
            .then((res) => {
                const notasConCliente = res.notas_con_cliente || [];
                const notasSinCliente = res.notas_sin_cliente || [];

                const dataEstructurada = nombresAutores.map(nombreEditor => {
                    const clientesDelEditorNombres = relEditoresClientes[nombreEditor] || [];
                    
                    let clientesCruzados = clientesDelEditorNombres.map(nombreCliente => {
                        const clienteLocal = clientes.find(c => c.name === nombreCliente);
                        if (!clienteLocal) return null;
                        
                        const idCliente = clienteLocal.id;
                        const dataApi = notasConCliente.find(c => c.id_cliente === idCliente);
                        if (!dataApi) return null;

                        const notasDelEditor = (dataApi.notas || []).filter(n => n.autor_cliente === nombreEditor);

                        return {
                            id_cliente: idCliente,
                            nombre_cliente: nombreCliente,
                            objetivo_contrato: dataApi.objetivo_contrato || 0,
                            comentario: dataApi.comentarios || clienteLocal.comentarios || "",
                            notas: notasDelEditor 
                        };
                    }).filter(Boolean);

                    if (mostrarGeo) {
                        const notasGeoEditor = notasSinCliente.filter(n => n.autor_cliente === nombreEditor);
                        const geoGroups = {};

                        notasGeoEditor.forEach(nota => {
                            let geoKey = "sin-ubicacion";
                            let geoName = "Sin ubicación";

                            if (nota.municipio) {
                                geoKey = `mun-${nota.municipio}-${nota.provincia}`;
                                geoName = `${nota.municipio}, ${nota.provincia}`;
                            } else if (nota.provincia) {
                                geoKey = `prov-${nota.provincia}-${nota.pais}`;
                                geoName = `${nota.provincia}, ${nota.pais}`;
                            } else if (nota.pais) {
                                geoKey = `pais-${nota.pais}`;
                                geoName = nota.pais;
                            }

                            if (!geoGroups[geoKey]) {
                                geoGroups[geoKey] = {
                                    id_cliente: `geo-${geoKey}`,
                                    nombre_cliente: `📌 ${geoName}`,
                                    objetivo_contrato: 0,
                                    notas: []
                                };
                            }
                            geoGroups[geoKey].notas.push(nota);
                        });

                        clientesCruzados = [...clientesCruzados, ...Object.values(geoGroups)];
                    }

                    return {
                        id_editor: nombreEditor,
                        nombre_editor: nombreEditor,
                        clientes: clientesCruzados
                    };
                }).filter(editor => editor.clientes.length > 0);

                setMonitorData(dataEstructurada);
            })
            .catch(error => console.error("Error obteniendo el monitor:", error))
            .finally(() => setCargandoMonitor(false));

    }, [fechaDesde, fechaHasta, grupoFiltro, grupos, autores, clientes, relGruposEditores, relEditoresClientes, TOKEN, mostrarGeo]);

    const obtenerNombresCategorias = (idsCategorias) => {
        if (!idsCategorias || !Array.isArray(idsCategorias) || idsCategorias.length === 0) {
            return "Sin categoría";
        }
        
        const nombres = idsCategorias.map(id => {
            const categoriaEncontrada = categorias.find(c => String(c.id) === String(id));
            return categoriaEncontrada ? categoriaEncontrada.unidad : `Cat #${id}`;
        });

        return nombres.join(", ");
    };

    const renderizarTags = (tags) => {
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            return <span className="text-muted fst-italic" style={{ fontSize: '0.85rem' }}>Sin tags</span>;
        }

        return tags.map((tag, index) => (
            <span key={index} className="badge bg-light text-secondary border fw-normal shadow-sm">
                {tag}
            </span>
        ));
    };

    const toggleCheckbox = (idPadre, idHijo, setEstadoRelacion) => {
        setEstadoRelacion(prev => {
            const hijosActuales = prev[idPadre] || [];
            const nuevosHijos = hijosActuales.includes(idHijo)
                ? hijosActuales.filter(id => id !== idHijo)
                : [...hijosActuales, idHijo];
            return { ...prev, [idPadre]: nuevosHijos };
        });
    };

    const handleAgregarGrupo = () => {
        if (!nuevoItem.trim()) return;

        setLoading(true);

        crearGrupo(TOKEN, nuevoItem).then(() => {
            setNuevoItem("");
            setRefreshData(prev => !prev);
        })
        .catch(error => {
            console.error(error);
            setLoading(false);
        })
        .finally(() => {
            setLoading(false);
        })
    };

    const handleAgregarEditor = () => {
        if (!nuevoItem.trim()) return;

        setLoading(true);

        crearAutor(TOKEN, nuevoItem, null).then(() => {
            setNuevoItem("");
            setRefreshData(prev => !prev);
        })
        .catch(error => {
            console.error(error);
            setLoading(false);
        })
        .finally(() => {
            setLoading(false);
        })
    };

    const handleEliminarGrupo = () => {
        const confirmacion = window.confirm(`¿Estás seguro de que querés eliminar el grupo "${selectedGrupo.nombre}"?`);
        if (!confirmacion) return;

        setLoading(true);

        eliminarGrupo(TOKEN, selectedGrupo.id).then(() => {
            setSelectedGrupo('');
            setRefreshData(prev => !prev);
        })
        .catch(error => {
            console.error(error);
            setLoading(false);
        })
        .finally(() => {
            setLoading(false);
        })
    }

    const handleEliminarAutor = () => {
        const confirmacion = window.confirm(`¿Estás seguro de que querés eliminar al editor "${selectedAutor.autor}"?`);
        if (!confirmacion) return;

        setLoading(true);

        eliminarAutor(TOKEN, selectedAutor.id).then(() => {
            setSelectedAutor('');
            setRefreshData(prev => !prev);
        })
        .catch(error => {
            console.error(error);
            setLoading(false);
        })
        .finally(() => {
            setLoading(false);
        })
    }

    const handleEditarGrupo = () => {
        if (!selectedGrupo) return;
        setLoading(true);

        const autoresNombres = relGruposEditores[selectedGrupo.id] || [];
        
        actualizarGrupo(TOKEN, selectedGrupo.id, autoresNombres)
            .then(() => {
                setRefreshData(prev => !prev); 
            })
            .catch(error => {
                console.error("Error al actualizar el grupo:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleEditarAutor = () => {
        if (!selectedAutor) return;
        setLoading(true);

        const clientesStrings = relEditoresClientes[selectedAutor.autor] || [];

        const idsDelAutor = autores.filter(a => a.autor === selectedAutor.autor).map(a => a.id);
        
        const promesas = idsDelAutor.map(id => actualizarAutor(TOKEN, id, clientesStrings));

        Promise.all(promesas)
            .then(() => {
                setRefreshData(prev => !prev);
            })
            .catch(error => {
                console.error("Error al actualizar el editor:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleEditarComentario = (id_cliente, comentario) => {
        editarComentarioCliente(TOKEN, id_cliente, comentario).then(() => setRefreshData(prev => !prev));
    };

    const filtroPorAmplificacion = (nota) => {
        return filtroAmplificadas === "Todas" ||
              (filtroAmplificadas === "Amplificadas" && nota.con_distribucion === 1) ||
              (filtroAmplificadas === "No Amplificadas" && nota.con_distribucion === 0);
    }

    const filtroPorCategoria = (nota) => {
        if (filtroCategoria === "Todas") return true;
        
        const catElegida = categorias.find(c => c.unidad === filtroCategoria);
        if (!catElegida) return true;

        return nota.categoria && nota.categoria.some(id => String(id) === String(catElegida.id));
    }

    const filtroPorCrawler = (nota) => {
        return filtroCrawler === "Todas" || 
              (filtroCrawler === "Con Crawler" && nota.es_ia === 1) ||
              (filtroCrawler === "Sin Crawler" && nota.es_ia === 0);
    }

    const filtroPorTag = (nota) => {
        if (!filtroTag.trim()) return true;
        return nota.tags && nota.tags.some(tag => tag.toLowerCase().includes(filtroTag.toLowerCase()));
    };

    const monitorFiltrado = monitorData.map(editor => {
        const clientesConNotasFiltradas = editor.clientes.map(cliente => ({
            ...cliente,
            notas: cliente.notas.filter(nota => 
                filtroPorAmplificacion(nota) && 
                filtroPorCategoria(nota) &&
                filtroPorCrawler(nota) &&
                filtroPorTag(nota)
            )
        }));

        return {
            ...editor,
            clientes: clientesConNotasFiltradas.filter(cliente => cliente.notas.length > 0)
        };
    }).filter(editor => editor.clientes.length > 0);

    // RESUMEN ENTRE FILTROS Y MONITOR

    let totalNotas = 0;
    let totalAmplificadas = 0;
    let totalCrawler = 0;

    monitorFiltrado.forEach(editor => {
        editor.clientes.forEach(cliente => {
            totalNotas += cliente.notas.length;
            totalAmplificadas += cliente.notas.filter(n => n.con_distribucion === 1).length;
            totalCrawler += cliente.notas.filter(n => n.es_ia === 1).length;
        });
    });

    const formatearFecha = (fecha) => fecha ? fecha.split('-').reverse().join('/') : '';

    return (
        <div className="contenedor-monitorEditorial content flex-grow-1 crearNotaGlobal h-100">
            <div className='row miPerfilContainer soporteContainer gap-5 pb-0 me-5'>
                <div className='col p-0'>
                    <h3 id="saludo" className='headerTusNotas ml-0'>
                        <i className="icon me-2 icono_tusNotas bi bi-display-fill" /> Monitor Contenido
                    </h3>
                    <h4 className='infoCuenta'>Monitoreá el contenido publicado</h4>
                    <div className='abajoDeTusNotas'>
                        En esta sección podrás monitorear el contenido diario del área Editorial, repartido en grupos de editores y cuentas.
                    </div>
                </div>
            </div>
            
            <div className='d-flex justify-content-between mx-5 mt-5' id='filtros-container'>
                <div className='d-flex align-items-center gap-1'>
                    <div id="input-buscar-tag" className="input-group">
                        <input 
                            type="text" 
                            className="form-control border-end-0 pe-0" 
                            id='input-tag'
                            placeholder='Buscar tag...'
                            value={filtroTag}
                            onChange={(e) => setFiltroTag(e.target.value)}
                        />
                        <span className="input-group-text bg-white border-start-0 text-muted" id='buscador-icon'>
                            <i className="bi bi-search"></i>
                        </span>
                    </div>
                    <div className='d-flex gap-1 bg-secondary text-white rounded p-2' id='input-fechas-container'>
                        <label className='label-filtro-fecha'>Fecha Desde:</label>
                        <input 
                            className='input-fecha-custom' 
                            type="date" 
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                        />
                    </div>
                    <div className='d-flex gap-1 bg-secondary text-light rounded p-2' id='input-fechas-container'>
                        <label className='label-filtro-fecha'>Fecha Hasta:</label>
                        <input 
                            className='input-fecha-custom' 
                            type="date" 
                            value={fechaHasta}
                            onChange={(e) => setFechaHasta(e.target.value)}
                        />
                    </div>
                    <DropdownFiltro
                        className='boton-filtro'
                        label= "Grupo"
                        valorActual={grupoFiltro ? grupoFiltro : "Seleccionar..."}
                        opciones={gruposFiltrados.map(g => g.nombre )}
                        onChange={setGrupoFiltro}
                        mostrarBuscador={true}
                    />

                    <DropdownFiltro
                        className='boton-filtro'
                        label= "Amplificación"
                        valorActual={filtroAmplificadas}
                        opciones={["Todas", "Amplificadas", "No Amplificadas"]}
                        onChange={setFiltroAmplificadas}
                    />
                    <DropdownFiltro
                        className='boton-filtro'
                        label= "Categoría"
                        valorActual={filtroCategoria}
                        opciones={["Todas", ...categoriasNombres]}
                        onChange={setFiltroCategoria}
                        mostrarBuscador={true}
                    />
                    <DropdownFiltro
                        className='boton-filtro'
                        label= "Crawler"
                        valorActual={filtroCrawler}
                        opciones={["Todas", "Con Crawler", "Sin Crawler"]}
                        onChange={setFiltroCrawler}
                    />
                    <div className='d-flex gap-1 bg-secondary text-white rounded p-2 align-items-center justify-content-center' id='switch-geo-container'>
                        <div className="form-check form-switch p-0 mb-0 d-flex align-items-center gap-2">
                            <input 
                                className="form-check-input m-0 p-0" 
                                type="checkbox" 
                                role="switch" 
                                id="switchGeo" 
                                checked={mostrarGeo}
                                onChange={(e) => setMostrarGeo(e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                            <label className="form-check-label label-filtro-fecha mb-0" htmlFor="switchGeo" style={{ cursor: 'pointer' }}>
                                Incluir Geos
                            </label>
                        </div>
                    </div>
                </div>
                
                <button 
                    className='btn bg-secondary' 
                    id='boton-gestion'
                    data-bs-toggle="modal" 
                    data-bs-target="#modalGestionABM"
                >
                    <i className='bi bi-gear-fill text-light fs-5'></i>
                </button>
            </div>

            <div className="mt-5 mx-5 mb-4">
                {cargandoMonitor ? (
                    
                    /* Pantalla de carga */
                    <div className="text-center text-muted py-5 mt-5 bg-light rounded border shadow-sm">
                        <div className="spinner-border text-brand mb-3" style={{width: '3rem', height: '3rem'}} role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <h5 className="fw-bold text-secondary">Cargando monitor...</h5>
                        <p className="mb-0">Obteniendo y procesando las notas...</p>
                    </div>

                ) : (!fechaDesde || !fechaHasta || !grupoFiltro) ? (
                    
                    // Pantalla de inicio
                        <div className="text-center text-muted py-5 mt-5 bg-light rounded border shadow-sm">
                            <i className="bi bi-display-fill fs-1 text-secondary mb-2 d-block"></i>
                            <h5 className="fw-bold text-secondary">Monitor de Contenido</h5>
                            <p className="mb-0">Seleccioná una <strong>fecha desde</strong>, <strong>fecha hasta</strong> y un <strong>grupo</strong> para cargar el monitor.</p>
                        </div>

                ) : monitorFiltrado.length === 0 ? (

                    // Pantalla sin resultados
                    <div className="text-center text-muted py-5 mt-5 bg-light rounded border shadow-sm">
                        <i className="bi bi-search fs-1 text-secondary mb-2 d-block"></i>
                        <h5 className="fw-bold text-secondary">Sin resultados</h5>
                        <p className="mb-0">No se encontraron notas para estos autores con los filtros actuales.<br/>Intentá cambiar las fechas o modificar los filtros de búsqueda.</p>
                    </div>

                ) : (
                    // HEADER RESUMEN MONITOR
                    <>
                        <div className="resumen-monitor mb-4 border shadow-sm">
                            <div>
                                <div className="dato-resumen border-end pe-4">
                                    <span className="label">Período</span>
                                    <span className="valor text-brand">{formatearFecha(fechaDesde)} - {formatearFecha(fechaHasta)}</span>
                                </div>
                            </div>
                            <div className="d-flex flex-row">
                                <div className="dato-resumen border-end pe-4 ps-2">
                                    <span className="label">Total Notas</span>
                                    <span className="valor">{totalNotas}</span>
                                </div>
                                <div className="dato-resumen border-end pe-4 ps-2">
                                    <span className="label">Amplificadas</span>
                                    <span className="valor">{totalAmplificadas}</span>
                                </div>
                                <div className="dato-resumen ps-2">
                                    <span className="label">Con Crawler</span>
                                    <span className="valor">{totalCrawler}</span>
                                </div>
                            </div>
                        </div>
                    
                        {/* ACCORDION PRINCIPAL: AUTORES */}
                        <div className="accordion">
                            {monitorFiltrado.map((editor, indexEditor) => { 
                                const isOpenEditor = editorAbierto === indexEditor;

                                return (
                                    <div className="accordion-item mb-3 border-0 shadow-sm rounded" key={`editor-${indexEditor}`}>

                                        <h2 className="accordion-header ms-3">
                                            <button 
                                                className={`accordion-button bg-light fw-bold text-dark rounded ${isOpenEditor ? '' : 'collapsed'}`} 
                                                type="button" 
                                                onClick={() => toggleEditor(indexEditor)}
                                            >
                                                <i className="bi bi-person-fill text-brand me-2 fs-4"></i>
                                                {editor.nombre_editor}
                                            </button>
                                        </h2>

                                        <div className={`react-collapse ${isOpenEditor ? 'show' : ''}`}>
                                            <div className="react-collapse-inner">
                                                <div className="accordion-body p-3 bg-white">

                                                    {/* ACORDEÓN SECUNDARIO: CLIENTES/GEOS */}
                                                    <div className="accordion">
                                                        {editor.clientes.map((cliente, indexCliente) => {
                                                            const notasTotales = cliente.notas.length;
                                                            const notasAmpli = cliente.notas.filter(n => n.con_distribucion === 1).length;
                                                            const idCliente = `${indexEditor}-${indexCliente}`; 
                                                            const isOpenCliente = clienteAbierto === idCliente;
                                                            const esGeo = String(cliente.id_cliente).startsWith('geo-');

                                                            return (
                                                                <div className="accordion-item border mb-2 rounded" key={`cliente-${idCliente}`}>
                                                                    {/* HEADER */}
                                                                    <h2 className="accordion-header mt-0">
                                                                        <button 
                                                                            className={`accordion-button py-3 ${isOpenCliente ? '' : 'collapsed'}`} 
                                                                            type="button" 
                                                                            onClick={(e) => toggleCliente(e, idCliente)}
                                                                        >
                                                                            <div className="d-flex justify-content-between w-100 me-4 align-items-center flex-wrap gap-2">

                                                                                <div className="d-flex flex-column ms-4 text-start contenedor-info-cliente">
                                                                                    <div className="d-flex align-items-center gap-2">
                                                                                        <span className="fw-bold fs-6 text-secondary">{cliente.nombre_cliente}</span>
                                                                                        {!esGeo && (
                                                                                        <span 
                                                                                            className="badge bg-light border text-secondary shadow-sm p-2 btn-editar-comentario" 
                                                                                            title="Editar comentario"
                                                                                            data-bs-toggle="modal" 
                                                                                            data-bs-target={`#modalComentario-${cliente.id_cliente}`}
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                            style={{ cursor: 'pointer' }}
                                                                                        >
                                                                                            <i className="bi bi-chat-text-fill text-brand"></i>
                                                                                        </span>
                                                                                        )}
                                                                                    </div>
                                                                                    {!esGeo && (
                                                                                        cliente.comentario ? (
                                                                                            <span className="text-muted mt-1 fw-normal texto-comentario" style={{ fontSize: '0.85rem' }}>
                                                                                                <i className="bi bi-chat-text-fill text-brand me-1"></i>
                                                                                                {cliente.comentario}
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className="text-muted mt-1 fw-normal opacity-50 texto-comentario-vacio" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                                                                                                Sin comentario...
                                                                                            </span>
                                                                                        )
                                                                                    )}
                                                                                </div>

                                                                                <div className="d-flex gap-4 small text-muted bg-light px-3 py-1 rounded border">
                                                                                    <span><i className="bi bi-file-earmark-text me-1 text-secondary"></i>Totales: <strong className="text-dark">{notasTotales}</strong></span>
                                                                                    <span><i className="bi bi-megaphone me-1 text-brand"></i>Amplificadas: <strong className="text-dark">{notasAmpli}</strong></span>
                                                                                    <span><i className="bi bi-bullseye me-1 text-secondary"></i>Objetivo: <strong className="text-dark">{cliente.objetivo_contrato}</strong></span>
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    </h2>
                                                                                
                                                                    <div className={`react-collapse ${isOpenCliente ? 'show' : ''}`}>
                                                                        <div className="react-collapse-inner">
                                                                            <div className="accordion-body p-0">
                                                                                
                                                                                {/* LISTADO DE NOTAS */}
                                                                                <ul className="list-group list-group-flush">
                                                                                    {cliente.notas.map((nota, indexNota) => (
                                                                                        <li className="list-group-item d-flex justify-content-between align-items-center py-3 px-4 bg-light bg-opacity-50 border-bottom" key={`nota-${nota.term_id}-${indexEditor}-${indexCliente}-${indexNota}`}>
                                                                                            <div className="info-nota-container text-secondary">
                                                                                                <div className="dato-nota">
                                                                                                    <span className="label">ID</span>
                                                                                                    <span className="valor fw-bold">{nota.term_id}</span>
                                                                                                </div>

                                                                                                <div className="dato-nota">
                                                                                                    <span className="label">Autor</span>
                                                                                                    <span className="valor">{nota.autor_cliente}</span>
                                                                                                </div>

                                                                                                <div className="dato-nota">
                                                                                                    <span className="label">Publicación</span>
                                                                                                    <span className="valor">{formatearFecha(nota.fecha_publicacion) || "-"}</span>
                                                                                                </div>

                                                                                                <div className="dato-nota">
                                                                                                    <span className="label">Distribución</span>
                                                                                                    <span className="valor">
                                                                                                        {nota.con_distribucion === 1 ? (
                                                                                                            <span className="badge bg-brand px-2 py-1">Amplificada</span>
                                                                                                        ) : (
                                                                                                            <span className="badge bg-secondary px-2 py-1">Normal</span>
                                                                                                        )}
                                                                                                    </span>
                                                                                                </div>

                                                                                                <div className="dato-nota">
                                                                                                    <span className="label">Crawler</span>
                                                                                                    <span className="valor">
                                                                                                        {nota.es_ia === 1 ? (
                                                                                                            <span className="badge bg-brand px-2 py-1">Con Crawler</span>
                                                                                                        ) : (
                                                                                                            <span className="badge bg-secondary px-2 py-1">Sin Crawler</span>
                                                                                                        )}
                                                                                                    </span>
                                                                                                </div>
                                                                                                    
                                                                                                <div className="dato-nota" style={{ maxWidth: '250px' }}>
                                                                                                    <span className="label">Categoría</span>
                                                                                                    <span className="valor">
                                                                                                        <span className="badge bg-brand px-2 py-1">
                                                                                                            {obtenerNombresCategorias(nota.categoria)}
                                                                                                        </span>
                                                                                                    </span>
                                                                                                </div>
                                                                                                    
                                                                                                <div className="dato-nota" style={{ maxWidth: '300px' }}>
                                                                                                    <span className="label">Tags</span>
                                                                                                    <span className="valor tags-container">
                                                                                                        {renderizarTags(nota.tags)}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </div>
                                                                                                    
                                                                                            {/* BOTONES */}
                                                                                            <div className="d-flex gap-2">
                                                                                                <a 
                                                                                                    href={`http://noticiasd.com/nota/${nota.term_id}`} 
                                                                                                    title="Ver nota" 
                                                                                                    target="_blank" 
                                                                                                    rel="noopener noreferrer" 
                                                                                                    className="btn btn-light border shadow-sm"
                                                                                                >
                                                                                                    <i className="bi bi-eye-fill fs-5 text-secondary"></i>
                                                                                                </a>
                                                                                                {nota.con_distribucion === 1 && (
                                                                                                <Link 
                                                                                                    to={`/verNota`} 
                                                                                                    state={{ id: nota.term_id, notaABM: nota }} 
                                                                                                    title="Gráfico de Interacciones" 
                                                                                                    className="btn btn-light border shadow-sm"
                                                                                                >
                                                                                                    <i className="bi bi-bar-chart-line-fill fs-5 text-brand"></i>
                                                                                                </Link>
                                                                                                )}
                                                                                            </div>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                                
                                                                                {/* MODAL EDITAR COMENTARIO */}
                                                                                <div className="modal fade" id={`modalComentario-${cliente.id_cliente}`} tabIndex="-1" aria-hidden="true">
                                                                                    <div className="modal-dialog modal-dialog-centered">
                                                                                        <div className="modal-content">
                                                                                            <div className="modal-header border-0 mb-0 pb-0">
                                                                                                <h5 className="modal-title fw-bold text-secondary">
                                                                                                    Comentario: <span className="text-brand">{cliente.nombre_cliente}</span>
                                                                                                </h5>
                                                                                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                                                            </div>
                                                                                            <div className="modal-body">
                                                                                                <textarea 
                                                                                                    id={`textarea-comentario-${cliente.id_cliente}`}
                                                                                                    className="form-control bg-light border text-secondary" 
                                                                                                    rows="4" 
                                                                                                    placeholder="Escribí un comentario sobre este cliente..."
                                                                                                    defaultValue={cliente.comentario || ''}
                                                                                                    style={{ resize: 'none' }}
                                                                                                ></textarea>
                                                                                            </div>
                                                                                            <div className="modal-footer border-0 pt-0">
                                                                                                <button type="button" className="btn btn-secondary fw-bold" data-bs-dismiss="modal">Cancelar</button>
                                                                                                <button 
                                                                                                    type="button" 
                                                                                                    className="btn btn-brand fw-bold" 
                                                                                                    data-bs-dismiss="modal"
                                                                                                    onClick={() => {
                                                                                                        const texto = document.getElementById(`textarea-comentario-${cliente.id_cliente}`).value;
                                                                                                        handleEditarComentario(cliente.id_cliente, texto);
                                                                                                    }}
                                                                                                >
                                                                                                    Guardar Comentario
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>


            {/* MODAL GESTIONAR GRUPOS */}
            <div className="modal fade" id="modalGestionABM" tabIndex="-1" aria-labelledby="modalGestionABMLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content">
                        
                        <div className="modal-header border-0 mb-3 pb-0">
                            <h5 className="modal-title fw-bold" id="modalGestionABMLabel">Gestión de Grupos y Editores</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="modal-body border-top p-0">
                            
                            <ul className="nav nav-tabs px-3 pt-3 bg-light">
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'grupos' ? 'active-brand-tab' : ''}`}
                                        onClick={() => { setActiveTab('grupos'); setSearchIzq(""); setSearchDer("")}}
                                    >
                                        Grupos
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'editores' ? 'active-brand-tab' : ''}`}
                                        onClick={() => { setActiveTab('editores'); setSearchIzq(""); setSearchDer("")}}
                                    >
                                        Editores
                                    </button>
                                </li>
                            </ul>

                            <div className="row p-4">
                                {/* COLUMNA IZQUIERDA */}
                                <div className="col-md-4 border-end">
                                    
                                    <div className="input-group mb-2">
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder={`Nuevo ${activeTab === 'grupos' ? 'grupo' : 'editor'}...`}
                                            value={nuevoItem}
                                            onChange={(e) => setNuevoItem(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !loading) {
                                                    activeTab === 'grupos' ? handleAgregarGrupo() : handleAgregarEditor();
                                                }
                                            }}
                                        />
                                        <button className="btn btn-brand fw-bold fs-5 px-3 py-0" onClick={activeTab === 'grupos' ? handleAgregarGrupo : handleAgregarEditor} disabled={loading}>+</button>
                                    </div>

                                    <div className="input-group mb-2">
                                        <input 
                                            type="text" 
                                            className="form-control border-end-0" 
                                            placeholder={`Buscar ${activeTab === 'grupos' ? 'grupo' : 'editor'}...`}
                                            value={searchIzq}
                                            onChange={(e) => setSearchIzq(e.target.value)}
                                        />
                                        <span className="input-group-text bg-white border-start-0 text-muted">
                                            <i className="bi bi-search"></i>
                                        </span>
                                    </div>

                                    {/* Listado */}
                                    <div className="list-group lista-izquierda-abm">
                                        {activeTab === 'grupos' ? (
                                            gruposFiltrados.map(grupo => (
                                                <button 
                                                    key={grupo.id}
                                                    className={`list-group-item list-group-item-action text-start ${selectedGrupo?.id === grupo.id ? 'active-brand' : ''}`}
                                                    onClick={() => setSelectedGrupo(grupo)}
                                                >
                                                    {grupo.nombre}
                                                </button>
                                            ))
                                        ) : (
                                            autoresFiltrados.map(autor => (
                                                <button 
                                                    key={autor.id}
                                                    className={`list-group-item list-group-item-action text-start ${selectedAutor?.id === autor.id ? 'active-brand' : ''}`}
                                                    onClick={() => setSelectedAutor(autor)}
                                                >
                                                    {autor.autor}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* COLUMNA DERECHA */}
                                <div className="col-md-8 px-4 d-flex flex-column">
                                    {(!selectedGrupo && activeTab === 'grupos') || (!selectedAutor && activeTab === 'editores') ? (
                                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                                            <i className="bi bi-gear fs-1 mb-2"></i>
                                            <span>Seleccioná un grupo de la izquierda para configurarlo.</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5 className="text-brand fw-bold m-0">
                                                    Configurar: {activeTab === 'grupos' ? selectedGrupo?.nombre : selectedAutor?.autor}
                                                </h5>
                                                <div>
                                                    <button className="btn border-0" title={`Eliminar ${activeTab === 'grupos' ? 'grupo' : 'editor'}`}>
                                                        <i className="bi bi-trash3-fill text-danger fs-5" onClick={activeTab === 'grupos' && selectedGrupo ? handleEliminarGrupo : handleEliminarAutor}></i>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <p className="text-muted small mb-4">
                                                Seleccioná qué {activeTab === 'grupos' ? 'editores' : 'cuentas'} están habilitados para operar con este {activeTab === 'grupos' ? 'grupo' : 'editor'}.
                                            </p>

                                            <div className="input-group mb-2">
                                                <input 
                                                    type="text" 
                                                    className="form-control border-end-0" 
                                                    placeholder={`Buscar ${activeTab === 'grupos' ? 'editores' : 'cuentas'}...`}
                                                    value={searchDer}
                                                    onChange={(e) => setSearchDer(e.target.value)}
                                                />
                                                <span className="input-group-text bg-white border-start-0 text-muted">
                                                    <i className="bi bi-search"></i>
                                                </span>
                                            </div>

                                            {/* Checkboxes */}
                                            <div className="row lista-derecha-abm g-3 mb-4 pb-2">
                                                {activeTab === 'grupos' ? (
                                                    editoresDerecha.map(autor => {
                                                        const estaAsignado = (relGruposEditores[selectedGrupo.id] || []).includes(autor.autor);
                                                        return (
                                                            <div className="col-md-6" key={autor.id}>
                                                                <div className="form-check d-flex align-items-center gap-2">
                                                                    <input 
                                                                        className="form-check-input m-0 flex-shrink-0" 
                                                                        type="checkbox" 
                                                                        id={`chk-editor-${autor.id}`}
                                                                        checked={estaAsignado}
                                                                        onChange={() => toggleCheckbox(selectedGrupo.id, autor.autor, setRelGruposEditores)}
                                                                    />
                                                                    <label className="form-check-label text-truncate" htmlFor={`chk-editor-${autor.id}`} title={autor.autor}>
                                                                        {autor.autor}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    clientesDerecha.map(cliente => {
                                                        const estaAsignado = (relEditoresClientes[selectedAutor.autor] || []).includes(cliente.name);
                                                        return (
                                                            <div className="col-md-6" key={cliente.id}>
                                                                <div className="form-check d-flex align-items-center gap-2">
                                                                    <input 
                                                                        className="form-check-input m-0 flex-shrink-0" 
                                                                        type="checkbox" 
                                                                        id={`chk-cliente-${cliente.id}`}
                                                                        checked={estaAsignado}
                                                                        onChange={() => toggleCheckbox(selectedAutor.autor, cliente.name, setRelEditoresClientes)}
                                                                    />
                                                                    <label className="form-check-label text-truncate" htmlFor={`chk-cliente-${cliente.id}`} title={cliente.name}>
                                                                        {cliente.name}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>

                                            <button 
                                                className="btn btn-brand w-100 fw-bold py-2 mt-auto" 
                                                onClick={activeTab === 'grupos' && selectedGrupo ? handleEditarGrupo : handleEditarAutor}
                                                data-bs-dismiss="modal"
                                            >
                                                Guardar Configuración
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MonitorEditorial;