import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import Etiquetas from './Etiquetas';
import ArbolDistribucion from './ArbolDistribucion';
import SelectorTipoContenido from './SelectorContenido';
import TextareaWithCounter from './textAreaConContador';
import SelectorAutor from './SelectorAutor';
import "./colEditorial.css"
import { useDispatch, useSelector } from 'react-redux';
import { setPais, setProvincia, setMunicipio } from '../../../redux/crearNotaSlice';
import { setDistribucionProioritaria,setNoHome, setFechaVencimiento, setFechaPublicacion, setUrl} from '../../../redux/crearNotaSlice';
import {
    setDistribucionFechaVencimiento,
    setDistribucionComentarios,
    setDistribucionMetaTitulo,
    setDistribucionMetaEngagement,
    setDistribucionXDescripcion,
    setDistribucionYtTitulo,
    setDistribucionYtDescripcion,
    setDistribucionYtLink,
    setDistribucionSearchTitulo,
    setDistribucionSearchDescripcion,
} from '../../../redux/crearNotaSlice';
import SelectorCliente2 from './SelectorCliente2';
import EsDemo from './EsDemo';
import { replace } from 'react-router-dom';
import { obtenerDistribucionGeneracion } from '../../Apis/apis';



const ColumnaEditorial = ({ indice }) => {
    const isCheckedDistribucionPrioritaria = useSelector((state) => state.crearNota.distribucion_prioritaria)
    const isCheckedNoHome = useSelector((state) => state.crearNota.es_home)
    const fechaVence = useSelector((state) => state.crearNota.f_vence)
    const fechaPublicacion = useSelector((state) => state.crearNota.f_pub)
    const provincia = useSelector((state) => state.crearNota.provincia);
    const municipio = useSelector((state) => state.crearNota.municipio);
    const pais = useSelector((state) => state.crearNota.pais);
    const TOKEN = useSelector((state) => state.formulario.token);
    const nota = useSelector((state) => state.crearNota);
    const tituloNota = useSelector((state) => state.crearNota.tituloNota);
    const url = useSelector((state) => state.crearNota.url);
    const distribucionFechaVencimiento = useSelector((state) => state.crearNota.distribucion_fecha_vencimiento);
    const distribucionComentarios = useSelector((state) => state.crearNota.distribucion_comentarios);
    const distribucionMetaTitulo = useSelector((state) => state.crearNota.distribucion_meta_titulo);
    const distribucionMetaEngagement = useSelector((state) => state.crearNota.distribucion_meta_engagement);
    const distribucionXDescripcion = useSelector((state) => state.crearNota.distribucion_x_descripcion);
    const distribucionYtTitulo = useSelector((state) => state.crearNota.distribucion_yt_titulo);
    const distribucionYtDescripcion = useSelector((state) => state.crearNota.distribucion_yt_descripcion);
    const distribucionYtLink = useSelector((state) => state.crearNota.distribucion_yt_link);
    const distribucionSearchTitulo = useSelector((state) => state.crearNota.distribucion_search_titulo);
    const distribucionSearchDescripcion = useSelector((state) => state.crearNota.distribucion_search_descripcion);



    const normaliarAUrl = (titulo) => {
        return titulo
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // saca acentos
            .replace(/\s+/g, "-") // espacios por guiones
            .toLowerCase();
    }

    useEffect(() => {
    console.log("url:", JSON.stringify(url));
    console.log("regex:", /^-\d+$/.test(url?.trim()));

    if (!url || /^-\d+$/.test(url.trim())) {
        console.log("ENTRO");
        const urlLimpia = tituloNota ? normaliarAUrl(tituloNota) : '';
        dispatch(setUrl(urlLimpia));
    }
}, [url, tituloNota]);

    useEffect(() => {
        if (!nota.id_noti) return;

        obtenerDistribucionGeneracion(TOKEN, nota.id_noti).then((datos) => {
            if (!datos || !datos[0]) return;

            dispatch(setDistribucionFechaVencimiento(datos[0].fecha_vencimiento?.slice(0, 10) || ''));
            dispatch(setDistribucionComentarios(datos[0].comentarios || ''));
            dispatch(setDistribucionMetaTitulo(datos[0].meta_titulo || ''));
            dispatch(setDistribucionMetaEngagement(datos[0].meta_engagement || ''));
            dispatch(setDistribucionXDescripcion(datos[0].x_descripcion || ''));
            dispatch(setDistribucionYtTitulo(datos[0].youtube_titulo || ''));
            dispatch(setDistribucionYtDescripcion(datos[0].youtube_descripcion || ''));
            dispatch(setDistribucionYtLink(datos[0].youtube_link_video || ''));
            dispatch(setDistribucionSearchTitulo(datos[0].search_titulo || ''));
            dispatch(setDistribucionSearchDescripcion(datos[0].search_descripcion || ''));
        });
    }, [nota.id_noti, TOKEN]);

    useEffect(() => {
        if (!distribucionMetaTitulo && tituloNota) {
            dispatch(setDistribucionMetaTitulo(tituloNota));
        }
    }, [tituloNota, distribucionMetaTitulo]);

    useEffect(() => {
        if (!distribucionMetaEngagement && nota.bajada) {
            dispatch(setDistribucionMetaEngagement(nota.bajada));
        }
    }, [nota.bajada, distribucionMetaEngagement]);



    const dispatch = useDispatch();
    const dispacharfechaVencimiento = (e) => {
      dispatch(setFechaVencimiento(e.target.value)); 
    };
    const dispacharfechaPublicacion = (e) => {
        dispatch(setFechaPublicacion(e.target.value)); 
    };
    const dispacharUrl = (e) => {
        dispatch(setUrl(normaliarAUrl(e.target.value)));
    }

    const dispacharDistribucionFechaVencimiento = (e) => {
        dispatch(setDistribucionFechaVencimiento(e.target.value));
    };
    const dispacharDistribucionComentarios = (e) => {
        dispatch(setDistribucionComentarios(e.target.value));
    };
    const dispacharDistribucionMetaTitulo = (e) => {
        dispatch(setDistribucionMetaTitulo(e.target.value));
    };
    const dispacharDistribucionMetaEngagement = (e) => {
        dispatch(setDistribucionMetaEngagement(e.target.value));
    };
    const dispacharDistribucionXDescripcion = (e) => {
        dispatch(setDistribucionXDescripcion(e.target.value));
    };
    const dispacharDistribucionYtTitulo = (e) => {
        dispatch(setDistribucionYtTitulo(e.target.value));
    };
    const dispacharDistribucionYtDescripcion = (e) => {
        dispatch(setDistribucionYtDescripcion(e.target.value));
    };
    const dispacharDistribucionYtLink = (e) => {
        dispatch(setDistribucionYtLink(e.target.value));
    };
    const dispacharDistribucionSearchTitulo = (e) => {
        dispatch(setDistribucionSearchTitulo(e.target.value));
    };
    const dispacharDistribucionSearchDescripcion = (e) => {
        dispatch(setDistribucionSearchDescripcion(e.target.value));
    };

    return (
        <div className='col-4 align-self-start col_editorial'>
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="url de la nota"
                    aria-label="Recipient's username"
                    aria-describedby="basic-addon2"
                    value={url}
                    onChange={dispacharUrl}
                />
                <span className="input-group-text" id="basic-addon2">
                    -{nota.id_noti || nota.id_nota_borrador || 'id-nota'}
                </span>
            </div>
            
            <Etiquetas />
            
            <span style={{ fontSize: "20px", fontWeight: "bold", padding: "0px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                Cuenta de la nota:
                <div style={{ marginLeft: "auto" }}>
                    <SelectorCliente2 />
                </div>
            </span>
            
            <div className='row pt-0'>
                <div 
                    className="form-check form_editorial p-0" 
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                    <label 
                        className="form-check-label" 
                        htmlFor="flexCheckDefault" 
                        style={{ fontSize: "20px", fontWeight: "bold", marginRight: "10px", padding: "0px" }}
                    >
                        No home
                    </label>
                    <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="flexCheckChecked1" 
                        checked={isCheckedNoHome == '1'} 
                        onChange={() => dispatch(setNoHome(isCheckedNoHome == '1' ? '0' : '1'))} 
                    />
                </div>

                <EsDemo></EsDemo>

                <div 
                    className="form-check form_editorial p-0" 
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                    <label 
                        className="form-check-label" 
                        htmlFor="flexCheckChecked2" 
                        style={{ fontSize: "20px", fontWeight: "bold", marginRight: "10px" }}
                    >
                        Distribucion prioritaria
                    </label>
                    <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="flexCheckChecked2" 
                        checked={isCheckedDistribucionPrioritaria == '1'} 
                        onChange={() => dispatch(setDistribucionProioritaria(isCheckedDistribucionPrioritaria == '1' ? '0' : '1'))} 
                    />
                </div>
                
                <SelectorAutor />
                
                <ArbolDistribucion
                    TOKEN={TOKEN}
                    pais={pais}
                    provincia={provincia}
                    municipio={municipio}
                    onSetPais={(p) => dispatch(setPais(p))}
                    onSetProvincia={(p) => dispatch(setProvincia(p))}
                    onSetMunicipio={(m) => dispatch(setMunicipio(m))}
                />
                
                <SelectorTipoContenido />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px", padding: "0px" }}>
                    <span style={{ fontSize: "20px", fontWeight: "bold" }}>Fecha Publicacion:</span>
                    <input 
                        type="date" 
                        value={fechaPublicacion} 
                        onChange={dispacharfechaPublicacion} 
                        style={{ fontSize: "20px", fontWeight: "bold" }}
                    />
                </div>
                
                {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px", padding: "0px" }}>
                    <span style={{ fontSize: "20px", fontWeight: "bold" }}>Fecha de vencimiento:</span>
                    <input 
                        type="date" 
                        value={fechaVence} 
                        onChange={dispacharfechaVencimiento} 
                        style={{ fontSize: "20px", fontWeight: "bold" }}
                    />
                </div> */}
                
                {nota.con_distribucion == 1 && (
                    <div className="datosDistribucion">
                        <span className="datosDistribucionTitulo">Datos distribución</span>

                        <div className="datosDistribucionCampo">
                            <label>Fecha vencimiento</label>
                            <input
                                type="date"
                                className="form-control"
                                value={distribucionFechaVencimiento}
                                onChange={dispacharDistribucionFechaVencimiento}
                            />
                        </div>

                        <div className="datosDistribucionCampo">
                            <label>Comentarios</label>
                            <textarea
                                className="form-control"
                                value={distribucionComentarios}
                                onChange={dispacharDistribucionComentarios}
                            />
                        </div>

                        <div className="datosDistribucionPlataforma">META</div>
                        
                        <div className="datosDistribucionCampo">
                            <label>Titulo</label>
                            <input
                                type="text"
                                className="form-control"
                                maxLength={130}
                                value={distribucionMetaTitulo}
                                onChange={dispacharDistribucionMetaTitulo}
                            />
                            <p className="caracteresRestantes">Carácteres restantes: {130 - (distribucionMetaTitulo?.length || 0)}</p>
                        </div>
                        
                        <div className="datosDistribucionCampo">
                            <label>Engagement</label>
                            <input
                                type="text"
                                className="form-control"
                                maxLength={130}
                                value={distribucionMetaEngagement}
                                onChange={dispacharDistribucionMetaEngagement}
                            />
                            <p className="caracteresRestantes">Carácteres restantes: {130 - (distribucionMetaEngagement?.length || 0)}</p>
                        </div>

                        <div className="datosDistribucionPlataforma">X</div>
                        
                        <div className="datosDistribucionCampo">
                            <label>Descripción</label>
                            <textarea
                                className="form-control"
                                maxLength={280}
                                value={distribucionXDescripcion}
                                onChange={dispacharDistribucionXDescripcion}
                            />
                            <p className="caracteresRestantes">Carácteres restantes: {280 - (distribucionXDescripcion?.length || 0)}</p>
                        </div>

                        <div className="datosDistribucionPlataforma">Youtube</div>
                        
                        <div className="datosDistribucionCampo">
                            <label>Titulo</label>
                            <input
                                type="text"
                                className="form-control"
                                maxLength={40}
                                value={distribucionYtTitulo}
                                onChange={dispacharDistribucionYtTitulo}
                            />
                            <p className="caracteresRestantes">Carácteres restantes: {40 - (distribucionYtTitulo?.length || 0)}</p>
                        </div>
                        
                        <div className="datosDistribucionCampo">
                            <label>Descripción</label>
                            <textarea
                                className="form-control"
                                maxLength={90}
                                value={distribucionYtDescripcion}
                                onChange={dispacharDistribucionYtDescripcion}
                            />
                            <p className="caracteresRestantes">Carácteres restantes: {90 - (distribucionYtDescripcion?.length || 0)}</p>
                        </div>
                        
                        <div className="datosDistribucionCampo">
                            <label>Link al video</label>
                            <input
                                type="text"
                                className="form-control"
                                value={distribucionYtLink}
                                onChange={dispacharDistribucionYtLink}
                            />
                        </div>

                        <div className="datosDistribucionPlataforma">Search</div>
                        
                        <div className="datosDistribucionCampo">
                            <label>Titulo</label>
                            <textarea
                                className="form-control"
                                value={distribucionSearchTitulo}
                                onChange={dispacharDistribucionSearchTitulo}
                            />
                        </div>
                        
                        <div className="datosDistribucionCampo">
                            <label>Descripción</label>
                            <textarea
                                className="form-control"
                                value={distribucionSearchDescripcion}
                                onChange={dispacharDistribucionSearchDescripcion}
                            />
                        </div>
                    </div>
                )}
                {/* <TextareaWithCounter/> */}
            </div>
        </div>
    );
};

export default ColumnaEditorial;
