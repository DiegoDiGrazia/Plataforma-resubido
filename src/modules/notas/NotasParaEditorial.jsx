import React from 'react';
import { Button } from 'react-bootstrap';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatearFecha } from '@/modules/dashboard/datosRelevantes/InteraccionPorNota';
import { Spinner } from 'react-bootstrap';
import SelectorCliente from '@/shared/components/SelectorCliente';
import { useCallback } from 'react';
import { resetCrearNota, setClienteNota, setIdNoti } from '@/store/crearNotaSlice';
import { convertirImagenBase64, setContenidoAEditar, setImagenPrincipal, setImagenRRSS, setNotaAEditar } from '@/store/crearNotaSlice';
import BotonEliminarNota from '@/modules/notas/editor/botonEliminarNota';
import BotonEditarDistribucionGeneracion from '@/modules/notas/editor/BotonEditarDistribucionGeneracion';
import { updateCliente, updateIdCliente, updateNotaFreemiumDistribucion } from '@/store/formularioSlice';
import BotonCrearNota from '@/modules/notas/editor/BotonCrearNota';
import "./nota.css";
import './notasListado.css';
import ModalConInputFile from '@/shared/components/modales/ModalConInputFile';
import { guardarVideoYoutube } from '@/api/apisUsuarios';
import ModalMensaje from '@/shared/components/modales/ModalMensaje';
import { obtenerNotaCompletaConIa, obtenerFuenteBot, obtenerNoticias, obtenerNoticiasAbm } from '@/api/apisUsuarios';
import { abrirEditorNota } from '@/modules/notas/navegacionEditor';
import BorradoresLocales from './BorradoresLocales';

  function obtenerFechaDeManana() {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1); // Incrementa el día en 1
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // Meses de 0 a 11, sumamos 1
    const dia = String(hoy.getDate()).padStart(2, '0'); // Día con 2 dígitos
    return `${año}-${mes}-${dia}`;
}

const convertirVideoBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file); // 👈 convierte a base64

    reader.onload = () => {
      resolve(reader.result); // esto es el base64
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
};


const NotasParaEditorial = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [mostrarModalYoutube, setMostrarModalYoutube] = useState(false)
    const [videoYoutube, setVideoYoutube] = useState(null)
    const [fechaYoutube, setFechaYoutube] = useState('')
    const [idNotaYoutube, setIdNotaYoutube] = useState('')
    const [mostrarMensaje, setMostrarMensaje] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const TOKEN = useSelector((state) => state.formulario.token);

    const editarNota = async (notaABM, seDuplica) => {
        console.log("notaABM en editarNota", notaABM);
        if (notaABM.es_ia == '1' && notaABM.parrafo == "<p></p>") {
            setMensaje(`Obteniendo nota completa con IA, esto puede tardar unos segundos...
            En brevedad usted podra editar la nota con toda la informacion y contenido que se genero con IA`);
            setMostrarMensaje(true)
            const nota = await obtenerNotaCompletaConIa(TOKEN, notaABM.id, notaABM.term_id);
            if (nota === 'Sin fondos OpenAI') {
                setMensaje('No tiene fondos suficientes en OpenAI para obtener el contenido completo de la nota');
                setMostrarMensaje(true);
                return;
            }
            notaABM = nota
            
        }
        dispatch(resetCrearNota());
        dispatch(setNotaAEditar(notaABM));
        dispatch(updateCliente(notaABM.cliente));
        dispatch(updateIdCliente(notaABM.id_cliente));

        
        if (seDuplica) {
            dispatch(setIdNoti("0"));
        }
        // Procesar el contenido HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(notaABM.parrafo, 'text/html');
        const nodes = doc.body.childNodes;
        const contenido = [];

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];

            if (node.nodeType === 1) { // ELEMENT_NODE
                const tag = node.tagName.toUpperCase();

                if (tag === 'IFRAME' || tag === 'BLOCKQUOTE') {
                    contenido.push(["embebido", node.outerHTML, "", ""]);
                } else {
                    contenido.push(["parrafo", node.outerHTML, "", ""]);
                }
            } else if (node.nodeType === 3) { // TEXT_NODE
                const trimmed = node.textContent.trim();
                if (trimmed) {
                    contenido.push(["parrafo", trimmed, "", ""]);
                }
            }
    }

    dispatch(setContenidoAEditar(contenido));
    try {
        const base64PPAL = await convertirImagenBase64("https://static.noticiasd.com/img" + notaABM.imagen_principal + "?cb=" + Math.random());
        dispatch(setImagenPrincipal(base64PPAL));
    } catch (error) {
        console.error("Error al convertir la imagen principal:", error);
        dispatch(setImagenPrincipal(null));
    }

    try {
        const base64RRSS = await convertirImagenBase64("https://static.noticiasd.com/img" + notaABM.imagen_feed + "?cb=" + Math.random());
        dispatch(setImagenRRSS(base64RRSS));
    } catch (error) {
        console.error("Error al convertir la imagen de RRSS:", error);
        dispatch(setImagenRRSS(null));
    }

    // ✅ Solo después de que todo se haya procesado, se navega
    abrirEditorNota({ dispatch, navigate, idNota: seDuplica ? null : notaABM.id });
};
    const editarNotaFreemium = async (notaABM) => {
        dispatch(updateNotaFreemiumDistribucion(notaABM));
        navigate("/distribuir-nota-freemium");
    }

    const CLIENTE = useSelector((state) => state.formulario.cliente);
    const ID_CLIENTE = useSelector((state) => state.formulario.id_cliente);
    const navigate = useNavigate()
    const [filtroSeleccionado, setFiltroSeleccionado] = useState(2); /// botones TODAS LAS NOTAS; EN PROGRESO; FINALIZADAS
    const [numeroDePagina, setNumeroDePagina] = useState(1); /// para los botones de la paginacion
    const [todasLasNotas2, setTodasLasNotas2] = useState([])
    const [verMasUltimo, setVerMasUltimo] = useState(1)
    const idPais = useSelector((state) => state.formulario.usuario.id_pais)
    const verMasCantidadPaginacion = 15
    const [cargandoNotas, setCargandoNotas] = useState(true);
    const id_pais = useSelector((state) => state.formulario.usuario.id_pais);
    const paises = useSelector((state) =>state.formulario.geo);
    const nombrePaisUsuario = paises.find(pais => pais.pais_id === id_pais)?.nombre || null;
    const perfilUsuario = useSelector((state) => state.formulario.usuario.perfil);
    
    const permisoSelectorClientes = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Editorial: Selector clientes") || false);
    const permisoBorrado = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Editorial: Borrado") || false);
    const permisoEdicion = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Editorial: Edicion") || false);

    let CantidadDeNotasPorPagina = 200;
    const botones = [
        { id: 2, nombre: 'Publicaciones' },
        { id: 3, nombre: 'En revision' },
        { id: 4, nombre: 'Borradores' },
        { id: 5, nombre: 'Eliminadas' },
    ];
    
    const categorias = {
        1: "todas",
        2: "PUBLICADO",
        3: "EN REVISION",
        4: "BORRADOR",
        5: "ELIMINADO"
    };
    
    const fechaDeMañana = obtenerFechaDeManana(); // Obtener la fecha de mañana al cargar el componente
    const handleFiltroClick_todasLasNotas = useCallback((id, verMas = false) => {

    setFiltroSeleccionado(id);
    setCargandoNotas(true);

    const categoria = categorias[id] || "";
    let desdeLimite = 0;
    let limite = verMasCantidadPaginacion;

    if (verMas) {
        const siguientePagina = verMasUltimo + 1;
        desdeLimite = verMasUltimo * verMasCantidadPaginacion;
        setVerMasUltimo(siguientePagina);
    } else {
        setTodasLasNotas2([]);              
        setVerMasUltimo(1);                 
        desdeLimite = 0;                     
    }

    obtenerNoticias(TOKEN, {
        cliente: CLIENTE,
        id_cliente: ID_CLIENTE,
        desde: "2020-01-01",
        hasta: fechaDeMañana,
        categoria: categoria,
        limite: limite,
        desde_limite: desdeLimite,
        titulo: "",
        id: "",
    })
    .then((data) => {
        if (data.message === "Token Invalido") {
            navigate("/");
            return;
        }

        if (data.status === "true") {
            setTodasLasNotas2((prev) => [...prev, ...data.item]);
        } else {
            console.error('Error en la respuesta de la API:', data.message);
        }
    })
    .catch((error) => {
        console.error('Error al hacer la solicitud:', error);
    })
    .finally(() => {
        setCargandoNotas(false);
    });
}, [ID_CLIENTE, TOKEN, navigate, verMasUltimo, categorias, verMasCantidadPaginacion]);
    
    const handleFiltroClick = useCallback((id, verMas = false) => {
        console.log("searchQuery", searchQuery);
        console.log(nombrePaisUsuario, idPais, paises)
        setFiltroSeleccionado(id);
        setCargandoNotas(true);
    
        const categoria = categorias[id] || "";
        const limite = verMasCantidadPaginacion;
        let nuevoOffset = 0;
        let nuevoVerMasUltimo = verMasUltimo;
    
        if (verMas) {
            nuevoOffset = verMasUltimo * verMasCantidadPaginacion;
            nuevoVerMasUltimo = verMasUltimo + 1;
            setVerMasUltimo(nuevoVerMasUltimo); // esto actualiza el estado para la próxima vez
        } else {
            setTodasLasNotas2([]);
            nuevoVerMasUltimo = 1;
            setVerMasUltimo(1);
        }
    
        obtenerNoticiasAbm(TOKEN, {
            cliente: CLIENTE,
            id_cliente: ID_CLIENTE,
            desde: "",
            hasta: "",
            categoria: categoria,
            limit: limite,
            offset: verMas ? nuevoOffset : 0,  // este es el valor real que irá a la API
            titulo: isNaN(searchQuery) ? searchQuery : "",
            pais: nombrePaisUsuario || "",
            full: "1",
            term_id: !isNaN(searchQuery) ? searchQuery : "",
        })
        .then((data) => {
            if (data.message === "Token Invalido") {
                navigate("/");
                return;
            }

            if (data.status === "true") {
                setTodasLasNotas2((prev) => [...prev, ...data.item]);
            } else {
                console.error('Error en la respuesta de la API:', data.message);
            }
        })
        .catch((error) => {
            console.error('Error al hacer la solicitud:', error);
        })
        .finally(() => {
            setCargandoNotas(false);
        });
    }, [ID_CLIENTE, TOKEN, categorias, verMasUltimo, verMasCantidadPaginacion, nombrePaisUsuario]);


    const ClickearEnCrearNota = () => {
        dispatch(resetCrearNota());
        dispatch(setClienteNota({ nombre: CLIENTE, id: ID_CLIENTE }))
        abrirEditorNota({ dispatch, navigate });
    };
        
    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
        setNumeroDePagina(1); 
    };

    const handleSearch = (e) => {
    e.preventDefault(); // Evita el comportamiento predeterminado del formulario
    handleFiltroClick(filtroSeleccionado); // Llama a handleFiltroClick con el filtro seleccionado
    };
    

    const subirVideo = async (id) => {
    setMostrarMensaje(true)
    try {
        if (!videoYoutube) {
        setMensaje('No hay video')
        return;
        }
        setMensaje('Cargando video')

        const videob64 = await convertirVideoBase64(videoYoutube);
        await guardarVideoYoutube(TOKEN, videob64, fechaYoutube, id);
        setMensaje('Video subido correctamente')

    } catch (error) {
        setMensaje('No se ha pudido subir el video')
        console.error(error);
    }
    };

    const dispatch = useDispatch();

    
    const notasFiltradas = todasLasNotas2;

    const totalPaginas = Math.ceil(notasFiltradas.length / CantidadDeNotasPorPagina);
    let notasEnPaginaActual = notasFiltradas.slice(
        (numeroDePagina - 1) * CantidadDeNotasPorPagina,
        numeroDePagina * CantidadDeNotasPorPagina
    );

    const listaBotonesPagina = [];
    for (let i = 1; i <= totalPaginas; i++) {
        listaBotonesPagina.push(i);
      }

    
    console.log(notasEnPaginaActual)
    

    ///Chat gpt
    useEffect(() => {
        if (filtroSeleccionado !== 1) {
            handleFiltroClick(filtroSeleccionado); // Ejecuta la función solo si filtroSeleccionado no es 1
        } else {
            handleFiltroClick_todasLasNotas(filtroSeleccionado); // Llama a la función específica para el caso de id = 1
        }
    }, [filtroSeleccionado, ID_CLIENTE]);

    const mostrarFuenteNota = async (term_id) => {
        const link = await obtenerFuenteBot(TOKEN, term_id);
        console.log("link fuente", link);
        setMensaje(`
            La fuente de esta nota es: ${link[0].url}
            Título: ${link[0].titulo}
            Provincia: ${link[0].provincia}
            Ciudad: ${link[0].ciudad}
            Imagen: ${link[0].imagen}
            `);
        setMostrarMensaje(true);
    };

    return (
        <div id='pantalla-notasParaEditorial'>
            <div className="content flex-grow-1 nd-px-page pt-4 pb-5">

                <header className='notasListado__encabezado' id='menu-boton'>
                    <div className='notasListado__titulo'>
                        <h3 id="saludo" className='headerTusNotas'>
                            <i className="bi bi-stack" aria-hidden="true" /> Tus Notas
                        </h3>
                        {permisoSelectorClientes && (
                            <SelectorCliente/>
                        )}
                    </div>
                    <BotonCrearNota
                        onClick={ClickearEnCrearNota}
                        cliente={CLIENTE}
                    />
                </header>

                <BorradoresLocales />

                <nav className='notasListado__tabs' id='filtroNotas'>
                    {botones
                        .filter((boton) => !(CLIENTE === "" && boton.id === 1)) // Filtra el botón con id 1 si CLIENTE es ""
                        .map((boton) => (
                            <button
                                key={boton.id}
                                className={`boton_filtro_notas ${
                                    filtroSeleccionado === boton.id ? 'active' : ''
                                }`}
                                onClick={() => setFiltroSeleccionado(boton.id)}
                            >
                                {boton.nombre}
                            </button>
                        ))}
                </nav>

                {/* todas las notas mas buscador */}
                <div className="container-notas">
                    <div className='notasListado__barra' id='buscador'>
                        <div className='todasLasNotas'>
                            Todas Las Notas
                        </div>
                        <form onSubmit={handleSearch} className='buscadorNotasForm gap-2'>
                            <input
                                className='inputBuscadorNotas'
                                type="text"
                                value={searchQuery}
                                onChange={handleInputChange}
                                placeholder="Buscar por título de la nota o id..."
                            />
                            <Button type="submit" variant="secondary">
                                Buscar
                            </Button>
                        </form>
                    </div>

                    <div className='notasListado__fila notasListado__fila--encabezado' id='headerListadoNotas'>
                        <div className='notasListado__imagen'></div>
                        <div className='notasListado__titulo-nota'>Título de la nota</div>
                        <div className='notasListado__categoria'>Categorías</div>
                        <div className='notasListado__cuenta'>{filtroSeleccionado != 1 ? 'Cuenta' : 'Amplificación'}</div>
                        <div className='notasListado__acciones'>{filtroSeleccionado != 1 && 'Acciones'}</div>
                    </div>

                    {notasEnPaginaActual.map((nota, index) => (
                        <div
                            key={nota.id_noti || nota.term_id || `nota-${index}`}
                            className={`notasListado__fila borderNotas ${nota.editable == '1' ? '' : 'notaNoEditable'}`}
                        >
                            <div className='notasListado__imagen'>
                                {nota.imagen  ? (
                                    nota.imagen.includes('wp-content/uploads') ?
                                    <img src={nota.imagen} alt="" className='imagenWidwetInteracciones2' /> :
                                    <img src={'https://noticiasd.com/img' + nota.imagen} alt="" className='imagenWidwetInteracciones2' />
                                ) : (
                                    <img src={"https://panel.serviciosd.com/img/" + nota.imagen_principal} alt="" className='imagenWidwetInteracciones2' />
                                )}
                            </div>
                            <div className='notasListado__titulo-nota'>
                                <Link
                                    className="link-sin-estilos"
                                    onClick={(e) => {
                                        if(nota?.editable == '1') {
                                        e.preventDefault();
                                        editarNota(nota);
                                        }
                                    }}
                                >
                                    <div className='nombre_plataforma'>
                                        {nota.titulo}
                                    </div>
                                </Link>
                                <span className='FechaPubNota'>{nota.f_pub ? formatearFecha(nota.f_pub) : formatearFecha(nota.update_date)}</span>
                            </div>
                            <div className='notasListado__categoria'>
                                <span className="categoria_notas" title={nota.categorias}>{nota.categorias}</span>
                            </div>

                            <div className='notasListado__cuenta'>
                                <p>{nota.cliente}</p>
                            </div>

                            <div className='notasListado__acciones'>
                                {nota.estado === "PUBLICADO" && (
                                    <a href={`http://noticiasd.com/nota/${nota.term_id}`} title="Ver nota" target="_blank" rel="noopener noreferrer">
                                        <i className="bi bi-eye-fill" aria-hidden="true"></i>
                                    </a>
                                )}
                                {perfilUsuario === "1" &&  CLIENTE != "" && ///MODIFICAR A 9 DESPUES DE LAS PRUEBAS
                                    <button className="notasListado__botonIcono" title="Distribuir nota"
                                        onClick={() => editarNotaFreemium(nota, true)}
                                    >
                                        <img src="/images/prisma.png" alt="" />
                                    </button>
                                }

                                { nota.con_distribucion === 1 &&
                                <Link
                                    title="Gráfico de interacciones"
                                    className="link-sin-estilos"
                                    to={nota?.editable == '1' ? `/verNota` : `#`}
                                    state={{ id: nota.id_noti ? nota.id_noti : nota.term_id, notaABM: nota }}
                                >
                                    <i className="bi bi-bar-chart-line-fill" aria-hidden="true"></i>
                                </Link>
                                }

                                {permisoEdicion && (
                                    <>
                                        <button className="notasListado__botonIcono" title="Video de YouTube"
                                            onClick={() => {
                                                setMostrarModalYoutube(true);
                                                setIdNotaYoutube(nota.id);
                                            }}
                                            >
                                            <i className="bi bi-youtube" aria-hidden="true"></i>
                                        </button>

                                        <button className="notasListado__botonIcono" title="Duplicar nota"
                                            onClick={() => editarNota(nota, true)}
                                            >
                                            <i className="bi bi-back" aria-hidden="true"></i>
                                        </button>
                                    </>
                                )}

                                { nota.es_ia == "1" &&
                                <button className="notasListado__botonIcono" title="Obtener fuente"
                                    onClick={() => mostrarFuenteNota(nota.term_id)}
                                    >
                                    <i className="bi bi-menu-button-wide" aria-hidden="true"></i>
                                </button>
                                }

                                {nota.estado === "PUBLICADO" && (
                                    <BotonEditarDistribucionGeneracion id_generacion={nota.id} token={TOKEN} />
                                )}

                                {permisoBorrado &&
                                (
                                    <BotonEliminarNota id={nota.id} token={TOKEN}></BotonEliminarNota>
                                )}
                            </div>
                        </div>
                    ))}
                    {cargandoNotas &&
                        <div className='d-flex justify-content-center m-4'>
                            <Spinner color='blue' />
                        </div>
                    }

                    <ModalConInputFile show={mostrarModalYoutube} titulo={'Elija un video para youtube'} actualFile={videoYoutube}
                                        setFile={setVideoYoutube} AlGuardar={() => subirVideo(idNotaYoutube)} onClose={() =>setMostrarModalYoutube(false)} youtube={true}
                                        fecha = {fechaYoutube} setFecha = {setFechaYoutube}>
                    </ModalConInputFile>
                    <ModalMensaje show= {mostrarMensaje} mensaje={mensaje} onClose={() => {setMostrarMensaje(false); setMostrarModalYoutube(false)}}></ModalMensaje>

                    {/* Botonera de paginación */}
                    <div className='notasListado__ver-mas' id='verMas'>
                        <Button
                            variant="outline-secondary"
                            onClick={() => filtroSeleccionado != 1 ?  handleFiltroClick(filtroSeleccionado, true) : handleFiltroClick_todasLasNotas(filtroSeleccionado, true)}
                        >
                            Ver más
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotasParaEditorial;