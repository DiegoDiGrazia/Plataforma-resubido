import React from "react";

const IframeNota = ({ url, width = 300, height = 250, title= ""}) => {
  return (
    <>
    <h3 style={{ textAlign: 'start', fontSize: '14px', margin: '5px 0' }}>{title}</h3>
    <div style={{ width: width, height: height, overflow: "hidden", border: "1px solid #000" }}>
      <iframe
        src={url}
        width={width}
        height={height}
        style={{ border: 0 }}
        scrolling="auto" // <--- Esto permite scroll si el contenido es más grande
        frameBorder="0"
      />
    </div>
    </>
  );
};

export default IframeNota;