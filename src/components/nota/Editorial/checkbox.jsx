import React from "react";

const Checkbox = ({ title, value, onChange }) => {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        cursor: "pointer",
        padding: "0px",
        fontWeight: '700',
        margin: '10px 0'
      }}
    >
      <span>{title}</span>

      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        style={{height: '20px', width: '20px'}}
      />
    </label>
  );
};

export default Checkbox;