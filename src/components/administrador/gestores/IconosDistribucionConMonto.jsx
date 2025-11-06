import React, { useState, useEffect } from 'react';
import { guardar_dato_en_banner_data } from './apisUsuarios';
import { useRef } from 'react';

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
    const banner_data = nota['banner_data'] ? JSON.parse(nota['banner_data']) : null;
    const [montoDv, setMontoDv] = useState(banner_data?.presupuesto?.dv || 0);
    const [montoMeta, setMontoMeta] = useState(banner_data?.presupuesto?.meta || 0);

  useEffect(() => {

    if (isFirstRender.current) {
        isFirstRender.current = false;
        return; // no ejecutar en el primer render
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
        console.log('nota:', nota);
        console.log('Dato a guardar en banner_data:', dato_a_guardar);
    }, 2000); // espera 3 segundos después del último cambio

    // Si el usuario vuelve a tipear antes de los 3 segundos, se limpia el timeout
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
          onChange={(e) => setMontoMeta(e.target.value)}
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
          onChange={(e) => setMontoDv(e.target.value)}
          style={{ width: '120px', fontSize: '0.9rem' }}
        />
      </div>
    </div>
  );
};

export default IconosDistribucionConMonto;
