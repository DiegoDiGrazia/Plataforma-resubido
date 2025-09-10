import React, { useCallback, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useSelector, useDispatch } from 'react-redux';
import { setContenidoPorIndice } from '../../../redux/crearNotaSlice';
import BotoneraContenido from './botoneraContenido';

const FormFranquicias = ({ indice }) => {
  const dispatch = useDispatch();
  const containerRef = useRef(null); // Referencia al contenedor

  // Obtener el embebido desde Redux con validación
  const embebido = useSelector((state) => state.crearNota.contenidoNota[indice]?.[1]);

  // Manejar cambios en el input
const handleInputChange = useCallback(
  (e) => {
    dispatch(
      setContenidoPorIndice([
        indice,
        `<link rel="stylesheet" href="https://forms.noticiasd.com/${e.target.value}/container.css">
        <iframe src="https://forms.noticiasd.com/${e.target.value}" class="${e.target.value}" scrolling="no" border="0"></iframe>`,
        "",
        ""
      ])
    );
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
            placeholder="       Pega aqui el id del formulario de franquicias"
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

export default FormFranquicias;