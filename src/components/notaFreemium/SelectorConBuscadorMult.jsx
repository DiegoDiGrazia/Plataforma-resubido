import React, { useEffect, useState } from 'react';

const SelectorConBuscadorMult = ({
  title,
  options = [],
  selectedOptions = [],
  onSelect,
  onClear,
  show = false,
  isMulti = true // 👈 nuevo prop
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter(option => {
    const text = option?.nombre ?? option?.name ?? '';
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getId = (opt) =>
    opt.pais_id || opt.provincia_id || opt.municipio_id || opt.id;

  const isSelected = (option) => {
    return selectedOptions.some(item => getId(item) === getId(option));
  };

  const handleSelect = (option) => {
    const selected = isSelected(option);

    if (isMulti) {
      // 🔹 modo múltiple
      if (selected) {
        onSelect(selectedOptions.filter(item => getId(item) !== getId(option)));
      } else {
        onSelect([...selectedOptions, option]);
      }
    } else {
      // 🔹 modo único (reemplaza)
      if (selected) {
        onSelect([]); 
      } else {
        onSelect([option]); 
      }
    }
  };

  useEffect(() => {
    console.log('Selected options changed:', selectedOptions);
  }, [selectedOptions]);

  return (
    show && (
      <div className="mb-2">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold">{title}</span>

          <div className="dropdown">
            <button
              className="btn custom-dropdown-button dropdown-toggle boton_cliente"
              type="button"
              data-bs-toggle="dropdown"
            >
              {selectedOptions.length === 1
                ? `${selectedOptions[0].nombre}`
                : selectedOptions.length > 1
                ? `${selectedOptions[0].nombre} + ${selectedOptions.length - 1} seleccionados`
                : "Ninguno"}
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

              {/* Limpiar */}
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    onClear();
                    setSearchQuery('');
                  }}
                >
                  Limpiar selección
                </button>
              </li>

              <li><hr className="dropdown-divider" /></li>

              {/* Opciones */}
              {filteredOptions.map((option, index) => {
                const selected = isSelected(option);

                return (
                  <li key={index}>
                    <button
                      className="dropdown-item d-flex justify-content-between align-items-center"
                      onClick={() => handleSelect(option)}
                    >
                      {option.nombre || option.name}
                      {selected && <span>✔</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    )
  );
};

export default SelectorConBuscadorMult;