import './TablaReadOnly.css';
import React from "react";

const TablaReadOnly = ({ 
  columns = [],
  rows = [],
  data = [],
  selectedRows = [],
  onToggleRow,
  editableColumns = [],
  tableOverrides = {},
  onCellChange,
  hasTotalsRow = true,
  currencyColumns = [],
  highlightedTotalColumns = []
}) => {
  
  const formatearNumero = (numero, colIndex) => {
    if (numero === "" || numero === undefined || numero === null || isNaN(numero)) return "";
    
    if (colIndex === 0) {
      const truncado = Math.trunc(Number(numero) * 100) / 100;
      return truncado.toLocaleString('es-AR', { maximumFractionDigits: 2 });
    }
    return Math.round(Number(numero)).toLocaleString('es-AR', { maximumFractionDigits: 0 });
  };

  return (
    <div className="tablaCalculadora">
      <table className="tablaCalculadora__tabla">
        <thead>
          <tr>
            <th className="tablaCalculadora__esquina" />
            {columns.map((col, index) => (
              <th key={index}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1}>Sin datos</td>
            </tr>
          ) : (
            rows.map((rowTitle, rowIndex) => {
              const isTotalsRow = hasTotalsRow && rowIndex === rows.length - 1;
              const showCheckbox = hasTotalsRow ? rowIndex < rows.length - 1 : true;

              return (
                <tr key={rowIndex}>
                  <th className="tablaCalculadora__fila">
                    {showCheckbox && (
                      <input
                        type="checkbox"
                        checked={selectedRows[rowIndex]}
                        onChange={() => onToggleRow(rowIndex)}
                        className="me-2"
                      />
                    )}
                    {rowTitle}
                  </th>

                  {columns.map((_, colIndex) => {
                    const isInput = editableColumns.includes(colIndex) && !isTotalsRow;
                    const isCurrency = currencyColumns.includes(colIndex);
                    const isHighlightedTotal = isTotalsRow && highlightedTotalColumns.includes(colIndex);
                    
                    const valorOverride = tableOverrides[rowIndex]?.[colIndex];
                    const valorCalculado = data?.[rowIndex]?.[colIndex] ?? "";

                    return (
                      <td
                        key={colIndex}
                        className={`${isTotalsRow ? 'tablaCalculadora__total' : ''} ${isHighlightedTotal ? 'tablaCalculadora__total--destacado' : ''}`}
                      >
                        {isInput ? (
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            {isCurrency && <span>$</span>}
                            <input
                              type="number"
                              step="0.01"
                              value={valorOverride !== undefined ? valorOverride : valorCalculado}
                              onChange={(e) => onCellChange(rowIndex, colIndex, e.target.value)}
                              className={`tablaCalculadora__input ${colIndex === 2 ? 'tablaCalculadora__input--ancho' : ''}`}
                            />
                          </div>
                        ) : (
                          valorCalculado !== "" ? (
                            <>{isCurrency && <span>$ </span>}{formatearNumero(valorCalculado, colIndex)}</>
                          ) : "-"
                        )}
                      </td>
                    );
                  })}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaReadOnly;