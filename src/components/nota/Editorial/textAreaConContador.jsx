import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { setEngagement, setBajada } from '../../../redux/crearNotaSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

const TextareaWithCounter = () => {
    const maxCharacters = 130;

    const dispatch = useDispatch()

    const engagementText = useSelector((state) => state.crearNota.engagement) || "";
    const bajadaText = useSelector((state) => state.crearNota.bajada) || "";

    return (
        <div className='p-0'>
            <p>Engagement</p>
            <textarea
                placeholder='Escribe aqui el engagement'
                className='textAreaComentarios col-auto ms-auto'
                maxLength={maxCharacters}
                value={engagementText}
                onChange={(e) => dispatch(setEngagement(e.target.value))}
            ></textarea>
            <p>Carácteres restantes: {maxCharacters - engagementText.length}</p>

            <p>Bajada</p>
            <textarea
                placeholder='Escribe aqui la bajada'
                className='textAreaComentarios col-auto ms-auto'
                maxLength={maxCharacters}
                value={bajadaText}
                onChange={(e) => dispatch(setBajada(e.target.value))}
            ></textarea>
            <p>Carácteres restantes: {maxCharacters - bajadaText.length}</p>
        </div>
    );
};

export default TextareaWithCounter;