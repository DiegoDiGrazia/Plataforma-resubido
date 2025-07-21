import React, { useState, useRef, useEffect } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { obtenerFechaActual } from './ImagenDeParrafo';
import { actualizarSRCDeUnHTML } from '../../../utils/funcionesVarias';
const cantidadDeAtachments = 10; // Definimos la cantidad de attachments

const CarruselEnNota = ({indice}) => {
  const [images, setImages] = useState([]);
  const [carouselHTML, setCarouselHTML] = useState('');
  const [carruselHTMLCopiaConSRCEditado, setCarruselHTMLCopiaConSRCEditado] = useState('');
  const carouselRef = useRef(null);
  const id_att = useSelector((state) => state.crearNota.id_att); 


  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImages]);
  };
  // Actualiza el HTML enriquecido cuando las imágenes cambian
  useEffect(() => {
    if (carouselRef.current) {
      setCarouselHTML(carouselRef.current.outerHTML);
    }
  }, [carruselHTMLCopiaConSRCEditado,images]);

  useEffect(() => {
  if (carouselHTML && images.length > 0 && id_att) {
    const nuevoHTML = actualizarSRCDeUnHTML(carouselHTML, images, id_att);
    setCarruselHTMLCopiaConSRCEditado(nuevoHTML);
  }
}, [carouselHTML, images, id_att]);

  return (
    <div className="container my-4">
      <h2>Cargar imágenes al carrusel</h2>
      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="form-control mb-3" />

      {images.length > 0 && (
        <div id="carouselExample" className="carousel slide" data-bs-ride="carousel" ref={carouselRef}>
          <div className="carousel-inner">
            {images.map((imgSrc, index) => (
              <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={index}>
                <img src={imgSrc} className="d-block w-100" alt={`Slide ${index + 1}`} />
              </div>
            ))}
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Anterior</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Siguiente</span>
          </button>
        </div>
      )}

      <h4 className="mt-4">Vista del HTML enriquecido (renderizado)</h4>
      <div dangerouslySetInnerHTML={{ __html: carouselHTML }} />

      <h4 className="mt-4">Código fuente del carrusel</h4>
      <pre className="bg-light p-3 rounded"><code>{carruselHTMLCopiaConSRCEditado}</code></pre>
      <span className="spanContainer">
        <BotoneraContenido indice={indice} className="pr-2" />
        <img
            src={imagen[1]}
            alt="Imagen de parrafo"
            className="imagenRecortada imagenNotaContenido"
        />
      </span>
    </div>

          
        
  );
};

export default CarruselEnNota;
