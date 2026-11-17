import React from "react";

const InputFecha = ({ label, name, value, onChange }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        padding: "0px"
      }}
    >
      <span style={{ fontSize: "16px", fontWeight: "bold" }}>
        {label}
      </span>

      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        style={{ fontSize: "20px", fontWeight: "bold" }}
      />
    </div>
  );
};

export default InputFecha;
