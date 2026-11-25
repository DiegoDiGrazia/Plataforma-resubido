import React, { useRef } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Perfil.css';

const FRECUENCIAS_REPORTE = ["Una vez por día", "Todas las semanas", "Una vez por mes"];

/** Fila de ajuste: nombre + descripción a la izquierda, control a la derecha. */
const FilaPerfil = ({ titulo, descripcion, htmlFor, icono, children }) => (
    <div className="perfil__fila">
        <div className="perfil__info">
            {icono}
            <div>
                {htmlFor
                    ? <label className="perfil__titulo" htmlFor={htmlFor}>{titulo}</label>
                    : <h2 className="perfil__titulo">{titulo}</h2>}
                {descripcion && <p className="perfil__descripcion">{descripcion}</p>}
            </div>
        </div>
        <div className="perfil__control">{children}</div>
    </div>
);

const Perfil = () => {
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const UsuarioActual = useSelector((state) => state.formulario.usuario);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log("Archivo seleccionado:", file.name);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
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
        <div id="pantalla-perfil" className="content flex-grow-1 crearNotaGlobal">
            <div className="perfil__encabezado nd-mx-page">
                <h3 id="saludo" className="headerTusNotas ml-0">
                    <i className="bi bi-person-fill" aria-hidden="true" /> Mi Perfil
                </h3>
                <div className="perfil__acciones">
                    <Button onClick={() => navigate('/publicarNota')} variant="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={() => navigate('/publicarNota')} variant="primary">
                        Guardar
                    </Button>
                </div>
            </div>

            <section className="perfil__tarjeta nd-mx-page" aria-label="Datos de la cuenta">
                <FilaPerfil titulo="Nombre de la cuenta" htmlFor="perfil-nombre">
                    <input id="perfil-nombre" type="text" className="form-control" placeholder={UsuarioActual.nombre} />
                </FilaPerfil>

                <FilaPerfil titulo="Email de la cuenta" htmlFor="perfil-email">
                    <input id="perfil-email" type="email" className="form-control" placeholder={UsuarioActual.email} />
                </FilaPerfil>

                <FilaPerfil titulo="WhatsApp de la cuenta" htmlFor="perfil-whatsapp">
                    <input id="perfil-whatsapp" type="tel" className="form-control" placeholder={UsuarioActual.celular_reporte} />
                </FilaPerfil>

                <FilaPerfil
                    titulo="Foto de perfil"
                    descripcion="Esta foto se muestra en el perfil de tu cuenta"
                    icono={<img src="/images/municipio_icon.png" alt="" className="perfil__avatar" />}
                >
                    <div className="upload-block perfil__carga" onDragOver={handleDragOver} onDrop={handleDrop}>
                        <input
                            type="file"
                            id="fileInput"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileChange}
                            className="d-none"
                        />
                        <img src="/images/uploadImagen.png" alt="" className="icon icono_tusNotas" />
                        <div className="perfil__carga-texto">
                            <label htmlFor="fileInput" className="custom-file-upload">Subí tu imagen</label>
                            <span className="fontGrisImagen">o arrastrala aquí</span>
                        </div>
                        <div className="fontGrisImagen">SVG, PNG o JPG</div>
                    </div>
                </FilaPerfil>

                <FilaPerfil
                    titulo="Reportes automáticos"
                    descripcion="Seleccioná con qué frecuencia querés recibir los reportes automáticos de la cuenta"
                >
                    <div className="dropdown">
                        <button className="btn custom-dropdown-button dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="bi bi-calendar3" aria-hidden="true" /> Todas las semanas
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                            {FRECUENCIAS_REPORTE.map((frecuencia) => (
                                <li key={frecuencia}>
                                    <button className="dropdown-item" onClick={() => handleClickFiltro(frecuencia)}>{frecuencia}</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </FilaPerfil>

                <FilaPerfil
                    titulo="Cerrar sesión"
                    descripcion="¿Querés salir de la cuenta? Hacé clic en cerrar sesión"
                >
                    <Button onClick={() => navigate('/')} variant="outline-secondary">
                        <i className="bi bi-box-arrow-right" aria-hidden="true" /> Cerrar sesión
                    </Button>
                </FilaPerfil>
            </section>
        </div>
    );
};

export default Perfil;
