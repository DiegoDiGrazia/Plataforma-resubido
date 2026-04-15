import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Button } from 'react-bootstrap';
import Sidebar from '../sidebar/Sidebar'; // Importa el Sidebar
import "./nota.css";
import "./verNotaMobile.css";
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useEffect } from 'react';
import BarplotNota, { generarPeriodosDesde } from '../barplot/BarplotNota';
import { useLocation, useNavigate } from 'react-router-dom';
import PlataformaMasImpresionesNota from '../Dashboard/datosRelevantes/PlataformaMasImpresionesNota';
import MediosMasRelevantesNotas from '../Dashboard/datosRelevantes/MediosMasRelevantesNotas';
import { formatearFecha } from '../Dashboard/datosRelevantes/InteraccionPorNota';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { traerDatosDeNota } from '../../utils/buscarEnLocal';
import "./nota_print.css"
import { obtenerResumenDashboardNota } from '../administrador/gestores/apisUsuarios';
import PlataformaMasImpresiones from '../Dashboard/datosRelevantes/PlataformaMasImpresiones';
import IframeNota from './IframeNota';
import IframeNotaEscalable  from './IframeNotaEscalable';
export const RUTA = "http://localhost:4000/"
const VerNota = () => {

    const [cargando, setCargando] = useState(true)
    const location = useLocation();
    const { id, notaABM } = location.state || {};
    const [Nota, setNota] = useState({});
    const [FPUB, setFPUB] = useState("");
    const { id_ruta } = useParams();
    const [dataLocalNota, setdataLocalNota] = useState(null);
    const [resumenNota, setResumenNota] = useState([])
    const [loadingUsuarios, setLoadingUsuarios] = useState(false)
    
    ///ELEGIR UN ID
    const id_para_api= id_ruta ? id_ruta : id
    const id_noti = id_para_api
    const es_demo = id_ruta ? true : false
    const TOKEN_ESTADO = useSelector((state) => state.formulario.token);
    const [TOKEN, setTOKEN] = useState(TOKEN_ESTADO)
    const [CLIENTE, setCLIENTE] = useState("");

    useEffect(() => {
        if (!id_para_api) return;
        traerDatosDeNota(id_para_api).then((data) => {
        setdataLocalNota(data);
        });
    }, [id_para_api]);

    useEffect(() => {
        setLoadingUsuarios(true);
    
        obtenerResumenDashboardNota(TOKEN, id_noti)
            .then((res) => {
                setResumenNota(res);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setLoadingUsuarios(false);
            });
    
        }, [TOKEN, id_noti]);

        useEffect(() => { 
            console.log('Resumen Nota:' , resumenNota)
        }, [resumenNota]);
    
    useEffect(() => {
        // Evita ejecutar si el ID no está definido
        if (!id_para_api) return;
            axios.post("https://panel.serviciosd.com/app_obtener_noticia", {
                token: TOKEN,
                id_noti: id_para_api
            }, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            .then((response) => {
                if (response.data.status === "true") {
                    console.log(response.data);
                    setNota(response.data.item[0]);
                    setFPUB(response.data.item[0].f_pub || "");
                    setCLIENTE(response.data.item[0].cliente);
                } else {
                    console.error('Error en la API:', response.data.message);
                }
            })
            .catch((error) => {
                console.error('Error al obtener noticia:', error);
            })
            .finally(() => {
                setCargando(false); // Finaliza la carga
            });
        
    }, [id_para_api, es_demo]);
    
    console.log(Nota)



    if(!Nota){
        return <div>Cargando...</div>
    }
    return (

        <div id='pantalla-verNota'>
             {!cargando && 
                <div className="content flex-grow-1">
                    <div className='row p-0'>
                        <div className='col'>
                            <h4 id="nota">
                            {!es_demo &&
                            <nav aria-label="breadcrumb no_print">
                                <ol className="breadcrumb no_print">
                                    <li className="breadcrumb-item"><Link to="/notas" className='breadcrumb-item'>{'< '} Notas</Link></li>
                                    <li className="breadcrumb-item blackActive" aria-current="page">Ver Nota</li>
                                </ol>
                            </nav>
                            }
                            </h4>
                            <row>
                                <img src={"/images/imagenParaReportes.png"} alt="Icono 1" className="imagenParaReporte" />

                            </row>
                        </div>
                    </div>
                        <div className='row margin_vn '>
                            <div className='col imagen_col'>
                                    <img src={Nota.imagen.includes('noticiasd') ? Nota.imagen : "https://static.noticiasd.com/img" + Nota.imagen} alt="Icono 1" className="imagen_nota" />
                            </div>
                            <div className='col-6 d-flex flex-column' style={{ height: "200px" }}>
                                <div className='row vn_titulo'>{Nota.titulo}</div>
                                <div className='row vn_fecha'> Publicada el {formatearFecha(Nota.f_pub)} </div>
                                <div className='row publicada'> 
                                <span className="publicada">
                                        <img src={"/images/puntoVerde.png"} alt="" className='' />
                                        {Nota.estado ?   "   " + Nota.estado  :   "   Publicada" }
                                </span>
                                </div>
                                <div className='row order-last flex-grow-1'>
                                    <div>
                                        <span className='vn_categoria'>{Nota.categorias}</span>
                                    </div>
                                </div>
                            </div>
                            <div className='col boton_nota d-flex justify-content-center align-items-center no_print'>
                                {!es_demo &&
                                <button className="btn custom-dropdown-button dropdown-toggle boton_compartir" onClick={() => window.print()}
                                type="button" id="descargar-reporte">
                                    <img src="/images/share_icon.png" alt="Icono 1" className="icon me-2" />
                                    Descargar reporte
                                </button>
                                }
                                {/* {notaABM && !notaABM.id_noti && !es_demo &&
                                <button className="btn custom-dropdown-button boton_compartir" type="button" onClick={() => editarNota(notaABM)}>
                                    Editar
                                </button>
                                } */}
                            </div>
                            {/* <div className='col-2 ver_nota_boton'>
                                    <button className='ver_nota_boton'> 
                                    <img src="/images/ver_nota_boton.png" alt="Icono 1" className="" />
                                    </button> 
                            </div> */}
                        </div>
                    <div className="subtitulo">
                        <h5 id= "subtitulo_performance">Performance de la nota</h5>
                    </div>
                    <div className="mb-2 tamaño_barplot">
                            { <BarplotNota id_noti={id_noti} TOKEN={TOKEN} cliente={CLIENTE} fpub={FPUB} dataLocalNota = {dataLocalNota?.usuarioDeNota} resumenNota = {resumenNota}/> } 
                    </div>
                     <div className='datos-resumen row g-1'>
                        <div className='col-lg-12 col-xl col-6 m-2 back-white'>
                            <PlataformaMasImpresiones resumenCliente = {resumenNota} loading ={loadingUsuarios}/>
                        </div>
                        <div className='col-lg-12 col-xl col-6 m-2 back-white'>
                            {<MediosMasRelevantesNotas id_noti={id_noti} TOKEN={TOKEN} cliente={CLIENTE} fpub={FPUB} dataLocalNota = {dataLocalNota?.mediosNoticia}/>}   
                        </div>
                    </div>
                    <div className='row g-1'>
                        <h2 className='tituloCreativo'>Creativos DV 360</h2>
                        <div className='col-lg-12 col-xl col-6 m-2 back-white'>
                            <div className='row g-1'>
                                <div className='col-lg-12 col-xl col-6 m-2 back-white ms-5'>
                                    <IframeNota url={`https://builder.ntcias.de/preview.php?id_noti=${id_noti}`} width={350} height={250} title={'350 x 250'}  />
                                </div>
                                <div className='col-lg-12 col-xl col-6 m-2 back-white ms-5'>
                                    <IframeNota url={`https://builder.ntcias.de/preview.php?id_noti=${id_noti}`} width={320} height={50} title={'320 x 50'} />
                                </div>
                                <div className='iframe-w col-lg-12 col-xl col-6 m-2 back-white ms-5'>
                                    <IframeNota url={`https://builder.ntcias.de/preview.php?id_noti=${id_noti}`} width={728} height={90} title={'728 x 90'} />
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-12 col-xl col-6 m-2 back-white ms-5'>
                            <IframeNota url={`https://builder.ntcias.de/preview.php?id_noti=${id_noti}`} width={300} height={600} title={'300 x 600'} />
                        </div>
                    </div>
                    <div className='row g-1'>
                        <h2 className='tituloCreativo'>Creativos Facebook</h2>
                        <div className='col-lg-12 col-xl col-6 m-2 back-white ms-5'>
                            <IframeNota url={`https://builder.ntcias.de/preview.php?template=feed_face&id_noti=${id_noti}`} width={340} height={500} baseHeight={500} baseWidth={340} title='Feed'/>
                        </div>
                        <div className='col-lg-12 col-xl col-6 m-2 back-white ms-5'>
                            <IframeNota url={`https://builder.ntcias.de/preview.php?template=instream_face&id_noti=${id_noti}`} width={340} height={500} baseHeight={500} baseWidth={340} title='instream reels'/>
                        </div>
                    </div>
                    <div className='row g-1'>
                        <h2 className='tituloCreativo'>Creativos Instagram</h2>
                        <div className='col-lg-12 col-xl col-6 m-2 back-white ms-5'>
                            <IframeNota url={`https://builder.ntcias.de/preview.php?template=feed_insta&id_noti=${id_noti}`} width={340} height={500} baseHeight={500} baseWidth={340} title='Feed'/>
                        </div>
                        <div className='col-lg-12 col-xl col-6 m-2 back-white ms-5'>
                            <IframeNota url={`https://builder.ntcias.de/preview.php?template=explore_insta&id_noti=${id_noti}`} width={340} height={500} baseHeight={500} baseWidth={340} title='Explorar'/>
                        </div>
                    </div>

                    <div className='row g-1'>
                        <h2 className='tituloCreativo'>Creativos Historias</h2>
                        <div className='col-lg-12 col-xl col-6 m-2 back-white ms-5'>
                            <IframeNotaEscalable 
                            url={`https://reporte.noticiasd.com/creativo/${id_noti}?tipo=1`} 
                            width={360} 
                            height={640} 
                            baseWidth={720} 
                            baseHeight={1280}
                            />                       
                        </div>
                        <div className='col-lg-12 col-xl col-6 m-2 back-white ms-5'>
                            <IframeNotaEscalable 
                            url={`https://reporte.noticiasd.com/creativo/${id_noti}?tipo=2`} 
                            width={360} 
                            height={640} 
                            baseWidth={720} 
                            baseHeight={1280}
                            />                       
                        </div>

                    </div>
                </div>
                }
            </div>

    );
};

export default VerNota;