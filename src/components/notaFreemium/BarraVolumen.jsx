import React from "react";

const BarraVolumen = ({ valor, setValor, total= '0' }) => {
  const handleChange = (e) => {
    setValor(Number(e.target.value));
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ width: "80%", maxWidth: "300px" }}>
            <input
            type="range"
            min={1}
            max={100}
            value={valor}
            onChange={handleChange}
            style={{ width: "100%" }}
            />
            <div style={{ textAlign: "center", marginTop: "8px" }}>
            {valor + "%"}
            </div>
        </div>

        <h3 style={{ width: "15%", marginLeft: "auto" }}>
            {(Number(total) * valor/100).toLocaleString('es-AR')}
        </h3>
    </div>
  );
};

export default BarraVolumen;