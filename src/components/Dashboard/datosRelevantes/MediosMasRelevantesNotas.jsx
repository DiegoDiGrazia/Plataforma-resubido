import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./InteraccionPorNota.css";
import axios from 'axios';
import { formatNumberMiles } from '../Dashboard';

function formatearTextoNombre(texto) {
    const textoCortado = texto.split('.')[0];
    return textoCortado.charAt(0).toUpperCase() + textoCortado.slice(1).toLowerCase();
}

function reduceByKeyMedios(lista_medios) {
    return lista_medios.reduce((sitios, medio) => {
        if (!sitios[medio.sitio]) {
            sitios[medio.sitio] = {
                ...medio,
                impresiones: Number(medio.impresiones) * 10,
            };
        } else {
            sitios[medio.sitio].impresiones += Number(medio.impresiones);
        }
        return sitios;
    }, {});
}

const MediosMasRelevantesNotas = ({ id_noti, TOKEN, cliente, fpub }) => {
    const fechaCompleta = new Date(fpub);
    fechaCompleta.setDate(1);
    const desde = fpub ? fechaCompleta.toISOString().split('T')[0] : null;
    fechaCompleta.setMonth(fechaCompleta.getMonth() + 6);
    const hasta = fpub ? fechaCompleta.toISOString().split('T')[0] : null;

    const [mediosNota, setMediosNota] = useState([]);

    useEffect(() => {
        axios.post(
            "https://panel.serviciosd.com/app_obtener_medios_noticia",
            {
                cliente,
                desde,
                hasta,
                token: TOKEN,
                id_noti,
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        .then((response) => {
            if (response.data.status === "true") {
                setMediosNota(response.data.item);
            } else {
                console.error('Error en la respuesta de la API:', response.data.message);
            }
        })
        .catch((error) => {
            console.error('Error al hacer la solicitud:', error);
        });
    }, [desde, hasta, TOKEN, id_noti, cliente]);

    const todosLosMediosSinRepetir = Object.values(reduceByKeyMedios(mediosNota));
    const listaTresMedios = todosLosMediosSinRepetir
        .sort((medioA, medioB) => medioB.impresiones - medioA.impresiones)
        .slice(0, 3);

    const renderMedio = (medio, index) => (
        <div key={index} className={`row pt-3 medioRowNota ${index > 0 ? 'medioRowNota2' : ''}`}>
            <div className='col-auto mr-2'>
                <img src={`https://panel.serviciosd.com${medio.imagen}`} alt="Icono" className='imagenWidwetInteracciones' />
            </div>
            <div className='col-auto pt-1'>
                <div className='row p-0 nombre_plataforma'>{formatearTextoNombre(medio.sitio)}</div>
                <div className='row p-0'>
                    <a href="https://www.facebook.com" className='linkPlataforma'>{medio.sitio}</a>
                </div>
            </div>
            <div className='col totales_widget impresionesWidget'>
                <p>{formatNumberMiles(medio.impresiones)}</p>
            </div>
        </div>
    );

    return (
        <div className="container-fluid">
            <div className='row'>
                <p id="titulo_relevantes">
                    Medios más relevantes
                    <img src="/images/help-circle.png" alt="Descripción" className="info-icon no-print" title="aca va el texto" />
                </p>
            </div>
            {listaTresMedios.map(renderMedio)}
        </div>
    );
};

export default MediosMasRelevantesNotas;