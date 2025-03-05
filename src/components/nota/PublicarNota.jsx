import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Button, Modal } from 'react-bootstrap';
import Sidebar from '../sidebar/Sidebar';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import "./nota.css";
import { useDispatch, useSelector } from 'react-redux';
import ImagenDeParrafo from './componetesNota/ImagenDeParrafo';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { DeleteContenidoPorIndice, setCategorias, setContenidoNota, setImagenPrincipal, setImagenRRSS } from '../../redux/crearNotaSlice'; // Asegúrate de importar setImagenPrincipal
import { useNavigate } from 'react-router-dom';
import ColumnaEditorial from './Editorial/ColumnaEditorial';

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
    

    
    

    const [comentario, setComentario] = useState('');

    const manejarCambioComentarios = (e) => {
        setComentario(e.target.value);
    };

    const image = useSelector((state) => state.crearNota.imagenPrincipal); // Imagen seleccionada
    const imagefeed = useSelector((state) => state.crearNota.imagenRRSS); // Imagen seleccionada


    useEffect(() => {
        // if(es_editor == true){
        //     setStatus("publish")
        // }
        axios.post(
            "https://panel.serviciosd.com/app_obtener_listado_categorias",
            
            {
                token: TOKEN,          
                dimension: "categorias",
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data' // Asegúrate de que el tipo de contenido sea correcto
                }
            }
        )
        .then((response) => {
            if (response.data.status === "true") {
                console.log(response.data.item)
                dispatch(setCategorias(response.data.item));
            } else {
                console.error('Error en la respuesta de la API:', response.data.message);
            }

        })
        .catch((error) => {
            console.error('Error al hacer la solicitud:', error);
        });

    },[]); // Dependencias del useEffect

    const transformarContenidoAHTML = (contenidos) => {
        if (!contenidos || !Array.isArray(contenidos)) {
            return ''; // Si no hay contenidos, devuelve un string vacío
        }
    
        // Construimos el HTML concatenando las etiquetas y el contenido
        const contenidoEnHTML = contenidos.reduce((html, contenido) => {
            const etiquetaAbrir = contenido[2];
            const etiquetaCerrar = contenido[3];
            return html + etiquetaAbrir + contenido[1] + etiquetaCerrar;
        }, '');
    
        return contenidoEnHTML; // Retorna el HTML como un string
    };

    /// subir la nota !!
    const titulo = useSelector((state) => state.crearNota.tituloNota);
    const contenidoNota = useSelector((state) => state.crearNota.contenidoNota)
    const datosUsuario =useSelector((state) => state.formulario)
    const clickear_en_publicar_nota = (status) => {
        setIsLoading(true); // Muestra el overlay
        const contenidoHTMLSTR = transformarContenidoAHTML(contenidoNota);
        console.log(itemsEtiquetas, "ETIQUETAS")
    
        axios.post(
            "https://panel.serviciosd.com/app_subir_nota",
            {
                token: TOKEN, // CARGADO
                status: status, // Es el que decide si la notas e publica en wp"" CARGADO
                id: "0",  
                titulo: titulo,// CARGADO
                categorias: categoriasActivas, //CARGADO
                copete: notaCargada.copete, //CARGADO
                parrafo: contenidoHTMLSTR, //CARGADO
                estado: estadoPublicar, //CARGADO
                cliente: datosUsuario.cliente, //CARGADO
                email: datosUsuario.email, //CARGADO
                base_principal: image, //CARGADO
                base_feed: imagefeed, //CARGADO
                comentarios: comentario, //CARGADO
                autor_cliente: datosUsuario.email, //CARGADO
                conDistribucion: selectedOptionDistribucion === 'normal' ? "1" : "0", //Cargado
                distribucion: selectedOptionDistribucion === 'normal' ? isCheckedDistribucionPrioritaria ? "prioritaria" : "normal" : "ninguna", //Cargado
                es_demo: isCheckedDemo ? "1" : "0", //Cargado
                es_home: isCheckedNoHome ? "1" : "0", //Cargado
                tipo_contenido: tipoContenido, //Cargado
                fecha_vencimiento: fecha, //Cargado
                etiquetas: itemsEtiquetas,  //CARGADO
                engagement : engagementText,
                bajada: bajadaText,
                autor: tipoAutor,
                provincia: provincia.nombre,
                municipio: municipio.nombre
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        .then((response) => {
            if (response.data.status === "true") {
                navigate('/notas');
            } else {
                console.error('Error en la respuesta de la API:', response.data.message);
            }
        })
        .catch((error) => {
            console.error('Error al hacer la solicitud:', error);
        })
        .finally(() => {
            setIsLoading(false); // Oculta el overlay al terminar
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
        }
    };
    
    const categorias = useSelector((state) => state.crearNota.categorias) || [];
    const [categoriasActivas, setCategoriasActivas] = useState([]);
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

                                {image && (
                                    <div className='imagenRRSS'>
                                        <img

                                            ref={imageRef}
                                            src={image}
                                            alt="Imagen seleccionada"
                                            className='imagenRRSS'
                                        />
                                        {/* ESTE HANDLE CROP LO TENGO QUE HACER AL CLICKEAR EN EL BOTON PUBLICAR */}
                                        {/* <Button onClick={handleCrop} className='botonModalContinuar'>
                                            Recortar Imagen
                                        </Button> */}
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
                                        onClick={() => clickear_en_publicar_nota()}
                                        id="botonPublicar"
                                        variant="none"
                                        disabled={isLoading} // Deshabilitar el botón mientras se carga
                                    >
                                        <img src="/images/send.png" alt="Icono 1" className="icon me-2 icono_tusNotas" />{" Enviar a revision"}
                                    </Button>
                                    
                                    {es_editor &&
                                    <Button
                                        onClick={() => clickear_en_publicar_nota("publish")}
                                        id="botonPublicar"
                                        variant="none"
                                        disabled={isLoading} // Deshabilitar el botón mientras se carga
                                    >
                                        <img src="/images/send.png" alt="Icono 1" className="icon me-2 icono_tusNotas" />{" Publicar"}
                                    </Button>
                                    }
                                    
                                    {!isLoading &&
                                    <Button
                                        onClick={() => navigate('/crearNota')}
                                        id="botonVolver"
                                        variant="none"
                                        disabled={isLoading} // Deshabilitar el botón mientras se carga
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
            </div>
    );
};

export default PublicarNota;
