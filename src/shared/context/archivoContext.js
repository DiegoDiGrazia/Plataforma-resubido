// context/ArchivoContext.js
import { createContext, useState } from "react";
import React from "react"; 

export const ArchivoContext = createContext();

export const ArchivoProvider = ({ children }) => {
  const [archivo, setArchivo] = useState(null); // puede ser File, Blob, etc.

  return (
    <ArchivoContext.Provider value={{ archivo, setArchivo }}>
      {children}
    </ArchivoContext.Provider>
  );
};