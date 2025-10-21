// src/redux/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
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

// Configuración de Redux Persist
const persistConfig = {
  key: "root",
  storage, // esto usa localStorage en web
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
