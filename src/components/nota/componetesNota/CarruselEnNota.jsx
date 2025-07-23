import React, { useState, useRef, useEffect } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { obtenerFechaActual } from './ImagenDeParrafo';
import { actualizarSRCDeUnHTML } from '../../../utils/funcionesVarias';
import { calcularNumeroDeAtachment } from './ImagenDeParrafo';
import { comprimirImagen } from './ImagenPrincipal';
import { setContenidoPorIndice, setAtachment, setImagenesDeCarrusel } from '../../../redux/crearNotaSlice';
import BotoneraContenido from './botoneraContenido';
const cantidadDeAtachments = 10; // Definimos la cantidad de attachments


const CarruselEnNota = ({indice}) => {
  const dispatch = useDispatch();
  // const [images, setImages] = useState([]);
  const images = useSelector((state) => state.crearNota.contenidoNota[indice][1]);
  const [carouselHTML, setCarouselHTML] = useState('');
  const [carruselHTMLCopiaConSRCEditado, setCarruselHTMLCopiaConSRCEditado] = useState('');
  const carouselRef = useRef(null);
  const id_att = useSelector((state) => state.crearNota.id_att); 
  const attachments = useSelector((state) => state.crearNota.atachments);
  const numeroDeAtachmentAUsar = calcularNumeroDeAtachment(attachments);



const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files);

  try {
    const base64Images = await Promise.all(
      files.map(file => comprimirImagen(file)) // Usamos tu función personalizada
    );
    dispatch(setImagenesDeCarrusel([indice, base64Images])); // Actualizamos el estado global con las nuevas imágenes
  } catch (error) {
    console.error('Error al comprimir las imágenes:', error);
  }
};
  useEffect(() => {
    if (carouselRef.current) {
      setCarouselHTML(carouselRef.current.outerHTML);
    }
  }, [carruselHTMLCopiaConSRCEditado,images]);

  useEffect(() => {
  if (carouselHTML && images.length > 0 && id_att) {
    let atachmentAUsar = calcularNumeroDeAtachment(attachments);
    const nuevoHTML = actualizarSRCDeUnHTML(carouselHTML, images, id_att, atachmentAUsar);
    setCarruselHTMLCopiaConSRCEditado(nuevoHTML);
    dispatch(
      setContenidoPorIndice([
          indice,
          images,
          nuevoHTML, '', atachmentAUsar
      ])
    ); 
    for (let i = 0; i < images.length; i++) {
      const atachment = "attachment_" + (atachmentAUsar + i).toString(); 
      dispatch(setAtachment({ key: atachment, value: images[i] }));
    }
  }
}, [carouselHTML, images, id_att]);

return (
  <span className="spanContainer">
    <BotoneraContenido indice={indice} tipo ={"carrusel"} cantidad={images.length} className="pr-2" />

    {images.length > 0 ? (
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
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
      </div>
    ) : (
      // ⬇️ Mostrar el input normalmente si no hay imágenes
      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="form-control mb-3" />
    )}
  </span>
);
}

export default CarruselEnNota;
