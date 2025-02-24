import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Spinner } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useDispatch, useSelector } from 'react-redux';
import "./Barplot.css";
import { setImpresionesTotalesInstagram, setImpresionesTotalesGoogle, setImpresionesTotalesFacebook, 
    setUsuariosTotales, setUsuariosTotalesGoogle, setUsuariosTotalesMeta, setFechas, 
    setultimaFechaCargadaBarplot,
    setUltimoClienteCargadoBarplot} from '../../redux/barplotSlice.js';
import axios from 'axios';
import { formatNumberMiles } from '../Dashboard/Dashboard.jsx';
import { useNavigate } from 'react-router-dom';


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

const Barplot = () => {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.formulario.token);
    const fechas = useSelector((state) => state.barplot.fechas);
    const FiltroActual = useSelector((state) => state.dashboard.filtro);
    const nombreCliente = useSelector((state) => state.formulario.cliente);
    const ultimo_cliente_cargado = useSelector((state) => state.barplot.ultimoClienteCargadoBarplot);
    const ultima_fecha_cargada = useSelector((state) => state.barplot.ultimaFechaCargadaBarplot);
    const navigate = useNavigate()


    
    
    const [loading, setLoading] = useState(true); // Estado de carga
    const [simulatedData, setSimulatedData] = useState(generateRandomData()); // Estado para los datos animados
    
    const interval = setInterval(() => {
        setSimulatedData(generateRandomData());
    }, 800); // Actualiza los datos simulados cada 500 ms
    useEffect(() => {
        setLoading(true);
        const fecha = new Date();
        const diaMes = fecha.getDate();

        if(nombreCliente != ultimo_cliente_cargado  || diaMes != ultima_fecha_cargada ){
            dispatch(setultimaFechaCargadaBarplot(diaMes));
            dispatch(setUltimoClienteCargadoBarplot(nombreCliente));




        axios.post(
            "https://panel.serviciosd.com/app_obtener_usuarios",
            {
                cliente: nombreCliente,
                periodos: periodoUltimoAño(),
                token: token
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        .then((response) => {
            if(response.data.message === "Token Invalido"){
                navigate("/")
            }
            if (response.data.status === "true") {
                let datos = response.data.item;
                for (let datoMensual of datos) {
                    if (!fechas.includes(datoMensual.periodo)) {
                        dispatch(setFechas(formatDate(datoMensual.periodo)));
                        dispatch(setUsuariosTotales(Number(datoMensual.usuarios_total)));
                        dispatch(setUsuariosTotalesMeta(Number(datoMensual.usuarios_redes)));
                        dispatch(setUsuariosTotalesGoogle(Number(datoMensual.usuarios_medios)));
                        dispatch(setImpresionesTotalesInstagram(Number(datoMensual.impresiones_instagram)));
                        dispatch(setImpresionesTotalesGoogle(Number(datoMensual.impresiones_busqueda)));
                        dispatch(setImpresionesTotalesFacebook(Number(datoMensual.impresiones_facebook)));
                        dispatch(setultimaFechaCargadaBarplot(fecha.getDate()))
                    }
                }
            } else {
                console.error('Error en la respuesta de la API:', response.data.message);
            }
        })
        .catch((error) => {
            console.error('Error al hacer la solicitud:', error);
        })
        .finally(() => {
            clearInterval(interval); // Detén la animación cuando los datos reales estén cargados
            setLoading(false);
        });
    }else{
        setLoading(false);
    }

    return () => clearInterval(interval); // Limpia el intervalo si el componente se desmonta
    }, [nombreCliente]);

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

    // Aquí están tus datos reales
    let cantidad_meses = seleccionPorFiltro(FiltroActual);
    const usuariosPorMesmeta = (useSelector((state) => state.barplot.usuariosTotalesMeta)).slice(cantidad_meses);
    const usuariosPorMesgoogle = (useSelector((state) => state.barplot.usuariosTotalesGoogle)).slice(cantidad_meses);

    const totalUsuariosMeta = usuariosPorMesmeta.reduce((a, b) => a + b, 0);
    const totalUsuariosGoogle = usuariosPorMesgoogle.reduce((a, b) => a + b, 0);

    const dataReal = {
        labels: fechas.slice(cantidad_meses),
        datasets: [
            {
                label: `Usuarios totales\n  ${totalUsuariosMeta}`,
                data: usuariosPorMesmeta,
                backgroundColor: '#2029FF',
                barPercentage: 1.0,
                categoryPercentage: 0.7,
            },
            {
                label: `Impresiones totales\n ${totalUsuariosGoogle}`,
                data: usuariosPorMesgoogle,
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
    
    // Mostrar el gráfico real una vez cargados los datos
    return (
        <div className="container-fluid sinPadding">
            <div className="row cantidades mt-3 back-white">
            <div className='col-4 barra_lateral'>
                <p className='leyenda_barplot'>
                    <span className="blue-dot-user"></span> Usuarios Redes Sociales
                    <img src="/images/help-circle.png" alt="Descripción" className="info-icon" title= "aca va el texto"/>  
                </p>
                <p className='totales'>{formatNumberMiles(totalUsuariosMeta)}</p>
            </div>
                <div className='col' style={{ paddingLeft: '20px' }}>
                    <p className='leyenda_barplot'>
                        <span className="blue-dot-impresiones"></span>Usuarios Medios
                        <img src="/images/help-circle.png" alt="Descripción" className="info-icon" title= "aca va el texto"/>  
                    </p>
                    <p className='totales'>{formatNumberMiles(totalUsuariosGoogle)}</p>
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

export default Barplot;