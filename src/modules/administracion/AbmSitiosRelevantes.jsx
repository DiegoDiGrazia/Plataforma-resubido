import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { editarSitio } from '@/api/apisUsuarios';
import { obtenerSitiosPaises, obtenerSitiosProvincias, eliminarSitioPaises, eliminarSitioProvincias, agregarSitioPaises, agregarSitioProvincias } from '@/api/sitiosApi';
import { Accordion, AccordionItem } from 'react-bootstrap';
import { Modal } from 'bootstrap';
import './AbmSitiosRelevantes.css';
import { borrarTildes } from '@/shared/utils/funcionesVarias';
import { ToastContainer } from 'react-toastify';
import { toastExito, toastError } from '@/shared/utils/toastify/toastify.jsx';

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
    try {
      if (sitioGeo.pais_id) {
        await eliminarSitioPaises(token, sitioGeo.pais_id, medio.id);
        setSitiosPaises(paisesActuales => 
          paisesActuales.map(pais => 
            pais.pais_id === sitioGeo.pais_id 
              ? { ...pais, medios: pais.medios.filter(m => m.id !== medio.id) }
              : pais
          )
        );
      } else if (sitioGeo.provincia_id) {
        await eliminarSitioProvincias(token, sitioGeo.provincia_id, medio.id);
        setSitiosProvincias(provinciasActuales => 
          provinciasActuales.map(provincia => 
            provincia.provincia_id === sitioGeo.provincia_id 
              ? { ...provincia, medios: provincia.medios.filter(m => m.id !== medio.id) }
              : provincia
          )
        );
      }
      toastExito("¡Sitio eliminado correctamente!");
      document.getElementById('btn-cerrar-modal-eliminar')?.click();
    } catch (error) {
      console.error("Error al eliminar sitio:", error);
      toastError("Ocurrió un error al eliminar el sitio.");
    }
  }

  // FUNCION AGREGAR SITIO RELEVANTE
  const agregarSitioRelevante = async () => {
    if(sitioActual && nuevoSitio) {
      try {
        if(sitioActual.pais_id) {
          await agregarSitioPaises(token, sitioActual.pais_id, nuevoSitio);
          const sitiosActualizados = await obtenerSitiosPaises(token, "");
          setSitiosPaises(sitiosActualizados);
        } else if(sitioActual.provincia_id) {
          await agregarSitioProvincias(token, sitioActual.provincia_id, nuevoSitio);
          const sitiosActualizados = await obtenerSitiosProvincias(token, "");
          setSitiosProvincias(sitiosActualizados);
        }
        toastExito("¡Sitio agregado correctamente!");
        document.getElementById('btn-cerrar-modal-agregar')?.click();
      } catch (error) {
        console.error("Error al agregar sitio:", error);
        toastError("Ocurrió un error al agregar el sitio.");
      }
    }
  }

  // FUNCION EDITAR SITIO RELEVANTE
  const editarSitioRelevante = async () => {
    if (sitioActual && archivoImagen) {
      try {
        await editarSitio(token, sitioActual.id, sitioActual.sitio, archivoImagen);
        
        const [sitiosProvActualizados, sitiosPaisActualizados] = await Promise.all([
          obtenerSitiosProvincias(token, ""),
          obtenerSitiosPaises(token, "")
        ]);
        
        setSitiosProvincias(sitiosProvActualizados);
        setSitiosPaises(sitiosPaisActualizados);
        
        toastExito("¡Icono actualizado correctamente!");
        document.getElementById('btn-cerrar-modal-editar')?.click();
      } catch (error) {
        console.error("Error al editar sitio:", error);
        toastError("Ocurrió un error al actualizar el ícono.");
      }
    }
  }

  const limpiarURL = (texto) => {
    setNuevoSitio(texto);
  };

  // El "+" vive dentro del header del acordeón (que es un <button>): frena el click para que
  // no abra/cierre el acordeón y abre el modal a mano, sin depender del data-bs-toggle.
  const abrirModalAgregar = (e, sitio) => {
    e.stopPropagation();
    e.preventDefault();
    setSitioActual(sitio);
    setNuevoSitio("");
    Modal.getOrCreateInstance(document.getElementById('modalAgregarSitio')).show();
  };

  return(
      <div id='abm-sitios-relevantes' className="content flex-grow-1 crearNotaGlobal">
          <div className='row miPerfilContainer soporteContainer'>
            <div className='col p-0'>
              <h3 id="saludo" className='headerTusNotas ml-0'>
                <i className="bi bi-gear-fill" aria-hidden="true" /> ABM Sitios Relevantes
              </h3>
            </div>
          </div>
          {/* Búsqueda */}
          <div className='row miPerfilContainer soporteContainer sitios__buscador p-0'>
            <div className='d-flex'>
              <form className='buscadorNotasForm'>
                <input
                  className='inputBuscadorNotas'
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar sitios por pais o provincia"
                />
              </form>
            </div>
          </div>
          {/* LISTADO GEOS */}
          <div className='row miPerfilContainer soporteContainer mt-0 mb-3 p-0'>
            {loading ? (
          <div className="sitios__cargando">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
          ) : sitiosFiltrados?.length === 0 ? (
            <ul className="list-group mt-2">
              <li className="list-group-item d-flex justify-content-center">No hay resultados.</li>
            </ul>
          ) : (
            <Accordion>
              {sitiosFiltrados.map((sitio, index) => (
                <AccordionItem eventKey={index.toString()} key={`Sitio relevante id: ${index}`} className="nd-hover-elevate">
                  <Accordion.Header>
                    <div className='me-auto'>
                      <strong>{sitio.nombre}</strong>
                    </div>
                    {permisoAlta && (
                    <span
                      role="button"
                      tabIndex={0}
                      className='nd-icon-btn sitios__agregar'
                      title='Agregar sitio relevante'
                      aria-label={`Agregar sitio relevante en ${sitio.nombre}`}
                      onClick={(e) => abrirModalAgregar(e, sitio)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && abrirModalAgregar(e, sitio)}
                    >
                      <i className='bi bi-plus-lg' aria-hidden='true'></i>
                    </span>
                    )}
                  </Accordion.Header>

                  <Accordion.Body>
                    {sitio.medios && sitio.medios.length > 0 ? (
                      <ul className="list-group d-flex gap-1">
                        {sitio.medios.map((medio, index) => (
                          <li key={index} className="list-group-item d-flex align-items-center justify-content-between gap-3">
                            <div className='d-flex align-items-center gap-3'>
                              <img 
                                src={`https://www.google.com/s2/favicons?domain=${medio.sitio}&sz=64`} 
                                className='sitios__favicon'
                                alt=''
                                onError={(e) => { e.target.src = "/images/globe-americas-fill.svg"; }}/>
                              <a className='sitios__link' href={`https://www.${medio.sitio}`} target='_blank' rel="noreferrer">
                                {medio.sitio}
                              </a>
                            </div>
                            <div className='sitios__acciones'>
                              {permisoEdicion && (
                              <button
                                type='button'
                                className='nd-icon-btn nd-icon-btn--primary'
                                title='Editar ícono'
                                aria-label={`Editar ícono de ${medio.sitio}`}
                                data-bs-toggle="modal" 
                                data-bs-target="#modalEditarSitio"
                                onClick={() => { setSitioActual(medio); setArchivoImagen(null) }}
                              >
                                <i className='bi bi-pencil' aria-hidden='true'></i>
                              </button>
                              )}
                              {permisoBorrado && (
                              <button 
                                type='button'
                                className='nd-icon-btn nd-icon-btn--danger'
                                title='Eliminar sitio relevante'
                                aria-label={`Eliminar ${medio.sitio}`}
                                data-bs-toggle="modal" 
                                data-bs-target="#modalEliminarSitio"
                                onClick={() => setSitioActual({sitioGeo: sitio, medio})}
                              >
                                <i className='bi bi-trash3' aria-hidden='true'></i>
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
                <i className="bi bi-plus-circle sitios__icono-modal" aria-hidden="true"></i>
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
                <i className="bi bi-image sitios__icono-modal" aria-hidden="true"></i>
                <h5 className="mt-2 fw-bold">Cambiar imagen</h5>
                <p className="text-muted nd-text-base">
                  Editando el icono de <strong>{sitioActual?.sitio}</strong>
                </p>
                
                <div className="text-start mt-4 px-2">
                  <label className="form-label nd-text-base nd-fw-medium">Seleccionar Imagen <span className="text-danger">*</span></label>
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
                <i className="bi bi-exclamation-circle sitios__icono-modal sitios__icono-modal--peligro" aria-hidden="true"></i>
                <h5 className="mt-2 mb-3 fw-bold">¿Estás seguro de que querés eliminar este sitio?</h5>
                <p className="text-muted nd-text-base">
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
        
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        
      </div>
      
      

  )
} 
export default AbmSitiosRelevantes;