import React, { useState } from 'react';
import CalculadoraDeVentas from './CalculadoraDeVentas'; 
import AbmPresupuestos from './AbmPresupuestos'; 
import './GestionPresupuestos.css';

const GestionPresupuestos = () => {
  const [vistaActiva, setVistaActiva] = useState('calculadora');
  const [presupuestoAEditar, setPresupuestoAEditar] = useState(null);

  const irAEditar = (datosPresupuesto) => {
    setPresupuestoAEditar(datosPresupuesto);
    setVistaActiva('calculadora');
  };

  return (
    <div className="content flex-grow-1 p-3"> 
      {/* HEADER Y PESTAÑAS */}
      <div className="row miPerfilContainer soporteContainer p-0 tabs-container mt-1">
        <div className="col-12 p-0">
          <ul className="nav nav-tabs border-0 mt-2 d-flex flex-nowrap">
            <li className="nav-item">
              <button 
                className={`tab-button ${vistaActiva === 'calculadora' ? 'active' : ''}`}
                onClick={() => {
                  setVistaActiva('calculadora');
                  setPresupuestoAEditar(null); 
                }}
              >
                Calculadora
              </button>
            </li>
            <li className="nav-item ms-2">
              <button 
                className={`tab-button ${vistaActiva === 'abm' ? 'active' : ''}`}
                onClick={() => setVistaActiva('abm')}
              >
                Listado de Presupuestos
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* RENDERIZADO CONDICIONAL */}
      {vistaActiva === 'calculadora' ? (
        <CalculadoraDeVentas 
           datosEdicion={presupuestoAEditar} 
           onGuardadoExitoso={() => {
             setVistaActiva('abm');
             setPresupuestoAEditar(null);
           }}
        />
      ) : (
        <AbmPresupuestos onEditar={irAEditar} />
      )}
    </div>
  );
};

export default GestionPresupuestos;