import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import BotoneraContenido from './botoneraContenido';
import { ArchivoContext } from '../../../context/archivoContext';
import { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { setContenidoPorIndice } from '../../../redux/crearNotaSlice';
import { obtenerFechaActual } from './ImagenDeParrafo';
import { useSelector } from 'react-redux';

const VideosDeParrafo = ({ indice }) => {
    const { archivo } = useContext(ArchivoContext); // video es tipo File
    const [videoUrl, setVideoUrl] = useState(null);
    const dispatch = useDispatch()
    const id_att = useSelector((state) => state.crearNota.id_att); 

    useEffect(() => {
      console.log(archivo, videoUrl, "ASDASDASD")
      if (archivo instanceof File) {
        const url = URL.createObjectURL(archivo);
        setVideoUrl(url);
         dispatch(
          setContenidoPorIndice([
            indice,
            "",
            '<video src="' +
              "https://noticiasd.com/img/" +
              obtenerFechaActual() +
              "/" +
              id_att +
              "_video1_.mp4" +
              '" controls></video>'
            ])
      );

        // Limpieza al desmontar o si cambia el archivo
        return () => URL.revokeObjectURL(url);
      }
    }, [archivo]);

    return (
      <>
        <span className="spanContainer">
          <BotoneraContenido indice={indice} className="pr-2" />
           <video src={videoUrl} controls className="videoRecortada videoNotaContenido" /> 
        </span>
        </>
    );
};

export default VideosDeParrafo;

