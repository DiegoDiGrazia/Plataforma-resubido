import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Sidebar from '../sidebar/Sidebar';
import "./miPerfil.css";

const videos = [
    {
        title: "Imagen de portada",
        description: "Mira el tutorial y los tips clave para seleccionar y subir la imagen perfecta de portada.",
        src: "https://www.youtube.com/embed/3ekZv0f2sxU?si=nhgAc_Y1rvtZ5TA2",
    },
    {
        title: "Imagen de portada",
        description: "Mira el tutorial y los tips clave para seleccionar y subir la imagen perfecta de portada.",
        src: "https://www.youtube.com/embed/3ekZv0f2sxU?si=nhgAc_Y1rvtZ5TA2",
    },
    {
        title: "Titulos",
        description: "Mira el tutorial y los tips clave para seleccionar y subir la imagen perfecta de portada.",
        src: "https://www.youtube.com/embed/3ekZv0f2sxU?si=nhgAc_Y1rvtZ5TA2",
    },
    {
        title: "Parrafos",
        description: "Mira el tutorial y los tips clave para seleccionar y subir la imagen perfecta de portada.",
        src: "https://www.youtube.com/embed/3ekZv0f2sxU?si=nhgAc_Y1rvtZ5TA2",
    },
    {
        title: "Categorias",
        description: "Mira el tutorial y los tips clave para seleccionar y subir la imagen perfecta de portada.",
        src: "https://www.youtube.com/embed/3ekZv0f2sxU?si=nhgAc_Y1rvtZ5TA2",
    },
];

const Soporte = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredVideos = videos.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) 
    );

    return (
        <div className="container-fluid sinPadding crearNotaGlobal">
            <div className="d-flex h-100">
                <Sidebar estadoActual={"soporte-y-ayuda"} />
                <div className="content flex-grow-1 crearNotaGlobal">
                    <div className='row miPerfilContainer soporteContainer'>
                        <div className='col p-0'>
                            <h3 id="saludo" className='headerTusNotas ml-0'>
                                <img src="/images/miPerfilIcon.png" alt="Icono 1" className="icon me-2 icono_tusNotas" /> Ayuda y soporte
                            </h3>
                            <h4 className='infoCuenta'>Centro de contenidos</h4>
                            <div className='abajoDeTusNotas'>
                                Aquí encontrarás contenidos que te ayudarán a potenciar el uso de nuestra plataforma. <br />
                                Tips, consejos, tutoriales y ayuda para tus contenidos
                            </div>
                        </div>
                    </div>

                    <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-5'>
                        <div className='col todasLasNotas p-0 pt-2'>
                            Todos los contenidos
                        </div>
                        <div className='col buscadorNotas'>
                            <form className='buscadorNotasForm'>
                                <input
                                    className='inputBuscadorNotas'
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                    placeholder="      Buscar por palabra clave"
                                />
                            </form>
                        </div>
                    </div>

                    <div className='row miPerfilContainer soporteContainer mt-4 p-0'>
                        {filteredVideos.map((video, index) => (
                            <div key={index} className='col-4'>
                                <div className="card" style={{ width: "auto", height: "350px" }}>
                                    <div className="card-body">
                                        <h5 className="card-title">{video.title}</h5>
                                        <p className="abajoDeTusNotas">{video.description}</p>
                                    </div>
                                    <iframe
                                        width="auto"
                                        height="250px"
                                        src={video.src}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        className="iframeTutorial"
                                    ></iframe>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Soporte;