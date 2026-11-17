// Autoguardado de la nota en el servidor cada 10 s mientras se edita (montado en EditorNota,
// corre en Crear nota y en Publicar nota). Complementa al borrador local: este es el que
// permite retomar la nota desde otra computadora.
//
// Reglas:
// - Respeta el estado de la nota: una nota EN REVISION se guarda como EN REVISION; el resto
//   (nuevas y borradores) como BORRADOR. Las PUBLICADAS y las de IA no se autoguardan.
// - Solo guarda si la nota cambió desde el último guardado (manda imágenes en base64: varios MB).
// - No guarda notas sin título (evita llenar el listado de borradores vacíos).
// - Un guardado por vez.
import { useEffect, useContext, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clickearEnPublicarNota } from '@/shared/utils/publicarNotaHelper';
import { useNavigate } from 'react-router-dom';
import { ArchivoContext } from '@/shared/context/archivoContext';
import { setIdNotaBorrador } from '@/store/crearNotaSlice';
import { firmaNota } from './navegacionEditor';

const INTERVALO_MS = 10000;

/** Estado con el que se autoguarda: nunca cambia una nota EN REVISION a BORRADOR. */
export const estadoAutoguardado = (estadoNota) =>
    estadoNota === 'EN REVISION' ? 'EN REVISION' : 'BORRADOR';

const transformarContenidoAHTML = (contenidos) => {
    if (!contenidos || !Array.isArray(contenidos)) return '';
    return contenidos.reduce((html, contenido) => {
        const etiquetaAbrir = contenido[2];
        const etiquetaCerrar = contenido[3];
        if (["imagen", "video", "archivoPDF", "carrusel"].includes(contenido[0])) {
            return html + etiquetaAbrir;
        }
        return html + etiquetaAbrir + contenido[1] + etiquetaCerrar;
    }, '');
};

const filtrarNulos = (obj) => Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== null));

/**
 * @param guardarAlInicio true si la nota se restauró de un borrador local: tiene cambios que el
 *   servidor no tiene, así que se guarda en el primer ciclo aunque nadie la toque.
 */
const AutoguardadoServidor = ({ guardarAlInicio = false }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { archivo } = useContext(ArchivoContext);

    const nota = useSelector((state) => state.crearNota);
    const TOKEN = useSelector((state) => state.formulario.token);
    const datosUsuario = useSelector((state) => state.formulario.usuario);
    const provinciaDelUsuario = useSelector((state) => state.formulario.provinciaUsuario);
    const municipioDelUsuario = useSelector((state) => state.formulario.municipioUsuario);

    // Firma de lo último que tiene el servidor. Al abrir una nota sin cambios locales es la actual.
    const ultimaFirmaGuardada = useRef(guardarAlInicio ? null : firmaNota(nota));
    const guardando = useRef(false);

    const guardar = async () => {
        if (guardando.current) return;
        if (!nota.tituloNota?.trim()) return;
        const firma = firmaNota(nota);
        if (firma === ultimaFirmaGuardada.current) return;

        guardando.current = true;
        try {
            const response = await clickearEnPublicarNota({
                status: estadoAutoguardado(nota.estado),
                TOKEN,
                titulo: nota.tituloNota,
                url: nota.url,
                categoriasActivas: nota.categoriasActivas,
                notaCargada: nota,
                contenidoHTMLSTR: transformarContenidoAHTML(nota.contenidoNota),
                datosUsuario,
                image: nota.imagenPrincipal,
                imagefeed: nota.imagenRRSS,
                comentario: nota.comentarios,
                selectedOptionDistribucion: nota.con_distribucion,
                isCheckedDistribucionPrioritaria: nota.distribucion_prioritaria,
                isCheckedDemo: nota.es_demo,
                isCheckedNoHome: nota.es_home,
                tipoContenido: nota.tipoContenido,
                fechaPublicacion: nota.f_pub,
                fecha: nota.f_vence,
                itemsEtiquetas: nota.etiquetas,
                engagementText: nota.engagement,
                bajadaText: nota.bajada,
                tipoAutor: nota.autor,
                provincia: nota.provincia || provinciaDelUsuario,
                municipio: nota.municipio || municipioDelUsuario,
                pais: nota.pais,
                archivo,
                // El helper usa id_noti; para una nota nueva es el id que devolvió el primer autoguardado
                id_noti: nota.id_nota_borrador || nota.id_noti,
                id_att: nota.id_att,
                cliente: nota.cliente,
                demo: nota.demo?.nombre,
                epigrafeImagenPpal: nota.epigrafeImagenPpal,
                ...filtrarNulos(nota.atachments),
                ...filtrarNulos(nota.atachmentsArchivos),
                setIsLoading: () => {},
                setShowModal: () => {},
                navigate,
            });

            if (response?.status === "true") {
                ultimaFirmaGuardada.current = firma;
                if (response.item && String(response.item) !== String(nota.id_nota_borrador)) {
                    dispatch(setIdNotaBorrador(response.item));
                }
            }
        } finally {
            guardando.current = false;
        }
    };

    // El intervalo se crea una sola vez: el ref apunta siempre a la función del último render
    // (si no, guardaría para siempre la nota como estaba al montarse).
    const guardarRef = useRef(guardar);
    guardarRef.current = guardar;

    const habilitado = nota.estado !== "PUBLICADO" && nota.es_ia === '0';

    useEffect(() => {
        if (!habilitado) return;
        const intervalo = setInterval(() => guardarRef.current(), INTERVALO_MS);
        return () => clearInterval(intervalo);
    }, [habilitado]);

    return null;
};

export default AutoguardadoServidor;
