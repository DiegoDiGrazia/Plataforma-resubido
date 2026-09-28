const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://services.noticiasd.com"
    : "/services";

const headers = (token) => ({
  Authorization: `Bearer ${token}`,
});

const jsonHeaders = (token) => ({
  ...headers(token),
  "Content-Type": "application/json",
});

export const obtenerMonitor = (token, id_clientes, autores, fecha_desde, fecha_hasta) =>
  fetch(`${BASE_URL}/monitor/`, {
    headers: jsonHeaders(token),
    method: "POST",
    body: JSON.stringify({ id_clientes, autores, fecha_desde, fecha_hasta }),
  }).then((res) => res.json());
