import React from 'react';
import { Button } from 'react-bootstrap';

const BotonCrearNota = ({ onClick, cliente }) => (
    <Button onClick={onClick} id="botonPublicar" variant="none">
        {"Crear nota "}
        {cliente ? "de " + cliente : "sin cuenta"}
    </Button>
);

export default BotonCrearNota;