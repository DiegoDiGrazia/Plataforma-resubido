import './Distribucion.css';
import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ModalMensaje from '@/shared/components/modales/ModalMensaje';
import {obtenerPlanesMarketing, obtenerVideosYoutube, obtenerContratos } from '@/api/apisUsuarios';
import { obtenerGeo } from '@/api/geosApi';
import { obtenerDistribucionPorFechaVencimiento, obtenerGeneracion, editarDistribucionGeneracion, eliminarDistribucionGeneracion, obtenerDistribucionGeneracion, obtenerClientes } from '@/api/apis';
import { getTipoHistoria, getColorHistoria, getDesplazamientoHistoria, armarParamsColorCreativo } from '@/shared/utils/bannerData';
import CopiarTexto from './CopiarTexto';
import IconosDistribucionConMonto, { PLATAFORMAS } from './IconosDistribucionConMonto';
import { Accordion } from 'react-bootstrap';
import { idClienteDe, mismoId, clientePorId } from '@/shared/utils/clientes';
import { parsearFechaUTC } from '@/shared/utils/distribucionGeneracion';

// El diccionario de distribución se indexa por id de cliente. Si una nota no se pudo
// asociar a ningún cliente (nombre desconocido), queda agrupada aparte por su nombre.
const claveCliente = (nota) => (nota.id_cliente != null ? String(nota.id_cliente) : `sin-id:${nota.cliente}`);


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

const descargarJpg = async (nota, imagenFeed) => {
  const res = await fetch(`https://static.noticiasd.com/img${imagenFeed}`);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);

  const tamaño = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = tamaño;
  canvas.height = tamaño;
  const ctx = canvas.getContext("2d");

  // Recorta al centro para llenar el cuadrado sin deformar la imagen
  const escala = Math.max(tamaño / bitmap.width, tamaño / bitmap.height);
  const anchoEscalado = bitmap.width * escala;
  const altoEscalado = bitmap.height * escala;
  const offsetX = (tamaño - anchoEscalado) / 2;
  const offsetY = (tamaño - altoEscalado) / 2;
  ctx.drawImage(bitmap, offsetX, offsetY, anchoEscalado, altoEscalado);

  canvas.toBlob((jpgBlob) => {
    const url = window.URL.createObjectURL(jpgBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `-wp${nota.id_generacion}-${nota.cliente}.jpg`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, "image/jpeg", 0.92);
};

const formatearFechaHoraLegible = (fecha) => {
  if (!fecha) return '';
  const d = parsearFechaUTC(fecha);
  if (!d) return fecha;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const descargarCreativo = (nota, token) => {
  const tipo = getTipoHistoria(nota.banner_data); // 1 si banner_data es null
  const color = getColorHistoria(nota.banner_data); // solo aplica a tipo 1, 2 y 3
  const desplazamiento = getDesplazamientoHistoria(nota.banner_data);
  const url = `https://reportes-creativos.noticiasd.com/creativo/${nota.id_generacion}?tipo=${tipo}&token=${token}${armarParamsColorCreativo(color, desplazamiento)}&descargarjpg=si`;
  window.open(url, '_blank');
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

const notaSinNingunaDistribucion = (nota) =>
  PLATAFORMAS.every(plataforma => nota[plataforma.campoPrimerDato] == null);

const filtrarClientesSegunPendientes = (clientesObj, pendientes) => {
  const clientesFiltradosEntries = Object.entries(clientesObj).filter(([, datos]) => {
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

// El trigger de distribucion_generaciones solo completa ultima_actualizacion en UPDATE:
// una nota recién enviada a distribuir (INSERT) la trae vacía, así que se usa fecha_creacion
const fechaParaOrdenar = (nota) => {
  const fecha = parsearFechaUTC(nota.ultima_actualizacion || nota.fecha_creacion);
  return fecha ? fecha.getTime() : 0;
};

const ordenarNotasPorUltimaActualizacion = (notas) =>
  [...notas].sort((a, b) => fechaParaOrdenar(b) - fechaParaOrdenar(a));

const obtenerUltimaActualizacionMasReciente = (notas) => {
  if (!notas || notas.length === 0) return 0;
  return Math.max(...notas.map(fechaParaOrdenar));
};

function agregarPlanAlDiccionarioDeNotas(dicNotas, clientes, planes) {
  const nuevoDic = {};

  for (const [clave, notas] of Object.entries(dicNotas)) {
    nuevoDic[clave] = armarEntradaCliente(notas, clientes, planes);
  }

  return nuevoDic;
}

// { id_cliente, nombre, plan, notas } de un grupo de notas del mismo cliente
const armarEntradaCliente = (notas, clientes, planes) => {
  const { id_cliente, cliente: nombre } = notas[0];
  const municipio = clientePorId(clientes, id_cliente);
  const plan = municipio ? planes.find(p => p.id === municipio.id_plan) : null;
  return {
    id_cliente,
    nombre: municipio?.name || nombre,
    plan: plan || null,
    notas: ordenarNotasPorUltimaActualizacion(notas),
  };
};



const obtenerContratoMasReciente = (contratosDelCliente) => {
  return contratosDelCliente.reduce((masReciente, actual) => {
    if (!masReciente) return actual;
    return new Date(actual.fecha_inicio) > new Date(masReciente.fecha_inicio) ? actual : masReciente;
  }, null);
};

// distribucion-generaciones y los videos todavía no traen id_cliente: se resuelve acá,
// una sola vez al recibir los datos, y de ahí en más todo compara por id.
const conIdCliente = (registros, clientes) =>
  (registros || []).map(r => ({ ...r, id_cliente: idClienteDe(r, clientes) }));

const contratosDelCliente = (contratos, idCliente) =>
  idCliente == null ? [] : contratos.filter(c => mismoId(c.id_cliente, idCliente));

const completarContratoEnNotas = (notas, contratos) => {
  if (!notas || !contratos || contratos.length === 0) return notas;
  return notas.map(nota => {
    if (nota.id_contrato != null) return nota;
    const contrato = obtenerContratoMasReciente(contratosDelCliente(contratos, nota.id_cliente));
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

const esDistribucionDiferidaFutura = (nota) => {
  const fecha = parsearFechaUTC(nota.ultima_actualizacion);
  return !!fecha && fecha > new Date();
};

const agruparNotasPorCliente = (notas) => {
  if(!notas || notas.length === 0) return {};
  return notas.reduce((acc, nota) => {
    if(!nota.fecha_vencimiento){
      return acc;
    }
    if (esDistribucionDiferidaFutura(nota)) {
      return acc;
    }
    const clave = claveCliente(nota);
    if (!acc[clave]) {
      acc[clave] = [nota];
    } else {
      acc[clave].push(nota);
    }
    return acc;
  }, {});
};

const agruparVideosPorCliente = (videos) => {
  if (!videos || videos.length === 0) return {};
  return videos.reduce((acc, video) => {
    if (!video.cliente) return acc;
    if (esDistribucionDiferidaFutura(video)) return acc;
    const notaDeVideo = { ...video, esNotaDeVideo: true };
    const clave = claveCliente(video);
    if (!acc[clave]) {
      acc[clave] = [notaDeVideo];
    } else {
      acc[clave].push(notaDeVideo);
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
  const idClienteLogueado = useSelector((state) => state.formulario.usuario.id_cliente);
  const puedeBorrarDistribucion = useSelector((state) =>
    state.formulario.usuario.id == "300" || state.formulario.usuario.perfil == "1"
  );
  const [loading, setLoading] = useState(false); 
  const [paises, setPaises] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [comentarios, setComentarios] = useState({});
  const [termIdsPorGeneracion, setTermIdsPorGeneracion] = useState({});
  const [imagenesFeedPorGeneracion, setImagenesFeedPorGeneracion] = useState({});
  const [showContratoModal, setShowContratoModal] = useState(false);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);

  const permisoGuardarComentario = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Distribucion: Guardar comentario") || false);

  const obtenerTermId = async (nota) => {
    if (termIdsPorGeneracion[nota.id_generacion]) {
      return termIdsPorGeneracion[nota.id_generacion];
    }
    const generacion = await obtenerGeneracion(TOKEN, nota.id_generacion);
    const termId = generacion?.term_id ?? null;
    if (termId != null) {
      setTermIdsPorGeneracion(prev => ({ ...prev, [nota.id_generacion]: termId }));
    }
    if (generacion?.imagen_feed != null) {
      setImagenesFeedPorGeneracion(prev => ({ ...prev, [nota.id_generacion]: generacion.imagen_feed }));
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
    setImagenesFeedPorGeneracion(prev => {
      const actualizado = { ...prev };
      notasSinId.forEach((n, i) => {
        const imagenFeed = resultados[i]?.imagen_feed;
        if (imagenFeed != null) actualizado[n.id_generacion] = imagenFeed;
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

  const mostrarContrato = (nota) => {
    const contrato = contratos.find(c => c.id_contrato === nota.id_contrato) || null;
    setContratoSeleccionado(contrato);
    setShowContratoModal(true);
  };

  const recargarContrato = async (nota) => {
    const contratosActualizados = await obtenerContratos(TOKEN);
    setContratos(contratosActualizados);

    const contrato = obtenerContratoMasReciente(contratosDelCliente(contratosActualizados, nota.id_cliente));

    if (contrato) {
      setNotasGeneracionesAgrupadas(prev => {
        const clave = claveCliente(nota);
        const datosCliente = prev[clave];
        if (!datosCliente) return prev;
        return {
          ...prev,
          [clave]: {
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

  const borrarDistribucion = async (nota) => {
    if (!window.confirm('¿Seguro que querés borrar la distribución de esta nota?')) return;
    // El DELETE espera el id de la fila de distribucion_generaciones, no el id_generacion
    const filas = await obtenerDistribucionGeneracion(TOKEN, nota.id_generacion).catch(() => null);
    const fila = filas?.find(f => f.id == nota.id) ?? (filas?.length === 1 ? filas[0] : null);
    if (!fila) {
      alert('No se pudo identificar la distribución a borrar.');
      return;
    }
    const response = await eliminarDistribucionGeneracion(TOKEN, fila.id).catch(() => null);
    if (!response?.ok) {
      alert('No se pudo borrar la distribución.');
      return;
    }
    setNotasGeneracionesAgrupadas(prev => {
      const clave = claveCliente(nota);
      const datosCliente = prev[clave];
      if (!datosCliente) return prev;
      return {
        ...prev,
        [clave]: {
          ...datosCliente,
          notas: datosCliente.notas.filter(n => !(n.id === nota.id && !n.esNotaDeVideo)),
        },
      };
    });
  };

  useEffect(() => {
    obtenerGeo()
      .then((data) => setPaises(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error al obtener geo:', err));
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
  const resConContrato = completarContratoEnNotas(conIdCliente(res, clientes), contratos);
  const diccionarioDeCLientesConSusNotas = agruparNotasPorCliente(resConContrato);
  const agrupadasConPlanes = agregarPlanAlDiccionarioDeNotas(diccionarioDeCLientesConSusNotas, clientes, planes);
  setNotasGeneracionesAgrupadas(prev => {
    const actualizado = { ...prev };
    for (const [clave, datos] of Object.entries(agrupadasConPlanes)) {
      const notasDeVideoPrevias = actualizado[clave]?.notas?.filter(n => n.esNotaDeVideo) || [];
      actualizado[clave] = {
        ...datos,
        notas: ordenarNotasPorUltimaActualizacion([...datos.notas, ...notasDeVideoPrevias])
      };
    }
    return actualizado;
  });
  })
  .finally(() => setLoading(false));
}, [TOKEN, clientes, planes, contratos, fechaDesde, fechaHasta]);

useEffect(() => {
  // Sin la lista de clientes no se puede resolver el id de cada video
  if (clientes.length === 0) return;
  const [añoHasta, mesHasta] = fechaHasta.split("-");
  const ultimoDiaHasta = obtenerUltimoDiaMes(añoHasta, mesHasta);
  obtenerVideosYoutube(
    TOKEN,
    fechaDesde + '-01',
    `${fechaHasta}-${ultimoDiaHasta}`,
    '150',
    '0'
  ).then((res) => {
    const videosPorCliente = agruparVideosPorCliente(conIdCliente(res, clientes));
    setNotasGeneracionesAgrupadas(prev => {
      const actualizado = { ...prev };
      for (const [clave, notasDeVideo] of Object.entries(videosPorCliente)) {
        if (actualizado[clave]) {
          actualizado[clave] = {
            ...actualizado[clave],
            notas: ordenarNotasPorUltimaActualizacion([...actualizado[clave].notas, ...notasDeVideo])
          };
        } else {
          actualizado[clave] = armarEntradaCliente(notasDeVideo, clientes, planes);
        }
      }
      return actualizado;
    });
  });

}, [TOKEN, fechaDesde, fechaHasta, clientes]);

  const irANotasDelCliente = (data, fechaDesde, fechaHasta) => {
    const [añoHasta, mesHasta] = fechaHasta.split("-");
    const ultimoDiaHasta = obtenerUltimoDiaMes(añoHasta, mesHasta);
    // El nombre va en la URL solo para el título; la pantalla filtra por id_cliente
    const query = data.id_cliente != null ? `?id_cliente=${data.id_cliente}` : '';
    window.open(`/notas-cliente/${encodeURIComponent(data.nombre)}/${fechaDesde}-01/${fechaHasta}-${ultimoDiaHasta}${query}`, "_blank");
  };

// Si el cliente logueado es una FRANQUICIA, solo puede ver sus notas y las de sus cuentas creadas
const clienteLogueado = useMemo(() => (
  clientes.find((c) => c.id === idClienteLogueado)
), [clientes, idClienteLogueado]);

const idsClientesPermitidos = useMemo(() => {
  if (clienteLogueado?.tipo !== 'FRANQUICIA') return null;
  let cuentasCreadas = [];
  try {
    const datos = clienteLogueado.datosFranquicia ? JSON.parse(clienteLogueado.datosFranquicia) : null;
    cuentasCreadas = Array.isArray(datos?.cuentas_creadas) ? datos.cuentas_creadas : [];
  } catch {
    cuentasCreadas = [];
  }
  return [clienteLogueado.id, ...cuentasCreadas.map((cuenta) => cuenta.id)];
}, [clienteLogueado]);

const filteredClientes = useMemo(() => {
  const dic = notasGeneracionesAgrupadas || {};
  // Las claves son ids numéricos y el objeto las recorre por id: el orden se arma acá
  let allKeys = Object.keys(dic).sort((a, b) =>
    obtenerUltimaActualizacionMasReciente(dic[b].notas) - obtenerUltimaActualizacionMasReciente(dic[a].notas)
  );
  if (idsClientesPermitidos) {
    allKeys = allKeys.filter((clave) => idsClientesPermitidos.some((id) => mismoId(id, dic[clave].id_cliente)));
  }
  if (!search) return allKeys;
  // La búsqueda es por texto: compara contra el nombre que se muestra
  return allKeys.filter((clave) =>
    (dic[clave].nombre || '').toLowerCase().includes(search.toLowerCase())
  );
}, [search, notasGeneracionesAgrupadas, idsClientesPermitidos]);


// Listas planas del arbol geo para buscar la jurisdiccion de cada nota
const geo = useMemo(() => {
  const provincias = paises.flatMap((p) => p.provincias || []);
  const municipios = provincias.flatMap((pr) => pr.municipios || []);
  return { paises, provincias, municipios };
}, [paises]);

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


  return (
    <div className="content flex-grow-1 crearNotaGlobal distribucion">
      <div className='row miPerfilContainer soporteContainer'>
        <div className='col p-0'>
          <h3 id="saludo" className='headerTusNotas ml-0'>
              <i className="bi bi-clipboard2-check-fill" aria-hidden="true" /> Panel de Distribución
          </h3>
        </div>
      </div>
      {/* Búsqueda */}
      <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-3'>
        <div className='col buscadorNotas d-flex align-items-center gap-3 justify-content-between'> 
          {/* <button className="mb-2 btn btn-primary" onClick={() => handleEditClick(usuarioVacio)}>Crear nuevo usuario</button> */}
          <label className="distribucion__fecha">Vencimiento desde:
            <input
                type="month"
                className="form-control form-control-sm"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
            />
          </label>
          <label className="distribucion__fecha">Vencimiento hasta:
            <input
                type="month"
                className="form-control form-control-sm"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
            />
          </label>
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
              placeholder="Buscar cuentas"
            />
          </form>
        </div>
      </div>

      {/* Lista */}
      <div className='row miPerfilContainer soporteContainer mt-4 p-0'>
        <div>
          {loading ? (
          <div className="d-flex justify-content-center align-items-center distribucion__cargando">
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
                      <div className="distribucion__resumen">
                        <div className="distribucion__cliente">
                          <button onClick={() => irANotasDelCliente(data, fechaDesde, fechaHasta)} className="btn btn-link p-0 m-0 text-start">
                            <strong className={'nd-text-lg ' + (data.notas.some(notaSinNingunaDistribucion) ? 'text-danger' : 'text-primary')}>{data.nombre}</strong>
                          </button>
                          
                          <div>
                            <span><strong>Distribuibles: </strong>{data.plan ? data.plan.notas_x_mes : 0}</span>
                          </div>
                          <div>
                            <span><strong>Por publicar: </strong>{data.plan ? Number(data.plan.notas_x_mes) - data.notas.length : 0}</span>
                          </div>
                        </div>
                        <div className="distribucion__plataformas">
                        {PLATAFORMAS.map((plataforma) => (
                          <div className="distribucion__plataforma" key={plataforma.key}>
                            <i className={`bi ${plataforma.icono} fs-3 ` + obtenerColorDeEstadoDistribucion(plataforma.campoPrimerDato, data)} aria-hidden="true"></i>
                            <strong>{plataforma.label}</strong>
                            <span>Distribuidas: <strong>{data.notas.filter(n => n[plataforma.campoPrimerDato] != null).length}</strong></span>
                          </div>
                        ))}
                        </div>
                      </div>
                    </Accordion.Header>

                    <Accordion.Body>
                      <ul className="list-group">
                        {data.notas.map(nota => (
                          <li key={`${nota.id}-${nota.esNotaDeVideo ? 'video' : 'nota'}`} className="list-group-item">
                            <div className='distribucion__nota'>
                              {/* Columna 1 */}
                              {!nota.esNotaDeVideo && (
                              <div className="col">
                                <div className="row p-1">
                                  <span className={notaSinNingunaDistribucion(nota) ? 'text-danger' : ''}><strong>ID: </strong>{termIdsPorGeneracion[nota.id_generacion] ?? 'cargando...'}</span>
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
                                  <span><strong>Fecha vencimiento: </strong>{nota.fecha_vencimiento}</span>
                                </div>

                                <div className="row p-1">
                                  <span><strong>Enviado a distribuir: </strong>{formatearFechaHoraLegible(nota.fecha_creacion)}</span>
                                </div>
                                {puedeBorrarDistribucion && (
                                  <div className="row p-1">
                                    <button className="btn btn-outline-danger w-100" onClick={() => borrarDistribucion(nota)}>Borrar distribución</button>
                                  </div>
                                )}
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
                                    <button className='btn btn-outline-secondary w-100' onClick={() => descargar(nota)}>Imagen historia</button>
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
                                  {permisoGuardarComentario && (
                                    <>
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
                                    </>
                                  )}
                                  {imagenesFeedPorGeneracion[nota.id_generacion] && (
                                    <button
                                      className="btn btn-outline-secondary w-100 mt-2"
                                      onClick={() => descargarJpg(nota, imagenesFeedPorGeneracion[nota.id_generacion])}
                                    >
                                      Descargar Creativo X
                                    </button>
                                  )}
                                  {nota.id_generacion && (
                                    <button
                                      className="btn btn-outline-secondary w-100 mt-2"
                                      onClick={() => descargarCreativo(nota, TOKEN)}
                                    >
                                      Desgargar Creativo META
                                    </button>
                                  )}
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
                                


                                <div className="p-1">
                                  <strong>Search</strong>
                                  {!nota.search_titulo && !nota.search_descripcion && (
                                    <span>: Sin datos</span>
                                  )}
                                </div>
                                {nota.search_titulo && <div className="row p-1"><CopiarTexto textoACopiar={nota.search_titulo} TituloBoton={'Copiar Titulo'} /></div>}
                                {nota.search_descripcion && <div className="row p-1"><CopiarTexto textoACopiar={nota.search_descripcion} TituloBoton={'Copiar Descripcion'} /></div>}
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
                                <div className="p-1">
                                  <strong>X </strong>{!nota.x_descripcion ? ': Sin datos' : ''}</div>
                                    {nota.x_descripcion && (
                                      <div className="row p-1"><CopiarTexto textoACopiar={nota.x_descripcion} TituloBoton={'Copiar Descripcion'} /></div>
                                    )}
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
        <div className="modal fade show d-block nd-bg-overlay" tabIndex="-1">
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