import { createSlice } from '@reduxjs/toolkit';

// Define el estado inicial como una constante
const initialState = {
  desde: "",
  hasta: "",
  fechas: [],
  ultimaFechaCargadaBarplot: "",
  ultimoClienteCargadoBarplot: "",
  usuariosTotalesMeta: [],
  usuariosTotalesGoogle: [],
  usuariosTotales: [],
  comentarios_facebook: [],
  comentarios_instagram: [],
  likes_facebook: [],
  likes_instagram: [],
  reacciones_facebook: [],
  reacciones_instagram: [],
  compartidos_facebook: [],
  compartidos_instagram: [],
  impresionesTotalesFacebook: [],
  impresionesTotalesGoogle: [],
  impresionesTotalesInstagram: [],
  busqueda_clicks: [],
};

const barplotSlice = createSlice({
  name: 'barplot',
  initialState, // Usa la constante `initialState`
  reducers: {
    setFechas: (state, action) => {
      state.fechas = action.payload;
    },
  },
});

export const {
  setFechas,
} = barplotSlice.actions;

export default barplotSlice.reducer;