import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import 'quill/dist/quill.snow.css'; // Estilos de Quill
import { useSelector, useDispatch } from 'react-redux';
import { setContenidoPorIndice } from '../../../redux/crearNotaSlice';
import BotoneraContenido from './botoneraContenido';
import Quill from 'quill';

const ParrafoNota = ({ indice }) => {
  const editorRef = useRef(null); // Referencia al contenedor del editor
  const quillInstanceRef = useRef(null); // Referencia a la instancia de Quill
  const dispatch = useDispatch();
  const [isFocused, setIsFocused] = useState(false); // Estado para el enfoque del editor
  const tituloGlobalNota = useSelector((state) => state.crearNota.contenidoNota[indice][1]);

  useEffect(() => {
    if (!quillInstanceRef.current) {
      // Inicializar Quill solo si no está ya inicializado
      quillInstanceRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: ' Escribe tu nota...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'], // Opciones de formato
            [{ list: 'ordered' }, { list: 'bullet' }], // Listas
            ['link'], // Enlaces
            [{ header: [1, 2, 3, false] }], // Encabezados (h1, h2, h3, texto normal)
          ],
        },
      });

      // Manejar cambios en el editor
      quillInstanceRef.current.on('text-change', () => {
        dispatch(setContenidoPorIndice([indice, quillInstanceRef.current.root.innerHTML, '', '']));
      });

      // Manejar el foco y desenfoque del editor
      const editorRoot = quillInstanceRef.current.root;
      editorRoot.addEventListener('focus', () => setIsFocused(true));
      editorRoot.addEventListener('blur', () => setIsFocused(false));

      // Prevenir que el foco se pierda al hacer clic en los botones del toolbar
      const toolbar = quillInstanceRef.current.getModule('toolbar').container;
      toolbar.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevenir la pérdida de foco al hacer clic en el toolbar
        editorRoot.focus(); // Mantener el foco en el editor
      });
    }

    // Establecer el contenido inicial
    if (quillInstanceRef.current.root.innerHTML !== tituloGlobalNota) {
      quillInstanceRef.current.root.innerHTML = tituloGlobalNota;
    }
  }, [dispatch, indice, tituloGlobalNota]);

  return (
    <span className="p-0" style={{ display: 'flex', alignItems: 'center' }}>
      <BotoneraContenido indice={indice} />
      <div className={`quill-editor ${isFocused ? 'focused' : ''}`} translate='no'>
        <div
          ref={editorRef}
          className="quill-editor"
          translate='no'
          style={{
            flex: 1,
            border: 'none',
            borderRadius: '15px',
            padding: '5px',
          }}
        ></div>
      </div>
    </span>
  );
};

export default ParrafoNota;