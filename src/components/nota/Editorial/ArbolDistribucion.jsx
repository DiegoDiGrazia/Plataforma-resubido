import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import SelectorConBuscador from './SelectorConBuscador';

const ArbolDistribucion = ({
  TOKEN,
  jurisdiccion = null,
  esGestion = false,
  pais,
  provincia,
  municipio,
  onSetPais,
  onSetProvincia,
  onSetMunicipio

}) => {
  const [provincias, setProvincias] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [Paises] = useState([
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
    { nombre: "Miami" },
    { nombre: "España" }
  ]);

  // Obtener provincias
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
        if (!municipio || !municipio.municipio_id) {
          onSetMunicipio(response.data.item[0] || {});
        }
      } else {
        console.error('Error en la respuesta de la API:', response.data.message);
      }
    })
    .catch((error) => console.error('Error al obtener municipios:', error));
  }, [TOKEN, provincia, onSetMunicipio, municipio]);

  return (
    <div className="dropdown p-0">
      {(esGestion && jurisdiccion == 'PAIS') && 
      <SelectorConBuscador
        title="Pais"
        options={Paises}
        selectedOption={pais}
        onSelect={onSetPais}
        onClear={() => onSetPais(null)}
      />
      }
    {(esGestion && jurisdiccion == 'PROVINCIA') && 
      <SelectorConBuscador
        title="Provincia"
        options={provincias}
        selectedOption={provincia}
        onSelect={onSetProvincia}
        onClear={() => {
          onSetProvincia(null);
          setMunicipios([]);
          onSetMunicipio(null);
        }}
      />
    }
    {(esGestion && jurisdiccion == 'MUNICIPIO') && 
        <SelectorConBuscador
        title="Municipio"
        options={municipios}
        selectedOption={municipio}
        onSelect={onSetMunicipio}
        onClear={() => onSetMunicipio(null)}
        />
    }

    {!jurisdiccion && (
    <>
        <SelectorConBuscador
        title="Pais"
        options={Paises}
        selectedOption={pais}
        onSelect={onSetPais}
        onClear={() => onSetPais(null)}
        />

        <SelectorConBuscador
        title="Provincia"
        options={provincias}
        selectedOption={provincia}
        onSelect={onSetProvincia}
        onClear={() => {
            onSetProvincia(null);
            setMunicipios([]);
            onSetMunicipio(null);
        }}
        />

        <SelectorConBuscador
        title="Municipio"
        options={municipios}
        selectedOption={municipio}
        onSelect={onSetMunicipio}
        onClear={() => onSetMunicipio(null)}
        />
    </>
    )}
     
     </div>
    
  );
};

export default ArbolDistribucion;
