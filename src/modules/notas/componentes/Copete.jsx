// Bajada de la nota, con texto enriquecido (negrita, cursiva, subrayado y links).
//
// Guarda dos versiones en el store:
// - copete: HTML en una sola línea, sin <p> de Quill (es lo que muestra la nota).
// - bajada: el mismo texto plano (se manda como `extracto` y lo usan la distribución,
//   "Copiar bajada" y el contador de caracteres).
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { setBajada, setCopete } from '@/store/crearNotaSlice';
import BotonRegenerarDataConIa from '@/modules/notas/ia/BotonRegenerarTextoConIa';
import { htmlATextoPlano } from '@/shared/utils/textoPlano';

const MAX_CHARS = 150;

/** HTML del editor en una sola línea: une los párrafos de Quill y saca los <p> vacíos. */
const htmlEnLinea = (root) =>
    Array.from(root.children)
        .map((p) => p.innerHTML)
        .filter((html) => html && html !== '<br>')
        .join(' ');

const CopeteNota = () => {
    const editorRef = useRef(null);
    const quillRef = useRef(null);
    const dispatch = useDispatch();
    const copete = useSelector((state) => state.crearNota.copete) || '';
    const nota = useSelector((state) => state.crearNota);
    const TOKEN = useSelector((state) => state.formulario.token);
    const [enfocado, setEnfocado] = useState(false);
    const caracteres = htmlATextoPlano(copete).length;

    useEffect(() => {
        if (quillRef.current) return;
        const quill = new Quill(editorRef.current, {
            theme: 'snow',
            placeholder: 'Bajada de la nota',
            modules: {
                toolbar: [['bold', 'italic', 'underline'], ['link'], ['clean']],
                keyboard: {
                    // La bajada es un solo párrafo: Enter no crea líneas nuevas
                    bindings: {
                        sinEnter: { key: 'Enter', handler: () => false },
                        sinShiftEnter: { key: 'Enter', shiftKey: true, handler: () => false },
                    },
                },
            },
        });
        quillRef.current = quill;

        quill.on('text-change', (_delta, _anterior, origen) => {
            // Solo cambios del usuario: al cargar la nota o deshacer, el texto ya viene del store
            // (y la bajada/extracto del servidor no se tiene que pisar con el copete)
            if (origen !== 'user') return;
            const html = htmlEnLinea(quill.root);
            dispatch(setCopete(html));
            dispatch(setBajada(htmlATextoPlano(html)));
        });

        quill.root.addEventListener('focus', () => setEnfocado(true));
        quill.root.addEventListener('blur', () => setEnfocado(false));
        // Clic en la barra (negrita, link…) sin perder el foco del texto
        quill.getModule('toolbar').container.addEventListener('mousedown', (e) => {
            e.preventDefault();
            quill.root.focus();
        });
    }, [dispatch]);

    // Store → editor: al abrir una nota, deshacer/rehacer o regenerar con IA
    useEffect(() => {
        const quill = quillRef.current;
        if (!quill || htmlEnLinea(quill.root) === copete) return;
        if (copete) quill.clipboard.dangerouslyPasteHTML(copete);
        else quill.setText('');
    }, [copete]);

    return (
        <span className="d-flex flex-column">
            <div className={`quill-editor notaEditor__copete marginTitulo ${enfocado ? 'focused' : ''}`} translate="no">
                <div ref={editorRef}></div>
            </div>
            <div className="text-end mt-1 nd-text-base notaEditor__contador">
                {nota.es_ia === '1' &&
                    <BotonRegenerarDataConIa token = {TOKEN} term_id={nota.id_noti}
                    nombreBoton={'Regenerar bajada con ia'}  endpoint = "app_obtener_bajada_ia" action={setCopete}
                    />
                }
                <span className={caracteres > MAX_CHARS ? 'nd-text-danger' : 'nd-text-secondary'}>
                    Caracteres: {caracteres}/{MAX_CHARS}
                </span>
            </div>
        </span>
    );
};

export default CopeteNota;
