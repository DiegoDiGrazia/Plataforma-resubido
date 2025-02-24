import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import { useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import BotoneraContenido from './botoneraContenido';



const YoutubeNota= ({ indice }) => {
    const imagen = useSelector((state) => state.crearNota.contenidoNota[indice])
    if (!imagen) {
        console.log(imagen[0], "Asdasd")
        return null; // Manejo de casos donde no hay imagen
    }
    const dispatch = useDispatch();

    return (
           <span className="spanContainer mt-3" style={{height: "400px", width: "750px"}}>
             <BotoneraContenido indice = {indice} className= 'pr-2'/>
             <iframe
             width={"705px"}
             height={"400"}
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
