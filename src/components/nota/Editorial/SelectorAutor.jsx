import React, { useEffect, useRef, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import axios from 'axios';
import { useSelector } from 'react-redux';
const SelectorAutor= () => {
    const CLIENTE = useSelector((state) => state.formulario.cliente);

    const [tiposDeContenido] = useState([CLIENTE, "Usuario", "NoticiasD", "Anonimo"])
    const [tipoContenido, setTipoContenido] = useState(CLIENTE)

    const editarTipoContenido =(contenido) =>{
        setTipoContenido(contenido)
    }   

    return (

    <div className="dropdown" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "10px", padding: "0px" }}>
    <h4 style={{ fontSize: "20px", fontWeight: "bold"}}>Autor</h4>
            <button 
                className="btn custom-dropdown-button dropdown-toggle boton_cliente mb-2 ml-5 " 
                type="button" 
                id="dropdownMenuButton1" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
            >
                {tipoContenido}
            </button>
    <ul className="dropdown-menu listaClientes" aria-labelledby="dropdownMenuButton1">

        {/* Renderiza los clientes dinámicamente */}
        {tiposDeContenido.map((contenido) => (
            <li key={contenido}>
                <button 
                    className="dropdown-item" 
                    onClick={() => editarTipoContenido(contenido)}
                >
                    {contenido}
                </button>
            </li>
        ))}

    </ul>
</div>

    );
};

export default SelectorAutor;
