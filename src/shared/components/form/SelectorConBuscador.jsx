import React, { useState } from 'react';
import { borrarTildes } from '@/shared/utils/funcionesVarias';

const nombreDe = (option) => option?.nombre ?? option?.name ?? '';
const mismaOpcion = (a, b) => a === b || (a?.id != null && b?.id != null && String(a.id) === String(b.id));

/**
 * Dropdown con buscador.
 * Simple:   selectedOption={obj}       onSelect(obj)
 * Múltiple: multiple selectedOptions={[obj]} onSelect([obj, ...]) — el menú queda abierto para tildar varias.
 */
const SelectorConBuscador = ({
    title,
    options = [],
    selectedOption,
    onSelect,
    onClear,
    alineacionDerecha = false,
    sinMargen = false,
    multiple = false,
    selectedOptions = [],
}) => {
    const [searchQuery, setSearchQuery] = useState(''); // Estado para el texto del buscador

    // Filtrar las opciones según el texto ingresado
    const filteredOptions = (options || []).filter(option =>
        borrarTildes(nombreDe(option).toLowerCase()).includes(borrarTildes(searchQuery.toLowerCase()))
    );

    const estaElegida = (option) => selectedOptions.some((s) => mismaOpcion(s, option));

    const textoBoton = multiple
        ? selectedOptions.length === 0
            ? "Ninguno"
            : selectedOptions.length === 1
                ? nombreDe(selectedOptions[0])
                : `${nombreDe(selectedOptions[0])} +${selectedOptions.length - 1}`
        : nombreDe(selectedOption) || "Ninguno";

    const elegir = (option) => {
        if (multiple) {
            onSelect(estaElegida(option)
                ? selectedOptions.filter((s) => !mismaOpcion(s, option))
                : [...selectedOptions, option]);
            return; // se mantiene el texto buscado para seguir tildando
        }
        onSelect(option);
        setSearchQuery('');
    };

    return (
        // sinMargen: para ponerlo en una fila de filtros alineado con otros botones
        <div className={`selectorConBuscador ${sinMargen ? '' : 'mb-2'}`}>
            {/* Título + Dropdown en la misma línea */}
            <div className={`nd-field-row ${sinMargen ? '' : 'mb-2'}`}>
                <span className="nd-field-row__label">{title}</span>

                <div className="dropdown nd-field-row__control">
                    <button
                        className="btn custom-dropdown-button dropdown-toggle boton_cliente"
                        type="button"
                        data-bs-toggle="dropdown"
                        data-bs-auto-close={multiple ? 'outside' : undefined}
                    >
                        {textoBoton}
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
                                {multiple ? "Limpiar selección" : "Ninguno"}
                            </button>
                        </li>

                        <li><hr className="dropdown-divider" /></li>

                        {/* Opciones filtradas */}
                        {filteredOptions.map((option, index) => (
                            <li key={option?.id ?? index}>
                                <button
                                    className="dropdown-item d-flex justify-content-between align-items-center gap-2"
                                    aria-pressed={multiple ? estaElegida(option) : undefined}
                                    onClick={() => elegir(option)}
                                >
                                    {nombreDe(option)}
                                    {multiple && estaElegida(option) && <i className="bi bi-check2 text-primary" aria-hidden="true" />}
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
