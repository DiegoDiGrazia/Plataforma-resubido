import axios from 'axios';


function escapeHTML(str) {
    return str
        .replace(/'/g, '"'); // Reemplaza comillas simples por comillas dobles
}
export const clickearEnPublicarNota = async ({
    status,
    TOKEN,
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
    epigrafeImagenPpal,
    setIsLoading,
    setShowModal,
    navigate,
    ...atachments
}) => {
    try {
        setIsLoading(true); // Muestra el overlay
        setShowModal(true); // Muestra el modal de carga

        const response = await axios.post(
            "https://panel.serviciosd.com/app_subir_nota",
            {
                token: TOKEN,
                status: status,
                id: id_noti ? id_noti : "0",
                titulo: titulo,
                categorias: categoriasActivas,
                copete: notaCargada.copete,
                parrafo: escapeHTML(contenidoHTMLSTR),
                estado: status,
                cliente: datosUsuario.cliente || cliente,
                email: "",
                base_principal: image,
                base_feed: imagefeed,
                comentarios: comentario,
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
                no_home: isCheckedNoHome,
                tipo_contenido: tipoContenido,
                f_pub: fechaPublicacion,
                fecha_vencimiento: fecha,
                etiquetas: itemsEtiquetas,
                engagement: engagementText,
                extracto: bajadaText,
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