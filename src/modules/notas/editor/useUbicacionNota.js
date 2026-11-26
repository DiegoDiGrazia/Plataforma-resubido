import { useSelector } from 'react-redux';

/**
 * Provincia y municipio con los que se publica la nota (define en qué home sale).
 * Lo usan Publicar y Vista previa: los dos tienen que mandar SIEMPRE lo mismo.
 *
 * - Nota nueva (o duplicada): si provincia/municipio quedaron sin elegir, se completan
 *   con los de la cuenta, para que la nota nazca en la home de su cliente aunque este
 *   no los haya cargado. Al guardarse, el editorial ya los ve precargados.
 * - Nota existente: manda siempre lo que dicen los selectores, "Ninguno" incluido
 *   (así el editorial puede cambiar la nota de home).
 *
 * "Sin elegir" = null (se eligió "Ninguno") o el objeto vacío inicial ({ nombre: "" }).
 * El municipio de la cuenta solo se usa si la provincia final es la de la cuenta: nunca
 * se manda un municipio de otra provincia.
 */
const sinElegir = (ubicacion) => !ubicacion?.nombre;

const mismaProvincia = (a, b) =>
    !!a?.nombre && !!b?.nombre &&
    String(a.nombre).trim().toLowerCase() === String(b.nombre).trim().toLowerCase();

export const resolverUbicacionNota = ({
    idNoti,
    provinciaSelector,
    municipioSelector,
    provinciaDeLaCuenta,
    municipioDeLaCuenta,
}) => {
    const esNotaNueva = !idNoti || String(idNoti) === '0';
    if (!esNotaNueva) {
        return { provincia: provinciaSelector, municipio: municipioSelector };
    }

    const provincia = sinElegir(provinciaSelector) ? provinciaDeLaCuenta : provinciaSelector;
    const municipio = sinElegir(municipioSelector) && mismaProvincia(provincia, provinciaDeLaCuenta)
        ? municipioDeLaCuenta
        : municipioSelector;
    return { provincia, municipio };
};

const useUbicacionNota = () => {
    const idNoti = useSelector((state) => state.crearNota.id_noti);
    const provinciaSelector = useSelector((state) => state.crearNota.provincia);
    const municipioSelector = useSelector((state) => state.crearNota.municipio);
    const provinciaDeLaCuenta = useSelector((state) => state.formulario.provinciaUsuario);
    const municipioDeLaCuenta = useSelector((state) => state.formulario.municipioUsuario);

    return resolverUbicacionNota({
        idNoti,
        provinciaSelector,
        municipioSelector,
        provinciaDeLaCuenta,
        municipioDeLaCuenta,
    });
};

export default useUbicacionNota;
