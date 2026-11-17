// Ruta padre del editor: /notas/editar/:clave (CrearNota) y /notas/editar/:clave/publicar (PublicarNota).
//
// 1. Hidrata la nota de la URL: si la que está en memoria es de esta clave la usa (se abrió
//    desde el listado en esta pestaña); si no, la restaura del borrador local (IndexedDB).
// 2. Guarda un borrador local por nota (debounce + al cerrar/ocultar la pestaña), así cada
//    pestaña edita su nota y cerrar la pestaña no pierde cambios.
// 3. Si al abrir una nota hay un borrador local con cambios, ofrece recuperarlo.
// 4. Avisa si la misma nota está abierta en otra pestaña.
// No hay autoguardado en el servidor: la nota llega al servidor solo al guardar/publicar.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { Alert, Button, Modal, Spinner } from 'react-bootstrap';
import { resetCrearNota, setCambiarEstadoActual, setClaveEdicion } from '@/store/crearNotaSlice';
import { setEstadoDistribucion } from '@/store/distribucionNotaSlice';
import { borrarBorrador, guardarBorrador, leerBorrador, limpiarBorradoresViejos } from '@/shared/utils/borradoresDB';
import { esBorradorCerrado, esClaveNueva, firmaDistribucion, firmaNota, reabrirBorrador } from './navegacionEditor';

const DEBOUNCE_MS = 1000;
const CANAL = 'nd-editor-notas';
const idPestana = Math.random().toString(36).slice(2);

const haceCuanto = (ms) => {
  const min = Math.round((Date.now() - ms) / 60000);
  if (min < 1) return 'hace menos de un minuto';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} días`;
};

const EditorNota = () => {
  const { clave } = useParams();
  const dispatch = useDispatch();
  const store = useStore();
  const es_editor = useSelector((state) => state.formulario.es_editor);
  const nota = useSelector((state) => state.crearNota);
  const distribucion = useSelector((state) => state.distribucionNota);

  // 'cargando' | 'listo' | 'recuperar' | 'sinDatos'
  const [estado, setEstado] = useState('cargando');
  const [borradorPendiente, setBorradorPendiente] = useState(null);
  const [abiertaEnOtraPestana, setAbiertaEnOtraPestana] = useState(false);

  // ---------- 1. Hidratación ----------
  const aplicarBorrador = useCallback((borrador) => {
    dispatch(resetCrearNota());
    const base = store.getState().crearNota;
    dispatch(setCambiarEstadoActual({ ...base, ...borrador.nota, claveEdicion: clave }));
    dispatch(setEstadoDistribucion(borrador.distribucion || {}));
  }, [dispatch, store, clave]);

  useEffect(() => {
    let cancelado = false;
    setEstado('cargando');
    reabrirBorrador(clave);
    limpiarBorradoresViejos().catch(() => {});

    const hidratar = async () => {
      const enMemoria = store.getState().crearNota;
      let borrador = null;
      try { borrador = await leerBorrador(clave); } catch (e) { console.warn('No se pudo leer el borrador local', e); }
      if (cancelado) return;

      if (enMemoria.claveEdicion === clave) {
        // La nota se cargó en esta pestaña (desde el listado o el dashboard)
        const sinCategorias = { conCategorias: false };
        if (borrador && firmaNota(borrador.nota, sinCategorias) !== firmaNota(enMemoria, sinCategorias)) {
          setBorradorPendiente(borrador);
          setEstado('recuperar');
          return;
        }
        if (borrador) {
          // Mismo contenido que la versión del servidor. Si tenía distribución editada
          // localmente para esta nota, se conserva; si no, el borrador ya no aporta nada.
          const dist = borrador.distribucion;
          if (dist?.id_nota_cargada && String(dist.id_nota_cargada) === String(enMemoria.id_noti)) {
            dispatch(setEstadoDistribucion(dist));
          } else {
            borrarBorrador(clave).catch(() => {});
          }
        }
        setEstado('listo');
        return;
      }

      if (borrador) {
        aplicarBorrador(borrador);
        setEstado('listo');
      } else if (esClaveNueva(clave)) {
        dispatch(resetCrearNota());
        dispatch(setClaveEdicion(clave));
        setEstado('listo');
      } else {
        // Nota existente sin copia local: no hay API para traerla por id, se abre desde el listado
        setEstado('sinDatos');
      }
    };
    hidratar();
    return () => { cancelado = true; };
  }, [clave, dispatch, store, aplicarBorrador]);

  const recuperar = () => {
    aplicarBorrador(borradorPendiente);
    setBorradorPendiente(null);
    setEstado('listo');
  };
  const descartar = async () => {
    try { await borrarBorrador(clave); } catch (e) { /* sin borrador que borrar */ }
    setBorradorPendiente(null);
    setEstado('listo');
  };

  // ---------- 2. Borrador local ----------
  const base = useRef(null);       // firmas al terminar de hidratar
  const sucio = useRef(false);      // hubo cambios desde que se abrió
  const timer = useRef(null);

  useEffect(() => {
    if (estado !== 'listo') return;
    const s = store.getState();
    base.current = {
      nota: firmaNota(s.crearNota),
      dist: firmaDistribucion(s.distribucionNota, s.crearNota),
      idDistCargada: s.distribucionNota.id_nota_cargada,
    };
    sucio.current = false;
  }, [estado, store]);

  const guardarAhora = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = null;
    const s = store.getState();
    if (s.crearNota.claveEdicion !== clave || esBorradorCerrado(clave)) return;
    guardarBorrador(clave, { nota: s.crearNota, distribucion: s.distribucionNota })
      .catch((e) => console.warn('No se pudo guardar el borrador local', e));
  }, [store, clave]);

  useEffect(() => {
    if (estado !== 'listo' || !base.current || nota.claveEdicion !== clave) return;

    // Cuando la distribución llega de la API, esa es la nueva base (no es un cambio del usuario)
    if (distribucion.id_nota_cargada !== base.current.idDistCargada) {
      base.current.idDistCargada = distribucion.id_nota_cargada;
      base.current.dist = firmaDistribucion(distribucion, nota);
    }
    if (!sucio.current) {
      sucio.current = firmaNota(nota) !== base.current.nota
        || firmaDistribucion(distribucion, nota) !== base.current.dist;
    }
    if (!sucio.current) return;

    clearTimeout(timer.current);
    timer.current = setTimeout(guardarAhora, DEBOUNCE_MS);
  }, [nota, distribucion, estado, clave, guardarAhora]);

  // Al cerrar u ocultar la pestaña, o al salir del editor: guardar lo pendiente ya
  useEffect(() => {
    const flush = () => { if (timer.current) guardarAhora(); };
    const alOcultar = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', alOcultar);
    return () => {
      flush();
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', alOcultar);
    };
  }, [guardarAhora]);

  // ---------- 4. Misma nota en otra pestaña ----------
  useEffect(() => {
    if (!('BroadcastChannel' in window)) return;
    setAbiertaEnOtraPestana(false);
    const canal = new BroadcastChannel(CANAL);
    canal.onmessage = ({ data }) => {
      if (!data || data.clave !== clave || data.pestana === idPestana) return;
      if (data.tipo === 'abierta') {
        setAbiertaEnOtraPestana(true);
        canal.postMessage({ tipo: 'tambien-abierta', clave, pestana: idPestana });
      }
      if (data.tipo === 'tambien-abierta') setAbiertaEnOtraPestana(true);
      if (data.tipo === 'cerrada') setAbiertaEnOtraPestana(false);
    };
    canal.postMessage({ tipo: 'abierta', clave, pestana: idPestana });
    return () => {
      canal.postMessage({ tipo: 'cerrada', clave, pestana: idPestana });
      canal.close();
    };
  }, [clave]);

  // ---------- Render ----------
  const rutaListado = es_editor ? '/notasEditorial' : '/notas';

  if (estado === 'cargando') {
    return (
      <div className="nd-empty">
        <Spinner animation="border" />
      </div>
    );
  }

  if (estado === 'sinDatos') {
    return (
      <div className="nd-page">
        <div className="nd-empty">
          <i className="bi bi-file-earmark-x nd-empty__icon" aria-hidden="true"></i>
          <p className="nd-empty__title">No hay una copia de esta nota en este navegador</p>
          <p>Abrila desde el listado de notas para editarla.</p>
          <Link to={rutaListado} className="btn btn-primary">Ir a Notas</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Modal show={estado === 'recuperar'} centered backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Tenés cambios sin guardar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            En este navegador hay una versión de <strong>{borradorPendiente?.titulo || 'esta nota'}</strong> con
            cambios que no se publicaron, guardada {borradorPendiente ? haceCuanto(borradorPendiente.guardadoEn) : ''}.
          </p>
          <p className="nd-text-secondary mb-0">¿Querés seguir desde esos cambios o usar la versión del servidor?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={descartar}>Descartar mis cambios</Button>
          <Button variant="primary" onClick={recuperar}>Recuperar mis cambios</Button>
        </Modal.Footer>
      </Modal>

      {abiertaEnOtraPestana && (
        <Alert variant="warning" className="m-3 mb-0" dismissible onClose={() => setAbiertaEnOtraPestana(false)}>
          <i className="bi bi-exclamation-triangle me-2" aria-hidden="true"></i>
          Esta nota también está abierta en otra pestaña. Si editás en las dos, la última que guarde pisa a la otra.
        </Alert>
      )}

      {estado === 'listo' && <Outlet />}
    </>
  );
};

export default EditorNota;
