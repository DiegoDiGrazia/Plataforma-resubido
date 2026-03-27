import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./InteraccionPorNota.css";
import { useSelector } from 'react-redux';
import { seleccionPorFiltro } from '../../barplot/Barplot';
import { formatNumberMiles } from '../Dashboard';
import { useMemo } from 'react';

const CAMPOS_METRICAS = [
    "i_facebook_clicks",
    "i_facebook_reaction_like",
    "i_facebook_comments",
    "i_facebook_shared",
    'i_facebook_impressions',
    "i_instagram_clicks",
    "i_instagram_reaction_like",
    "i_instagram_comments",
    "i_instagram_shared",
    'i_instagram_impressions',
    'i_dv360_clicks',
    'i_dv360_impressions',
    'i_search_clicks',
    'i_search_impressions',
    "i_youtube_clicks",
    "i_youtube_like",
    "i_youtube_comments",
    "i_youtube_shared",
    'i_youtube_impressions',
    

];

const PlataformaMasImpresiones = ({datosLocales, resumenCliente= null, loading = false}) => {
    const FiltroActual = useSelector((state) => state.dashboard.filtro);

    const sumarCampos = (data, campos) => {
    return data.reduce((acc, item) => {
        campos.forEach(campo => {
            acc[campo] += Number(item[campo] || 0);
        });
        return acc;
    }, Object.fromEntries(campos.map(c => [c, 0])));
    };

    const totalesInteracciones = useMemo(() => {
        if (!resumenCliente) return null;

        const cantidad_meses = seleccionPorFiltro(FiltroActual);

        const dataFiltrada = resumenCliente.slice(cantidad_meses);

        return sumarCampos(dataFiltrada, CAMPOS_METRICAS);

    }, [resumenCliente, FiltroActual]);

    const plataformasData = [
        {
            nombre: 'Facebook',
            logo: '/images/logoFB.png',
            impresiones: totalesInteracciones.i_facebook_impressions,
            comentarios: totalesInteracciones.i_facebook_comments,
            meGusta: totalesInteracciones.i_facebook_reaction_like,
            clicks: totalesInteracciones.i_facebook_clicks,
            compartido: totalesInteracciones.i_facebook_shared,
        },
        {
            nombre: 'Instagram',
            logo: '/images/logo_ig.png',
            impresiones: totalesInteracciones.i_instagram_impressions,
            comentarios: totalesInteracciones.i_instagram_comments,
            meGusta: totalesInteracciones.i_instagram_reaction_like,
            clicks: totalesInteracciones.i_instagram_clicks,
            compartido: totalesInteracciones.i_instagram_shared,
        },
        {
            nombre: 'Search',
            logo: '/images/logo_google.png',
            impresiones: totalesInteracciones.i_search_impressions,
            comentarios: 0,
            meGusta: 0,
            clicks: totalesInteracciones.i_search_clicks,
            compartido: 0
        },
        {
            nombre: 'DV360',
            logo: '/images/dv360.png',
            impresiones: totalesInteracciones.i_dv360_impressions,
            comentarios: 0,
            meGusta: 0,
            clicks: totalesInteracciones.i_dv360_clicks,
            compartido: 0
        },
        {
            nombre: 'YOUTUBE',
            logo: '/images/youtube.png',
            impresiones: totalesInteracciones.i_youtube_impressions,
            comentarios: totalesInteracciones.i_youtube_comments,
            meGusta: totalesInteracciones.i_youtube_like,
            clicks: totalesInteracciones.i_youtube_clicks,
            compartido: totalesInteracciones.i_youtube_shared,
        }
    ];

    const plataformasConDatos = plataformasData.filter(p =>
        p.impresiones != 0
    );

    console.log("Plataformas con datos:", plataformasConDatos);

    return (
        <div className="">
            <div className='row pt-0'>
                <p id="titulo_relevantes">Plataforma con más impresiones
                    <img src="/images/help-circle.png" alt="Descripción" className="info-icon no-print" title="aca va el texto"/>
                </p>
            </div>
            <div className="accordion">
                {plataformasConDatos.map((plataforma, index) => (
                    <div className="accordion-item" key={index}>
                        <button
                            className="accordion-button pt-0 pb-0"
                            type="button"
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
                        <div className={`accordion-collapse collapse show`}>
                            <div className="accordion-body pt-0">
                                <div className='row pt-0'>
                                    {plataforma.comentarios != 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/logoComentarios.png" alt="Comentarios" className='img-fluid me-2' />
                                        <div className='comentarios'>
                                            <span className='d-block'>Comentarios</span>
                                            <span className='d-block'>{plataforma.comentarios}</span>
                                        </div>
                                    </div>
                                    }
                                    {plataforma.meGusta != 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/logoMeGusta.png" alt="Me gusta" className='img-fluid me-2' />
                                        <div className='comentarios'>
                                            <span className='d-block'>Me gusta</span>
                                            <span className='d-block'>{plataforma.meGusta}</span>
                                        </div>
                                    </div>
                                    }
                                    {plataforma.clicks != 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/logoClicks.png" alt="Clicks" className='img-fluid me-2' />
                                        <div className='comentarios'>
                                            <span className='d-block'>Clicks</span>
                                            <span className='d-block'>{plataforma.clicks}</span>
                                        </div>
                                    </div>
                                    }
                                    {plataforma.clicks != 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/logoClicks.png" alt="Clicks" className='img-fluid me-2' />
                                        <div className='comentarios'>
                                            <span className='d-block'>CTR</span>
                                            <span className='d-block'>{(plataforma.clicks / plataforma.impresiones * 100).toFixed(2)}%</span>
                                        </div>
                                    </div>
                                    }
                                    {plataforma.compartido != 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/logoCompartir.png" alt="Compartido" className='img-fluid me-2' />
                                        <div className='comentarios'>
                                            <span className='d-block'>Compartido</span>
                                            <span className='d-block'>{plataforma.compartido}</span>
                                        </div>
                                    </div>
                                    }
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