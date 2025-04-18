import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setProvincia, setMunicipio, setPais } from '../../../redux/crearNotaSlice';

const ArbolDistribucion = () => {
    const dispatch = useDispatch();
    const TOKEN = useSelector((state) => state.formulario.token);
    const todosLosClientes = useSelector((state) => state.dashboard.todosLosClientes) || [];
    const provincia = useSelector((state) => state.crearNota.provincia);
    const municipio = useSelector((state) => state.crearNota.municipio);
    const pais = useSelector((state) => state.crearNota.pais);


    const [provincias, setProvincias] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [Paises, setPaises] = useState([{"nombre": "Argentina"}]);


    // Obtener provincias al montar el componente
    useEffect(() => {
        axios.post(
            "https://panel.serviciosd.com/app_obtener_provincias",
            { token: TOKEN },
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then((response) => {
            if (response.data.status === "true") {
                setProvincias(response.data.item);
            } else {
                console.error('Error en la respuesta de la API:', response.data.message);
            }
        })
        .catch((error) => console.error('Error al obtener provincias:', error));
    }, [TOKEN]);

    // Obtener municipios cuando cambia la provincia
    useEffect(() => {
        if (!provincia?.provincia_id) return;

        axios.post(
            "https://panel.serviciosd.com/app_obtener_municipios",
            { token: TOKEN, provincia_id: provincia.provincia_id },
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then((response) => {
            if (response.data.status === "true") {
                setMunicipios(response.data.item);
                dispatch(setMunicipio(response.data.item[0] || {}));
            } else {
                console.error('Error en la respuesta de la API:', response.data.message);
            }
        })
        .catch((error) => console.error('Error al obtener municipios:', error));
    }, [TOKEN, provincia, dispatch]);

    return (
        <div className="dropdown p-0">
            {/* Pais */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "10px" }}>
                <span style={{ fontSize: "20px", fontWeight: "bold" }}>Pais</span>
                <button 
                    className="btn custom-dropdown-button dropdown-toggle boton_cliente mb-2 ml-5" 
                    type="button" 
                    data-bs-toggle="dropdown"
                >
                    {pais?.nombre || "Seleccionar"}
                </button>
                <ul className="dropdown-menu listaClientes">
                    {/* Opción para no seleccionar ningún municipio */}
                    <li>
                        <button 
                            className="dropdown-item" 
                            onClick={() => dispatch(setPais(null))} // Limpia la selección de municipio
                        >
                            Ninguno
                        </button>
                    </li>
                    {Paises.map((mun,index) => (
                        <li key={index}>
                            <button 
                                className="dropdown-item" 
                                onClick={() => dispatch(setPais(mun))}
                            >
                                {mun.nombre}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            {/* Selector de Provincia */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "10px" }}>
                <span style={{ fontSize: "20px", fontWeight: "bold" }}>Provincia</span>
                <button 
                    className="btn custom-dropdown-button dropdown-toggle boton_cliente mb-2 ml-5" 
                    type="button" 
                    data-bs-toggle="dropdown"
                >
                    {provincia?.nombre || "Seleccionar"}
                </button>
                <ul className="dropdown-menu listaClientes">
                    {/* Opción para no seleccionar ninguna provincia */}
                    <li>
                        <button 
                            className="dropdown-item" 
                            onClick={() => {
                                dispatch(setProvincia(null)); // Limpia la selección de provincia
                                setMunicipios([]); // Limpia los municipios
                                dispatch(setMunicipio(null)); // Limpia la selección de municipio
                            }}
                        >
                            Ninguno
                        </button>
                    </li>
                    {provincias.map((prov) => (
                        <li key={prov.provincia_id}>
                            <button 
                                className="dropdown-item" 
                                onClick={() => dispatch(setProvincia(prov))}
                            >
                                {prov.nombre}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
    
            {/* Selector de Municipio */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "10px" }}>
                <span style={{ fontSize: "20px", fontWeight: "bold" }}>Municipio</span>
                <button 
                    className="btn custom-dropdown-button dropdown-toggle boton_cliente mb-2 ml-5" 
                    type="button" 
                    data-bs-toggle="dropdown"
                >
                    {municipio?.nombre_completo || "Seleccionar"}
                </button>
                <ul className="dropdown-menu listaClientes">
                    {/* Opción para no seleccionar ningún municipio */}
                    <li>
                        <button 
                            className="dropdown-item" 
                            onClick={() => dispatch(setMunicipio(null))} // Limpia la selección de municipio
                        >
                            Ninguno
                        </button>
                    </li>
                    {municipios.map((mun) => (
                        <li key={mun.municipio_id}>
                            <button 
                                className="dropdown-item" 
                                onClick={() => dispatch(setMunicipio(mun))}
                            >
                                {mun.nombre}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
export default ArbolDistribucion;
