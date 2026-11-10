import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Accordion, Modal, Button, Badge, Table, Form, Spinner } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import { toastExito, toastError } from '../../../utils/toastify/toastify.jsx';
import { obtenerClientes } from '../../Apis/apis';
import {
  obtenerReporteIntegrado,
  obtenerIdNoti,
  obtenerPersonalizacion,
  guardarPersonalizacion,
  eliminarPersonalizacion,
} from '../../Apis/reportesApi';
import "../../miPerfil/miPerfil.css";
import "./AbmsMobile.css";

// ---------------- DEFINICION DE CAMPOS ----------------

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const MAX_CONCLUSIONES = 2048;

const CAMPOS_I = [
  'i_dv360_clicks', 'i_dv360_impressions', 'i_dv360_users',
  'i_facebook_clicks', 'i_facebook_comments', 'i_facebook_impressions',
  'i_facebook_reaction_angry', 'i_facebook_reaction_haha',
  'i_facebook_reaction_like', 'i_facebook_reaction_love',
  'i_facebook_reaction_sorry', 'i_facebook_reaction_wow',
  'i_facebook_shared', 'i_facebook_users',
  'i_instagram_clicks', 'i_instagram_comments', 'i_instagram_impressions',
  'i_instagram_like', 'i_instagram_shared', 'i_instagram_users',
  'i_youtube_clicks', 'i_youtube_comments', 'i_youtube_impressions',
  'i_youtube_like', 'i_youtube_reproduction_play',
  'i_youtube_reproduction_25', 'i_youtube_reproduction_50',
  'i_youtube_reproduction_75', 'i_youtube_reproduction_100',
  'i_youtube_shared', 'i_youtube_users',
  'i_search_clicks', 'i_search_impressions',
  'i_x_impressions', 'i_x_users', 'i_x_link_clicks', 'i_x_likes',
  'i_x_replies', 'i_x_reposts', 'i_x_follows', 'i_x_engagements',
  'i_x_clicks', 'i_x_video_views', 'i_x_video_played_25',
  'i_x_video_played_50', 'i_x_video_played_75', 'i_x_video_completions',
  'i_x_video_starts',
];

// nombre en el reporte -> prefijo en la personalizacion de nota
const PLATAFORMAS = [
  { nombre: 'Facebook', prefijo: 'facebook' },
  { nombre: 'Instagram', prefijo: 'instagram' },
  { nombre: 'DV360', prefijo: 'dv360' },
  { nombre: 'YouTube', prefijo: 'youtube' },
  { nombre: 'X', prefijo: 'x' },
];

const CAMPOS_NUMERICOS = {
  cliente: ['impresiones', 'clicks', 'usuarios', ...CAMPOS_I],
  nota: PLATAFORMAS.flatMap(({ prefijo }) => [`${prefijo}_impresiones`, `${prefijo}_alcance`, `${prefijo}_clicks`]),
  medio: ['impresiones'],
};

// ---------------- HELPERS ----------------

const formatearNumero = (n) => (n === null || n === undefined ? '-' : Number(n).toLocaleString('es-AR'));

// URL del reporte publicado. Formato: /reporte-mensual/{id_cliente}/{mes}-{anio}
const URL_REPORTES = 'https://reportes-creativos.noticiasd.com/reporte-mensual';
const urlReportePublico = (periodo) =>
  periodo ? `${URL_REPORTES}/${periodo.idCliente}/${periodo.mes}-${periodo.anio}` : undefined;

const aTexto = (v) => (v === null || v === undefined ? '' : String(v));

// Valores de referencia (lo que muestra hoy el reporte) para cada nivel
const valoresActualesCliente = (reporte) => {
  const r = reporte?.resumen || {};
  const base = {
    impresiones: r.impresiones,
    clicks: r.clics,
    usuarios: r.usuarios,
    conclusiones: reporte?.conclusiones,
  };
  CAMPOS_I.forEach((c) => { base[c] = r.resumen?.[c]; });
  return base;
};

const valoresActualesNota = (nota) => {
  const base = { conclusiones: nota?.conclusiones };
  PLATAFORMAS.forEach(({ nombre, prefijo }) => {
    const p = nota?.plataformas?.find((pl) => pl.nombre === nombre) || {};
    base[`${prefijo}_impresiones`] = p.impresiones;
    base[`${prefijo}_alcance`] = p.alcance;
    base[`${prefijo}_clicks`] = p.clics;
  });
  return base;
};

const valoresActualesMedio = (medio) => ({
  impresiones: medio?.impresiones,
  conclusiones: medio?.conclusiones,
});

// ---------------- COMPONENTE ----------------

const GestionReportes = () => {
  const token = useSelector((state) => state.formulario.token);

  const hoy = new Date();
  const [clientes, setClientes] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [idCliente, setIdCliente] = useState('');
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth() + 1);

  const [reporte, setReporte] = useState(null);
  const [periodoCargado, setPeriodoCargado] = useState(null); // {idCliente, anio, mes}
  const [cargando, setCargando] = useState(false);

  // Estado de personalizacion por nivel
  const [persCliente, setPersCliente] = useState(null);
  const [idNotis, setIdNotis] = useState({});            // idGeneracion -> id_noti
  const [persNotas, setPersNotas] = useState({});        // id_noti -> objeto | null
  const [persMedios, setPersMedios] = useState({});      // `${id_noti}|${nombre}` -> objeto | null

  // Editor
  const [editor, setEditor] = useState(null); // { nivel, titulo, nota, medio, nuevo, referencia }
  const [form, setForm] = useState({});
  const [nombreMedioNuevo, setNombreMedioNuevo] = useState('');
  const [mostrarAvanzado, setMostrarAvanzado] = useState(false);
  const [cargandoEditor, setCargandoEditor] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Confirmacion de borrado
  const [aBorrar, setABorrar] = useState(null); // { nivel, nota, medio, descripcion }

  useEffect(() => {
    if (!token) return;
    obtenerClientes(token)
      .then((data) => setClientes(Array.isArray(data) ? data : []))
      .catch(() => setClientes([]));
  }, [token]);

  const clientesFiltrados = useMemo(() => {
    const q = busquedaCliente.trim().toLowerCase();
    const lista = [...clientes].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    if (!q) return lista;
    return lista.filter((c) => (c.name || '').toLowerCase().includes(q) || String(c.id) === q);
  }, [clientes, busquedaCliente]);

  // ---------------- CARGA DEL REPORTE ----------------

  const cargarReporte = async (periodo = periodoCargado, resolverIds = false) => {
    if (!periodo) return;
    const { idCliente: idc, anio: a, mes: m } = periodo;
    setCargando(true);
    try {
      const rep = await obtenerReporteIntegrado(token, idc, a, m);
      setReporte(rep);

      const pc = await obtenerPersonalizacion(token, idc, a, m);
      setPersCliente(pc);

      // Resolver id_noti de cada nota (solo una vez por periodo)
      let mapaIds = resolverIds ? {} : { ...idNotis };
      const faltantes = (rep.notas || []).filter((n) => !mapaIds[n.idGeneracion]);
      const resueltos = await Promise.all(faltantes.map((n) => obtenerIdNoti(token, n.idGeneracion)));
      faltantes.forEach((n, i) => { mapaIds[n.idGeneracion] = resueltos[i]; });
      setIdNotis(mapaIds);

      // Estado de personalizacion de cada nota
      const ids = (rep.notas || []).map((n) => mapaIds[n.idGeneracion]).filter(Boolean);
      const persList = await Promise.all(ids.map((id) => obtenerPersonalizacion(token, idc, a, m, id).catch(() => null)));
      const mapaPers = {};
      ids.forEach((id, i) => { mapaPers[id] = persList[i]; });
      setPersNotas(mapaPers);
    } catch (err) {
      console.error(err);
      toastError(err.message || 'No se pudo cargar el reporte.');
      if (resolverIds) setReporte(null);
    } finally {
      setCargando(false);
    }
  };

  const buscar = (e) => {
    e?.preventDefault();
    if (!idCliente) {
      toastError('Seleccioná un cliente.');
      return;
    }
    const periodo = { idCliente: Number(idCliente), anio: Number(anio), mes: Number(mes) };
    setPeriodoCargado(periodo);
    setPersMedios({});
    setIdNotis({});
    cargarReporte(periodo, true);
  };

  // Estado de personalizacion de los medios de una nota (se carga al abrir la nota)
  const cargarPersMedios = async (nota) => {
    const idNoti = idNotis[nota.idGeneracion];
    if (!idNoti || !periodoCargado) return;
    const { idCliente: idc, anio: a, mes: m } = periodoCargado;
    const medios = nota.medios || [];
    const res = await Promise.all(medios.map((md) => obtenerPersonalizacion(token, idc, a, m, idNoti, md.nombre).catch(() => null)));
    setPersMedios((prev) => {
      const nuevo = { ...prev };
      medios.forEach((md, i) => { nuevo[`${idNoti}|${md.nombre}`] = res[i]; });
      return nuevo;
    });
  };

  // ---------------- EDITOR ----------------

  const abrirEditor = async ({ nivel, nota = null, medio = null, nuevo = false }) => {
    const idNoti = nota ? idNotis[nota.idGeneracion] : null;
    if (nivel !== 'cliente' && !idNoti) {
      toastError('No se pudo obtener el id de la nota (term_id).');
      return;
    }

    let referencia = {};
    let titulo = '';
    if (nivel === 'cliente') {
      referencia = valoresActualesCliente(reporte);
      titulo = `Resumen del cliente - ${reporte?.cliente?.nombre || ''}`;
    } else if (nivel === 'nota') {
      referencia = valoresActualesNota(nota);
      titulo = `Nota: ${nota.titulo}`;
    } else {
      referencia = nuevo ? {} : valoresActualesMedio(medio);
      titulo = nuevo ? `Agregar medio a: ${nota.titulo}` : `Medio: ${medio.nombre}`;
    }

    setEditor({ nivel, titulo, nota, medio, nuevo, referencia, idNoti, personalizado: false });
    setForm({});
    setNombreMedioNuevo('');
    setMostrarAvanzado(false);

    if (nuevo) return;

    setCargandoEditor(true);
    try {
      const { idCliente: idc, anio: a, mes: m } = periodoCargado;
      const actual = await obtenerPersonalizacion(token, idc, a, m, idNoti, medio?.nombre);
      const campos = nivel === 'cliente'
        ? [...CAMPOS_NUMERICOS.cliente, 'conclusiones']
        : nivel === 'nota'
          ? [...CAMPOS_NUMERICOS.nota, 'conclusiones']
          : ['impresiones', 'conclusiones'];

      const valores = {};
      if (actual) {
        campos.forEach((c) => { valores[c] = aTexto(actual[c]); });
      } else if (nivel === 'medio') {
        // Un medio personalizado reemplaza al medio completo: precargar con el valor actual
        valores.impresiones = aTexto(medio?.impresiones);
        valores.conclusiones = aTexto(medio?.conclusiones);
      }
      setForm(valores);
      setEditor((prev) => prev && { ...prev, personalizado: !!actual });
      if (nivel === 'cliente' && actual && CAMPOS_I.some((c) => actual[c] !== null && actual[c] !== undefined)) {
        setMostrarAvanzado(true);
      }
    } catch (err) {
      toastError(err.message || 'No se pudo leer la personalización.');
    } finally {
      setCargandoEditor(false);
    }
  };

  const cerrarEditor = () => {
    if (guardando) return;
    setEditor(null);
  };

  const cambiarCampo = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const armarBody = () => {
    const nivel = editor.nivel;
    const body = {};
    const errores = [];

    CAMPOS_NUMERICOS[nivel].forEach((c) => {
      const v = (form[c] ?? '').toString().trim();
      if (v === '') {
        body[c] = null;
        return;
      }
      if (!/^\d+$/.test(v)) {
        errores.push(`"${c}" debe ser un número entero mayor o igual a 0`);
        return;
      }
      body[c] = Number(v);
    });

    const concl = (form.conclusiones ?? '').toString();
    if (concl.length > MAX_CONCLUSIONES) errores.push(`Las conclusiones superan los ${MAX_CONCLUSIONES} caracteres`);
    body.conclusiones = concl.trim() === '' ? null : concl;

    if (nivel === 'medio' && body.impresiones === null) {
      errores.push('Las impresiones del medio son obligatorias (si quedan vacías el medio aparece con 0)');
    }
    return { body, errores };
  };

  const guardar = async () => {
    const { body, errores } = armarBody();
    let nombreSitio = editor.medio?.nombre;
    if (editor.nivel === 'medio' && editor.nuevo) {
      nombreSitio = nombreMedioNuevo.trim();
      if (!nombreSitio) errores.unshift('Ingresá el nombre del medio');
    }
    if (errores.length) {
      toastError(errores.join('. '));
      return;
    }

    setGuardando(true);
    try {
      const { idCliente: idc, anio: a, mes: m } = periodoCargado;
      const idNoti = editor.nivel === 'cliente' ? undefined : editor.idNoti;
      const res = await guardarPersonalizacion(token, idc, a, m, body, idNoti, editor.nivel === 'medio' ? nombreSitio : undefined);
      if (editor.nivel === 'medio') {
        setPersMedios((prev) => ({ ...prev, [`${idNoti}|${nombreSitio}`]: res }));
      }
      toastExito('¡Personalización guardada!');
      setEditor(null);
      await cargarReporte();
    } catch (err) {
      toastError(err.message || 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  };

  // ---------------- BORRADO ----------------

  const confirmarBorrado = async () => {
    if (!aBorrar) return;
    const { nivel, nota, medio } = aBorrar;
    const { idCliente: idc, anio: a, mes: m } = periodoCargado;
    const idNoti = nota ? idNotis[nota.idGeneracion] : undefined;
    setGuardando(true);
    try {
      const ok = await eliminarPersonalizacion(token, idc, a, m, nivel === 'cliente' ? undefined : idNoti, nivel === 'medio' ? medio.nombre : undefined);
      if (nivel === 'medio') {
        setPersMedios((prev) => {
          const nuevo = { ...prev };
          delete nuevo[`${idNoti}|${medio.nombre}`];
          return nuevo;
        });
      }
      ok ? toastExito('Se restablecieron los datos reales.') : toastError('No había personalización para borrar.');
      setABorrar(null);
      setEditor(null);
      await cargarReporte();
    } catch (err) {
      toastError(err.message || 'No se pudo borrar.');
    } finally {
      setGuardando(false);
    }
  };

  // ---------------- RENDER HELPERS ----------------

  const badgePersonalizado = (activo) => activo
    ? <Badge bg="warning" text="dark" className="ms-2">Personalizado</Badge>
    : <Badge bg="secondary" className="ms-2">Datos reales</Badge>;

  const inputNumero = (campo, etiqueta) => (
    <Form.Group className="mb-2" key={campo}>
      <Form.Label className="mb-0 small">{etiqueta}</Form.Label>
      <Form.Control
        type="number"
        min={0}
        step={1}
        size="sm"
        value={form[campo] ?? ''}
        placeholder={`Actual: ${formatearNumero(editor?.referencia?.[campo])}`}
        onChange={(e) => cambiarCampo(campo, e.target.value)}
      />
    </Form.Group>
  );

  const inputConclusiones = () => (
    <Form.Group className="mb-2">
      <Form.Label className="mb-0 small">Conclusiones</Form.Label>
      <Form.Control
        as="textarea"
        rows={4}
        value={form.conclusiones ?? ''}
        maxLength={MAX_CONCLUSIONES}
        placeholder={editor?.referencia?.conclusiones || 'Sin conclusiones'}
        onChange={(e) => cambiarCampo('conclusiones', e.target.value)}
      />
      <Form.Text muted>{(form.conclusiones ?? '').length}/{MAX_CONCLUSIONES}</Form.Text>
    </Form.Group>
  );

  const renderFormulario = () => {
    if (!editor) return null;
    if (cargandoEditor) {
      return <div className="d-flex justify-content-center p-4"><Spinner animation="border" /></div>;
    }

    if (editor.nivel === 'cliente') {
      return (
        <>
          <div className="row">
            <div className="col-md-4">{inputNumero('impresiones', 'Impresiones')}</div>
            <div className="col-md-4">{inputNumero('clicks', 'Clics')}</div>
            <div className="col-md-4">{inputNumero('usuarios', 'Usuarios')}</div>
          </div>
          {inputConclusiones()}
          <Button variant="link" className="p-0 mb-2" onClick={() => setMostrarAvanzado((v) => !v)}>
            {mostrarAvanzado ? '▾' : '▸'} Campos avanzados (i_*)
          </Button>
          {mostrarAvanzado && (
            <div className="row" style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {CAMPOS_I.map((c) => <div className="col-md-4" key={c}>{inputNumero(c, c)}</div>)}
            </div>
          )}
        </>
      );
    }

    if (editor.nivel === 'nota') {
      return (
        <>
          <Table size="sm" responsive className="align-middle">
            <thead>
              <tr><th>Plataforma</th><th>Impresiones</th><th>Alcance</th><th>Clics</th></tr>
            </thead>
            <tbody>
              {PLATAFORMAS.map(({ nombre, prefijo }) => (
                <tr key={prefijo}>
                  <td><strong>{nombre}</strong></td>
                  {['impresiones', 'alcance', 'clicks'].map((m) => (
                    <td key={m}>
                      <Form.Control
                        type="number" min={0} step={1} size="sm"
                        value={form[`${prefijo}_${m}`] ?? ''}
                        placeholder={formatearNumero(editor.referencia[`${prefijo}_${m}`])}
                        onChange={(e) => cambiarCampo(`${prefijo}_${m}`, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
          {inputConclusiones()}
        </>
      );
    }

    return (
      <>
        {editor.nuevo && (
          <Form.Group className="mb-2">
            <Form.Label className="mb-0 small">Nombre del medio</Form.Label>
            <Form.Control
              size="sm"
              value={nombreMedioNuevo}
              placeholder="ej. clarin.com"
              onChange={(e) => setNombreMedioNuevo(e.target.value)}
            />
          </Form.Group>
        )}
        {inputNumero('impresiones', 'Impresiones')}
        {inputConclusiones()}
      </>
    );
  };

  // ---------------- RENDER ----------------

  const anios = [];
  for (let a = hoy.getFullYear() + 1; a >= 2020; a--) anios.push(a);

  return (
    <div id="gestion-reportes" className="content flex-grow-1 crearNotaGlobal h-100">
      <ToastContainer />
      <div className='row miPerfilContainer soporteContainer'>
        <div className='col p-0'>
          <h3 id="saludo" className='headerTusNotas ml-0'>
            <i className="icon me-2 icono_tusNotas bi bi-file-earmark-bar-graph-fill" style={{ color: 'var(--nd-color-text)' }} /> Gestión de reportes
          </h3>
          <h4 className='infoCuenta'>Personalización del reporte mensual integrado</h4>
          <div className='abajoDeTusNotas'>
            Corregí o completá a mano el reporte mensual de un cliente. Los valores cargados pisan campo por campo a las métricas reales;
            si un campo queda vacío se sigue mostrando el valor real.
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <form className='row miPerfilContainer soporteContainer mt-4 p-0 g-2 align-items-end' onSubmit={buscar}>
        <div className='col-12 col-md-5'>
          <Form.Label className="mb-0 small">Cliente</Form.Label>
          <Form.Control
            size="sm"
            className="mb-1"
            placeholder="Buscar cliente por nombre o id"
            value={busquedaCliente}
            onChange={(e) => setBusquedaCliente(e.target.value)}
          />
          <Form.Select size="sm" value={idCliente} onChange={(e) => setIdCliente(e.target.value)}>
            <option value="">Seleccioná un cliente</option>
            {clientesFiltrados.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
            ))}
          </Form.Select>
        </div>
        <div className='col-6 col-md-2'>
          <Form.Label className="mb-0 small">Año</Form.Label>
          <Form.Select size="sm" value={anio} onChange={(e) => setAnio(e.target.value)}>
            {anios.map((a) => <option key={a} value={a}>{a}</option>)}
          </Form.Select>
        </div>
        <div className='col-6 col-md-2'>
          <Form.Label className="mb-0 small">Mes</Form.Label>
          <Form.Select size="sm" value={mes} onChange={(e) => setMes(e.target.value)}>
            {MESES.map((nombre, i) => <option key={i + 1} value={i + 1}>{nombre}</option>)}
          </Form.Select>
        </div>
        <div className='col-12 col-md-3'>
          <Button type="submit" className="w-100 boton-funcion" variant="dark" size="sm" disabled={cargando}>
            {cargando ? <Spinner animation="border" size="sm" /> : 'Buscar reporte'}
          </Button>
        </div>
      </form>

      {/* CONTENIDO */}
      <div className='row miPerfilContainer soporteContainer mt-4 mb-5 p-0'>
        {cargando && !reporte ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <Spinner animation="border" variant="primary" />
          </div>
        ) : !reporte ? (
          <ul className="list-group mt-2">
            <li className="list-group-item d-flex justify-content-center">Seleccioná un cliente y un período para ver el reporte.</li>
          </ul>
        ) : (
          <>
            {/* RESUMEN DEL CLIENTE */}
            <div className="card mb-4 p-0">
              <div className="card-header d-flex flex-wrap align-items-center gap-2">
                <strong className="me-auto">
                  Resumen del cliente — {reporte.cliente?.nombre} ({MESES[(reporte.periodo?.mes || 1) - 1]} {reporte.periodo?.anio})
                  {badgePersonalizado(!!persCliente)}
                </strong>
                <Button
                  size="sm"
                  variant="dark"
                  href={urlReportePublico(periodoCargado)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-box-arrow-up-right me-1" />Ver reporte
                </Button>
                <Button size="sm" variant="outline-dark" onClick={() => abrirEditor({ nivel: 'cliente' })}>
                  <i className="bi bi-pencil-fill me-1" />Editar
                </Button>
                {persCliente && (
                  <Button size="sm" variant="outline-danger"
                    onClick={() => setABorrar({ nivel: 'cliente', descripcion: 'la personalización del resumen del cliente' })}>
                    <i className="bi bi-arrow-counterclockwise me-1" />Volver a datos reales
                  </Button>
                )}
              </div>
              <div className="card-body">
                <div className="row text-center mb-2">
                  <div className="col"><div className="small text-muted">Impresiones</div><h5>{formatearNumero(reporte.resumen?.impresiones)}</h5></div>
                  <div className="col"><div className="small text-muted">Clics</div><h5>{formatearNumero(reporte.resumen?.clics)}</h5></div>
                  <div className="col"><div className="small text-muted">Usuarios</div><h5>{formatearNumero(reporte.resumen?.usuarios)}</h5></div>
                </div>
                <div className="small text-muted">Conclusiones</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{reporte.conclusiones || <em className="text-muted">Sin conclusiones</em>}</div>
              </div>
            </div>

            {/* NOTAS */}
            <h5 className="px-0">Notas ({reporte.notas?.length || 0})</h5>
            {!reporte.notas?.length ? (
              <ul className="list-group mt-2">
                <li className="list-group-item d-flex justify-content-center">No hay notas con métricas en este período.</li>
              </ul>
            ) : (
              <Accordion className="p-0" onSelect={(key) => {
                if (key === null || key === undefined) return;
                const nota = reporte.notas[Number(key)];
                if (nota) cargarPersMedios(nota);
              }}>
                {reporte.notas.map((nota, index) => {
                  const idNoti = idNotis[nota.idGeneracion];
                  const notaPers = idNoti ? persNotas[idNoti] : null;
                  return (
                    <Accordion.Item eventKey={index.toString()} key={nota.idGeneracion}>
                      <Accordion.Header>
                        <div className="me-auto">
                          <strong>{nota.titulo}</strong>
                          {badgePersonalizado(!!notaPers)}
                          <div className="small text-muted">
                            {nota.desde} → {nota.hasta} · id_noti: {idNoti || 'no resuelto'}
                          </div>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <Button size="sm" variant="outline-dark" disabled={!idNoti} onClick={() => abrirEditor({ nivel: 'nota', nota })}>
                            <i className="bi bi-pencil-fill me-1" />Editar nota
                          </Button>
                          {notaPers && (
                            <Button size="sm" variant="outline-danger"
                              onClick={() => setABorrar({ nivel: 'nota', nota, descripcion: `la personalización de la nota "${nota.titulo}" (no afecta a sus medios)` })}>
                              <i className="bi bi-arrow-counterclockwise me-1" />Volver a datos reales
                            </Button>
                          )}
                        </div>

                        <Table size="sm" responsive bordered>
                          <thead>
                            <tr><th>Plataforma</th><th>Impresiones</th><th>Alcance</th><th>Clics</th></tr>
                          </thead>
                          <tbody>
                            {(nota.plataformas || []).map((p) => (
                              <tr key={p.nombre}>
                                <td>{p.nombre}</td>
                                <td>{formatearNumero(p.impresiones)}</td>
                                <td>{formatearNumero(p.alcance)}</td>
                                <td>{formatearNumero(p.clics)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <div className="small text-muted">Conclusiones</div>
                        <div className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                          {nota.conclusiones || <em className="text-muted">Sin conclusiones</em>}
                        </div>

                        <div className="d-flex align-items-center mb-2">
                          <strong className="me-auto">Medios ({nota.medios?.length || 0})</strong>
                          <Button size="sm" variant="outline-dark" disabled={!idNoti}
                            onClick={() => abrirEditor({ nivel: 'medio', nota, nuevo: true })}>
                            <i className="bi bi-plus-lg me-1" />Agregar medio
                          </Button>
                        </div>
                        <Table size="sm" responsive hover>
                          <thead>
                            <tr><th>Medio</th><th>Impresiones</th><th>Conclusiones</th><th style={{ width: '1%' }}></th></tr>
                          </thead>
                          <tbody>
                            {(nota.medios || []).map((md) => {
                              const medioPers = idNoti ? persMedios[`${idNoti}|${md.nombre}`] : null;
                              return (
                                <tr key={md.nombre}>
                                  <td>{md.nombre}{medioPers && <Badge bg="warning" text="dark" className="ms-2">Personalizado</Badge>}</td>
                                  <td>{formatearNumero(md.impresiones)}</td>
                                  <td className="small" style={{ whiteSpace: 'pre-wrap' }}>{md.conclusiones || '-'}</td>
                                  <td className="text-nowrap">
                                    <Button size="sm" variant="link" title="Editar medio" disabled={!idNoti}
                                      onClick={() => abrirEditor({ nivel: 'medio', nota, medio: md })}>
                                      <i className="bi bi-pencil-fill" />
                                    </Button>
                                    {medioPers && (
                                      <Button size="sm" variant="link" className="text-danger" title="Volver a datos reales"
                                        onClick={() => setABorrar({ nivel: 'medio', nota, medio: md, descripcion: `la personalización del medio "${md.nombre}". Si fue agregado a mano, desaparecerá del reporte` })}>
                                        <i className="bi bi-trash-fill" />
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                            {!nota.medios?.length && (
                              <tr><td colSpan={4} className="text-center text-muted">Sin medios</td></tr>
                            )}
                          </tbody>
                        </Table>
                      </Accordion.Body>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            )}
          </>
        )}
      </div>

      {/* MODAL EDITOR */}
      <Modal show={!!editor} onHide={cerrarEditor} size={editor?.nivel === 'medio' ? undefined : 'lg'} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1.1rem' }}>
            {editor?.titulo}
            {editor && !editor.nuevo && !cargandoEditor && badgePersonalizado(editor.personalizado)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editor && editor.nivel !== 'medio' && (
            <p className="small text-muted">
              Dejá un campo vacío para que el reporte muestre el valor real (se muestra como referencia en gris).
            </p>
          )}
          {renderFormulario()}
        </Modal.Body>
        <Modal.Footer>
          {editor?.personalizado && (
            <Button variant="outline-danger" className="me-auto" disabled={guardando}
              onClick={() => setABorrar({
                nivel: editor.nivel, nota: editor.nota, medio: editor.medio,
                descripcion: 'esta personalización',
              })}>
              Volver a datos reales
            </Button>
          )}
          <Button variant="secondary" onClick={cerrarEditor} disabled={guardando}>Cancelar</Button>
          <Button variant="dark" onClick={guardar} disabled={guardando || cargandoEditor}>
            {guardando ? <Spinner animation="border" size="sm" /> : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL CONFIRMAR BORRADO */}
      <Modal show={!!aBorrar} onHide={() => !guardando && setABorrar(null)} centered style={{ zIndex: 1060 }}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1.1rem' }}>Volver a datos reales</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Seguro que querés borrar {aBorrar?.descripcion}? El reporte volverá a mostrar los valores reales.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setABorrar(null)} disabled={guardando}>Cancelar</Button>
          <Button variant="danger" onClick={confirmarBorrado} disabled={guardando}>
            {guardando ? <Spinner animation="border" size="sm" /> : 'Borrar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GestionReportes;
