import React, { useEffect, useState } from 'react';
import SelectorConBuscador from '@/shared/components/form/SelectorConBuscador';
import { useSelector } from 'react-redux';
import { obtenerMunicipios } from '@/api/geosApi';

const ArbolDistribucion = ({
  TOKEN,
  jurisdiccion = null,
  esGestion = false,
  pais,
  provincia,
  municipio,
  onSetPais,
  onSetProvincia,
  onSetMunicipio,
  // enFila: selectores uno al lado del otro (filtros de un listado)
  enFila = false,
  // ocultarPais: el país viene fijo (usuario limitado a un país); solo se eligen provincia y municipio
  ocultarPais = false,
}) => {
  const [provincias, setProvincias] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const geo = useSelector((state) => state.formulario.geo);
  const Paises = geo?.map((pais) => ({ nombre: pais.nombre, pais_id: pais.pais_id })) || [];



  // Obtener provincias
  useEffect(() => {
    if (!Paises || !pais) return;
    const ProvinciasDelPais = geo
      .find((p) => String(p.pais_id) === String(pais?.pais_id || 1)) /// default pais argentina
      ?.provincias?.map((prov) => ({ nombre: prov.nombre, provincia_id: prov.provincia_id })) || [];
    setProvincias(ProvinciasDelPais);

  }, [TOKEN, pais]);

  // Obtener municipios cuando cambia la provincia
  useEffect(() => {
    if (!provincia?.provincia_id) return;

    obtenerMunicipios(provincia.provincia_id).then((response) => {
      setMunicipios(Array.isArray(response) ? response : []);
    })
    .catch((error) => console.error('Error al obtener municipios:', error));
  }, [TOKEN, provincia]);

  return (
    <div className={enFila ? 'd-flex flex-wrap align-items-center gap-3 p-0' : 'dropdown p-0'}>
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
        {!ocultarPais && (
        <SelectorConBuscador
        title="Pais"
        options={Paises}
        selectedOption={pais}
        onSelect={onSetPais}
        onClear={() => onSetPais(null)}
        sinMargen={enFila}
        />
        )}
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
        sinMargen={enFila}
        />

        <SelectorConBuscador
        title="Municipio"
        options={municipios}
        selectedOption={municipio}
        onSelect={onSetMunicipio}
        onClear={() => onSetMunicipio(null)}
        sinMargen={enFila}
        />
    </>
    )}
    </div>
    
  );
};

export default ArbolDistribucion;
