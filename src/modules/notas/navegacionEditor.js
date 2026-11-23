// Navegación del editor de notas por URL.
//
//   /notas/editar/:clave            → Crear / editar contenido (CrearNota)
//   /notas/editar/:clave/publicar   → Categorías, distribución y publicación (PublicarNota)
//
// clave = id de la nota en el servidor ("123") o "nueva-<uuid>" para una nota nueva.
// Cada pestaña edita la nota de su URL y su borrador local se guarda con esa clave
// (ver EditorNota.jsx y shared/utils/borradoresDB.js).
import { setClaveEdicion } from '@/store/crearNotaSlice';
import { borrarBorrador } from '@/shared/utils/borradoresDB';

const PREFIJO_NUEVA = 'nueva-';

const uuid = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  // Fallback para contextos sin crypto.randomUUID (http no-localhost)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export const generarClaveNueva = () => `${PREFIJO_NUEVA}${uuid()}`;
export const esClaveNueva = (clave) => String(clave).startsWith(PREFIJO_NUEVA);

/** Clave para una nota: su id si ya existe en el servidor, o una clave nueva. */
export const claveParaNota = (idNota) =>
  idNota && String(idNota) !== '0' ? String(idNota) : generarClaveNueva();

export const rutaEditor = (clave) => `/notas/editar/${encodeURIComponent(clave)}`;
export const rutaPublicar = (clave) => `${rutaEditor(clave)}/publicar`;

/**
 * Abre el editor para la nota que ya está cargada en Redux (crearNota).
 * Llamar DESPUÉS de resetCrearNota / setNotaAEditar / etc.
 * @param idNota id de la nota en el servidor; omitir (o "0") para nota nueva o duplicada.
 */
export const abrirEditorNota = ({ dispatch, navigate, idNota }) => {
  const clave = claveParaNota(idNota);
  dispatch(setClaveEdicion(clave));
  navigate(rutaEditor(clave));
};

/**
 * Firma liviana del contenido editable, para saber si un borrador local tiene cambios
 * respecto de la versión cargada del servidor. Las imágenes base64 se comparan por largo.
 * No incluye la distribución: al abrir desde el listado todavía no se trajo de la API.
 * conCategorias=false para comparar contra la versión recién abierta del listado: Publicar nota
 * convierte categoriasNombres → categoriasActivas al montarse, y eso no es un cambio del usuario.
 */
export const firmaNota = (nota, { conCategorias = true } = {}) => {
  if (!nota) return '';
  const largo = (x) => (typeof x === 'string' ? x.length : x ? 1 : 0);
  return JSON.stringify({
    t: nota.tituloNota,
    c: nota.copete,
    b: nota.bajada,
    e: nota.engagement,
    ep: nota.epigrafeImagenPpal,
    cont: nota.contenidoNota,
    cat: conCategorias ? nota.categoriasActivas : undefined,
    et: nota.etiquetas,
    com: nota.comentarios,
    dist: nota.con_distribucion,
    prio: nota.distribucion_prioritaria,
    img: largo(nota.imagenPrincipal),
    rrss: largo(nota.imagenRRSS),
  });
};

/**
 * Firma de la distribución editable. meta_titulo / meta_engagement se ignoran cuando son el
 * autocompletado (= título / bajada), para no tomar ese relleno automático como un cambio.
 */
export const firmaDistribucion = (dist, nota) => {
  if (!dist) return '';
  // eslint-disable-next-line no-unused-vars -- se desestructura para sacarlo de `campos`
  const { id_nota_cargada, ...campos } = dist;
  if (campos.meta_titulo === nota?.tituloNota) campos.meta_titulo = '';
  if (campos.meta_engagement === nota?.bajada) campos.meta_engagement = '';
  return JSON.stringify(campos);
};

// Notas ya guardadas en el servidor en esta pestaña: no volver a crear su borrador local
// (el guardado pendiente al salir del editor llegaría después de borrarlo).
const clavesCerradas = new Set();

/** Llamar cuando la nota se guardó/publicó con éxito en el servidor. */
export const cerrarBorrador = (clave) => {
  if (!clave) return Promise.resolve();
  clavesCerradas.add(clave);
  return borrarBorrador(clave).catch(() => {});
};
export const esBorradorCerrado = (clave) => clavesCerradas.has(clave);
/** Al volver a abrir la nota en el editor, se vuelve a guardar localmente. */
export const reabrirBorrador = (clave) => clavesCerradas.delete(clave);
