import { obtenerFechaActual } from '../components/nota/componetesNota/ImagenDeParrafo.jsx';

/**
 * Recibe un html unas imagenes y un id_att, y devuelve el html con los src 
 * de las imagenes actualizados
 */
export const actualizarSRCDeUnHTML = (html, images, id_att) => {
  if (!html || !images || images.length === 0) return html;

  const cantidadDeImagenes = images.length;
  let nuevosSRC = [];

  for (let i = 0; i < cantidadDeImagenes; i++) {
    const src = 'https://noticiasd.com/img/' + obtenerFechaActual() + '/' +
                  id_att + '_' +
                  (10 - i).toString() +
                  '_.' + 'jpeg';
    nuevosSRC.push(src);
  }

  // Parsear el HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Obtener todas las imágenes
  const imgElements = doc.querySelectorAll('img');

  // Reemplazar los src
  imgElements.forEach((img, index) => {
    if (nuevosSRC[index]) {
      img.src = nuevosSRC[index];
    }
  });

  // Retornar el HTML modificado
  const updatedHTML = doc.body.innerHTML;
  return updatedHTML;
}