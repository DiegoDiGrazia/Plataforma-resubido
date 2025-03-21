import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./InteraccionPorNota.css";
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setCategoriasMayorInteraccion } from '../../../redux/interaccionesPorNotaSlice';
import { formatNumberMiles } from '../Dashboard';
import { seleccionPorFiltro } from '../../barplot/Barplot';

function reduceBykeyCategorias(lista_medios) {
    let sitios = {};
    for (let medio of lista_medios) {
        if (!sitios[medio.categoria]) {
            sitios[medio.categoria] = {
                ...medio,
                impresiones: Number(medio.impresiones)
            };
        } else {
            sitios[medio.categoria].impresiones += Number(medio.impresiones);
        }
    }
    return sitios;
}

const CategoriasMasRelevantes = () => {
    const nombreCliente = useSelector((state) => state.formulario.cliente);
    const periodos_api = useSelector((state) => state.dashboard.periodos_api);
    const dispatch = useDispatch();
    const token = useSelector((state) => state.formulario.token);
    const FiltroActual = useSelector((state) => state.dashboard.filtro);
    const ultimaFechaCargadaBarplot = useSelector((state) => state.barplot.ultimaFechaCargadaBarplot);
    let cantidad_meses = seleccionPorFiltro(FiltroActual);

    useEffect(() => {
        axios.post(
            "https://panel.serviciosd.com/app_obtener_categorias",
            {
                cliente: nombreCliente,
                periodos: periodos_api,
                token: token
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        .then((response) => {
            if (response.data.status === "true") {
                dispatch(setCategoriasMayorInteraccion(response.data.item));
            } else {
                console.error('Error en la respuesta de la API:', response.data.message);
            }
        })
        .catch((error) => {
            console.error('Error al hacer la solicitud:', error);
        });
    }, [nombreCliente, ultimaFechaCargadaBarplot]);

    const categoriasPorMes = useSelector(state => state.interaccionesPorNota.categoriasMayorInteraccion || []).slice(cantidad_meses);
    let todasLasCategorias = [];
    for (let mes of categoriasPorMes) {
        todasLasCategorias.push(...mes.categoria);
    }
    const categoriasSinRepetir = Object.values(reduceBykeyCategorias(todasLasCategorias));
    const listaTresCategorias = categoriasSinRepetir.sort((categoriaA, categoriaB) => Number(categoriaB.impresiones) - Number(categoriaA.impresiones)).slice(0, 3);

    const renderCategoria = (categoria) => (
        <div className='row pt-1' key={categoria.categoria}>
            <div className='col-6 pt-1'>
                <div className='row p-0 nombre_plataforma nombre_categoria'>
                    {categoria.categoria}
                </div>
            </div>
            <div className='col totales_widget impresionesCategorias123'>
                <p>{formatNumberMiles(categoria.impresiones)}</p>
            </div>
        </div>
    );

    return (
        <div className="container-fluid">
            <div className='row'>
                <p id="titulo_relevantes">Categorías más relevantes
                    <img src="/images/help-circle.png" alt="Descripción" className="info-icon no-print" title="aca va el texto" />
                </p>
            </div>
            {listaTresCategorias.map(renderCategoria)}
        </div>
    );
};

export default CategoriasMasRelevantes;