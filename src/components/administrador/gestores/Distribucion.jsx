import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import ModalMensaje from '../gestores/ModalMensaje';
import {obtenerClientes, obtenerPlanesMarketing, obtenerVideosYoutube, obtenerGeo, obtenerContratos } from './apisUsuarios';
import { obtenerDistribucionPorFechaVencimiento, obtenerGeneracion, editarDistribucionGeneracion } from '../../Apis/apis';
import CopiarTexto from './CopiarTexto';
import IconosDistribucionConMonto, { PLATAFORMAS } from './IconosDistribucionConMonto';
import { Accordion } from 'react-bootstrap';


export const obtenerMesActual = (mesesDeDiferencia) => {
  const hoy = new Date();
  hoy.setMonth(hoy.getMonth() + mesesDeDiferencia);
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  return `${año}-${mes}`;
}

const descargar = async (nota) => {
  const res = await fetch(`https://panel.serviciosd.com/img${nota.video}`);
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `-wp${nota.term_id}-${nota.cliente}_v:${nota.fecha_vencimiento_video}.mp4`;
  a.click();
};

export const obtenerUltimoDiaMes = (año, mes) => {
  return new Date(año, mes, 0).getDate(); 
};

function formatearFechaDDMMAAAA(fechaStr) {
  if (!fechaStr) return "";
  const [año, mes, dia] = fechaStr.split("-");
  return `${dia}-${mes}-${año}`;
}
const obtenerColorDeEstadoDistribucion = (campoAChequear, datosDelCiente) => {
  if (!datosDelCiente || !datosDelCiente.notas || datosDelCiente.notas.length === 0) {
    return 'text-muted';
  }
  const tieneAlgunNull = datosDelCiente.notas.some(n => n[campoAChequear] == null);
  return tieneAlgunNull ? 'text-danger' : 'text-success';
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

function agregarPlanAlDiccionarioDeNotas(dicNotas, clientes, planes) {
  const entradasOrdenadas = Object.entries(dicNotas).sort(([, notasA], [, notasB]) => {
    const fechaA = Math.max(...notasA.map(n => new Date(n.f_pub).getTime()));
    const fechaB = Math.max(...notasB.map(n => new Date(n.f_pub).getTime()));

    return fechaB - fechaA; // más reciente primero
  });

  const nuevoDic = {};

  for (const [nombreCliente, notas] of entradasOrdenadas) {
    const municipio = clientes.find(m => m.name === nombreCliente);

    const plan = municipio
      ? planes.find(p => p.id === municipio.id_plan)
      : null;

    nuevoDic[nombreCliente] = {
      notas,
      plan: plan || null
    };
  }

  return nuevoDic;
}



const obtenerContratoMasReciente = (contratosDelCliente) => {
  return contratosDelCliente.reduce((masReciente, actual) => {
    if (!masReciente) return actual;
    return new Date(actual.fecha_inicio) > new Date(masReciente.fecha_inicio) ? actual : masReciente;
  }, null);
};

const completarContratoEnNotas = (notas, contratos) => {
  if (!notas || !contratos || contratos.length === 0) return notas;
  return notas.map(nota => {
    if (nota.id_contrato != null) return nota;
    const contratosDelCliente = contratos.filter(c => c.name?.toLowerCase() === nota.cliente?.toLowerCase());
    const contrato = obtenerContratoMasReciente(contratosDelCliente);
    if (!contrato) return nota;
    return {
      ...nota,
      id_contrato: contrato.id_contrato,
      monto_dv360: contrato.con_dv360,
      monto_meta: contrato.con_meta,
      monto_search: contrato.con_search,
      monto_x: contrato.con_x,
      monto_youtube: contrato.con_youtube,
    };
  });
};

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

const agruparVideosPorCliente = (videos) => {
  if (!videos || videos.length === 0) return {};
  return videos.reduce((acc, video) => {
    if (!video.cliente) return acc;
    const notaDeVideo = { ...video, esNotaDeVideo: true };
    if (!acc[video.cliente]) {
      acc[video.cliente] = [notaDeVideo];
    } else {
      acc[video.cliente].push(notaDeVideo);
    }
    return acc;
  }, {});
};
const DistribucionAdmin = () => {
  const [clientes, setClientes] = useState([]);
  const [fechaDesde, setFechaDesde] = useState(obtenerMesActual(0));
  const [fechaHasta, setFechaHasta] = useState(obtenerMesActual(1));
  const [pendientes, setPendientes] = useState('Todos los casos');
  const [planes, setPlanes] = useState([]);
  const [notasGeneracionesAgrupadas, setNotasGeneracionesAgrupadas] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [mensajeModalExito, setMensajeModalExito] = useState("Los cambios se realizaron correctamente.");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 100;  
  const TOKEN = useSelector((state) => state.formulario.token);
  const [loading, setLoading] = useState(false); 
  const [geo, setGeo] = useState("");
  const [contratos, setContratos] = useState([]);
  const [comentarios, setComentarios] = useState({});
  const [termIdsPorGeneracion, setTermIdsPorGeneracion] = useState({});
  const [showContratoModal, setShowContratoModal] = useState(false);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);

  const obtenerTermId = async (nota) => {
    if (termIdsPorGeneracion[nota.id_generacion]) {
      return termIdsPorGeneracion[nota.id_generacion];
    }
    const generacion = await obtenerGeneracion(TOKEN, nota.id_generacion);
    const termId = generacion?.term_id ?? null;
    if (termId != null) {
      setTermIdsPorGeneracion(prev => ({ ...prev, [nota.id_generacion]: termId }));
    }
    return termId;
  };

  const cargarIdsDeCliente = async (eventKey) => {
    if (eventKey == null) return;
    const cliente = pagedClientes[Number(eventKey)];
    const data = notasGeneracionesAgrupadas[cliente];
    if (!data) return;
    const notasSinId = data.notas.filter(
      n => !n.esNotaDeVideo && n.id_generacion != null && !termIdsPorGeneracion[n.id_generacion]
    );
    if (notasSinId.length === 0) return;
    const resultados = await Promise.all(notasSinId.map(n => obtenerGeneracion(TOKEN, n.id_generacion)));
    setTermIdsPorGeneracion(prev => {
      const actualizado = { ...prev };
      notasSinId.forEach((n, i) => {
        const termId = resultados[i]?.term_id;
        if (termId != null) actualizado[n.id_generacion] = termId;
      });
      return actualizado;
    });
  };

  const abrirNota = async (nota) => {
    const termId = await obtenerTermId(nota);
    if (termId == null) {
      alert('No se pudo obtener el id de la nota.');
      return;
    }
    window.open(`https://www.noticiasd.com/nota/${termId}`, '_blank');
  };

  const copiarIdDeNota = async (nota) => {
    const termId = await obtenerTermId(nota);
    if (termId == null) {
      alert('No se pudo obtener el id de la nota.');
      return;
    }
    navigator.clipboard.writeText(termId)
      .then(() => alert(`Se a copiado con exito: \n ${termId} ✅`))
      .catch(err => console.error('Error al copiar: ', err));
  };

  const mostrarContrato = (nota) => {
    const contrato = contratos.find(c => c.id_contrato === nota.id_contrato) || null;
    setContratoSeleccionado(contrato);
    setShowContratoModal(true);
  };

  const recargarContrato = async (nota) => {
    const contratosActualizados = await obtenerContratos(TOKEN);
    setContratos(contratosActualizados);

    const contratosDelCliente = contratosActualizados.filter(
      c => c.name?.toLowerCase() === nota.cliente?.toLowerCase()
    );
    const contrato = obtenerContratoMasReciente(contratosDelCliente);

    if (contrato) {
      setNotasGeneracionesAgrupadas(prev => {
        const datosCliente = prev[nota.cliente];
        if (!datosCliente) return prev;
        return {
          ...prev,
          [nota.cliente]: {
            ...datosCliente,
            notas: datosCliente.notas.map(n =>
              n.id === nota.id && n.esNotaDeVideo === nota.esNotaDeVideo
                ? {
                    ...n,
                    id_contrato: contrato.id_contrato,
                    monto_dv360: contrato.con_dv360,
                    monto_meta: contrato.con_meta,
                    monto_search: contrato.con_search,
                    monto_x: contrato.con_x,
                    monto_youtube: contrato.con_youtube,
                  }
                : n
            ),
          },
        };
      });
    }

    setContratoSeleccionado(contrato);
    setShowContratoModal(true);
  };

  const abrirCreativo = async (nota) => {
    const termId = await obtenerTermId(nota);
    if (termId == null) {
      alert('No se pudo obtener el id de la nota.');
      return;
    }
    window.open(decodeURI(`https://builder.ntcias.de/single.php?name=-wp${termId}-${nota.cliente}_v:${formatearFechaDDMMAAAA(nota.fecha_vencimiento)}&nota_id=${termId}`), '_blank');
  };

  const setearComentario = (token, nota) => {
  setMensajeModalExito("Se esta enviando el comentario...");
  setShowModal(true);

  editarDistribucionGeneracion(token, nota.id_generacion, { comentarios: nota.comentarios })
    .then(() => {
      setMensajeModalExito("El comentario se guardó correctamente.");
    })
    .catch(() => {
      setMensajeModalExito("Ocurrió un error al guardar el comentario.");
    })
    .finally(() => {
      setShowModal(false);
    });
};

  useEffect(() => {
    obtenerGeo().then(setGeo);
    obtenerContratos(TOKEN).then(setContratos);
    obtenerClientes(TOKEN).then(setClientes);
    const [añoHasta, mesHasta] = fechaHasta.split("-");
    const ultimoDiaHasta = obtenerUltimoDiaMes(añoHasta, mesHasta);
    obtenerPlanesMarketing(TOKEN, fechaDesde+'-01',  `${fechaHasta}-${ultimoDiaHasta}`)
    .then(setPlanes)
    .finally(() => setLoading(false));
    ;
}, [TOKEN]);  

useEffect(() => {
  if(planes.length === 0 || clientes.length === 0 || contratos.length === 0) return;
  const [añoHasta, mesHasta] = fechaHasta.split("-");
  const ultimoDiaHasta = obtenerUltimoDiaMes(añoHasta, mesHasta);
  setLoading(true);
  obtenerDistribucionPorFechaVencimiento(TOKEN, fechaDesde+'-01', `${fechaHasta}-${ultimoDiaHasta}`)
  .then((res) => {
  const resConContrato = completarContratoEnNotas(res, contratos);
  const diccionarioDeCLientesConSusNotas = agruparNotasPorCliente(resConContrato);
  const agrupadasConPlanes = agregarPlanAlDiccionarioDeNotas(diccionarioDeCLientesConSusNotas, clientes, planes);
  console.log('agrupadasConPlanes: ', agrupadasConPlanes);
  setNotasGeneracionesAgrupadas(prev => {
    const actualizado = { ...prev };
    for (const [nombreCliente, datos] of Object.entries(agrupadasConPlanes)) {
      const notasDeVideoPrevias = actualizado[nombreCliente]?.notas?.filter(n => n.esNotaDeVideo) || [];
      actualizado[nombreCliente] = {
        plan: datos.plan,
        notas: [...datos.notas, ...notasDeVideoPrevias]
      };
    }
    return actualizado;
  });
  })
  .finally(() => setLoading(false));
}, [TOKEN, clientes, planes, contratos, fechaDesde, fechaHasta]);

useEffect(() => {
  const [añoHasta, mesHasta] = fechaHasta.split("-");
  const ultimoDiaHasta = obtenerUltimoDiaMes(añoHasta, mesHasta);
  obtenerVideosYoutube(
    TOKEN,
    fechaDesde + '-01',
    `${fechaHasta}-${ultimoDiaHasta}`,
    '150',
    '0'
  ).then((res) => {
    const videosPorCliente = agruparVideosPorCliente(res);
    setNotasGeneracionesAgrupadas(prev => {
      const actualizado = { ...prev };
      for (const [nombreCliente, notasDeVideo] of Object.entries(videosPorCliente)) {
        if (actualizado[nombreCliente]) {
          actualizado[nombreCliente] = {
            ...actualizado[nombreCliente],
            notas: [...actualizado[nombreCliente].notas, ...notasDeVideo]
          };
        } else {
          const municipio = clientes.find(m => m.name === nombreCliente);
          const plan = municipio ? planes.find(p => p.id === municipio.id_plan) : null;
          actualizado[nombreCliente] = { notas: notasDeVideo, plan: plan || null };
        }
      }
      return actualizado;
    });
  });

}, [TOKEN, fechaDesde, fechaHasta]);

  useEffect(() => {
    console.log('notasGeneracionesAgrupadas actualizadas: ', notasGeneracionesAgrupadas);
  }, [notasGeneracionesAgrupadas]);

  const irANotasDelCliente = (data, cliente, fechaDesde, fechaHasta) => {
    const [añoHasta, mesHasta] = fechaHasta.split("-");
    const ultimoDiaHasta = obtenerUltimoDiaMes(añoHasta, mesHasta);
    window.open(`/notas-cliente/${cliente}/${fechaDesde}-01/${fechaHasta}-${ultimoDiaHasta}`, "_blank");
  };

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
              placeholder="       Buscar cuentas"
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
            <Accordion defaultActiveKey="" onSelect={cargarIdsDeCliente}>
              {pagedClientes.map((cliente, index) => {
                const data = notasGeneracionesAgrupadas[cliente];
                if (!data) return null;

                return (
                  <Accordion.Item eventKey={index.toString()} key={cliente}>
                    <Accordion.Header>
                      <div className="row pt-0 w-100">
                        <div className="col-2">
                          <button onClick={() => irANotasDelCliente(data, cliente, fechaDesde, fechaHasta)} className="btn btn-link p-0 m-0 text-start">
                            <strong className='text-primary' style={{ fontSize: '18px' }}>{cliente}</strong>
                          </button>
                          
                          <div className="row p-1">
                            <span><strong>Distribuibles: </strong>{data.plan ? data.plan.notas_x_mes : 0}</span>
                          </div>
                          <div className="row p-1">
                            <span><strong>Por publicar: </strong>{data.plan ? Number(data.plan.notas_x_mes) - data.notas.length : 0}</span>
                          </div>
                        </div>
                        {PLATAFORMAS.map((plataforma) => (
                          <div className="col text-center" key={plataforma.key}>
                            <u><strong>{plataforma.label}</strong></u>
                            <div className="row p-1 justify-content-center">
                              <span><strong>Distribuidas: </strong>{data.notas.filter(n => n[plataforma.campoPrimerDato] != null).length}</span>
                            </div>
                            <i className={`bi ${plataforma.icono} fs-3 ` + obtenerColorDeEstadoDistribucion(plataforma.campoPrimerDato, data)}></i>
                          </div>
                        ))}
                      </div>
                    </Accordion.Header>

                    <Accordion.Body>
                      <ul className="list-group">
                        {data.notas.map(nota => (
                          <li key={`${nota.id}-${nota.esNotaDeVideo ? 'video' : 'nota'}`} className="list-group-item">
                            <div className='row p-0'>
                              {/* Columna 1 */}
                              {!nota.esNotaDeVideo && (
                              <div className="col">
                                <div className="row p-1">
                                  <span><strong>ID: </strong>{termIdsPorGeneracion[nota.id_generacion] ?? 'cargando...'}</span>
                                </div>
                                <div className="row p-1">
                                  <button className="btn btn-outline-primary w-100" onClick={() => abrirNota(nota)}>Abrir nota</button>
                                </div>
                                <div className="row p-1">
                                  <button className="btn btn-outline-secondary w-100" onClick={() => mostrarContrato(nota)}>Mostrar contrato</button>
                                </div>
                                <div className="row p-1">
                                  <button className="btn btn-outline-secondary w-100" onClick={() => recargarContrato(nota)}>Recargar contrato</button>
                                </div>
                                <div className="row p-1">
                                  <span><strong>Fecha publicación: </strong>{nota.f_pub}</span>
                                </div>
                                <div className="row p-1">
                                  <span><strong>Fecha vencimiento: </strong>{nota.fecha_vencimiento}</span>
                                </div>
                              </div>
                              )}
                              {nota.esNotaDeVideo && (
                              <div className="col-3">
                                <div className="row p-1">
                                  <span><strong>Fecha vencimiento: </strong>{nota.fecha_vencimiento_video}</span>
                                </div>
                              </div>
                              )}
                              {nota.esNotaDeVideo && (
                              <div className="col-3">
                                <div className="row p-1">
                                  <span>
                                    {nota.video && (
                                    <button className='btn btn-outline-secondary w-100' onClick={() => descargar(nota)}>descargar creativo</button>
                                    )}
                                    {!nota.video && (
                                      <strong>Nota sin video</strong>
                                    )}
                                  </span>
                                </div>
                              </div>
                              )}

                              {/* Columna 2 */}
                              {!nota.esNotaDeVideo && (
                                <>
                              <div className="col">
                                <div className="row p-1">
                                  <span><strong>Abrir: </strong></span>
                                </div>
                                <div className="row p-1">
                                  <button className="btn btn-outline-primary w-100" onClick={() => abrirCreativo(nota)}>CREATIVO</button>
                                </div>
                                <div className="row p-1">
                                  <strong>Comentarios:</strong>

                                  <textarea
                                    className="form-control mt-1"
                                    value={comentarios[nota.id] ?? nota.comentarios ?? ''}
                                    onChange={(e) => {
                                      setComentarios(prev => ({
                                        ...prev,
                                        [nota.id]: e.target.value
                                      }));

                                      nota.comentarios = e.target.value;
                                    }}
                                  />

                                  <button
                                    className="btn btn-outline-secondary w-100 mt-2"
                                    onClick={() =>
                                      setearComentario(
                                        TOKEN,
                                        nota
                                      )
                                    }
                                  >
                                    Guardar comentario
                                  </button>
                                </div>
                              </div>

                              {/* Columna 3: Meta / X */}
                              <div className="col">
                                <div className="p-1">
                                  <strong>Meta</strong>
                                  {!nota.meta_titulo && !nota.meta_engagement && (
                                    <span>: Sin datos</span>
                                  )}
                                </div>
                                {nota.meta_titulo && <div className="row p-1"><CopiarTexto textoACopiar={nota.meta_titulo} TituloBoton={'Copiar Titulo'} /></div>}
                                {nota.meta_engagement && <div className="row p-1"><CopiarTexto textoACopiar={nota.meta_engagement} TituloBoton={'Copiar Bajada'} /></div>}
                                
                                <div className="p-1"><strong>X </strong>{!nota.x_descripcion ? ': Sin datos' : ''}</div>
                                {nota.x_descripcion && (
                                  <div className="row p-1"><CopiarTexto textoACopiar={nota.x_descripcion} TituloBoton={'Copiar Descripcion'} /></div>
                                )}
                              </div>

                              {/* Columna 4: Youtube */}
                              <div className="col">
                                <div className="p-1">
                                  <strong>Youtube</strong>
                                  {!nota.youtube_titulo && !nota.youtube_descripcion && !nota.youtube_link_video && (
                                    <span>: Sin datos</span>
                                  )}
                                </div>
                                {nota.youtube_titulo && <div className="row p-1"><CopiarTexto textoACopiar={nota.youtube_titulo} TituloBoton={'Copiar Titulo'} /></div>}
                                {nota.youtube_descripcion && <div className="row p-1"><CopiarTexto textoACopiar={nota.youtube_descripcion} TituloBoton={'Copiar Descripcion'} /></div>}
                                {nota.youtube_link_video && <div className="row p-1"><CopiarTexto textoACopiar={nota.youtube_link_video} TituloBoton={'Copiar Link Video'} /></div>}
                              </div>

                              {/* Columna 5 */}
                              <IconosDistribucionConMonto nota= {nota} token = {TOKEN} geo={geo} contratos={contratos}/>
                              </>
                              )}
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

      {showContratoModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Datos del contrato</h5>
                <button type="button" className="btn-close" onClick={() => setShowContratoModal(false)}></button>
              </div>
              <div className="modal-body">
                {contratoSeleccionado ? (
                  <>
                    <p className="mb-1"><strong>Montos por plataforma:</strong></p>
                    <ul className="list-group mb-3">
                      {PLATAFORMAS.map((plataforma) => (
                        <li className="list-group-item d-flex justify-content-between" key={plataforma.key}>
                          <span>{plataforma.label}</span>
                          <span>{contratoSeleccionado[plataforma.campoMonto.replace('monto_', 'con_')]}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mb-1"><strong>Otros datos:</strong></p>
                    <ul className="list-group">
                      {Object.entries(contratoSeleccionado)
                        .filter(([campo]) => campo === 'monto' || campo === 'id' || campo === 'notas_x_mes')
                        .map(([campo, valor]) => (
                          <li className="list-group-item d-flex justify-content-between" key={campo}>
                            <span>{campo}</span>
                            <span>{String(valor)}</span>
                          </li>
                        ))}
                    </ul>
                  </>
                ) : (
                  <p>No se encontró un contrato asociado a esta nota.</p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowContratoModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DistribucionAdmin;