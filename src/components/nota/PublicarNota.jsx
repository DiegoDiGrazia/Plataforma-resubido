import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Button, Modal } from 'react-bootstrap';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { useDispatch, useSelector } from 'react-redux';
import { Link} from 'react-router-dom';
import {setCategoriasActivasEnStore, setImagenRRSS } from '../../redux/crearNotaSlice'; // Asegúrate de importar setImagenPrincipal
import { useNavigate } from 'react-router-dom';
import ColumnaEditorial from './Editorial/ColumnaEditorial';
import useCategorias from '../../hooks/useCategorias';
import BotonPublicarNota from './Editorial/BotonPublicarNota';
import { videos } from '../miPerfil/soporte';
import CardTutorial from '../miPerfil/CardTutorial';
import { setComentario } from '../../redux/crearNotaSlice';
import { setSelectedOptionDistribucion } from '../../redux/crearNotaSlice';
import GuardarNotaCada10SG from './GuardarNotaCada10SG';


const PublicarNota = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const perfilUsuario = useSelector((state) => state.formulario.usuario.perfil);
    const TOKEN = useSelector((state) => state.formulario.token);
    const imageRef = useRef(null);
    const actual = useSelector((state) => state.crearNota);
    const [cropper, setCropper] = useState(null);
    const es_editor = useSelector((state) => state.formulario.es_editor);
    const image = useSelector((state) => state.crearNota.imagenPrincipal); // Imagen seleccionada
    const imagefeed = useSelector((state) => state.crearNota.imagenRRSS); // Imagen seleccionada  
    const { categorias, categoriasActivas, setCategoriasActivas } = useCategorias(TOKEN);
    const [isClickedRecorte, setIsClickedRecorte] = useState(false);
    const comentario = useSelector((state) => state.crearNota.comentarios); // Comentario de la nota
    const con_distribucion = useSelector((state) => state.crearNota.con_distribucion); // Comentario de la nota

    const manejarCambioComentarios = (e) => {
        dispatch(setComentario(e.target.value));
    };

    useEffect(() => {
        console.log(categoriasActivas)
    }, [comentario, categoriasActivas]);

    useEffect(() => {
        if (imageRef.current && image) {
            if (cropper) {
                cropper.destroy(); // Destruye el anterior cropper antes de crear uno nuevo
            }
            const newCropper = new Cropper(imageRef.current, {
                aspectRatio: 1, // Permite cualquier relación de aspecto
                viewMode: 1, // Cambia a "1" para mostrar la imagen completa
                autoCropArea: 1, // Asegura que el área de recorte ocupe toda la imagen
                responsive: true, // Ajusta el cropper al tamaño del contenedor
                zoomable: true, // Permite hacer zoom
                scalable: true, // Permite escalar la imagen
                movable: true, // Permite mover la imagen
            });
            setCropper(newCropper); // Almacena la nueva instancia de Cropper
        }
    }, [image, isClickedRecorte]);

    const handleCrop = () => {
        if (cropper) {
            const canvas = cropper.getCroppedCanvas();
            const croppedBase64 = canvas.toDataURL(); // Obtiene la imagen recortada en base64
            dispatch(setImagenRRSS(croppedBase64)); // Guarda la imagen recortada en el estado global
            setIsClickedRecorte(false); // Cambia el estado a "clicked"
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
            dispatch(setCategoriasActivasEnStore(categoriasActivas.filter(item => item !== categoria.id)));
        } else if (categoriasActivas.length < 3) {
            setCategoriasActivas([categoria.id]);
            dispatch(setCategoriasActivasEnStore([categoria.id]));
        }

    };
    const selectedOptionDistribucion = con_distribucion == "1" ? "normal" : "ninguna";

    // Función para manejar el cambio de opción seleccionada4
    const handleChange = (event) => {
        if(event.target.id === "normal"){
            dispatch(setSelectedOptionDistribucion(1));}
        else{
            dispatch(setSelectedOptionDistribucion(0));
        }
    };

    return (
                <>
                {(actual.estado !== "PUBLICADO" && actual.es_ia === '0') &&    
                    <GuardarNotaCada10sg />
                }
                <div className="content flex-grow-1">
                    <header id="head_dash" className='header_dash'>
                        <div className='row'>
                            <div className='col'>
                                <h4 id="nota">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                    <Link to={!es_editor ? "/notas" : "/notasEditorial"} className="breadcrumb-item">
                                        {'< '} Notas
                                    </Link>
                                    </li>
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
                                <h3 className='abajoDeAgregarCategoria mb-4'>Seleccione una categoria clave para tu contenido</h3>
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


                                {/* Mostrar la imagen recortada si existe y no se está editando */}
                                    {imagefeed && !isClickedRecorte && (
                                        <div>
                                            <img
                                                src={imagefeed}
                                                alt="Imagen recortada"
                                                className='imagenRRSS'
                                            />
                                        </div>
                                    )}

                                    {/* Mostrar la imagen principal para recortar si se está editando */}
                                    {((image && !imagefeed) || isClickedRecorte) && (
                                        <div>
                                            <img
                                                ref={imageRef}
                                                src={image}
                                                alt="Imagen seleccionada"
                                                className='imagenRRSS'
                                            />
                                        </div>
                                    )}
                                       {/* Botón para alternar entre mostrar la imagen recortada y permitir la edición */}
                                        <Button
                                            onClick={() => {
                                                if (isClickedRecorte) {
                                                    // Guardar el recorte
                                                    handleCrop();
                                                } else {
                                                    // Permitir editar el recorte
                                                    dispatch(setImagenRRSS(null)); // Establece imagefeed en null
                                                    setIsClickedRecorte(true);
                                                }
                                            }}
                                            variant="none"
                                            id="botonPublicar"
                                            className={isClickedRecorte ? "recorteSeleccionado" : "recorteSinSeleccionar"}
                                        >
                                            {isClickedRecorte ? "Guardar recorte" : "Editar recorte"}
                                        </Button>

                                {/* SI NO ES FREEMIUM LO MUESTRO */}
                                {perfilUsuario != '9' && 
                                <>
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
                                                <p className='distribuirNotaP'><strong>Distribuir nota</strong> {}</p>
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
                                </>}
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
                                {categoriasActivas.length < 1 && (
                                    <p className='datoFaltante'>-Seleccione una categoria para poder publicar</p>
                                )}
                                {!imagefeed && (
                                    <p className='datoFaltante'>-Seleccione una imagen de portada y su recorte</p>

                                )}
                                
                                <div className='mb-5'>
                                    <BotonPublicarNota status="EN REVISION" />
                                    <BotonPublicarNota status="BORRADOR" />
                                    {es_editor && <BotonPublicarNota status="PUBLICADO" />}
                                    <Button
                                        onClick={() => navigate('/crearNota')}
                                        id="botonVolver"
                                        variant="none"
                                    >
                                        {" Volver"}
                                    </Button>
                                </div>
                            </div>
                            

                        </div>

                        {es_editor ? 
                            <ColumnaEditorial/>  
                            : 
                            <div className='col-4'style={{ paddingRight: "30px"}}>
                                <CardTutorial title = {videos.publicarNota.title} description = {videos.publicarNota.description} src = {videos.publicarNota.src}/>
                            </div>
                        }
                    </div>
        </div>
        </>
    );
};

export default PublicarNota;
