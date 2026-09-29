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
    console.error("Error en POST /presupuestos:", errorData);
    throw new Error("Error al guardar el presupuesto");
  }
  return res.json();
};