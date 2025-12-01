import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./InteraccionPorNota.css";
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setMediosMayorInteraccion } from '../../../redux/interaccionesPorNotaSlice';
import { formatNumberMiles } from '../Dashboard';
import { seleccionPorFiltro } from '../../barplot/Barplot';

const multiplicador = 1

function formatearTextoNombre(texto) {
    if (texto) {
        let textoCortado = texto.split('.')[0];
        let textoFormateado = textoCortado.charAt(0).toUpperCase() + textoCortado.slice(1).toLowerCase();
        return textoFormateado;
    } else {
        return texto;
    }
}

function reduceBykeyMedios(lista_medios) {
    let sitios = {};
    for (let medio of lista_medios) {
        if (!sitios[medio.sitio]) {
            sitios[medio.sitio] = {
                ...medio,
                impresiones: Number(medio.impresiones) * multiplicador
            };
        } else {
            sitios[medio.sitio].impresiones += Number(medio.impresiones);
        }
    }
    return sitios;
}

const MediosMasRelevantes = ({datosLocales}) => {
    const nombreCliente = useSelector((state) => state.formulario.cliente);
    const periodos_api = useSelector((state) => state.dashboard.periodos_api);
    const dispatch = useDispatch();
    const token = useSelector((state) => state.formulario.token);
    const FiltroActual = useSelector((state) => state.dashboard.filtro);
    let cantidad_meses = seleccionPorFiltro(FiltroActual);
    const ultimaFechaCargadaBarplot = useSelector((state) => state.barplot.ultimaFechaCargadaBarplot);
    console.log("datos adentro de medios", datosLocales)

    let periodos = periodos_api.split(",");
    let fecha_inicio_creacion = `${periodos[0]}-01`;
    let [anio, mes] = periodos[periodos.length - 1].split("-");
    let ultimo_dia = new Date(anio, mes, 0).getDate(); // mes siguiente (implícito) y día 0 => último día del mes anterior
    let fecha_fin_creacion = `${anio}-${mes}-${ultimo_dia.toString().padStart(2, '0')}`;


    useEffect(() => {
        axios.post(
            "https://panel.serviciosd.com/app_obtener_medios",
            {
                cliente: nombreCliente,
                periodos: periodos_api,
                token: token,
                f_pub_desde: fecha_inicio_creacion,
                f_pub_hasta: fecha_fin_creacion,
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        .then((response) => {
            if (response.data.status === "true") {
                dispatch(setMediosMayorInteraccion(response.data.item));
            } else {
                console.error('Error en la respuesta de la API:', response.data.message);
            }
        })
        .catch((error) => {
            console.error('Error al hacer la solicitud:', error);
        });
    }, [nombreCliente, ultimaFechaCargadaBarplot]);

    const meses = useSelector(state => state.interaccionesPorNota.mediosMayorInteraccion || []).slice(cantidad_meses);
    let todas_los_medios = [];
    for (let mes of meses) {
        todas_los_medios.push(...mes.medios);
    }
    const todos_los_medios_sin_repetir = Object.values(reduceBykeyMedios(todas_los_medios));
    const listaTresMedios = todos_los_medios_sin_repetir.sort((medioA, medioB) => Number(medioB.impresiones) - Number(medioA.impresiones)).slice(0, 3);
    console.log(listaTresMedios);

    const renderMedio = (medio) => (
        <div className='row pt-1' key={medio.sitio}>
            <div className='col-auto'>
                <img src={`https://panel.serviciosd.com${medio.imagen}`} alt="Icono 1" className='imagenWidwetInteracciones' />
            </div>
            <div className='col-7 pt-1 ml-2 columnaInteraccion'>
                <div className='row p-0 nombre_plataforma'>
                    {formatearTextoNombre(medio.sitio)}
                </div>
                <div className='row p-0'>
                    <a href={`https://${medio.sitio}`} className='linkPlataforma'>{medio.sitio}</a>
                </div>
            </div>
            <div className='col totales_widget impresionesWidget'>
                <p>{formatNumberMiles(medio.impresiones)}</p>
            </div>
        </div>
    );

    return (
        <div className="container-fluid">
            <div className='row'>
                <p id="titulo_relevantes">Impresiones en medios más relevantes
                    <img src="/images/help-circle.png" alt="Descripción" className="info-icon no-print" title="aca va el texto" />
                </p>
            </div>
            {datosLocales
            ? datosLocales.tresMedios?.map(renderMedio)
            : listaTresMedios.map(renderMedio)
}
        </div>
    );
};

export default MediosMasRelevantes;