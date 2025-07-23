import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setProvincia, setMunicipio, setPais } from '../../../redux/crearNotaSlice';
import SelectorConBuscador from './SelectorConBuscador'; // Importa el componente reutilizable

const ArbolDistribucion = () => {
    const dispatch = useDispatch();
    const TOKEN = useSelector((state) => state.formulario.token);
    const provincia = useSelector((state) => state.crearNota.provincia);
    const municipio = useSelector((state) => state.crearNota.municipio);
    const pais = useSelector((state) => state.crearNota.pais);

    const [provincias, setProvincias] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [Paises, setPaises] = useState([
        { nombre: "Argentina" },
        { nombre: "Bolivia" },
        { nombre: "Brasil" },
        { nombre: "Chile" },
        { nombre: "Colombia" },
        { nombre: "Costa Rica" },
        { nombre: "Cuba" },
        { nombre: "Ecuador" },
        { nombre: "El Salvador" },
        { nombre: "Guatemala" },
        { nombre: "Honduras" },
        { nombre: "México" },
        { nombre: "Nicaragua" },
        { nombre: "Panamá" },
        { nombre: "Paraguay" },
        { nombre: "Perú" },
        { nombre: "Puerto Rico" },
        { nombre: "República Dominicana" },
        { nombre: "Uruguay" },
        { nombre: "Venezuela" },
        { nombre: "Miami"},
        { nombre: "España" }
    ]);

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
                      // Si NO hay municipio seleccionado en el estado, seteo el primero
                if (!municipio || !municipio.municipio_id) {
                    dispatch(setMunicipio(response.data.item[0] || {}));
      }
            } else {
                console.error('Error en la respuesta de la API:', response.data.message);
            }
        })
        .catch((error) => console.error('Error al obtener municipios:', error));
    }, [TOKEN, provincia, dispatch]);

    return (
        <div className="dropdown p-0">
            {/* Selector de País */}
            <SelectorConBuscador
                title="Pais"
                options={Paises}
                selectedOption={pais}
                onSelect={(selectedPais) => dispatch(setPais(selectedPais))}
                onClear={() => dispatch(setPais(null))}
            />

            {/* Selector de Provincia */}
            <SelectorConBuscador
                title="Provincia"
                options={provincias}
                selectedOption={provincia}
                onSelect={(selectedProvincia) => dispatch(setProvincia(selectedProvincia))}
                onClear={() => {
                    dispatch(setProvincia(null));
                    setMunicipios([]);
                    dispatch(setMunicipio(null));
                }}
            />

            {/* Selector de Municipio */}
            <SelectorConBuscador
                title="Municipio"
                options={municipios}
                selectedOption={municipio}
                onSelect={(selectedMunicipio) => dispatch(setMunicipio(selectedMunicipio))}
                onClear={() => dispatch(setMunicipio(null))}
            />
        </div>
    );
};

export default ArbolDistribucion;