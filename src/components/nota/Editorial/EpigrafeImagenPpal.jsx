import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import { useSelector } from 'react-redux';
import {setEpigrafeImagenPpal} from '../../../redux/crearNotaSlice';
import { useDispatch } from 'react-redux';


const EpigrafeImagenPpal = () => { 
    const [textoEpigrafe, setTextoEpigrafe] = useState("");
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
            className='textAreaComentarios'
            style={{ width: '90%', minHeight: '0px', resize: 'none', padding: '0px 10px', marginLeft: "50px", height: '30px', marginTop: '5px !important'}}
            value={epigrafeEnStore}
            onChange={handleEpigrafeChange}
        ></textarea>

    );
};

export default EpigrafeImagenPpal;

