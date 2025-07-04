import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { clickearEnPublicarNota } from '../../../utils/publicarNotaHelper';
import { useNavigate } from 'react-router-dom';

const BotonEnGenerarVistaPrevia = ({ status }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [idPreview, setidPreview] = useState(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Obtener los datos necesarios desde el estado global
    const es_editor = useSelector((state) => state.formulario.es_editor);
    const TOKEN = useSelector((state) => state.formulario.token);
    const titulo = useSelector((state) => state.crearNota.tituloNota);
    const contenidoNota = useSelector((state) => state.crearNota.contenidoNota);
    const categoriasActivas = useSelector((state) => state.crearNota.categoriasActivas);
    const notaCargada = useSelector((state) => state.crearNota);
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
    const tipoAutor = useSelector((state) => state.crearNota.autor);
    const pais = useSelector((state) => state.crearNota.pais);
    const id_noti = useSelector((state) => state.crearNota.id_noti);
    const epigrafeImagenPpal = useSelector((state) => state.crearNota.epigrafeImagenPpal);
    const id_att = useSelector((state) => state.crearNota.id_att);
    const clienteActual = useSelector((state) => state.formulario.cliente);
    const clienteDeLaNota = useSelector((state) => state.crearNota.cliente)
    const cliente = clienteDeLaNota;

    const provinciaSelector = useSelector((state) => state.crearNota.provincia);
    const municipioSelector = useSelector((state) => state.crearNota.municipio);
    const provinciaDelUsuario = useSelector((state) => state.formulario.provinciaUsuario);
    const municipioDelUsuario = useSelector((state) => state.formulario.municipioUsuario);
    const provincia = provinciaDelUsuario || provinciaSelector;
    const municipio = municipioDelUsuario || municipioSelector;
    


    const attachments = useSelector((state) => state.crearNota.atachments);


    
    const atachmentsValidos = Object.entries(attachments)
        .filter(([key, value]) => value !== null)
        .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});

    const transformarContenidoAHTML = (contenidos) => {
        if (!contenidos || !Array.isArray(contenidos)) {
            return '';
        }
        return contenidos.reduce((html, contenido) => {
            const etiquetaAbrir = contenido[2];
            const etiquetaCerrar = contenido[3];
            if (contenido[0] === "imagen") {
                return html + etiquetaAbrir;
            }
            return html + etiquetaAbrir + contenido[1] + etiquetaCerrar;
        }, '');
    };

    const clickear_en_publicar_nota = async () => {
        setIsLoading(true);
        setErrorMessage("");

        const contenidoHTMLSTR = transformarContenidoAHTML(contenidoNota);

        try {
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
                id_noti,
                id_att,
                cliente,
                epigrafeImagenPpal,
                ...atachmentsValidos,
                setIsLoading,
                setShowModal,
                navigate,
            });

            if (response.status === "true") {
                setShowModal(true); // Muestra el modal de éxito
                setidPreview(response.item); // Guarda el ID de la vista previa
                console.log("RESPONSE VISTA PREVIA:", response);
            } else {
                throw new Error(response.message || "Error al enviar la nota. Por favor, inténtalo nuevamente.");
            }
        } catch (error) {
            setErrorMessage(error.message || "Ocurrió un error inesperado.");
            setShowModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={clickear_en_publicar_nota}
                className='icono_vistaPrevia' variant="none">
                <img src="/images/iconoOjo.png" alt="Icono 1" className="icon me-2 " />{" Vista previa"}
            </Button>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isLoading
                            ? "Estamos enviando la nota"
                            : errorMessage
                            ? "Error al enviar la nota"
                            : "Nota enviada con éxito"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isLoading ? (
                        <div className="text-center">
                            <p className="mt-3">Por favor, espera mientras estamos generando la vista previa.</p>
                        </div>
                    ) : errorMessage ? (
                        <div className="text-center">
                            <p>{errorMessage}</p>
                            <Button variant="danger" onClick={() => setShowModal(false)}>
                                Cerrar
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p>Mire la vista previa de la nota</p>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setShowModal(false);
                                    window.open("https://noticiasd.com/notaPreview/" + idPreview, "_blank");
                                }}
                            >
                                Vista previa
                            </Button>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default BotonEnGenerarVistaPrevia;