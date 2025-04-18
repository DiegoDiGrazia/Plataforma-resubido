import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Button, Modal } from 'react-bootstrap';
import Sidebar from '../sidebar/Sidebar';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import "./nota.css";
import SubtituloNota from './componetesNota/SubtituloNota';
import ParrafoNota from './componetesNota/ParrafoNota';
import TituloNota from './componetesNota/TituloNota';
import { setTituloNota, setContenidoNota, setImagenPrincipal, setIdAtt } from '../../redux/crearNotaSlice';
import { useDispatch, useSelector } from 'react-redux';
import ImagenDeParrafo from './componetesNota/ImagenDeParrafo';
import { Link, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import YoutubeNota from './componetesNota/YoutubeNota';
import Ubicacion from './componetesNota/Ubicacion';
import Embebido from './componetesNota/Embebidos';
import { useLocation } from 'react-router-dom';
import ImagenPrincipal from './componetesNota/ImagenPrincipal';
import CopeteNota from './componetesNota/Copete';


const CrearNota = () => {
    const idUsuario = useSelector((state) => state.formulario.usuario.id); 
    
    const dispatch = useDispatch();
    const [image, setImage] = useState(null);
    const navigate = useNavigate();

    const [cropper, setCropper] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const imageRef = useRef(null);
    const [showButtons, setShowButtons] = useState(false);
    const inputFileRef = useRef(null);

    const toggleButtons = () => {
      setShowButtons(!showButtons);
    };

    const handleClickEnNota = () => {
        inputFileRef.current.click();
    };

    const handleFileChangeEnNota = (event) => {
        const file = event.target.files[0];
        if (file) {
            agregarContenido("imagen", file);
        }
    };

    useEffect(() => {
        const timestamp = Date.now(); // Obtiene el timestamp actual
        dispatch(setIdAtt(idUsuario + "_" + timestamp));
    }, [idUsuario]);

    const agregarContenido = (tipo, contenido = "") => {
        if (tipo === "imagen") {
            const reader = new FileReader();
            reader.onloadend = () => {
                dispatch(setContenidoNota([tipo, reader.result])); // Almacena la imagen en base64
            };
            reader.readAsDataURL(contenido); // Convierte el archivo a base64
        } else {
            dispatch(setContenidoNota([tipo, contenido]));
        }
    };

    useEffect(() => {
        if (imageRef.current && image) {
            if (cropper) {
                cropper.destroy();
            }
            const newCropper = new Cropper(imageRef.current, {
                aspectRatio: NaN,
                viewMode: 3,
            });
            setCropper(newCropper);
        }
    }, [image]);

    const handleCrop = () => {
        if (cropper) {
            const canvas = cropper.getCroppedCanvas();
            dispatch(setImagenPrincipal(canvas.toDataURL()));
            setShowModal(false); // Cierra el modal después de recortar
            setImage(null); // Oculta la imagen original
            cropper.destroy(); // Destruye el cropper
        }
    };


    const esEditor = useSelector((state) => state.formulario.es_editor);
    const contenidoNota = useSelector((state) => state.crearNota.contenidoNota);
    const numeroDeAtachmentAUsar= useSelector((state) => state.crearNota.numeroDeAtachment);
    const id_att = useSelector((state) => state.crearNota.id_att);


    return (
        <div className="container-fluid sinPadding crearNotaGlobal">
            <div className="d-flex h-100">
                <Sidebar estadoActual={"notas"} />
                <div className="content flex-grow-1 crearNotaGlobal">
                    <div className='row'>
                        <div className='col'>
                            <h4 id="nota">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb">
                                        {esEditor ?
                                            <li className="breadcrumb-item"><Link to="/notasEditorial" className='breadcrumb-item'>{'< '} Notas</Link></li>
                                            :
                                            <li className="breadcrumb-item"><Link to="/notas" className='breadcrumb-item'>{'< '} Notas</Link></li>
                                        }
                                        <li className="breadcrumb-item blackActive" aria-current="page">Crear Nota</li>
                                    </ol>
                                </nav>
                            </h4>
                        </div>
                        <div className='col'>
                            <Button onClick={() => navigate('/publicarNota')} id="botonPublicar" variant="none">
                                <img src="/images/send.png" alt="Icono 1" className="icon me-2 icono_tusNotas" />{" Publicar"}
                            </Button>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col mt-0'>
                            <h3 className='headerCrearNota'>Crear nota</h3>
                        </div>
                    </div>
                    {/* SECCION NOTA */}
                    <div className='row notaTutorial'>
                        <div className='col-8 columnaNota'>
                            <ImagenPrincipal />
                            <div className='row'>
                                <TituloNota />
                                <CopeteNota />

                                {contenidoNota &&
                                    contenidoNota.map((contenido, index) => {
                                        const componentes = {
                                        subtitulo: SubtituloNota,
                                        parrafo: ParrafoNota,
                                        imagen: ImagenDeParrafo,
                                        videoYoutube: YoutubeNota,
                                        ubicacion: Ubicacion,
                                        embebido: Embebido,
                                        };

                                    const Componente = componentes[contenido[0]]; // Obtiene el componente correspondiente

                                    return Componente ? <Componente key={index} indice={index} numeroDeAtachmentAUsar = {numeroDeAtachmentAUsar} /> : null; // Renderiza el componente si existe
                                })}

                                {/* BOTONERA AGREGAR CONTENIDO */}
                                <div className="containerButton">
                                    <button onClick={toggleButtons} className={`botones-nota ${showButtons ? 'boton-plus' : ''}`}>
                                        {showButtons ? <img src="images/plus-circle-x.png" alt="" /> : <img src="images/plus-circle-+.png" alt="" />}
                                    </button>

                                    {showButtons && (
                                        <div className="buttons-container">
                                            {/* <button onClick={() => agregarContenido("subtitulo")} className="botones-nota" title='Subtítulo'><img src="images/t-botton.png" alt="" /></button> */}
                                            <button onClick={() => agregarContenido("parrafo")} className="botones-nota" title='Párrafo'><img src="images/Aa-botton.png" alt="" /></button>
                                            <button onClick={handleClickEnNota} className="botones-nota">
                                                <img src="images/image-icon-botton.png" alt="Subir Imagen" />
                                            </button>
        
                                            <input
                                                type="file"
                                                ref={inputFileRef}
                                                style={{ display: 'none' }}
                                                onChange={handleFileChangeEnNota}
                                                accept="image/*"  // Acepta solo archivos de imagen
                                            />
                                            <button onClick={() => agregarContenido("ubicacion")} className="botones-nota"><img src="images/mapaIcon.png" alt="" /></button>
                                            <button onClick={() => agregarContenido("embebido")} className="botones-nota"><img src="images/embebidoImagen.png" alt="" /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Seccion columna izquierda del tutorial */}
                        <div className='col-4 columnaTutorial align-self-start'>
                            <img src="/images/tutorialvideo.png" alt="Icono 1" className="float-right" />
                        </div>
                        {/* fin seccion columna izquierda */}
                    </div>

                    {/* Modal para la imagen */}
                    <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static" dialogClassName="custom-modal">
                        <Modal.Header className='modalHeader'>
                            <Modal.Title>
                                <div className='tituloModal'>Selecciona la posicion de la imagen</div>
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='modalBody'>
                            <div className='subtitulo-modal'>Selecciona el recorte que se utilizara para los canales donde la imagen deba ser adaptada</div>
                            <div className='custom_image_modal'>
                                {image && (
                                    <img
                                        ref={imageRef}
                                        src={image}
                                        alt="Imagen seleccionada"
                                        className='custom_image_modal'
                                    />
                                )}
                            </div>
                        </Modal.Body>
                        <Modal.Footer className='modalFooter'>
                            <div className='row rowModalFooter'>
                                <div className='col text-align-center'>
                                    <Button variant="none" onClick={() => setShowModal(false)} className='botonModalVolver'>
                                        Volver
                                    </Button>
                                </div>
                                <div className='col text-align-center'>
                                    <Button variant="none" onClick={handleCrop} className='botonModalContinuar'>
                                        Continuar
                                    </Button>
                                </div>
                            </div>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default CrearNota;