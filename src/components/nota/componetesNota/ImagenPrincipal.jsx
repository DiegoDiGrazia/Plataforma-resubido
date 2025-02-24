import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useDispatch, useSelector } from 'react-redux';
import { setImagenPrincipal } from '../../../redux/crearNotaSlice';

const ImagenPrincipal = () => {
    const dispatch = useDispatch();
    const croppedImage = useSelector((state) => state.crearNota.imagenPrincipal);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                dispatch(setImagenPrincipal(e.target.result));
            };
            reader.readAsDataURL(file);
        }
    };

    const eliminarImagenPrincipal = () => {
        dispatch(setImagenPrincipal(null));
    };

    useEffect(() => {
    }, [croppedImage]);

    return (
        <>
            {!croppedImage && (
                <div className="row seccionImagen">
                    <div className="upload-block">
                        <input
                            type="file"
                            id="fileInput"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <img
                            src="/images/uploadImagen.png"
                            alt="Subir imagen"
                            className="icon me-2 icono_tusNotas"
                        />
                        <div className="row justify-content-center pt-3">Imagen de portada*</div>
                        <label htmlFor="fileInput" className="custom-file-upload">
                            Subí tu imagen
                        </label>
                        <div className="fontGrisImagen">o arrástrala aquí</div>
                        <div className="fontGrisImagen">SVG, PNG o JPG</div>
                    </div>
                </div>
            )}
            {croppedImage && (
                <div className="row">
                    <div className="imagenRecortadaContenedor">
                        <button
                            onClick={eliminarImagenPrincipal}
                            className="boton-superior-izquierda"
                        >
                            <img
                                src="/images/botonBorrarImagen.png"
                                alt="Borrar"
                                className="icon me-2 icono_tusNotas"
                            />
                        </button>
                        <img
                            src={croppedImage}
                            alt="Imagen recortada"
                            className="imagenRecortada"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ImagenPrincipal;
