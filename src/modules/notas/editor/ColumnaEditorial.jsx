import React, { useEffect, useRef } from 'react';
import SelectorFecha from '@/shared/components/form/SelectorFecha';
import { separarFechaHora, unirFechaHora, horaActual, hoy } from '@/shared/utils/fechaPublicacion';
import 'cropperjs/dist/cropper.css';
import Etiquetas from './Etiquetas';
import ArbolDistribucion from '@/shared/components/ArbolDistribucion';
import SelectorTipoContenido from './SelectorContenido';
import SelectorAutor from './SelectorAutor';
import "./colEditorial.css"
import { useDispatch, useSelector } from 'react-redux';
import { setPais, setProvincia, setMunicipio } from '@/store/crearNotaSlice';
import { setDistribucionProioritaria,setNoHome, setFechaPublicacion, setUrl} from '@/store/crearNotaSlice';
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
    setDistribucionDiferida,
    setDistribucionFechaDiferida,
    setDistribucionHoraDiferida,
    setDistribucionIdNotaCargada,
    setEstadoDistribucion,
} from '@/store/distribucionNotaSlice';
import SelectorCliente2 from './SelectorCliente2';
import EsDemo from './EsDemo';
import { obtenerDistribucionGeneracion } from '@/api/apis';
import DistribucionGeneracionFields from './DistribucionGeneracionFields';
import { normaliarAUrl } from '@/shared/utils/normalizarUrl';
import { extraerDiferidaDesdeUltimaActualizacion } from '@/shared/utils/distribucionGeneracion';



const ColumnaEditorial = () => {
    const isCheckedDistribucionPrioritaria = useSelector((state) => state.crearNota.distribucion_prioritaria)
    const isCheckedNoHome = useSelector((state) => state.crearNota.es_home)
    const fechaPublicacion = useSelector((state) => state.crearNota.f_pub)
    const provincia = useSelector((state) => state.crearNota.provincia);
    const municipio = useSelector((state) => state.crearNota.municipio);
    const pais = useSelector((state) => state.crearNota.pais);
    const TOKEN = useSelector((state) => state.formulario.token);
    const nota = useSelector((state) => state.crearNota);
    const tituloNota = useSelector((state) => state.crearNota.tituloNota);
    const url = useSelector((state) => state.crearNota.url);
    const distribucionFechaVencimiento = useSelector((state) => state.distribucionNota.fecha_vencimiento);
    const distribucionComentarios = useSelector((state) => state.distribucionNota.comentarios);
    const distribucionMetaTitulo = useSelector((state) => state.distribucionNota.meta_titulo);
    const distribucionMetaEngagement = useSelector((state) => state.distribucionNota.meta_engagement);
    const distribucionXDescripcion = useSelector((state) => state.distribucionNota.x_descripcion);
    const distribucionYtTitulo = useSelector((state) => state.distribucionNota.yt_titulo);
    const distribucionYtDescripcion = useSelector((state) => state.distribucionNota.yt_descripcion);
    const distribucionYtLink = useSelector((state) => state.distribucionNota.yt_link);
    const distribucionSearchTitulo = useSelector((state) => state.distribucionNota.search_titulo);
    const distribucionSearchDescripcion = useSelector((state) => state.distribucionNota.search_descripcion);
    const distribucionDiferida = useSelector((state) => state.distribucionNota.diferida);
    const distribucionFechaDiferida = useSelector((state) => state.distribucionNota.fecha_diferida);
    const distribucionHoraDiferida = useSelector((state) => state.distribucionNota.hora_diferida);
    const distribucionIdNotaCargada = useSelector((state) => state.distribucionNota.id_nota_cargada);



    useEffect(() => {
        if (!url || /^-\d+$/.test(url.trim())) {
            const urlLimpia = tituloNota ? normaliarAUrl(tituloNota) : '';
            dispatch(setUrl(urlLimpia));
        }
    }, [url, tituloNota]);

    useEffect(() => {
        if (!nota.id_noti) return;
        // Ya se cargó (o se restauró de un borrador local): no pisar los cambios del usuario
        if (String(distribucionIdNotaCargada) === String(nota.id_noti)) return;

        obtenerDistribucionGeneracion(TOKEN, nota.id_noti).then((datos) => {
            if (!datos || !datos[0]) {
                dispatch(setDistribucionIdNotaCargada(nota.id_noti));
                return;
            }
            const dato = datos[0];
            const diferida = extraerDiferidaDesdeUltimaActualizacion(dato.ultima_actualizacion);
            // Una sola acción: el editor la toma como "carga" y no como cambio del usuario
            dispatch(setEstadoDistribucion({
                fecha_vencimiento: dato.fecha_vencimiento?.slice(0, 10) || '',
                comentarios: dato.comentarios || '',
                meta_titulo: dato.meta_titulo || '',
                meta_engagement: dato.meta_engagement || '',
                x_descripcion: dato.x_descripcion || '',
                yt_titulo: dato.youtube_titulo || '',
                yt_descripcion: dato.youtube_descripcion || '',
                yt_link: dato.youtube_link_video || '',
                search_titulo: dato.search_titulo || '',
                search_descripcion: dato.search_descripcion || '',
                diferida: diferida.diferida,
                fecha_diferida: diferida.fecha_diferida,
                hora_diferida: diferida.hora_diferida,
                id_nota_cargada: nota.id_noti,
            }));
        });
    }, [nota.id_noti, TOKEN]);

    // Autocompletan meta_titulo/meta_engagement una sola vez (al cargar la nota), para no
    // pisar un campo que el usuario dejó vacío a propósito.
    const yaAutocompletoMetaTitulo = useRef(false);
    const yaAutocompletoMetaEngagement = useRef(false);

    useEffect(() => {
        if (!yaAutocompletoMetaTitulo.current && !distribucionMetaTitulo && tituloNota) {
            dispatch(setDistribucionMetaTitulo(tituloNota));
            yaAutocompletoMetaTitulo.current = true;
        }
    }, [tituloNota, distribucionMetaTitulo]);

    useEffect(() => {
        if (!yaAutocompletoMetaEngagement.current && !distribucionMetaEngagement && nota.bajada) {
            dispatch(setDistribucionMetaEngagement(nota.bajada));
            yaAutocompletoMetaEngagement.current = true;
        }
    }, [nota.bajada, distribucionMetaEngagement]);



    const dispatch = useDispatch();
    // f_pub = "YYYY-MM-DD HH:mm:ss": fecha y hora se editan por separado
    const { fecha: fechaPub, hora: horaPub } = separarFechaHora(fechaPublicacion);
    const cambiarFechaPublicacion = (fecha) => {
        dispatch(setFechaPublicacion(unirFechaHora(fecha, horaPub || horaActual())));
    };
    const cambiarHoraPublicacion = (e) => {
        dispatch(setFechaPublicacion(unirFechaHora(fechaPub || hoy(), e.target.value)));
    };
    const dispacharUrl = (e) => {
        dispatch(setUrl(normaliarAUrl(e.target.value)));
    }

    const setterDistribucion = {
        fecha_vencimiento: setDistribucionFechaVencimiento,
        comentarios: setDistribucionComentarios,
        meta_titulo: setDistribucionMetaTitulo,
        meta_engagement: setDistribucionMetaEngagement,
        x_descripcion: setDistribucionXDescripcion,
        youtube_titulo: setDistribucionYtTitulo,
        youtube_descripcion: setDistribucionYtDescripcion,
        youtube_link_video: setDistribucionYtLink,
        search_titulo: setDistribucionSearchTitulo,
        search_descripcion: setDistribucionSearchDescripcion,
        diferida: setDistribucionDiferida,
        fecha_diferida: setDistribucionFechaDiferida,
        hora_diferida: setDistribucionHoraDiferida,
    };

    const dispacharCampoDistribucion = (campo, valor) => {
        const accion = setterDistribucion[campo];
        if (accion) dispatch(accion(valor));
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
            
            <div className="colEditorial__fila colEditorial__fila--compacta">
                <span className="colEditorial__label">Cuenta de la nota:</span>
                <SelectorCliente2 />
            </div>

            <div className='row pt-0'>
                <div className="form-check form_editorial colEditorial__fila p-0">
                    <label
                        className="form-check-label colEditorial__label"
                        htmlFor="flexCheckChecked1"
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

                <div className="form-check form_editorial colEditorial__fila p-0">
                    <label
                        className="form-check-label colEditorial__label"
                        htmlFor="flexCheckChecked2"
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
                
                <div className="colEditorial__fila colEditorial__fila--separada p-0">
                    <label htmlFor="fecha-publicacion" className="colEditorial__label">Fecha Publicacion:</label>
                    <div className="colEditorial__fechaHora">
                        <SelectorFecha
                            id="fecha-publicacion"
                            valor={fechaPub}
                            onChange={cambiarFechaPublicacion}
                            alineacionDerecha
                        />
                        <input
                            id="hora-publicacion"
                            type="time"
                            className="form-control form-control-sm colEditorial__hora"
                            aria-label="Hora de publicación"
                            value={horaPub}
                            onChange={cambiarHoraPublicacion}
                        />
                    </div>
                </div>
                
                {nota.con_distribucion == 1 && (
                    <DistribucionGeneracionFields
                        valores={{
                            fecha_vencimiento: distribucionFechaVencimiento,
                            comentarios: distribucionComentarios,
                            meta_titulo: distribucionMetaTitulo,
                            meta_engagement: distribucionMetaEngagement,
                            x_descripcion: distribucionXDescripcion,
                            youtube_titulo: distribucionYtTitulo,
                            youtube_descripcion: distribucionYtDescripcion,
                            youtube_link_video: distribucionYtLink,
                            search_titulo: distribucionSearchTitulo,
                            search_descripcion: distribucionSearchDescripcion,
                            diferida: distribucionDiferida,
                            fecha_diferida: distribucionFechaDiferida,
                            hora_diferida: distribucionHoraDiferida,
                        }}
                        onChange={dispacharCampoDistribucion}
                        ocultarFechaVencimiento
                    />
                )}
                {/* <TextareaWithCounter/> */}
            </div>
        </div>
    );
};

export default ColumnaEditorial;
