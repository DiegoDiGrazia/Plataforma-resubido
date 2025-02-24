import React, { useEffect, useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import { useSelector, useDispatch } from 'react-redux';
import { setContenidoPorIndice } from '../../../redux/crearNotaSlice';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import BotoneraContenido from './botoneraContenido';

const Ubicacion = ({ indice }) => {
  const [ubicacion, setUbicacion] = useState(null); // Guarda la ubicación obtenida
  const [staticMapUrl, setStaticMapUrl] = useState(null); // URL del mapa estático
  const direccion = useSelector((state) => state.crearNota.contenidoNota[indice][1]);
  const dispatch = useDispatch();

  // API Key de Google Maps
  const API_KEY = 'AIzaSyB3dtz_yd3civN9URebH_ffPQU_aFOZA9Y';

  // Buscar ubicación
  const handleSearch = useCallback(async () => {
    if (direccion && window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: direccion }, async (results, status) => {
        if (status === 'OK') {
          const { lat, lng } = results[0].geometry.location;
          setUbicacion({ lat: lat(), lng: lng() });
  
          // Genera URL del mapa estático con marcador rojo
          const url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat()},${lng()}&zoom=15&size=600x400&markers=color:red%7C${lat()},${lng()}&key=${API_KEY}`;
          setStaticMapUrl(url);
  
          try {
            // Descargar la imagen y convertirla a Base64
            const response = await fetch(url);
            const blob = await response.blob();
  
            // Convertir blob a Base64
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Image = reader.result; // Imagen en Base64
  
              // Guarda en Redux
              dispatch(setContenidoPorIndice([indice, base64Image, '<img src="', '"/>']));
            };
            reader.readAsDataURL(blob); // Convertir blob a Base64
          } catch (error) {
            console.error('Error al convertir la imagen a Base64:', error);
          }
        } else {
          alert('No se pudo encontrar la ubicación');
        }
      });
    } else {
      alert('La API de Google Maps aún no está cargada.');
    }
  }, [direccion, indice, dispatch, API_KEY]);

  return (
    <div className="p-0" style={{width: "810px"}}>
      <span className="spanContainer">
        <BotoneraContenido indice={indice} className="pr-2" />
        {!ubicacion &&
        <input
          type="text"
          value={direccion || ''}
          onChange={(e) => dispatch(setContenidoPorIndice([indice, e.target.value]))}
          placeholder="Escribe la dirección"
          className="inputTituloNota parrafoNota ml-5"
        />
        }
        {!ubicacion &&
        <button onClick={handleSearch} id="botonPublicar" variant="none">
          Buscar
        </button>
        }
      </span>

      {/* Mapa interactivo */}
      <LoadScript googleMapsApiKey={API_KEY}>
        {ubicacion && (
          <GoogleMap
            mapContainerStyle={{ height: '400px', width: '100%', marginLeft: '55px', borderRadius: '20px' }}
            center={ubicacion}
            zoom={15}
          >
            <Marker position={ubicacion} />
          </GoogleMap>
        )}
      </LoadScript>
    </div>
  );
};

export default Ubicacion;
