import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./InteraccionPorNota.css";
import { useSelector, useDispatch } from 'react-redux';
import { obtenerTopCategorias } from '../../Apis/dashboardApi';
import { setCategoriasMayorInteraccion } from '../../../redux/interaccionesPorNotaSlice';
import { formatNumberMiles } from '../Dashboard';
import { filtrarUltimosMeses } from '../../barplot/Barplot';

function reduceBykeyCategorias(lista_medios) {
    let sitios = {};
    for (let medio of lista_medios) {
        if (!sitios[medio.categoria]) {
            sitios[medio.categoria] = {
                ...medio,
                interacciones: Number(medio.interacciones),
                impresiones: Number(medio.interacciones)
            };
        } else {
            sitios[medio.categoria].interacciones += Number(medio.interacciones);
        }
    }
    return sitios;
}

const CategoriasMasRelevantes = ({datosLocales, paisFiltro}) => {
    const cliente_id = useSelector((state) => state.formulario.id_cliente);
    const periodos_api = useSelector((state) => state.dashboard.periodos_api);
    const dispatch = useDispatch();
    const token = useSelector((state) => state.formulario.token);
    const FiltroActual = useSelector((state) => state.dashboard.filtro);
    const ultimaFechaCargadaBarplot = useSelector((state) => state.barplot.ultimaFechaCargadaBarplot);

    useEffect(() => {
        let periodos = periodos_api.split(",");
        let fecha_inicio_creacion = `${periodos[0]}-01`;
        let [anio, mes] = periodos[periodos.length - 1].split("-");
        let ultimo_dia = new Date(anio, mes, 0).getDate(); // mes siguiente (implícito) y día 0 => último día del mes anterior
        let fecha_fin_creacion = `${anio}-${mes}-${ultimo_dia.toString().padStart(2, '0')}`;
        obtenerTopCategorias(token, cliente_id, {
            fecha_inicio_creacion,
            fecha_fin_creacion,
            periodos: periodos_api,
            pais_id: paisFiltro?.pais_id
        })
        .then((categorias) => {
            if (categorias) {
                dispatch(setCategoriasMayorInteraccion(categorias));
            }
        })
        .catch((error) => {
            console.error('Error al hacer la solicitud:', error);
        });
    }, [cliente_id, ultimaFechaCargadaBarplot, paisFiltro]);

    const categoriasPorMes = filtrarUltimosMeses(useSelector(state => state.interaccionesPorNota.categoriasMayorInteraccion || []), FiltroActual, 'periodo');
    const categoriasLocalesPorMes = filtrarUltimosMeses(datosLocales?.tresCategorias || [], FiltroActual, 'periodo');
    let todasLasCategorias = [];
    for (let mes of datosLocales ? categoriasLocalesPorMes : categoriasPorMes) {
        const categoriasDelMes = mes?.categorias ?? mes?.categoria;
        if (Array.isArray(categoriasDelMes)) {
            todasLasCategorias.push(...categoriasDelMes.filter((cat) => cat?.categoria));
        }
    }
    const categoriasSinRepetir = Object.values(reduceBykeyCategorias(todasLasCategorias));
    const listaTresCategorias = categoriasSinRepetir.sort((categoriaA, categoriaB) => Number(categoriaB.interacciones) - Number(categoriaA.interacciones)).slice(0, 3);

    const renderCategoria = (categoria) => (
        <div className='row pt-1' key={categoria.categoria}>
            <div className='col-6 pt-1'>
                <div className='row p-0 nombre_plataforma nombre_categoria'>
                    {categoria.categoria}
                </div>
            </div>
            <div className='col totales_widget impresionesCategorias123'>
                <p>{formatNumberMiles(categoria.interacciones)}</p>
            </div>
        </div>
    );

    return (
        <div className="container-fluid">
            <div className='row titulo_relevantes'>
                <p>Categorías más relevantes
                    <img src="/images/help-circle.png" alt="Descripción" className="info-icon no-print" title="Son las categorías de tu contenido en las que generaste mayores intereses de los usuarios que las vieron." />
                </p>
            </div>
            {listaTresCategorias.map(renderCategoria)}
        </div>
    );
};

export default CategoriasMasRelevantes;