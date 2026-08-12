import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import SelectorCliente from '../../Dashboard/SelectorCliente';
import { obtenerSitiosPaises, obtenerSitiosProvincias, eliminarSitiosPaises, eliminarSitiosProvincias, agregarSitioPaises, agregarSitioProvincias, editarSitio } from './apisUsuarios';
import { Accordion, AccordionItem } from 'react-bootstrap';
import './AbmSitiosRelevantes.css';
import { borrarTildes } from '../../comercial/Facturas';

const AbmSitiosRelevantes = () => {
    
  const token = useSelector((state) => state.formulario.token);
  const permisoAlta = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Sitios: Alta") || false);
  const permisoEdicion = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Sitios: Edicion") || false);
  const permisoBorrado = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Sitios: Borrado") || false);

  const [sitiosPaises, setSitiosPaises] = useState([]);
  const [sitiosProvincias, setSitiosProvincias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sitioActual, setSitioActual] = useState(null);
  const [nuevoSitio, setNuevoSitio] = useState("");
  const [archivoImagen, setArchivoImagen] = useState("");

  useEffect (() => {
    setLoading(true);
    if(token) {
      obtenerSitiosPaises(token, "").then((sitios) => {
        setSitiosPaises(sitios);
      }).finally (() => setLoading(false));
    }
  },[])

  useEffect (() => {
    if(token) {
      obtenerSitiosProvincias(token, "").then((sitios) => {
        setSitiosProvincias(sitios);
      })
    }

  },[])

  const filtrarPorBusqueda = (sitio) => {
    return borrarTildes(sitio.nombre.toLowerCase()).includes(borrarTildes(search.toLowerCase()));
  }
  
  const sitiosRelevantes = [...sitiosPaises, ...sitiosProvincias];
  
  const sitiosFiltrados = sitiosRelevantes?.length > 0 ?
    sitiosRelevantes.filter((sitio) => filtrarPorBusqueda(sitio)) : [];
  

  // FUNCION ELIMINAR SITIO RELEVANTE
  const eliminarSitioRelevante = async () => {
    if (!sitioActual) return;
    
    const { sitioGeo, medio } = sitioActual;
    if (sitioGeo.pais_id) {
      await eliminarSitiosPaises(token, sitioGeo.pais_id, medio.id);

      setSitiosPaises(paisesActuales => 
        paisesActuales.map(pais => 
          pais.pais_id === sitioGeo.pais_id 
            ? { ...pais, medios: pais.medios.filter(m => m.id !== medio.id) }
            : pais
        )
      );
    } else if (sitioGeo.provincia_id) {
      await eliminarSitiosProvincias(token, sitioGeo.provincia_id, medio.id);

      setSitiosProvincias(provinciasActuales => 
        provinciasActuales.map(provincia => 
          provincia.provincia_id === sitioGeo.provincia_id 
            ? { ...provincia, medios: provincia.medios.filter(m => m.id !== medio.id) }
            : provincia
        )
      );
    }
    document.getElementById('btn-cerrar-modal-eliminar')?.click();
  }

  // FUNCION AGREGAR SITIO RELEVANTE
  const agregarSitioRelevante = () => {
    if(sitioActual && nuevoSitio) {
      
      if(sitioActual.pais_id) {
        agregarSitioPaises(token, sitioActual.pais_id, nuevoSitio).then(() => {
          obtenerSitiosPaises(token, "").then((sitiosActualizados) => {
            setSitiosPaises(sitiosActualizados);
          })
          
        });

      } else if(sitioActual.provincia_id) {
        agregarSitioProvincias(token, sitioActual.provincia_id, nuevoSitio).then(() => {
          obtenerSitiosProvincias(token, "").then((sitiosActualizados) => {
            setSitiosProvincias(sitiosActualizados);
          })
          
        });
      }
    }
    document.getElementById('btn-cerrar-modal-agregar')?.click();
  }

  // FUNCION EDITAR SITIO RELEVANTE
  const editarSitioRelevante = () => {
    if (sitioActual && archivoImagen) {
      editarSitio(token, sitioActual.id, sitioActual.sitio, archivoImagen).then(() =>
        obtenerSitiosProvincias(token, "").then((sitiosActualizados) => {
            setSitiosProvincias(sitiosActualizados);
          }),
        obtenerSitiosPaises(token, "").then((sitiosActualizados) => {
            setSitiosPaises(sitiosActualizados);
          })
      )
    }
    document.getElementById('btn-cerrar-modal-editar')?.click();
  }

  const limpiarURL = (texto) => {
    
    let valor = texto; 

    valor = valor.replace(/^https?:\/\//i, '');
    valor = valor.replace(/^www\./i, '');
    valor = valor.split('/')[0];

    setNuevoSitio(texto);
  };

  return(
      <div id='abm-sitios-relevantes' className="content flex-grow-1 crearNotaGlobal h-100">
          <div className='row miPerfilContainer soporteContainer'>
            <div className='col p-0'>
              <h3 id="saludo" className='headerTusNotas ml-0'>
                <i className="icon me-2 icono_tusNotas bi bi-gear-fill" alt="Icono 1" /> Gestiona tus sitios relevantes
              </h3>
              <h4 className='infoCuenta'>Gestiona tus sitios relevantes</h4>
              <div className='abajoDeTusNotas'>
                En esta seccion podrás gestionar la visualización y edición de todos los sitios relevantes de la plataforma.
              </div>
            </div>
          </div>
          {/* Búsqueda */}
          <div className='row miPerfilContainer soporteContainer mt-5 p-0 mb-0'>
            <div className='d-flex'>
              <form className='buscadorNotasForm'>
                <input
                  className='inputBuscadorNotas'
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="      Buscar sitios por pais o provincia"
                />
              </form>
            </div>
          </div>
          {/* LISTADO GEOS */}
          <div className='row miPerfilContainer soporteContainer mt-0 mb-3 p-0'>
            {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
          ) : sitiosFiltrados?.length === 0 ? (
            <ul className="list-group mt-2">
              <li className="list-group-item d-flex justify-content-center">No hay resultados.</li>
            </ul>
          ) : (
            <Accordion style={{height: '200px'}}>
              {sitiosFiltrados.map((sitio, index) => (
                <AccordionItem eventKey={index.toString()} key={`Sitio relevante id: ${index}`}>
                  <Accordion.Header>
                    <div className='me-auto'>
                      <strong>{sitio.nombre}</strong>
                    </div>
                    {permisoAlta && (
                    <button 
                      className='btn boton-funcion p-0 mt-1 me-2' 
                      title='Agregar sitio relevante' 
                      style={{ width: '38px' }} 
                      data-bs-toggle="modal" 
                      data-bs-target="#modalAgregarSitio"
                      onClick={(e) => { e.stopPropagation(); 
                                        setSitioActual(sitio); 
                                        setNuevoSitio(""); 
                                      }}
                    >
                      <i className='bi bi-plus-circle me-0'></i>
                    </button>
                    )}
                  </Accordion.Header>

                  <Accordion.Body>
                    {sitio.medios && sitio.medios.length > 0 ? (
                      <ul className="list-group d-flex gap-1">
                        {sitio.medios.map((medio, index) => (
                          <li key={index} className="list-group-item d-flex align-items-center justify-content-between gap-3">
                            <div className='d-flex align-items-center gap-3'>
                              <img 
                                src={`https://panel.serviciosd.com${medio.imagen}`} 
                                style={{ width: '30px', height: '30px' }} 
                                onError={(e) => { e.target.src = "/images/globe-americas-fill.svg"; }}/>
                              <a /* className='text-decoration-none' */ href={`https://www.${medio.sitio}`} target='_blank' rel="noreferrer">
                                {medio.sitio}
                              </a>
                            </div>
                            <div className='d-flex gap-2'>
                              {permisoEdicion && (
                              <button 
                                className='boton-funcion btn p-0'
                                title='Editar Icono'
                                data-bs-toggle="modal" 
                                data-bs-target="#modalEditarSitio"
                                onClick={() => { setSitioActual(medio); setArchivoImagen(null) }}
                              >
                                <i className='bi bi-pencil-square mt-5'></i>
                              </button>
                              )}
                              {permisoBorrado && (
                              <button 
                                className='boton-funcion btn p-0 mb-1' 
                                title='Eliminar sitio relevante'
                                data-bs-toggle="modal" 
                                data-bs-target="#modalEliminarSitio"
                                onClick={() => setSitioActual({sitioGeo: sitio, medio})}
                              >
                                <i className='bi bi-trash3-fill me-0'></i>
                              </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="list-group mt-2">
                        <li className="list-group-item d-flex justify-content-center text-muted">
                          No hay medios relevantes para esta ubicación.
                        </li>
                      </ul>
                    )}
                  </Accordion.Body>
                </AccordionItem> 
              ))

              }
            </Accordion>
          )}
        </div>
        
        {/* <-- Modal Agregar Sitio --> */}
        <div className="modal fade" id="modalAgregarSitio" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="btn-cerrar-modal-agregar"></button>
              </div>
              <div className="modal-body text-center pb-4 pt-0">
                <i className="bi bi-plus-circle text-primary mb-2" style={{fontSize: '3.5rem'}}></i>
                <h5 className="mt-2 fw-bold">Agregar nuevo sitio relevante en "{sitioActual?.nombre}"</h5>
                <div className="text-start mt-4 px-2">
                  <label className="form-label">Sitio <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ej: noticiasd.com"
                    value={nuevoSitio}
                    onChange={(e) => {limpiarURL(e.target.value)}}
                  />
                </div>

                <div className="d-flex justify-content-center gap-2 mt-4 w-100">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                  <button type="button" className="btn btn-primary" onClick={agregarSitioRelevante}>Guardar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* <-- Modal Editar Imagen --> */}
        <div className="modal fade" id="modalEditarSitio" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="btn-cerrar-modal-editar"></button>
              </div>
              <div className="modal-body text-center pb-4 pt-0">
                <i className="bi bi-image text-primary mb-2" style={{fontSize: '3.5rem'}}></i>
                <h5 className="mt-2 fw-bold">Cambiar imagen</h5>
                <p className="text-muted" style={{fontSize: '14px'}}>
                  Editando el icono de <strong>{sitioActual?.sitio}</strong>
                </p>
                
                <div className="text-start mt-4 px-2">
                  <label className="form-label" style={{fontSize: '14px', fontWeight: '500'}}>Seleccionar Imagen <span className="text-danger">*</span></label>
                  <input 
                    type="file" 
                    className="form-control" 
                    accept="image/*"
                    onChange={(e) => setArchivoImagen(e.target.files[0])}
                  />
                </div>

                <div className="d-flex justify-content-center gap-2 mt-4 w-100">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={editarSitioRelevante}
                    disabled={!archivoImagen} 
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <-- Modal Eliminar Sitio --> */}
        <div className="modal fade" id="modalEliminarSitio" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="btn-cerrar-modal-eliminar"></button>
              </div>
              <div className="modal-body text-center pb-4 pt-0">
                <i className="bi bi-exclamation-circle text-danger mb-2" style={{fontSize: '3.5rem'}}></i>
                <h5 className="mt-2 mb-3 fw-bold">¿Estás seguro de que querés eliminar este sitio?</h5>
                <p className="text-muted" style={{fontSize: '14px'}}>
                  Vas a eliminar <strong>{sitioActual?.medio?.sitio}</strong> de <strong>{sitioActual?.sitioGeo?.nombre}</strong>. Esta acción no se puede deshacer.
                </p>
                <div className="d-flex justify-content-center gap-2 mt-4">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                  <button type="button" className="btn btn-danger" onClick={eliminarSitioRelevante}>Sí, eliminar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        

      </div>
      
      

  )
} 
export default AbmSitiosRelevantes;