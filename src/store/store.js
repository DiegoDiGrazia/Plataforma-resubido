// src/redux/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createMigrate } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage para web

// Importa tus slices
import dashboardSlice from "./dashboardSlice.js";
import formularioSlice from "./formularioSlice.js";
import barplotSlice from "./barplotSlice.js";
import interaccionesPorNotaSlice from "./interaccionesPorNotaSlice.js";
import notasSlice from "./notasSlice.js";
import crearNotaSlice from "./crearNotaSlice.js";
import cargadoSlice from "./cargadosSlice.js";
import datospdfSlice from "./datospdfSlice.js";

// Combina todos los slices
const rootReducer = combineReducers({
  formulario: formularioSlice,
  barplot: barplotSlice,
  dashboard: dashboardSlice,
  interaccionesPorNota: interaccionesPorNotaSlice,
  notas: notasSlice,
  crearNota: crearNotaSlice,
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
};

// Configuración de Redux Persist
const persistConfig = {
  key: "root",
  version: 1,
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
