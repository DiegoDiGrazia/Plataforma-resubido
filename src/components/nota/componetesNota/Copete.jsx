import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import { useSelector, useDispatch } from 'react-redux';
import { setBajada, setCopete } from '../../../redux/crearNotaSlice';
import BotonRegenerarDataConIa from '../botonesIa/BotonRegenerarTextoConIa';

const CopeteNota = ({ indice }) => {
    const tituloRef = useRef(null);
    const tituloGlobalNota = useSelector((state) => state.crearNota.copete);
    const dispatch = useDispatch();
    const [charCount, setCharCount] = useState(tituloGlobalNota.length);
    const MAX_CHARS = 150;
    const nota = useSelector((state) => state.crearNota);
    const TOKEN = useSelector((state) => state.formulario.token);

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (true) {
            dispatch(setCopete(value));
            setCharCount(value.length);
            dispatch(setBajada(value));
            ajustarAltura();
        }
    };

    const ajustarAltura = () => {
        const textarea = tituloRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(() => {
        ajustarAltura();
        setCharCount(tituloGlobalNota.length);
    }, [tituloGlobalNota]);

    return (
        <span className="d-flex flex-column">
            <textarea
                ref={tituloRef}
                className="inputTituloNota marginTitulo"
                type="text"
                placeholder="Bajada de la nota"
                value={tituloGlobalNota}
                onChange={handleInputChange}
                rows="1"
                style={{ overflow: 'hidden', fontSize: '24px', resize: 'none' }}
            ></textarea>
            <div className="text-end mt-1" style={{ fontSize: '0.9rem', marginRight: "50px" }}>
                {nota.es_ia === '1' &&
                    <BotonRegenerarDataConIa token = {TOKEN} term_id={nota.id_noti} 
                    nombreBoton={'Regenerar bajada con ia'}  endpoint = "app_obtener_bajada_ia" action={setCopete}
                    />
                }
                <span style={{ color: charCount > MAX_CHARS ? 'red' : 'gray' }}>
                    Caracteres: {charCount}/{MAX_CHARS}
                </span>
            </div>
        </span>
    );
};

export default CopeteNota;