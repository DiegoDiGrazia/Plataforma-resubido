// /crearNota y /publicarNota (rutas viejas): redirigen al editor con clave en la URL.
// Si hay una nota en memoria con clave, sigue con esa; si no, abre una nota nueva.
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { generarClaveNueva, rutaEditor, rutaPublicar } from './navegacionEditor';

const RedirigirEditorLegacy = ({ publicar = false }) => {
  const claveEnMemoria = useSelector((state) => state.crearNota.claveEdicion);
  const clave = claveEnMemoria || generarClaveNueva();
  return <Navigate to={publicar ? rutaPublicar(clave) : rutaEditor(clave)} replace />;
};

export default RedirigirEditorLegacy;
