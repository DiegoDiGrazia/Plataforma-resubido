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
      <span className="nd-text-md nd-fw-bold">
        {label}
      </span>

      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="nd-text-xl nd-fw-bold"
      />
    </div>
  );
};

export default InputFecha;
