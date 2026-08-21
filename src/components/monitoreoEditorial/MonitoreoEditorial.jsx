import React, { useState, useEffect } from 'react';
import './MonitoreoEditorial.css'
import DropdownFiltro from '../comercial/DropdownFiltro';
import { obtenerMesActual } from '../administrador/gestores/Distribucion';

const MonitoreoEditorial = () => {

    const [fechaDesde, setFechaDesde] = useState(obtenerMesActual());
    const [fechaHasta, setFechaHasta] = useState(obtenerMesActual());
    const [grupoEditores, setGrupoEditores] = useState('Todos');
    const [autor, setAutor] = useState('Todos');

    return (
        <div className="contenedor-monitoreo content flex-grow-1 crearNotaGlobal">
            <div className='row miPerfilContainer soporteContainer gap-5 pb-0 me-5'>
                <div className='col p-0'>
                    {/* Saludo */}
                    <h3 id="saludo" className='headerTusNotas ml-0'>
                        <i className="icon me-2 icono_tusNotas fs-4 bi bi-display-fill" style={{color: 'rgb(62, 70, 88)'}}/> Monitoreo
                    </h3>
                    <div className='abajoDeTusNotas mt-2 mb-5'>
                        En esta sección podrás gestionar los grupos de equipo, de cuentas, y la amplificación de las notas del area de Editorial.
                    </div>
                    <div className=''>
                        <div className='d-flex align-items-center justify-content-between mt-3 p-0'>                   
                            {/* Fechas */}
                            <div className='d-flex align-items-center gap-2 mt-2 p-0 text-nowrap'>
                                <div>
                                    <span className="texto-filtro d-flex align-items-center text-muted fw-bold ms-1 gap-2">Fecha desde</span>
                                    <input 
                                        type="date" 
                                        value={fechaDesde} 
                                        onChange={(e) => setFechaDesde(e.target.value)} 
                                        style={{ fontSize: "13px", border: "1px solid #ccc", borderRadius: "4px", padding: "2px 5px"}}
                                    />
                                </div>
                                
                                <div>
                                    <span className="texto-filtro d-flex align-items-center text-muted fw-bold ms-1 gap-2">Fecha hasta </span>
                                    <input 
                                        type="date" 
                                        value={fechaHasta} 
                                        onChange={(e) => setFechaHasta(e.target.value)}
                                        style={{ fontSize: "13px", border: "1px solid #ccc", borderRadius: "4px", padding: "2px 5px"}}
                                    />
                                </div>
                            </div>
                            {/* Filtros dropdown */}
                            <div id='botones-filtros' className="col-5 d-flex flex-wrap align-items-end justify-content-end gap-2 mt-2 w-auto">
                                <DropdownFiltro
                                    className= 'boton-filtro'
                                    label= "Grupo Editores"
                                    valorActual={grupoEditores}
                                    opciones= {["Todas", "Grupo1", "Grupo1"]}
                                    onChange={setGrupoEditores}
                                />
                                <DropdownFiltro
                                    className= 'boton-filtro'
                                    label= "Autor"
                                    valorActual={autor}
                                    opciones= {["Todas", "Autor1", "Autor2"]}
                                    onChange={setAutor}
                                />
                            </div>
    
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MonitoreoEditorial;