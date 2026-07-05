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

// Token

export const verificarToken = (token) =>
  fetch(`${BASE_URL}/token/active`, {
    headers: headers(token),

  }).then((r) => r.json());

// Feed

export const crearFeed = (token, clientId, name) =>
  fetch(`${BASE_URL}/feed`, {
    method: "POST",
    headers: jsonHeaders(token),

    body: JSON.stringify({ client_id: clientId, name }),
  }).then((r) => r.json());

export const obtenerFeedsPorCliente = (token, clientId) =>
  fetch(`${BASE_URL}/feed/client/${clientId}`, {
    headers: headers(token),

  }).then((r) => r.json());

export const obtenerFeed = (token, feedId) =>
  fetch(`${BASE_URL}/feed/${feedId}`, {
    headers: headers(token),

  }).then((r) => r.json());

export const actualizarFeed = (token, feedId, data) =>
  fetch(`${BASE_URL}/feed/${feedId}`, {
    method: "PATCH",
    headers: jsonHeaders(token),

    body: JSON.stringify(data),
  }).then((r) => r.json());

export const eliminarFeed = (token, feedId) =>
  fetch(`${BASE_URL}/feed/${feedId}`, {
    method: "DELETE",
    headers: headers(token),

  });

// Notas de un feed

export const agregarNotaAFeed = (token, feedId, generacionId, prioritaria = false, idNoti = null) =>
  fetch(`${BASE_URL}/feed/${feedId}/notes`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ ...(generacionId != null && { generacion_id: generacionId }), prioritaria, ...(idNoti != null && { id_noti: idNoti }) }),
  }).then((r) => r.json());


export const quitarNotaDeFeed = (token, feedId, generacionId) =>
  fetch(`${BASE_URL}/feed/${feedId}/notes/${generacionId}`, {
    method: "DELETE",
    headers: headers(token),
  });
