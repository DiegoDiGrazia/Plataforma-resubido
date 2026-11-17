import React from 'react';

const CardTutorial = ({ title, description, src }) => {
    return (
        <div className="card" style={{ width: "auto", height: "auto !important" }}>
            <div className="card-body">
                <h5 className="card-title">{title}</h5>
                <p className="abajoDeTusNotas">{description}</p>
            </div>
            <video
                width="90%"
                height="100%"
                controls // Muestra los controles del reproductor
                preload="metadata" // Pre-carga solo los metadatos del video
                className="iframeTutorial"
            >
                <source src={src} type="video/mp4" />
                Tu navegador no soporta la reproducción de videos.
            </video>
        </div>
    );
};

export default CardTutorial;