import React, { useState, useEffect, useMemo, useRef } from 'react';
import { guardar_dato_en_banner_data, obtenerPoblacion } from './apisUsuarios';
import { useSelector } from 'react-redux';

const obtenerColorDeEstadoDistribucionDeNota = (campoAChequear, nota) => {
  const fechaHoy = new Date();
  const fechaVencimiento = new Date(nota['fecha_vencimiento']);
  if (!campoAChequear || !nota) return 'text-muted';
  if (nota[campoAChequear] == null && fechaVencimiento < fechaHoy) return 'text-danger';
  if (nota[campoAChequear] == null && fechaVencimiento > fechaHoy) return 'text-warning';
  if (nota[campoAChequear] != null) return 'text-success';
  
  return 'text-muted';
};

// Recibimos geo y contratos desde el padre
const IconosDistribucionConMonto = ({ nota, token, geo, contratos }) => {
    const isFirstRender = useRef(true);
    const Usuario = useSelector((state) => state.formulario.usuario);

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
      }, 2000); 

      return () => clearTimeout(handler);
    }, [montoDv, montoMeta, token, nota.id]); 
    
  return (
    <div className="col-3 d-flex justify-content-center align-items-center">
      {/* Ícono META */}
      <div className="d-flex flex-column align-items-center">
        <i className={'bi bi-meta fs-1 ' + obtenerColorDeEstadoDistribucionDeNota('primer_dato_en_meta', nota)}></i>
        <strong>Estimado meta:</strong>
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
        <i className={'bi bi-google fs-1 ' + obtenerColorDeEstadoDistribucionDeNota('primer_dato_en_360', nota)}></i>
        <strong>Estimado dv360:</strong>
        <input
          type="number"
          className="form-control mt-2 text-center"
          placeholder="DV"
          value={montoDv}
          readOnly={!(Usuario.nombre === 'Santiago Iván Rossi' || Usuario.perfil === '1')}
          onChange={(e) => {
            if (Usuario.nombre === 'Santiago Iván Rossi' || Usuario.perfil === '1') {
              setMontoDv(e.target.value); 
            }
          }}
          style={{ width: '120px', fontSize: '0.9rem' }}
        />
      </div>
    </div>
  );
};

export default IconosDistribucionConMonto;