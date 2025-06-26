import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import 'quill/dist/quill.snow.css'; // Estilos de Quill
import { useSelector, useDispatch } from 'react-redux';
import { setContenidoPorIndice } from '../../../redux/crearNotaSlice';
import BotoneraContenido from './botoneraContenido';
import Quill from 'quill';

// 🟡 REGISTRO DEL BLOT PERSONALIZADO PARA VIDEO
const BlockEmbed = Quill.import('blots/block/embed');

class VideoBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    node.setAttribute('src', value);
    node.setAttribute('controls', true);
    node.setAttribute('playsinline', true);
    node.setAttribute('style', 'max-width: 100%; height: auto; display: block; margin: 1rem 0;');
    return node;
  }

  static value(node) {
    return node.getAttribute('src');
  }
}

VideoBlot.blotName = 'video';
VideoBlot.tagName = 'video';

Quill.register(VideoBlot);

const ParrafoNota = ({ indice }) => {
  const editorRef = useRef(null);
  const quillInstanceRef = useRef(null);
  const dispatch = useDispatch();
  const [isFocused, setIsFocused] = useState(false);
  const tituloGlobalNota = useSelector((state) => state.crearNota.contenidoNota[indice][1]);

  useEffect(() => {
    if (!quillInstanceRef.current) {
      quillInstanceRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: ' Escribe tu nota...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'], // Enlaces
            [{ header: [1, 2, 3, false] }],
          ],
        },
      });

      quillInstanceRef.current.on('text-change', () => {
        dispatch(setContenidoPorIndice([indice, quillInstanceRef.current.root.innerHTML, '', '']));
      });

      const editorRoot = quillInstanceRef.current.root;
      editorRoot.addEventListener('focus', () => setIsFocused(true));
      editorRoot.addEventListener('blur', () => setIsFocused(false));

      const toolbar = quillInstanceRef.current.getModule('toolbar').container;
      toolbar.addEventListener('mousedown', (e) => {
        e.preventDefault();
        editorRoot.focus();
      });
    }

    if (quillInstanceRef.current.root.innerHTML !== tituloGlobalNota) {
      quillInstanceRef.current.root.innerHTML = tituloGlobalNota;
    }
  }, [dispatch, indice, tituloGlobalNota]);

  return (
    <span className="p-0" style={{ display: 'flex', alignItems: 'center' }}>
      <BotoneraContenido indice={indice} />
      <div className={`quill-editor ${isFocused ? 'focused' : ''}`} translate="no">
        <div
          ref={editorRef}
          className="quill-editor"
          translate="no"
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
