import React from "react";

const IframeNotaEscalable = ({ url, width = 360, baseWidth = 720, baseHeight = 1280 }) => {
  // Calculamos altura proporcional automáticamente
  const height = (width * baseHeight) / baseWidth;
  const scale = width / baseWidth;

  return (
    <div
      style={{
        width: width,
        height: height,
        overflow: "hidden",
        border: "1px solid #000",
        position: "relative",
      }}
    >
      <iframe
        src={url}
        style={{
          border: 0,
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        frameBorder="0"
        scrolling="no"
      />
    </div>
  );
};

export default IframeNotaEscalable;