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
    setDesde: (state, action) => {
      state.desde = action.payload;
    },
    setHasta: (state, action) => {
      state.hasta = action.payload;
    },
    setFechas: (state, action) => {
      state.fechas = action.payload;
    },
    setUsuariosTotalesMeta: (state, action) => {
      state.usuariosTotalesMeta.push(action.payload);
    },
    setUsuariosTotalesGoogle: (state, action) => {
      state.usuariosTotalesGoogle.push(action.payload);
    },
    setBusquedaClicks: (state, action) => {
      state.busqueda_clicks.push(action.payload);
    },  
    setUsuariosTotales: (state, action) => {
      state.usuariosTotales.push(action.payload);
    },
    setImpresionesTotalesFacebook: (state, action) => {
      state.impresionesTotalesFacebook.push(action.payload);
    },
    setImpresionesTotalesGoogle: (state, action) => {
      state.impresionesTotalesGoogle.push(action.payload);
    },
    setImpresionesTotalesInstagram: (state, action) => {
      state.impresionesTotalesInstagram.push(action.payload);
    },
    setultimaFechaCargadaBarplot: (state, action) => {
      state.ultimaFechaCargadaBarplot = action.payload;
    },
    setUltimoClienteCargadoBarplot: (state, action) => {
      state.ultimoClienteCargadoBarplot = action.payload;
    },
    setComentariosFacebook: (state, action) => {
      state.comentarios_facebook.push(action.payload);
    },
    setComentariosInstagram: (state, action) => {
      state.comentarios_instagram.push(action.payload);
    },
    setLikesFacebook: (state, action) => {
      state.likes_facebook.push(action.payload);
    },
    setLikesInstagram: (state, action) => {
      state.likes_instagram.push(action.payload);
    },
    setReaccionesFacebook: (state, action) => {
      state.reacciones_facebook.push(action.payload);
    },
    setReaccionesInstagram: (state, action) => {
      state.reacciones_instagram.push(action.payload);
    },
    setCompartidosFacebook: (state, action) => {
      state.compartidos_facebook.push(action.payload);
    },
    setCompartidosInstagram: (state, action) => {
      state.compartidos_instagram.push(action.payload);
    },
    resetBarplot: (state) => {
      state.usuariosTotalesMeta = [];
      state.usuariosTotalesGoogle = [];
      state.usuariosTotales = [];
      state.comentarios_facebook = [];
      state.comentarios_instagram = [];
      state.likes_facebook = [];
      state.likes_instagram = [];
      state.reacciones_facebook = [];
      state.reacciones_instagram = [];
      state.compartidos_facebook = [];
      state.compartidos_instagram = [];
      state.impresionesTotalesFacebook = [];
      state.impresionesTotalesGoogle = [];
      state.impresionesTotalesInstagram = [];
      state.busqueda_clicks = [];
    },
  },
});

export const {
  setDesde,
  setHasta,
  setImpresiones,
  setUsuariosTotales,
  setImpresionesTotalesGoogle,
  setUsuariosTotalesMeta,
  setBusquedaClicks,
  resetBarplot,
  setImpresionesTotalesInstagram,
  setImpresionesTotalesFacebook,
  setUsuariosTotalesGoogle,
  setFechas,
  setultimaFechaCargadaBarplot,
  setUltimoClienteCargadoBarplot,
  setComentariosFacebook,
  setComentariosInstagram,
  setLikesFacebook,
  setLikesInstagram,
  setCompartidosFacebook,
  setCompartidosInstagram,
  setReaccionesFacebook,
  setReaccionesInstagram,
} = barplotSlice.actions;

export default barplotSlice.reducer;