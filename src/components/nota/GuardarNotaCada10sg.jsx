import React, { useState, useEffect, useContext, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clickearEnPublicarNota } from '../../utils/publicarNotaHelper';
import { useNavigate } from 'react-router-dom';
import { ArchivoContext } from '../../context/archivoContext';
import { setIdNotaBorrador } from '../../redux/crearNotaSlice';

const GuardarNotaCada10sg = ({nota}) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { archivo } = useContext(ArchivoContext);

    // 🔥 Todas tus selecciones de Redux (igual que antes)
    const id_nota_borrador = useSelector((state) => state.crearNota.id_nota_borrador);
    const titulo = useSelector((state) => state.crearNota.tituloNota);
    const contenidoNota = useSelector((state) => state.crearNota.contenidoNota);
    const categoriasActivas = useSelector((state) => state.crearNota.categoriasActivas);
    const notaCargada = useSelector((state) => state.crearNota);
    const TOKEN = useSelector((state) => state.formulario.token);
    const datosUsuario = useSelector((state) => state.formulario.usuario);
    const image = useSelector((state) => state.crearNota.imagenPrincipal);
    const imagefeed = useSelector((state) => state.crearNota.imagenRRSS);
    const comentario = useSelector((state) => state.crearNota.comentarios);
    const selectedOptionDistribucion = useSelector((state) => state.crearNota.con_distribucion);
    const isCheckedDistribucionPrioritaria = useSelector((state) => state.crearNota.distribucion_prioritaria);
    const isCheckedDemo = useSelector((state) => state.crearNota.es_demo);
    const isCheckedNoHome = useSelector((state) => state.crearNota.es_home);
    const tipoContenido = useSelector((state) => state.crearNota.tipoContenido);
    const fechaPublicacion = useSelector((state) => state.crearNota.f_pub);
    const fecha = useSelector((state) => state.crearNota.f_vence);
    const itemsEtiquetas = useSelector((state) => state.crearNota.etiquetas);
    const engagementText = useSelector((state) => state.crearNota.engagement);
    const bajadaText = useSelector((state) => state.crearNota.bajada);
    const epigrafeImagenPpal = useSelector((state) => state.crearNota.epigrafeImagenPpal);
    const tipoAutor = useSelector((state) => state.crearNota.autor);
    const pais = useSelector((state) => state.crearNota.pais);
    const id_att = useSelector((state) => state.crearNota.id_att);
    const clienteDeLaNota = useSelector((state) => state.crearNota.cliente);
    const demo = useSelector((state) => state.crearNota.demo.nombre);

    const provinciaSelector = useSelector((state) => state.crearNota.provincia);
    const municipioSelector = useSelector((state) => state.crearNota.municipio);
    const provinciaDelUsuario = useSelector((state) => state.formulario.provinciaUsuario);
    const municipioDelUsuario = useSelector((state) => state.formulario.municipioUsuario);

    const provincia = provinciaSelector || provinciaDelUsuario;
    const municipio = municipioSelector || municipioDelUsuario;

    const status = 'BORRADOR';
    const cliente = clienteDeLaNota;

    // 🔥 Attachments filtrados
    const attachments = useSelector((state) => state.crearNota.atachments);
    const attachmentsArchivos = useSelector((state) => state.crearNota.atachmentsArchivos);

    const atachmentsValidos = Object.fromEntries(
        Object.entries(attachments).filter(([_, v]) => v !== null)
    );

    const atachmentsArchivosValidos = Object.fromEntries(
        Object.entries(attachmentsArchivos).filter(([_, v]) => v !== null)
    );

    // --------------------------------------------------------------
    // 🔥 SOLUCIÓN: Mantener id_noti ACTUALIZADO usando un ref
    // --------------------------------------------------------------

    const idRef = useRef(id_nota_borrador);

    useEffect(() => {
        idRef.current = id_nota_borrador;
        console.log("🔄 id_nota_borrador actualizado:", idRef.current);
    }, [id_nota_borrador]);


    // --------------------------------------------------------------
    // Transformar contenido a HTML (igual que antes)
    // --------------------------------------------------------------

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

    // --------------------------------------------------------------
    // 🔥 Función que ahora usa SIEMPRE el id actual desde idRef.current
    // --------------------------------------------------------------

    const clickear_en_publicar_nota = async () => {
        const idActual = idRef.current;
        console.log("📝 Auto-guardando con id:", idActual);

        const contenidoHTMLSTR = transformarContenidoAHTML(contenidoNota);

        const response = await clickearEnPublicarNota({
            status,
            TOKEN,
            titulo,
            categoriasActivas,
            notaCargada,
            contenidoHTMLSTR,
            datosUsuario,
            image,
            imagefeed,
            comentario,
            selectedOptionDistribucion,
            isCheckedDistribucionPrioritaria,
            isCheckedDemo,
            isCheckedNoHome,
            tipoContenido,
            fechaPublicacion,
            fecha,
            itemsEtiquetas,
            engagementText,
            bajadaText,
            tipoAutor,
            provincia,
            municipio,
            pais,
            archivo,
            id_noti: idActual,   // 🔥 acá llega el id nuevo
            id_att,
            cliente,
            demo,
            epigrafeImagenPpal,
            ...atachmentsValidos,
            ...atachmentsArchivosValidos,
            setIsLoading: () => {},
            setShowModal: () => {},
            navigate,
        });

        if (response?.status === "true") {
            console.log("💾 Guardado con éxito:", response.item);
            dispatch(setIdNotaBorrador(response.item)); // 🔥 Esto actualiza idRef gracias al useEffect
        }
    };

    // --------------------------------------------------------------
    // 🔥 Ejecuta cada 10 segundos (solo 1 interval)
    // --------------------------------------------------------------

    useEffect(() => {
        if (!nota) return;
        if (nota.estado !== "PUBLICADO" && nota.es_ia === '0') {
            const intervalo = setInterval(() => {
                clickear_en_publicar_nota();
            }, 10000);
            return () => clearInterval(intervalo);
        }

    }, []);

    return null;
};

export default GuardarNotaCada10sg;
