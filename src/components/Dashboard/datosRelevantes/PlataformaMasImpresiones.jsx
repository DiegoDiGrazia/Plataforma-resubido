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
    'i_facebook_users',
    'i_facebook_reaction_angry',
    'i_facebook_reaction_haha',
    'i_facebook_reaction_love',
    'i_facebook_reaction_sorry',
    'i_facebook_reaction_wow',
    "i_instagram_clicks",
    "i_instagram_reaction_like",
    "i_instagram_comments",
    "i_instagram_shared",
    'i_instagram_impressions',
    'i_instagram_users',
    'i_dv360_clicks',
    'i_dv360_impressions',
    'i_dv360_users',
    'i_search_clicks',
    'i_search_impressions',
    "i_youtube_clicks",
    "i_youtube_like",
    "i_youtube_comments",
    "i_youtube_shared",
    'i_youtube_impressions',
    'i_youtube_users',
    "i_youtube_reproduction_play",
    "i_youtube_reproduction_25",
    "i_youtube_reproduction_50",
    "i_youtube_reproduction_75",
    "i_youtube_reproduction_100"

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
        return sumarCampos(resumenCliente, CAMPOS_METRICAS);

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
            usuariosUnicos: totalesInteracciones.i_facebook_users,
            reaccion_haha: totalesInteracciones.i_facebook_reaction_haha,
            reaccion_love: totalesInteracciones.i_facebook_reaction_love,
            reaccion_angry: totalesInteracciones.i_facebook_reaction_angry,
            reaccion_sorry: totalesInteracciones.i_facebook_reaction_sorry,
            reaccion_wow: totalesInteracciones.i_facebook_reaction_wow,
        },
        {
            nombre: 'Instagram',
            logo: '/images/logo_ig.png',
            impresiones: totalesInteracciones.i_instagram_impressions,
            comentarios: totalesInteracciones.i_instagram_comments,
            meGusta: totalesInteracciones.i_instagram_reaction_like,
            clicks: totalesInteracciones.i_instagram_clicks,
            compartido: totalesInteracciones.i_instagram_shared,
            usuariosUnicos: totalesInteracciones.i_instagram_users,
        },
        {
            nombre: 'Search',
            logo: '/images/logo_google_search.png',
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
            compartido: 0,
            usuariosUnicos: totalesInteracciones.i_dv360_users,
        },
        {
            nombre: 'Youtube',
            logo: '/images/youtube.png',
            impresiones: totalesInteracciones.i_youtube_impressions,
            comentarios: totalesInteracciones.i_youtube_comments,
            meGusta: totalesInteracciones.i_youtube_like,
            clicks: totalesInteracciones.i_youtube_clicks,
            compartido: totalesInteracciones.i_youtube_shared,
            usuariosUnicos: totalesInteracciones.i_youtube_users,
            play: totalesInteracciones.i_youtube_reproduction_play,
            veinticinco: totalesInteracciones.i_youtube_reproduction_25,
            cincuenta: totalesInteracciones.i_youtube_reproduction_50,
            setentaycinco: totalesInteracciones.i_youtube_reproduction_75,
            cien: totalesInteracciones.i_youtube_reproduction_100,
        }
    ];

    const plataformasConDatos = plataformasData.filter(p =>
        p.impresiones != 0
    );

    console.log("Plataformas con datos:", plataformasConDatos);

    return (
        <div className="desgloce-plataforma">
            <div className='row titulo_relevantes pt-3 px-2'>
                <p>Desgloce por plataforma
                    <img src="/images/help-circle.png" alt="Descripción" className="info-icon no-print" title="Es el desglose de impresiones por plataforma en la que difundimos tus notas. Las impresiones son la contabilización de cada vez que una persona navego en estas plataformas estando presente la difusión de tu contenido."/>
                </p>
            </div>
            <div className="accordion">
                {plataformasConDatos.map((plataforma, index) => (
                    <div className="accordion-item" key={index}>
                        <div className="accordion-button pt-0 pb-0">
                            <div className='row pt-0 mb-2'>
                                <div className='col-1'>
                                    <img src={plataforma.logo} alt={`Icono ${plataforma.nombre}`} className='imagenWidwet' />
                                </div>
                                <div className='col pt-3 ps-0'>
                                    <div className='row p-0 nombre_plataforma'>
                                        {plataforma.nombre}
                                    </div>
                                </div>
                                <div className='col totales_widget'>
                                    <strong>{formatNumberMiles(plataforma.impresiones)}</strong> imps
                                </div>
                            </div>
                        </div>
                        <div className={`accordion-collapse collapse show`}>
                            <div className="accordion-body pt-0">
                                <div className='row row-cols-md-3 row-cols-lg-5 pt-0 ps-4 gy-3'>
                                    {plataforma.meGusta != 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/logoMeGusta.png" alt="Me gusta" className='img-fluid me-2' />
                                        <div className='comentarios'>
                                            <span className='d-block'>Me gusta</span>
                                            <span className='d-block'>{formatNumberMiles(plataforma.meGusta)}</span>
                                        </div>
                                    </div>
                                    }
                                    {plataforma.clicks != 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/logoClicks.png" alt="Clicks" className='img-fluid me-2' />
                                        <div className='comentarios'>
                                            <span className='d-block'>Clicks</span>
                                            <span className='d-block'>{formatNumberMiles(plataforma.clicks)}</span>
                                        </div>
                                    </div>
                                    }
                                    {plataforma.clicks != 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img 
                                            src="/images/barchar_icon.png" 
                                            alt="Clicks" 
                                            className='icono-ctr img-fluid me-2'   
                                            />
                                        <div className='comentarios'>
                                            <span className='d-block'>CTR</span>
                                            <span className='d-block'>{(plataforma.clicks / plataforma.impresiones * 100).toFixed(2)}%</span>
                                        </div>
                                    </div>
                                    }
                                    {plataforma.comentarios != 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/logoComentarios.png" alt="Comentarios" className='img-fluid me-2' />
                                        <div className='comentarios'>
                                            <span className='d-block'>Comentarios</span>
                                            <span className='d-block'>{formatNumberMiles(plataforma.comentarios)}</span>
                                        </div>
                                    </div>
                                    }
                                    {plataforma.compartido != 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/logoCompartir.png" alt="Compartido" className='img-fluid me-2' />
                                        <div className='comentarios'>
                                            <span className='d-block'>Compartido</span>
                                            <span className='d-block'>{formatNumberMiles(plataforma.compartido)}</span>
                                        </div>
                                    </div>
                                    }
                                    {plataforma.usuariosUnicos > 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/logo-personas.png" alt="haha" className='icono-ctr img-fluid me-2' />
                                        <div className='play'>
                                            <span className='d-block'>Usuarios</span>
                                            <span className='d-block'>{formatNumberMiles(plataforma.usuariosUnicos)}</span>
                                        </div>
                                    </div>    
                                    }
                                    {plataforma.reaccion_haha > 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/reaccion-risas.png" alt="haha" className='icono-ctr img-fluid me-2' />
                                        <div className='play'>
                                            <span className='d-block'></span>
                                            <span className='d-block'>{formatNumberMiles(plataforma.reaccion_haha)}</span>
                                        </div>
                                    </div>    
                                    }
                                    {plataforma.reaccion_love > 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/reaccion-love.png" alt="love" className='icono-ctr img-fluid me-2' />
                                        <div className='play'>
                                            <span className='d-block'></span>
                                            <span className='d-block'>{formatNumberMiles(plataforma.reaccion_love)}</span>
                                        </div>
                                    </div>    
                                    }
                                    {plataforma.reaccion_wow > 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/reaccion-wow.png" alt="wow" className='icono-ctr img-fluid me-2' />
                                        <div className='play'>
                                            <span className='d-block'></span>
                                            <span className='d-block'>{formatNumberMiles(plataforma.reaccion_wow)}</span>
                                        </div>
                                    </div>    
                                    }
                                    {plataforma.reaccion_angry > 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/reaccion-angry.png" alt="angry" className='icono-ctr img-fluid me-2' />
                                        <div className='play'>
                                            <span className='d-block'></span>
                                            <span className='d-block'>{formatNumberMiles(plataforma.reaccion_angry)}</span>
                                        </div>
                                    </div>    
                                    }
                                    {plataforma.reaccion_sorry > 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/reaccion-sorry.png" alt="sorry" className='icono-ctr img-fluid me-2' />
                                        <div className='play'>
                                            <span className='d-block'></span>
                                            <span className='d-block'>{formatNumberMiles(plataforma.reaccion_sorry)}</span>
                                        </div>
                                    </div>    
                                    }
                                    {plataforma.play > 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/play_arrow.png" alt="Play" className='icono-ctr img-fluid me-2' />
                                        <div className='play'>
                                            <span className='d-block'>Visitas</span>
                                            <span className='d-block'>{formatNumberMiles(plataforma.play)}</span>
                                        </div>
                                    </div>    
                                    }
                                    {plataforma.veinticinco > 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/clock_25.png" alt="25" className='icono-ctr img-fluid me-2' />
                                        <div className='veinticinco'>
                                            <span className='d-block'>25% visto</span>
                                            <span className='d-block'>{formatNumberMiles(plataforma.play)}</span>
                                        </div>
                                    </div>    
                                    }
                                    {plataforma.cincuenta > 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <span className='icono-ctr bi bi-circle-half d-flex align-items-center justify-content-center img-fluid me-2' style={{ color: '#36383b', fontSize: '18px' }}/>
                                        <div className='cincuenta'>
                                            <span className='d-block'>50% visto</span>
                                            <span className='d-block'>{formatNumberMiles(plataforma.play)}</span>
                                        </div>
                                    </div>    
                                    }
                                    {plataforma.setentaycinco > 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/clock_75.png" alt="75" className='icono-ctr img-fluid me-2' />
                                        <div className='setentaycinco'>
                                            <span className='d-block'>75% visto</span>
                                            <span className='d-block'>{formatNumberMiles(plataforma.play)}</span>
                                        </div>
                                    </div>    
                                    }
                                    {plataforma.cien > 0 &&
                                    <div className='col d-flex align-items-center'>
                                        <img src="/images/clock_100.png" alt="100" className='icono-ctr img-fluid me-2' />
                                        <div className='cien'>
                                            <span className='d-block'>100% visto</span>
                                            <span className='d-block'>{formatNumberMiles(plataforma.play)}</span>
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