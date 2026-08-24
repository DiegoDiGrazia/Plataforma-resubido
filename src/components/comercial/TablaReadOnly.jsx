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
  
  const formatearNumero = (numero) => {
    if (numero === "" || numero === undefined || numero === null || isNaN(numero)) return "";
    return Math.round(Number(numero)).toLocaleString('es-AR');
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "600px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", backgroundColor: "#f2f2f2", width: "150px" }} />
            {columns.map((col, index) => (
              <th key={index} style={{ border: "1px solid #ccc", padding: "8px", backgroundColor: "#f2f2f2", textAlign: "center" }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ textAlign: "center", padding: "10px" }}>Sin datos</td>
            </tr>
          ) : (
            rows.map((rowTitle, rowIndex) => {
              const isTotalsRow = hasTotalsRow && rowIndex === rows.length - 1;
              const showCheckbox = hasTotalsRow ? rowIndex < rows.length - 1 : true;

              return (
                <tr key={rowIndex}>
                  <th style={{ border: "1px solid #ccc", padding: "8px", backgroundColor: "#f2f2f2", textAlign: "left", fontWeight: "bold" }}>
                    {showCheckbox && (
                      <input
                        type="checkbox"
                        checked={selectedRows[rowIndex]}
                        onChange={() => onToggleRow(rowIndex)}
                        style={{ marginRight: "6px" }}
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

                    let bgColor = "white";
                    let textColor = "black";
                    if (isHighlightedTotal) {
                      bgColor = "#069435";
                    }

                    return (
                      <td key={colIndex} style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center", fontWeight: isTotalsRow ? "bold" : "normal", backgroundColor: bgColor, color: textColor}}>
                        {isInput ? (
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            {isCurrency && <span>$</span>}
                            <input
                              type="number"
                              value={valorOverride !== undefined ? valorOverride : valorCalculado}
                              onChange={(e) => onCellChange(rowIndex, colIndex, e.target.value)}
                              style={{ width: "75px", padding: "4px", border: "1px solid #ccc", borderRadius: "4px" }}
                            />
                          </div>
                        ) : (
                          valorCalculado !== "" ? (
                            <>{isCurrency && <span>$ </span>}{formatearNumero(valorCalculado)}</>
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