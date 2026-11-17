import { useEffect, useState } from 'react';

export const useCuentaRegresiva = () => {
    const [segundos, setSegundos] = useState(0);

    useEffect(() => {
        if (segundos <= 0) return;
        const timer = setTimeout(() => setSegundos((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [segundos]);

    return [segundos, setSegundos];
};

export const formatearCuentaRegresiva = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const resto = String(segundos % 60).padStart(2, '0');
    return `${minutos}:${resto}`;
};
