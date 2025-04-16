import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Button, Modal } from 'react-bootstrap';
import Sidebar from '../sidebar/Sidebar';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import "./nota.css";
import { useDispatch, useSelector } from 'react-redux';
import { Link} from 'react-router-dom';
import {setImagenRRSS } from '../../redux/crearNotaSlice'; // Asegúrate de importar setImagenPrincipal
import { useNavigate } from 'react-router-dom';
import ColumnaEditorial from './Editorial/ColumnaEditorial';
import { clickearEnPublicarNota } from '../../utils/publicarNotaHelper';
import useCategorias from '../../hooks/useCategorias';
import { use } from 'react';

const PublicarNota = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const notaCargada = useSelector((state) => state.crearNota)
    const [isLoading, setIsLoading] = useState(false);
    const TOKEN = useSelector((state) => state.formulario.token);
    const imageRef = useRef(null);
    const [cropper, setCropper] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null); // Estado para la imagen recortada
    const es_editor = useSelector((state) => state.formulario.es_editor);
    const [estadoPublicar, setEstadoPublicar]= useState('EN REVISION');
    const itemsEtiquetas = useSelector((state) => state.crearNota.etiquetas)
    const isCheckedDemo = useSelector((state) => state.crearNota.es_demo)
    const isCheckedDistribucionPrioritaria = useSelector((state) => state.crearNota.distribucion_prioritaria)
    const isCheckedNoHome = useSelector((state) => state.crearNota.es_home)
    const tipoContenido = useSelector((state) => state.crearNota.tipoContenido); // Verifica si este es el nombre correcto
    const fecha = useSelector((state) => state.crearNota.f_vence)
    const id_noti = useSelector((state) => state.crearNota.id_noti)
    const engagementText = useSelector((state) => state.crearNota.engagement) || "";
    const bajadaText = useSelector((state) => state.crearNota.bajada) || "";
    const tipoAutor = useSelector((state) => state.crearNota.autor); 
    const provincia = useSelector((state) => state.crearNota.provincia);
    const municipio = useSelector((state) => state.crearNota.municipio);
    const cliente = useSelector((state) => state.crearNota.cliente);
    
    const pais = useSelector((state) => state.crearNota.pais);

    const image = useSelector((state) => state.crearNota.imagenPrincipal); // Imagen seleccionada
    const imagefeed = useSelector((state) => state.crearNota.imagenRRSS); // Imagen seleccionada
    const idUsuario = useSelector((state) => state.formulario.usuario.id); 
    const attachments = useSelector((state) => state.crearNota.atachments); 
    const id_att = useSelector((state) => state.crearNota.id_att); 

    const atachmentsValidos = Object.entries(attachments)
    .filter(([key, value]) => value !== null) // Filtrar los que no son null
    .reduce((obj, [key, value]) => {
        obj[key] = value; // Construir un nuevo objeto con los valores válidos
        return obj;
    }, {});



    const { categorias, categoriasActivas, setCategoriasActivas } = useCategorias(TOKEN);
    
    
    const [isClickedRecorte, setIsClickedRecorte] = useState(false);
    const [showModal, setShowModal] = useState(false); // Estado para mostrar el modal
    const [comentario, setComentario] = useState('');

    const manejarCambioComentarios = (e) => {
        setComentario(e.target.value);
    };


    const transformarContenidoAHTML = (contenidos) => {
        if (!contenidos || !Array.isArray(contenidos)) {
            return ''; 
        }
    
        // Construimos el HTML concatenando las etiquetas y el contenido
        const contenidoEnHTML = contenidos.reduce((html, contenido) => {
            const etiquetaAbrir = contenido[2];
            const etiquetaCerrar = contenido[3];
            if(contenido[0] == "imagen"){
                return html + etiquetaAbrir + etiquetaCerrar;
            }
            return html + etiquetaAbrir + contenido[1] + etiquetaCerrar;

        }, '');
    
        return contenidoEnHTML; // Retorna el HTML como un string
    };

    /// subir la nota !!
    const titulo = useSelector((state) => state.crearNota.tituloNota);
    const contenidoNota = useSelector((state) => state.crearNota.contenidoNota)
    const datosUsuario =useSelector((state) => state.formulario)
       const clickear_en_publicar_nota = (status) => {
        setEstadoPublicar(status)
        const contenidoHTMLSTR = transformarContenidoAHTML(contenidoNota);

        clickearEnPublicarNota({
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
            ...atachmentsValidos,
            setIsLoading,
            setShowModal,
            navigate,
        });
    };

    // Inicializa Cropper cuando la imagen cambia
    useEffect(() => {
        if (imageRef.current && image) {
            if (cropper) {
                cropper.destroy(); // Destruye el anterior cropper antes de crear uno nuevo
            }
            const newCropper = new Cropper(imageRef.current, {
                aspectRatio: 1, // Permite cualquier relación de aspecto
                viewMode: 3,
            });
            setCropper(newCropper); // Almacena la nueva instancia de Cropper
        }
    }, [image]);

    const handleCrop = () => {
        if (cropper) {
            const canvas = cropper.getCroppedCanvas();
            const croppedBase64 = canvas.toDataURL(); // Obtiene la imagen recortada en base64
            dispatch(setImagenRRSS(croppedBase64)); // Guarda la imagen recortada en el estado global
            setIsClickedRecorte(true); // Cambia el estado a "clicked"
        }
    };

    const categoriasPorNombre = useSelector((state) => state.crearNota.categoriasNombres) || [];

    useEffect(() => {
    if (categoriasPorNombre.length > 0) {
        const cat_activas = categorias.filter((categoria) => categoriasPorNombre.includes(categoria.unidad))
        .map((categoria) => categoria.id);

        setCategoriasActivas(cat_activas); // Guarda la lista de IDs
    }
    }, []); // Ejecuta cuando cambian las dependencias

    const actualizarCategoriasActivas = (categoria) => {

        if (categoriasActivas.includes(categoria.id)) {
            setCategoriasActivas(categoriasActivas.filter(item => item !== categoria.id));
        } else if (categoriasActivas.length < 3) {
            setCategoriasActivas([...categoriasActivas, categoria.id]);
        }

    };
    const [selectedOptionDistribucion, setSelectedOption] = useState('ninguna');

    // Función para manejar el cambio de opción seleccionada
    const handleChange = (event) => {
      setSelectedOption(event.target.id);
      console.log(event.target.id)
    };

    return (
            <div className="app-container">
                <Sidebar estadoActual={"notas"} />
                <div className="content flex-grow-1 crearNotaGlobal">
                    <header id="head_dash" className='header_dash'>
                        <div className='row'>
                            <div className='col'>
                                <h4 id="nota">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><Link to="/notas" className='breadcrumb-item'>{'< '} Notas</Link></li>
                                        <li className="breadcrumb-item blackActive" aria-current="page">Nueva Nota</li>
                                    </ol>
                                </nav>
                                </h4>
                            </div>
                        </div>
                        
                    </header>
                    
                    {/* SECCION NOTA */}
                    <div className='row notaTutorial'>
                        <div className='col-8 columnaNota'>
                            <div className='col mt-0'>
                                <h3 className='headerPublicarNota fw-bold'>Agregar categorias a tu Nota</h3>
                                <h3 className='abajoDeAgregarCategoria mb-4'>Selecciona las tres categorias claves para tu contenido</h3>
                            </div>
                            <div className='filaCategorias'>
                                {Array.isArray(categorias) && categorias.map((categoria, index) => (
                                    <Button onClick={() => actualizarCategoriasActivas(categoria)} key={index} className={categoriasActivas.includes(categoria.id) ? 'categoriaActiva' : 'categorias' }>
                                        {categoria.unidad}
                                    </Button>
                                ))}
                            </div>

                            <div className='seccionImagenRecorteRRSS'>
                                <h4 className='imagenParaRRSSHeader fw-bold'>Imagen para redes sociales</h4>
                                <h4 className='abajoDeAgregarCategoria mlRRSS'>Selecciona el recorte de tu imagen de portada para que podamos ajustarlo en redes sociales</h4>


                                {(imagefeed && es_editor) && (
                                    <div>                                        
                                    <img
                                    src={imagefeed}
                                    alt="Imagen seleccionada"
                                    className='imagenRRSS'
                                /></div>
                                )}
                                {(image && !(imagefeed && es_editor)) && (
                                    <div className=''>
                                        <img

                                            ref={imageRef}
                                            src={image}
                                            alt="Imagen seleccionada"
                                            className='imagenRRSS'
                                        />
                                       <Button onClick={handleCrop} variant= "none" id= "botonPublicar" className={(isClickedRecorte == false  ?  "recorteSinSeleccionar" :"recorteSeleccionado")}>
                                            {isClickedRecorte == false ? "Seleccionar área de recorte" : "Área recortada para redes"}
                                        </Button> 
                                    </div>
                                )}
                                <div className='hDistribucionContenido'>Distribucion de contenido</div>
                                <div className='abajoDeAgregarCategoria mlRRSS'>Selecciona el recorte de tu imagen</div>

                                <div>
                                    <div className= {selectedOptionDistribucion === 'normal' ? 'containerFormCheckActive' : 'containerFormCheck'}>
                                        <div className="form-check">
                                            <input
                                            className="form-check-input"
                                            type="radio"
                                            name="flexRadioDefault"
                                            id="normal"
                                            checked={selectedOptionDistribucion === 'normal'}
                                            onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="normal">
                                                <p className='distribuirNotaP'><strong>Distribuir nota</strong> {'(Te quedan 2/4 notas en tu plan)'}</p>
                                                <p className='abajoDeAgregarCategoria'>La distribucion de tu nota amplifica el impactoy la llegada a mas usuarios</p>
                                                
                                            </label>
                                        </div>
                                    </div>
                                    <div className={selectedOptionDistribucion === 'ninguna' ? 'containerFormCheckActive' : 'containerFormCheck'}>
                                        <div className="form-check">
                                            <div className='inputRadioContainer'>
                                                <input
                                                className="form-check-input"
                                                type="radio"
                                                name="flexRadioDefault"
                                                id="ninguna"
                                                checked={selectedOptionDistribucion === 'ninguna'}
                                                onChange={handleChange}
                                                />
                                            </div>
                                            <label className="form-check-label" htmlFor="ninguna">
                                                <p className='distribuirNotaP'><strong>No distribuir nota</strong></p>
                                                <p className='abajoDeAgregarCategoria mt-0 mb-0'>Tu contenido será amplificado de forma organica en nuestros canales</p>

                                            </label>
                                        </div>
                                    </div>
                                
                                </div>
                                <h4 className='imagenParaRRSSHeader fw-bold mt-3'>Comentarios</h4>
                                <p className='abajoDeAgregarCategoria'>Deja comentarios para el el equipo de Noticias 'd' pueda ayudarte a potenciar tus contenidos
                                    y entender mejor tus objetivos
                                </p>
                                <textarea
                                    placeholder="Escribí aquí tus comentarios"
                                    className="textAreaComentarios"
                                    maxLength={300}
                                    value={comentario}
                                    onChange={manejarCambioComentarios}
                                />
                                <p className='abajoDeAgregarCategoria' >Max 300 caracteres</p>
                                <div className='mb-5'>
                                    <Button
                                        onClick={() => clickear_en_publicar_nota("EN REVISION")}
                                        id="botonPublicar"
                                        variant="none"
                                        disabled={isLoading || !imagefeed || !image} // Deshabilitar el botón mientras se carga
                                    >
                                        <img src="/images/send.png" alt="Icono 1" className="icon me-2 icono_tusNotas" />{" Enviar a revision"}
                                    </Button>
                                    <Button
                                        onClick={() => clickear_en_publicar_nota("BORRADOR")}
                                        id="botonPublicar"
                                        variant="none"
                                        disabled={isLoading || !imagefeed || !image} // Deshabilitar el botón mientras se carga
                                    >
                                        <img src="/images/send.png" alt="Icono 1" className="icon me-2 icono_tusNotas" />{" Guardar borrador"}
                                    </Button>
                                    
                                    {es_editor &&
                                    <Button
                                        onClick={() => clickear_en_publicar_nota("PUBLICADO")}
                                        id= {"botonPublicar"}
                                        variant="none"
                                        disabled={isLoading || !imagefeed || !image} // Deshabilitar el botón mientras se carga
                                    >
                                        <img src="/images/send.png" alt="Icono 1" className="icon me-2 icono_tusNotas" />{" Publicar"}
                                    </Button>
                                    }
                                    
                                    {!isLoading &&
                                    <Button
                                        onClick={() => navigate('/crearNota')}
                                        id="botonVolver"
                                        variant="none"
                                        disabled={isLoading } // Deshabilitar el botón mientras se carga
                                    >
                                        {" Volver"}
                                    </Button>
                                    }
                                </div>
                                {isLoading && (
                                    <div className="loading-overlay">
                                        <div className="spinner-border text-light" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                    </div>
                                )}

                            </div>
                            

                        </div>

                        {es_editor && <ColumnaEditorial/>}
                    </div>
                </div>
                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header>
                    <Modal.Title>{isLoading ? "Estamos enviando la nota" : "Nota enviada con éxito"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isLoading ? (
                        <div className="text-center">
                            <p className="mt-3">Por favor, espera mientras enviamos tu nota.</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p>Tu nota ha sido enviada correctamente.</p>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setShowModal(false);
                                    navigate(`/notas${es_editor ? "Editorial": ""}`); // Redirige a la página de notas// Redirige a la página de notas
                                }}
                            >
                                Ir a Notas
                            </Button>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
            </div>
    );
};

export default PublicarNota;
