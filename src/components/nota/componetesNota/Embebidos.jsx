import React, { useCallback, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useSelector, useDispatch } from 'react-redux';
import { setContenidoPorIndice } from '../../../redux/crearNotaSlice';
import BotoneraContenido from './botoneraContenido';

const loadEmbedScripts = () => {
  // Cargar y procesar el script de Instagram
  if (!window.instgrm) {
    const instagramScript = document.createElement('script');
    instagramScript.src = 'https://www.instagram.com/embed.js';
    instagramScript.async = true;
    instagramScript.onload = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    };
    document.body.appendChild(instagramScript);
  } else {
    window.instgrm.Embeds.process();
  }

  // Cargar y procesar el script de Twitter
  if (!window.twttr) {
    const twitterScript = document.createElement('script');
    twitterScript.src = 'https://platform.twitter.com/widgets.js';
    twitterScript.async = true;
    twitterScript.onload = () => {
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load();
      }
    };
    document.body.appendChild(twitterScript);
  } else {
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load();
    }
  }
};

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

  adjustIframeSize(); // Ajusta el tamaño del iframe
  loadEmbedScripts(); // Carga y ejecuta los scripts de Instagram y Twitter
  window.addEventListener('resize', adjustIframeSize); // Ajusta al redimensionar

  return () => {
    window.removeEventListener('resize', adjustIframeSize);
  };
}, [embebido]);

const embebidoConEstilo = embebido.replace(
  /<iframe(.*?)>/,
  '<iframe$1 style="width: 100% !important; height: 100% !important; maxWidth: 100% !important; display: block;">'
);
  return (
    <span className="spanContainer">
      <div className="d-flex align-items-center mb-3 justify-content-start">
        <BotoneraContenido indice={indice} className="pr-2" />
        {!embebido && (
          <input
            type="text"
            value={embebido || ''}
            onChange={handleInputChange}
            placeholder="Pega tu embebido          "
            className="inputTituloNota parrafoNota"
          />
        )}
      </div>

      <div className="centradoContenido align-item-center" ref={containerRef}>
        {embebido && (
            <div
              dangerouslySetInnerHTML={{ __html: embebido }}
              style={{
                width: '100%',
                height: '100%', // Ajusta automáticamente la altura al contenido
                minHeight: '600px', // Altura mínima para el iframe
                maxHeight: '100%',
              }}
            ></div>
        )}
      </div>
    </span>
  );
};

export default Embebido;