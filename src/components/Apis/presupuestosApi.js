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

export const obtenerPresupuestosPorUser = async (token, usuario_id) => {
  const res = await fetch(`${BASE_URL}/presupuestos?usuario_id=${usuario_id}`, {
    headers: headers(token),
  });
  if (!res.ok) return null;
  return res.json();
};

export const crearPresupuesto = async (token, payload) => {
  const res = await fetch(`${BASE_URL}/presupuestos`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error al crear el presupuesto:", errorData);
    throw new Error("Error al guardar el presupuesto");
  }
  return res.json();
};

export const actualizarPresupuesto = async (token, presupuesto_id, payload) => {
  const res = await fetch(`${BASE_URL}/presupuestos/${presupuesto_id}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error al editar el presupuesto:", errorData);
    throw new Error("Error al actualizar el presupuesto");
  }
  return res.json();
};

export const eliminarPresupuesto = async (token, presupuesto_id) => {
  const res = await fetch(`${BASE_URL}/presupuestos/${presupuesto_id}`, {
    method: "DELETE",
    headers: headers(token),
  });
  if (!res.ok) throw new Error("Error al eliminar el presupuesto");
  
  if (res.status === 204) return true;
  return res.json().catch(() => true);
};