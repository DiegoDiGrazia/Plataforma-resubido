import axios from "axios";

const fetchData = async (url, token, extraParams = {}) => {
  try {
    const formData = new FormData();
    formData.append("token", token);

    Object.entries(extraParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null){
      formData.append(key, value);
      }
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

const fetchDataDevolviendoMensaje = async (url, token, extraParams = {}) => {
  try {
    const formData = new FormData();
    formData.append("token", token);

    Object.entries(extraParams).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.message || '';
  } catch (err) {
    console.error(`Error al obtener datos de ${url}:`, err);
    return [];
  }
};

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

// guardar_posicion_iframes
export const guardar_dato_en_banner_data = (token, id, datos) =>
  fetchData("https://reporte.noticiasd.com/api/guardar_posicion_creativos", token, {
    id, datos
});

export const obtenerPoblacion = (token, division, id) =>
  fetchData("https://panel.serviciosd.com/app_get_estimacion", token, {
    division, id
});

export const obtenerPrecioUsuario = (token, division, id, id_cliente, fecha=null) =>
  fetchData("https://panel.serviciosd.com/app_get_precio_usuario", token, {
    division, id, id_cliente, fecha
});
export const obtenerConsolidacionCliente = (token, id_cliente) =>
  fetchData("https://panel.serviciosd.com/app_get_consolidacion_cliente", token, {
    id_cliente
  });

export const setComprarDistribucion = (token, id_usuario, usuarios, id_cliente, id_noti, monto_dv360=null, monto_meta= null) =>
  fetchData("https://panel.serviciosd.com/app_set_comprar_distribución", token, {
    id_usuario, usuarios, id_cliente, id_noti, monto_dv360, monto_meta  
});

export const editar_o_crear_cliente = (token, id, name, 
      authors, provincia_cliente, municipio_cliente, pais_cliente, tipo_cliente, juridisccion_cliente, muestra_consumo, id_plan) =>
      console.log('token', token, 'id', id, 'name', name, 
      'authors', authors, 'provincia_cliente', provincia_cliente, 'municipio_cliente', municipio_cliente, 
      'pais_cliente', pais_cliente, 'tipo_cliente', tipo_cliente, 'juridisccion_cliente', juridisccion_cliente, 
      'muestra_consumo', muestra_consumo, 'id_plan', id_plan);

export const obtenerTextoRegeneradoConIa = (token, term_id, endpoint) =>
  fetchDataDevolviendoMensaje("https://panel.serviciosd.com/" + endpoint, token, {
    term_id
});



