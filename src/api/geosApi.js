const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://feed.noticiasd.com"
    : "/feed";

export const obtenerGeo = async () => {
  const res = await fetch(`${BASE_URL}/geo`);

  if (!res.ok) return null;
  return res.json();
};

export const obtenerPaises = async () => {
  const res = await fetch(`${BASE_URL}/geo/paises`);

  if (!res.ok) return null;
  return res.json();
};

export const obtenerProvincias = async (pais_id) => {
  const res = await fetch(`${BASE_URL}/geo/provincias?pais_id=${pais_id}`);

  if (!res.ok) return null;
  return res.json();
};

export const obtenerMunicipios = async (provincia_id) => {
  const res = await fetch(`${BASE_URL}/geo/municipios?provincia_id=${provincia_id}`);

  if (!res.ok) return null;
  return res.json();
};
