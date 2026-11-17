import React, { useState, useRef } from "react";

const FileInput = ({
  title,
  onChange,
  onClear,        // 👈 viene de afuera
  accept = "*",
  multiple = false
}) => {
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    onChange(multiple ? selectedFiles : selectedFiles[0]);
  };

  const handleClear = () => {
    setFiles([]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onClear?.(); // 👈 se delega al padre
  };

  return (
    <div style={{ width: "100%" }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          cursor: "pointer",
          padding: "0px",
          fontWeight: "700",
          gap: "10px",
          margin: "10px 0px"
        }}
      >
        <span>{title}</span>

        <div style={{ display: "flex", gap: "8px" }}>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            style={{
              height: "30px",
              width: "200px"
            }}
          />

          {files.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                height: "30px",
                padding: "0 10px",
                cursor: "pointer"
              }}
            >
              borrar
            </button>
          )}
        </div>
      </label>

      {/* Lista de archivos */}
      {files.length > 0 && (
        <ul style={{ marginTop: "8px", paddingLeft: "18px" }}>
          {files.map((file, index) => (
            <li key={index} style={{ fontWeight: "400", fontSize: "14px" }}>
              {file.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileInput;
