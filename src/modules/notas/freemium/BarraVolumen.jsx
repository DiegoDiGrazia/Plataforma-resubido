import React, { useState, useEffect, useRef } from "react";

const BarraVolumen = ({
  valor,
  setValor,
  poblacion,
  setPoblacion,
  total = 0
}) => {
  const totalNum = Number(total) || 0;

  const [inputValue, setInputValue] = useState("");

  const isTypingRef = useRef(false);

  useEffect(() => {
    if (totalNum > 0 && !isTypingRef.current) {
      const nuevaPoblacion = Math.round((totalNum * valor) / 100);

      setInputValue(String(nuevaPoblacion));
      setPoblacion(nuevaPoblacion);
    }
  }, [valor, totalNum]);

  const handleRangeChange = (e) => {
    isTypingRef.current = false;

    const nuevoValor = Number(e.target.value);

    setValor(nuevoValor);

    const nuevaPoblacion = Math.round(
      (totalNum * nuevoValor) / 100
    );

    setInputValue(String(nuevaPoblacion));
    setPoblacion(nuevaPoblacion);
  };

  useEffect(() => {
  if (totalNum === 0) {
    setInputValue("");
  }
}, [totalNum]);

  const handleInputChange = (e) => {
    isTypingRef.current = true;

    let val = e.target.value.replace(/\D/g, "");

    setInputValue(val);

    if (val === "") {
      setValor(0);
      setPoblacion(0);
      return;
    }

    const numero = parseInt(val, 10);

    setPoblacion(numero);

    if (!totalNum || totalNum <= 0) return;

    let nuevoPorcentaje = Math.round(
      (numero / totalNum) * 100
    );

    if (nuevoPorcentaje > 100) nuevoPorcentaje = 100;
    if (nuevoPorcentaje < 0) nuevoPorcentaje = 0;

    setValor(nuevoPorcentaje);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}
      >
        <div style={{ width: "80%", maxWidth: "300px" }}>
          <input
            type="range"
            min={0}
            max={100}
            value={valor}
            onChange={handleRangeChange}
            style={{ width: "100%" }}
          />

          <div
            style={{
              textAlign: "center",
              marginTop: "8px"
            }}
          >
            {valor + "%"}
          </div>
        </div>

        <h3
          style={{
            width: "15%",
            marginLeft: "auto"
          }}
        >
          {inputValue === ""
            ? ""
            : Number(inputValue).toLocaleString("es-AR")}
        </h3>
      </div>

      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          style={{
            width: "150px",
            padding: "5px"
          }}
        />

        <div
          style={{
            fontSize: "12px",
            marginTop: "4px"
          }}
        >
          Poblacion alcanzada
        </div>
      </div>
    </div>
  );
};

export default BarraVolumen;