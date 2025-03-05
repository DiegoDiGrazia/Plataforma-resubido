import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "cropperjs/dist/cropper.css";
import { useDispatch, useSelector } from "react-redux";
import { setAutor } from "../../../redux/crearNotaSlice";

const SelectorAutor = () => {
    const dispatch = useDispatch();
    
    const CLIENTE = useSelector((state) => state.formulario.cliente);
    const actualUser = useSelector((state) => state.formulario.usuario.nombre);
    const tipoAutor = useSelector((state) => state.crearNota.autor); 

    const tiposDeContenido = [CLIENTE, actualUser, "NoticiasD", "Anónimo"];

    const editarTipoContenido = (contenido) => {
        dispatch(setAutor(contenido));
    };

    return (
        <div className="dropdown" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", padding: "0px" }}>
            <h4 style={{ fontSize: "20px", fontWeight: "bold" }}>Autor</h4>
            <button
                className="btn custom-dropdown-button dropdown-toggle boton_cliente mb-2 ml-5"
                type="button"
                id="dropdownMenuButton1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                {tipoAutor || "Seleccionar Autor"} {/* 🛠️ Si es `null`, mostrar mensaje */}
            </button>
            <ul className="dropdown-menu listaClientes" aria-labelledby="dropdownMenuButton1">
                {tiposDeContenido.map((contenido, index) => (
                    <li key={index}>
                        <button className="dropdown-item" onClick={() => editarTipoContenido(contenido)}>
                            {contenido}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SelectorAutor;