import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import ModalMensaje from '../gestores/ModalMensaje';
import {obtenerClientes, obtenerNotasDeGeneraciones, obtenerPlanesMarketing } from './apisUsuarios'; 
import CopiarTexto from './CopiarTexto';
import { Accordion } from 'react-bootstrap';

const obtenerMesActual = () => {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  return `${año}-${mes}`;
}
const obtenerUltimoDiaMes = (año, mes) => {
  return new Date(año, mes, 0).getDate(); 
};

function formatearFechaDDMMAAAA(fechaStr) {
  if (!fechaStr) return "";
  const [año, mes, dia] = fechaStr.split("-");
  return `${dia}-${mes}-${año}`;
}
const obtenerColorDeEstadoDistribucion = (campoAChequear, datosDelCiente) => {
    if (!datosDelCiente || !datosDelCiente.plan) {
    return 'text-muted';
  }
  const notas = datosDelCiente['notas'].filter(n => n[campoAChequear] != null);
  const totalDeNotasDistribuidas = notas.length;
  const numeroDeNotasADistribuir = Number(datosDelCiente['plan']['notas_x_mes']) || 0;
  if(totalDeNotasDistribuidas === 0 && numeroDeNotasADistribuir != 0){
    return 'text-danger'
  }
  else if(totalDeNotasDistribuidas < numeroDeNotasADistribuir){
    return 'text-warning'
  }
  else if(totalDeNotasDistribuidas >= numeroDeNotasADistribuir){
    return 'text-success'
  }
  return 'text-success';
}

const filtrarClientesSegunPendientes = (clientesObj, pendientes) => {
  const clientesFiltradosEntries = Object.entries(clientesObj).filter(([nombre, datos]) => {
    if (!datos.notas || datos.notas.length === 0) return false;

    if (pendientes === 'Todos los casos') return true;

    if (pendientes === 'solo en Meta') {
      return datos.notas.some(nota => nota.primer_dato_en_meta == null);
    }
    if (pendientes === 'solo en GAM') {
      return datos.notas.some(nota => nota.primer_dato_en_360 == null);
    }
    if (pendientes === 'GAM o Meta') {
      return datos.notas.some(
        nota => nota.primer_dato_en_meta == null || nota.primer_dato_en_360 == null
      );
    }
    return true;
  });
  return Object.fromEntries(clientesFiltradosEntries);
};
const obtenerColorDeEstadoDistribucionDeNota = (campoAChequear, nota) => {
  const fechaHoy = new Date();
  const fechaVencimiento = new Date(nota['fecha_vencimiento']);
  if (!campoAChequear || !nota) {
    return 'text-muted';
  }
  if (nota[campoAChequear] == null && fechaVencimiento < fechaHoy) {  
    return 'text-danger'
  } 
  else if(nota[campoAChequear] == null && fechaVencimiento > fechaHoy){
    return 'text-warning'
  }
  else if(nota[campoAChequear] != null){
    return 'text-success'
  }
  return 'text-muted';
}

function agregarPlanAlDiccionarioDeNotas(dicNotas, clientes, planes) {
  const nuevoDic = {};
  for (const [nombreCliente, notas] of Object.entries(dicNotas)) {
    const municipio = clientes.find(m => m.name === nombreCliente);
    const plan = municipio
      ? planes.find(p => p.id === municipio.id_plan)
      : null;
    nuevoDic[nombreCliente] = {
      notas: notas,
      plan: plan || null
    };
  }

  return nuevoDic;
}
const agruparNotasPorCliente = (notas) => {
  if(!notas || notas.length === 0) return {};
  return notas.reduce((acc, nota) => {
    if(!nota.fecha_vencimiento){
      return acc;
    }
    if (!acc[nota.cliente]) {
      acc[nota.cliente] = [nota];
    } else {
      acc[nota.cliente].push(nota);
    }
    return acc;
  }, {});
};
const DistribucionAdmin = () => {
  const [clientes, setClientes] = useState([]);
  const [fechaDesde, setFechaDesde] = useState(obtenerMesActual());
  const [fechaHasta, setFechaHasta] = useState(obtenerMesActual());
  const [pendientes, setPendientes] = useState('GAM o Meta');
  const [planes, setPlanes] = useState([]);
  const [notasGeneracionesAgrupadas, setNotasGeneracionesAgrupadas] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [mensajeModalExito, setMensajeModalExito] = useState("Los cambios se realizaron correctamente.");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;  
  const TOKEN = useSelector((state) => state.formulario.token);
  const [loading, setLoading] = useState(false); // 👈 nuevo estado

  useEffect(() => {
    obtenerClientes(TOKEN).then(setClientes);
    const [añoHasta, mesHasta] = fechaHasta.split("-");
    const ultimoDiaHasta = obtenerUltimoDiaMes(añoHasta, mesHasta);
    obtenerPlanesMarketing(TOKEN, fechaDesde+'-01',  `${fechaHasta}-${ultimoDiaHasta}`)
    .then(setPlanes)
    .finally(() => setLoading(false)); // 👈 termina la carga
    ;
}, [TOKEN]);  

useEffect(() => {
  if(planes.length === 0 || clientes.length === 0) return;
  const [añoHasta, mesHasta] = fechaHasta.split("-");
  const ultimoDiaHasta = obtenerUltimoDiaMes(añoHasta, mesHasta);
  setLoading(true); // 👈 comienza la carga
  obtenerNotasDeGeneraciones(TOKEN, '', '', '', 'PUBLICADO', '150', '0', '', '', fechaDesde+'-01', `${fechaHasta}-${ultimoDiaHasta}`)
  .then((res) => {
  const diccionarioDeCLientesConSusNotas = agruparNotasPorCliente(res);
  const agrupadasConPlanes = agregarPlanAlDiccionarioDeNotas(diccionarioDeCLientesConSusNotas, clientes, planes);
  console.log('agrupadasConPlanes: ', agrupadasConPlanes);
  setNotasGeneracionesAgrupadas(agrupadasConPlanes);
  })
  .finally(() => setLoading(false)); 
}, [TOKEN, clientes, planes, fechaDesde, fechaHasta]);

const filteredClientes = useMemo(() => {
  const allKeys = Object.keys(notasGeneracionesAgrupadas || {});
  if (!search) return allKeys;
  return allKeys.filter((clave) =>
    clave.toLowerCase().includes(search.toLowerCase())
  );
}, [search, notasGeneracionesAgrupadas]);

const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);

const pagedClientes = useMemo(() => {
  const start = (page - 1) * itemsPerPage;
  return filteredClientes.slice(start, start + itemsPerPage);
}, [filteredClientes, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

useEffect(() => {
  setNotasGeneracionesAgrupadas(filtrarClientesSegunPendientes(notasGeneracionesAgrupadas, pendientes));
  console.log('notasGeneracionesAgrupadas filtradas: ', notasGeneracionesAgrupadas);
}, [pendientes]);

const goToPage = (newPage) => {
  if (newPage < 1 || newPage > totalPages) return;
  setPage(newPage);
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
            En esta seccion podras gestionar la distribucion de tu contenido <br />
          </div>
        </div>
      </div>
      {/* Búsqueda */}
      <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-3'>
        <div className='col buscadorNotas d-flex align-items-center gap-3 justify-content-between'> 
          {/* <button className="mb-2 btn btn-primary" onClick={() => handleEditClick(usuarioVacio)}>Crear nuevo usuario</button> */}
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
          {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
         ) : Object.keys(notasGeneracionesAgrupadas).length === 0 ? (
            <ul className="list-group">
              <li className="list-group-item">No hay resultados.</li>
            </ul>
          ) : (
            <Accordion defaultActiveKey="">
              {pagedClientes.map((cliente, index) => {
                const data = notasGeneracionesAgrupadas[cliente];
                if (!data) return null;

                return (
                  <Accordion.Item eventKey={index.toString()} key={cliente}>
                    <Accordion.Header>
                      <div className="row pt-0 w-100">
                        <div className="col-2">
                          <strong className='text-primary' style={{ fontSize: '18px' }}>{cliente}</strong>
                          <div className="row p-1">
                            <span><strong>Distribuibles: </strong>{data.plan ? data.plan.notas_x_mes : 0}</span>
                          </div>
                          <div className="row p-1">
                            <span><strong>Por publicar: </strong>{data.plan ? Number(data.plan.notas_x_mes) - data.notas.length : 0}</span>
                          </div>
                        </div>
                        <div className="col-3">
                          <strong>Meta</strong>
                          <div className="row p-1">
                            <span><strong>Distribuidas: </strong>{data.notas.filter(n => n.primer_dato_en_meta != null).length}</span>
                          </div>
                          <div className="row p-1">
                            <span><strong>Vencidas: </strong>{data.notas.filter(n => new Date(n.fecha_vencimiento) < new Date() && n.primer_dato_en_meta != null).length}</span>
                          </div>
                        </div>
                        <div className="col-3">
                          <strong>DV360</strong>
                          <div className="row p-1">
                            <span><strong>Distribuidas: </strong>{data.notas.filter(n => n.primer_dato_en_360 != null).length}</span>
                          </div>
                          <div className="row p-1">
                            <span><strong>Vencidas: </strong>{data.notas.filter(n => new Date(n.fecha_vencimiento) < new Date() && n.primer_dato_en_360 != null).length}</span>
                          </div>
                        </div>
                        <div className="col-3 d-flex justify-content-center align-items-center">
                          <i className={'bi bi-meta fs-1 ' + obtenerColorDeEstadoDistribucion('primer_dato_en_meta', data)}></i>
                          <i className={'bi bi-google fs-1 ms-3 ' + obtenerColorDeEstadoDistribucion('primer_dato_en_360', data)}></i>
                        </div>
                      </div>
                    </Accordion.Header>

                    <Accordion.Body>
                      <ul className="list-group">
                        {data.notas.map(nota => (
                          <li key={nota.id} className="list-group-item">
                            <div className='row p-0'>
                              {/* Columna 1 */}
                              <div className="col-3">
                                <div className="row p-1">
                                  <span>
                                    <a href={`https://www.noticiasd.com/${nota.term_id}`} target="_blank" rel="noopener noreferrer">{nota.term_id}</a>
                                  </span>
                                </div>
                                <div className="row p-1">
                                  <span><strong>Publicación: </strong>{nota.f_pub}</span>
                                </div>
                                <div className="row p-1">
                                  <span><strong>Ultima versión: </strong>{nota.update_date}</span>
                                </div>
                                <div className="row p-1">
                                  <span><strong>Fecha vencimiento: </strong>{nota.fecha_vencimiento}</span>
                                </div>
                              </div>

                              {/* Columna 2 */}
                              <div className="col-3">
                                <div className="row p-1">
                                  <span>
                                    <a href={decodeURI(`https://builder.ntcias.de/single.php?name=-wp${nota.term_id}-${nota.cliente}_v:${formatearFechaDDMMAAAA(nota.fecha_vencimiento)}&nota_id=${nota.term_id}`)} target="_blank" rel="noopener noreferrer">
                                      CREATIVO
                                    </a>
                                  </span>
                                </div>
                                <div className="row p-1">
                                  <span><strong>Comentarios: </strong>{nota.comentarios ?? 'No hay comentarios'}</span>
                                </div>
                              </div>

                              {/* Columna 3 */}
                              <div className="col-3">
                                <div className="row p-1"><CopiarTexto textoACopiar={nota.titulo} TituloBoton={'Copiar Titulo'} /></div>
                                <div className="row p-1"><CopiarTexto textoACopiar={nota.extracto} TituloBoton={'Copiar Bajada'} /></div>
                                <div className="row p-1"><CopiarTexto textoACopiar={nota.engagement} TituloBoton={'Copiar Engagement'} /></div>
                              </div>

                              {/* Columna 4 */}
                              <div className="col-3 d-flex justify-content-center align-items-center">
                                <i className={'bi bi-meta fs-1 ' + obtenerColorDeEstadoDistribucionDeNota('primer_dato_en_meta', nota)}></i>
                                <i className={'bi bi-google fs-1 ms-3 ' + obtenerColorDeEstadoDistribucionDeNota('primer_dato_en_360', nota)}></i>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          )}
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