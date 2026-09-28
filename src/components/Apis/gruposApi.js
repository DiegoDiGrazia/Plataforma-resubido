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