// banner_data se guarda como string tipo "{'vp':69, 'historiaTipo':2}" (comillas simples) o null

export const parseBannerData = (raw) => {
    if (!raw) return null;
    try {
        return JSON.parse(String(raw).replace(/'/g, '"'));
    } catch {
        return null;
    }
};

// Devuelve el tipo de historia guardado (historiaTipo). Si no hay banner_data o es invalido, devuelve 1.
export const getTipoHistoria = (raw) => {
    const data = parseBannerData(raw);
    const tipo = Number(data?.historiaTipo);
    return !Number.isNaN(tipo) && tipo > 0 ? tipo : 1;
};

// Devuelve el color guardado para los creativos tipo 3, 4 y 5. Si no hay, devuelve null.
export const getColorHistoria = (raw) => {
    const data = parseBannerData(raw);
    return data?.color || null;
};

// Devuelve el color de texto (sin '#') acorde al color de fondo del creativo.
// efef43 es un amarillo claro, necesita texto negro; el resto usa texto blanco.
export const getColorTexto = (color) => {
    return color === 'efef43' ? '111111' : 'ffffff';
};

// Arma el fragmento "&color=...&colorTexto=..." (URL-encodeado) para los creativos tipo 3, 4 y 5.
export const armarParamsColorCreativo = (color) => {
    if (!color) return '';
    const colorTexto = getColorTexto(color);
    return `&color=${encodeURIComponent('#' + color)}&colorTexto=${encodeURIComponent('#' + colorTexto)}`;
};
