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

export const obtenerPerfiles = (token) =>
  fetch(`${BASE_URL}/perfiles`, {
    headers: headers(token),

  }).then((r) => r.json());

export const crearPerfil = async (token, payload) => {
  const res = await fetch(`${BASE_URL}/perfiles`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al crear perfil");
  return res.json();
};

export const editarPerfil = async (token, perfil_id, payload) => {
  const res = await fetch(`${BASE_URL}/perfiles/${perfil_id}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al editar perfil");
  return res.json();
};

export const eliminarPerfilPorId = async (token, perfil_id) => {
  const res = await fetch(`${BASE_URL}/perfiles/${perfil_id}`, {
    method: "DELETE",
    headers: headers(token), 
  });
  if (!res.ok) throw new Error("Error al eliminar perfil");
  if (res.status === 204) return true;
  return res.json();
};
