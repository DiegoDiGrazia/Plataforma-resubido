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
 
// PAISES 

export const obtenerSitiosPaises = async (token, pais_id) => {
  const url = (pais_id && pais_id !== 0) 
    ? `${BASE_URL}/sitios/paises?pais_id=${pais_id}` 
    : `${BASE_URL}/sitios/paises`;

  const res = await fetch(url, {
    headers: headers(token),
  });
  
  if (!res.ok) return null;
  return res.json();
};

export const agregarSitioPaises = async (token, pais_id, sitio) => {
    const url = (pais_id && pais_id !== 0) 
      ? `${BASE_URL}/sitios/paises?pais_id=${pais_id}` 
      : `${BASE_URL}/sitios/paises`;
    const res = await fetch(url, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify({ sitio }),
    });
    if (!res.ok) return null;
    return res.json();
  };

export const eliminarSitioPaises = async (token, pais_id, id_sitio) => {
    const res = await fetch(`${BASE_URL}/sitios/paises?pais_id=${pais_id}&id_sitio=${id_sitio}`, {
        method: "DELETE",
        headers: headers(token),
    });
    if (!res.ok) return null;
    if (res.status === 204) return true;
    return res.json();
};

// PROVINCIAS
export const obtenerSitiosProvincias = async (token, provincia_id) => {
  const url = (provincia_id && provincia_id !== 0) 
    ? `${BASE_URL}/sitios/provincias?provincia_id=${provincia_id}` 
    : `${BASE_URL}/sitios/provincias`;

  const res = await fetch(url, {
    headers: headers(token),
  });
  
  if (!res.ok) return null;
  return res.json();
};

export const agregarSitioProvincias = async (token, provincia_id, sitio) => {
    const url = (provincia_id && provincia_id !== 0)
        ? `${BASE_URL}/sitios/provincias?provincia_id=${provincia_id}`
        : `${BASE_URL}/sitios/provincias`;

    const res = await fetch(url, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify({ sitio }),
    });
    if (!res.ok) return null;
    return res.json();
};

export const eliminarSitioProvincias = async (token, provincia_id, id_sitio) => {
    const res = await fetch(`${BASE_URL}/sitios/provincias?provincia_id=${provincia_id}&id_sitio=${id_sitio}`, {
        method: "DELETE",
        headers: headers(token),
    });
    if (!res.ok) return null;
    if (res.status === 204) return true;
    return res.json();
}