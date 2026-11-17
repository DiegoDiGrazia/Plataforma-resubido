// Borradores de notas guardados en el navegador (IndexedDB), uno por nota.
//
// Por qué IndexedDB y no localStorage: la nota incluye imágenes en base64 (varios MB) y
// localStorage tiene ~5MB compartidos por toda la app; al pasarse, el guardado falla en silencio.
// IndexedDB aguanta cientos de MB, es asíncrono y cada nota tiene su propia entrada, así que
// dos pestañas editando notas distintas no se pisan.
//
// Cada entrada: { clave, nota, distribucion, titulo, guardadoEn }
//   clave: id de la nota en el servidor ("123") o "nueva-<uuid>" si todavía no tiene id.

const DB_NOMBRE = 'noticiasd';
const DB_VERSION = 1;
const STORE = 'borradoresNotas';
const DIAS_DE_VIDA = 30;

let dbPromesa = null;

const abrirDB = () => {
  if (dbPromesa) return dbPromesa;
  dbPromesa = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB no disponible'));
      return;
    }
    const req = indexedDB.open(DB_NOMBRE, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'clave' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  // Si falla (modo privado de algunos navegadores), permitir reintentar más tarde
  dbPromesa.catch(() => { dbPromesa = null; });
  return dbPromesa;
};

const transaccion = async (modo, operacion) => {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, modo);
    const resultado = operacion(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(resultado?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
};

export const guardarBorrador = (clave, { nota, distribucion }) =>
  transaccion('readwrite', (store) =>
    store.put({
      clave,
      nota,
      distribucion,
      titulo: nota?.tituloNota || '',
      guardadoEn: Date.now(),
    })
  );

export const leerBorrador = (clave) =>
  transaccion('readonly', (store) => store.get(clave));

export const borrarBorrador = (clave) =>
  transaccion('readwrite', (store) => store.delete(clave));

/** Lista liviana (sin la nota completa) ordenada del más reciente al más viejo. */
export const listarBorradores = async () => {
  const todos = (await transaccion('readonly', (store) => store.getAll())) || [];
  return todos
    .map(({ clave, titulo, guardadoEn }) => ({ clave, titulo, guardadoEn }))
    .sort((a, b) => b.guardadoEn - a.guardadoEn);
};

/** Borra los borradores sin tocar hace más de DIAS_DE_VIDA días. */
export const limpiarBorradoresViejos = async () => {
  const limite = Date.now() - DIAS_DE_VIDA * 24 * 60 * 60 * 1000;
  const lista = await listarBorradores();
  await Promise.all(lista.filter((b) => b.guardadoEn < limite).map((b) => borrarBorrador(b.clave)));
};
