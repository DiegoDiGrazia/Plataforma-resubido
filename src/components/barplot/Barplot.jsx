import React, { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useDispatch, useSelector } from 'react-redux';
import "./Barplot.css";
import "./BarplotMobile.css";
import { setImpresionesTotalesInstagram, setImpresionesTotalesGoogle, setImpresionesTotalesFacebook, 
    setUsuariosTotales, setUsuariosTotalesGoogle, setUsuariosTotalesMeta, setFechas, 
    setultimaFechaCargadaBarplot,
    setUltimoClienteCargadoBarplot,
    setComentariosFacebook,
    setComentariosInstagram,
    setLikesFacebook,
    setLikesInstagram,
    setCompartidosFacebook,
    setCompartidosInstagram,
    setBusquedaClicks,
    setReaccionesFacebook, setReaccionesInstagram, 
    resetBarplot} from '../../redux/barplotSlice.js';
import axios from 'axios';
import { formatNumberMiles } from '../Dashboard/Dashboard.jsx';
import { useNavigate } from 'react-router-dom';
import Barplot_Carga from './Barplot_mejorado_carga.jsx';

///Recibe una fecha del tipo "2024-08" y te devuelve  "jun 24"
export function formatDate(dateStr) {
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                    'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const [year, month] = dateStr.split('-');
    const monthName = months[parseInt(month, 10) - 1];
    return `${monthName} ${year.slice(-2)}`;
}

/// devuelve todos los periodos para la api con este formato 
/// "2023-10,2023-11,2023-12,2024-01,2024-02,2024-03,2024-04,2024-05,2024-06,2024-07,2024-08,2024-09"
export function periodoUltimoAnio() {
    const months = [];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1 ).padStart(2, '0');
        months.unshift(`${year}-${month}`);
        
        // Retrocede un mes y ajusta el año si es necesario
        currentDate.setDate(1); // Evita problemas con días fuera de rango
        currentDate.setMonth(currentDate.getMonth() - 1);
    }

    return months.join(',');
}
///Recibe un filtro, y devuelve como se debe seleccionar el dato con un slice
export function seleccionPorFiltro(filtro) {
    if (filtro === "Ultimos 3 meses") return -3;
    if (filtro === "Ultimos 6 meses") return -6;
    return -12;
}

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Barplot = ({datosLocales, resumenCliente = null, loading = false}) => {
    const FiltroActual = useSelector((state) => state.dashboard.filtro);
    const captureRef = useRef(null);  // Definir el ref para capturar la imagen
    const [totales, setTotales] = useState({})

    useEffect(() => {
        if (resumenCliente) {
            const cantidad_meses = seleccionPorFiltro(FiltroActual);
            setTotales(
            resumenCliente.slice(cantidad_meses).reduce((acumulador, mes) => {
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
                ///totalMetaPorMes

                acumulador.usuariosMetaPorMes = [
                ...(acumulador.usuariosMetaPorMes || []),
                Number(mes.i_instagram_users || 0) +
                Number(mes.i_youtube_users || 0) +
                Number(mes.i_facebook_users || 0)
                ];
                ///totalMetaPorGoogle
                acumulador.usuariosGooglePorMes = [
                ...(acumulador.usuariosGooglePorMes || []),
                Number(mes.i_dv360_users || 0)
                ];
                ///meses
                acumulador.meses = [
                ...(acumulador.meses|| []),
                mes.month
                ];
                

                return acumulador;
            }, {})
            );
        }
        }, [resumenCliente, FiltroActual]);

    useEffect(() => {
        console.log('totales en barplot:', totales)
    }, [totales])

    const dataReal = {
        labels: totales.meses,
        datasets: [
            {
                label: `Usuarios totales`,
                data: totales.usuariosMetaPorMes,
                backgroundColor: '#2029FF',
                barPercentage: 1.0,
                categoryPercentage: 0.7,
            },
            {
                label: `Impresiones totales`,
                data: totales.usuariosGooglePorMes,
                backgroundColor: '#666CFF',
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

    if (loading) {
        return (
            <Barplot_Carga />)
    }
    
    return (
        <div className="container-fluid sinPadding" ref={captureRef}>
            <div className="row cantidades mt-3 back-white">
                <div className='col-4 barra_lateral'>
                    <p className='leyenda_barplot'>
                        <span className="blue-dot-user"></span> Usuarios Redes Sociales
                        <img src="/images/help-circle.png" alt="Descripción" className="info-icon" title= "Son las personas que llegaron a tus notas desde nuestra difusión en redes sociales."/>  
                    </p>
                    <p className='totales'>{formatNumberMiles(totales.usuariosTotalesRRSS)}</p>
                </div>
                <div className='col' style={{ paddingLeft: '20px' }}>
                    <p className='leyenda_barplot'>
                        <span className="blue-dot-impresiones"></span>Usuarios Medios
                        <img src="/images/help-circle.png" alt="Descripción" className="info-icon" title= "Son las personas que llegaron a tus notas desde nuestra difusión en otros medios de noticias."/>  
                    </p>
                    <p className='totales'>{formatNumberMiles(totales.usuariosTotalesGoogle)}</p>
                </div>
            </div>
            <div className="row back-white">
                <div className="col barplot" >
                    <div style={{ height: '100%' }}>
                        <Bar data={dataReal} options={optionsReal} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Barplot;