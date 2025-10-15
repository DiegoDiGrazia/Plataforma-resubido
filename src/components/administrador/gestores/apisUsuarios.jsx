import axios from "axios";

const fetchData = async (url, token, extraParams = {}) => {
  try {
    const formData = new FormData();
    formData.append("token", token);

    Object.entries(extraParams).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.item || [];
  } catch (err) {
    console.error(`Error al obtener datos de ${url}:`, err);
    return [];
  }
};

// Función para obtener la geolocalización
export const obtenerGeo = async () => {
  try {
    const response = await axios.get(`https://api.noticiasd.com/app_obtener_geo`);
    return response.data.item.geo;
  } catch (error) {
    console.error('Error en obtener geo:', error);
    throw error;
  }
};

export const obtenerUsuarios = (token) =>
  fetchData("https://panel.serviciosd.com/app_obtener_usuarios_abm", token);

export const obtenerClientes = (token) =>
  fetchData("https://panel.serviciosd.com/app_obtener_clientes", token, {
    cliente: "",
  });

export const obtenerPerfiles = (token) =>
  fetchData("https://panel.serviciosd.com/app_obtener_perfiles", token);

export const obtenerPaginas = (token, id_perfil) =>
  fetchData("https://panel.serviciosd.com/app_obtener_paginas", token, {
    id_perfil,
  });

export const eliminarPaginaDelPerfil = (token, id_perfil, id_pagina) =>
  fetchData("https://panel.serviciosd.com/app_acceso_eliminar", token, {
    id_perfil, id_pagina
  });

export const agregarPaginaDelPerfil = (token, id_perfil, id_pagina) =>
  fetchData("https://panel.serviciosd.com/app_acceso_agregar", token, {
    id_perfil, id_pagina
});

export const obtenerNotasDeGeneraciones = (token, cliente = '', desde, hasta, 
                                            categoria, limit, offset, titulo, pais, vencimiento_desde = '', vencimiento_hasta = '') =>
  fetchData("https://panel.serviciosd.com/app_obtener_noticias_abm", token, {
    cliente, desde, hasta, categoria, limit, offset, titulo, pais, vencimiento_desde, vencimiento_hasta
});


export const obtenerPlanesMarketing = (token, desde, hasta) =>
  fetchData("https://panel.serviciosd.com/app_obtener_planes_marketing", token, {
    desde, hasta
});
