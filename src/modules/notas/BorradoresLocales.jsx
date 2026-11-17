// Panel "Borradores en este navegador": notas con cambios guardados localmente (IndexedDB)
// que todavía no se guardaron/publicaron en el servidor. Es la forma de volver a una nota
// nueva después de cerrar su pestaña. Se muestra en el listado de notas.
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { borrarBorrador, listarBorradores } from '@/shared/utils/borradoresDB';
import { esClaveNueva, rutaEditor } from './navegacionEditor';

const haceCuanto = (ms) => {
  const min = Math.round((Date.now() - ms) / 60000);
  if (min < 1) return 'hace menos de un minuto';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} días`;
};

const BorradoresLocales = () => {
  const [borradores, setBorradores] = useState([]);

  const cargar = useCallback(() => {
    listarBorradores().then(setBorradores).catch(() => setBorradores([]));
  }, []);

  useEffect(() => {
    cargar();
    window.addEventListener('focus', cargar);
    return () => window.removeEventListener('focus', cargar);
  }, [cargar]);

  const descartar = async (clave, titulo) => {
    if (!window.confirm(`¿Descartar los cambios sin guardar de "${titulo || 'Nota sin título'}"? No se puede deshacer.`)) return;
    await borrarBorrador(clave).catch(() => {});
    cargar();
  };

  if (!borradores.length) return null;

  return (
    <section className="nd-card m-3" aria-labelledby="titulo-borradores-locales">
      <div className="nd-card__header mb-2">
        <h2 id="titulo-borradores-locales" className="nd-card__title">
          <i className="bi bi-clock-history me-2" aria-hidden="true"></i>
          Borradores en este navegador
        </h2>
        <span className="nd-card__meta">Cambios que todavía no se guardaron en el servidor</span>
      </div>
      <ul className="nd-list">
        {borradores.map(({ clave, titulo, guardadoEn }) => (
          <li key={clave} className="nd-list__item d-flex align-items-center gap-3">
            <div className="flex-grow-1">
              <Link to={rutaEditor(clave)} className="nd-fw-semibold">
                {titulo || 'Nota sin título'}
              </Link>
              <div className="nd-text-secondary nd-text-sm">
                {esClaveNueva(clave) && <span className="nd-badge nd-badge--primary me-2">Nueva</span>}
                Guardado {haceCuanto(guardadoEn)}
              </div>
            </div>
            <Link to={rutaEditor(clave)} className="btn btn-outline-primary btn-sm">Seguir editando</Link>
            <button
              type="button"
              className="nd-icon-btn nd-icon-btn--danger"
              title="Descartar borrador"
              aria-label={`Descartar borrador ${titulo || 'sin título'}`}
              onClick={() => descartar(clave, titulo)}
            >
              <i className="bi bi-trash" aria-hidden="true"></i>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default BorradoresLocales;
