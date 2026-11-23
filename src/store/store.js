// src/redux/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createMigrate } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage para web
import { guardarBorrador } from "@/shared/utils/borradoresDB.js";

// Importa tus slices
import dashboardSlice from "./dashboardSlice.js";
import formularioSlice from "./formularioSlice.js";
import barplotSlice from "./barplotSlice.js";
import interaccionesPorNotaSlice from "./interaccionesPorNotaSlice.js";
import crearNotaSlice from "./crearNotaSlice.js";
import distribucionNotaSlice from "./distribucionNotaSlice.js";
import cargadoSlice from "./cargadosSlice.js";
import datospdfSlice from "./datospdfSlice.js";

// Combina todos los slices
const rootReducer = combineReducers({
  formulario: formularioSlice,
  barplot: barplotSlice,
  dashboard: dashboardSlice,
  interaccionesPorNota: interaccionesPorNotaSlice,
  crearNota: crearNotaSlice,
  distribucionNota: distribucionNotaSlice,
  cargado: cargadoSlice,
  datospdf: datospdfSlice,
});

// Migraciones del estado guardado en localStorage
const aNumero = (id) => (id === "" || id == null ? null : Number(id));
const migraciones = {
  // v1: id_cliente pasa de string (login PHP) a number
  1: (state) => {
    const formulario = state?.formulario;
    if (!formulario) return state;
    const usuario = formulario.usuario && typeof formulario.usuario === "object"
      ? { ...formulario.usuario, id_cliente: aNumero(formulario.usuario.id_cliente) }
      : formulario.usuario;
    return { ...state, formulario: { ...formulario, id_cliente: aNumero(formulario.id_cliente), usuario } };
  },
  // v2: los campos distribucion_* salen de crearNota a su propio slice (distribucionNota)
  2: (state) => {
    const crearNota = state?.crearNota;
    if (!crearNota) return state;
    const distribucionNota = {};
    const restoNota = {};
    for (const [key, value] of Object.entries(crearNota)) {
      const esDeDistribucion = key.startsWith("distribucion_") && key !== "distribucion_prioritaria";
      if (esDeDistribucion) distribucionNota[key.slice("distribucion_".length)] = value;
      else restoNota[key] = value;
    }
    return { ...state, crearNota: restoNota, distribucionNota };
  },
  // v3: la nota en edición deja de persistirse acá (se pisaba entre pestañas y no entraba en
  // localStorage por las imágenes). Si había una a medio editar, pasa a borrador local (IndexedDB)
  // y aparece en "Borradores en este navegador" del listado de notas.
  3: (state) => {
    const { crearNota, distribucionNota, ...resto } = state || {};
    const tieneContenido = crearNota && (crearNota.tituloNota || crearNota.contenidoNota?.length);
    if (tieneContenido) {
      const clave = crearNota.id_noti && String(crearNota.id_noti) !== "0"
        ? String(crearNota.id_noti)
        : `nueva-recuperada-${Date.now()}`;
      guardarBorrador(clave, {
        nota: { ...crearNota, claveEdicion: clave },
        distribucion: distribucionNota || {},
      }).catch(() => {});
    }
    return resto;
  },
  // v4: se elimina el slice `notas` (nadie lo leía ni lo escribía)
  4: (state) => {
    const { notas, ...resto } = state || {}; // eslint-disable-line no-unused-vars
    return resto;
  },
};

// Configuración de Redux Persist
const persistConfig = {
  key: "root",
  version: 4,
  // La nota en edición vive en IndexedDB, un borrador por nota (ver modules/notas/EditorNota.jsx)
  blacklist: ["crearNota", "distribucionNota"],
  storage, // esto usa localStorage en web
  migrate: createMigrate(migraciones, { debug: false }),
};

// Reducer persistido
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configura el store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

// Persistor para Redux Persist
export const persistor = persistStore(store);
export default store;
