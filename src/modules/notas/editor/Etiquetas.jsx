import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "cropperjs/dist/cropper.css";
import { setItemsEtiquetas } from "@/store/crearNotaSlice";

const Etiquetas = () => {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState("");
  const itemsEtiquetas = useSelector((state) => state.crearNota.etiquetas) || [];


  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    const value = inputValue.trim();
    if (!value) return;

    if (itemsEtiquetas.includes(value)) {
      setInputValue("");
      return;
    }

    dispatch(setItemsEtiquetas([value, ...itemsEtiquetas]));
    setInputValue("");
  }
};

  const handleDelete = (indexToDelete) => {
    dispatch(setItemsEtiquetas(itemsEtiquetas.filter((_, index) => index !== indexToDelete)));
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        placeholder="Escribe una etiqueta y presiona Enter"
        className="form-control nd-text-md"
      />
      <div className="mt-3">
        {itemsEtiquetas &&
          itemsEtiquetas.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--nd-color-bg-muted)",
                padding: "2px",
                marginBottom: "5px",
                borderRadius: 'var(--nd-radius-sm)',
              }}
            >
              <span>{item}</span>
              <button
                onClick={() => handleDelete(index)}
                style={{
                  color: "var(--nd-color-text)",
                  border: "none",
                  borderRadius: "0px",
                  padding: "2px 2px",
                  cursor: "pointer",
                }}
              >
                X
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Etiquetas;
