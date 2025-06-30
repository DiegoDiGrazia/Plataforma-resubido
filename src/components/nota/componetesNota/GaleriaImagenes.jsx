import React, { useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // 👈 Importante
import './Galeria.css';

const GaleriaImagenes = () => {
  const [imagenes, setImagenes] = useState([]);
  const [indiceActivo, setIndiceActivo] = useState(null); // Para el lightbox

  const handleAgregarImagenes = (e) => {
    const archivos = Array.from(e.target.files);

    archivos.forEach((archivo) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenes(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(archivo);
    });
  };

  const eliminarImagen = (index) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
    if (indiceActivo !== null && index === indiceActivo) {
      setIndiceActivo(null); // cerrar lightbox si se borra la imagen activa
    }
  };

  return (
    <div>
      <h2>Galería de Imágenes</h2>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleAgregarImagenes}
      />
      <ReactSortable list={imagenes} setList={setImagenes} className="galeria">
        {imagenes.map((src, index) => (
          <div key={index} className="imagen-container">
            <button
              className="btn-eliminar"
              onClick={() => eliminarImagen(index)}
              title="Eliminar imagen"
            >
              ×
            </button>
            <img
              src={src}
              alt={`Imagen ${index}`}
              onClick={() => setIndiceActivo(index)} // 👉 abrir lightbox
              style={{ cursor: 'pointer' }}
            />
          </div>
        ))}
      </ReactSortable>

      {indiceActivo !== null && (
        <Lightbox
          mainSrc={imagenes[indiceActivo]}
          nextSrc={imagenes[(indiceActivo + 1) % imagenes.length]}
          prevSrc={imagenes[(indiceActivo + imagenes.length - 1) % imagenes.length]}
          onCloseRequest={() => setIndiceActivo(null)}
          onMovePrevRequest={() =>
            setIndiceActivo((indiceActivo + imagenes.length - 1) % imagenes.length)
          }
          onMoveNextRequest={() =>
            setIndiceActivo((indiceActivo + 1) % imagenes.length)
          }
        />
      )}
    </div>
  );
};

export default GaleriaImagenes;
