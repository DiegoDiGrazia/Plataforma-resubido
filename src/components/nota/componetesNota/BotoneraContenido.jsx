import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { BajarContenidoPorIndice, setContenidoPorIndice, setTituloNota, SubirContenidoPorIndice } from '../../../redux/crearNotaSlice';
import { Button } from 'react-bootstrap';
import { DeleteContenidoPorIndice } from '../../../redux/crearNotaSlice';

const BotoneraContenido= ({indice}) => {
    const dispatch = useDispatch();
    
    const eliminarContenido = (indice) =>{
      dispatch(DeleteContenidoPorIndice(indice))
    }   
    const SubirUnaPosicionContenido = (indice) =>{
      dispatch(SubirContenidoPorIndice(indice))
    }   
    const BajarUnaPosicionContenido = (indice) =>{
      dispatch(BajarContenidoPorIndice(indice))
    }   


    return (

      <span style={{ display: 'flex', alignItems: 'center' }}>
            <Button variant="none" onClick={() => eliminarContenido(indice)} className='botonEliminarContenido'>
            <i className="bi bi-trash"></i>
            </Button>
            <Button variant="none" onClick={() => SubirUnaPosicionContenido(indice)} className='botonEliminarContenido'>
            <i className="bi bi-arrow-down-short"></i>
            </Button>
            <Button variant="none" onClick={() => BajarUnaPosicionContenido(indice)} className='botonEliminarContenido'>
            <i className="bi bi-arrow-up-short"></i>
            </Button>
      </span>
    );
  };
export default BotoneraContenido;
