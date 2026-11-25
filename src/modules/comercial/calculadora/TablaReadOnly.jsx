import './TablaReadOnly.css';
import React from "react";
import useEsMobile from '@/shared/hooks/useEsMobile';

/**
 * Tabla de la Calculadora de ventas: una fila por plataforma y una columna por dato.
 * En mobile se dibuja transpuesta (plataformas arriba, datos como filas) para que
 * entre en el ancho sin scroll horizontal. Las celdas son las mismas en los dos modos.
 */
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
  const esMobile = useEsMobile();

  const formatearNumero = (numero, colIndex) => {
    if (numero === "" || numero === undefined || numero === null || isNaN(numero)) return "";

    if (colIndex === 0) {
      const truncado = Math.trunc(Number(numero) * 100) / 100;
      return truncado.toLocaleString('es-AR', { maximumFractionDigits: 2 });
    }
    return Math.round(Number(numero)).toLocaleString('es-AR', { maximumFractionDigits: 0 });
  };

  const esFilaTotales = (rowIndex) => hasTotalsRow && rowIndex === rows.length - 1;

  // Nombre de la plataforma (con su checkbox, salvo en Totales)
  const cabeceraPlataforma = (rowTitle, rowIndex) => (
    <th key={`plataforma-${rowIndex}`} className="tablaCalculadora__fila">
      {!esFilaTotales(rowIndex) && (
        <input
          type="checkbox"
          checked={selectedRows[rowIndex]}
          onChange={() => onToggleRow(rowIndex)}
          className="form-check-input tablaCalculadora__check"
          aria-label={`Incluir ${rowTitle}`}
        />
      )}
      {rowTitle}
    </th>
  );

  // Valor de una plataforma (rowIndex) para un dato (colIndex).
  // En mobile el "$" va una sola vez en el nombre del dato, no en cada celda.
  const celda = (rowIndex, colIndex) => {
    const isTotalsRow = esFilaTotales(rowIndex);
    const isInput = editableColumns.includes(colIndex) && !isTotalsRow;
    const isCurrency = currencyColumns.includes(colIndex) && !esMobile;
    const isHighlightedTotal = isTotalsRow && highlightedTotalColumns.includes(colIndex);

    const valorOverride = tableOverrides[rowIndex]?.[colIndex];
    const valorCalculado = data?.[rowIndex]?.[colIndex] ?? "";

    return (
      <td
        key={`${rowIndex}-${colIndex}`}
        className={`${isTotalsRow ? 'tablaCalculadora__total' : ''} ${isHighlightedTotal ? 'tablaCalculadora__total--destacado' : ''}`}
      >
        {isInput ? (
          <div className="tablaCalculadora__campo">
            {isCurrency && <span>$</span>}
            <input
              type="number"
              step="0.01"
              aria-label={`${rows[rowIndex]}: ${columns[colIndex]}`}
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
  };

  if (esMobile) {
    return (
      <div className={`tablaCalculadora tablaCalculadora--transpuesta ${rows.length === 1 ? 'tablaCalculadora--una-plataforma' : ''}`}>
        <table className="tablaCalculadora__tabla">
          <thead>
            <tr>
              <th className="tablaCalculadora__esquina" />
              {rows.map((rowTitle, rowIndex) => cabeceraPlataforma(rowTitle, rowIndex))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={2}>Sin datos</td>
              </tr>
            ) : (
              columns.map((col, colIndex) => (
                <tr key={colIndex}>
                  <th className="tablaCalculadora__dato">
                    {col}{currencyColumns.includes(colIndex) && ' ($)'}
                  </th>
                  {rows.map((_, rowIndex) => celda(rowIndex, colIndex))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

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
            rows.map((rowTitle, rowIndex) => (
              <tr key={rowIndex}>
                {cabeceraPlataforma(rowTitle, rowIndex)}
                {columns.map((_, colIndex) => celda(rowIndex, colIndex))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaReadOnly;
