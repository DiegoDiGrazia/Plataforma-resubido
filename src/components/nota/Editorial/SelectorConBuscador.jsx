import React, { useState } from 'react';

const SelectorConBuscador = ({ title, options, selectedOption, onSelect, onClear }) => {
    const [searchQuery, setSearchQuery] = useState(''); // Estado para el texto del buscador

    // Filtrar las opciones según el texto ingresado
    const filteredOptions = options.filter(option =>
        option.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "10px" }}>
            <span style={{ fontSize: "20px", fontWeight: "bold" }}>{title}</span>
            <button 
                className="btn custom-dropdown-button dropdown-toggle boton_cliente mb-2 ml-5" 
                type="button" 
                data-bs-toggle="dropdown"
            >
                {selectedOption?.nombre || "Ninguno"}
            </button>
            <ul className="dropdown-menu listaClientes">
                {/* Campo de búsqueda */}
                <li>
                    <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </li>
                {/* Opción para limpiar la selección */}
                <li>
                    <button 
                        className="dropdown-item" 
                        onClick={onClear}
                    >
                        Ninguno
                    </button>
                </li>
                {/* Opciones dinámicas filtradas */}
                {filteredOptions.map((option, index) => (
                    <li key={index}>
                        <button 
                            className="dropdown-item" 
                            onClick={() => onSelect(option)}
                        >
                            {option.nombre}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SelectorConBuscador;