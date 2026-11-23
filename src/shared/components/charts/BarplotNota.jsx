import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import "./Barplot.css";
import { color, palette, seriesColors } from '@/styles/tokens';
import { formatNumberMiles } from '@/modules/dashboard/Dashboard.jsx';
import Barplot_Carga from './Barplot_mejorado_carga.jsx';
import LineChartTwoLines from './LineChartTwoLines.jsx';




ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarplotNota = ({ dataLocalNota, resumenNota = null}) => {

    console.log("LOCAL DATA NOTA", dataLocalNota)
    const [loading, setLoading] = useState(false); // Estado de carga
    const [totales, setTotales] = useState({})

    useEffect(() => {
        setLoading(true); 
        if (resumenNota) {

            setTotales(
            resumenNota.reduce((acumulador, mes) => {
                ///totalRRSS
                acumulador.usuariosTotalesRRSS =
                (acumulador.usuariosTotalesRRSS || 0) +
                Number(mes.i_instagram_users || 0) +
                Number(mes.i_facebook_users || 0) +
                Number(mes.i_x_users  || 0);

                ///totalGOOGLE
                acumulador.usuariosTotalesGoogle =
                (acumulador.usuariosTotalesGoogle || 0) +
                Number(mes.i_dv360_users || 0);

                //totalVIDEOS
                acumulador.usuariosTotalesVideos =
                (acumulador.usuariosTotalesVideos || 0) +
                Number(mes.i_youtube_users || 0);

                ///totalImpresionesGOOGLE
                acumulador.impresionesTotalesGoogle =
                (acumulador.impresionesTotalesGoogle || 0) +
                Number(mes.i_dv360_impressions || 0) +
                Number(mes.i_search_impressions || 0);

                ///totalImpresionesRRSS
                acumulador.impresionesTotalesRRSS =
                (acumulador.impresionesTotalesRRSS || 0) +
                Number(mes.i_facebook_impressions || 0) +
                Number(mes.i_instagram_impressions || 0) +
                Number(mes.i_x_impressions || 0)
                
                ///totalImpresionesVIDEOS
                acumulador.impresionesTotalesVideos =
                (acumulador.impresionesTotalesVideos || 0) +
                Number(mes.i_youtube_impressions || 0) +
                Number(mes.i_x_starts || 0);

                ///impresiones RRSS por mes
                acumulador.impresionesRRSSPorMes = [
                    ...(acumulador.impresionesRRSSPorMes || []),
                    Number(mes.i_facebook_impressions || 0) +
                    Number(mes.i_instagram_impressions || 0) +
                    Number(mes.i_x_impressions || 0)
                ];

                ///impresiones Google por mes
                acumulador.impresionesGooglePorMes = [
                    ...(acumulador.impresionesGooglePorMes || []),
                    Number(mes.i_dv360_impressions || 0) +
                    Number(mes.i_search_impressions || 0)
                ];

                ///impresiones Videos por mes
                acumulador.impresionesVideosPorMes = [
                    ...(acumulador.impresionesVideosPorMes || []),
                    Number(mes.i_youtube_impressions || 0) +
                    Number(mes.i_x_starts || 0)
                ];

                ///GOGGOLE user (acumulado)
                const ultimoGoogle = acumulador.usuariosGooglePorMes?.at(-1) || 0;

                acumulador.usuariosGooglePorMes = [
                ...(acumulador.usuariosGooglePorMes || []),
                ultimoGoogle + Number(mes.i_dv360_users || 0)
                ];
                ///usuariosMetaPorMes (acumulado)
                const ultimoMeta = acumulador.usuariosMetaPorMes?.at(-1) || 0;

                acumulador.usuariosMetaPorMes = [
                ...(acumulador.usuariosMetaPorMes || []),
                ultimoMeta +
                    Number(mes.i_instagram_users || 0) +
                    Number(mes.i_x_users || 0) +
                    Number(mes.i_facebook_users || 0)
                ];
                ///usuariosVideosPorMes (acumulado)
                const ultimoVideos = acumulador.usuariosVideosPorMes?.at(-1) || 0;
                acumulador.usuariosVideosPorMes = [
                ...(acumulador.usuariosVideosPorMes || []),
                ultimoVideos + Number(mes.i_youtube_users || 0)
                ];
                   
                ///meses
                acumulador.f_dato = [
                ...(acumulador.f_dato|| []),
                mes.f_dato
                ];
                

                return acumulador;
            }, {})
            );
        }
        setLoading(false);
        }, [resumenNota]);

    const datos = {
        labels: totales.f_dato,
        line1: {
            label: `Usuarios Google \n ${totales.usuariosTotalesGoogle}`,
            values: totales.usuariosGooglePorMes,
        },  
        line2: {
            label: `Usuarios RRSS \n ${totales.usuariosTotalesRRSS}`,
            values: totales.usuariosMetaPorMes,
        },
        line3: {
            label: `Usuarios Videos \n ${totales.usuariosTotalesVideos}`,
            values: totales.usuariosVideosPorMes,
        },
    };



    const dataReal = {
        labels: totales.f_dato,
        datasets: [
            {
                label: `impresiones google \n  ${totales.usuariosTotalesGoogle}`,
                data: totales.impresionesGooglePorMes,
                backgroundColor: seriesColors.medios,


                barPercentage: 1.0,
                categoryPercentage: 0.7,
            },
            {
                label: `impresiones RRSS \n ${totales.usuariosTotalesRRSS}`,
                data: totales.impresionesRRSSPorMes,
                backgroundColor: seriesColors.redes,
                barPercentage: 1.0,
                categoryPercentage: 0.7,
            },
            {
                label: `impresiones Videos \n ${totales.usuariosTotalesVideos}`,
                data: totales.impresionesVideosPorMes,
                backgroundColor: seriesColors.videos,
                barPercentage: 1.0,
                categoryPercentage: 0.7,
            }
        ],
    };

    const optionsReal = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true, // Habilita el tooltip
                callbacks: {
                    label: function(context) {
                        // Devuelve solo el valor de la barra (el número)
                        return context.raw;
                    },
                    title: function() {
                        // Retorna un string vacío para no mostrar el título
                        return '';
                    }
                },
                backgroundColor: palette.gray0,
                bodyColor: color.text,
                borderColor: color.border,
                borderWidth: 1, // Establece el grosor del borde (opcional)
            },
        },
        scales: {
            x: {
                offset: true,
                grid: {
                    offset: false,
                    color: color.border,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: color.border,
                },
            },
        },
    };

    // Mostrar gráfico de barras animado mientras carga
    if (loading) {
        return (
            <Barplot_Carga/>
        );
    }
    
    // Mostrar el gráfico real una vez cargados los datos
    return (
        <div id='pantalla-barplotNota' className='nd-barplot'>
            <div>
                <div className="cantidades">
                    <div className='barra_lateral'>
                        <p className='leyenda_barplot'>
                            <span className="blue-dot-user"></span> Impresiones Medios
                            <img src="/images/help-circle.png" alt="Descripción" className="info-icon" title= "dv360 + search + noticias(d)"/>  
                        </p>
                        <p className='totales'>{formatNumberMiles(totales.impresionesTotalesGoogle)}</p>
                    </div>
                    <div className='barra_lateral'>
                        <p className='leyenda_barplot'>
                            <span className="blue-dot-impresiones"></span>Impresiones Redes
                            <img src="/images/help-circle.png" alt="Descripción" className="info-icon" title= "Instagram + Facebook + X"/>  
                        </p>
                        <p className='totales'>{formatNumberMiles(totales.impresionesTotalesRRSS)}</p>
                    </div>
                    <div>
                        <p className='leyenda_barplot'>
                            <span className="blue-dot-impresiones blue-dot-videos"></span>Impresiones Videos
                            <img src="/images/help-circle.png" alt="Descripción" className="info-icon" title= "Youtube + Videos de X"/>  
                        </p>
                        <p className='totales'>{formatNumberMiles(totales.impresionesTotalesVideos)}</p>
                    </div>
                </div>
                <div className="nd-barplot__grafico">
                    <div className="barplot">
                        <div className="h-100">
                            <Bar data={dataReal} options={optionsReal} />
                        </div>
                    </div>
                </div>
                <div className="nd-barplot__grafico" id='linea'>
                    <div className="barplot">
                        <div className='line h-100'>
                            <LineChartTwoLines data={datos} ></LineChartTwoLines>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarplotNota;