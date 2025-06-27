import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import { formatNumberMiles } from '../Dashboard';
import "./InteraccionPorNota.css";
export const RUTA = "http://localhost:4000/"

const PlataformaAccordionItem = ({
  index,
  openIndex,
  toggle,
  logo,
  nombre,
  url,
  impresiones,
  comentarios,
  meGusta,
  clicks,
  compartido
}) => (
  <div className="accordion-item">
    <button
      className={`accordion-button ${openIndex === index ? '' : 'collapsed'} pt-0`}
      type="button"
      onClick={() => toggle(index)}
      aria-expanded={openIndex === index}
    >
      <div className='row pt-0 mb-2 mt-3'>
        <div className='col-1'>
          <img src={logo} alt={`Icono ${nombre}`} className='imagenWidwet' />
        </div>
        <div className='col pt-1'>
          <div className='row p-0 nombre_plataforma'>{nombre}</div>
          <div className='row p-0'>
            <a href={url} className='linkPlataforma'>{url.replace('https://', '')}</a>
          </div>
        </div>
        <div className='col totales_widget'>
          <p>{formatNumberMiles(impresiones)}</p>
        </div>
      </div>
    </button>
    <div className={`accordion-collapse collapse ${openIndex === index ? 'show' : ''}`}>
      <div className="accordion-body pt-0">
        <div className='row'>
          <div className='col-auto d-flex align-items-center'>
            <img src="/images/logoComentarios.png" alt="Comentarios" className='img-fluid me-2' />
            <div className='comentarios'>
              <span className='d-block'>Comentarios</span>
              <span className='d-block'>{comentarios}</span>
            </div>
          </div>
          <div className='col-auto d-flex align-items-center'>
            <img src="/images/logoMeGusta.png" alt="Me gusta" className='img-fluid me-2' />
            <div className='comentarios'>
              <span className='d-block'>Me gusta</span>
              <span className='d-block'>{meGusta}</span>
            </div>
          </div>
          <div className='col-auto d-flex align-items-center'>
            <img src="/images/logoClicks.png" alt="Clicks" className='img-fluid me-2' />
            <div className='comentarios'>
              <span className='d-block'>Clicks</span>
              <span className='d-block'>{clicks}</span>
            </div>
          </div>
          <div className='col-auto d-flex align-items-center'>
            <img src="/images/logoCompartir.png" alt="Compartido" className='img-fluid me-2' />
            <div className='comentarios'>
              <span className='d-block'>Compartido</span>
              <span className='d-block'>{compartido}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PlataformaMasImpresionesNota = ({id_noti, TOKEN, cliente, fpub, dataLocalNota}) => {
  const [plataformas, setPlataformas] = useState({});
  const [openIndex, setOpenIndex] = useState(null);

  const fechaCompleta = new Date(fpub);
  fechaCompleta.setDate(1);
  const desde = fpub ? fechaCompleta.toISOString().split('T')[0] : null;
  fechaCompleta.setMonth(fechaCompleta.getMonth() + 6);
  const hasta = fpub ? fechaCompleta.toISOString().split('T')[0] : null;

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    axios.post(
      "https://panel.serviciosd.com/app_obtener_impresiones_plataforma_noticia",
      {
        desde: desde,
        hasta: hasta,
        token: TOKEN,
        id_noti: id_noti
      },
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    .then((response) => {
      if (response.data.status === "true") {
        setPlataformas(dataLocalNota ? dataLocalNota : response.data.item);
      } else {
        console.error('Error en la respuesta de la API:', response.data.message);
      }
    })
    .catch((error) => {
      console.error('Error al hacer la solicitud:', error);
    });
  }, [desde, hasta, TOKEN, id_noti, dataLocalNota]);

  // Prepara los datos de cada plataforma
  const plataformasData = [
    {
      logo: "/images/logoFB.png",
      nombre: "Facebook",
      url: "https://www.facebook.com",
      impresiones: Number(plataformas.facebook),
      comentarios: plataformas.facebook_comment,
      meGusta: plataformas.facebook_like,
      clicks: plataformas.facebook_clicks,
      compartido: plataformas.facebook_share
    },
    {
      logo: "/images/logo_ig.png",
      nombre: "Instagram",
      url: "https://www.instagram.com",
      impresiones: Number(plataformas.instagram),
      comentarios: plataformas.instagram_comment,
      meGusta: plataformas.instagram_like,
      clicks: plataformas.instagram_clicks,
      compartido: plataformas.instagram_share
    },
    {
      logo: "/images/logo_google.png",
      nombre: "Google",
      url: "https://www.google.com",
      impresiones: Number(plataformas.busqueda),
      comentarios: 0,
      meGusta: 0,
      clicks: Number(plataformas.busqueda),
      compartido: 0
    }
  ];

  // Filtra plataformas con al menos un dato distinto de cero
  const plataformasConDatos = plataformasData.filter(p =>
    p.impresiones != 0
  );

  return (
    <div className="">
      <div className='row'>
        <p id="titulo_relevantes">Plataforma con más impresiones
          <img src="/images/help-circle.png" alt="Descripción" className="info-icon no-print" title="aca va el texto"/>
        </p>
      </div>
      <div className="accordion">
        {plataformasConDatos.map((plataforma, index) => (
          <PlataformaAccordionItem
            key={index}
            index={index}
            openIndex={openIndex}
            toggle={toggle}
            {...plataforma}
          />
        ))}
      </div>
    </div>
  );
};

export default PlataformaMasImpresionesNota;