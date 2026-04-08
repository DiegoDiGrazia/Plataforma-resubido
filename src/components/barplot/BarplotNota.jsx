import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useDispatch, useSelector } from 'react-redux';
import "./Barplot.css";
import axios from 'axios';
import { formatNumberMiles } from '../Dashboard/Dashboard.jsx';
import Barplot_Carga from './Barplot_mejorado_carga.jsx';
import { formatDate } from './Barplot.jsx';
import './BarplotMobile.css'
import './BarplotNotaMobile.css'
import LineChartTwoLines from './LineChartTwoLines.jsx';
import { useEffectEvent } from 'react';
const RUTA = "http://localhost:4000/"

 export function generarPeriodosDesde(f_pub, cantidadDeMesesAGenerar){
    if(f_pub){
        const months = [];
        const currentDate = new Date(f_pub );
        currentDate.setDate(1);
    
        for (let i = 0; i < cantidadDeMesesAGenerar; i++) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            months.push(`${year}-${month}`);
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        return months.join(',');
    }
}



ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarplotNota = ({id_noti, TOKEN, cliente, fpub, dataLocalNota, resumenNota = null}) => {

    console.log("LOCAL DATA NOTA", dataLocalNota)
    const [loading, setLoading] = useState(false); // Estado de carga
    const [totales, setTotales] = useState({})

    useEffect(() => {
        if (resumenNota) {
            setTotales(
            resumenNota.reduce((acumulador, mes) => {
                ///totalRRSS
                acumulador.usuariosTotalesRRSS =
                (acumulador.usuariosTotalesRRSS || 0) +
                Number(mes.i_instagram_users || 0) +
                Number(mes.i_facebook_users || 0) +
                Number(mes.i_youtube_users  || 0);
                ///totalGOOGLE
                acumulador.usuariosTotalesGoogle =
                (acumulador.usuariosTotalesGoogle || 0) +
                Number(mes.i_dv360_users || 0);
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
                Number(mes.i_youtube_impressions || 0)
                ///🔥 NUEVO → impresiones RRSS por mes
                acumulador.impresionesRRSSPorMes = [
                    ...(acumulador.impresionesRRSSPorMes || []),
                    Number(mes.i_facebook_impressions || 0) +
                    Number(mes.i_instagram_impressions || 0) +
                    Number(mes.i_youtube_impressions || 0)
                ];

                ///🔥 NUEVO → impresiones Google por mes
                acumulador.impresionesGooglePorMes = [
                    ...(acumulador.impresionesGooglePorMes || []),
                    Number(mes.i_dv360_impressions || 0) +
                    Number(mes.i_search_impressions || 0)
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
                    Number(mes.i_youtube_users || 0) +
                    Number(mes.i_facebook_users || 0)
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
        }, [resumenNota]);

    useEffect(() => {
        console.log('totales: ', totales)
    },[totales])

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
    };



    const dataReal = {
        labels: totales.f_dato,
        datasets: [
            {
                label: `impresiones google \n  ${totales.usuariosTotalesGoogle}`,
                data: totales.impresionesGooglePorMes,
                backgroundColor: '#34A853',


                barPercentage: 1.0,
                categoryPercentage: 0.7,
            },
            {
                label: `impresiones RRSS \n ${totales.usuariosTotalesRRSS}`,
                data: totales.impresionesRRSSPorMes,
                backgroundColor: '#1877F2',
                barPercentage: 1.0,
                categoryPercentage: 0.7,
            },
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
                backgroundColor: '#f5f5f5', // Cambia el color de fondo del tooltip
                bodyColor: '#333', // Cambia el color del texto del valor
                borderColor: '#999', // Opcional, para agregar un borde
                borderWidth: 1, // Establece el grosor del borde (opcional)
            },
        },
        scales: {
            x: {
                offset: true,
                grid: {
                    offset: false,
                    color: 'rgba(128, 128, 128, 0.1)',
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(128, 128, 128, 0.1)',
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
        <div id='pantalla-barplotNota'>
        <div className="container-fluid ml-5">
            <div className="row cantidades mt-3 back-white">
            <div className='col-4 barra_lateral'>
                <p className='leyenda_barplot'>
                    <span className="blue-dot-user"></span> Impresiones Medios
                    <img src="/images/help-circle.png" alt="Descripción" className="info-icon" title= "dv360 + search + noticias(d)"/>  
                </p>
                <p className='totales'>{formatNumberMiles(totales.impresionesTotalesGoogle)}</p>
            </div>
                <div className='col' style={{ paddingLeft: '20px' }}>
                    <p className='leyenda_barplot'>
                        <span className="blue-dot-impresiones"></span>Impresiones Redes
                        <img src="/images/help-circle.png" alt="Descripción" className="info-icon" title= "Instagram + Facebook + X"/>  
                    </p>
                    <p className='totales'>{formatNumberMiles(totales.impresionesTotalesRRSS)}</p>
                </div>
            </div>
            <div className="row back-white">
                <div className="col barplot">
                    <div style={{ height: '100%' }}>
                        <Bar data={dataReal} options={optionsReal} />
                    </div>
                </div>
            </div>
            <div className="row back-white" id='linea'>
                <div className="col barplot">
                    <div className='line' style={{ height: '100%', width: 'auto' }}>
                        <LineChartTwoLines data={datos} ></LineChartTwoLines>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default BarplotNota;