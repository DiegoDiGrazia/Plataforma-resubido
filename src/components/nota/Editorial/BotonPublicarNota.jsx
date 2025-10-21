import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { clickearEnPublicarNota } from '../../../utils/publicarNotaHelper';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { ArchivoContext } from '../../../context/archivoContext';
import  store  from '../../../redux/store'; // o la ruta que tengas definida
import BotonModalIframes from './BotonModalframes';


const BotonPublicarNota = ({ status }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const { archivo } = useContext(ArchivoContext); // video es tipo File
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    

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
    const epigrafeImagenPpal = useSelector((state) => state.crearNota.epigrafeImagenPpal);

    const tipoAutor = useSelector((state) => state.crearNota.autor);
    const pais = useSelector((state) => state.crearNota.pais);
    const id_noti = useSelector((state) => state.crearNota.id_noti);
    const id_att = useSelector((state) => state.crearNota.id_att);
    const clienteActual = useSelector((state) => state.formulario.cliente);
    const clienteDeLaNota = useSelector((state) => state.crearNota.cliente)
    const demo = useSelector((state) => state.crearNota.demo.nombre)
    const cliente = clienteDeLaNota;
    const provinciaSelector = useSelector((state) => state.crearNota.provincia);
    const municipioSelector = useSelector((state) => state.crearNota.municipio);
    const provinciaDelUsuario = useSelector((state) => state.formulario.provinciaUsuario);
    const municipioDelUsuario = useSelector((state) => state.formulario.municipioUsuario);

    const provincia =  provinciaSelector || provinciaDelUsuario
    const municipio = municipioSelector || municipioDelUsuario 

    // Filtrar los attachments para obtener solo los válidos 
    const attachments = useSelector((state) => state.crearNota.atachments);
    const atachmentsValidos = Object.entries(attachments)
        .filter(([key, value]) => value !== null)
        .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});

    const attachmentsArchivos = useSelector((state) => state.crearNota.atachmentsArchivos);
    const atachmentsArchivosValidos = Object.entries(attachmentsArchivos)
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
            if (contenido[0] == "imagen" || (contenido[0] == "video") 
                || (contenido[0] == "archivoPDF") || (contenido[0] == "carrusel")) {
                return html + etiquetaAbrir;
            }
            return html + etiquetaAbrir + contenido[1] + etiquetaCerrar;
        }, '');
    };

    const clickear_en_publicar_nota = async () => {
        const state = store.getState(); // 💡 IMPORTANTE: necesitás importar el store
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
                archivo,
                id_noti,
                id_att,
                cliente,
                demo,
                epigrafeImagenPpal,
                ...atachmentsValidos,
                ...atachmentsArchivosValidos,
                setIsLoading,
                setShowModal,
                navigate,
            });

            if (response.status === "true") {
                setShowModal(true); // Muestra el modal de éxito
            } else {
                throw new Error("Hemos tenido un problema en el servidor, por favor comuníquese con el soporte.");
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
                onClick={() => setShowConfirmModal(true)}
                id="botonPublicar"
                variant="none"
                disabled={isLoading || !imagefeed || !image || categoriasActivas.length < 1}
            >
                <img src="/images/send.png" alt="Icono 1" className="icon me-2 icono_tusNotas" />
                {status === "EN REVISION" ? "Enviar a revisión" : status === "BORRADOR" ? "Guardar borrador" : "Publicar"}
            </Button>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header>
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
                            <p className="mt-3">Por favor, espera mientras enviamos tu nota.</p>
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
                            <p>Tu nota ha sido enviada correctamente.</p>

                            
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setShowModal(false);
                                    navigate(es_editor ? "/notasEditorial" : "/notas"); // Redirigir a la página de notas
                                }}
                            >
                                Ir a Notas
                            </Button>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
            {/* MODAL DE CONFIRMACION */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar publicación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>¿Estás seguro de que querés {status === "EN REVISION" ? "enviar esta nota a revisión" : status === "BORRADOR" ? "guardar el borrador" : "publicar esta nota"}?</p>
                    <p>{ status === "PUBLICADO" && `En la home de ${municipio?.nombre ? municipio?.nombre.toUpperCase() : provincia?.nombre ? provincia?.nombre.toUpperCase() : pais?.nombre.toUpperCase()  }`}</p>
                    {status === "PUBLICADO" && <p>{ clienteDeLaNota ? `y con cliente ${clienteDeLaNota}` : 'y SIN CLIENTE'}</p>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancelar
                    </Button>
                    {/* <BotonModalIframes/> */}
                    <Button variant="primary" onClick={() => {
                        setShowConfirmModal(false);
                        clickear_en_publicar_nota();
                    }}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default BotonPublicarNota;