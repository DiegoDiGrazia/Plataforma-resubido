import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../../miPerfil/miPerfil.css";
import CopiarTexto from './CopiarTexto';
import IconosDistribucionConMonto from './IconosDistribucionConMonto';
import { useSelector } from 'react-redux';
import { obtenerUltimoDiaMes } from './Distribucion';
import { obtenerNotasDeGeneraciones } from './apisUsuarios';
import { useParams } from 'react-router-dom';

function formatearFechaDDMMAAAA(fechaStr) {
  if (!fechaStr) return "";
  const [año, mes, dia] = fechaStr.split("-");
  return `${dia}-${mes}-${año}`;
}


const NotasCliente = () => {
  const [loading, setLoading] = useState(false); // 👈 nuevo estado
  const TOKEN = useSelector((state) => state.formulario.token);
  const [notasGeneracionesAgrupadas, setNotasGeneracionesAgrupadas] = useState(null);
  const [datosDelCliente, setDatosDelCliente] = useState([])
  const { cliente, desde, hasta } = useParams();

  useEffect(() => {
      setLoading(true);
      obtenerNotasDeGeneraciones(TOKEN, cliente, '', '', 'PUBLICADO', '150', '0', '', '', desde, hasta)
      .then((res) => {
      setNotasGeneracionesAgrupadas(res);
      console.log("Respuesta de notas de generaciones agrupadas:", res);
      })
      .finally(() => setLoading(false)); 
    }, [cliente, desde, hasta]);

    useEffect(() => {    console.log("Notas de generaciones agrupadas:", notasGeneracionesAgrupadas);
    }, [notasGeneracionesAgrupadas]);
  


return (
  <div className="content flex-grow-1 crearNotaGlobal">
    <div className='row miPerfilContainer soporteContainer'>
        <div className='col p-0'>
          <h3 id="saludo" className='headerTusNotas ml-0'>
             Noticias para amplificar del cliente: {cliente}
          </h3>
          <h4 className='infoCuenta'>En el rango de fechas {desde} a {hasta}</h4>
        </div>
      </div>
    {/* Lista */}
    <div className="row miPerfilContainer soporteContainer mt-4 p-0">
      <div>
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: '200px' }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <>
            <ul className="list-group">
              {notasGeneracionesAgrupadas && notasGeneracionesAgrupadas.map(nota => (
                <li key={nota.id} className="list-group-item">
                  <div className="row p-0">
                    {/* Columna 1 */}
                    <div className="col-3">
                      <div className="row p-1">
                        <span>
                          <a
                            href={`https://www.noticiasd.com/${nota.term_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {nota.term_id}
                          </a>
                        </span>
                      </div>
                      <div className="row p-1">
                        <span>
                          <strong>Publicación: </strong>
                          {nota.f_pub}
                        </span>
                      </div>
                      <div className="row p-1">
                        <span>
                          <strong>Última versión: </strong>
                          {nota.update_date}
                        </span>
                      </div>
                      <div className="row p-1">
                        <span>
                          <strong>Fecha vencimiento: </strong>
                          {nota.fecha_vencimiento}
                        </span>
                      </div>
                    </div>

                    {/* Columna 2 */}
                    <div className="col-3">
                      <div className="row p-1">
                        <span>
                          <a
                            href={decodeURI(
                              `https://builder.ntcias.de/single.php?name=-wp${nota.term_id}-${nota.cliente}_v:${formatearFechaDDMMAAAA(
                                nota.fecha_vencimiento
                              )}&nota_id=${nota.term_id}`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            CREATIVO
                          </a>
                        </span>
                      </div>
                      <div className="row p-1">
                        <span>
                          <strong>Comentarios: </strong>
                          {nota.comentarios ?? 'No hay comentarios'}
                        </span>
                      </div>
                    </div>

                    {/* Columna 3 */}
                    <div className="col-3">
                      <div className="row p-1">
                        <CopiarTexto textoACopiar={nota.titulo} TituloBoton="Copiar Título" />
                      </div>
                      <div className="row p-1">
                        <CopiarTexto textoACopiar={nota.extracto} TituloBoton="Copiar Bajada" />
                      </div>
                      <div className="row p-1">
                        <CopiarTexto textoACopiar={nota.engagement} TituloBoton="Copiar Engagement" />
                      </div>
                    </div>

                    {/* Columna 4 */}
                    <IconosDistribucionConMonto nota={nota} token={TOKEN} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  </div>
);
}
export default NotasCliente;