import React, { useCallback, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useSelector, useDispatch } from 'react-redux';
import { setContenidoPorIndice } from '../../../redux/crearNotaSlice';
import BotoneraContenido from './botoneraContenido';

const Embebido = ({ indice }) => {
  const dispatch = useDispatch();
  const containerRef = useRef(null); // Referencia al contenedor

  // Obtener el embebido desde Redux con validación
  const embebido = useSelector((state) => state.crearNota.contenidoNota[indice]?.[1]);

  // Manejar cambios en el input
  const handleInputChange = useCallback(
    (e) => {
      dispatch(setContenidoPorIndice([indice, e.target.value, "", ""]));
    },
    [dispatch, indice]
  );

  useEffect(() => {
    const adjustIframeSize = () => {
      const container = containerRef.current;
      if (container) {
        const iframe = container.querySelector('iframe');
        if (iframe) {
          iframe.style.width = '100%';
          iframe.style.height = 'auto'; // Ajusta dinámicamente la altura
          iframe.style.borderRadius = '15px';
          iframe.style.padding = '0px';
        }
      }
    };

    const loadInstagramScript = () => {
      if (!window.instgrm) {
        // Si el script de Instagram no está cargado, agrégalo dinámicamente
        const script = document.createElement('script');
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        script.onload = () => {
          if (window.instgrm) {
            window.instgrm.Embeds.process();
          }
        };
        document.body.appendChild(script);
      } else {
        // Si el script ya está cargado, procesa los embebidos
        window.instgrm.Embeds.process();
      }
    };

    adjustIframeSize(); // Ajusta el tamaño del iframe
    loadInstagramScript(); // Carga y ejecuta el script de Instagram
    window.addEventListener('resize', adjustIframeSize); // Ajusta al redimensionar

    return () => {
      window.removeEventListener('resize', adjustIframeSize);
    };
  }, [embebido]);

  return (
    <span className="spanContainer">
      <div className="d-flex align-items-center mb-3 justify-content-start">
        <BotoneraContenido indice={indice} className="pr-2" />
        {!embebido && (
          <input
            type="text"
            value={embebido || ''}
            onChange={handleInputChange}
            placeholder="Pega aquí tu embebido"
            className="inputTituloNota parrafoNota ml-3"
          />
        )}
      </div>

      <div className="centradoContenido" ref={containerRef}>
        {embebido && (
          <div
            style={{
              width: '100%',
              position: 'relative',
              height: '100%', // Altura inicial para que el contenido sea visible
              borderRadius: '15px',
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: embebido }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
              }}
            ></div>
          </div>
        )}
      </div>
    </span>
  );
};

export default Embebido;