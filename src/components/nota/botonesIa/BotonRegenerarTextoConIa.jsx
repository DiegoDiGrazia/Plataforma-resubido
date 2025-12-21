import React from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { obtenerTextoRegeneradoConIa } from '../../administrador/gestores/apisUsuarios';
import { useState } from 'react';

const BotonRegenerarDataConIa = ({
    token,
    term_id,
    nombreBoton,
    action,
    endpoint
}) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
        const nuevoTexto = await obtenerTextoRegeneradoConIa(token, term_id, endpoint);
        dispatch(action(nuevoTexto));
    } catch (error) {
        console.error('Error regenerando datos:', error);
    } finally {
        setLoading(false);
    }
};
    return (
    <Button
        onClick={handleClick}
        disabled={loading}
        variant="warning"
    >
        {loading ? 'Regenerando...' : nombreBoton}
    </Button>
        );
};

export default BotonRegenerarDataConIa;
