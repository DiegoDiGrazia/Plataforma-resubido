import React from 'react';
import { Button } from 'react-bootstrap';

const BotonDistribuirNota = ({ onClick }) => (
    <Button onClick={onClick}  variant="primary">
        {"Distribuir "}
        {/* {cliente ? "de " + cliente : "sin cuenta"} */}
    </Button>
);

export default BotonDistribuirNota;