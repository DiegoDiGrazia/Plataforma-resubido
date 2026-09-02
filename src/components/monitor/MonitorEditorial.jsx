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

    const TOKEN = useSelector((state) => state.formulario.token);
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

    const toggleEditor = (id) => {
        setEditorAbierto(prev => (prev === id ? null : id));
        setClienteAbierto(null); 
    };

    const toggleCliente = (e, id) => {
        e.preventDefault();
        e.stopPropagation(); 
        setClienteAbierto(prev => (prev === id ? null : id));
    };

    const gruposFiltrados = (grupos || []).filter(g => borrarTildes(g.nombre.toLowerCase()).includes(borrarTildes(searchIzq.toLowerCase())));
    const autoresFiltrados = (autores || []).filter(a => borrarTildes(a.autor.toLowerCase()).includes(borrarTildes(searchIzq.toLowerCase())));

    const editoresDerecha = (autores || [])
        .filter(a => borrarTildes((a?.autor || "").toLowerCase()).includes(borrarTildes(searchDer.toLowerCase())))
        .sort((a, b) => (a?.autor || "").localeCompare(b?.autor || ""));

    const clientesDerecha = (clientes || [])
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

    useEffect(() => { // Deja marcados los Checkboxes correspondientes
        
        if (autores && autores.length > 0) {
            let mapeoGrupos = {};
            autores.forEach(autor => {
                const grupoAsignado = autor.id_grupo;
                if (grupoAsignado) {
                    if (!mapeoGrupos[grupoAsignado]) mapeoGrupos[grupoAsignado] = [];
                    mapeoGrupos[grupoAsignado].push(autor.id);
                }
            });
            setRelGruposEditores(mapeoGrupos);
        }
    if (clientesRelacionados && clientesRelacionados.length > 0 && clientes && clientes.length > 0) {
        let mapeoClientes = {};
        clientesRelacionados.forEach(relacion => {
            const idEditorAsignado = relacion.id_autores_grupo;
            
            if (idEditorAsignado) {
                if (!mapeoClientes[idEditorAsignado]) mapeoClientes[idEditorAsignado] = [];
                
                // Buscamos el cliente en la lista original cruzando los nombres exactamente
                const clienteReal = clientes.find(c => 
                    c.name && relacion.cliente && 
                    c.name.toLowerCase().trim() === relacion.cliente.toLowerCase().trim()
                );

                // Si encontramos el match, guardamos el ID que usan los checkboxes
                if (clienteReal) {
                    mapeoClientes[idEditorAsignado].push(clienteReal.id);
                }
            }
        });
        setRelEditoresClientes(mapeoClientes);
    }

    }, [autores, clientesRelacionados, clientes]);

    
    useEffect(() => { // Busca los datos del monitor según los filtros de fecha y grupo
        if (!fechaDesde || !fechaHasta || !grupoFiltro) return;

        const grupoSeleccionado = grupos.find(g => g.nombre === grupoFiltro);
        if (!grupoSeleccionado) return;

        const editoresIds = relGruposEditores[grupoSeleccionado.id] || [];
        const clientesSet = new Set();
        
        editoresIds.forEach(idEditor => {
            const clientesDelEditor = relEditoresClientes[idEditor] || [];
            clientesDelEditor.forEach(idCliente => clientesSet.add(idCliente));
        });
        
        const clientesIDFiltrados = Array.from(clientesSet);

        if (clientesIDFiltrados.length === 0) {
            setMonitorData([]);
            return;
        }

        obtenerMonitor(TOKEN, clientesIDFiltrados, fechaDesde, fechaHasta)
            .then((res) => {
                const dataEstructurada = editoresIds.map(idEditor => {
                    const editorInfo = autores.find(a => a.id === idEditor);
                    const clientesDelEditorIds = relEditoresClientes[idEditor] || [];
                    
                    const clientesCruzados = clientesDelEditorIds.map(idCliente => {
                        const dataApi = res.find(c => c.id_cliente === idCliente);
                        const clienteLocal = clientes.find(c => c.id === idCliente);
                        
                        if (!dataApi) return null;

                        return {
                            id_cliente: idCliente,
                            nombre_cliente: clienteLocal ? clienteLocal.name : `Cliente #${idCliente}`,
                            objetivo_contrato: dataApi.objetivo_contrato || 0,
                            comentario: dataApi.comentarios || clienteLocal?.comentarios || "",
                            notas: dataApi.notas || []
                        };
                    }).filter(Boolean);

                    return {
                        id_editor: idEditor,
                        nombre_editor: editorInfo ? editorInfo.autor : "Editor sin nombre",
                        clientes: clientesCruzados
                    };
                }).filter(editor => editor.clientes.length > 0);

                setMonitorData(dataEstructurada);
            })
            .catch(error => console.error("Error obteniendo el monitor:", error));

    }, [fechaDesde, fechaHasta, grupoFiltro, grupos, autores, clientes, relGruposEditores, relEditoresClientes, TOKEN]);

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

        const editoresSeleccionadosIds = relGruposEditores[selectedGrupo.id] || [];
        
        const autoresStrings = editoresSeleccionadosIds
            .map(id => autores.find(a => a.id === id)?.autor)
            .filter(Boolean); 

        actualizarGrupo(TOKEN, selectedGrupo.id, autoresStrings)
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

        const clientesSeleccionadosIds = relEditoresClientes[selectedAutor.id] || [];
        
        const clientesStrings = clientesSeleccionadosIds
            .map(id => clientes.find(c => c.id === id)?.name)
            .filter(Boolean);

        actualizarAutor(TOKEN, selectedAutor.id, clientesStrings)
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

    return (
        <div className="contenedor-monitorEditorial content flex-grow-1 crearNotaGlobal h-100">
            <div className='row miPerfilContainer soporteContainer gap-5 pb-0 me-5'>
                <div className='col p-0'>
                    <h3 id="saludo" className='headerTusNotas ml-0'>
                        <i className="icon me-2 icono_tusNotas bi bi-display-fill" /> Monitor Editorial
                    </h3>
                    <h4 className='infoCuenta'>Monitoreá el área Editoral</h4>
                    <div className='abajoDeTusNotas'>
                        En esta sección podrás monitorear el trabajo diario del área Editorial, repartido en grupos de editores y cuentas.
                    </div>
                </div>
            </div>
            
            <div className='d-flex justify-content-between mx-5 mt-5'>
                <div className='d-flex align-items-center gap-1'>
                    <div className='d-flex gap-1 bg-secondary text-white rounded p-2'>
                        <label className='label-filtro-fecha'>Fecha Desde:</label>
                        <input 
                            className='input-fecha-custom' 
                            type="date" 
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                        />
                    </div>
                    <div className='d-flex gap-1 bg-secondary text-light rounded p-2'>
                        <label className='label-filtro-fecha'>Fecha Hasta:</label>
                        <input 
                            className='input-fecha-custom' 
                            type="date" 
                            value={fechaHasta}
                            onChange={(e) => setFechaHasta(e.target.value)}
                        />
                    </div>
                    <DropdownFiltro
                        className= 'boton-filtro'
                        label= "Grupo"
                        valorActual={grupoFiltro ? grupoFiltro : "Seleccionar..."}
                        opciones= {gruposFiltrados.map(g => g.nombre )}
                        onChange={setGrupoFiltro}
                        mostrarBuscador={true}
                    />
                </div>
                
                <button 
                    className='btn bg-secondary' 
                    data-bs-toggle="modal" 
                    data-bs-target="#modalGestionABM"
                >
                    <i className='bi bi-gear-fill text-light fs-5'></i>
                </button>
            </div>

            {/* ACORDEÓN PRINCIPAL: EDITORES */}
            <div className="accordion mt-5 mx-5 mb-4">
                {monitorData.map((editor, indexEditor) => { 
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
                                    
                                    {/* ACORDEÓN SECUNDARIO: CLIENTES */}
                                    <div className="accordion">
                                        {editor.clientes.map((cliente, indexCliente) => {
                                            const notasTotales = cliente.notas.length;
                                            const notasAmpli = cliente.notas.filter(n => n.con_distribucion === "1").length;
                                            const idCliente = `${indexEditor}-${indexCliente}`; 
                                            const isOpenCliente = clienteAbierto === idCliente;
                                            
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
                                                                    </div>
                                                                    {cliente.comentario ? (
                                                                        <span className="text-muted mt-1 fw-normal texto-comentario" style={{ fontSize: '0.85rem' }}>
                                                                            <i className="bi bi-chat-text-fill text-brand me-1"></i>
                                                                            {cliente.comentario}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-muted mt-1 fw-normal opacity-50 texto-comentario-vacio" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                                                                            Sin comentario...
                                                                        </span>
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
                                                                            <div className="d-flex gap-5 text-secondary">
                                                                                <span><strong>ID:</strong> {nota.term_id}</span>
                                                                                <span><strong>Autor:</strong> {nota.autor_cliente}</span>
                                                                                <span>
                                                                                    <strong>Distribución:</strong> 
                                                                                    {nota.con_distribucion === "1" ? (
                                                                                        <span className="badge bg-brand ms-2 px-2 py-1">Amplificada</span>
                                                                                    ) : (
                                                                                        <span className="badge bg-secondary ms-2 px-2 py-1">Normal</span>
                                                                                    )}
                                                                                </span>
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
                                                                                {nota.con_distribucion === "1" && (
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
                                                                
                                                                {/* MODAL EDITAR COMENTARIO (Nativo Bootstrap) */}
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
                )})}
            </div>


            {/* MODAL */}
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
                                                        const estaAsignado = (relGruposEditores[selectedGrupo.id] || []).includes(autor.id);
                                                        return (
                                                            <div className="col-md-6" key={autor.id}>
                                                                <div className="form-check d-flex align-items-center gap-2">
                                                                    <input 
                                                                        className="form-check-input m-0 flex-shrink-0" 
                                                                        type="checkbox" 
                                                                        id={`chk-editor-${autor.id}`}
                                                                        checked={estaAsignado}
                                                                        onChange={() => toggleCheckbox(selectedGrupo.id, autor.id, setRelGruposEditores)}
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
                                                        const estaAsignado = (relEditoresClientes[selectedAutor.id] || []).includes(cliente.id);
                                                        return (
                                                            <div className="col-md-6" key={cliente.id}>
                                                                <div className="form-check d-flex align-items-center gap-2">
                                                                    <input 
                                                                        className="form-check-input m-0 flex-shrink-0" 
                                                                        type="checkbox" 
                                                                        id={`chk-cliente-${cliente.id}`}
                                                                        checked={estaAsignado}
                                                                        onChange={() => toggleCheckbox(selectedAutor.id, cliente.id, setRelEditoresClientes)}
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