import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '@/shared/components/sidebar/Sidebar';
import { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


const Comercial = () => {
    
    const permisoListadoPlanes = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Planes: Listado") || false);
    const permisoListadoComisionistas = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Comisionistas: Listado") || false);
    const permisoListadoContratos = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Contratos: Listado") || false);
    const permisoListadoFacturas = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Facturas: Listado") || false);
    
    const DEF = {
        "ABM Presupuestos": {
            "descripcion": "Calculá el costo de distribución de tu contenido y guardá los presupuestos de las cuentas.",
            "url": "comercial/abm-presupuestos",
            "titulo": "ABM Presupuestos",
            "permiso": "true"
            },
        "ABM Planes": {
            "descripcion": "Alta, baja y modificación de Planes.",
            "url": "comercial/abm-planes",
            "titulo": "ABM Planes",
            "permiso": permisoListadoPlanes
            },
        "ABM Comisionistas": {
            "descripcion": "Alta, baja y modificación de Comisionistas.",
            "url": "comercial/abm-comisionistas",
            "titulo": "ABM Comisionistas",
            "permiso": permisoListadoComisionistas
            },
        "Contratos": {
            "descripcion": "Alta, baja y modificación de Contratos.",
            "url": "comercial/abm-contratos",
            "titulo": "ABM Contratos",
            "permiso": permisoListadoContratos
            },
        "Administración de facturas": {
            "descripcion": "Listado y administración de Facturas.",
            "url": "comercial/facturas",
            "titulo": "Administración de Facturas",
            "permiso": permisoListadoFacturas
        },
    
    }
    

    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredCategories = Object.keys(DEF).filter((categoriaKey) => {
        const busqueda = categoriaKey.toLowerCase().includes(searchQuery.toLowerCase())
        const tienePermiso = DEF[categoriaKey].permiso;
        return busqueda && tienePermiso;
    });
    return (
        <>
        <div className="content flex-grow-1 crearNotaGlobal">
            <div className='row miPerfilContainer soporteContainer'>
                <div className='col p-0'>
                    <h3 id="saludo" className='headerTusNotas ml-0'>
                        <i className="bi bi-bag-fill" aria-hidden="true" /> Comercial
                    </h3>
                    <h4 className='infoCuenta'>Configuración</h4>
                    <div className='abajoDeTusNotas'>
                        Aquí encontrarás contenidos que te ayudarán a potenciar el uso de nuestra plataforma. <br />
                        Tips, consejos, tutoriales y ayuda para tus contenidos
                    </div>
                </div>
            </div>

            <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-5'>
                <div className='col todasLasNotas p-0 pt-2'>
                    Herramientas
                </div>
                <div className='col buscadorNotas'>
                    <form className='buscadorNotasForm'>
                        <input
                            className='inputBuscadorNotas'
                            type="text"
                            value={searchQuery}
                            onChange={handleInputChange}
                            placeholder="Buscar por herramienta"
                        />
                    </form>
                </div>
            </div>

            <div className='miPerfilContainer soporteContainer mt-4 nd-grid-cards'>
                {filteredCategories.map((categoriaKey) => {
                    const categoria = DEF[categoriaKey];
                    return (
                        <button
                            key={categoriaKey}
                            type="button"
                            className="nd-tool-card"
                            style={{ '--nd-card-imagen': `url('/images/${categoriaKey}.png')` }}
                            onClick={() => navigate(`/${categoria.url}`)}
                        >
                            <h5 className="nd-tool-card__titulo">{categoria.titulo}</h5>
                            <p className="nd-tool-card__texto">{categoria.descripcion}</p>
                        </button>
                    );
                })}
            </div>
        </div>
        </>
    );
};

export default Comercial;