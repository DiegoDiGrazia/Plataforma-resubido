import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "cropperjs/dist/cropper.css";
import { useDispatch, useSelector } from "react-redux";
import { setAutor } from "../../../redux/crearNotaSlice";

const IframesDistribucion = () => {
  const dispatch = useDispatch();
  const imagenPrincipal = useSelector((state) => state.crearNota.imagenPrincipal);

  const [posicion, setPosicion] = useState(50);

  const handlePosicionChange = (e) => {
    setPosicion(parseInt(e.target.value));
  };

  return (
    <div className="d-flex align-items-center gap-3">
      <div
        style={{
          width: "320px",
          height: "50px",
          overflow: "hidden",
          border: "1px solid #ccc",
          borderRadius: "8px",
          background: "#f8f9fa",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {imagenPrincipal && (
          <img
            src={imagenPrincipal}
            alt="Imagen Principal"
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
              transform: `translateY(${(50 - posicion) * 1.5}%)`,
              transition: "transform 0.2s ease",
            }}
          />
        )}
      </div>

            <div
        style={{
          width: "30px",
          height: "250px",
          overflow: "hidden",
          border: "1px solid #ccc",
          borderRadius: "8px",
          background: "#f8f9fa",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {imagenPrincipal && (
          <img
            src={imagenPrincipal}
            alt="Imagen Principal"
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
              transform: `translateY(${(50 - posicion) * 1.5}%)`,
              transition: "transform 0.2s ease",
            }}
          />
        )}
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={posicion}
        onChange={handlePosicionChange}
        style={{
          writingMode: "bt-lr",
          WebkitAppearance: "slider-vertical",
          height: "250px",
        }}
      />
    </div>
  );
};

export default IframesDistribucion;
