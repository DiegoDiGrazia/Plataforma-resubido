import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { formatNumberMiles } from '../Dashboard';
import "./InteraccionPorNota.css";
export const RUTA = "http://localhost:4000/"


const PlataformaMasImpresionesNota = ({id_noti, TOKEN, cliente, fpub}) => {
    const [plataformas, setPlataformas] = useState([]); // Estado de carga
    const [openIndex, setOpenIndex] = useState(null); // Estado del acordeón
    const fechaCompleta = new Date(fpub);
    fechaCompleta.setDate(1);
    const desde = fpub ? fechaCompleta.toISOString().split('T')[0] : null;
    fechaCompleta.setMonth(fechaCompleta.getMonth() + 6);
    const hasta = fpub ? fechaCompleta.toISOString().split('T')[0] : null;


    
    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    useEffect(() => {



        axios.post(
            "https://panel.serviciosd.com/app_obtener_impresiones_plataforma_noticia",
            {
                desde: desde,
                hasta: hasta,
                token: TOKEN,
                id_noti: id_noti
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        .then((response) => {
            if (response.data.status === "true") {
                setPlataformas(response.data.item);
            } else {
                console.error('Error en la respuesta de la API:', response.data.message);
            }
        })
        .catch((error) => {
            console.error('Error al hacer la solicitud:', error);
        });
    }, [desde, hasta, TOKEN, id_noti]); // Dependencias del useEffect 

    const ImpresionesFB = Number(plataformas.facebook);
    const ImpresionesIG = Number(plataformas.instagram);
    const ImpresionesDV = Number(plataformas.busqueda);

    return (
        <div className="">
            <div className='row '>
                <p id="titulo_relevantes">Plataforma con más impresiones
                    <img src="/images/help-circle.png" alt="Descripción" className="info-icon" title="aca va el texto"/>
                </p>
            </div>
            {/* FACEBOOK */}

            <div className="accordion">
                {/* Accordion Item #1 */}
                <div className="accordion-item">
                    
                        <button
                            className={`accordion-button ${openIndex === 0 ? '' : 'collapsed'} `}
                            type="button"
                            onClick={() => toggle(0)}
                            aria-expanded={openIndex === 0}
                        >
                            <div className='row pt-0 mb-2' >
                                <div className='col-1'>
                                    <img src="/images/logoFB.png" alt="Icono 1" className='imagenWidwet' />
                                </div>
                                <div className='col pt-1'>
                                    <div className='row p-0 nombre_plataforma'> 
                                        Facebook
                                    </div>
                                    <div className='row p-0'> 
                                        <a href="https://www.facebook.com" className='linkPlataforma'>www.facebook.com</a>
                                    </div>
                                </div>
                                <div className='col totales_widget'>
                                    <p>{formatNumberMiles(ImpresionesFB)}</p>
                                </div>
                            </div>
                        </button>
                 
                    <div className={`accordion-collapse collapse ${openIndex === 0 ? 'show' : ''}`}>
                        <div className="accordion-body pt-0">

                            <div className='row'>
                                {/* Comentarios */}
                                <div className='col d-flex align-items-center'> {/* Usar d-flex para alinearlos en una fila */}
                                    <img src="/images/logoComentarios.png" alt="Icono 1" className='img-fluid me-2' /> {/* Añadir me-2 para margen derecho */}
                                    <div className='comentarios'> {/* Eliminar col innecesario */}
                                        <span className='d-block'>Comentarios</span> {/* Usar d-block para cada línea */}
                                        <span className='d-block'>{plataformas.facebook_comment}</span>
                                    </div>
                                </div>
                                {/* Comentarios */}
                                <div className='col d-flex align-items-center'> {/* Usar d-flex para alinearlos en una fila */}
                                    <img src="/images/logoMeGusta.png" alt="Icono 1" className='img-fluid me-2' /> {/* Añadir me-2 para margen derecho */}
                                    <div className='comentarios'> {/* Eliminar col innecesario */}
                                        <span className='d-block'>Me gusta</span> {/* Usar d-block para cada línea */}
                                        <span className='d-block'>{plataformas.facebook_like}</span>
                                    </div>
                                </div>
                                <div className='col d-flex align-items-center'> {/* Usar d-flex para alinearlos en una fila */}
                                    <img src="/images/logoClicks.png" alt="Icono 1" className='img-fluid me-2' /> {/* Añadir me-2 para margen derecho */}
                                    <div className='comentarios'> {/* Eliminar col innecesario */}
                                        <span className='d-block'>Clicks</span> {/* Usar d-block para cada línea */}
                                        <span className='d-block'>{plataformas.facebook_clicks}</span>
                                    </div>
                                </div>
                                <div className='col d-flex align-items-center'> {/* Usar d-flex para alinearlos en una fila */}
                                    <img src="/images/logoCompartir.png" alt="Icono 1" className='img-fluid me-2' /> {/* Añadir me-2 para margen derecho */}
                                    <div className='comentarios'> {/* Eliminar col innecesario */}
                                        <span className='d-block'>Compartido</span> {/* Usar d-block para cada línea */}
                                        <span className='d-block'>{plataformas.facebook_share}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accordion Item #2 */}
                <div className="accordion-item">
                        <button
                            className={`accordion-button ${openIndex === 1 ? '' : 'collapsed'}`}
                            type="button"
                            onClick={() => toggle(1)}
                            aria-expanded={openIndex === 1}
                        >
                        <div className='row pt-0 mb-2 mt-3' >
                            <div className='col-1'>
                                <img src="/images/logo_ig.png" alt="Icono 1" className='imagenWidwet' />
                            </div>
                            <div className='col pt-1'>
                                <div className='row p-0 nombre_plataforma'> 
                                    Instagram
                                </div>
                                <div className='row p-0'> 
                                    <a href="https://www.instagram.com" className='linkPlataforma'>www.instagram.com</a>
                                </div>
                            </div>
                            <div className='col totales_widget'>
                                <p>{formatNumberMiles(ImpresionesIG)}</p>
                            </div>
                        </div>
                        </button>
                    <div className={`accordion-collapse collapse ${openIndex === 1 ? 'show' : ''}`}>
                        <div className="accordion-body pt-0">

                            <div className='row'>
                                {/* Comentarios */}
                                <div className='col d-flex align-items-center'> {/* Usar d-flex para alinearlos en una fila */}
                                    <img src="/images/logoComentarios.png" alt="Icono 1" className='img-fluid me-2' /> {/* Añadir me-2 para margen derecho */}
                                    <div className='comentarios'> {/* Eliminar col innecesario */}
                                        <span className='d-block'>Comentarios</span> {/* Usar d-block para cada línea */}
                                        <span className='d-block'>{plataformas.instagram_share}</span>
                                    </div>
                                </div>
                                {/* Comentarios */}
                                <div className='col d-flex align-items-center'> {/* Usar d-flex para alinearlos en una fila */}
                                    <img src="/images/logoMeGusta.png" alt="Icono 1" className='img-fluid me-2' /> {/* Añadir me-2 para margen derecho */}
                                    <div className='comentarios'> {/* Eliminar col innecesario */}
                                        <span className='d-block'>Me gusta</span> {/* Usar d-block para cada línea */}
                                        <span className='d-block'>{plataformas.instagram_share}</span>
                                    </div>
                                </div>
                                <div className='col d-flex align-items-center'> {/* Usar d-flex para alinearlos en una fila */}
                                    <img src="/images/logoClicks.png" alt="Icono 1" className='img-fluid me-2' /> {/* Añadir me-2 para margen derecho */}
                                    <div className='comentarios'> {/* Eliminar col innecesario */}
                                        <span className='d-block'>Clicks</span> {/* Usar d-block para cada línea */}
                                        <span className='d-block'>{plataformas.instagram_share}</span>
                                    </div>
                                </div>
                                <div className='col d-flex align-items-center'> {/* Usar d-flex para alinearlos en una fila */}
                                    <img src="/images/logoCompartir.png" alt="Icono 1" className='img-fluid me-2' /> {/* Añadir me-2 para margen derecho */}
                                    <div className='comentarios'> {/* Eliminar col innecesario */}
                                        <span className='d-block'>Compartido</span> {/* Usar d-block para cada línea */}
                                        <span className='d-block'>{plataformas.instagram_share}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Accordion Item #3 */}
                <div className="accordion-item">
                        <button
                            className={`accordion-button ${openIndex === 2 ? '' : 'collapsed'}`}
                            type="button"
                            onClick={() => toggle(2)}
                            aria-expanded={openIndex === 2}
                        >
                            <div className='row pt-0 mb-2 mt-3' >
                                <div className='col-1'>
                                    <img src="/images/logo_google.png" alt="Icono 1" className='imagenWidwet' />
                                </div>
                                <div className='col pt-1'>
                                    <div className='row p-0 nombre_plataforma'> 
                                        Google
                                    </div>
                                    <div className='row p-0'> 
                                        <a href="https://www.google.com" className='linkPlataforma'>www.google.com</a>
                                    </div>
                                </div>
                                <div className='col totales_widget'>
                                    <p>{formatNumberMiles(ImpresionesDV)}</p>
                                </div>
                            </div>
                        </button>
                    <div className={`accordion-collapse collapse ${openIndex === 2 ? 'show' : ''}`}>
                    <div className="accordion-body pt-0">

                        <div className='row'>
                            {/* Comentarios */}
                            <div className='col d-flex align-items-center'> {/* Usar d-flex para alinearlos en una fila */}
                                <img src="/images/logoComentarios.png" alt="Icono 1" className='img-fluid me-2' /> {/* Añadir me-2 para margen derecho */}
                                <div className='comentarios'> {/* Eliminar col innecesario */}
                                    <span className='d-block'>Comentarios</span> {/* Usar d-block para cada línea */}
                                    <span className='d-block'>{0}</span>
                                </div>
                            </div>
                            {/* Comentarios */}
                            <div className='col d-flex align-items-center'> {/* Usar d-flex para alinearlos en una fila */}
                                <img src="/images/logoMeGusta.png" alt="Icono 1" className='img-fluid me-2' /> {/* Añadir me-2 para margen derecho */}
                                <div className='comentarios'> {/* Eliminar col innecesario */}
                                    <span className='d-block'>Me gusta</span> {/* Usar d-block para cada línea */}
                                    <span className='d-block'>{0}</span>
                                </div>
                            </div>
                            <div className='col d-flex align-items-center'> {/* Usar d-flex para alinearlos en una fila */}
                                <img src="/images/logoClicks.png" alt="Icono 1" className='img-fluid me-2' /> {/* Añadir me-2 para margen derecho */}
                                <div className='comentarios'> {/* Eliminar col innecesario */}
                                    <span className='d-block'>Clicks</span> {/* Usar d-block para cada línea */}
                                    <span className='d-block'>{formatNumberMiles(ImpresionesDV)}</span>
                                </div>
                            </div>
                            <div className='col d-flex align-items-center'> {/* Usar d-flex para alinearlos en una fila */}
                                <img src="/images/logoCompartir.png" alt="Icono 1" className='img-fluid me-2' /> {/* Añadir me-2 para margen derecho */}
                                <div className='comentarios'> {/* Eliminar col innecesario */}
                                    <span className='d-block'>Compartido</span> {/* Usar d-block para cada línea */}
                                    <span className='d-block'>{0}</span>
                                </div>
                            </div>
                        </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlataformaMasImpresionesNota;
