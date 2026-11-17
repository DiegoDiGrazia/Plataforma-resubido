const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://services.noticiasd.com"
    : "/services";

const headers = (token) => ({
  Authorization: `Bearer ${token}`,
});

// TOPS DEL DASHBOARD

export const obtenerTopCategorias = async (token, cliente_id, { fecha_inicio_creacion, fecha_fin_creacion, periodos, pais_id }) => {
  const url = `${BASE_URL}/generaciones/categorias/${cliente_id}?fecha_inicio_creacion=${fecha_inicio_creacion}&fecha_fin_creacion=${fecha_fin_creacion}&periodos=${periodos}`;

  const res = await fetch(pais_id ? `${url}&pais_id=${pais_id}` : url, {
    headers: headers(token),
  });

  if (!res.ok) return null;
  return res.json();
};

export const obtenerTopNotas = async (token, cliente_id, { fecha_inicio_creacion, fecha_fin_creacion, periodos, pais_id }) => {
  const url = `${BASE_URL}/generaciones/notas/${cliente_id}?fecha_inicio_creacion=${fecha_inicio_creacion}&fecha_fin_creacion=${fecha_fin_creacion}&periodos=${periodos}`;

  const res = await fetch(pais_id ? `${url}&pais_id=${pais_id}` : url, {
    headers: headers(token),
  });

  if (!res.ok) return null;
  return res.json();
};

export const obtenerTopMedios = async (token, cliente_id, { periodos, pais_id }) => {
  const url = `${BASE_URL}/sitios/top/${cliente_id}?periodos=${periodos}`;

  const res = await fetch(pais_id ? `${url}&pais_id=${pais_id}` : url, {
    headers: headers(token),
  });

  if (!res.ok) return null;
  return res.json();
};

export const obtenerTopMediosNoticia = async (token, cliente_id, id_noti, pais_id) => {
  const url = `${BASE_URL}/sitios/top/${cliente_id}?id_noti=${id_noti}`;

  const res = await fetch(pais_id ? `${url}&pais_id=${pais_id}` : url, {
    headers: headers(token),
  });

  if (!res.ok) return null;
  return res.json();
};

// NOTICIA

export const obtenerNoticia = async (token, id_noti) => {
  const res = await fetch(`${BASE_URL}/noticias/${id_noti}`, {
    headers: headers(token),
  });

  if (!res.ok) return null;
  return res.json();
};

// METRICAS POR PLATAFORMA

export const obtenerMetricasCliente = async (token, cliente_id, pais_id) => {
  const url = pais_id
    ? `${BASE_URL}/clientes/${cliente_id}/metricas?pais_id=${pais_id}`
    : `${BASE_URL}/clientes/${cliente_id}/metricas`;

  const res = await fetch(url, {
    headers: headers(token),
  });

  if (!res.ok) return null;
  return res.json();
};

export const obtenerMetricasNoticia = async (token, id_noti, pais_id) => {
  const url = pais_id
    ? `${BASE_URL}/noticias/${id_noti}/metricas?pais_id=${pais_id}`
    : `${BASE_URL}/noticias/${id_noti}/metricas`;

  const res = await fetch(url, {
    headers: headers(token),
  });

  if (!res.ok) return null;
  return res.json();
};
