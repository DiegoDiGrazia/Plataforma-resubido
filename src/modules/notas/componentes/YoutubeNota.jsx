import React from 'react';
import 'cropperjs/dist/cropper.css';
import { useSelector } from 'react-redux';

import BotoneraContenido from './BotoneraContenido';



const YoutubeNota= ({ indice }) => {
    const imagen = useSelector((state) => state.crearNota.contenidoNota[indice])
    if (!imagen) {
        console.log(imagen[0], "Asdasd")
        return null; // Manejo de casos donde no hay imagen
    }

    return (
           <span className="spanContainer youtubeNota mt-3">
             <BotoneraContenido indice = {indice} className= 'pr-2'/>
             <iframe
                src="https://www.youtube.com/embed/fuW6FLuIJMo"
                title="Video de YouTube"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className='imagenNotaContenido'
            ></iframe>
            </span>

        )
};


export default YoutubeNota;
