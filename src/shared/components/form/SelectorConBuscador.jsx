import React, { useState } from 'react';
import { borrarTildes } from '@/shared/utils/funcionesVarias';

const SelectorConBuscador = ({ title, options = [], selectedOption, onSelect, onClear, alineacionDerecha = false }) => {
    const [searchQuery, setSearchQuery] = useState(''); // Estado para el texto del buscador

    // Filtrar las opciones según el texto ingresado
    
    const filteredOptions = (options || []).filter(option => {
        const text = option?.nombre ?? option?.name ?? '';
        return borrarTildes(text.toLowerCase()).includes(borrarTildes(searchQuery.toLowerCase()));
    });

    return (
        <div className="mb-2">
            {/* Título + Dropdown en la misma línea */}
            <div className="nd-field-row mb-2">
                <span className="nd-field-row__label">{title}</span>

                <div className="dropdown nd-field-row__control">
                    <button 
                        className="btn custom-dropdown-button dropdown-toggle boton_cliente" 
                        type="button" 
                        data-bs-toggle="dropdown"
                    >
                        {selectedOption?.nombre || selectedOption?.name || "Ninguno"}
                    </button>

                    <ul className={`dropdown-menu listaClientes p-2 ${alineacionDerecha ? 'dropdown-menu-end' : ''}`}>
                        
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
