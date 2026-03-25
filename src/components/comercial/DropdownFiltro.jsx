import React from 'react';
import './DropdownFiltro.css';

const DropdownFiltro = ({ label, opciones, valorActual, onChange }) => {
  return (
    <div className="dropdown">
      <a 
        className="btn btn-secondary dropdown-toggle w-100 h-100 d-flex justify-content-between align-items-center"
        href="#" 
        role="button" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
        style={{fontSize: "13px"}}
      >
        <strong className='text-start'>{label}:</strong>&nbsp;{valorActual}
      </a>
      <ul className="dropdown-menu">
        {opciones.map((opcion, index) => (
          <li key={index}>
            <button 
              className="dropdown-item"
              onClick={() => onChange(opcion)} 
            >
              {opcion}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DropdownFiltro;