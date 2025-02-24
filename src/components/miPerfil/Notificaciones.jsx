import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Button } from 'react-bootstrap';
import Sidebar from '../sidebar/Sidebar'; // Importa el Sidebar
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useEffect } from 'react';
import { setTodasLasNotas, setNotasEnProgreso, setNotasFinalizadas } from '../../redux/notasSlice';
import { Link } from 'react-router-dom';
import { formatearFecha } from '../Dashboard/datosRelevantes/InteraccionPorNota';
import { formatearTitulo } from '../Dashboard/datosRelevantes/InteraccionPorNota';
import "./miPerfil.css";
import { useRef } from 'react';

const CantidadDeNotasPorPagina = 6;

const Notificaciones = () => {
    const fileInputRef = useRef(null);

    const [filtroSeleccionado, setFiltroSeleccionado] = useState(1); /// botones TODAS LAS NOTAS; EN PROGRESO; FINALIZADAS
    const [numeroDePagina, setNumeroDePagina] = useState(1); /// para los botones de la paginacion
    
    const botones = [
        { id: 1, nombre: 'Todas las notificaciones' },
        { id: 2, nombre: 'No leidas' },
        { id: 3, nombre: 'Leidas' },
        // { id: 4, nombre: 'En revisión' },
    ];
    const handleClickFiltro = (nuevoFiltro)=>{
        console.log(nuevoFiltro)
    } 

    
    const handleFiltroClick = (id) => {
        setFiltroSeleccionado(id);
        console.log(`Filtro seleccionado: ${id}`);
        // Aquí puedes agregar lógica para filtrar los datos
    };

    const handleBotonPaginaClick = (id) => {
        setNumeroDePagina(id);

    };

    const handleDragOver = (event) => {
        event.preventDefault(); // Previene el comportamiento por defecto
        event.dataTransfer.dropEffect = "copy"; // Cambia el icono a "copiar"
    };
    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0]; // Obtiene el archivo arrastrado
        if (file && file.type.startsWith("image/")) {
            handleFileChange({ target: { files: [file] } }); // Llama a la función de cambio de archivo
        }
    };
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target.result);
                setShowModal(true); // Abre el modal cuando se carga la imagen
            };
            reader.readAsDataURL(file);
        }
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
    
    /// Te devuelve la fecha actual con el formato "YYYY-MM-DD"
    const obtenerFechaActual = () => {
        const fecha = new Date();
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // getMonth() devuelve de 0 a 11, por lo que se suma 1
        const dia = String(fecha.getDate()).padStart(2, '0');
        
        return `${año}-${mes}-${dia}`;
        }

    const dispatch = useDispatch();
    ///api///
    const DESDE = "2024-09-01"
    const HASTA = "2024-09-29"
    const TOKEN = useSelector((state) => state.formulario.token);
    const CLIENTE = useSelector((state) => state.formulario.cliente);


    const todasLasNotas = useSelector((state) => state.notas.todasLasNotas);
    const notasEnProgreso = useSelector((state) => state.notas.notasEnProgreso);
    const notasFinalizadas = useSelector((state) => state.notas.notasFinalizadas);
    
    let TodasLasNotas = todasLasNotas;
    if (filtroSeleccionado === 2) {
        TodasLasNotas = notasEnProgreso;
    } else if (filtroSeleccionado === 3) {
        TodasLasNotas = notasFinalizadas;
    }

        
    const notasFiltradas = TodasLasNotas.filter(nota =>
        nota.titulo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPaginas = Math.ceil(notasFiltradas.length / CantidadDeNotasPorPagina);
    const notasEnPaginaActual = notasFiltradas.slice(
        (numeroDePagina - 1) * CantidadDeNotasPorPagina,
        numeroDePagina * CantidadDeNotasPorPagina
    );

    const listaBotonesPagina = [];
    for (let i = 1; i <= totalPaginas; i++) {
        listaBotonesPagina.push(i);
      }


    

    ///Chat gpt
    
    return (
        <div className="container-fluid sinPadding crearNotaGlobal">
            <div className="d-flex h-100">
                <Sidebar estadoActual={"notificaciones"} /> {/* Usa el componente Sidebar */}
                <div className="content flex-grow-1 crearNotaGlobal">
                    <div className='row miPerfilContainer containerNotificaciones'>
                        <div className='col p-0'>
                            <h3 id="saludo" className='headerTusNotas ml-0'>
                                <img src="/images/notificacionesIcon.png" alt="Icono 1" className="icon me-2 icono_tusNotas" /> Notificaciones
                            </h3>
                            <div className='abajoDeTusNotas abajoDeTusNotas2 mt-4'> Aqui encontraras todos las notificaciones de tu cuenta</div>
                        </div>
                        <div className='col boton col-auto ms-auto'>

                        </div>
                    </div>

                    <div className='row miPerfilContainer informacionCuentaSeccion sinborde'>
                        <div className="row pt-0">
                            {botones.map((boton) => (
                            <div key={boton.id} className="col-auto p-0">
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
                    {/* Seccion notificaciones */}
                    <div className='row miPerfilContainer informacionCuentaSeccion notificacionContainer'>
                        <div className='col-1 align-items-center colFelicitaciones'>
                            <img src="/images/iconoFelicitaciones.png" alt="Icono 1" className="icon me-2 icono_tusNotas" />
                        </div>
                        <div className='col'>
                            <div className='row felicitacionesRow'>
                                Felicitaciones! tu contenido esta logrando muchas impresiones
                            </div>
                
                                <span className="abajoDeTusNotas bolder" >Logros</span>
                                <span className="abajoDeTusNotas"> / Hace 1 hora</span>
               
                            <div className='row abajoDeTusNotas abajoDeTusNotas2 mt-0 pt-1'> Un texto es una composición de signos codificados en un sistema de escritura que forma una unidad de sentido. También es una composición de caracteres imprimibles 
                                con grafema generados por un algoritmo de cifrado que, aunque no tienen sentido para cualquier persona,

                            </div>
                            <div className='row pt-2'>

                                <div className='col-auto p-0'>
                                    <Button onClick = {()=> navigate('/publicarNota') } id="" variant="none" className='botonCerrarSesion botonActualizar'>
                                            {"Actualizar mi plan"}
                                    </Button>
                                </div>
                                <div className='col'>
                                    <Button onClick = {()=> navigate('/publicarNota') } id="" variant="none" className='botonCerrarSesion crearCuentaNueva'>
                                            {"Crear cuenta nueva"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                        {/* segunda notificacion */}
                    <div className='row miPerfilContainer informacionCuentaSeccion notificacionContainer'>
                        <div className='col-1 align-items-center colFelicitaciones'>
                            <img src="/images/exitoIcon.png" alt="Icono 1" className="icon me-2 icono_tusNotas" />
                        </div>
                        <div className='col'>
                            <div className='row felicitacionesRow'>
                                Tu nota se publico con éxito
                            </div>
                
                                <span className="abajoDeTusNotas bolder" >Publicaciones</span>
                                <span className="abajoDeTusNotas"> / Hace 1 hora</span>
               
                            <div className='row abajoDeTusNotas abajoDeTusNotas2 mt-0 pt-1'> Un texto es una composición de signos codificados en un sistema de escritura que forma una unidad de sentido. También es una composición de caracteres imprimibles 
                                con grafema generados por un algoritmo de cifrado que, aunque no tienen sentido para cualquier persona,

                            </div>
                            <div className='row pt-2'>

                                <div className='col-auto p-0'>
                                    <Button onClick = {()=> navigate('/publicarNota') } id="" variant="none" className='botonCerrarSesion botonActualizar'>
                                            {"Ver nota"}
                                    </Button>
                                </div>
                                <div className='col'>
                                    <Button onClick = {()=> navigate('/publicarNota') } id="" variant="none" className='botonCerrarSesion crearCuentaNueva'>
                                            {"Crear cuenta nueva"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                        {/* Tercer notificacion */}
                    <div className='row miPerfilContainer informacionCuentaSeccion notificacionContainer'>
                        <div className='col-1 align-items-center colFelicitaciones'>
                            <img src="/images/problemaIcon.png" alt="Icono 1" className="icon me-2 icono_tusNotas" />
                        </div>
                        <div className='col'>
                            <div className='row felicitacionesRow'>
                                Hubo un problema con tu nota
                            </div>
                
                                <span className="abajoDeTusNotas bolder" >Publicaciones</span>
                                <span className="abajoDeTusNotas"> / Hace 1 hora</span>
               
                            <div className='row abajoDeTusNotas abajoDeTusNotas2 mt-0 pt-1'> Un texto es una composición de signos codificados en un sistema de escritura que forma una unidad de sentido. También es una composición de caracteres imprimibles 
                                con grafema generados por un algoritmo de cifrado que, aunque no tienen sentido para cualquier persona,

                            </div>
                            <div className='row pt-2'>

                                <div className='col-auto p-0'>
                                    <Button onClick = {()=> navigate('/publicarNota') } id="" variant="none" className='botonCerrarSesion botonActualizar'>
                                            {"Ver nota"}
                                    </Button>
                                </div>
                                <div className='col'>
                                    <Button onClick = {()=> navigate('/publicarNota') } id="" variant="none" className='botonCerrarSesion crearCuentaNueva'>
                                            {"Crear cuenta nueva"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                            {/* 4ta noticiacion */}
                    <div className='row miPerfilContainer informacionCuentaSeccion notificacionContainer'>
                        <div className='col-1 align-items-center colFelicitaciones'>
                            <img src="/images/mejorarIcon.png" alt="Icono 1" className="icon me-2 icono_tusNotas" />
                        </div>
                        <div className='col'>
                            <div className='row felicitacionesRow'>
                                ¿Como mejorar tus notas? mira los nuevos contenidos
                            </div>
                
                                <span className="abajoDeTusNotas bolder" >Publicaciones</span>
                                <span className="abajoDeTusNotas"> / Hace 1 hora</span>
               
                            <div className='row abajoDeTusNotas abajoDeTusNotas2 mt-0 pt-1'> Un texto es una composición de signos codificados en un sistema de escritura que forma una unidad de sentido. También es una composición de caracteres imprimibles 
                                con grafema generados por un algoritmo de cifrado que, aunque no tienen sentido para cualquier persona,

                            </div>
                            <div className='row pt-2'>

                                <div className='col-auto p-0'>
                                    <Button onClick = {()=> navigate('/publicarNota') } id="" variant="none" className='botonCerrarSesion botonActualizar'>
                                            {"Ver contenido"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

    );
};

export default Notificaciones;