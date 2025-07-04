import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import {setAtachment, setAttachmentArchivo, setContenidoPorIndice, setEpigrafeDearchivoPDFLista, setSumarUnoAlNumeroDeAtachment } from '../../../redux/crearNotaSlice';
import BotoneraContenido from './botoneraContenido';


export function obtenerFechaActual() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // Meses de 0 a 11, sumamos 1
    const dia = String(hoy.getDate()).padStart(2, '0'); // Día con 2 dígitos
    return `${año}/${mes}/${dia}`;
}

function calcularNumeroDeAtachment(attachments) {
    for (let i = 1; i <= 10; i++) {
      if (attachments[`attachment_archivo${i}`] === null) {
        return i;
      }
    }
    return 11; // Si están todos ocupados, devuelve 11 (opcional según tu lógica)
  }

const ArchivoPDFListaParrafo = ({ indice }) => {
    const attachments = useSelector((state) => state.crearNota.atachmentsArchivos);
    const numeroDeAtachmentAUsar = calcularNumeroDeAtachment(attachments);
    console.log("numeroDeAtachmentAUsar EN LA archivoPDFLista", numeroDeAtachmentAUsar)
    const dispatch = useDispatch();
    const archivoPDFLista = useSelector((state) => state.crearNota.contenidoNota[indice]);
    const id_att = useSelector((state) => state.crearNota.id_att); 
    if (!archivoPDFLista) {
        console.log(archivoPDFLista[0], "Asdasd");
        return null; // Manejo de casos donde no hay archivoPDFLista
    }

    useEffect(() => {
        if (id_att && !archivoPDFLista[2]) { // Solo ejecuta este efecto si id_att ya tiene un valor
            const atachment = "attachment_archivo" + numeroDeAtachmentAUsar.toString();
            const tipoDearchivoPDFLista = archivoPDFLista[1];

            const urlPDF = "https://noticiasd.com/img/" +
               obtenerFechaActual() +
               "/" +
               id_att +
               "_pdf" +
               numeroDeAtachmentAUsar.toString() +
               "_.pdf";

               const contenido = '<iframe src="' + urlPDF + '" width="40%" height="300px"></iframe>'


            dispatch(
                setContenidoPorIndice([
                    indice,
                    archivoPDFLista[1],
                    contenido,'', numeroDeAtachmentAUsar
                ])
            );
            dispatch(setAttachmentArchivo({ key: atachment, value: archivoPDFLista[1] }));
        }
    }, []); 


    return (
      <>
        <span className="spanContainer">
          <BotoneraContenido indice={indice} tipo={archivoPDFLista[0]} className="pr-2" />
          <iframe
              src={archivoPDFLista[1]}
              alt="archivoPDFLista de parrafo"
              className="archivoPDFListaRecortada archivoPDFListaNotaContenido"
              style={{ width: '40%', height: '300px' }}
          />
        </span>
        </>
    );
};

export default ArchivoPDFListaParrafo;

