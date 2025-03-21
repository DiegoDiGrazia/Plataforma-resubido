import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./InteraccionPorNota.css"
import { useSelector, useDispatch } from 'react-redux';
import { seleccionPorFiltro } from '../../barplot/Barplot';
import axios from 'axios';
import { setNotasMayorInteraccion } from '../../../redux/interaccionesPorNotaSlice';
import { formatNumberMiles } from '../Dashboard.jsx';
import { Link } from 'react-router-dom';

export function formatearTitulo(titulo, corte = 30) {
    return titulo.length > corte ? titulo.slice(0, corte) + "..." : titulo;
}

export function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
    
}
function reemplazarUrl(url) {
    console.log("Original URL:", url); // Agrega este registro
    const nuevaUrl = url.replace("https://www.noticiasd.com/wp-content/uploads/", "https://diego.serviciosd.com/uploads/");
    console.log("Reemplazada URL:", nuevaUrl); // Agrega este registro
    return nuevaUrl;
}


const InteraccionPorNota = () => {
    const dispatch = useDispatch();
    const periodos_api = useSelector(state => state.dashboard.periodos_api);
    const nombreCliente = useSelector(state => state.formulario.cliente);
    const token = useSelector(state => state.formulario.token);
    const FiltroActual = useSelector(state => state.dashboard.filtro);
    const ultimaFechaCargadaBarplot = useSelector(state => state.barplot.ultimaFechaCargadaBarplot);
    const cantidad_meses = seleccionPorFiltro(FiltroActual);
    
    useEffect(() => {
        axios.post("https://panel.serviciosd.com/app_obtener_notas", { cliente: nombreCliente, periodos: periodos_api, token: token }, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(response => {
            if (response.data.status === "true") {
                dispatch(setNotasMayorInteraccion(response.data.item));
            } else {
                console.error('Error en la respuesta de la API:', response.data.message);
            }
        })
        .catch(error => console.error('Error al hacer la solicitud:', error));
    }, [nombreCliente, ultimaFechaCargadaBarplot]);

    const meses = useSelector(state => state.interaccionesPorNota.notasMayorInteraccion).slice(cantidad_meses);
    let todas_las_notas = meses.flatMap(mes => mes.notas);
    const listaTresNotas = todas_las_notas.sort((a, b) => Number(b.total) - Number(a.total)).slice(0, 3);

    return (
        <div className="container-fluid">
            <div className='row'>
                <p id="titulo_relevantes">Notas con mayor interacción
                    <img src="/images/help-circle.png" alt="Descripción" className="info-icon no-print" title="aca va el texto" />  
                </p>
            </div>
            {listaTresNotas.map((nota, index) => (
                <div className='row seccionInteracciones pt-1' key={index}>
                    <div className='col-auto mr-2'>
                        <img src={nota.imagen} alt="Icono" className='imagenWidwetInteracciones2' />
                    </div>
                    <div className='col-auto pt-1'>
                        <Link className="link-sin-estilos" to={`/verNota`} state={{ id: nota.id_noti ? nota.id_noti : nota.term_id, notaABM: nota }}>
                            <div className='row p-0 nombre_plataforma'>{formatearTitulo(nota.titulo)}</div>
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
