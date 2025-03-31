import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Button } from 'react-bootstrap';
import Sidebar from '../sidebar/Sidebar'; // Importa el Sidebar
import './Dashboard.css';
import Barplot from '../barplot/Barplot.jsx';
import InteraccionPorNota from './datosRelevantes/InteraccionPorNota.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { setFiltro } from '../../redux/dashboardSlice.js';
import PlataformaMasImpresiones from './datosRelevantes/PlataformaMasImpresiones.jsx';
import MediosMasRelevantes from './datosRelevantes/MediosMasRelevantes.jsx';
import CategoriasMasRelevantes from './datosRelevantes/CategoriasMasRelevantes.jsx';
import { seleccionPorFiltro } from '../barplot/Barplot.jsx';
import { setFechaActual } from '../../redux/cargadosSlice.js';
import { useNavigate } from 'react-router-dom';
import SelectorCliente from './SelectorCliente.jsx';
import { resetCrearNota } from '../../redux/crearNotaSlice.js';

export function formatNumberMiles(num) {
    if (num === null || num === undefined || num === "") {
        return "";
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatFechaApiExportar(fechaStr) {
    const [year, month] = fechaStr.split("-");
    return `01-${month}-${year}`;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const nombreCliente = useSelector((state) => state.formulario.cliente);
    const FiltroActual = useSelector((state) => state.dashboard.filtro);
    const periodos = useSelector((state) => state.dashboard.periodos_api).split(",");
    const componenteRef = useRef(null);

    const periodosActuales = periodos.slice(seleccionPorFiltro(FiltroActual));
    const handleClickFiltro = (nuevoFiltro) => {
        dispatch(setFiltro(nuevoFiltro));
    };

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => { 
        const fecha = new Date();
        dispatch(setFechaActual(fecha.getDate()));
    }, [FiltroActual, dispatch]);

    const es_editor = useSelector((state) => state.formulario.es_editor);
    const fecha = new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const ClickearEnCrearNota = () => {
        dispatch(resetCrearNota());
        navigate("/crearNota");
    };

    return (
        <div className="container-fluid sinPadding">
            <div className="d-flex h-100">
                <Sidebar estadoActual={"dashboard"} className='no-print' />
                <div className="content flex-grow-1" ref={componenteRef}>
                    <div id="print-header">
                        <img src="/images/headerExports.png" alt="Encabezado para impresión"  className='mb-5'/>
                        <h4 id="saludo" className='nombreReporteEncabezado'>Reporte de {nombreCliente} </h4>
                        <h5 className='resenaReporte'>Reporte emitido el {fecha} de {FiltroActual.toLowerCase()} de la cuenta </h5>
                    </div>
                    <div className="p-3 mt-4">
                        <header id="head_dash no-print">
                            {es_editor ? (
                                <SelectorCliente />
                            ) : (
                                <>
                                    <h4 id="saludo">Hola</h4>
                                    <h3 id="nombre_municipio">{nombreCliente}</h3>
                                </>
                            )}
                            <Button id="botonCrearNota" className='no-print' variant="none" onClick={() => ClickearEnCrearNota()}>
                                <img src="/images/boton_crear_nota.png" alt="Icono 1" className="icon me-2" />
                            </Button>
                        </header>
                        <div className="subtitulo no-print">
                            <h5 id="subtitulo_performance">Performance de la cuenta</h5>
                            <span className='botones_subtitulo'>
                                <div className="dropdown">
                                    <button className="btn custom-dropdown-button dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                        <img src="/images/calendarIcon.png" alt="Icono 1" className="icon me-2" /> {FiltroActual}
                                    </button>
                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                        <li key="opcion1a">
                                            <button className="dropdown-item" onClick={() => handleClickFiltro("Ultimos 3 meses")}>Últimos 3 meses</button>
                                        </li>
                                        <li key="opcion2b">
                                            <button className="dropdown-item" onClick={() => handleClickFiltro("Ultimos 6 meses")}>Últimos 6 meses</button>
                                        </li>
                                        <li key="opcion3c">
                                            <button className="dropdown-item" onClick={() => handleClickFiltro("Ultimo año")}>Último año</button>
                                        </li>
                                    </ul>
                                </div>
                                <div className="dropdown">
                                    <button className="btn custom-dropdown-button dropdown-toggle" type="button" id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false">
                                        <img src="/images/share_icon.png" alt="Icono 1" className="icon me-2" />
                                        Compartir
                                    </button>
                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton2">
                                        <li>
                                            <button className="dropdown-item" onClick={handlePrint}>Descargar</button>
                                        </li>
                                    </ul>
                                </div>
                            </span>
                        </div>
                        <div className="mb-2 tamaño_barplot">
                            <Barplot />
                        </div>
                        <div className='row g-1'>
                            <div className='col-lg-12 col-xl m-2  back-white'>
                                <InteraccionPorNota />
                            </div>
                            <div className='col-lg-12 col-xl m-2  back-white'>
                                <MediosMasRelevantes />
                            </div>
                        </div>
                        <div className='row g-1'>
                            <div className='col-lg-12 col-xl m-2 p-3 back-white'>
                                <PlataformaMasImpresiones />
                            </div>
                            <div className='col-lg-12 col-xl m-2 p-3 back-white'>
                                <CategoriasMasRelevantes />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;