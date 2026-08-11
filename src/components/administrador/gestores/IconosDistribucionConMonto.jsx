import React, { useState, useEffect, useMemo, useRef } from 'react';
import { obtenerPoblacion } from './apisUsuarios';
import { editarDistribucionGeneracion } from '../../Apis/apis';
import { useSelector } from 'react-redux';

const obtenerColorDeEstadoDistribucionDeNota = (valor) => {
    if (valor == null) return 'text-danger';
    if (valor === '1111-11-11') return 'text-warning';
    return 'text-success';
};

const obtenerFechaDeHoy = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
};

export const PLATAFORMAS = [
    { key: 'meta', campoPrimerDato: 'primer_dato_en_meta', campoMonto: 'monto_meta', icono: 'bi-meta', label: 'Meta' },
    { key: 'dv360', campoPrimerDato: 'primer_dato_en_360', campoMonto: 'monto_dv360', icono: 'bi-google', label: 'DV360' },
    { key: 'x', campoPrimerDato: 'primer_dato_en_x', campoMonto: 'monto_x', icono: 'bi-twitter', label: 'X' },
    { key: 'youtube', campoPrimerDato: 'primer_dato_en_youtube', campoMonto: 'monto_youtube', icono: 'bi-youtube', label: 'Youtube' },
    { key: 'search', campoPrimerDato: 'primer_dato_en_search', campoMonto: 'monto_search', icono: 'bi-search', label: 'Search' },
];

// Recibimos geo y contratos desde el padre
const IconosDistribucionConMonto = ({ nota, token, geo, contratos }) => {
    const isUserEdit = useRef({});
    const Usuario = useSelector((state) => state.formulario.usuario);
    const puedeEditar = Usuario.nombre === 'Santiago Iván Rossi' || Usuario.perfil === '1';

    const [montos, setMontos] = useState(() =>
        PLATAFORMAS.reduce((acc, p) => ({ ...acc, [p.key]: nota[p.campoMonto] ?? 0 }), {})
    );
    const [primerosDatos, setPrimerosDatos] = useState(() =>
        PLATAFORMAS.reduce((acc, p) => ({ ...acc, [p.key]: nota[p.campoPrimerDato] ?? null }), {})
    );

    const [poblacion, setPoblacion] = useState(null);
    const [showConfirmacion, setShowConfirmacion] = useState(false);
    const [accionPendiente, setAccionPendiente] = useState(null);
    const [plataformaConfirmacion, setPlataformaConfirmacion] = useState('');

    const permisoEdicionPresupuestos = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Distribucion: Edicion presupuestos") || false);

    const alcance = useMemo(() => {
        if (!contratos || !nota.cliente) return 0;
        const contratoEncontrado = contratos.find(c => c.name?.toLowerCase() === nota.cliente.toLowerCase());
        return contratoEncontrado ? Number(contratoEncontrado.alcance_x_nota) : 0;
    }, [contratos, nota.cliente]);

    const { division, divisionId } = useMemo(() => {
        if (!geo) return { division: null, divisionId: null };

        if (nota.pais && geo.paises) {
            const paisData = geo.paises.find(p => p.nombre.toLowerCase() === nota.pais.toLowerCase());
            return { division: "pais", divisionId: paisData?.pais_id };
        }
        if (nota.provincia && geo.provincias) {
            const provData = geo.provincias.find(prov => prov.nombre.toLowerCase() === nota.provincia.toLowerCase());
            return { division: "provincia", divisionId: provData?.provincia_id };
        }
        if (nota.municipio && geo.municipios) {
            const muniData = geo.municipios.find(muni => muni.nombre.toLowerCase() === nota.municipio.toLowerCase());
            return { division: "municipio", divisionId: muniData?.municipio_id };
        }

        return { division: null, divisionId: null };
    }, [geo, nota]);

    useEffect(() => {
        if (division && divisionId) {
            obtenerPoblacion(token, division, divisionId).then(setPoblacion);
        }
    }, [token, division, divisionId]);

    useEffect(() => {
        if (poblacion && alcance > 0) {
            const cpm_meta = poblacion.meta?.cpm;
            const cpm_dv = poblacion.gv?.cpm;

            if (cpm_meta && !isUserEdit.current.meta) {
                const calculoMeta = cpm_meta * (2 / 1000) * alcance;
                setMontos(prev => ({ ...prev, meta: calculoMeta.toFixed(2) }));
            }
            if (cpm_dv && !isUserEdit.current.dv360) {
                const calculoDv = cpm_dv * (3 / 1000) * alcance;
                setMontos(prev => ({ ...prev, dv360: calculoDv.toFixed(2) }));
            }
        }
    }, [alcance, poblacion]);

    useEffect(() => {
        const hayCambiosDeUsuario = PLATAFORMAS.some(p => isUserEdit.current[p.key]);
        if (!hayCambiosDeUsuario) return;

        const handler = setTimeout(() => {
            const data = {};
            PLATAFORMAS.forEach(p => {
                if (isUserEdit.current[p.key]) {
                    data[p.campoMonto] = montos[p.key];
                    isUserEdit.current[p.key] = false;
                }
            });
            editarDistribucionGeneracion(token, nota.id_generacion, data);
        }, 2000);

        return () => clearTimeout(handler);
    }, [montos, token, nota.id_generacion]);

    const marcarComoDistribuido = (plataforma) => {
        const fecha = obtenerFechaDeHoy();
        editarDistribucionGeneracion(token, nota.id_generacion, { [plataforma.campoPrimerDato]: fecha });
        setPrimerosDatos(prev => ({ ...prev, [plataforma.key]: fecha }));
    };

    const confirmarAccion = () => {
        if (accionPendiente) accionPendiente();
        setShowConfirmacion(false);
        setAccionPendiente(null);
        setPlataformaConfirmacion('');
    };

    const cancelarAccion = () => {
        setShowConfirmacion(false);
        setAccionPendiente(null);
        setPlataformaConfirmacion('');
    };

    return (
        <>
        {showConfirmacion && (
            <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirmación</h5>
                            <button type="button" className="btn-close" onClick={cancelarAccion}></button>
                        </div>
                        <div className="modal-body">
                            <p>¿Seguro que quiere marcar forzosamente la nota como distribuida en <strong>{plataformaConfirmacion}</strong>?</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={cancelarAccion}>Cancelar</button>
                            <button className="btn btn-warning" onClick={confirmarAccion}>Confirmar</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        <div className="col-3">
            <div className="row p-1"><strong>Presupuestos plataformas</strong></div>
            {PLATAFORMAS.map((plataforma) => (
                <div className="row p-1 align-items-center" key={plataforma.key}>
                    <div className="col-auto d-flex align-items-center pe-0">
                        <i
                            className={`bi ${plataforma.icono} fs-5 me-1 ` + obtenerColorDeEstadoDistribucionDeNota(primerosDatos[plataforma.key])}
                            style={{ cursor: primerosDatos[plataforma.key] == null ? 'pointer' : 'default' }}
                            onClick={() => {
                                if (primerosDatos[plataforma.key] == null) {
                                    setAccionPendiente(() => () => marcarComoDistribuido(plataforma));
                                    setPlataformaConfirmacion(plataforma.label);
                                    setShowConfirmacion(true);
                                }
                            }}
                        ></i>
                        <strong>{plataforma.label}:</strong>
                    </div>
                    <div className="col">
                        <input
                            type="text"
                            inputMode="decimal"
                            className="form-control form-control-sm text-center"
                            placeholder={plataforma.label}
                            value={montos[plataforma.key]}
                            readOnly={!permisoEdicionPresupuestos}
                            onChange={(e) => {
                                if (!puedeEditar) return;
                                const valor = e.target.value;
                                if (!/^\d*\.?\d*$/.test(valor)) return;
                                isUserEdit.current[plataforma.key] = true;
                                setMontos(prev => ({ ...prev, [plataforma.key]: valor }));
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
        </>
    );
};

export default IconosDistribucionConMonto;
