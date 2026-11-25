import React, { useState, useRef } from 'react';
import './AutoEntrevistas.css';

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
        <div id="pantalla-autoentrevistas" className="content flex-grow-1 crearNotaGlobal">

            {/* Cartel de enlace copiado */}
            {copiado && (
                <div className="autoentrevistas__aviso" role="status">
                    ¡Enlace copiado al portapapeles!
                </div>
            )}

            <div className="row miPerfilContainer soporteContainer">
                <div className="col p-0">
                    <h3 id="saludo" className="headerTusNotas ml-0">
                        <i className="bi bi-mic-fill" aria-hidden="true" /> Autoentrevistas
                    </h3>
                </div>
            </div>

            <div className="row miPerfilContainer soporteContainer autoentrevistas__barra mt-4 p-0 mb-5">
                <div className="col todasLasNotas p-0 pt-2">Todos los contenidos</div>
                <div className="col buscadorNotas">
                    <form className="buscadorNotasForm">
                        <input
                            className="inputBuscadorNotas"
                            type="text"
                            value={searchQuery}
                            onChange={handleInputChange}
                            placeholder="Buscar por palabra clave"
                        />
                    </form>
                </div>
            </div>

            <div className="miPerfilContainer soporteContainer autoentrevistas__grilla mt-4 p-0">
                {filteredVideos.map((video, index) => (
                    <div key={video.src}>
                        <div
                            className="card autoentrevistas__card"
                            onClick={() => handleFullscreen(index)}
                        >
                            <div className="card-body">
                                <h5 className="card-title">
                                    {video.title}{" "}
                                    <button
                                        type="button"
                                        className="btn btn-link autoentrevistas__compartir"
                                        title="Copiar enlace"
                                        aria-label={`Copiar enlace de ${video.title}`}
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
                            <div className="autoentrevistas__capa" aria-hidden="true"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AutoEntrevistasVideoAsk;
