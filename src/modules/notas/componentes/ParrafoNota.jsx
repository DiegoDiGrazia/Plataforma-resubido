import React, { useEffect, useRef, useState } from 'react';
import 'cropperjs/dist/cropper.css';
import 'quill/dist/quill.snow.css'; // Estilos de Quill
import { useSelector, useDispatch } from 'react-redux';
import { setContenidoPorIndice } from '@/store/crearNotaSlice';
import BotoneraContenido from './BotoneraContenido';
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

  // El listener de Quill se registra una sola vez: si usara `indice` directo, al insertar o mover
  // un bloque arriba de este párrafo seguiría escribiendo en la posición vieja (otro bloque).
  const indiceRef = useRef(indice);
  indiceRef.current = indice;

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
      dispatch(setContenidoPorIndice([indiceRef.current, quillInstanceRef.current.root.innerHTML, '', '']));
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

  // Sincronizar el editor con el store (carga de la nota, deshacer/rehacer)
  const quill = quillInstanceRef.current;
  if (quill) {
    if (tituloGlobalNota) {
      if (quill.root.innerHTML !== tituloGlobalNota) {
        quill.clipboard.dangerouslyPasteHTML(tituloGlobalNota);
      }
    } else if (quill.getLength() > 1) {
      // El bloque quedó vacío en el store (p. ej. al deshacer): vaciar también el editor
      quill.setText('');
    }
  }
}, [dispatch, indice, tituloGlobalNota]);

  return (
    <span className="p-0 parrafoNota__fila">
      <BotoneraContenido indice={indice} />
      <div className={`quill-editor ${isFocused ? 'focused' : ''}`} translate="no">
        <div
          ref={editorRef}
          className="quill-editor parrafoNota__editor"
          translate="no"
        ></div>
      </div>
    </span>
  );
};

export default ParrafoNota;
