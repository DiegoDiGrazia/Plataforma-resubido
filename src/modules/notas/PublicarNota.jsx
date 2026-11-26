import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import '@/app/App.css';
import '@/modules/dashboard/Dashboard.css';
import './nota.css';
import './publicarNota.css';
import { useDispatch, useSelector } from 'react-redux';
import { setCategoriasActivasEnStore, setImagenRRSS } from '@/store/crearNotaSlice'; // Asegúrate de importar setImagenPrincipal
import { useNavigate, useParams } from 'react-router-dom';
import ColumnaEditorial from '@/modules/notas/editor/ColumnaEditorial';
import useCategorias from '@/shared/hooks/useCategorias';
import BotonPublicarNota from '@/modules/notas/editor/BotonPublicarNota';
import { videos } from '@/modules/soporte/soporte';
import CardTutorial from '@/shared/components/CardTutorial';
import { setComentario } from '@/store/crearNotaSlice';
import { setSelectedOptionDistribucion } from '@/store/crearNotaSlice';
import { rutaEditor } from './navegacionEditor';
import DropdownFiltro from '@/shared/components/form/DropdownFiltro';
import SelectorFecha from '@/shared/components/form/SelectorFecha';
import useEsMobile from '@/shared/hooks/useEsMobile';
import { setDistribucionFechaVencimiento } from '@/store/distribucionNotaSlice';

const PublicarNota = () => {
    const navigate = useNavigate()
    const { clave } = useParams();
    const dispatch = useDispatch();
    const perfilUsuario = useSelector((state) => state.formulario.usuario.perfil);
    const TOKEN = useSelector((state) => state.formulario.token);
    const imageRef = useRef(null);
    const [cropper, setCropper] = useState(null);
    const image = useSelector((state) => state.crearNota.imagenPrincipal); // Imagen seleccionada
    const imagefeed = useSelector((state) => state.crearNota.imagenRRSS); // Imagen seleccionada  
    const { categorias, categoriasActivas } = useCategorias(TOKEN);
    const [isClickedRecorte, setIsClickedRecorte] = useState(false);
    const comentario = useSelector((state) => state.crearNota.comentarios); // Comentario de la nota
    const con_distribucion = useSelector((state) => state.crearNota.con_distribucion); // Comentario de la nota
    const [isLoading, setIsLoading] = useState(false);
    const esMobile = useEsMobile();
    const fechaVencimientoDistribucion = useSelector((state) => state.distribucionNota.fecha_vencimiento);

    const permisoPublicarNota = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Editorial: Publicacion") || false);
    const permisoBorrador = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Editorial: Borrador") || false);
    const permisoDatosCreacion = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Editorial: Datos creacion") || false);
    const permisoTutorialCreacion = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Editorial: Tutoriales creacion") || false);

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

        dispatch(setCategoriasActivasEnStore(cat_activas)); // Guarda la lista de IDs
    }
    }, []); 

    const selectedOptionDistribucion = con_distribucion == "1" ? "normal" : "ninguna";

    // Función para manejar el cambio de opción seleccionada4
    const handleChange = (event) => {
        if(event.target.id === "normal"){
            dispatch(setSelectedOptionDistribucion(1));}
        else{
            dispatch(setSelectedOptionDistribucion(0));
        }
    };


    const categoriaActiva = (Array.isArray(categorias) ? categorias : []).find((c) => categoriasActivas.includes(c.id));
    const faltaVencimiento = con_distribucion == 1 && !fechaVencimientoDistribucion;

    const avisosYAcciones = (
        <>
        {categoriasActivas.length < 1 && (
            <p className='datoFaltante'>-Seleccione una categoria para poder publicar</p>
        )}
        {!imagefeed && (
            <p className='datoFaltante'>-Seleccione una imagen de portada y su recorte</p>
        )}
        {faltaVencimiento && (
            <p className='datoFaltante'>-Elegí la fecha de vencimiento de la distribución</p>
        )}
        
        <div className='publicarNotaPage__acciones'>
            {permisoBorrador && (
                <BotonPublicarNota status="EN REVISION" isLoading={isLoading} setIsLoading={setIsLoading} />
            )}

            {permisoBorrador && (
                <BotonPublicarNota status="BORRADOR" isLoading={isLoading} setIsLoading={setIsLoading} />
            )}

            {permisoPublicarNota && 
                <BotonPublicarNota 
                    status="PUBLICADO" 
                    isLoading={isLoading} 
                    setIsLoading={setIsLoading} 
                />
            }

            <Button
                onClick={() => navigate(rutaEditor(clave))}
                variant="secondary"
                size="lg"
            >
                Volver
            </Button>

        </div>
        </>
    );

    return (
                <>
                <div className="publicarNotaPage">
                    
                    {/* SECCION NOTA */}
                    <div className='container-fluid publicarNotaPage__cuerpo'>
                    <button
                        type="button"
                        className="btn btn-link publicarNotaPage__volver"
                        onClick={() => navigate(rutaEditor(clave))}
                    >
                        <i className="bi bi-arrow-left" aria-hidden="true" /> Volver a la nota
                    </button>
                    <div className='row notaTutorial'>
                        <div className='col-8 columnaNota'>
                            <section className='publicarNotaPage__seccion'>
                                <h2 className='headerPublicarNota'>Agregar categorias a tu Nota</h2>
                                <p className='abajoDeAgregarCategoria'>Seleccione una categoria clave para tu contenido</p>
                                <DropdownFiltro
                                    label="Categoría"
                                    valorActual={categoriaActiva ? categoriaActiva.unidad : 'Seleccioná una categoría'}
                                    opciones={(Array.isArray(categorias) ? categorias : []).map((categoria) => categoria.unidad)}
                                    onChange={(nombre) => {
                                        const categoria = categorias.find((c) => c.unidad === nombre);
                                        if (categoria) dispatch(setCategoriasActivasEnStore([categoria.id]));
                                    }}
                                    mostrarBuscador={true}
                                />
                            </section>

                            <div className='seccionImagenRecorteRRSS'>
                                <h2 className='imagenParaRRSSHeader'>Imagen para redes sociales</h2>
                                <p className='abajoDeAgregarCategoria'>Selecciona el recorte de tu imagen de portada para que podamos ajustarlo en redes sociales</p>


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
                                            variant={isClickedRecorte ? "primary" : "outline-primary"}
                                            className="mt-3 mb-4"
                                        >
                                            {isClickedRecorte ? "Guardar recorte" : "Editar recorte"}
                                        </Button>

                                {/* SI NO ES FREEMIUM LO MUESTRO */}
                                {perfilUsuario != '9' && 
                                <>
                                <h2 className='hDistribucionContenido'>Distribucion de contenido</h2>
                                <p className='abajoDeAgregarCategoria'>Selecciona el recorte de tu imagen</p>
                                
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
                                        {selectedOptionDistribucion === 'normal' && (
                                            <div className='publicarNotaPage__vencimiento'>
                                                <span className='publicarNotaPage__vencimiento-label'>
                                                    Fecha de vencimiento de la distribución <span className='text-danger'>*</span>
                                                </span>
                                                <SelectorFecha
                                                    bloque
                                                    required
                                                    valor={fechaVencimientoDistribucion || ''}
                                                    onChange={(fecha) => dispatch(setDistribucionFechaVencimiento(fecha))}
                                                />
                                            </div>
                                        )}
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
                                <h2 className='imagenParaRRSSHeader mt-4'>Comentarios</h2>
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
                                {!esMobile && avisosYAcciones}
                            </div>
                            

                        </div>

                        {permisoDatosCreacion && (
                            <ColumnaEditorial/>  
                        )}

                        {esMobile && (
                            <div className='publicarNotaPage__final'>
                                {avisosYAcciones}
                            </div>
                        )}

                        {/* Quien edita cómo se publica la nota (columna editorial) no ve los videos tutoriales */}
                        {permisoTutorialCreacion && !permisoDatosCreacion && (
                            <div className='col-4'>
                                <CardTutorial title = {videos.publicarNota.title} description = {videos.publicarNota.description} src = {videos.publicarNota.src}/>
                            </div>
                        )}

                    </div>
                    </div>
        </div>
        </>
    );
};

export default PublicarNota;
