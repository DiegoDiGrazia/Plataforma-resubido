const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://services.noticiasd.com"
    : "/services";

const headers = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const verificarToken = async (token) => {
  const res = await fetch(`${BASE_URL}/token/active`, {
    headers: headers(token),
  });

  if (!res.ok) return null;
  return res.json();
};
