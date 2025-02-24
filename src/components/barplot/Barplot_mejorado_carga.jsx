import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Spinner } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useDispatch, useSelector } from 'react-redux';
import "./Barplot.css";
import { setImpresionesTotalesInstagram, setImpresionesTotalesGoogle, setImpresionesTotalesFacebook, 
    setUsuariosTotales, setUsuariosTotalesGoogle, setUsuariosTotalesMeta, setFechas } from '../../redux/barplotSlice.js';
import axios from 'axios';
import { formatNumberMiles } from '../Dashboard/Dashboard.jsx';



/// devuelve todos los periodos para la api con este formato 
/// "2023-10,2023-11,2023-12,2024-01,2024-02,2024-03,2024-04,2024-05,2024-06,2024-07,2024-08,2024-09"
export function periodoUltimoAño() {
    const months = [];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        months.unshift(`${year}-${month}`);
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

const Barplot_Carga = () => {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.formulario.token);
    const fechas = useSelector((state) => state.barplot.fechas);
    const FiltroActual = useSelector((state) => state.dashboard.filtro);
    const nombreCliente = useSelector((state) => state.formulario.cliente);
    const [simulatedData, setSimulatedData] = useState(generateRandomData()); // Estado para los datos animados

    useEffect(() => {
        const interval = setInterval(() => {
            setSimulatedData(generateRandomData());
        }, 800); // Actualiza los datos simulados cada 500 ms

        return () => clearInterval(interval); // Limpia el intervalo si el componente se desmonta
    }, [FiltroActual]);

    // Función para generar datos aleatorios
    function generateRandomData() {
        return Array.from({ length: 12 }, () => Math.floor(Math.random() * 100) + 1);
    }

    const dataSimulated = {
        labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        datasets: [
            {
                label: 'Cargando...',
                data: simulatedData,
                backgroundColor: "grey",
                barPercentage: 1.0,
                categoryPercentage: 0.7,
            }
        ],
    };

    const optionsSimulated = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 500, // Controla la velocidad de la animación
        },
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };


    // Mostrar gráfico de barras animado mientras carga
        return (
            <div className="container-fluid sinPadding">
                <div className="row cantidades mt-3 back-white">
                    <div className='col-2 barra_lateral'>
                        <p className='leyenda_barplot'>
                            <span className="blue-dot-user"></span> Cargando usuarios
                            <img src="/images/help-circle.png" alt="Descripción" className="info-icon" title= "aca va el texto"/>  
                        </p>
                        <div className='totales'><Spinner color='blue'/></div> {/* Cambiado a div */}
                    </div>
                    <div className='col' style={{ paddingLeft: '20px' }}>
                        <p className='leyenda_barplot'>
                            <span className="blue-dot-impresiones"></span> Cargando usuarios
                            <img src="/images/help-circle.png" alt="Descripción" className="info-icon" title= "aca va el texto"/>  
                        </p>
                        <div className='totales'><Spinner color='primary'/></div> {/* Cambiado a div */}
                    </div>
                </div>
                <div className="row back-white">
                    <div className="col barplot">
                        <div style={{ height: '100%' }}>
                            <Bar data={dataSimulated} options={optionsSimulated} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
  

export default Barplot_Carga;