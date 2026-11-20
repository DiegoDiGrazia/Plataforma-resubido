/**
 * Texto plano de un fragmento HTML (sin etiquetas, con entidades decodificadas y espacios normalizados).
 * Para campos que tienen que ir sin formato: extracto / meta de distribución, copiar al portapapeles,
 * contadores de caracteres.
 */
export const htmlATextoPlano = (html) => {
  if (!html) return '';
  if (!/[<&]/.test(html)) return html.trim();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
};
