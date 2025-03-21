import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import './Sidebar.css'; // Si tienes un archivo CSS específico para el sidebar
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = ({estadoActual}) => {
    const [isOpen, setIsOpen] = useState(true);
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };
    const navigate = useNavigate();

    const handleClickBotonSidebar = (url) => {
        console.log(`/${url}`)
        console.log("aca me redirigi")
        navigate(`/${url}`); // Usa template literals para insertar la URL
    };
    const esEditor = useSelector((state) => state.formulario.es_editor)
    const cliente = useSelector((state) => state.formulario.cliente)
    console.log(esEditor)

    

    return (
        <>

                <div className={`sidebar no-print ${isOpen ? 'open' : 'closed'}`}>
                    <div className=" flex-grow-1">
                        {isOpen ? <img src="/images/noticiasdlogo.png" alt="Imagen de ejemplo" className="img-fluid" id="logo-nd-sidebar" />:
                        <img src="/images/logo_nd_miniatura.png" alt="Imagen de ejemplo" className="img-fluid" id="logo-nd-miniatura" />
                        }


                    <Button className="sidebar-toggle" variant='none' onClick={toggleSidebar}>
                        {isOpen ? <img src="/images/sidebar_left_bot.png" alt="Imagen de ejemplo" className="img-fluid" /> : 
                        <img src="/images/sidebar_right_bot.png" alt="Imagen de ejemplo" className="img-fluid" />} 
                    </Button>

                        <ul className="list-group list-group-flush no-border list-unstyled">

                        {cliente &&
                        <li className={`${
                                            estadoActual === "dashboard" ? "boton_sidebar_clickeado" : "boton_sidebar_Noclickeado"
                                        } ${
                                            isOpen ? "openBoton" : "closedBoton"
                                        }`}>

                                <Button className="botonSidebar" variant='none' onClick={() => handleClickBotonSidebar("dashboard")}>
                                    <img src="/images/barchar_icon.png" alt="Icono 1" className="iconoSidebar me-2" />
                                    <span className={`descripcion_boton ${isOpen ? 'open' : 'closed'}`}>Dashboard</span>
                                </Button>
                            </li>
                        }

                            {esEditor == false ? 
                            <li className={`${
                                            estadoActual === "notas" ? "boton_sidebar_clickeado" : "boton_sidebar_Noclickeado"
                                        } ${
                                            isOpen ? "openBoton" : "closedBoton"
                                        }`}>
                                <Button className="botonSidebar" variant='none' onClick={() => handleClickBotonSidebar("notas")}>
                                    <img src="/images/notas_icon.png" alt="Icono 1" className="icon me-2" /> 
                                    <span className={`descripcion_boton ${isOpen ? 'open' : 'closed'}`}>Notas</span>
                                </Button>
                            </li>
                            :
                            <li className={`${
                                            estadoActual === "notasEditorial" ? "boton_sidebar_clickeado" : "boton_sidebar_Noclickeado"
                                        } ${
                                            isOpen ? "openBoton" : "closedBoton"
                                        }`}>
                                <Button className="botonSidebar" variant='none' onClick={() => handleClickBotonSidebar("notasEditorial")}>
                                    <img src="/images/notas_icon.png" alt="Icono 1" className="icon me-2" /> 
                                    <span className={`descripcion_boton ${isOpen ? 'open' : 'closed'}`}>Notas</span>
                                </Button>
                            </li>
                            }
{/* 
                            <li className={`${
                                            estadoActual === "reportes" ? "boton_sidebar_clickeado" : "boton_sidebar_Noclickeado"
                                        } ${
                                            isOpen ? "openBoton" : "closedBoton"
                                        }`}>
                                <Button className="botonSidebar" variant='none' onClick={() => handleClickBotonSidebar("reportes")}>
                                    <img src="/images/reportes_icon.png" alt="Icono 1" className="icon me-2" /> 
                                    <span className={`descripcion_boton ${isOpen ? 'open' : 'closed'}`}>Reportes</span>
                                </Button>
                            </li> */}
                            {/* <li className={`${
                                            estadoActual === "encuestas" ? "boton_sidebar_clickeado" : "boton_sidebar_Noclickeado"
                                        } ${
                                            isOpen ? "openBoton" : "closedBoton"
                                        }`}>
                                <Button className="botonSidebar" variant='none' onClick={() => handleClickBotonSidebar("encuestas")}>
                                    <img src="/images/encuestas_icon.png" alt="Icono 1" className="icon me-2" /> 
                                    <span className={`descripcion_boton ${isOpen ? 'open' : 'closed'}`}>Encuestas</span>
                                </Button>
                            </li> */}

                            <li className={`${
                                            estadoActual === "autoEntrevistas" ? "boton_sidebar_clickeado" : "boton_sidebar_Noclickeado"
                                        } ${
                                            isOpen ? "openBoton" : "closedBoton"
                                        }`}>
                                <Button className="botonSidebar" variant='none' onClick={() => handleClickBotonSidebar("autoEntrevistas")}>
                                    <img src="/images/auto_entrevistas_icon.png" alt="Icono 1" className="icon me-2" /> 
                                    <span className={`descripcion_boton ${isOpen ? 'open' : 'closed'}`}>Auto-entrevistas</span>
                                </Button>
                            </li>
                            <li className={`${
                                            estadoActual === "notificaciones" ? "boton_sidebar_clickeado" : "boton_sidebar_Noclickeado"
                                        } ${
                                            isOpen ? "openBoton" : "closedBoton"
                                        }`}>
                                <Button className="botonSidebar" variant='none' onClick={() => handleClickBotonSidebar("notificaciones")}>
                                    <img src="/images/notificacion_icon.png" alt="Icono 1" className="icon me-2" /> 
                                    <span className={`descripcion_boton ${isOpen ? 'open' : 'closed'}`}>Notificaciones</span>
                                </Button>
                            </li>

                            <ul className="list-group list-unstyled botones_inferiories" id= "">
                            <li className={`${
                                            estadoActual === "soporte-y-ayuda" ? "boton_sidebar_clickeado" : "boton_sidebar_Noclickeado"
                                        } ${
                                            isOpen ? "openBoton" : "closedBoton"
                                        }`}>
                                    <Button className="botonSidebar" variant='none' onClick={() => handleClickBotonSidebar("soporte-y-ayuda")}>
                                        <img src="/images/ayuda_icon.png" alt="Icono 1" className="icon me-2" /> 
                                        <span className={`descripcion_boton ${isOpen ? 'open' : 'closed'}`}>Ayuda y soporte</span>
                                    </Button>
                                </li>
                                <li className={`${
                                            estadoActual === "mi-perfil" ? "boton_sidebar_clickeado" : "boton_sidebar_Noclickeado"
                                        } ${
                                            isOpen ? "openBoton" : "closedBoton"
                                        } mb-4`}>
                                    <Button className="botonSidebar mb-4" variant='none' onClick={() => handleClickBotonSidebar("mi-perfil")} style={{
                                                position: "relative",
                                                right: "8px", /* Ajusta este valor según necesites */
                                            }}>
                                        <img src="/images/miPerfilIconMini.png" alt="Icono 12" className="icon me-2" />
                                        <span
                                            style={{
                                                position: "relative",
                                                top: "5px", /* Ajusta este valor según necesites */
                                            }}
                                            className={`descripcion_boton ${isOpen ? "open" : "closed"} text-center`}
                                        >
                                            Mi perfil
                                        </span>

                                    </Button>
                                </li>
                            </ul>
                        </ul>
                    </div>
                </div>
        </>
    );
};

export default Sidebar;