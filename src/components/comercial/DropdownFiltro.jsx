import React, { useState } from 'react';
import './DropdownFiltro.css';

const DropdownFiltro = ({ label, opciones, valorActual, onChange, mostrarBuscador = false }) => {
  const [busqueda, setBusqueda] = useState('');

  const normalizarTexto = (texto) => 
    texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const opcionesFiltradas = opciones.filter(opcion => 
    normalizarTexto(opcion).includes(normalizarTexto(busqueda))
  );

  return (
    <div className="dropdown-filtro-container">
      <a 
        className="btn btn-secondary dropdown-toggle w-100 h-100 d-flex justify-content-between align-items-center dropdown-filtro-btn"
        href="#" 
        role="button" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
      >
        <strong className='text-start'>{label}:</strong>&nbsp;{valorActual}
      </a>
      
      <ul className="dropdown-menu dropdown-menu-scroll">
        
        {mostrarBuscador && (
          <div className="input-group mb-2">
            <input 
              type="text" 
              className="form-control border-end-0" 
              placeholder="Buscar..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="input-group-text bg-white border-start-0 text-muted">
                <i className="bi bi-search"></i>
            </span>
          </div>
        )}

        {opcionesFiltradas.length > 0 ? (
            opcionesFiltradas.map((opcion, index) => (
            <li key={index}>
                <button 
                className="dropdown-item"
                onClick={() => {
                    onChange(opcion);
                    setBusqueda('');
                }} 
                >
                {opcion}
                </button>
            </li>
            ))
        ) : (
            <li className="px-3 py-1 text-muted small">No hay resultados</li>
        )}
      </ul>
    </div>
  );
};

export default DropdownFiltro;