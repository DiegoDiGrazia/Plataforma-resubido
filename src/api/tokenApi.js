const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://services.noticiasd.com"
    : "/services";

const headers = (token) => ({
  Authorization: `Bearer ${token}`,
});

/**
 * Consulta si el token sigue activo.
 * - 2xx: devuelve la respuesta de la API ({ active: true|false, ... }).
 * - 401: el token venció o es inválido → { active: false }.
 * - Cualquier otro error (500, 502, 503…): tira una excepción. Es una falla del servidor,
 *   no de la sesión: quien llama no debe tomarlo como sesión vencida.
 */
export const verificarToken = async (token) => {
  const res = await fetch(`${BASE_URL}/token/active`, {
    headers: headers(token),
  });

  if (res.status === 401) return { active: false };
  if (!res.ok) {
    const error = new Error(`No se pudo verificar el token (HTTP ${res.status})`);
    error.status = res.status;
    throw error;
  }
  return res.json();
};
