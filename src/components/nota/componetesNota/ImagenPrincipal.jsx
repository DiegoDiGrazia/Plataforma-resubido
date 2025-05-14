import React, { useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useDispatch, useSelector } from 'react-redux';
import { setImagenPrincipal } from '../../../redux/crearNotaSlice';

const ImagenPrincipal = () => {
    const dispatch = useDispatch();
    const croppedImage = useSelector((state) => state.crearNota.imagenPrincipal);
    const fileInputRef = useRef(null);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const compressedBase64 = await comprimirImagen(file, 0.1, 1600); // Calidad 50% (ajustable)
                dispatch(setImagenPrincipal(compressedBase64));
            } catch (error) {
                console.error("Error al comprimir la imagen:", error);
            }
        }
    };

    const eliminarImagenPrincipal = () => {
        dispatch(setImagenPrincipal(null));
    };

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

// FUNCIÓN AUXILIAR para COMPRIMIR la imagen sin cambiar tamaño
export async function comprimirImagen(file, calidad = 1, maxWidth = 1600) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            let { width, height } = img;

            // Redimensionar si excede el ancho máximo
            if (width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = height * ratio;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir a Base64 en formato JPEG
            const base64 = canvas.toDataURL('image/png');

            // Mostrar tamaño final
            const sizeInBytes = (base64.length * 3) / 4;
            const sizeInMB = sizeInBytes / (1024 * 1024);
            console.log(`Tamaño final: ${sizeInBytes.toFixed(0)} bytes (${sizeInMB.toFixed(2)} MB)`);

            resolve(base64);
        };

        img.onerror = (err) => reject(err);

        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}
export default ImagenPrincipal;