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

export const obtenerComisionistas = async (token) => {
  const res = await fetch(`${BASE_URL}/comisionistas`, {
    headers: headers(token),
  });

  if (!res.ok) return null;
  return res.json();
};

export const crearComisionista = async (token, payload) => {
  const res = await fetch(`${BASE_URL}/comisionistas`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error al crear el comisionista:", errorData);
    throw new Error("Error al guardar el comisionista");
  }
  return res.json();
};

export const actualizarComisionista = async (token, id_comisionista, payload) => {
  const res = await fetch(`${BASE_URL}/comisionistas/${id_comisionista}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error al editar el comisionista:", errorData);
    throw new Error("Error al actualizar el comisionista");
  }
  return res.json();
};

export const eliminarComisionista = async (token, id_comisionista) => {
  const res = await fetch(`${BASE_URL}/comisionistas/${id_comisionista}`, {
    method: "DELETE",
    headers: headers(token),
  });
  if (!res.ok) throw new Error("Error al eliminar el comisionista");

  if (res.status === 204) return true;
  return res.json().catch(() => true);
};
