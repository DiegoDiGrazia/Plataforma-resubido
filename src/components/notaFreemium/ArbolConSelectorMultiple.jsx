import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import SelectorConBuscador from '../nota/Editorial/SelectorConBuscador';
import { useSelector } from 'react-redux';
import SelectorConBuscadorMult from './SelectorConBuscadorMult';

const ArbolConSelectorMultiple = ({
  TOKEN,
  jurisdiccion = null,
  esGestion = false,
  pais,
  provinciasSeleccionadas,
  municipiosSeleccionados,
  onSetPais,
  onSetProvincias,
  onSetMunicipios
}) => {

  const [provincias, setProvincias] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  const geo = useSelector((state) => state.formulario.geo);

  const Paises = geo?.map((pais) => ({
    nombre: pais.nombre,
    pais_id: pais.pais_id
  })) || [];

  // Provincias
  useEffect(() => {
    if (!pais) return;

    const ProvinciasDelPais = geo
      .find((p) => p.pais_id === (pais?.pais_id || '1'))
      ?.provincias.map((prov) => ({
        nombre: prov.nombre,
        provincia_id: prov.provincia_id
      })) || [];

    setProvincias(ProvinciasDelPais);

    // limpiar cuando cambia país
    onSetProvincias([]);
    onSetMunicipios([]);
    setMunicipios([]);

  }, [pais]);

  // Municipios (multi provincia)
  useEffect(() => {
    if (!provinciasSeleccionadas?.length) {
      setMunicipios([]);
      return;
    }

    const fetchMunicipios = async () => {
      try {
        const responses = await Promise.all(
          provinciasSeleccionadas.map((prov) =>
            axios.post(
              "https://panel.serviciosd.com/app_obtener_municipios",
              { token: TOKEN, provincia_id: prov.provincia_id },
              { headers: { 'Content-Type': 'multipart/form-data' } }
            )
          )
        );

        const todos = responses.flatMap(res =>
          res.data.status === "true" ? res.data.item : []
        );

        setMunicipios(todos);
        onSetMunicipios([]); // reset selección

      } catch (error) {
        console.error("Error municipios:", error);
      }
    };

    fetchMunicipios();

  }, [provinciasSeleccionadas]);

  return (
    <div className="dropdown p-0">

      {/* PAIS */}
      <SelectorConBuscadorMult
        title="Pais"
        options={Paises}
        selectedOptions={pais ? [pais] : []}
        onSelect={(arr) => onSetPais(arr[0] || null)}
        onClear={() => onSetPais(null)}
      />

      {/* PROVINCIAS */}
      <SelectorConBuscadorMult
        title="Provincias"
        options={provincias}
        selectedOptions={provinciasSeleccionadas}
        onSelect={onSetProvincias}
        onClear={() => {
          onSetProvincias([]);
          onSetMunicipios([]);
          setMunicipios([]);
        }}
      />

      {/* MUNICIPIOS */}
      <SelectorConBuscadorMult
        title="Municipios"
        options={municipios}
        selectedOptions={municipiosSeleccionados}
        onSelect={onSetMunicipios}
        onClear={() => onSetMunicipios([])}
      />

    </div>
  );
};

export default ArbolConSelectorMultiple;