import React from "react";

const TablaReadOnly = ({ columns = [], rows = [], data = [], selectedRows = [], onToggleRow }) => {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          minWidth: "600px",
        }}
      >
        <thead>
          <tr>
            {/* Celda 0x0 vacía */}
            <th
              style={{
                border: "1px solid #ccc",
                backgroundColor: "#f2f2f2",
                width: "150px",
              }}
            />
            {columns.map((col, index) => (
              <th
                key={index}
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  backgroundColor: "#f2f2f2",
                  textAlign: "left",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                style={{ textAlign: "center", padding: "10px" }}
              >
                Sin datos
              </td>
            </tr>
          ) : (
            rows.map((rowTitle, rowIndex) => (
  <tr key={rowIndex}>
    <th
      style={{
        border: "1px solid #ccc",
        padding: "8px",
        backgroundColor: "#f2f2f2",
        textAlign: "left",
        fontWeight: "bold",
      }}
    >
      {rowIndex < rows.length - 1 && (
        <input
          type="checkbox"
          checked={selectedRows[rowIndex]}
          onChange={() => onToggleRow(rowIndex)}
          style={{ marginRight: "6px" }}
        />
      )}
      {rowTitle}
    </th>

                {columns.map((_, colIndex) => (
                  <td
                    key={colIndex}
                    style={{
                      border: "1px solid #ccc",
                      padding: "8px",
                    }}
                  >
                    {data?.[rowIndex]?.[colIndex] ?? "-"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaReadOnly;
