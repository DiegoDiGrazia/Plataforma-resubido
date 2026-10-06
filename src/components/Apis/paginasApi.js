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

export const obtenerPaginas = (token, id_perfil = null) => {
  const url = id_perfil 
    ? `${BASE_URL}/paginas?id_perfil=${id_perfil}` 
    : `${BASE_URL}/paginas`;
    
  return fetch(url, {
    headers: headers(token),  
  }).then((r) => r.json());
};
export const crearAcceso = async (token, payload) => {
  const res = await fetch(`${BASE_URL}/accesos`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al crear acceso");
  return res.json();
};

export const eliminarAccesosId = async (token, perfil_id, pagina_id) => {
  const res = await fetch(`${BASE_URL}/accesos?id_perfil=${perfil_id}&id_pagina=${pagina_id}`, {
    method: "DELETE",
    headers: headers(token), 
  });
  if (!res.ok) throw new Error("Error al eliminar acceso");
  if (res.status === 204) return true;
  return res.json();
};
