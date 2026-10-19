import React, { useEffect, useRef } from 'react';
import './VideoBienvenida.css';

const VideoBienvenida = ({ src, duracionMs = 3000, onFinish }) => {
    const videoRef = useRef(null);
    const onFinishRef = useRef(onFinish);
    onFinishRef.current = onFinish;

    // Se arma una sola vez al montar, para que un re-render del padre
    // (ej. mientras se escribe en otro input) no reinicie el video/temporizador.
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.currentTime = 0;
            video.play().catch(() => {}); // si el navegador bloquea el audio, seguimos igual
        }

        const timer = setTimeout(() => {
            onFinishRef.current();
        }, duracionMs);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="overlayVideoBienvenida">
            <video
                ref={videoRef}
                src={src}
                autoPlay
                playsInline
                className="videoBienvenida"
            />
        </div>
    );
};

export default VideoBienvenida;
