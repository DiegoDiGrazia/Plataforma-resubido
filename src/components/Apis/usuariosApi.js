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

export const obtenerUsuarios = (token) => 
    fetch(`${BASE_URL}/usuarios`, {
        headers: headers(token),
    }).then((r) => r.json());

export const crearUsuario = async (token, payload) => {
  const res = await fetch(`${BASE_URL}/usuarios`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al crear usuario");
  return res.json();
};

export const editarUsuario = async (token, usuario_id, payload) => {
  const res = await fetch(`${BASE_URL}/usuarios/${usuario_id}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al editar usuario");
  return res.json();
};

export const eliminarUsuarioPorId = async (token, usuario_id) => {
  const res = await fetch(`${BASE_URL}/usuarios/${usuario_id}`, {
    method: "DELETE",
    headers: headers(token), 
  });
  if (!res.ok) throw new Error("Error al eliminar usuario");
  if (res.status === 204) return true;
  return res.json().catch(() => true); 
};

export const cambiarClaveUsuario = async (token, usuario_id, clave) => {
  const res = await fetch(`${BASE_URL}/usuarios/${usuario_id}/clave`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify({ clave: clave }),
  });
  if (!res.ok) throw new Error("Error al cambiar clave");
  if (res.status === 204) return true;
  return res.json();
};