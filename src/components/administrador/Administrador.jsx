import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Sidebar from '../sidebar/Sidebar';
import "../miPerfil/miPerfil.css";
import "./AdministradorMobile.css";
import "./gestores/AbmsMobile.css"
import { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


const DEF = {
    "usuarios": {
        "descripcion": "Gestiona los usuarios de la plataforma, incluyendo su creación, edición y eliminación.",
        "url": "usuarios",
        "titulo": "Usuarios"
        },

    "perfiles": {
        "descripcion": "Gestiona los perfiles de los usuarios, asignando roles y permisos específicos.",
        "url": "perfiles",
        "titulo": "Perfil"
        },
    "clientes": {
        "descripcion": "Gestiona la creación y edición de nuevas cuentas.",
        "url": "clientes",
        "titulo": "Cuentas"
        },
    }
const Administrador = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredCategories = Object.keys(DEF).filter((categoriaKey) =>
        categoriaKey.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
        <>
        <div className="content flex-grow-1 crearNotaGlobal">
            <div className='row miPerfilContainer soporteContainer'>
                <div className='col p-0'>
                    <h3 id="saludo" className='headerTusNotas ml-0'>
                        <i className="icon me-2 icono_tusNotas bi bi-gear-fill" alt="Icono 1" style={{color: '#3e4658ff', marginRight: '5px', bottom: '10px', fontSize: '24px'}} /> Administración 
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
                            placeholder="      Buscar por herramienta"
                        />
                    </form>
                </div>
            </div>

            <div className='row miPerfilContainer soporteContainer mt-4 p-0 admin'>
                {filteredCategories.map((categoriaKey, index) => {
                const categoria = DEF[categoriaKey]; // Accedemos a la info de esa categoría
                return (
                <div key={index} className='col-auto mb-3'>
                    <div
                    className="card"
                    style={{
                        width: "250px",
                        height: "80%",
                        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.81)), url('/images/${categoriaKey}.png')`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                    }}
                    >
                    <div className="card-body d-flex justify-content-between">
                        <Button variant='' onClick={() => navigate(`/${categoria.url}`)}>
                            <div className='card-content h-100'>
                            <h5 className="card-title justify-content-center">{categoria.titulo}</h5>
                            <p className="card-text">{categoria.descripcion}</p>
                            </div>
                        </Button>
                    </div>
                    </div>
                </div>
                )
            })}
            </div>
        </div>
        </>
    );
};

export default Administrador;