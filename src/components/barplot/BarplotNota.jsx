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
const RUTA = "http://localhost:4000/"

 export function generarPeriodosDesde(f_pub, cantidadDeMesesAGenerar){
    console.log(f_pub, "adentro de generar periodos")
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

const BarplotNota = ({id_noti, TOKEN, cliente, fpub, dataLocalNota}) => {

    console.log("LOCAL DATA NOTA", dataLocalNota)
    const [loading, setLoading] = useState(true); // Estado de carga
    const [usuariosImpresionesNota, setUsuariosImpresionesNota] = useState([]); // Estado de carga

    useEffect(() => {
        axios.post(
            "https://panel.serviciosd.com/app_obtener_usuarios_impresiones_noticia",
            {
                cliente: cliente,
                periodos: generarPeriodosDesde(String(fpub), 3),
                token: TOKEN,
                id_noti: id_noti,
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        .then((response) => {
            if (response.data.status === "true") {
                setUsuariosImpresionesNota(dataLocalNota ? dataLocalNota : response.data.item);
                console.log(response.data.item)
            } else {
                console.error('Error en la respuesta de la API:', response.data.message);
            }
        })
        .catch((error) => {
            console.error('Error al hacer la solicitud:', error);
        })
        .finally(() => {
            setLoading(false);
        });
    }, [fpub, cliente, TOKEN, id_noti]);


    const usuariosPorMes = usuariosImpresionesNota.map(usuario => usuario.usuarios_total);
    const ImpresionesPorMes = usuariosImpresionesNota.map(usuario => usuario.impresiones_total);
    const labels = usuariosImpresionesNota.map(usuario => formatDate(usuario.periodo));

    const totalUsuarios = usuariosPorMes.reduce((a, b) => a + b, 0);
    const totalImpresiones = ImpresionesPorMes.reduce((a, b) => a + b, 0);

    const dataReal = {
        labels: labels,
        datasets: [
            {
                label: `Usuarios totales\n  ${totalUsuarios}`,
                data: usuariosPorMes,
                backgroundColor: '#2029FF',
                barPercentage: 1.0,
                categoryPercentage: 0.7,
            },
            {
                label: `Impresiones totales\n ${totalImpresiones}`,
                data: ImpresionesPorMes,
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

    // Mostrar gráfico de barras animado mientras carga
    if (loading) {
        return (
            <Barplot_Carga/>
        );
    }
    
    // Mostrar el gráfico real una vez cargados los datos
    return (
        <div className="container-fluid ml-5">
            <div className="row cantidades mt-3 back-white">
            <div className='col-2 barra_lateral'>
                <p className='leyenda_barplot'>
                    <span className="blue-dot-user"></span> Usuarios totales
                    <img src="/images/help-circle.png" alt="Descripción" className="info-icon" title= "aca va el texto"/>  
                </p>
                <p className='totales'>{formatNumberMiles(totalUsuarios)}</p>
            </div>
                <div className='col' style={{ paddingLeft: '20px' }}>
                    <p className='leyenda_barplot'>
                        <span className="blue-dot-impresiones"></span>Impresiones totales
                        <img src="/images/help-circle.png" alt="Descripción" className="info-icon" title= "aca va el texto"/>  
                    </p>
                    <p className='totales'>{formatNumberMiles(totalImpresiones)}</p>
                </div>
            </div>
            <div className="row back-white">
                <div className="col barplot">
                    <div style={{ height: '100%' }}>
                        <Bar data={dataReal} options={optionsReal} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarplotNota;