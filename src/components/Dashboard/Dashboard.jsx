import React from 'react';
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
import axios from 'axios';
import { useEffect } from 'react';
import { useState } from 'react';
import { setFechaActual } from '../../redux/cargadosSlice.js';
import { useNavigate } from 'react-router-dom';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from 'react';
import domToImage from 'dom-to-image';
import SelectorCliente from './SelectorCliente.jsx';



export function formatNumberMiles(num) {
    if (num === null || num === undefined || num === "") {
        return "";
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function formatFechaApiExportar(fechaStr) {
    // Separar la fecha en año y mes
    const [year, month] = fechaStr.split("-");
    
    // Formatear la fecha en "DD-MM-YYYY" con día fijo 01
    return `01-${month}-${year}`;
}



const Dashboard = () => {
    function validarVolverAAcutalizar(cliente, fecha){
        const ultimo_cliente_cargado = useSelector()
    }


    const navigate = useNavigate();
    const dispatch = useDispatch();
    const nombreCliente = useSelector((state) => state.formulario.cliente);
    const FiltroActual = useSelector((state) => state.dashboard.filtro);
    const IDCliente = useSelector((state) => state.formulario.id_cliente);
    const periodos = useSelector((state) => state.dashboard.periodos_api).split(",");
    const [loading, setLoading] = useState(true); // Estado de carga


    console.log(periodos, IDCliente, FiltroActual, seleccionPorFiltro(FiltroActual) )

    const periodosActuales = periodos.slice(seleccionPorFiltro(FiltroActual))
    console.log(periodosActuales)

    const FechaDesde = formatFechaApiExportar(periodosActuales[0])
    const FechaHasta = formatFechaApiExportar(periodosActuales[periodosActuales.length - 1]);  



    const handleClickFiltro = (nuevoFiltro)=>{
        console.log(nuevoFiltro)
        dispatch(setFiltro(nuevoFiltro))


    } 
    
    const componenteRef = useRef(null);
    const generarPDF = async () => {
        try {
            // Referencia al elemento
            const elemento = componenteRef.current;
    
            // Asegurarte de que el elemento existe
            if (!elemento) {
                console.error("El elemento no se encontró.");
                return;
            }
    
            // Convertir el contenido a imagen
            const imgData = await domToImage.toPng(elemento);
    
            // Crear el PDF
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
    
            // Calcular dimensiones proporcionales para ajustar la imagen
            const imgWidth = pageWidth;
            const imgHeight = (elemento.offsetHeight * pageWidth) / elemento.offsetWidth;
    
            if (imgHeight > pageHeight) {
                console.warn("El contenido excede una página de PDF y podría cortarse.");
            }
    
            // Añadir la imagen al PDF
            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    
            // Descargar el archivo
            pdf.save("documento.pdf");
        } catch (error) {
            console.error("Error al generar el PDF:", error);
        }
    };


    useEffect(() => {
        const fecha = new Date();
        dispatch(setFechaActual(fecha.getDate()))
    }, [FiltroActual]); // Se ejecuta cada vez que FiltroActual cambia

    const es_editor = useSelector((state) => state.formulario.es_editor);
    return (
        <div className="container-fluid  sinPadding">

            <div className="d-flex h-100">
                <Sidebar estadoActual={"dashboard"} className = 'no-print'/> {/* Usa el componente Sidebar */}
                <div className="content flex-grow-1" ref={componenteRef}>
                    <div id="print-header">
                        <img src="/images/headerExports.png" alt="Encabezado para impresión" />
                    </div>
                    <div className="p-3 mt-4">
                        <header id = "head_dash">
                        {es_editor ? (
                            /// SELECCIONAR CLIENTE SI ES EDITOR
                            <SelectorCliente/>
                        ) : (
                            <>
                                <h4 id="saludo">Hola</h4>
                                <h3 id="nombre_municipio">{nombreCliente}</h3>
                            </>
                        )}
                            <Button id="botonCrearNota" variant="none" onClick={()=> navigate("/crearNota")}>
                                <img src="/images/boton_crear_nota.png" alt="Icono 1" className="icon me-2" /> 
                            </Button>
                        </header>

                    {/* aca va el subtitulo */}
                        <div className="subtitulo">
                            <h5 id= "subtitulo_performance">Performance de la cuenta</h5>
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
                                {/* <div className="dropdown">
                                    <button className="btn custom-dropdown-button dropdown-toggle" type="button" id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false">
                                        <img src="/images/share_icon.png" alt="Icono 1" className="icon me-2" />
                                        Compartir
                                    </button>
                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton2">
                                        <li><a className="dropdown-item" onClick={() => generarPDF()}>Descargar PDF</a></li>
                                    </ul>
                                </div> */}
                            </span>
                        </div>

                        {/* aca va el barplot */}
                        <div className="mb-2 tamaño_barplot">
                            <Barplot/> 

                        </div>
                        {/* aca van los datos relevantes */}
                       <div className='row g-1'>
                            <div className='col m-2 p-3 back-white'>
                               {  <InteraccionPorNota/>  }
                            </div>
                            <div className='col m-2 p-3 back-white'>
                                  {  <MediosMasRelevantes/>   } 
                            </div>
                        </div> 
                        <div className='row g-1'>
                            <div className='col m-2 p-3 back-white'>
                                 {  <PlataformaMasImpresiones/> }  
                            </div>
                            <div className='col m-2 p-3 back-white'>
                                { <CategoriasMasRelevantes/> }
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;