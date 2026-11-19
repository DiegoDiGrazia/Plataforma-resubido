import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '@/shared/components/sidebar/Sidebar';
import { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';




const Administrador = () => {
    
    const permisoListadoUsuarios = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Usuarios: Listado") || false);
    const permisoListadoPerfiles = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Perfiles: Listado") || false);
    const permisoListadoCuentas = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Cuentas: Listado") || false);
    const permisoListadoSitios = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Sitios: Listado") || false);
    
    const DEF = {
        "usuarios": {
            "descripcion": "Gestiona los usuarios de la plataforma, incluyendo su creación, edición y eliminación.",
            "url": "usuarios",
            "titulo": "Usuarios",
            "permiso": permisoListadoUsuarios
            },
    
        "perfiles": {
            "descripcion": "Gestiona los perfiles de los usuarios, asignando roles y permisos específicos.",
            "url": "perfiles",
            "titulo": "Perfiles",
            "permiso": permisoListadoPerfiles
            },
        "clientes": {
            "descripcion": "Gestiona la creación y edición de nuevas cuentas.",
            "url": "clientes",
            "titulo": "Cuentas",
            "permiso": permisoListadoCuentas
            },
        "sitios-relevantes": {
            "descripcion": "Gestiona la alta, baja y modificación de sitios relevantes.", 
            "url": "sitios-relevantes",
            "titulo": "ABM Sitios Relevantes",
            "permiso": permisoListadoSitios
        }
    }

    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    
    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredCategories = Object.keys(DEF).filter((categoriaKey) => {
        const busqueda = categoriaKey.toLowerCase().includes(searchQuery.toLowerCase());
        const tienePermiso = DEF[categoriaKey].permiso;
        return busqueda && tienePermiso;
    });
    return (
        <>
        <div className="content flex-grow-1 crearNotaGlobal">
            <div className='row miPerfilContainer soporteContainer'>
                <div className='col p-0'>
                    <h3 id="saludo" className='headerTusNotas ml-0'>
                        <i className="bi bi-gear-fill" aria-hidden="true" /> Administración 
                    </h3>
                    <h4 className='infoCuenta'>Configuración</h4>
                    <div className='abajoDeTusNotas'>
                        Aquí encontrarás contenidos que te ayudarán a potenciar el uso de nuestra plataforma. <br />
                        Tips, consejos, tutoriales y ayuda para tus contenidos.
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

export default Administrador;