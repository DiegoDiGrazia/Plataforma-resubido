import axios from 'axios';
function reemplazarComillasSimplePorDoble(str) {
    if(!str) return str;
    return str
        .replace(/'/g, '"'); // Reemplaza comillas simples por comillas dobles
}

export const clickearEnPublicarNota = async ({
    status,
    TOKEN,
    es_ia,
    titulo,
    categoriasActivas,
    notaCargada,
    contenidoHTMLSTR,
    estadoPublicar,
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
    id_noti,
    id_att,
    cliente,
    demo,
    epigrafeImagenPpal,
    setIsLoading,
    setShowModal,
    navigate,
    ...atachments
}) => {
    try {
        setIsLoading(true); // Muestra el overlay
        setShowModal(true); // Muestra el modal de carga
        console.log('ID NOTI ADENTRO DE LA FUNCION publicarNotaHelper: ', id_noti);

        const response = await axios.post(
            "https://panel.serviciosd.com/app_subir_nota",
            {
                token: TOKEN,
                status: status,
                es_ia: es_ia,
                id: id_noti ? id_noti : "0",
                titulo: reemplazarComillasSimplePorDoble(titulo),
                categorias: categoriasActivas,
                copete: reemplazarComillasSimplePorDoble(notaCargada.copete),
                parrafo: reemplazarComillasSimplePorDoble(contenidoHTMLSTR),
                estado: status,
                cliente: demo || datosUsuario.cliente || cliente,
                email: "",
                base_principal: image,
                base_feed: imagefeed,
                comentarios: reemplazarComillasSimplePorDoble(comentario),
                autor_cliente: datosUsuario.email,
                con_distribucion: selectedOptionDistribucion,
                distribucion: selectedOptionDistribucion === 'normal'
                    ? isCheckedDistribucionPrioritaria === '1'
                        ? "prioritaria"
                        : "normal"
                    : "ninguna",
                distribuicion_prioritaria: selectedOptionDistribucion == 1
                    ? isCheckedDistribucionPrioritaria == '1' || isCheckedDistribucionPrioritaria == 'Prioritaria'
                        ? "Prioritaria"
                        : "Normal"
                    : "Ninguna",
                es_demo: isCheckedDemo,
                epigrafe_ppal: epigrafeImagenPpal,
                es_home: isCheckedNoHome,
                no_home: isCheckedNoHome,
                tipo_contenido: tipoContenido,
                f_pub: fechaPublicacion,
                fecha_vencimiento: fecha,
                etiquetas: itemsEtiquetas,
                engagement: reemplazarComillasSimplePorDoble(engagementText),
                extracto: reemplazarComillasSimplePorDoble(bajadaText),
                autor: tipoAutor,
                provincia: provincia?.nombre || "", // Usa el operador opcional `?.`
                municipio: municipio?.nombre || "", // Usa el operador opcional `?.`
                pais:pais?.nombre || "",
                attachment_video1: archivo || "",
                id_att: id_att ? id_att : "",
                ...atachments,
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (response.data.status === "true") {
            return response.data;
        } else {
            console.error('Error en la respuesta de la API:', response.data.message);
        }
    } catch (error) {
        console.error('Error al hacer la solicitud:', error);
    } finally {
        setIsLoading(false); // Oculta el overlay al terminar
    }
};