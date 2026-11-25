import { useEffect, useState } from 'react';
import { breakpoints } from '@/styles/tokens';

const consulta = `(max-width: ${breakpoints.md}px)`;

const useEsMobile = () => {
    const [esMobile, setEsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia(consulta).matches);

    useEffect(() => {
        const media = window.matchMedia(consulta);
        const actualizar = () => setEsMobile(media.matches);
        actualizar();
        media.addEventListener('change', actualizar);
        return () => media.removeEventListener('change', actualizar);
    }, []);

    return esMobile;
};

export default useEsMobile;
