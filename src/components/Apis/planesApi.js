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

export const obtenerPlanes = async (token) => {
  const res = await fetch(`${BASE_URL}/planes`, {
    headers: headers(token),
  });

  if (!res.ok) return null;
  return res.json();
};

export const crearPlan = async (token, payload) => {
  const res = await fetch(`${BASE_URL}/planes`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error al crear el plan:", errorData);
    throw new Error("Error al guardar el plan");
  }
  return res.json();
};

export const actualizarPlan = async (token, id_plan, payload) => {
  const res = await fetch(`${BASE_URL}/planes/${id_plan}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error al editar el plan:", errorData);
    throw new Error("Error al actualizar el plan");
  }
  return res.json();
};

export const eliminarPlan = async (token, id_plan) => {
  const res = await fetch(`${BASE_URL}/planes/${id_plan}`, {
    method: "DELETE",
    headers: headers(token),
  });
  if (!res.ok) throw new Error("Error al eliminar el plan");

  if (res.status === 204) return true;
  return res.json().catch(() => true);
};
