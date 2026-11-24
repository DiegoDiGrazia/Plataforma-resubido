// Identificar clientes SIEMPRE por id. El nombre es solo para mostrar
// (y para las APIs que todavía lo piden: se manda junto al id, nunca en lugar de él).

/** Compara dos ids de cliente aunque uno venga como string y otro como number. */
export const mismoId = (a, b) => a != null && a !== '' && b != null && b !== '' && String(a) === String(b);

/**
 * Id del cliente de un registro de la API (nota, video, relación…).
 * Usa `registro.id_cliente` si viene; si no (endpoints que todavía solo traen el nombre),
 * lo resuelve por nombre con la lista de clientes. Devuelve number o null.
 * Resolverlo una vez al recibir los datos y de ahí en más comparar solo por id.
 */
export const idClienteDe = (registro, clientes = [], campoNombre = 'cliente') => {
  if (!registro) return null;
  if (registro.id_cliente != null && registro.id_cliente !== '') return Number(registro.id_cliente);
  const nombre = registro[campoNombre]?.toLowerCase();
  if (!nombre) return null;
  const encontrado = clientes.find((c) => c.name?.toLowerCase() === nombre);
  return encontrado ? Number(encontrado.id) : null;
};

/** Cliente de la lista con ese id (o undefined). */
export const clientePorId = (clientes = [], id) => clientes.find((c) => mismoId(c.id, id));
