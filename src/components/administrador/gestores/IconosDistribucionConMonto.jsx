import React, { useState, useEffect, useMemo, useRef } from 'react';
import { guardar_dato_en_banner_data, obtenerPoblacion, setearMontoDVoMeta } from './apisUsuarios';
import { useSelector } from 'react-redux';
import ModalMensaje from '../gestores/ModalMensaje';

const obtenerColorDeEstadoDistribucionDeNota = (campoAChequear, nota) => {
  if (!campoAChequear || !nota) return 'text-muted';
  const valor = nota[campoAChequear];
  if (valor == null) return 'text-danger';
  if (valor === '1111-11-11') return 'text-warning';
  return 'text-success';
};

// Recibimos geo y contratos desde el padre
const IconosDistribucionConMonto = ({ nota, token, geo, contratos }) => {
    const isUserEdit = useRef(false);
    const Usuario = useSelector((state) => state.formulario.usuario);
    const [showModal, setShowModal] = useState(false);
    const [mensajeModalExito, setMensajeModalExito] = useState("Los cambios se realizaron correctamente.");
    
    

    const parseBannerData = () => {
        try {
            return nota['banner_data'] && nota['banner_data'].trim() ? JSON.parse(nota['banner_data']) : null;
        } catch (error) {
            console.error('Error parsing banner_data:', error);
            return null;
        }
    };
    const banner_data = parseBannerData();

    const [montoDv, setMontoDv] = useState(0);
    const [montoMeta, setMontoMeta] = useState(0);
    const [poblacion, setPoblacion] = useState(null);
    const [primerDatoEnMeta, setPrimerDatoEnMeta] = useState(nota.primer_dato_en_meta ?? null);
    const [primerDatoEn360, setPrimerDatoEn360] = useState(nota.primer_dato_en_360 ?? null);
    const [showConfirmacion, setShowConfirmacion] = useState(false);
    const [accionPendiente, setAccionPendiente] = useState(null);
    const [plataformaConfirmacion, setPlataformaConfirmacion] = useState('');

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

            if (cpm_meta) {
                const calculoMeta = cpm_meta * (2 / 1000) * alcance;
                setMontoMeta(calculoMeta.toFixed(2)); 
            }
            if (cpm_dv) {
                const calculoDv = cpm_dv * (3 / 1000) * alcance;
                setMontoDv(calculoDv.toFixed(2));
            }
        }
    }, [alcance, poblacion]);

    useEffect(() => {
      if (!isUserEdit.current) return;

      const handler = setTimeout(() => {
          const dato_a_guardar = JSON.stringify({
              vp: banner_data?.vp || '50',
              presupuesto: {
                  meta: montoMeta,
                  dv: montoDv,
              },
          });
          guardar_dato_en_banner_data(token, nota.id, dato_a_guardar);
          isUserEdit.current = false;
      }, 2000);

      return () => clearTimeout(handler);
    }, [montoDv, montoMeta, token, nota.id]);
    
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
    <div className="col-3 d-flex justify-content-center align-items-center">
      {/* Ícono META */}
      <div className="d-flex flex-column align-items-center">
        <i
          className={'bi bi-meta fs-1 ' + obtenerColorDeEstadoDistribucionDeNota('primer_dato_en_meta', { ...nota, primer_dato_en_meta: primerDatoEnMeta })}
          style={{ cursor: primerDatoEnMeta == null ? 'pointer' : 'default' }}
          onClick={() => { if (primerDatoEnMeta == null) { setAccionPendiente(() => () => { setearMontoDVoMeta(token, nota, '1111-11-11', null); setPrimerDatoEnMeta('1111-11-11'); }); setPlataformaConfirmacion('Meta'); setShowConfirmacion(true); } }}
        ></i>
        <strong>Presupuesto meta:</strong>
        <input
          type="number"
          className="form-control mt-2 text-center"
          placeholder="Meta"
          value={montoMeta}
          readOnly={!(Usuario.nombre === 'Santiago Iván Rossi' || Usuario.perfil === '1')}
          onChange={(e) => {
            if (Usuario.nombre === 'Santiago Iván Rossi' || Usuario.perfil === '1') {
              isUserEdit.current = true;
              setMontoMeta(e.target.value);
            }
          }}
          style={{ width: '120px', fontSize: '0.9rem' }}
        />
      </div>

      {/* Ícono DV */}
      <div className="d-flex flex-column align-items-center ms-3">
        <i
          className={'bi bi-google fs-1 ' + obtenerColorDeEstadoDistribucionDeNota('primer_dato_en_360', { ...nota, primer_dato_en_360: primerDatoEn360 })}
          style={{ cursor: primerDatoEn360 == null ? 'pointer' : 'default' }}
          onClick={() => { if (primerDatoEn360 == null) { setAccionPendiente(() => () => { setearMontoDVoMeta(token, nota, null, '1111-11-11'); setPrimerDatoEn360('1111-11-11'); }); setPlataformaConfirmacion('DV360'); setShowConfirmacion(true); } }}
        ></i>
        <strong>Presupuesto dv360:</strong>
        <input
          type="number"
          className="form-control mt-2 text-center"
          placeholder="DV"
          value={montoDv}
          readOnly={!(Usuario.nombre === 'Santiago Iván Rossi' || Usuario.perfil === '1')}
          onChange={(e) => {
            if (Usuario.nombre === 'Santiago Iván Rossi' || Usuario.perfil === '1') {
              isUserEdit.current = true;
              setMontoDv(e.target.value);
            }
          }}
          style={{ width: '120px', fontSize: '0.9rem' }}
        />
      </div>
    </div>
    </>
  );
};

export default IconosDistribucionConMonto;