import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./InteraccionPorNota.css"
import { useSelector, useDispatch } from 'react-redux';
import { filtrarUltimosMeses } from '../../barplot/Barplot';
import { obtenerTopNotas } from '../../Apis/dashboardApi';
import { setNotasMayorInteraccion } from '../../../redux/interaccionesPorNotaSlice';
import { formatNumberMiles } from '../Dashboard.jsx';
import { Link } from 'react-router-dom';

export function formatearTitulo(titulo, corte = 30) {
    return titulo.length > corte ? titulo.slice(0, corte) + "..." : titulo;
}

export function formatearFecha(fechaStr) {
    const [anio, mes, dia] = fechaStr.split('-');
    const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia)); // mes comienza en 0
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

function seleccionarUrlImagenDeUnaNota(url) {

    if (url?.includes("www.noticiasd.com/wp-content")) 
        return url;

    return "https://static.noticiasd.com/img/" + url;
}


const InteraccionPorNota = ({datosLocales, paisFiltro}) => {
    const dispatch = useDispatch();
    const periodos_api = useSelector(state => state.dashboard.periodos_api);
    const cliente_id = useSelector(state => state.formulario.id_cliente);
    const token = useSelector(state => state.formulario.token);
    const FiltroActual = useSelector(state => state.dashboard.filtro);
    const ultimaFechaCargadaBarplot = useSelector(state => state.barplot.ultimaFechaCargadaBarplot);

    useEffect(() => {
        let periodos = periodos_api.split(",");
        let fecha_inicio_creacion = `${periodos[0]}-01`;
        let [anio, mes] = periodos[periodos.length - 1].split("-");
        let ultimo_dia = new Date(anio, mes, 0).getDate(); // mes siguiente (implícito) y día 0 => último día del mes anterior
        let fecha_fin_creacion = `${anio}-${mes}-${ultimo_dia.toString().padStart(2, '0')}`;
        obtenerTopNotas(token, cliente_id, {
            fecha_inicio_creacion,
            fecha_fin_creacion,
            periodos: periodos_api,
            pais_id: paisFiltro?.pais_id
        })
        .then(notas => {
            if (notas) {
                dispatch(setNotasMayorInteraccion(notas));
            }
        })
        .catch(error => console.error('Error al hacer la solicitud:', error));
    }, [cliente_id, ultimaFechaCargadaBarplot, paisFiltro]);




    const notasDeApi = useSelector(state => state.interaccionesPorNota.notasMayorInteraccion); 
    const notasLocales = datosLocales?.notasMayorInteraccion;
    const notasAUsar = notasLocales ? notasLocales : notasDeApi;
    const meses = filtrarUltimosMeses(notasAUsar, FiltroActual, 'periodo');
    let todas_las_notas = meses.flatMap(mes => mes.notas);
    console.log("todas_las_notas", todas_las_notas);

    const agrupado = Object.values(
    todas_las_notas.reduce((acc, item) => {
        const id = item.id_noti;
        const interacciones = Number(item.interacciones ?? item.total);

        if (!acc[id]) {
        acc[id] = { ...item, total: interacciones };
        } else {
        acc[id].total += interacciones;
        }

        return acc;
    }, {})
    );

    console.log("agrupado", agrupado);

    const listaTresNotas = agrupado
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

    console.log("listaTresNotas", listaTresNotas);

    return (
        <div className="container-fluid">
            <div className='row titulo_relevantes'>
                <p>Notas con mayor interacción
                    <img src="/images/help-circle.png" alt="Descripción" className="info-icon no-print" title="Son las notas que despertaron mayores interacciones como comentarios, reacciones y clics y compartidos." />  
                </p>
            </div>
            {listaTresNotas.map((nota, index) => (
                <div className='row seccionInteracciones pt-1' key={index}>
                    <div className='col-1 mr-2'>
                        <img src={seleccionarUrlImagenDeUnaNota(nota.imagen)} alt="Icono" className='imagenWidwetInteracciones2' />
                    </div>
                    <div className='col-8 pt-1'>
                        <Link className="link-sin-estilos" to={`/verNota`} state={{ id: nota.id_noti ? nota.id_noti : nota.term_id, notaABM: nota }}>
                            <div className='row p-0 nombre_plataforma'>{nota.titulo}</div>
                        </Link>
                        <div className='row p-0'>
                            <p className='linkPlataforma'>{formatearFecha(nota.f_pub)}</p>
                        </div>
                    </div>
                    <div className='col totales_widget'>
                        <p>{formatNumberMiles(nota.total)}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InteraccionPorNota;
