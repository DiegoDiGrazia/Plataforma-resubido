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

const baseReporte = (id_cliente, anio, mes) =>
  `${BASE_URL}/clientes/${id_cliente}/metricas/integradas/${anio}/${mes}`;

const urlPersonalizacion = (id_cliente, anio, mes, id_noti, nombre_sitio) => {
  let url = `${baseReporte(id_cliente, anio, mes)}/personalizacion`;
  if (id_noti) url += `/${encodeURIComponent(id_noti)}`;
  if (id_noti && nombre_sitio) url += `/${encodeURIComponent(nombre_sitio)}`;
  return url;
};

// Arma un mensaje legible a partir del formato de error de la API (FastAPI)
const mensajeError = async (res) => {
  try {
    const data = await res.json();
    if (Array.isArray(data?.detail)) {
      return data.detail
        .map((d) => `${(d.loc || []).slice(1).join(".")}: ${d.msg}`)
        .join(" | ");
    }
    return data?.detail || `Error ${res.status}`;
  } catch {
    return `Error ${res.status}`;
  }
};

const lanzarError = async (res) => {
  const error = new Error(await mensajeError(res));
  error.status = res.status;
  throw error;
};

// ---------------- REPORTE ----------------

export const obtenerReporteIntegrado = async (token, id_cliente, anio, mes) => {
  const res = await fetch(baseReporte(id_cliente, anio, mes), {
    headers: headers(token),
  });
  if (!res.ok) await lanzarError(res);
  return res.json();
};

// term_id de una nota a partir de su idGeneracion
export const obtenerIdNoti = async (token, idGeneracion) => {
  const res = await fetch(`${BASE_URL}/generaciones/${idGeneracion}`, {
    headers: headers(token),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.term_id ?? null;
};

// ---------------- PERSONALIZACION (cliente / nota / medio) ----------------
// id_noti y nombre_sitio son opcionales:
//   - sin id_noti            -> nivel cliente
//   - con id_noti            -> nivel nota
//   - con id_noti y sitio    -> nivel medio

// Devuelve el objeto o null si no existe (404 = "sin personalizar")
export const obtenerPersonalizacion = async (token, id_cliente, anio, mes, id_noti, nombre_sitio) => {
  const res = await fetch(urlPersonalizacion(id_cliente, anio, mes, id_noti, nombre_sitio), {
    headers: headers(token),
  });
  if (res.status === 404) return null;
  if (!res.ok) await lanzarError(res);
  return res.json();
};

// Crea o reemplaza entera (enviar siempre el formulario completo)
export const guardarPersonalizacion = async (token, id_cliente, anio, mes, body, id_noti, nombre_sitio) => {
  const res = await fetch(urlPersonalizacion(id_cliente, anio, mes, id_noti, nombre_sitio), {
    method: "PUT",
    headers: jsonHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) await lanzarError(res);
  return res.json();
};

// Modifica solo los campos enviados (404 si no existe)
export const modificarPersonalizacion = async (token, id_cliente, anio, mes, body, id_noti, nombre_sitio) => {
  const res = await fetch(urlPersonalizacion(id_cliente, anio, mes, id_noti, nombre_sitio), {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) await lanzarError(res);
  return res.json();
};

// Borra la personalizacion -> el reporte vuelve a los valores reales
export const eliminarPersonalizacion = async (token, id_cliente, anio, mes, id_noti, nombre_sitio) => {
  const res = await fetch(urlPersonalizacion(id_cliente, anio, mes, id_noti, nombre_sitio), {
    method: "DELETE",
    headers: headers(token),
  });
  if (res.status === 404) return false;
  if (!res.ok) await lanzarError(res);
  return true;
};
