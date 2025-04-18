import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Button } from 'react-bootstrap';
import Sidebar from '../sidebar/Sidebar'; // Importa el Sidebar
import "./nota.css";
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatearFecha } from '../Dashboard/datosRelevantes/InteraccionPorNota';
import { formatearTitulo } from '../Dashboard/datosRelevantes/InteraccionPorNota';
import { Spinner } from 'react-bootstrap';
import { left } from '@popperjs/core';
import SelectorCliente from '../Dashboard/SelectorCliente';
import { useCallback } from 'react';
import { editarNota } from './VerNota';
import { resetCrearNota } from '../../redux/crearNotaSlice';
import { analizarHTML, convertirImagenBase64, setContenidoAEditar, setContenidoNota, setImagenPrincipal, setImagenRRSS, setNotaAEditar } from '../../redux/crearNotaSlice';

function unescapeHtml(escapedStr) {
    const temp = document.createElement('textarea');
    temp.innerHTML = escapedStr;
    return temp.value;
  }


const NotasParaEditorial = () => {



    const editarNota = async (notaABM) => {
        console.log("entro a editarNota");
        dispatch(resetCrearNota());
        dispatch(setNotaAEditar(notaABM));

        // const contenidoNota = await analizarHTML(notaABM.parrafo);
        dispatch(setContenidoAEditar([["parrafo", notaABM.parrafo ]]));
    
        try {
            const base64PPAL = await convertirImagenBase64("https://panel.serviciosd.com/img" + notaABM.imagen_principal);
            dispatch(setImagenPrincipal(base64PPAL));
        } catch (error) {
            console.error("Error al convertir la imagen principal a Base64:", error);
            dispatch(setImagenPrincipal(null)); // Opcional: establece un valor por defecto
        }
    
        try {
            const base64RRSS = await convertirImagenBase64("https://panel.serviciosd.com/img" + notaABM.imagen_feed);
            dispatch(setImagenRRSS(base64RRSS));
        } catch (error) {
            console.error("Error al convertir la imagen de RRSS a Base64:", error);
            dispatch(setImagenRRSS(null)); // Opcional: establece un valor por defecto
        }
    
        navigate("/crearNota");
        
    };


    const CLIENTE = useSelector((state) => state.formulario.cliente);
    const navigate = useNavigate()
    const [filtroSeleccionado, setFiltroSeleccionado] = useState(2); /// botones TODAS LAS NOTAS; EN PROGRESO; FINALIZADAS
    const [numeroDePagina, setNumeroDePagina] = useState(1); /// para los botones de la paginacion
    const [todasLasNotas2, setTodasLasNotas2] = useState([])
    const [verMasUltimo, setVerMasUltimo] = useState(2)
    const verMasCantidadPaginacion = 15
    const [traerNotas, setTraerNotas] = useState(true)
    const [cargandoNotas, setCargandoNotas] = useState(true)


    let CantidadDeNotasPorPagina = 200;


    const botones = [
        { id: 2, nombre: 'Publicadas' },
        { id: 3, nombre: 'En revision' },
        { id: 4, nombre: 'Borradores' },
        { id: 5, nombre: 'Eliminadas' },
    ];
    
    // Mapeo de categorías
    const categorias = {
        1: "todas",
        2: "PUBLICADO",
        3: "EN REVISION",
        4: "BORRADOR",
        5: "ELIMINADAS"
    };
    
    
    const handleFiltroClick = useCallback((id, verMas = false) => {
        setFiltroSeleccionado(id);
        setCargandoNotas(true);
    
        const categoria = categorias[id] || "";
        let desdeLimite = 0;
        let limite = verMasCantidadPaginacion;
    
        if (verMas) {
            desdeLimite = verMasUltimo * verMasCantidadPaginacion;
            setVerMasUltimo((prev) => prev + 1);
        } else {
            // Reiniciar lista y contador si se cambia de filtro
            setTodasLasNotas2([]);
            setVerMasUltimo(1);
        }
    
        axios.post(
            "https://panel.serviciosd.com/app_obtener_noticias_abm",
            {
                cliente: CLIENTE,
                desde: "",
                hasta: "",
                token: TOKEN,
                categoria: categoria,
                limit: limite,
                offset: desdeLimite,
            },
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then((response) => {
            if (response.data.message === "Token Invalido") {
                navigate("/");
                return;
            }
    
            if (response.data.status === "true") {
                setTodasLasNotas2((prev) => [...prev, ...response.data.item]);
            } else {
                console.error('Error en la respuesta de la API:', response.data.message);
            }
        })
        .catch((error) => {
            console.error('Error al hacer la solicitud:', error);
        })
        .finally(() => {
            setCargandoNotas(false);
        });
    }, [CLIENTE, TOKEN, navigate, verMasUltimo]);
    
    
    const ClickearEnCrearNota = () => {
        dispatch(resetCrearNota());
        navigate("/crearNota");
    };
    
    const [searchQuery, setSearchQuery] = useState('');
    
    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
        setNumeroDePagina(1);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Aquí puedes manejar la búsqueda, por ejemplo, enviar el query a una API
        console.log('Buscando:', searchQuery);
        };
    

    const dispatch = useDispatch();

    const TOKEN = useSelector((state) => state.formulario.token);

        

        
    const notasFiltradas = todasLasNotas2.filter(nota =>
        nota.titulo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPaginas = Math.ceil(notasFiltradas.length / CantidadDeNotasPorPagina);
    let notasEnPaginaActual = notasFiltradas.slice(
        (numeroDePagina - 1) * CantidadDeNotasPorPagina,
        numeroDePagina * CantidadDeNotasPorPagina
    );

    const listaBotonesPagina = [];
    for (let i = 1; i <= totalPaginas; i++) {
        listaBotonesPagina.push(i);
      }

    
    console.log(notasEnPaginaActual)
    

    ///Chat gpt
    useEffect(() => {
        handleFiltroClick(filtroSeleccionado); // Ejecuta la función con el filtro inicial
    }, [filtroSeleccionado, CLIENTE]); // Solo se ejecuta al montar el componente

    return (
        <div className="container-fluid  sinPadding">
            <div className="d-flex h-100">
                <Sidebar estadoActual={"notasEditorial"} /> {/* Usa el componente Sidebar */}
                <div className="content flex-grow-1">
                            <div className='row'>
                                <h4 id="nota">Notas</h4>
                            </div>
                            <div className='row'>
                                <div className='col'>
                                    <h3 id="saludo" className='headerTusNotas'>
                                        <img src="/images/tusNotasIcon.png" alt="Icono 1" className="icon me-2 icono_tusNotas" /> Tus Notas
                                    </h3>
                                    <SelectorCliente/>
                                    <div className='abajoDeTusNotas'> Crea, gestiona y monitorea tus notas</div>
                                </div>
                                <div className='col boton'>
                                    <Button onClick = {()=> ClickearEnCrearNota() } id="botonPublicar" variant="none">{"Crear nota "}
                                        {CLIENTE ?  "de " + CLIENTE : "sin cliente"}
                                    </Button>
                                </div>
                            </div>

                        <div className='row'>
                            <div className="container">
                            <div className="row">
                            {botones
                                .filter((boton) => !(CLIENTE === "" && boton.id === 1)) // Filtra el botón con id 1 si CLIENTE es ""
                                .map((boton) => (
                                    <div key={boton.id} className="col-auto">
                                        <button
                                            className={`boton_filtro_notas ${
                                                filtroSeleccionado === boton.id ? 'active' : ''
                                            }`}
                                            onClick={() => handleFiltroClick(boton.id)}
                                        >
                                            {boton.nombre}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        </div>
                        {/* todas las notas mas buscador */}
                        <div className='row'>
                            <div className="container-notas">
                                <div className='row'>
                                    <div className='col todasLasNotas'>
                                        Todas Las Notas
                                    </div>
                                    <div className='col buscadorNotas'>
                                        <form onSubmit={handleSearch} className='buscadorNotasForm'>
                                            <input
                                                className='inputBuscadorNotas'
                                                type="text"
                                                value={searchQuery}
                                                onChange={handleInputChange}
                                                placeholder="      Buscar por titulo de la nota"
                                                
                                            />
                                        </form>
                                        
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-auto' style={{width: "70px"}}></div>
                                    <div className='col-4 columna_interaccion' style={{fontSize: "12px", color: "#667085", fontWeight: "bold"}}>Título de la Nota</div>
                                    <div className='col-1 categoriasNotas text-aling-center'>Estado</div>
                                    <div className='col categoriasNotas d-flex align-items-center justify-content-center'>Categorías</div> 
                                    <div className='col categoriasNotas text-end'>Cliente</div>
                                    <div className='col categoriasNotas text-end'>Ver Nota</div>

                                </div>
                                {/* aca va la nota */}

                                {notasEnPaginaActual.map((nota, index) => (
                                        <div key={nota.id_noti || nota.term_id || `nota-${index}`} className='row pt-1 borderNotas'>
                                        <div className='col-auto'>
                                            {nota.imagen ? (
                                                <img src={nota.imagen} alt="Icono Nota" className='imagenWidwetInteracciones2' />
                                            ) : (
                                                <img src={"https://panel.serviciosd.com/img/" + nota.imagen_principal} alt="Icono Nota" className='imagenWidwetInteracciones2' />
                                            )}
                                        </div>
                                        <div className='col-4 pt-1 columna_interaccion nuevoFont'>
                                            
                                            <Link className="link-sin-estilos" onClick={(e) => {e.preventDefault();editarNota(nota);}}>
                                                <div className='row p-0 nombre_plataforma'>
                                                    {formatearTitulo(nota.titulo, 45)}
                                                </div>
                                            </Link>

                                            <div className='row p-0'>
                                                <span className='FechaPubNota'>{nota.f_pub ? formatearFecha(nota.f_pub) : formatearFecha(nota.update_date)}</span>
                                            </div>
                                        </div>
                                        <div className='col-auto d-flex align-items-center'>
                                            <span className="publicada">
                                                <img src="./images/puntoVerde.png" alt="Icono Nota" className='' />
                                                {nota.estado ? " " + nota.estado : " Publicada"}
                                            </span>
                                        </div>
                                        <div className='col-2'>
                                            <span className="categoria_notas">{nota.categorias}</span>
                                        </div>
                                        <div className='col totales_widget'>
                                            <p>{nota.cliente}</p>
                                        </div>
                                        {nota.estado === "PUBLICADO" && (
                                            <div className='col totales_widget' style={{ color: "#007bff"}}>
                                                <a href={`http://noticiasd.com/nota/${nota.term_id}`} target="_blank" rel="noopener noreferrer">VER NOTA</a>
                                            </div>
                                        )}

                                    </div>
                                ))}
                                {cargandoNotas && 
                                
                                <div
                                    className='totales'
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        margin: "20px",
                                        marginLeft: "40px"
                                    }}
                                    >
                                    <Spinner color='blue' />
                                </div>

                                }


                            {/* Botonera de paginación */}
                            <div className='row'>
                                <div className="container">
                                <div className="row justify-content-center">
                                    <div className="col-auto text-center my-4">
                                        <button
                                            className="boton_filtro_notas"
                                            onClick={() => handleFiltroClick(filtroSeleccionado, true)}
                                        >
                                            Ver más
                                        </button>
                                    </div>
                                </div> 
                                </div> 
                                </div>
                            </div>
                        </div>   
                </div>
            </div>
        </div>

    );
};

export default NotasParaEditorial;