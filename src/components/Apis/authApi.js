const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://services.noticiasd.com"
    : "/services";

const jsonHeaders = {
  "Content-Type": "application/json",
};

const mensajeDeError = (data) => {
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail) && data.detail[0]?.msg) return data.detail[0].msg;
  return "Ocurrió un error. Probá de nuevo.";
};

const errorDeAuth = async (res) => {
  const data = await res.json().catch(() => ({}));
  const error = new Error(mensajeDeError(data));
  error.status = res.status;
  error.retryAfter = data?.retry_after || null;
  return error;
};

export const login = async (email, clave) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, clave }),
  });
  if (!res.ok) throw await errorDeAuth(res);
  return res.json();
};

export const cambiarClave = async (email, clave_actual, clave_nueva) => {
  const res = await fetch(`${BASE_URL}/auth/clave`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ email, clave_actual, clave_nueva }),
  });
  if (!res.ok) throw await errorDeAuth(res);
  return true;
};
