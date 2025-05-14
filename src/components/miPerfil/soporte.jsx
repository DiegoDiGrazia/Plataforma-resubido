import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Sidebar from '../sidebar/Sidebar';
import "./miPerfil.css";
import CardTutorial from './CardTutorial'; // Importa el nuevo componente

// Diccionario de videos
export const videos = {
    "tituloYBajada": {
        title: "¿Cómo cargar el título y la bajada de la nota?",
        description: "Mira el tutorial y los tips clave para elegir el título y bajada de la nota.",
        src: "/videosTutoriales/tituloYBajada.mp4",
    },
    "cuerpoNota": {
        title: "¿Cómo hacer el texto general de la nota?",
        description: "Mira el tutorial para crear el cuerpo de la nota.",
        src: "/videosTutoriales/cuerpoNota.mp4",
    },
    "fotoCuerpoNota": {
        title: "¿Cómo cargar las imágenes del cuerpo de la nota?",
        description: "Mira el tutorial para ver como agregar una imagen al cuerpo de la nota.",
        src: "/videosTutoriales/fotoCuerpoNota.mp4",
    },
    "publicarNota": {
        title: "¿Cómo publicar la nota?",
        description: "Mira el tutorial para ver como publicar una nota correctamente.",
        src: "/videosTutoriales/publicarNota.mp4",
    },
    "embebidos": {
        title: "Como insertar un posteo de Redes Sociales",
        description: "Mira el tutorial para como insertar un posteo de redes sociales.",
        src: "/videosTutoriales/embebidos.mp4",
    },
    "portada": {
        title: "¿Cómo cargar la imagen de portada?",
        description: "Mira el tutorial para como insertar un posteo de redes sociales.",
        src: "/videosTutoriales/portadaImagen.mp4",
    },
};

const Soporte = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Filtrar videos por título
    const filteredVideos = Object.values(videos).filter(video =>
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
                                <CardTutorial
                                    title={video.title}
                                    description={video.description}
                                    src={video.src}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Soporte;