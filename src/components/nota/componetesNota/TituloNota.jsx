import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import { useSelector, useDispatch } from 'react-redux';
import { setTituloNota } from '../../../redux/crearNotaSlice';

const TituloNota = ({ indice }) => {
    const tituloRef = useRef(null);
    const tituloGlobalNota = useSelector((state) => state.crearNota.tituloNota);
    const dispatch = useDispatch();
    const [charCount, setCharCount] = useState(tituloGlobalNota.length);
    const MAX_CHARS = 90;

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (true) {
            dispatch(setTituloNota(value));
            setCharCount(value.length);
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
        <span>
            <textarea
                ref={tituloRef}
                className="inputTituloNota marginTitulo"
                type="text"
                placeholder="Escribí un título para la nota"
                value={tituloGlobalNota}
                onChange={handleInputChange}
                rows="1"
                style={{
                    overflow: 'hidden',
                    resize: 'none',
                }}
            ></textarea>
            <div className="text-end mt-1" style={{ fontSize: '0.9rem', marginRight: "50px" }}>
                <span style={{ color: charCount > MAX_CHARS ? 'red' : 'gray' }}>
                    Caracteres: {charCount}/{MAX_CHARS}
                </span>
            </div>
        </span>
    );
};

export default TituloNota;