import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { setTipoContenido } from "../../../redux/crearNotaSlice";
import { useDispatch, useSelector } from "react-redux";

const SelectorTipoContenido = () => {
  const [tiposDeContenido] = React.useState([
    "Gestión",
    "Comunidad",
    "GestiónND",
    "Otros",
    "Otros-Demostración",
  ]);
  const tipoContenido = useSelector((state) => state.crearNota.tipoContenido); // Verifica si este es el nombre correcto
  const dispatch = useDispatch(); // CORREGIDO el error tipográfico

  const editarTipoContenido = (contenido) => {
    dispatch(setTipoContenido(contenido)); // CORREGIDO el error tipográfico
  };

  return (
    <div
      className="dropdown"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
        padding: "0px",
      }}
    >
      <h4 style={{ fontSize: "20px", fontWeight: "bold" }}>Tipo contenido</h4>
      <button
        className="btn custom-dropdown-button dropdown-toggle boton_cliente mb-2 ml-5"
        type="button"
        id="dropdownMenuButton1"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {tipoContenido || "Seleccionar"} {/* Evita mostrar 'undefined' */}
      </button>
      <ul className="dropdown-menu listaClientes" aria-labelledby="dropdownMenuButton1">
        {tiposDeContenido.map((contenido) => (
          <li key={contenido}>
            <button className="dropdown-item" onClick={() => editarTipoContenido(contenido)}>
              {contenido}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectorTipoContenido;
