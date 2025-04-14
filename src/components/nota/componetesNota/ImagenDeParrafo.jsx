import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import {setAtachment, setContenidoPorIndice, setNumeroDeAtachment, setSumarUnoAlNumeroDeAtachment } from '../../../redux/crearNotaSlice';
import BotoneraContenido from './botoneraContenido';


function obtenerTipoDeImagenDesdeBase64(base64) {
    if (base64.startsWith('data:image/png')) {
      return 'jpeg';
    } else if (base64.startsWith('data:image/jpeg')) {
      return 'jpeg';
    }
    return 'desconocido';
  }

function obtenerFechaActual() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // Meses de 0 a 11, sumamos 1
    const dia = String(hoy.getDate()).padStart(2, '0'); // Día con 2 dígitos
    return `${año}/${mes}/${dia}`;
}

const ImagenDeParrafo = ({ indice, numeroDeAtachmentAUsar }) => {
    const dispatch = useDispatch();
    const imagen = useSelector((state) => state.crearNota.contenidoNota[indice]);
    const idUsuario = useSelector((state) => state.formulario.usuario.id);
    const id_att = useSelector((state) => state.crearNota.id_att); 
    
    if (!imagen) {
        console.log(imagen[0], "Asdasd");
        return null; // Manejo de casos donde no hay imagen
    }

    
    useEffect(() => {
        if (id_att) { // Solo ejecuta este efecto si id_att ya tiene un valor
            const atachment = "attachment_" + numeroDeAtachmentAUsar.toString();
            const tipoDeImagen = obtenerTipoDeImagenDesdeBase64(imagen[1]);
    
            dispatch(
                setContenidoPorIndice([
                    indice,
                    imagen[1],
                    '<img src="' +
                        "https://noticiasd.com/img/" +
                        obtenerFechaActual() +
                        "/" +
                        id_att + // Ahora id_att tiene el valor correcto
                        "_" +
                        numeroDeAtachmentAUsar.toString() +
                        "_." +
                        tipoDeImagen  ,
                    '"/>',
                ])
            );
            dispatch(setAtachment({ key: atachment, value: imagen[1] }));
            dispatch(setSumarUnoAlNumeroDeAtachment());
        }
    }, [id_att]); 
    console.log(id_att, "id_att")

    return (
        <span className="spanContainer">
            <BotoneraContenido indice={indice} className="pr-2" />
            <img
                src={imagen[1]}
                alt="Imagen de parrafo"
                className="imagenRecortada imagenNotaContenido"
            />
        </span>
    );
};

export default ImagenDeParrafo;

