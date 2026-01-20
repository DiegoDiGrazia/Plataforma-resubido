import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Button } from 'react-bootstrap';
import Sidebar from '../sidebar/Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import "./miPerfil.css";
import { useSelector } from 'react-redux';

const Perfil = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [idCliente, setIdCliente] = useState('');
    const [conReporteWSP, setConReporteWSP] = useState('0');
    const [conReporteEmail, setConReporteEmail] = useState('0');
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const UsuarioActual =  useSelector((state) => state.formulario.usuario);



    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log("Archivo seleccionado:", file.name);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        console.log("Archivo arrastrado sobre el área");
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            console.log("Archivo soltado:", file.name);
        }
    };

    const handleClickFiltro = (frecuencia) => {
        console.log("Frecuencia seleccionada:", frecuencia);
    };

    return (
<>
                <div className="content flex-grow-1 crearNotaGlobal">
                    <div className='row miPerfilContainer'>
                        <div className='col p-0'>
                            <h3 id="saludo" className='headerTusNotas ml-0'>
                                <img src="/images/miPerfilIcon.png" alt="Icono 1" className="icon me-2 icono_tusNotas" /> Mi Perfil
                            </h3>
                            <h4 className='infoCuenta'>Información de la cuenta</h4>
                            <div className='abajoDeTusNotas'> Aquí encontrarás todos los detalles de tu cuenta</div>
                        </div>
                        <div className='col boton col-auto ms-auto'>
                            <Button onClick={() => navigate('/publicarNota')} variant="none" className='botonCerrarSesion'>
                                {"Cancelar"}
                            </Button>
                            <Button onClick={() => navigate('/publicarNota')} variant="none" className='botonCerrarSesion guardar'>
                                {"Guardar"}
                            </Button>
                        </div>
                    </div>
                    <div className='row miPerfilContainer informacionCuentaSeccion'>
                        <div className='col align-items-center'>
                            <h4 className='infoCuenta'>Nombre de la cuenta</h4>
                        </div>
                        <div className='col textAreaContainer'>
                            <textarea placeholder={UsuarioActual.nombre} className='textAreaComentarios col-auto ms-auto'></textarea>
                        </div>
                    </div>
                    <div className='row miPerfilContainer informacionCuentaSeccion'>
                        <div className='col align-items-center'>
                            <h4 className='infoCuenta'>Email de la cuenta</h4>
                        </div>
                        <div className='col textAreaContainer'>
                            <textarea placeholder={UsuarioActual.email} className='textAreaComentarios col-auto ms-auto'></textarea>
                        </div>
                    </div>
                    <div className='row miPerfilContainer informacionCuentaSeccion'>
                        <div className='col align-items-center'>
                            <h4 className='infoCuenta'>WhatsApp de la cuenta</h4>
                        </div>
                        <div className='col textAreaContainer'>
                            <textarea placeholder={UsuarioActual.celular_reporte} className='textAreaComentarios col-auto ms-auto'></textarea>
                        </div>
                    </div>
                    <div className='row miPerfilContainer informacionCuentaSeccion'>
                        <div className='col d-flex align-items-center'>
                            <span>
                                <img src="/images/municipio_icon.png" alt="Icono 1" className="me-2" />
                            </span>
                            <div>
                                <h4 className='infoCuenta mt-1'>Foto de perfil</h4>
                                <div className='abajoDeTusNotas'>Esta foto se muestra en el perfil de tu cuenta</div>
                            </div>
                        </div>
                        <div className="upload-block"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="fileInput"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <img src="/images/uploadImagen.png" alt="Icono 1" className="icon me-2 icono_tusNotas" />

                            <div className='displayFlex pt-1'>
                                <label htmlFor="fileInput" className="custom-file-upload">
                                    {"Subí tu imagen "}
                                </label>
                                <div className='fontGrisImagen'>{" o arrástrala aquí"}</div>
                            </div>
                            <div className='fontGrisImagen'>
                                SVG, PNG o JPG
                            </div>
                        </div>
                    </div>
                    <div className='row miPerfilContainer informacionCuentaSeccion'>
                        <div className='col align-items-center'>
                            <div>
                                <h4 className='infoCuenta mt-1'>Reportes Automáticos</h4>
                                <div className='abajoDeTusNotas'>Selecciona con qué frecuencia quieres recibir los reportes automáticos de la cuenta</div>
                            </div>
                        </div>
                        <div className='col textAreaContainer col-auto ms-auto'>
                            <div className="dropdown">
                                <button className="btn custom-dropdown-button dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                    <img src="/images/calendarIcon.png" alt="Icono 1" className="icon me-2" /> {"Todas las semanas"}
                                </button>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                    <li key="opcion1a">
                                        <button className="dropdown-item" onClick={() => handleClickFiltro("Una vez por día")}>Una vez por día</button>
                                    </li>
                                    <li key="opcion2b">
                                        <button className="dropdown-item" onClick={() => handleClickFiltro("Todas las semanas")}>Todas las semanas</button>
                                    </li>
                                    <li key="opcion3c">
                                        <button className="dropdown-item" onClick={() => handleClickFiltro("Una vez por mes")}>Una vez por mes</button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className='row miPerfilContainer informacionCuentaSeccion mb-5'>
                        <div className='col align-items-center'>
                            <div>
                                <h4 className='infoCuenta mt-1'>Cerrar sesión</h4>
                                <div className='abajoDeTusNotas'>¿Quieres salir de la cuenta? Haz clic en cerrar sesión</div>
                            </div>
                        </div>
                        <div className='col textAreaContainer col-auto ms-auto'>
                            <Button onClick={() => navigate('/')} variant="none" className='botonCerrarSesion'>
                                {"Cerrar Sesión"}
                            </Button>
                        </div>
                    </div>
                </div>
</>
    );
};

export default Perfil;
