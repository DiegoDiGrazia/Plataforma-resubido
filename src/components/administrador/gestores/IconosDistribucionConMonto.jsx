import React, { useState, useEffect } from 'react';
import { guardar_dato_en_banner_data } from './apisUsuarios';
import { useRef } from 'react';
import { useSelector } from 'react-redux';

const obtenerColorDeEstadoDistribucionDeNota = (campoAChequear, nota) => {
  const fechaHoy = new Date();
  const fechaVencimiento = new Date(nota['fecha_vencimiento']);
  if (!campoAChequear || !nota) {
    return 'text-muted';
  }
  if (nota[campoAChequear] == null && fechaVencimiento < fechaHoy) {
    return 'text-danger';
  } else if (nota[campoAChequear] == null && fechaVencimiento > fechaHoy) {
    return 'text-warning';
  } else if (nota[campoAChequear] != null) {
    return 'text-success';
  }
  return 'text-muted';
};

const IconosDistribucionConMonto = ({ nota, token }) => {
    const isFirstRender = useRef(true);
    const parseBannerData = () => {
        try {
            return nota['banner_data'] && nota['banner_data'].trim() ? JSON.parse(nota['banner_data']) : null;
        } catch (error) {
            console.error('Error parsing banner_data:', error);
            return null;
        }
    };
    const banner_data = parseBannerData();
    const [montoDv, setMontoDv] = useState(banner_data?.presupuesto?.dv || 0);
    const [montoMeta, setMontoMeta] = useState(banner_data?.presupuesto?.meta || 0);
    const Usuario = useSelector((state) => state.formulario.usuario);
    useEffect(() => {
      if (isFirstRender.current) {
          isFirstRender.current = false;
          return; 
      }
      const handler = setTimeout(() => {
          const dato_a_guardar = JSON.stringify({
          vp: banner_data?.vp || '50',
          presupuesto: {
              meta: montoMeta,
              dv: montoDv,
          },
          });
          guardar_dato_en_banner_data(token, nota.id, dato_a_guardar);
      }, 2000); // espera 3 segundos después del último cambio

      return () => clearTimeout(handler);
    }, [montoDv, montoMeta]);

  return (
    <div className="col-3 d-flex justify-content-center align-items-center">
      {/* Ícono META */}
      <div className="d-flex flex-column align-items-center">
        <i
          className={
            'bi bi-meta fs-1 ' +
            obtenerColorDeEstadoDistribucionDeNota('primer_dato_en_meta', nota)
          }
        ></i>
        <div>monto meta:</div>
        <input
          type="number"
          className="form-control mt-2 text-center"
          placeholder="Meta"
          value={montoMeta}
          readOnly={!(Usuario.nombre === 'Santiago Iván Rossi' || Usuario.perfil === '1')}
          onChange={(e) => {
            if (Usuario.nombre === 'Santiago Iván Rossi' || Usuario.perfil === '1') {
              setMontoMeta(e.target.value);
            }
          }}
          style={{ width: '120px', fontSize: '0.9rem' }}
        />
      </div>

      {/* Ícono DV */}
      <div className="d-flex flex-column align-items-center ms-3">
        <i
          className={
            'bi bi-google fs-1 ' +
            obtenerColorDeEstadoDistribucionDeNota('primer_dato_en_360', nota)
          }
        ></i>
        <div>monto dv:</div>
        <input
          type="number"
          className="form-control mt-2 text-center"
          placeholder="DV"
          value={montoDv}
          readOnly={!(Usuario.nombre === 'Santiago Iván Rossi' || Usuario.perfil === '1')}
          onChange={(e) => {
            if (Usuario.nombre === 'Santiago Iván Rossi' || Usuario.perfil === '1') {
              setMontoDv(e.target.value); // ✅ corregido
            }
          }}
          style={{ width: '120px', fontSize: '0.9rem' }}
        />
      </div>

    </div>
  );
};

export default IconosDistribucionConMonto;
