import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Sidebar from '../sidebar/Sidebar';
import "../miPerfil/miPerfil.css";
import { useEffect } from 'react';
import { Button } from 'react-bootstrap';



const DEF = {
    "usuarios": {
        "descripcion": "Gestiona los usuarios de la plataforma, incluyendo su creación, edición y eliminación.",
        "url": "usuarios",
        "titulo": "Usuarios"
        },

    "perfil": {
        "descripcion": "Gestiona los perfiles de los usuarios, asignando roles y permisos específicos.",
        "url": "perfiles",
        "titulo": "Perfil"
        }
    }




const Administrador = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Filtrar las categorías por nombre (categoriaKey)
    const filteredCategories = Object.keys(DEF).filter((categoriaKey) =>
        categoriaKey.toLowerCase().includes(searchQuery.toLowerCase())
    );
    


    return (
        <>
        <div className="content flex-grow-1 crearNotaGlobal">
            <div className='row miPerfilContainer soporteContainer'>
                <div className='col p-0'>
                    <h3 id="saludo" className='headerTusNotas ml-0'>
                        <img src="/images/auto_entrevistas_icon.png" alt="Icono 1" className="icon me-2 icono_tusNotas" /> Administrador
                    </h3>
                    <h4 className='infoCuenta'>Configuracion</h4>
                    <div className='abajoDeTusNotas'>
                        Aquí encontrarás contenidos que te ayudarán a potenciar el uso de nuestra plataforma. <br />
                        Tips, consejos, tutoriales y ayuda para tus contenidos
                    </div>
                </div>
            </div>

            <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-5'>
                <div className='col todasLasNotas p-0 pt-2'>
                    Todas las entrevistasas
                </div>
                <div className='col buscadorNotas'>
                    <form className='buscadorNotasForm'>
                        <input
                            className='inputBuscadorNotas'
                            type="text"
                            value={searchQuery}
                            onChange={handleInputChange}
                            placeholder="      Buscar por entrevista"
                        />
                    </form>
                </div>
            </div>

            <div className='row miPerfilContainer soporteContainer mt-4 p-0'>
                {filteredCategories.map((categoriaKey, index) => {
                const categoria = DEF[categoriaKey]; // Accedemos a la info de esa categoría
                return (
                <div key={index} className='col-auto mb-3'>
                    <div
                    className="card"
                    style={{
                        width: "250px",
                        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.81)), url('/images/${categoriaKey}.png')`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                    }}
                    >
                    <div className="card-body d-flex flex-column justify-content-between">
                        <Button variant='' href={categoria.url}>
                            <div>
                            <h5 className="card-title">{categoria.titulo}</h5>
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