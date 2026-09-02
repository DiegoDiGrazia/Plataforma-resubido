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
