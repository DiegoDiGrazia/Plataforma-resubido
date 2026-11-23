import React, { useEffect, useRef, useState } from 'react';
import 'cropperjs/dist/cropper.css';
import { useSelector } from 'react-redux';
import {setEpigrafeImagenPpal} from '@/store/crearNotaSlice';
import { useDispatch } from 'react-redux';


const EpigrafeImagenPpal = () => { 
    const [textoEpigrafe] = useState("");
    const epigrafeEnStore = useSelector((state) => state.crearNota.epigrafeImagenPpal);
    const textareaRef = useRef(null);
    const dispatch = useDispatch();

    
    const handleEpigrafeChange = (e) => {
        dispatch(setEpigrafeImagenPpal(e.target.value));
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    };
    useEffect(() => {
      if(textoEpigrafe !== "") {
        dispatch(setEpigrafeImagenPpal(textoEpigrafe)); 
      }
    }, [textoEpigrafe]);



    return (
        <textarea
            ref={textareaRef}
            placeholder='Epigrafe de imagen principal'
            className='textAreaComentarios textAreaComentarios--epigrafe'
            value={epigrafeEnStore}
            onChange={handleEpigrafeChange}
        ></textarea>

    );
};

export default EpigrafeImagenPpal;

