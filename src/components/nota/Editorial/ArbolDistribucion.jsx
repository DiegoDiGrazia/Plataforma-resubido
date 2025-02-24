import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';
import axios from 'axios';

const ArbolDistribucion= () => {
    const TOKEN = useSelector((state) => state.formulario.token)
    const todosLosClientes = useSelector((state) => state.dashboard.todosLosClientes) || []
    const [provincias, setProvincias] = useState([]);
    const [provincia, setProvincia] = useState({"provincia_id":"54","nombre":"Misiones","iso_nombre":"Misiones","categoria":"Provincia","centroide_lat":"-26.8753965086829","centroide_lon":"-54.6516966230371","iso_id":"AR-N","nombre_completo":"Provincia de Misiones","Poblacion":"0"});
    const [municipios, setMunicipios] = useState([])
    const [municipio, setMunicipio] = useState({
        "municipio_id": "746252",
        "nombre": "Beazley",
        "nombre_completo": "Comisión Municipal Beazley",
        "provincia_id": "74",
        "centroide_lat": "-33.7572721991329",
        "centroide_lon": "-66.6446207562444",
        "categoria": "Comisión Municipal",
        "poblacion": "0"
      })

    
        const dispatch = useDispatch(); // Agrega esto al inicio del componente

        useEffect(() => {
            if (true) { // Verifica si el arreglo está vacío
                axios.post(
                    "https://panel.serviciosd.com/app_obtener_provincias",
                    {
                        token: TOKEN,
                    },
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        }
                    }
                )
                .then((response) => {
                    console.log('Respuesta:', response.status);
        
                    if (response.data.status === "true") {
                        setProvincias(response.data.item)
                    } else {
                        console.error('Error en la respuesta de la API:', response.data.message);
                    }
                })
                .catch((error) => {
                    console.error('Error al hacer la solicitud:', error);
                });
                // SECCION MUNICIPIO
                axios.post(
                    "https://panel.serviciosd.com/app_obtener_municipios",
                    {
                        token: TOKEN,
                        provincia_id: provincia.provincia_id
                    },
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        }
                    }
                )
                .then((response) => {
                    console.log('Respuesta:', response.status);
                    if (response.data.status === "true") {
                        setMunicipios(response.data.item)
                    } else {
                        console.error('Error en la respuesta de la API:', response.data.message);
                    }
                })
                .catch((error) => {
                    console.error('Error al hacer la solicitud:', error);
                });
            }
            console.log(todosLosClientes, "todos los clientes")
        }, [provincia]); // Agrega dependencias relevantes
        useEffect(() => {
                // SECCION MUNICIPIO
                axios.post(
                    "https://panel.serviciosd.com/app_obtener_municipios",
                    {
                        token: TOKEN,
                        provincia_id: provincia.provincia_id
                    },
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        }
                    }
                )
                .then((response) => {
                    console.log('Respuesta:', response.status);
                    if (response.data.status === "true") {
                        setMunicipios(response.data.item)
                        setMunicipio(response.data.item[0])
                    } else {
                        console.error('Error en la respuesta de la API:', response.data.message);
                    }
                })
                .catch((error) => {
                    console.error('Error al hacer la solicitud:', error);
                });
            
            console.log(todosLosClientes, "todos los clientes")
        }, [provincia]); // Agrega dependencias relevantes

        



    return (

        <div className="dropdown p-0">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "10px", padding: "0px" }}>
            <span style={{ fontSize: "20px", fontWeight: "bold"}}>Provincia</span>
                    <button 
                        className="btn custom-dropdown-button dropdown-toggle boton_cliente mb-2 ml-5 " 
                        type="button" 
                        id="dropdownMenuButton1" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                    >
                        {provincia.nombre}
                    </button>
            <ul className="dropdown-menu listaClientes" aria-labelledby="dropdownMenuButton1">

                {/* Renderiza los clientes dinámicamente */}
                {provincias.map((provincia, index) => (
                    <li key={`${provincia.provincia_id}-${index}`}>
                        <button 
                            className="dropdown-item" 
                            onClick={() => setProvincia(provincia)}
                        >
                            {provincia.nombre}
                        </button>
                    </li>
                ))}

            </ul>
            </div>
            {/* SECCION MUNICIPIOS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "10px", padding: "0px" }}>

            <span style={{ fontSize: "20px", fontWeight: "bold"}}>Municipio: </span>
                    <button 
                        className="btn custom-dropdown-button dropdown-toggle boton_cliente mb-2 ml-5 " 
                        type="button" 
                        id="dropdownMenuButton2" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                    >
                        {municipio.nombre_completo}
                    </button>
            <ul className="dropdown-menu listaClientes" aria-labelledby="dropdownMenuButton2">
                
                {/* Renderiza los clientes dinámicamente */}
                {municipios.map((municipio) => (
                    <li key={municipio.provincia_id}>
                        <button 
                            className="dropdown-item" 
                            onClick={() => setMunicipio(municipio)}
                        >
                            {municipio.nombre}
                        </button>
                    </li>
                ))}

            </ul>
        </div>
        </div>

    );
};

export default ArbolDistribucion;
