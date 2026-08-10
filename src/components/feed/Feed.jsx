import React, { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useSelector } from 'react-redux';
import ModalMensaje from '@/components/administrador/gestores/ModalMensaje';
import { obtenerClientes, obtenerNotasDeGeneraciones } from '@/components/administrador/gestores/apisUsuarios';
import SelectorConBuscador from '@/components/nota/Editorial/SelectorConBuscador';
import {
  crearFeed,
  obtenerFeedsPorCliente,
  actualizarFeed,
  eliminarFeed,
  agregarNotaAFeed,
  quitarNotaDeFeed,
} from '@/components/Apis/apis';

const FEED_VACIO = { name: '', client_id: null };

const AbmFeed = () => {
  const TOKEN = useSelector((state) => state.formulario.token);

  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const [feedSeleccionado, setFeedSeleccionado] = useState(null);
  const [formFeed, setFormFeed] = useState(FEED_VACIO);
  const [loading, setLoading] = useState(false);

  const [notasDisponibles, setNotasDisponibles] = useState([]);
  const [cargandoNotas, setCargandoNotas] = useState(false);
  const [busquedaNota, setBusquedaNota] = useState('');
  const [prioritariasPorNota, setPrioritariasPorNota] = useState({});
  const [agregandoNota, setAgregandoNota] = useState(null);
  const [urlNota, setUrlNota] = useState('');
  const [agregandoNotaUrl, setAgregandoNotaUrl] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [mensajeModal, setMensajeModal] = useState('');

  useEffect(() => {
    obtenerClientes(TOKEN).then(setClientes);
  }, [TOKEN]);

  const cargarFeeds = (cliente) => {
    setLoading(true);
    obtenerFeedsPorCliente(TOKEN, cliente.id)
      .then(setFeeds)
      .finally(() => setLoading(false));
  };

  const handleSeleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setFeeds([]);
    if (cliente) cargarFeeds(cliente);
  };

  const abrirModalCrear = () => {
    setFeedSeleccionado(null);
    setFormFeed({ name: '', client_id: clienteSeleccionado.id });
    const modal = new window.bootstrap.Modal(document.getElementById('feedModal'));
    modal.show();
  };

  const abrirModalEditar = (feed) => {
    setFeedSeleccionado(feed);
    setFormFeed({ name: feed.name, client_id: feed.client_id });
    setBusquedaNota('');
    setPrioritariasPorNota({});
    setCargandoNotas(true);
    obtenerNotasDeGeneraciones(TOKEN, clienteSeleccionado.name, '', '', 'PUBLICADO', '150', '0', '', '')
      .then(setNotasDisponibles)
      .finally(() => setCargandoNotas(false));
    const modal = new window.bootstrap.Modal(document.getElementById('feedModal'));
    modal.show();
  };

  const cerrarModal = () => {
    window.bootstrap.Modal.getInstance(document.getElementById('feedModal'))?.hide();
  };

  const handleGuardar = () => {
    if (!formFeed.name.trim()) return;
    setLoading(true);
    const promesa = feedSeleccionado
      ? actualizarFeed(TOKEN, feedSeleccionado.feed_id, { name: formFeed.name })
      : crearFeed(TOKEN, clienteSeleccionado.id, formFeed.name);

    promesa
      .then(() => {
        cerrarModal();
        setMensajeModal('Los cambios se guardaron correctamente.');
        setShowModal(true);
        cargarFeeds(clienteSeleccionado);
      })
      .catch(() => {
        setMensajeModal('Ocurrió un error al guardar.');
        setShowModal(true);
      })
      .finally(() => setLoading(false));
  };

  const handleEliminar = (feed) => {
    if (!window.confirm(`¿Eliminar el feed "${feed.name}"?`)) return;
    setLoading(true);
    eliminarFeed(TOKEN, feed.feed_id)
      .then(() => {
        setMensajeModal('Feed eliminado correctamente.');
        setShowModal(true);
        cargarFeeds(clienteSeleccionado);
      })
      .catch(() => {
        setMensajeModal('Error al eliminar el feed.');
        setShowModal(true);
      })
      .finally(() => setLoading(false));
  };

  const handleAgregarNota = (nota) => {
    const generacionId = String(nota.term_id);
    const prioritaria = prioritariasPorNota[generacionId] || false;
    setAgregandoNota(generacionId);
    agregarNotaAFeed(TOKEN, feedSeleccionado.feed_id, parseInt(nota.id), prioritaria, null)
      .then((notaAgregada) => {
        setFeedSeleccionado((prev) => ({
          ...prev,
          notes: [...prev.notes, notaAgregada],
        }));
        setFeeds((prev) =>
          prev.map((f) =>
            f.feed_id === feedSeleccionado.feed_id
              ? { ...f, notes: [...f.notes, notaAgregada] }
              : f
          )
        );
      })
      .catch(() => {
        setMensajeModal('Error al agregar la nota (puede que ya esté en el feed).');
        setShowModal(true);
      })
      .finally(() => setAgregandoNota(null));
  };

  const handleAgregarNotaPorUrl = () => {
    const match = urlNota.trim().match(/-(\d+)$/);
    if (!match) {
      setMensajeModal('URL inválida: no se encontró el ID al final de la URL.');
      setShowModal(true);
      return;
    }
    const termId = match[1];
    setAgregandoNotaUrl(true);
    agregarNotaAFeed(TOKEN, feedSeleccionado.feed_id, null, false, termId)
      .then((notaAgregada) => {
        setFeedSeleccionado((prev) => ({ ...prev, notes: [...prev.notes, notaAgregada] }));
        setFeeds((prev) =>
          prev.map((f) =>
            f.feed_id === feedSeleccionado.feed_id
              ? { ...f, notes: [...f.notes, notaAgregada] }
              : f
          )
        );
        setUrlNota('');
      })
      .catch(() => {
        setMensajeModal('Error al agregar la nota (puede que ya esté en el feed o esté eliminada).');
        setShowModal(true);
      })
      .finally(() => setAgregandoNotaUrl(false));
  };

  const handleQuitarNota = (generacionId) => {
    quitarNotaDeFeed(TOKEN, feedSeleccionado.feed_id, generacionId)
      .then(() => {
        setFeedSeleccionado((prev) => ({
          ...prev,
          notes: prev.notes.filter((n) => n.generacion_id !== generacionId),
        }));
        setFeeds((prev) =>
          prev.map((f) =>
            f.feed_id === feedSeleccionado.feed_id
              ? { ...f, notes: f.notes.filter((n) => n.generacion_id !== generacionId) }
              : f
          )
        );
      })
      .catch(() => {
        setMensajeModal('Error al quitar la nota.');
        setShowModal(true);
      });
  };

  const handleTogglePrioritaria = (nota) => {
    const notasActualizadas = feedSeleccionado.notes.map((n) =>
      n.generacion_id === nota.generacion_id ? { ...n, prioritaria: !n.prioritaria } : n
    );
    actualizarFeed(TOKEN, feedSeleccionado.feed_id, {
      notes: notasActualizadas.map(({ generacion_id, prioritaria, order }) => ({
        generacion_id,
        prioritaria,
        order,
      })),
    })
      .then((feedActualizado) => {
        setFeedSeleccionado(feedActualizado);
        setFeeds((prev) =>
          prev.map((f) => (f.feed_id === feedActualizado.feed_id ? feedActualizado : f))
        );
      })
      .catch(() => {
        setMensajeModal('Error al actualizar la nota.');
        setShowModal(true);
      });
  };

  const notasDelFeedOrdenadas = useMemo(() => {
    if (!feedSeleccionado) return [];
    return [...feedSeleccionado.notes].sort((a, b) => {
      if (a.prioritaria !== b.prioritaria) return b.prioritaria - a.prioritaria;
      return b.order - a.order;
    });
  }, [feedSeleccionado]);

  const handleMoverNota = (nota, direccion) => {
    const idx = notasDelFeedOrdenadas.findIndex((n) => n.generacion_id === nota.generacion_id);
    const swapIdx = direccion === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= notasDelFeedOrdenadas.length) return;
    if (notasDelFeedOrdenadas[swapIdx].prioritaria !== nota.prioritaria) return;

    const reordenadas = [...notasDelFeedOrdenadas];
    [reordenadas[idx], reordenadas[swapIdx]] = [reordenadas[swapIdx], reordenadas[idx]];

    const prioNotas = reordenadas.filter((n) => n.prioritaria);
    const normalNotas = reordenadas.filter((n) => !n.prioritaria);
    const conNuevosOrders = [
      ...prioNotas.map((n, i) => ({ ...n, order: prioNotas.length - i })),
      ...normalNotas.map((n, i) => ({ ...n, order: normalNotas.length - i })),
    ];

    actualizarFeed(TOKEN, feedSeleccionado.feed_id, {
      notes: conNuevosOrders.map(({ generacion_id, prioritaria, order }) => ({
        generacion_id, prioritaria, order,
      })),
    })
      .then((feedActualizado) => {
        setFeedSeleccionado(feedActualizado);
        setFeeds((prev) => prev.map((f) => (f.feed_id === feedActualizado.feed_id ? feedActualizado : f)));
      })
      .catch(() => {
        setMensajeModal('Error al reordenar.');
        setShowModal(true);
      });
  };

  const idsEnFeed = useMemo(
    () => new Set(feedSeleccionado?.notes.map((n) => n.generacion_id) ?? []),
    [feedSeleccionado]
  );

  const notasFiltradas = useMemo(() => {
    const q = busquedaNota.toLowerCase();
    return notasDisponibles.filter(
      (n) => !q || n.titulo?.toLowerCase().includes(q) || String(n.term_id).includes(q)
    );
  }, [notasDisponibles, busquedaNota]);

  return (
    <div className="content flex-grow-1 crearNotaGlobal">
      {/* Header */}
      <div className="row miPerfilContainer soporteContainer">
        <div className="col p-0">
          <h3 id="saludo" className="headerTusNotas ml-0">
            <i className="bi bi-rss-fill icon me-2 icono_tusNotas" /> Gestión de Feeds
          </h3>
          <h4 className="infoCuenta">Administrá los feeds curados por cliente</h4>
        </div>
      </div>

      {/* Selector de cliente */}
      <div className="row miPerfilContainer soporteContainer mt-4 p-0 mb-3">
        <div className="col-2">
          <SelectorConBuscador
            title="Cliente"
            options={clientes}
            selectedOption={clienteSeleccionado || ''}
            onSelect={handleSeleccionarCliente}
            onClear={() => { setClienteSeleccionado(null); setFeeds([]); }}
          />
        </div>
      </div>

      {/* Lista de feeds */}
      {clienteSeleccionado && (
        <div className="row miPerfilContainer soporteContainer mt-2 p-0">
          <div className="col">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <strong>Feeds de {clienteSeleccionado.name}</strong>
              <button className="btn btn-primary btn-sm" onClick={abrirModalCrear}>
                <i className="bi bi-plus-lg me-1" /> Nuevo feed
              </button>
            </div>

            {loading ? (
              <p className="text-muted">Cargando...</p>
            ) : feeds.length === 0 ? (
              <p className="text-muted">Este cliente no tiene feeds todavía.</p>
            ) : (
              <ul className="list-group">
                {feeds.map((feed) => (
                  <li key={feed.feed_id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{feed.name}</strong>
                        <span className="text-muted ms-2 small">
                          {feed.notes.length} nota{feed.notes.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => abrirModalEditar(feed)}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleEliminar(feed)}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Modal crear / editar feed */}
      <div className="modal fade" id="feedModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {feedSeleccionado ? `Editar feed: ${feedSeleccionado.name}` : 'Nuevo feed'}
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>

            <div className="modal-body">
              {/* Nombre */}
              <div className="mb-3">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formFeed.name}
                  onChange={(e) => setFormFeed({ ...formFeed, name: e.target.value })}
                  placeholder="Ej: Home principal"
                />
              </div>

              {/* Agregar nota por URL (solo en edición) */}
              {feedSeleccionado && (
                <div className="mb-3">
                  <label className="form-label">Agregar nota con URL</label>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="https://noticiasd.com/.../titulo-de-la-nota-201315510"
                      value={urlNota}
                      onChange={(e) => setUrlNota(e.target.value)}
                    />
                    <button
                      className="btn btn-outline-primary flex-shrink-0"
                      onClick={handleAgregarNotaPorUrl}
                      disabled={!urlNota.trim() || agregandoNotaUrl}
                    >
                      {agregandoNotaUrl ? 'Agregando...' : 'Agregar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Notas (solo en edición) */}
              {feedSeleccionado && (
                <div className="row mt-3">

                  {/* Columna izquierda: notas en el feed */}
                  <div className="col-md-5">
                    <h6 className="fw-bold mb-2">Notas en el feed ({feedSeleccionado.notes.length})</h6>
                    {notasDelFeedOrdenadas.length === 0 ? (
                      <p className="text-muted small">Sin notas todavía.</p>
                    ) : (
                      <ul className="list-group" style={{ maxHeight: 420, overflowY: 'auto' }}>
                        {notasDelFeedOrdenadas.map((nota, idx) => {
                          const esPrimeroDelGrupo = idx === 0 || notasDelFeedOrdenadas[idx - 1].prioritaria !== nota.prioritaria;
                          const esUltimoDelGrupo = idx === notasDelFeedOrdenadas.length - 1 || notasDelFeedOrdenadas[idx + 1].prioritaria !== nota.prioritaria;
                          return (
                          <li
                            key={nota.generacion_id}
                            className="list-group-item py-2 px-2"
                          >
                            <div className="d-flex justify-content-between align-items-start gap-2">
                              <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                                {nota.imagen_principal && (
                                  <img
                                    src={"https://panel.serviciosd.com/img" + nota.imagen_principal}
                                    alt=""
                                    style={{ width: 40, height: 40, objectFit: 'cover', flexShrink: 0 }}
                                  />
                                )}
                                <div style={{ minWidth: 0 }}>
                                  <div className="small fw-semibold text-truncate" title={nota.titulo}>{nota.titulo || `#${nota.generacion_id}`}</div>
                                  <div className={`small ${nota.publicada ? 'text-success' : 'text-muted'}`}>
                                    {nota.publicada ? 'Publicada' : 'No publicada'}
                                  </div>
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-1 flex-shrink-0">
                                <div className="d-flex flex-column gap-0">
                                  <button
                                    className="btn btn-outline-secondary py-0 px-1"
                                    style={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                                    disabled={esPrimeroDelGrupo}
                                    onClick={() => handleMoverNota(nota, 'up')}
                                  >
                                    <i className="bi bi-chevron-up" />
                                  </button>
                                  <button
                                    className="btn btn-outline-secondary py-0 px-1"
                                    style={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                                    disabled={esUltimoDelGrupo}
                                    onClick={() => handleMoverNota(nota, 'down')}
                                  >
                                    <i className="bi bi-chevron-down" />
                                  </button>
                                </div>
                                <div className="form-check form-switch mb-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`prio-${nota.generacion_id}`}
                                    checked={nota.prioritaria}
                                    onChange={() => handleTogglePrioritaria(nota)}
                                  />
                                  <label className="form-check-label small" htmlFor={`prio-${nota.generacion_id}`}>
                                    Prio
                                  </label>
                                </div>
                                <button
                                  className="btn btn-outline-danger btn-sm py-0"
                                  onClick={() => handleQuitarNota(nota.generacion_id)}
                                >
                                  <i className="bi bi-x-lg" />
                                </button>
                              </div>
                            </div>
                          </li>
                        );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* Columna derecha: notas disponibles para agregar */}
                  <div className="col-md-7">
                    <h6 className="fw-bold mb-2">Notas publicadas del cliente</h6>
                    <input
                      type="text"
                      className="form-control form-control-sm mb-2"
                      placeholder="Buscar por título o ID..."
                      value={busquedaNota}
                      onChange={(e) => setBusquedaNota(e.target.value)}
                    />
                    {cargandoNotas ? (
                      <p className="text-muted small">Cargando notas...</p>
                    ) : (
                      <ul className="list-group" style={{ maxHeight: 400, overflowY: 'auto' }}>
                        {notasFiltradas.length === 0 ? (
                          <li className="list-group-item text-muted small">Sin resultados.</li>
                        ) : (
                          notasFiltradas.map((nota) => {
                            const genId = String(nota.term_id);
                            const yaEsta = idsEnFeed.has(genId);
                            return (
                              <li
                                key={nota.term_id}
                                className={`list-group-item py-2 px-2 ${yaEsta ? 'list-group-item-success' : ''}`}
                              >
                                <div className="d-flex justify-content-between align-items-start gap-2">
                                  <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                                    {nota.imagen ? (
                                      nota.imagen.includes('wp-content/uploads') ?
                                        <img src={nota.imagen} alt="" style={{ width: 40, height: 40, objectFit: 'cover', flexShrink: 0 }} /> :
                                        <img src={'https://noticiasd.com/img' + nota.imagen} alt="" style={{ width: 40, height: 40, objectFit: 'cover', flexShrink: 0 }} />
                                    ) : (
                                      <img src={"https://panel.serviciosd.com/img/" + nota.imagen_principal} alt="" style={{ width: 40, height: 40, objectFit: 'cover', flexShrink: 0 }} />
                                    )}
                                    <div style={{ minWidth: 0 }}>
                                      <div className="small fw-semibold text-truncate" title={nota.titulo}>
                                        {nota.titulo}
                                      </div>
                                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        #{nota.term_id}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                    {!yaEsta && (
                                      <div className="form-check mb-0">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          id={`prio-new-${nota.term_id}`}
                                          checked={prioritariasPorNota[genId] || false}
                                          onChange={(e) =>
                                            setPrioritariasPorNota((prev) => ({
                                              ...prev,
                                              [genId]: e.target.checked,
                                            }))
                                          }
                                        />
                                        <label className="form-check-label small" htmlFor={`prio-new-${nota.term_id}`}>
                                          Prio
                                        </label>
                                      </div>
                                    )}
                                    <button
                                      className="btn btn-sm btn-outline-primary py-0"
                                      disabled={yaEsta || agregandoNota === genId}
                                      onClick={() => handleAgregarNota(nota)}
                                    >
                                      {yaEsta ? <i className="bi bi-check-lg" /> : agregandoNota === genId ? '...' : <i className="bi bi-plus-lg" />}
                                    </button>
                                  </div>
                                </div>
                              </li>
                            );
                          })
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGuardar}
                disabled={!formFeed.name.trim() || loading}
              >
                {feedSeleccionado ? 'Guardar nombre' : 'Crear feed'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModalMensaje
        show={showModal}
        mensaje={mensajeModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default AbmFeed;
