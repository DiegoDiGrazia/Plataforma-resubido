import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Button } from 'react-bootstrap';
import Sidebar from '../sidebar/Sidebar'; // Importa el Sidebar
import "./nota.css";
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatearFecha } from '../Dashboard/datosRelevantes/InteraccionPorNota';
import { formatearTitulo } from '../Dashboard/datosRelevantes/InteraccionPorNota';
import { Spinner } from 'react-bootstrap';
import { left } from '@popperjs/core';
import SelectorCliente from '../Dashboard/SelectorCliente';
import { useCallback } from 'react';
import { editarNota } from './VerNota';
import { resetCrearNota, setClienteNota } from '../../redux/crearNotaSlice';
import { analizarHTML, convertirImagenBase64, setContenidoAEditar, setContenidoNota, setImagenPrincipal, setImagenRRSS, setNotaAEditar } from '../../redux/crearNotaSlice';
import BotonEliminarNota from './Editorial/botonEliminarNota';
import { updateCliente } from '../../redux/formularioSlice';
import BotonCrearNota from './Editorial/BotonCrearNota';

  function obtenerFechaDeManana() {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1); // Incrementa el día en 1
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // Meses de 0 a 11, sumamos 1
    const dia = String(hoy.getDate()).padStart(2, '0'); // Día con 2 dígitos
    return `${año}-${mes}-${dia}`;
}


const NotasParaEditorial = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const editarNota = async (notaABM) => {
    console.log("entro a editarNota");
    dispatch(resetCrearNota());
    dispatch(setNotaAEditar(notaABM));
    dispatch(updateCliente(notaABM.cliente));
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
        const [base64PPAL, base64RRSS] = await Promise.all([
            convertirImagenBase64("https://static.noticiasd.com/img" + notaABM.imagen_principal + "?cb=" + Math.random()),
            convertirImagenBase64("https://static.noticiasd.com/img" + notaABM.imagen_feed + "?cb=" + Math.random())
        ]);

        dispatch(setImagenPrincipal(base64PPAL));
        dispatch(setImagenRRSS(base64RRSS));
    } catch (error) {
        console.error("Error al convertir una o ambas imágenes:", error);
        // Opcional: si querés manejar errores parciales, pasá a Promise.allSettled
        dispatch(setImagenPrincipal(null));
        dispatch(setImagenRRSS(null));
    }

    // ✅ Solo después de que todo se haya procesado, se navega
    navigate("/crearNota");
};

    const CLIENTE = useSelector((state) => state.formulario.cliente);
    const navigate = useNavigate()
    const [filtroSeleccionado, setFiltroSeleccionado] = useState(2); /// botones TODAS LAS NOTAS; EN PROGRESO; FINALIZADAS
    const [numeroDePagina, setNumeroDePagina] = useState(1); /// para los botones de la paginacion
    const [todasLasNotas2, setTodasLasNotas2] = useState([])
    const [verMasUltimo, setVerMasUltimo] = useState(1)
    const verMasCantidadPaginacion = 15
    const [traerNotas, setTraerNotas] = useState(true)
    const [cargandoNotas, setCargandoNotas] = useState(true)
    const es_editor = useSelector((state) => state.formulario.es_editor);


    let CantidadDeNotasPorPagina = 200;


    const botones = [
        { id: 1, nombre: 'Todas las notas (Dashboards)' },
        { id: 2, nombre: 'Publicadas (Edición)' },
        { id: 3, nombre: 'En revision' },
        { id: 4, nombre: 'Borradores' },
        { id: 5, nombre: 'Eliminadas' },
    ];
    
    // Mapeo de categorías
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
        }
    
        axios.post(
            "https://panel.serviciosd.com/app_obtener_noticias",
            {
                cliente: CLIENTE,
                desde: "2020-01-01",
                hasta: fechaDeMañana,
                token: TOKEN,
                categoria: categoria,
                limite: limite,
                desde_limite: desdeLimite,
                titulo: "",
                id: "",
            },
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then((response) => {
            if (response.data.message === "Token Invalido") {
                navigate("/");
                return;
            }
    
            if (response.data.status === "true") {
                setTodasLasNotas2((prev) => [...prev, ...response.data.item]);
            } else {
                console.error('Error en la respuesta de la API:', response.data.message);
            }
        })
        .catch((error) => {
            console.error('Error al hacer la solicitud:', error);
        })
        .finally(() => {
            setCargandoNotas(false);
        });
    }, [CLIENTE, TOKEN, navigate, verMasUltimo]);
    
    const handleFiltroClick = useCallback((id, verMas = false) => {
        console.log("searchQuery", searchQuery);
        setFiltroSeleccionado(id);
        setCargandoNotas(true);
    
        const categoria = categorias[id] || "";
        const limite = verMasCantidadPaginacion;
    
        // IMPORTANTE: usar una variable local para calcular offset
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
    
        axios.post(
            "https://panel.serviciosd.com/app_obtener_noticias_abm",
            {
                cliente: CLIENTE,
                desde: "",
                hasta: "",
                token: TOKEN,
                categoria: categoria,
                limit: limite,
                offset: verMas ? nuevoOffset : 0,  // este es el valor real que irá a la API
                titulo: searchQuery,
            },
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then((response) => {
            if (response.data.message === "Token Invalido") {
                navigate("/");
                return;
            }
    
            if (response.data.status === "true") {
                setTodasLasNotas2((prev) => [...prev, ...response.data.item]);
            } else {
                console.error('Error en la respuesta de la API:', response.data.message);
            }
        })
        .catch((error) => {
            console.error('Error al hacer la solicitud:', error);
        })
        .finally(() => {
            setCargandoNotas(false);
        });
    }, [CLIENTE, TOKEN, categorias, verMasUltimo, verMasCantidadPaginacion]);
    
    
    const ClickearEnCrearNota = (cliente) => {
        dispatch(resetCrearNota());
        dispatch(setClienteNota(cliente))
        navigate("/crearNota");
    };
        
    const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setNumeroDePagina(1);
    };

    const handleSearch = (e) => {
    e.preventDefault(); // Evita el comportamiento predeterminado del formulario
    handleFiltroClick(filtroSeleccionado); // Llama a handleFiltroClick con el filtro seleccionado
    };
    

    const dispatch = useDispatch();

    const TOKEN = useSelector((state) => state.formulario.token);

        

        
    const notasFiltradas = todasLasNotas2.filter(nota =>
        nota.titulo.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
    }, [CLIENTE]);

    return (
                <div className="content flex-grow-1 p-3">
                            <div className='row'>
                                <h4 id="nota">Notas</h4>
                            </div>
                            <div className='row'>
                                <div className='col'>
                                    <h3 id="saludo" className='headerTusNotas'>
                                        <img src="/images/tusNotasIcon.png" alt="Icono 1" className="icon me-2 icono_tusNotas" /> Tus Notas
                                    </h3>
                                    {es_editor &&
                                    <SelectorCliente/> 
                                    }          
                                    <div className='abajoDeTusNotas'> Crea, gestiona y monitorea tus notas</div>
                                </div>
                                <div className='col boton'>
                                    <BotonCrearNota
                                        onClick={() => ClickearEnCrearNota(CLIENTE)}
                                        cliente={CLIENTE}
                                    />
                                </div>
                            </div>

                        <div className='row'>
                            <div className="container">
                            <div className="row">
                            {botones
                                .filter((boton) => !(CLIENTE === "" && boton.id === 1)) // Filtra el botón con id 1 si CLIENTE es ""
                                .map((boton) => (
                                    <div key={boton.id} className="col-auto">
                                        <button
                                            className={`boton_filtro_notas ${
                                                filtroSeleccionado === boton.id ? 'active' : ''
                                            }`}
                                            onClick={() => boton.id != 1 ? handleFiltroClick(boton.id) : handleFiltroClick_todasLasNotas(boton.id)}
                                        >
                                            {boton.nombre}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        </div>
                        {/* todas las notas mas buscador */}
                        <div className='row sin-margin'>
                            <div className="container-notas">
                                <div className='row'>
                                    <div className='col todasLasNotas'>
                                        Todas Las Notas
                                    </div>
                                    <div className='col buscadorNotas'>
                                        <form onSubmit={handleSearch} className='buscadorNotasForm'>
                                            <input
                                                className='inputBuscadorNotas'
                                                type="text"
                                                value={searchQuery}
                                                onChange={handleInputChange}
                                                placeholder="      Buscar por titulo de la nota"
                                            />
                                            <Button type="submit" className="btn btn-danger ml-3">
                                                Buscar
                                            </Button>
                                        </form>
                                        
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-auto' style={{width: "70px"}}></div>
                                    <div className='col-4 columna_interaccion' style={{fontSize: "12px", color: "#667085", fontWeight: "bold"}}>Título de la Nota</div>
                                    <div className='col-1 categoriasNotas text-aling-center'>Estado</div>
                                    <div className='col categoriasNotas d-flex align-items-center justify-content-center'>Categorías</div> 
                                    { (filtroSeleccionado != 1) ?
                                        <>
                                            <div className='col categoriasNotas text-end'>Cliente</div>
                                            <div className='col categoriasNotas text-end'>Ver Nota</div>
                                        </>
                                        :
                                        <>
                                            <div className='col categoriasNotas text-end'>Amplificacion</div>
                                        </>
                                    }

                                </div>
                                {/* aca va la nota */}

                                {notasEnPaginaActual.map((nota, index) => (
                                        <div key={nota.id_noti || nota.term_id || `nota-${index}`} className='row pt-1 borderNotas'>
                                            {((filtroSeleccionado == 2 || filtroSeleccionado == 3) && ///SOlO EN BOTONES 1 y 2
                                                !(filtroSeleccionado == 2 && !es_editor))   &&        /// SI NO ES EDITOR NO PUEDE BORRAR NOTAS PUBLICADAS
                                            <div className='col-auto'>
                                                <BotonEliminarNota id={nota.id} token={TOKEN} />
                                            </div>
                                            }
                                        <div className='col-auto'>
                                            {nota.imagen ? (
                                                <img src={nota.imagen} alt="Icono Nota" className='imagenWidwetInteracciones2' />
                                            ) : (
                                                <img src={"https://panel.serviciosd.com/img/" + nota.imagen_principal} alt="Icono Nota" className='imagenWidwetInteracciones2' />
                                            )}
                                        </div>
                                        <div className='col-4 pt-1 columna_interaccion nuevoFont'>
                                            
                                        {filtroSeleccionado === 1 ? (
                                            <Link
                                                className="link-sin-estilos"
                                                to={`/verNota`}
                                                state={{ id: nota.id_noti ? nota.id_noti : nota.term_id, notaABM: nota }}
                                            >
                                                <div className='row p-0 nombre_plataforma'>
                                                    {formatearTitulo(nota.titulo, 45)}
                                                </div>
                                            </Link>
                                        ) : (
                                            <Link
                                                className="link-sin-estilos"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    editarNota(nota);
                                                }}
                                            >
                                                <div className='row p-0 nombre_plataforma'>
                                                    {formatearTitulo(nota.titulo, 45)}
                                                </div>
                                            </Link>
                                        )}

                                            <div className='row p-0'>
                                                <span className='FechaPubNota'>{nota.f_pub ? formatearFecha(nota.f_pub) : formatearFecha(nota.update_date)}</span>
                                            </div>
                                        </div>
                                        <div className='col-auto d-flex align-items-center'>
                                            <span className="publicada">
                                                <img src="./images/puntoVerde.png" alt="Icono Nota" className='' />
                                                {nota.estado ? " " + nota.estado : " Publicada"}
                                            </span>
                                        </div>
                                        <div className='col-2'>
                                            <span className="categoria_notas">{nota.categorias}</span>
                                        </div>

                                        {filtroSeleccionado != 1 ? (
                                        <>
                                            <div className='col totales_widget'>
                                                <p>{nota.cliente}</p>
                                            </div>
                                            {nota.estado === "PUBLICADO" && (
                                                <div className='col totales_widget' style={{ color: "#007bff"}}>
                                                    <a href={`http://noticiasd.com/nota/${nota.term_id}`} target="_blank" rel="noopener noreferrer">VER NOTA</a>
                                                </div>
                                            )}
                                        </>
                                        ) : (
                                        <div className='col totales_widget'>
                                            <p>{nota.amplificacion}</p>
                                        </div>
                                        )
                                        }

                                    </div>
                                ))}
                                {cargandoNotas && 
                                
                                <div
                                    className='totales'
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        margin: "20px",
                                        marginLeft: "40px"
                                    }}
                                    >
                                    <Spinner color='blue' />
                                </div>

                                }


                            {/* Botonera de paginación */}
                            <div className='row'>
                                <div className="container">
                                <div className="row justify-content-center">
                                    <div className="col-auto text-center my-4">
                                        <button
                                            className="boton_filtro_notas"
                                            onClick={() => filtroSeleccionado != 1 ?  handleFiltroClick(filtroSeleccionado, true) : handleFiltroClick_todasLasNotas(filtroSeleccionado, true)}
                                        >
                                            Ver más
                                        </button>
                                    </div>
                                </div> 
                                </div> 
                                </div>
                            </div>
                        </div>   
                </div>

    );
};

export default NotasParaEditorial;