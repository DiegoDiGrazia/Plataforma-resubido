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
