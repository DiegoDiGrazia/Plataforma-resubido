import React, { useState, useMemo } from 'react';

const SelectorNumerosEnteros = ({
    title,
    start = 0,
    end = 10,
    selectedValue,
    onSelect,
    onClear
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Generar lista de números enteros
    const options = useMemo(() => {
        const list = [];
        for (let i = start; i <= end; i++) {
            list.push(i);
        }
        return list;
    }, [start, end]);

    // Filtrar según búsqueda
    const filteredOptions = options.filter(num =>
        num.toString().includes(searchQuery)
    );

    return (
        <div className="mb-2">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">{title}</span>

                <div className="dropdown">
                    <button
                        className="btn custom-dropdown-button dropdown-toggle boton_cliente"
                        type="button"
                        data-bs-toggle="dropdown"
                    >
                        {selectedValue !== null && selectedValue !== undefined
                            ? selectedValue
                            : "Ninguno"}
                    </button>

                    <ul className="dropdown-menu listaClientes p-2" style={{ minWidth: "220px" }}>
                        
                        {/* Buscador */}
                        <li className="mb-2">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Buscar número..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </li>

                        {/* Limpiar */}
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

                        {/* Opciones */}
                        {filteredOptions.map((num) => (
                            <li key={num}>
                                <button
                                    className="dropdown-item"
                                    onClick={() => {
                                        onSelect(num);
                                        setSearchQuery('');
                                    }}
                                >
                                    {num}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SelectorNumerosEnteros;
