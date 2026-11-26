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

export const obtenerPaginas = (token, id_perfil = null) => {
  const url = id_perfil 
    ? `${BASE_URL}/paginas?id_perfil=${id_perfil}` 
    : `${BASE_URL}/paginas`;
    
  return fetch(url, {
    headers: headers(token),  
  }).then((r) => r.json());
};
