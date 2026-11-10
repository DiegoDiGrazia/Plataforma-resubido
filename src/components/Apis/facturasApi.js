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

export const obtenerFacturas = async (token, desde, hasta) => {
  const res = await fetch(`${BASE_URL}/facturas?desde=${desde}&hasta=${hasta}`, {
    headers: headers(token),
  });

  if (!res.ok) return null;
  return res.json();
};

export const obtenerFacturasDeContrato = async (token, id_contrato) => {
  const res = await fetch(`${BASE_URL}/facturas/${id_contrato}`, {
    headers: headers(token),
  });

  if (!res.ok) return null;
  return res.json();
};

export const editarFactura = async (token, id_factura, numero, estado, mes, fecha_pago) => {
  const res = await fetch(`${BASE_URL}/facturas/${id_factura}`, {
    method: "PUT",
    headers: jsonHeaders(token),
    body: JSON.stringify({
      numero: numero || null,
      estado,
      mes: Number(mes),
      fecha_pago: fecha_pago || null,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error al editar la factura:", errorData);
    throw new Error("Error al editar la factura");
  }
  return res.json();
};

export const unificarFacturas = async (token, id_facturas, id_factura_original) => {
  const res = await fetch(`${BASE_URL}/facturas/unificar/${id_factura_original}`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ id_facturas }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error al unificar las facturas:", errorData);
    throw new Error("Error al unificar las facturas");
  }
  return res.json();
};

export const dividirFactura = async (token, id_factura, cantidad, mes) => {
  const res = await fetch(`${BASE_URL}/facturas/dividir/${id_factura}`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({
      cantidad: Number(cantidad),
      mes: Number(mes),
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error al dividir la factura:", errorData);
    throw new Error("Error al dividir la factura");
  }
  return res.json();
};

export const cargarFacturaAbierta = async (token, numero, estado, mes, id_contrato, monto_mensual, fecha_pago) => {
  const res = await fetch(`${BASE_URL}/facturas/${id_contrato}`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({
      numero: numero || null,
      estado,
      mes: Number(mes),
      monto_mensual: monto_mensual || 0,
      fecha_pago: fecha_pago || null,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error al cargar la factura abierta:", errorData);
    throw new Error("Error al cargar la factura abierta");
  }
  return res.json();
};

export const eliminarFacturaAbierta = async (token, id_factura) => {
  const res = await fetch(`${BASE_URL}/facturas/${id_factura}`, {
    method: "DELETE",
    headers: headers(token),
  });
  if (!res.ok) throw new Error("Error al eliminar la factura");

  if (res.status === 204) return true;
  return res.json().catch(() => true);
};

// Contratos: comentarios

export const obtenerComentariosDeContrato = async (token, id_contrato) => {
  const res = await fetch(`${BASE_URL}/contratos/comentarios/${id_contrato}`, {
    headers: headers(token),
  });

  if (!res.ok) return null;
  return res.json();
};

export const agregarComentario = async (token, id_usuario, comentario, id_contrato) => {
  const res = await fetch(`${BASE_URL}/contratos/comentarios/${id_contrato}`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({
      id_usuario: Number(id_usuario),
      comentario,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error al agregar el comentario:", errorData);
    throw new Error("Error al agregar el comentario");
  }
  return res.json();
};

// Contratos: archivos

export const obtenerArchivosDeContrato = async (token, id_contrato) => {
  const res = await fetch(`${BASE_URL}/contratos/archivos/${id_contrato}`, {
    headers: headers(token),
  });

  if (!res.ok) return null;
  return res.json();
};

export const eliminarArchivo = async (token, id_archivo, id_usuario) => {
  const res = await fetch(`${BASE_URL}/contratos/archivos/${id_archivo}`, {
    method: "DELETE",
    headers: jsonHeaders(token),
    body: JSON.stringify({ id_usuario: Number(id_usuario) }),
  });
  if (!res.ok) throw new Error("Error al eliminar el archivo");

  if (res.status === 204) return true;
  return res.json().catch(() => true);
};
