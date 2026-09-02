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

// Distribucion Generaciones

export const editarDistribucionGeneracion = (token, generacion_id, data) =>
  fetch(`${BASE_URL}/distribucion-generaciones/by-generacion/${generacion_id}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  }).then((r) => r.json());



export const obtenerDistribucionGeneracion = async (token, generacion_id) => {
  const response = await fetch(`${BASE_URL}/distribucion-generaciones/${generacion_id}`, {
    headers: headers(token),
  });
  if (!response.ok) return null;
  return response.json();
};

export const obtenerDistribucionPorFechaVencimiento = async (token, fecha_vencimiento_desde, fecha_vencimiento_hasta) => {
  const response = await fetch(`${BASE_URL}/distribucion-generaciones/by_fecha_vencimiento/${fecha_vencimiento_desde}/${fecha_vencimiento_hasta}`, {
    headers: headers(token),
  });
  if (!response.ok) return [];
  return response.json();
};

// Generaciones

export const obtenerGeneracion = async (token, id_generacion) => {
  const response = await fetch(`${BASE_URL}/generaciones/${id_generacion}`, {
    headers: headers(token),
  });
  if (!response.ok) return null;
  return response.json();
};

// Clientes

export const obtenerClientes = (token) =>
  fetch(`${BASE_URL}/clientes`, {
    headers: headers(token),
  }).then((r) => r.json());

export const obtenerCliente = async (token, id_cliente) => {
  const response = await fetch(`${BASE_URL}/clientes/${id_cliente}`, {
    headers: headers(token),
  });
  if (!response.ok) return null;
  return response.json();
};

export const crearCliente = (token, data) =>
  fetch(`${BASE_URL}/clientes`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const actualizarCliente = (token, id_cliente, data) =>
  fetch(`${BASE_URL}/clientes/${id_cliente}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const eliminarCliente = (token, id_cliente) =>
  fetch(`${BASE_URL}/clientes/${id_cliente}`, {
    method: "DELETE",
    headers: headers(token),
  });

// Grupos

export const obtenerGrupos = async (token) => {
  const res = await fetch(`${BASE_URL}/grupos`, {
    headers: headers(token),
  });
  if (!res.ok) return null;
  return res.json();
}

export const obtenerAutores = async (token) => {
  const res = await fetch(`${BASE_URL}/grupos/autores`, {
    headers: headers(token),
  });
  if (!res.ok) return null;
  return res.json();
}

export const obtenerGruposClientes = async (token) => {
  const res = await fetch(`${BASE_URL}/grupos/clientes`, {
    headers: headers(token),
  });
  if (!res.ok) return null;
  return res.json();
}

export const crearGrupo = (token, nombre) => 
  fetch(`${BASE_URL}/grupos`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ nombre }),
  }).then((res) => res.json());


export const crearAutor = (token, autor, id_autores_grupo) => 
  fetch(`${BASE_URL}/grupos/autores`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ autor, id_autores_grupo }),
  }).then((res) => res.json());

export const actualizarGrupo = (token, id_grupo, autores) =>
  fetch(`${BASE_URL}/grupos/autores/${id_grupo}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify({ autores }),
  }).then((res) => res.json());

export const actualizarAutor = (token, id_autores_grupo, clientes) =>
  fetch(`${BASE_URL}/grupos/clientes/${id_autores_grupo}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify({ clientes }),
  }).then((res) => res.json());

export const eliminarGrupo = (token, id_grupo) =>
  fetch(`${BASE_URL}/grupos/${id_grupo}`, {
    method: "DELETE",
    headers: headers(token),
  });

export const eliminarAutor = (token, id_autor) =>
  fetch(`${BASE_URL}/grupos/autores/${id_autor}`, {
    method: "DELETE",
    headers: headers(token),
  });

export const obtenerMonitor = (token, id_clientes, fecha_desde, fecha_hasta) =>
  fetch(`${BASE_URL}/monitor/`, {
    headers: jsonHeaders(token),
    method: "POST",
    body: JSON.stringify({ id_clientes, fecha_desde, fecha_hasta }),
  }).then((res) => res.json());

export const editarComentarioCliente = (token, id_cliente, comentario) =>
  fetch(`${BASE_URL}/monitor/comentario/${id_cliente}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify({ comentario }),
  }).then((res) => res.json());
