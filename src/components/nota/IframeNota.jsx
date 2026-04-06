import React from "react";

const IframeBanner = ({
  url,
  width = 300,
  height = 250,
  titulo
}) => {
  return (
    <div className="iframe-container">
      {titulo && <h4 className="iframe-title">{titulo}</h4>}
      
      <iframe
        className="banner-iframe"
        src={url}
        width={width}
        height={height}
        scrolling="no"
        frameBorder="0"
        title={titulo || "iframe-banner"}
      />
    </div>
  );
};

export default IframeBanner;