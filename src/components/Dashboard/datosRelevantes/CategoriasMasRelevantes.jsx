import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./InteraccionPorNota.css"
import { useSelector } from 'react-redux';
import { seleccionPorFiltro } from '../../barplot/Barplot';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import axios from 'axios';
import { setCategoriasMayorInteraccion, setMediosMayorInteraccion, setNotasMayorInteraccion } from '../../../redux/interaccionesPorNotaSlice';
import { formatNumberMiles } from '../Dashboard';
function reduceBykeyCategorias(lista_medios) {
    let sitios = {};

    for (let medio of lista_medios) {
        if (!sitios[medio.categoria]) { // Si el sitio no existe aún
            // Inicializar el objeto del sitio
            sitios[medio.categoria] = {
                ...medio, // Copiar todas las propiedades de 'medio'
                impresiones: Number(medio.impresiones) // Asegurar que impresiones sea un número
            };
        } else {
            // Sumar las impresiones
            sitios[medio.categoria].impresiones += Number(medio.impresiones);
        }
    }

    return sitios; // Devuelve un objeto con los sitios como llaves
}



const CategoriasMasRelevantes = () => {
    const nombreCliente = useSelector((state) => state.formulario.cliente);

    const periodos_api = useSelector((state) => state.dashboard.periodos_api)
    console.log(periodos_api)


    ///api///
        const dispatch = useDispatch();
        const token = useSelector((state) => state.formulario.token);
        const fechas = useSelector((state) => state.barplot.fechas);
        const FiltroActual = useSelector((state) => state.dashboard.filtro);

        const ultimaFechaCargada = useSelector((state) => state.cargado.fechaActual);
        const ultimaFechaCargadaBarplot = useSelector((state) => state.barplot.ultimaFechaCargadaBarplot);



        console.log('antes del use efect');
        useEffect(() => {

            const fecha = new Date();
            if(true){
    
            // Hacer la solicitud cuando el componente se monta o 'desde'/'hasta' cambian
            axios.post(
                "https://panel.serviciosd.com/app_obtener_categorias",
                {
                    cliente: nombreCliente,
                    periodos: periodos_api,
                    token: token
                },
                {
                    headers: {
                        'Content-Type': 'multipart/form-data' // Asegúrate de que el tipo de contenido sea correcto
                    }
                }
            )
            .then((response) => {
                console.log('Respuesta:', response.status);

                if (response.data.status === "true") {
                    console.log(response.data);
                    let mesesConCategorias = response.data.item;
                    dispatch(setCategoriasMayorInteraccion(mesesConCategorias))

                } else {
                    console.error('Error en la respuesta de la API:', response.data.message);

                }

            })
            .catch((error) => {
                console.error('Error al hacer la solicitud:', error);
            });
        }
        },[nombreCliente, ultimaFechaCargadaBarplot]); // Dependencias del useEffect


    const categoriasPorMes = useSelector(state => state.interaccionesPorNota.categoriasMayorInteraccion || []);
    console.log("categoriasPorMes: ")
    console.log(categoriasPorMes)
    let todasLasCategorias =[]
    for (let mes of categoriasPorMes) {  
        todasLasCategorias.push(...mes.categoria)
    }
    console.log(todasLasCategorias)
    const categoriasSinRepetir = Object.values(reduceBykeyCategorias(todasLasCategorias))
    const listaTresCategorias =  categoriasSinRepetir.sort((categoriaA, categoriaB) => Number(categoriaB.impresiones) - Number(categoriaA.impresiones)).slice(0, 3);
    console.log(listaTresCategorias)


    let categoria1 = {};
    let categoria2 = {};
    let categoria3 = {};
    
    function asignarCategoria(categoria, item) {
        if (item && item.impresiones != 0) {
            return {
                nombre: item.categoria,
                impresiones: item.impresiones,
            };
        }
        return categoria; // Devuelve el objeto original si no cumple la condición
    }
    
    categoria1 = asignarCategoria(categoria1, listaTresCategorias[0]);
    categoria2 = asignarCategoria(categoria2, listaTresCategorias[1]);
    categoria3 = asignarCategoria(categoria3, listaTresCategorias[2]);
    

    return (
        <div className="container-fluid">
            <div className='row'>
                <p id= "titulo_relevantes">Categorias mas reelevantes
                <img src="/images/help-circle.png" alt="Descripción" className="info-icon" title= "aca va el texto"/>  
                </p>
            </div>
            {/* categoria*/}
            {categoria1 && //si existe la nota
            <div className='row pt-1'>
                <div className='col-8 pt-1'>
                    <div className='row p-0 nombre_plataforma nombre_categoria'> 
                        {categoria1.nombre}
                    </div>
                </div>
                <div className='col totales_widget'>
                    <p>{formatNumberMiles(categoria1?.impresiones || "")}</p>
                </div>
            </div>
            }
            {/* categoria*/}
            {categoria2 && //si existe la nota
            <div className='row pt-1'>
                <div className='col-4 pt-1'>
                    <div className='row p-0 nombre_plataforma nombre_categoria'> 
                        {categoria2.nombre}
                    </div>
                </div>
                <div className='col totales_widget'>
                    <p>{formatNumberMiles(categoria2?.impresiones || "")}</p>
                </div>
            </div>
            }
            {/* categoria*/}
            {categoria3 && //si existe la nota
            <div className='row pt-1'>
                <div className='col-4 pt-1'>
                    <div className='row p-0 nombre_plataforma nombre_categoria'> 
                        {categoria3.nombre}
                    </div>
                </div>
                <div className='col totales_widget'>
                    <p>{formatNumberMiles(categoria3?.impresiones || "")}</p>
                </div>
            </div>
            }
            
        </div>
    );
};

export default CategoriasMasRelevantes;