import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { obtenerMesActual } from '../administrador/gestores/Distribucion.jsx';
import DropdownFiltro from './DropdownFiltro.jsx'; 
import './Facturas.css'
import { obtenerFacturas } from '../administrador/gestores/apisUsuarios.jsx';

const Facturas = () =>  {
    
    const [fechaDesde, setFechaDesde] = useState(obtenerMesActual(-3) + "-01");
    const [fechaHasta, setFechaHasta] = useState(obtenerMesActual(6) + "-01");
    const [search, setSearch] = useState("");
    const [emision, setEmision] = useState("Todas");
    const [deuda, setDeuda] = useState("Con deuda");
    const [empresa, setEmpresa] = useState("Cualquiera");
    const [certificacion, setCertificacion] = useState ("Cualquiera");
    const [loading, setLoading] = useState(false);
    const [facturas, setFacturas] = useState("");
    const token = useSelector((state) => state.formulario.token);

    useEffect(() => {
        if (token) {
            obtenerFacturas(token, fechaDesde, fechaHasta).then((facturasRecibidos) => {
                setFacturas(facturasRecibidos);
                console.log("Las Facturas son:", facturasRecibidos);
            })
        }
    }, [token, fechaDesde, fechaHasta]);

    const borrarTildes = (texto) => {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };
    
    const filtrarPorBusqueda = (factura) => {
        return borrarTildes(factura.cliente.toLowerCase()).includes(borrarTildes(search.toLowerCase()));
    }
    
    const filtrarPorEmision = (factura) => {
        return emision === "Todas" || 
              (emision === "Emitidas" && factura.numero) || 
              (emision === "No emitidas" && !factura.numero);
    }
    
    const filtrarPorDeuda = (factura) => {
        return deuda === "Con deuda" || 
              (deuda === "Pagas" && factura.estado === "PAGADA") ||
              (deuda === "Impagas" && factura.estado === "IMPAGA");
    }

    const filtrarPorCertificacion = (factura) => {
        return certificacion === "Cualquiera" ||
              (certificacion === "Si" && factura.lleva_certificacion === "SI") ||
              (certificacion === "No" && factura.lleva_certificacion === "NO")
    }

    const facturasFiltradas = facturas && facturas.length > 0 ? 
        facturas.filter((factura) => filtrarPorBusqueda(factura) && filtrarPorEmision(factura) && filtrarPorDeuda(factura) && filtrarPorCertificacion(factura)
        )
    : [];
     
    return (
        <div className="content flex-grow-1 crearNotaGlobal h-100">
            <div className='row miPerfilContainer soporteContainer me-6'>
                <div className='col p-0'>
                    {/* Saludo */}
                    <h3 id="saludo" className='headerTusNotas ml-0'>
                        <img src="/images/auto_entrevistas_icon.png" alt="Icono 1" className="icon me-2 icono_tusNotas" /> Gestiona tus Facturas
                    </h3>
                    <h4 className='infoCuenta'>Gestiona tus Facturas</h4>
                    <div className='abajoDeTusNotas'>
                        En esta sección podrás gestionar las facturas de los contratos de tus clientes.
                    </div>
                </div>
                <div className='row justify-content-end align-items-end gap-3'>
                    <button id='cargar-factura' className="btn text-white col-2 h-100 w-auto"/*onClick={() => handleEditClick(usuarioVacio)}*/>Cargar factura abierta</button>
                    <button id='descargar-excel' className='btn text-white col-2 h-100 w-auto'/* onClick={() => handleEditClick(usuarioVacio)} */>Descargar Excel</button>
                </div>
            </div>
            
            {/* FILTROS */}
            
            <div className='row miPerfilContainer soporteContainer mt-4 mb-3 me-5 p-0'>
                <div className='buscadorNotas d-flex flex-nowrap align-items-center justify-content-between gap-3 mt-3 p-0 w-100'>
                    {/*Fechas*/}
                    <span className="d-flex align-items-center gap-2 text-nowrap" style={{ fontSize: "14px"}}>Vencimiendo desde:
                        <input 
                            type="date" 
                            value={fechaDesde} 
                            onChange={(e) => setFechaDesde(e.target.value)} 
                            style={{ fontSize: "14px", border: "1px solid #ccc", borderRadius: "4px", padding: "2px 5px"}}
                        />
                    </span>
                    <span className="d-flex align-items-center gap-2 text-nowrap" style={{ fontSize: "14px"}}>Vencimiento hasta:
                      <input 
                          type="date" 
                          value={fechaHasta} 
                          onChange={(e) => setFechaHasta(e.target.value)}
                          style={{ fontSize: "14px", border: "1px solid #ccc", borderRadius: "4px", padding: "2px 5px"}}
                      />
                    </span>
                    {/* Filtros dropdown */}
                    <div className="d-flex align-items-center gap-2 flex-grow-1">
                        <DropdownFiltro
                            className= 'boton-filtro'
                            label= "Emisión"
                            valorActual={emision}
                            opciones= {["Todas", "Emitidas", "No emitidas"]}
                            onChange={setEmision}
                        />
                        <DropdownFiltro 
                            className= 'boton-filtro'
                            label= "Deuda"
                            valorActual={deuda}
                            opciones= {["Con deuda", "Pagas", "Impagas"]}
                            onChange={setDeuda}
                        />
                        <DropdownFiltro 
                            className= 'boton-filtro'
                            label= "Empresa"
                            valorActual={empresa}
                            opciones= {["Cualquiera", "Adlatam SA", "Guiad SA"]}
                            onChange={setEmpresa}
                        />
                        <DropdownFiltro 
                            className= 'boton-filtro'
                            label= "Certificación"
                            valorActual={certificacion}
                            opciones= {["Cualquiera", "Si", "No"]}
                            onChange={setCertificacion}
                        />
                    </div>
                    {/* Buscador cuenta */}
                    <form className='buscadorNotasForm w-auto'>
                        <input
                          className='inputBuscadorNotas'
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="       Buscar cuentas"
                        />
                    </form>
                </div>
            </div>
            {/* Lista de Facturas */}
            <ul className= 'list-group mx-5'>
                {facturasFiltradas && facturasFiltradas.length > 0 ?(
                    facturasFiltradas.map((factura) => (
                        <li className= 'list-group-item py-5' key= {factura.id}>
                            {factura.cliente}
                        </li>
                    ))
                ) : (
                    <li className= 'list-group-item'> No hay resultados. </li> 
                        
                )}
            </ul>
            
        </div>
    )
};

export default Facturas;