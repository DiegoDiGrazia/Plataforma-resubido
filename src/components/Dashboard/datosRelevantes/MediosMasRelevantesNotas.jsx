import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./InteraccionPorNota.css";
import { obtenerTopMediosNoticia } from '../../Apis/dashboardApi';
import { formatNumberMiles } from '../Dashboard';
const multiplicador= 1

function formatearTextoNombre(texto) {
    if(texto) {
        const textoCortado = texto.split('.')[0];
        return textoCortado.charAt(0).toUpperCase() + textoCortado.slice(1).toLowerCase();
    }
}

function reduceByKeyMedios(lista_medios) {
    return lista_medios.reduce((sitios, medio) => {
        if (!sitios[medio.sitio]) {
            sitios[medio.sitio] = {
                ...medio,
                impresiones: Number(medio.impresiones) * multiplicador,
            };
        } else {
            sitios[medio.sitio].impresiones += Number(medio.impresiones);
        }
        return sitios;
    }, {});
}

const MediosMasRelevantesNotas = ({ id_noti, TOKEN, cliente_id, dataLocalNota, paisFiltro }) => {
    const [mediosNota, setMediosNota] = useState([]);

    useEffect(() => {
        obtenerTopMediosNoticia(TOKEN, cliente_id, id_noti, paisFiltro?.pais_id)
        .then((resultado) => {
            if (resultado) {
                setMediosNota(dataLocalNota ? dataLocalNota : (resultado[0]?.medios || []));
            }
        })
        .catch((error) => {
            console.error('Error al hacer la solicitud:', error);
        });
    }, [TOKEN, id_noti, cliente_id, paisFiltro]);

    const todosLosMediosSinRepetir = Object.values(reduceByKeyMedios(mediosNota));
    const listaTresMedios = todosLosMediosSinRepetir
        .sort((medioA, medioB) => medioB.impresiones - medioA.impresiones)
        .slice(0, 5);

    const renderMedio = (medio, index) => (
        <div key={index} className={`row medioRowNota`}>
            <div className='col-auto mr-2'>
                <img src={`https://www.google.com/s2/favicons?domain=${medio.sitio}&sz=64`} alt="Icono" className='imagenWidwetInteracciones' />
            </div>
            <div className='col pt-1'>
                <div className='row p-0 nombre_plataforma'>{formatearTextoNombre(medio.sitio)}</div>
                <div className='row p-0'>
                    <a href={`https://www.${medio.sitio}`}className='linkPlataforma'>{`www.${medio.sitio}`}</a>
                </div>
            </div>
            <div className='col totales_widget impresionesWidget'>
                <p>{formatNumberMiles(medio.impresiones)}</p>
            </div>
        </div>
    );

    return (
        <div className="medios-relevantes">
            <div className='row pt-3 titulo_relevantes'>
                <p>
                    Medios más relevantes
                    <img src="/images/help-circle.png" alt="Descripción" className="info-icon no-print" title="Son los medios de mayor relevancia en los que difundimos tus notas. Las impresiones son la contabilización de cada vez que una persona abrió una pagina de estos medios donde se encontraba presente la difusión de tu contenido." />
                </p>
            </div>
            {listaTresMedios.map(renderMedio)}
        </div>
    );
};

export default MediosMasRelevantesNotas;