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