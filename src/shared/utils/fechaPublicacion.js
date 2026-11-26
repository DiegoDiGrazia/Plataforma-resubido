// Fecha y hora de publicación de una nota. En el store se guarda como "YYYY-MM-DD HH:mm:ss"
// y a la API va f_pub (solo fecha) + h_pub (fecha y hora, tal cual la eligen en el editor).
// Se trabaja con strings (sin Date) para que no haya corrimientos por zona horaria.

const dosDigitos = (n) => String(n).padStart(2, '0');

export const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
};

export const horaActual = () => {
  const d = new Date();
  return `${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}`;
};

/** "2026-11-26 14:35:00" | "2026-11-26T14:35" | "2026-11-26" → { fecha: "2026-11-26", hora: "14:35" | "" } */
export const separarFechaHora = (valor) => {
  if (!valor) return { fecha: '', hora: '' };
  const [fecha = '', resto = ''] = String(valor).trim().split(/[ T]/);
  return { fecha, hora: resto.slice(0, 5) };
};

/** ("2026-11-26", "14:35") → "2026-11-26 14:35:00". Sin hora devuelve solo la fecha. */
export const unirFechaHora = (fecha, hora) => {
  if (!fecha) return '';
  return hora ? `${fecha} ${hora.slice(0, 5)}:00` : fecha;
};

/**
 * Valor de f_pub para app_subir_nota: siempre "YYYY-MM-DD HH:mm:ss".
 * Sin fecha → ahora. Con fecha pero sin hora → esa fecha a la hora actual.
 */
export const fechaPublicacionParaApi = (valor) => {
  const { fecha, hora } = separarFechaHora(valor);
  return unirFechaHora(fecha || hoy(), hora || horaActual());
};
