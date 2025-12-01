import React, { useState } from 'react';

const SelectorConBuscador = ({ title, options = [], selectedOption, onSelect, onClear }) => {
    const [searchQuery, setSearchQuery] = useState(''); // Estado para el texto del buscador

    // Filtrar las opciones según el texto ingresado
    const filteredOptions = (options || []).filter(option => {
        const text = option?.nombre ?? option?.name ?? '';
        return text.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="mb-2">
            {/* Título + Dropdown en la misma línea */}
            <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">{title}</span>

                <div className="dropdown">
                    <button 
                        className="btn custom-dropdown-button dropdown-toggle boton_cliente" 
                        type="button" 
                        data-bs-toggle="dropdown"
                    >
                        {selectedOption?.nombre || selectedOption?.name || "Ninguno"}
                    </button>

                    <ul className="dropdown-menu listaClientes p-2" style={{ minWidth: "220px" }}>
                        
                        {/* Buscador */}
                        <li className="mb-2">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </li>

                        {/* Opción para limpiar */}
                        <li>
                            <button 
                                className="dropdown-item"
                                onClick={() => {
                                    onClear();
                                    setSearchQuery('');
                                }}
                            >
                                Ninguno
                            </button>
                        </li>

                        <li><hr className="dropdown-divider" /></li>

                        {/* Opciones filtradas */}
                        {filteredOptions.map((option, index) => (
                            <li key={index}>
                                <button 
                                    className="dropdown-item"
                                    onClick={() => {
                                        onSelect(option);
                                        setSearchQuery('');
                                    }}
                                >
                                    {option.nombre || option.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SelectorConBuscador;
