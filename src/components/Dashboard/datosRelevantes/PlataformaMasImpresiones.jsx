import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./InteraccionPorNota.css"
import { useSelector } from 'react-redux';
import { seleccionPorFiltro } from '../../barplot/Barplot';
import { formatNumberMiles } from '../Dashboard';


const PlataformaMasImpresiones = () => {

    const FiltroActual = useSelector((state) => state.dashboard.filtro);
    let cantidad_meses = seleccionPorFiltro(FiltroActual)

    const ImpresionesFacebookPorMes = (useSelector((state) => state.barplot.impresionesTotalesFacebook)).slice(cantidad_meses);
    const ImpresionesGooglePorMes = (useSelector((state) => state.barplot.impresionesTotalesGoogle)).slice(cantidad_meses);
    const ImpresionesInstagramPorMes = (useSelector((state) => state.barplot.impresionesTotalesInstagram)).slice(cantidad_meses);

    const totalImpresionesFacebook = ImpresionesFacebookPorMes.reduce((a, b) => a + b, 0);
    const totalImpresionesInstagram = ImpresionesInstagramPorMes.reduce((a, b) => a + b, 0);
    const totalImpresionesGoogle = ImpresionesGooglePorMes.reduce((a, b) => a + b, 0);






    return (
        <div className="container-fluid">
            <div className='row'>
                <p id= "titulo_relevantes">Plataforma con más impresiones
                <img src="/images/help-circle.png" alt="Descripción" className="info-icon" title= "aca va el texto"/>  
                </p>
            </div>
            {/* FACEBOOK */}
            <div className='row pt-0'>
                <div className='col-1'>
                    <img src="/images/logoFB.png" alt="Icono 1" className='imagenWidwet' />
                </div>
                <div className='col pt-1'>
                    <div className='row p-0 nombre_plataforma'> 
                        Facebook
                    </div>
                    <div className='row p-0'> 
                        <a href="https://www.facebook.com" className='linkPlataforma'>www.facebook.com</a>
                    </div>
                </div>
                <div className='col totales_widget'>
                    <p>{formatNumberMiles(totalImpresionesFacebook)}</p>
                </div>
            </div>
            {/* INSTAGRAM */}
            <div className='row'>
                <div className='col-1'>
                    <img src="/images/logo_ig.png" alt="Icono 1" className='imagenWidwet' />
                </div>
                <div className='col pt-1'>
                    <div className='row p-0 nombre_plataforma'> 
                        Instagram
                    </div>
                    <div className='row p-0'> 
                        <a href="https://www.facebook.com" className='linkPlataforma'>www.Instagram.com</a>
                    </div>
                </div>
                <div className='col totales_widget'>
                    <p>{formatNumberMiles(totalImpresionesInstagram)}</p>
                </div>
            </div>
            {/* GOOGLE */}
            <div className='row'>
                <div className='col-1'>
                    <img src="/images/logo_google.png" alt="Icono 1" className='imagenWidwet' />
                </div>
                <div className='col pt-1'>
                    <div className='row p-0 nombre_plataforma'> 
                        Google
                    </div>
                    <div className='row p-0'> 
                        <a href="https://www.facebook.com" className='linkPlataforma'>www.google.com</a>
                    </div>
                </div>
                <div className='col totales_widget'>
                    <p>{formatNumberMiles(totalImpresionesGoogle)}</p>
                </div>
            </div>
        </div>
    );
};

export default PlataformaMasImpresiones;