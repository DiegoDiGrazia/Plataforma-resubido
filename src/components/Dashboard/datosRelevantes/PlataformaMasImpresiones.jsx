import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./InteraccionPorNota.css";
import { useSelector } from 'react-redux';
import { seleccionPorFiltro } from '../../barplot/Barplot';
import { formatNumberMiles } from '../Dashboard';

const PlataformaMasImpresiones = () => {
    const [openIndex, setOpenIndex] = useState(null); // Estado del acordeón
    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const FiltroActual = useSelector((state) => state.dashboard.filtro);
    let cantidad_meses = seleccionPorFiltro(FiltroActual);

    const selectAndSlice = (selector, cantidad_meses) => {
        const data = useSelector((state) => selector(state));
        return Array.isArray(data) ? data.slice(cantidad_meses) : [];
    };

    const sumArray = (arr) => arr.reduce((a, b) => a + b, 0);

    const plataformasData = [
        {
            nombre: 'Facebook',
            logo: '/images/logoFB.png',
            impresiones: sumArray(selectAndSlice(state => state.barplot.impresionesTotalesFacebook, cantidad_meses)),
            comentarios: sumArray(selectAndSlice(state => state.barplot.comentarios_facebook, cantidad_meses)),
            meGusta: sumArray(selectAndSlice(state => state.barplot.likes_facebook, cantidad_meses)),
            clicks: sumArray(selectAndSlice(state => state.barplot.reacciones_facebook, cantidad_meses)),
            compartido: sumArray(selectAndSlice(state => state.barplot.compartidos_facebook, cantidad_meses))
        },
        {
            nombre: 'Instagram',
            logo: '/images/logo_ig.png',
            impresiones: sumArray(selectAndSlice(state => state.barplot.impresionesTotalesInstagram, cantidad_meses)),
            comentarios: sumArray(selectAndSlice(state => state.barplot.comentarios_instagram, cantidad_meses)),
            meGusta: sumArray(selectAndSlice(state => state.barplot.likes_instagram, cantidad_meses)),
            clicks: sumArray(selectAndSlice(state => state.barplot.reacciones_instagram, cantidad_meses)),
            compartido: sumArray(selectAndSlice(state => state.barplot.compartidos_instagram, cantidad_meses))
        },
        {
            nombre: 'Google',
            logo: '/images/logo_google.png',
            impresiones: sumArray(selectAndSlice(state => state.barplot.impresionesTotalesGoogle, cantidad_meses)),
            comentarios: 0,
            meGusta: 0,
            clicks: sumArray(selectAndSlice(state => state.barplot.impresionesTotalesGoogle, cantidad_meses)),
            compartido: 0
        }
    ];

    return (
        <div className="">
            <div className='row '>
                <p id="titulo_relevantes">Plataforma con más impresiones
                    <img src="/images/help-circle.png" alt="Descripción" className="info-icon no-print" title="aca va el texto"/>
                </p>
            </div>
            <div className="accordion">
                {plataformasData.map((plataforma, index) => (
                    <div className="accordion-item" key={index}>
                        <button
                            className={`accordion-button ${openIndex === index ? '' : 'collapsed'}`}
                            type="button"
                            onClick={() => toggle(index)}
                            aria-expanded={openIndex === index}
                        >
                            <div className='row pt-0 mb-2'>
                                <div className='col-1'>
                                    <img src={plataforma.logo} alt={`Icono ${plataforma.nombre}`} className='imagenWidwet' />
                                </div>
                                <div className='col pt-1'>
                                    <div className='row p-0 nombre_plataforma'>
                                        {plataforma.nombre}
                                    </div>
                                    <div className='row p-0'>
                                        <a href={`https://www.${plataforma.nombre.toLowerCase()}.com`} className='linkPlataforma'>{`www.${plataforma.nombre.toLowerCase()}.com`}</a>
                                    </div>
                                </div>
                                <div className='col totales_widget'>
                                    <p>{formatNumberMiles(plataforma.impresiones)}</p>
                                </div>
                            </div>
                        </button>
                        <div className={`accordion-collapse collapse ${openIndex === index ? 'show' : ''}`}>
                            <div className="accordion-body pt-0">
                                <div className='row'>
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/logoComentarios.png" alt="Comentarios" className='img-fluid me-2' />
                                        <div className='comentarios'>
                                            <span className='d-block'>Comentarios</span>
                                            <span className='d-block'>{plataforma.comentarios}</span>
                                        </div>
                                    </div>
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/logoMeGusta.png" alt="Me gusta" className='img-fluid me-2' />
                                        <div className='comentarios'>
                                            <span className='d-block'>Me gusta</span>
                                            <span className='d-block'>{plataforma.meGusta}</span>
                                        </div>
                                    </div>
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/logoClicks.png" alt="Clicks" className='img-fluid me-2' />
                                        <div className='comentarios'>
                                            <span className='d-block'>Clicks</span>
                                            <span className='d-block'>{plataforma.clicks}</span>
                                        </div>
                                    </div>
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/logoCompartir.png" alt="Compartido" className='img-fluid me-2' />
                                        <div className='comentarios'>
                                            <span className='d-block'>Compartido</span>
                                            <span className='d-block'>{plataforma.compartido}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlataformaMasImpresiones;