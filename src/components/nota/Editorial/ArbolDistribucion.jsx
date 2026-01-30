import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import SelectorConBuscador from './SelectorConBuscador';
import { useSelector } from 'react-redux';

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
  const geo = useSelector((state) => state.formulario.geo);
  const Paises = geo?.map((pais) => ({ nombre: pais.nombre, pais_id: pais.pais_id })) || [];



  // Obtener provincias
  useEffect(() => {
    if (!Paises || !pais) return;
    const ProvinciasDelPais = geo
      .find((p) => p.pais_id === (pais?.pais_id || '1')) /// default pais argentina
      ?.provincias.map((prov) => ({ nombre: prov.nombre, provincia_id: prov.provincia_id })) || [];
    setProvincias(ProvinciasDelPais);

  }, [TOKEN, pais]);

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
        // if (!municipio || !municipio.municipio_id) {
        //   onSetMunicipio(response.data.item[0] || {});
        // }
      } else {
        console.error('Error en la respuesta de la API:', response.data.message);
      }
    })
    .catch((error) => console.error('Error al obtener municipios:', error));
  }, [TOKEN, provincia]);

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
