import axios from 'axios';

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
    fecha,
    itemsEtiquetas,
    engagementText,
    bajadaText,
    tipoAutor,
    provincia,
    municipio,
    pais,
    id_noti,
    id_att,
    cliente,
    setIsLoading,
    setShowModal,
    navigate,
    ...atachments // Captura todos los atachments enviados
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
                parrafo: contenidoHTMLSTR,
                estado: status,
                cliente: datosUsuario.cliente || cliente,
                email: "",
                base_principal: image,
                base_feed: imagefeed,
                comentarios: comentario,
                autor_cliente: datosUsuario.email,
                conDistribucion: selectedOptionDistribucion === 'normal' ? "1" : "0",
                distribucion: selectedOptionDistribucion === 'normal'
                    ? isCheckedDistribucionPrioritaria
                        ? "prioritaria"
                        : "normal"
                    : "ninguna",
                es_demo: isCheckedDemo ? "1" : "0",
                no_home: isCheckedNoHome ? "1" : "0",
                tipo_contenido: tipoContenido,
                fecha_vencimiento: fecha,
                etiquetas: itemsEtiquetas,
                engagement: engagementText,
                bajada: bajadaText,
                autor: tipoAutor,
                provincia: provincia?.nombre || "", // Usa el operador opcional `?.`
                municipio: municipio?.nombre || "", // Usa el operador opcional `?.`
                pais:pais?.nombre || "",
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
            navigate('/notas');
        } else {
            console.error('Error en la respuesta de la API:', response.data.message);
        }
    } catch (error) {
        console.error('Error al hacer la solicitud:', error);
    } finally {
        setIsLoading(false); // Oculta el overlay al terminar
    }
};