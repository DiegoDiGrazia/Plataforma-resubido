import React, { useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import './Galeria.css';

const GaleriaImagenes = () => {
  const [imagenes, setImagenes] = useState([]);
  const [indiceActivo, setIndiceActivo] = useState(null);

  const handleAgregarImagenes = (e) => {
    const archivos = Array.from(e.target.files);

    archivos.forEach((archivo) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenes(prev => [
          ...prev,
          {
            src: reader.result,
            colSpan: 2,
            rowSpan: 2,
          }
        ]);
      };
      reader.readAsDataURL(archivo);
    });
  };

  const eliminarImagen = (index) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
    if (indiceActivo !== null && index === indiceActivo) {
      setIndiceActivo(null);
    }
  };

  const cambiarTamanio = (index, tipo) => {
    setImagenes(prev =>
      prev.map((img, i) =>
        i === index
          ? {
              ...img,
              colSpan: tipo === 'grande' ? 4 : 2,
              rowSpan: tipo === 'grande' ? 4 : 2,
            }
          : img
      )
    );
  };

  return (
    <div className="contenedor-galeria">
      <h2>Galería de Imágenes</h2>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleAgregarImagenes}
      />

      <ReactSortable list={imagenes} setList={setImagenes} className="wp-block-gallery-grid">
        {imagenes.map((imagen, index) => (
          <figure
            key={index}
            className={`blocks-gallery-item col-${imagen.colSpan} row-${imagen.rowSpan}`}
          >
            <div className="controles">
              <button onClick={() => cambiarTamanio(index, 'normal')}>1x1</button>
              <button onClick={() => cambiarTamanio(index, 'grande')}>2x2</button>
              <button onClick={() => eliminarImagen(index)}>×</button>
            </div>
            <img
              src={imagen.src}
              alt={`Imagen ${index}`}
              onClick={() => setIndiceActivo(index)}
              style={{ cursor: 'pointer' }}
            />
          </figure>
        ))}
      </ReactSortable>

      {indiceActivo !== null && (
        <Lightbox
          mainSrc={imagenes[indiceActivo].src}
          nextSrc={imagenes[(indiceActivo + 1) % imagenes.length].src}
          prevSrc={imagenes[(indiceActivo + imagenes.length - 1) % imagenes.length].src}
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
