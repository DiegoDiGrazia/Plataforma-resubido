// MySQL corre en UTC (NOW() del trigger) y la API devuelve los DATETIME sin zona
// ("2026-10-29T17:08:32"). Sin la "Z", new Date() los tomaría como hora local.
export const parsearFechaUTC = (valor) => {
    if (!valor) return null;
    if (valor instanceof Date) return valor;
    const texto = String(valor).trim().replace(' ', 'T');
    const tieneZona = /(Z|[+-]\d{2}:?\d{2})$/.test(texto);
    const fecha = new Date(tieneZona || !texto.includes('T') ? texto : `${texto}Z`);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
};

// Fecha/hora local elegida por el usuario → DATETIME en UTC, mismo formato que guarda la base
const aDatetimeUTC = (fecha, hora) =>
    new Date(`${fecha}T${hora}:00`).toISOString().slice(0, 19);

// Arma el payload para PATCH /distribucion-generaciones/by-generacion/:id
// a partir de los "valores" que maneja <DistribucionGeneracionFields>.
// "ultima_actualizacion" se manda siempre:
//  - diferida: la fecha y hora elegidas. Si no cambiaron, el trigger la respeta por ser futura.
//  - no diferida: la hora actual. Así destildar "diferida" la cancela, aunque no cambie
//    ningún otro campo (si se mandara igual a la guardada, el trigger la dejaría).
export const armarPayloadDistribucion = (valores) => {
    const payload = {
        fecha_vencimiento: valores.fecha_vencimiento,
        comentarios: valores.comentarios,
        meta_titulo: valores.meta_titulo,
        meta_engagement: valores.meta_engagement,
        x_descripcion: valores.x_descripcion,
        youtube_titulo: valores.youtube_titulo,
        youtube_descripcion: valores.youtube_descripcion,
        youtube_link_video: valores.youtube_link_video,
        search_titulo: valores.search_titulo,
        search_descripcion: valores.search_descripcion,
    };

    if (valores.diferida && valores.fecha_diferida && valores.hora_diferida) {
        payload.ultima_actualizacion = aDatetimeUTC(valores.fecha_diferida, valores.hora_diferida);
    } else {
        payload.ultima_actualizacion = new Date().toISOString().slice(0, 19);
    }

    return payload;
};

// A partir de un "ultima_actualizacion" guardado, arma { diferida, fecha_diferida, hora_diferida }
// para precargar el checkbox de fecha diferida. Solo se considera diferida si la fecha
// guardada es futura (si ya pasó, es simplemente la última actualización normal de la nota).
export const extraerDiferidaDesdeUltimaActualizacion = (ultimaActualizacion) => {
    const vacio = { diferida: false, fecha_diferida: '', hora_diferida: '' };
    const fecha = parsearFechaUTC(ultimaActualizacion);
    if (!fecha || fecha <= new Date()) return vacio;

    const pad = (n) => String(n).padStart(2, '0');
    return {
        diferida: true,
        fecha_diferida: `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`,
        hora_diferida: `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`,
    };
};
