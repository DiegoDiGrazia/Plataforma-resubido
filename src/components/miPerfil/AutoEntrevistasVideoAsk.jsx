import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Sidebar from '../sidebar/Sidebar';
import "./miPerfil.css";

const videos = [
    { title: "Vecinos", description: "Desde Noticias d queremos conocer más sobre tu historia y saber por qué crees que este anuncio es tan importante para vos y la comunidad ¡Contanos!", src: "https://www.videoask.com/fn8g87lo5" },
    { title: "Emprendedores", description: "Desde Noticias d queremos conocer más sobre tu emprendimiento para compartirlo con nuestros lectores. Te invitamos a contarnos un poco más acerca de la historia del proyecto!", src: "https://www.videoask.com/ftghh78es" },
    { title: "Comercios", description: "Desde Noticias d queremos conocer más sobre los comercios de la ciudad, para compartirlo con nuestros lectores. Contanos un poco más acerca de la historia del negocio!", src: "https://www.videoask.com/f9vb95g62" },
    { title: "Franquicias", description: "Desde Noticias d queremos conocer más sobre las franquicias que existen en la ciudad para compartirlo con nuestros lectores. Contanos un poco más acerca de la historia del espacio y su presente.", src: "https://www.videoask.com/fzm776azt" },
    { title: "Profesionales", description: "Desde Noticias d queremos conocer más sobre tu historia, para compartirla con nuestros lectores. Contanos más acerca de tu recorrido y las anécdotas que te marcaron.", src: "https://www.videoask.com/f7n48qxwz" },
    { title: "Personajes destacados", description: "Desde Noticias d queremos conocer más sobre tu historia para compartirla con nuestros lectores. Contanos un poco más sobre tu vida!", src: "https://www.videoask.com/f7y0hojl1" },
];

const AutoEntrevistasVideoAsk = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const iframeRefs = useRef([]);
    const [copiado, setCopiado] = useState(false);

    const handleInputChange = (e) => setSearchQuery(e.target.value);

    const filteredVideos = videos.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleFullscreen = (index) => {
        const iframe = iframeRefs.current[index];
        if (iframe) {
            if (iframe.requestFullscreen) iframe.requestFullscreen();
            else if (iframe.mozRequestFullScreen) iframe.mozRequestFullScreen();
            else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
            else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
        }
    };

    const compartirEnlace = (src) => {
        const link = src; // reemplazá con tu link
        navigator.clipboard.writeText(link)
            .then(() => {
                setCopiado(true);
                setTimeout(() => setCopiado(false), 2000);
            })
            .catch(err => console.error("Error copiando al portapapeles:", err));
    };

    return (
        <div className="content flex-grow-1 crearNotaGlobal">

            {/* Cartel de enlace copiado */}
            {copiado && (
                <div style={{
                    position: "fixed",
                    top: "20px",
                    right: "20px",
                    padding: "10px 15px",
                    backgroundColor: "green",
                    color: "white",
                    borderRadius: "5px",
                    zIndex: 9999,
                }}>
                    ¡Enlace copiado al portapapeles!
                </div>
            )}

            <div className="row miPerfilContainer soporteContainer">
                <div className="col p-0">
                    <h3 id="saludo" className="headerTusNotas ml-0">
                        <img src="/images/auto_entrevistas_icon.png" alt="Icono 1" className="icon me-2 icono_tusNotas" /> Autoentrevistas
                    </h3>
                    <h4 className="infoCuenta">Entrevistas</h4>
                    <div className="abajoDeTusNotas" style={{ maxWidth: "600px" }}>
                        Responde las preguntas en video de forma sencilla y rápida. Solo sigue las instrucciones en pantalla y graba tus respuestas.  
                        ¡Tómate tu tiempo y muestra lo mejor de ti!
                    </div>
                </div>
            </div>

            <div className="row miPerfilContainer soporteContainer mt-4 p-0 mb-5">
                <div className="col todasLasNotas p-0 pt-2">Todos los contenidos</div>
                <div className="col buscadorNotas">
                    <form className="buscadorNotasForm">
                        <input
                            className="inputBuscadorNotas"
                            type="text"
                            value={searchQuery}
                            onChange={handleInputChange}
                            placeholder="      Buscar por palabra clave"
                        />
                    </form>
                </div>
            </div>

            <div className="row miPerfilContainer soporteContainer mt-4 p-0">
                {filteredVideos.map((video, index) => (
                    <div key={index} className="col-6">
                        <div
                            className="card"
                            style={{ width: "auto", height: "400px", position: "relative", cursor: "pointer" }}
                            onClick={() => handleFullscreen(index)}
                        >
                            <div className="card-body" style={{ height: "auto" }}>
                                <h5 className="card-title">
                                    {video.title}{" "}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Evita fullscreen
                                            compartirEnlace(video.src);
                                        }}
                                    >
                                        <i className="bi bi-share"></i>
                                    </button>
                                </h5>
                                <p className="abajoDeTusNotas">{video.description}</p>
                            </div>

                            <iframe
                                ref={(el) => (iframeRefs.current[index] = el)}
                                width="80%"
                                height="100%"
                                src={video.src}
                                title="Video"
                                frameBorder="0"
                                allowFullScreen
                                className="iframeTutorial"
                            ></iframe>

                            {/* Overlay transparente para capturar clicks dentro del iframe */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "80%",
                                    height: "100%",
                                    zIndex: 10,
                                    background: "transparent",
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AutoEntrevistasVideoAsk;
