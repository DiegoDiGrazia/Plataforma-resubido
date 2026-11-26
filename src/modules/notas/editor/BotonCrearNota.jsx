import React from 'react';
import { Button } from 'react-bootstrap';

const BotonCrearNota = ({ onClick }) => (
    <Button onClick={onClick} id="botonPublicar" variant="primary">
        <i className="bi bi-plus-lg" aria-hidden="true" /> Crear Nota
    </Button>
);

export default BotonCrearNota;
