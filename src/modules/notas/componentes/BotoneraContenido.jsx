import React from 'react';
import 'cropperjs/dist/cropper.css';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { BajarContenidoPorIndice, setAttachmentArchivoToNull, setAttachmentToNull, SubirContenidoPorIndice } from '@/store/crearNotaSlice';
import { DeleteContenidoPorIndice } from '@/store/crearNotaSlice';

const  BotoneraContenido= ({indice, tipo, cantidad}) => {
    const dispatch = useDispatch();
    const contenidoNota = useSelector((state) => state.crearNota.contenidoNota[indice]);
    const tieneAtachment = contenidoNota && contenidoNota[4] ? contenidoNota[4] : false;
    console.log("tieneAtachment", tieneAtachment)
    console.log("tipo_", tipo)
    console.log("cantidad", cantidad)


    const eliminarContenido = (indice) =>{
      if(tieneAtachment && tipo == 'imagen'){
        dispatch(setAttachmentToNull(tieneAtachment))
      }
      if(tieneAtachment && tipo == 'archivoPDF'){
        dispatch(setAttachmentArchivoToNull(tieneAtachment))
      }
      if(tieneAtachment && tipo == 'carrusel'){
        for (let i = 0; i < cantidad; i++) {
          dispatch(setAttachmentToNull(tieneAtachment + i));
        }

      }
      dispatch(DeleteContenidoPorIndice(indice))
    }  

    const SubirUnaPosicionContenido = (indice) =>{
      dispatch(SubirContenidoPorIndice(indice))
    }   

    const BajarUnaPosicionContenido = (indice) =>{
      dispatch(BajarContenidoPorIndice(indice))
    }   



    return (

      <span className="botoneraContenido">
            <button type="button" onClick={() => eliminarContenido(indice)} className="nd-icon-btn nd-icon-btn--danger" title="Eliminar bloque" aria-label="Eliminar bloque">
              <i className="bi bi-trash" aria-hidden="true"></i>
            </button>
            <button type="button" onClick={() => SubirUnaPosicionContenido(indice)} className="nd-icon-btn" title="Bajar bloque" aria-label="Bajar bloque">
              <i className="bi bi-arrow-down-short" aria-hidden="true"></i>
            </button>
            <button type="button" onClick={() => BajarUnaPosicionContenido(indice)} className="nd-icon-btn" title="Subir bloque" aria-label="Subir bloque">
              <i className="bi bi-arrow-up-short" aria-hidden="true"></i>
            </button>
      </span>
    );
  };
export default BotoneraContenido;
