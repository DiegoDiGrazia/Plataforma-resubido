import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import ModalMensaje from '../administrador/gestores/ModalMensaje';
import { obtenerClientes, obtenerGeo, obtenerPrecioUsuario, setComprarDistribucion, obtenerConsolidacionCliente } from '../administrador/gestores/apisUsuarios';
import ArbolConSelectorMultiple from './ArbolConSelectorMultiple';
import InputFecha from '../nota/Editorial/InputFecha';
import BotonDistribuirNota from './BotonDistribuir';
import Checkbox from '../nota/Editorial/checkbox';
import { useNavigate } from 'react-router-dom';

export const formatearARS = (valor, decimales = 2) => {
  if (valor === null || valor === undefined || isNaN(valor)) return "$ 0,00";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(Number(valor));
};

const BarraProgreso = ({ nota }) => {
  const estaPublicada  = nota?.estado === 'PUBLICADO';
  const estaEnviada    = nota?.con_distribucion == 1;
  const estaDistribuida = nota?.primer_dato_en_meta != null || nota?.primer_dato_en_360 != null;
  const vencimiento    = nota?.fecha_vencimiento ? new Date(nota.fecha_vencimiento) : null;
  const estaFinalizada = vencimiento && vencimiento < new Date();

  const pasosIntermedios = (estaPublicada && !estaEnviada)
    ? [
        { label: 'Publicada',            icon: 'bi-check-circle', activo: true  },
        { label: 'Enviada a distribuir', icon: 'bi-send',         activo: false },
      ]
    : [
        { label: 'Enviada a distribuir', icon: 'bi-send',         activo: estaEnviada   },
        { label: 'Publicada',            icon: 'bi-check-circle', activo: estaPublicada },
      ];

  const pasos = [
    { label: 'En revisión', icon: 'bi-hourglass-split', activo: true },
    ...pasosIntermedios,
    { label: 'Distribuida', icon: 'bi-broadcast', activo: estaDistribuida },
    { label: 'Finalizada',  icon: 'bi-flag',      activo: estaFinalizada  },
  ];

  let pasoActual = 0;
  pasos.forEach((p, i) => { if (p.activo) pasoActual = i; });

  return (
    <div className="d-flex align-items-center justify-content-center py-3 px-2">
      {pasos.map((paso, idx) => {
        const activo    = idx <= pasoActual;
        const esCurrent = idx === pasoActual;
        return (
          <React.Fragment key={paso.label}>
            <div className="d-flex flex-column align-items-center" style={{ minWidth: 90 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: activo ? '#1a73e8' : '#e0e0e0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: esCurrent ? '0 0 0 4px rgba(26,115,232,0.2)' : 'none',
                transition: 'all .3s',
              }}>
                <i className={`bi ${paso.icon}`} style={{ color: activo ? '#fff' : '#9e9e9e', fontSize: 16, margin: '0px' }} />
              </div>
              <span style={{
                marginTop: 6, fontSize: 12, fontWeight: esCurrent ? 700 : 400,
                color: activo ? '#1a73e8' : '#9e9e9e',
              }}>
                {paso.label}
              </span>
            </div>
            {idx < pasos.length - 1 && (
              <div style={{
                flex: 1, height: 3, background: idx < pasoActual ? '#1a73e8' : '#e0e0e0',
                margin: '0 4px', marginBottom: 20, transition: 'all .3s',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const parsearEntradaDistribucion = (entrada) => {
  const partes = entrada.split('|| DETALLE:');
  if (partes.length < 2) return null;

  const totales = {};
  let fechaFin = null;
  partes[0].trim().split(' | ').forEach(p => {
    const mFecha = p.match(/^FECHA FIN: (.+)/);
    if (mFecha) { fechaFin = mFecha[1].trim(); return; }
    const m = p.match(/^TOTAL(?: (.+?))?: \$ ([\d.,]+)/);
    if (m) totales[m[1] ? m[1].trim() : 'TOTAL'] = m[2];
  });

  const localidades = partes[1].trim().split(' || ').filter(Boolean).map(entry => {
    const idx = entry.indexOf(' | ');
    const lugarStr = idx >= 0 ? entry.substring(0, idx).trim() : entry.trim();
    const costosStr = idx >= 0 ? entry.substring(idx + 3).trim() : '';
    const lugarMatch = lugarStr.match(/^(.+?):\s*([\d.,]+)\s*usuarios/);
    const metaMatch = costosStr.match(/Meta:\s*\$\s*([\d.,]+)/);
    const dvMatch   = costosStr.match(/DV360:\s*\$\s*([\d.,]+)/);
    return {
      nombre:   lugarMatch ? lugarMatch[1].trim() : lugarStr,
      usuarios: lugarMatch ? lugarMatch[2] : '',
      meta:     metaMatch ? `$ ${metaMatch[1]}` : null,
      dv360:    dvMatch   ? `$ ${dvMatch[1]}`   : null,
    };
  });

  return { totales, localidades, fechaFin };
};

const parsearComentarioDistribucion = (comentario) => {
  if (!comentario) return [];
  return comentario.split(/ --- (?=FECHA FIN:|TOTAL )/).map(parsearEntradaDistribucion).filter(Boolean);
};

const NotaFreemiumDistribucion = () => {
  const TOKEN      = useSelector((state) => state.formulario.token);
  const notaFreemium = useSelector((state) => state.formulario.notaFreemiumDistribucion);
  const id_cliente = useSelector((state) => state.formulario.id_cliente);
  const id_usuario = useSelector((state) => state.formulario.usuario.id);
  const navigate   = useNavigate();

  // Picker de localidad
  const [pais, setPais]                           = useState(null);
  const [provinciasSeleccionadas, setProvincias]  = useState([]);
  const [municipiosSeleccionados, setMunicipios]  = useState([]);
  const [agregandoLocalidad, setAgregandoLocalidad] = useState(false);

  // Lista de localidades agregadas
  const [localidades, setLocalidades] = useState([]);

  // Configuración distribución
  const hoy = new Date();
  const fechaMas30 = new Date(); fechaMas30.setDate(hoy.getDate() + 7);
  const [fecha_inicio, setFechaInicio] = useState(hoy.toISOString().split('T')[0]);
  const [fecha_fin,    setFechaFin]    = useState(fechaMas30.toISOString().split('T')[0]);
  const [distribuirMeta, setDistribuirMeta] = useState(true);
  const [distribuirDv,   setDistribuirDv]   = useState(true);

  // Crédito
  const [consolidacionCliente, setConsolidacionCliente] = useState(null);
  const [creditoCliente, setCreditoCliente]             = useState(0);

  // Modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensajeModal, setMensajeModal] = useState('');

  const geo = useSelector((state) => state.formulario.geo);

  useEffect(() => {
    obtenerConsolidacionCliente(TOKEN, id_cliente).then(setConsolidacionCliente);
  }, [id_cliente]);

  useEffect(() => {
    if (!consolidacionCliente) return;
    const cargado  = consolidacionCliente?.credito?.reduce((a, i) => a + Number(i.monto_mensual), 0) ?? 0;
    const consumo  = consolidacionCliente?.consumo?.reduce((a, i) => a + Number(i.monto_meta) + Number(i.monto_dv360), 0) ?? 0;
    setCreditoCliente(cargado - consumo);
  }, [consolidacionCliente]);

  const obtenerPaisId = (nombrePais) => {
    const found = geo?.find(p => p.nombre.toLowerCase() === nombrePais.toLowerCase());
    return found?.pais_id ?? null;
  };

  const handleAgregarLocalidad = async () => {
    if (!pais) return;
    setAgregandoLocalidad(true);

    const nuevas = [];
    if (municipiosSeleccionados.length > 0) {
      for (const m of municipiosSeleccionados) {
        nuevas.push({ tipo: 'municipio', id_geo: m.municipio_id, nombre: `${m.nombre} — ${pais.nombre}` });
      }
    } else if (provinciasSeleccionadas.length > 0) {
      for (const p of provinciasSeleccionadas) {
        nuevas.push({ tipo: 'provincia', id_geo: p.provincia_id, nombre: `${p.nombre} — ${pais.nombre}` });
      }
    } else {
      nuevas.push({ tipo: 'pais', id_geo: obtenerPaisId(pais.nombre), nombre: pais.nombre });
    }

    for (const loc of nuevas) {
      const precio = await obtenerPrecioUsuario(TOKEN, loc.tipo, loc.id_geo, id_cliente);
      setLocalidades(prev => [...prev, {
        id: Date.now() + Math.random(),
        ...loc,
        poblacion: 0,
        poblacionTotal: Number(precio?.poblacion || 0),
        precioPorUsuarioMeta: Number(precio?.precio_por_usuario_meta || 0),
        precioPorUsuarioDv:   Number(precio?.precio_por_usuario_dv360 || 0),
      }]);
    }

    setPais(null); setProvincias([]); setMunicipios([]);
    setAgregandoLocalidad(false);
  };

  const handlePoblacionChange = (id, val) => {
    const num = parseInt(val.replace(/\D/g, '')) || 0;
    setLocalidades(prev => prev.map(l => l.id === id
      ? { ...l, poblacion: l.poblacionTotal > 0 ? Math.min(num, l.poblacionTotal) : num }
      : l));
  };

  const handleQuitarLocalidad = (id) => {
    setLocalidades(prev => prev.filter(l => l.id !== id));
  };

  const totalMeta = useMemo(() =>
    distribuirMeta ? localidades.reduce((a, l) => a + l.poblacion * l.precioPorUsuarioMeta, 0) : 0,
    [localidades, distribuirMeta]);

  const totalDv = useMemo(() =>
    distribuirDv ? localidades.reduce((a, l) => a + l.poblacion * l.precioPorUsuarioDv, 0) : 0,
    [localidades, distribuirDv]);

  const total = totalMeta + totalDv;

  const comentario = useMemo(() => {
    const detalle = localidades
      .filter(l => l.poblacion > 0)
      .map(l => {
        const meta = distribuirMeta ? ` Meta: ${formatearARS(l.poblacion * l.precioPorUsuarioMeta, 0)}` : '';
        const dv   = distribuirDv   ? ` DV360: ${formatearARS(l.poblacion * l.precioPorUsuarioDv, 0)}`   : '';
        return `${l.nombre}: ${l.poblacion.toLocaleString('es-AR')} usuarios |${meta}${dv}`;
      })
      .join(' || ');
    return `FECHA FIN: ${fecha_fin} | TOTAL Meta: ${formatearARS(totalMeta, 0)} | TOTAL DV360: ${formatearARS(totalDv, 0)} | TOTAL: ${formatearARS(total, 0)} || DETALLE: ${detalle}`;
  }, [localidades, distribuirMeta, distribuirDv, totalMeta, totalDv, total, fecha_fin]);

  const handleDistribuirClick = async () => {
    if (!TOKEN || !notaFreemium?.term_id) return;
    if (localidades.length === 0) {
      setMensajeModal('Debe agregar al menos una localidad.'); setMostrarModal(true); return;
    }
    const locActivas = localidades.filter(l => l.poblacion > 0);
    if (locActivas.length === 0) {
      setMensajeModal('Debe ingresar la población para al menos una localidad.'); setMostrarModal(true); return;
    }
    if (creditoCliente < total) {
      setMensajeModal('No hay créditos suficientes.'); setMostrarModal(true); return;
    }
    setMensajeModal('La nota está siendo distribuida. Esto puede tardar unos minutos.');
    setMostrarModal(true);
    try {
      const totalUsuarios = locActivas.reduce((a, l) => a + l.poblacion, 0);
      const primeraLoc    = locActivas[0];
      await setComprarDistribucion(
        TOKEN,
        primeraLoc.tipo,
        primeraLoc.id_geo,
        id_usuario,
        totalUsuarios,
        id_cliente,
        notaFreemium.id,
        distribuirDv   ? totalDv   : 0,
        distribuirMeta ? totalMeta : 0,
        fecha_fin,
        fecha_inicio,
        notaFreemium?.comentarios
          ? `${notaFreemium.comentarios} --- ${comentario}`
          : comentario
      );
      setTimeout(() => navigate('/notasEditorial'), 3000);
    } catch (e) {
      console.error('Error al distribuir:', e);
    }
  };

  return (
    <div className="content flex-grow-1 crearNotaGlobal" style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* Header */}
      <div className="row align-items-center mb-2">
        <div className="col">
          <h3 className="headerTusNotas mb-0 d-flex align-items-center">
            <img src="/images/prisma.png" alt="" className="icon me-2 icono_tusNotas" />
            ¿Cómo vas a distribuir tu nota?
          </h3>
        </div>
        <div className="col-auto">
          <div style={{
            background: '#fff', padding: '10px 18px', borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,.07)', textAlign: 'center', minWidth: 220,
          }}>
            <div style={{ fontSize: 12, color: '#5F6368' }}>Crédito disponible</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#202124', margin: '2px 0' }}>
              {formatearARS(creditoCliente)}
            </div>
            <a href={`https://noticiasd.mitiendanube.com/autogestion/?cliente_id=${id_cliente}`}
              target="_blank" rel="noreferrer"
              style={{ fontSize: 13, color: '#34A853', textDecoration: 'none', fontWeight: 500 }}>
              Recargar crédito →
            </a>
          </div>
        </div>
      </div>

      {/* Nota */}
      <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 12 }}>
        <div className="card-body d-flex gap-3 align-items-start p-3">
          <img
            src={'https://panel.serviciosd.com/img' + notaFreemium?.imagen_principal}
            alt=""
            style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
          />
          <div>
            <div className="fw-bold mb-1">{notaFreemium?.titulo}</div>
            <div className="text-muted small">{notaFreemium?.copete}</div>
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 12 }}>
        <div className="card-body p-2">
          <BarraProgreso nota={notaFreemium} />
        </div>
      </div>

      {/* Localidades */}
      <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 12 }}>
        <div className="card-body p-3">
          <h6 className="fw-bold mb-3">
            <i className="bi bi-geo-alt me-2 text-primary" />
            Localidades de distribución
          </h6>

          {/* Lista */}
          {localidades.length > 0 && (
            <div className="d-flex flex-column gap-2 mb-3">
              {localidades.map((loc) => (
                <div key={loc.id}
                  className="d-flex align-items-center gap-3 p-2 rounded"
                  style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="fw-semibold small text-truncate">{loc.nombre}</div>
                    {loc.poblacionTotal > 0 && (
                      <div className="text-muted" style={{ fontSize: 11 }}>
                        Población total: {loc.poblacionTotal.toLocaleString('es-AR')}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <label className="small text-muted mb-0" style={{ whiteSpace: 'nowrap' }}>Alcance:</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={{ width: 100, textAlign: 'right' }}
                      value={loc.poblacion === 0 ? '' : loc.poblacion.toLocaleString('es-AR')}
                      onChange={(e) => handlePoblacionChange(loc.id, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  {distribuirMeta && (
                    <div className="small text-muted" style={{ whiteSpace: 'nowrap' }}>
                      <img src='./images/logoFB.png' style={{ width: 14 }} className="me-1" alt="" />
                      {formatearARS(loc.poblacion * loc.precioPorUsuarioMeta, 0)}
                    </div>
                  )}
                  {distribuirDv && (
                    <div className="small text-muted" style={{ whiteSpace: 'nowrap' }}>
                      <img src='./images/dv360.png' style={{ width: 14 }} className="me-1" alt="" />
                      {formatearARS(loc.poblacion * loc.precioPorUsuarioDv, 0)}
                    </div>
                  )}
                  <button
                    className="btn btn-outline-danger btn-sm py-0 px-2"
                    onClick={() => handleQuitarLocalidad(loc.id)}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Picker */}
          <div className="d-flex gap-2 align-items-end flex-wrap">
            <div style={{ flex: 1, minWidth: 260 }}>
              <ArbolConSelectorMultiple
                TOKEN={TOKEN}
                pais={pais}
                provinciasSeleccionadas={provinciasSeleccionadas}
                municipiosSeleccionados={municipiosSeleccionados}
                onSetPais={setPais}
                onSetProvincias={setProvincias}
                onSetMunicipios={setMunicipios}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleAgregarLocalidad}
              disabled={!pais || agregandoLocalidad}
              style={{ whiteSpace: 'nowrap' }}
            >
              {agregandoLocalidad
                ? <><span className="spinner-border spinner-border-sm me-1" />Agregando...</>
                : <><i className="bi bi-plus-lg me-1" />Agregar</>}
            </button>
          </div>
        </div>
      </div>

      {/* Historial de distribución */}
      {(() => {
        const historial = parsearComentarioDistribucion(notaFreemium?.comentarios);
        if (!historial.length) return null;
        return (
          <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 12 }}>
            <div className="card-body p-3">
              <h6 className="fw-bold mb-3">
                <i className="bi bi-clock-history me-2 text-primary" />
                Historial de distribuciones
              </h6>
              <div className="d-flex flex-column gap-4">
                {[...historial].reverse().map((dist, di) => (
                  <div key={di}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-secondary" style={{ fontSize: 11 }}>
                        Distribución #{historial.length - di}
                      </span>
                      {dist.fechaFin && (
                        <span className="small text-muted">
                          <i className="bi bi-calendar3 me-1" />
                          hasta {dist.fechaFin}
                        </span>
                      )}
                      <div className="d-flex gap-2 flex-wrap">
                        {dist.totales['Meta'] && (
                          <span className="small d-flex align-items-center gap-1"
                            style={{ background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 6, padding: '2px 8px' }}>
                            <img src='./images/logoFB.png' style={{ width: 13 }} alt="" />
                            <span className="text-muted">Meta</span>
                            <strong>$ {dist.totales['Meta']}</strong>
                          </span>
                        )}
                        {dist.totales['DV360'] && (
                          <span className="small d-flex align-items-center gap-1"
                            style={{ background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 6, padding: '2px 8px' }}>
                            <img src='./images/dv360.png' style={{ width: 13 }} alt="" />
                            <span className="text-muted">DV360</span>
                            <strong>$ {dist.totales['DV360']}</strong>
                          </span>
                        )}
                        {dist.totales['TOTAL'] && (
                          <span className="small d-flex align-items-center gap-1 fw-bold"
                            style={{ background: '#e8f0fe', border: '1px solid #c5d4f5', borderRadius: 6, padding: '2px 8px', color: '#1a73e8' }}>
                            Total: $ {dist.totales['TOTAL']}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-1">
                      {dist.localidades.map((e, i) => (
                        <div key={i} className="d-flex align-items-center gap-3 px-3 py-2 rounded"
                          style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                          <i className="bi bi-geo-alt text-muted" style={{ fontSize: 13 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="fw-semibold small text-truncate">{e.nombre}</div>
                            {e.usuarios && (
                              <div className="text-muted" style={{ fontSize: 11 }}>{e.usuarios} usuarios alcanzados</div>
                            )}
                          </div>
                          {e.meta && (
                            <div className="small text-muted d-flex align-items-center gap-1" style={{ whiteSpace: 'nowrap' }}>
                              <img src='./images/logoFB.png' style={{ width: 13 }} alt="" />{e.meta}
                            </div>
                          )}
                          {e.dv360 && (
                            <div className="small text-muted d-flex align-items-center gap-1" style={{ whiteSpace: 'nowrap' }}>
                              <img src='./images/dv360.png' style={{ width: 13 }} alt="" />{e.dv360}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {di < historial.length - 1 && <hr className="mt-3 mb-0" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Configuración y totales */}
      <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 12 }}>
        <div className="card-body p-3">
          <h6 className="fw-bold mb-3">
            <i className="bi bi-sliders me-2 text-primary" />
            Configuración
          </h6>
          <div className="row g-3 align-items-start">
            <div className="col-md-6">
              <div className="d-flex gap-4 mb-3">
                <Checkbox title="Distribuir en Meta"  value={distribuirMeta} onChange={setDistribuirMeta} />
                <Checkbox title="Distribuir en DV360" value={distribuirDv}   onChange={setDistribuirDv}   />
              </div>
              <InputFecha label="Fecha inicio:" name="fecha_inicio" value={fecha_inicio}
                onChange={(e) => setFechaInicio(e.target.value)} />
              <InputFecha label="Fecha fin:"    name="fecha_fin"    value={fecha_fin}
                onChange={(e) => setFechaFin(e.target.value)} />
              {(() => {
                const diff = fecha_inicio && fecha_fin
                  ? (new Date(fecha_fin) - new Date(fecha_inicio)) / (1000 * 60 * 60 * 24)
                  : null;
                const pocosDias = diff !== null && diff < 5;
                return (
                  <small className={`mt-1 d-block ${pocosDias ? 'fw-semibold' : 'text-muted'}`}
                    style={pocosDias ? { color: '#e67e00' } : {}}>
                    Se recomienda al menos 5 días de diferencia entre las fechas
                    {pocosDias && diff >= 0 && ` (actualmente ${Math.round(diff)} día${diff !== 1 ? 's' : ''})`}
                  </small>
                );
              })()}
            </div>
            <div className="col-md-6 d-flex flex-column gap-2">
              <div className="d-flex justify-content-between align-items-center p-2 rounded"
                style={{ background: '#f8f9fa' }}>
                <span className="small d-flex align-items-center gap-2">
                  <img src='./images/logoFB.png' style={{ width: 18 }} alt="" /> Meta
                </span>
                <strong>{formatearARS(totalMeta, 0)}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center p-2 rounded"
                style={{ background: '#f8f9fa' }}>
                <span className="small d-flex align-items-center gap-2">
                  <img src='./images/dv360.png' style={{ width: 18 }} alt="" /> DV360
                </span>
                <strong>{formatearARS(totalDv, 0)}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center p-2 rounded"
                style={{ background: '#e8f0fe', border: '1px solid #c5d4f5' }}>
                <span className="small fw-bold d-flex align-items-center gap-2">
                  <img src='./images/exitoIcon.png' style={{ width: 18 }} alt="" /> Total
                </span>
                <strong style={{ color: '#1a73e8' }}>{formatearARS(total, 0)}</strong>
              </div>
              <div className="d-flex justify-content-end mt-1">
                <BotonDistribuirNota onClick={handleDistribuirClick} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalMensaje
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
        mensaje={mensajeModal}
        onClose={() => setMostrarModal(false)}
      />
    </div>
  );
};

export default NotaFreemiumDistribucion;
