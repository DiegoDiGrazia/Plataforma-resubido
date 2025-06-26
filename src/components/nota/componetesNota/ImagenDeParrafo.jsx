import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import {setAtachment, setContenidoPorIndice, setEpigrafeDeImagen, setSumarUnoAlNumeroDeAtachment } from '../../../redux/crearNotaSlice';
import BotoneraContenido from './botoneraContenido';

function obtenerTipoDeImagenDesdeBase64(base64) {
    if (base64.startsWith('data:image/png')) {
      return 'jpeg';
    } else if (base64.startsWith('data:image/jpeg')) {
      return 'jpeg';
    }
    return 'desconocido';
  }

export function obtenerFechaActual() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // Meses de 0 a 11, sumamos 1
    const dia = String(hoy.getDate()).padStart(2, '0'); // Día con 2 dígitos
    return `${año}/${mes}/${dia}`;
}

export function calcularNumeroDeAtachment(attachments) {
    for (let i = 1; i <= 10; i++) {
      if (attachments[`attachment_${i}`] === null) {
        return i;
      }
    }
    return 11; // Si están todos ocupados, devuelve 11 (opcional según tu lógica)
  }

const ImagenDeParrafo = ({ indice }) => {
    const attachments = useSelector((state) => state.crearNota.atachments);
    const numeroDeAtachmentAUsar = calcularNumeroDeAtachment(attachments);
    console.log("numeroDeAtachmentAUsar EN LA IMAGEN", numeroDeAtachmentAUsar)
    const dispatch = useDispatch();
    const imagen = useSelector((state) => state.crearNota.contenidoNota[indice]);
    const id_att = useSelector((state) => state.crearNota.id_att); 
    const [textoEpigrafe, setTextoEpigrafe] = useState("");
        const textareaRef = useRef(null);
    if (!imagen) {
        console.log(imagen[0], "Asdasd");
        return null; // Manejo de casos donde no hay imagen
    }

    // Handler para autoajustar el alto
    const handleEpigrafeChange = (e) => {
        setTextoEpigrafe(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    };
    
    useEffect(() => {
        if (id_att && !imagen[2]) { // Solo ejecuta este efecto si id_att ya tiene un valor
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
                        tipoDeImagen + 
                    '"/>', numeroDeAtachmentAUsar
                ])
            );
            dispatch(setAtachment({ key: atachment, value: imagen[1] }));
        }
    }, []); 


    useEffect(() => {
      if(textoEpigrafe !== "") {
        dispatch(setEpigrafeDeImagen([ indice, textoEpigrafe ]));
      }
    }, [textoEpigrafe]);



    return (
      <>
        <span className="spanContainer">
          <BotoneraContenido indice={indice} className="pr-2" />
          <img
              src={imagen[1]}
              alt="Imagen de parrafo"
              className="imagenRecortada imagenNotaContenido"
          />
        </span>
        <textarea
            ref={textareaRef}
            placeholder='Epigrafe de la imagen'
            className='textAreaComentarios'
            style={{ width: '90%', minHeight: '0px', resize: 'none', padding: '0px 10px', marginLeft: "50px", height: '30px'}}
            value={textoEpigrafe}
            onChange={handleEpigrafeChange}
        ></textarea>
        </>
    );
};

export default ImagenDeParrafo;

