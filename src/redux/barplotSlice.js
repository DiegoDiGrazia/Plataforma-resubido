import { createSlice } from '@reduxjs/toolkit';

const barplotSlice = createSlice({
  name: 'barplot',
  initialState: {
    desde: "",
    hasta: "",
    fechas: [],
    ultimaFechaCargadaBarplot : "",
    ultimoClienteCargadoBarplot : "",


    usuariosTotalesMeta: [],
    usuariosTotalesGoogle: [],
    usuariosTotales: [],
    
    comentarios_facebook : [],  
    comentarios_instagram : [],
    likes_facebook: [],
    likes_instagram: [],
    reacciones_facebook: [],
    reacciones_instagram: [],
    compartidos_facebook: [],
    compartidos_instagram: [],

    impresionesTotalesFacebook: [],
    impresionesTotalesGoogle: [],
    impresionesTotalesInstagram: [],
  },
  reducers: {
    setDesde: (state, action) => {
      state.desde = action.payload;
    },
    setHasta: (state, action) => {
      state.hasta = action.payload;
    },
    setFechas: (state, action) => {
      state.fechas.push(action.payload)
    },

    setUsuariosTotalesMeta: (state, action) => {
        state.usuariosTotalesMeta.push(action.payload);
    },
    setUsuariosTotalesGoogle: (state, action) => {
      state.usuariosTotalesGoogle.push(action.payload);
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
    setultimaFechaCargadaBarplot: (state,action) => {
      state.ultimaFechaCargadaBarplot = action.payload
    },
    setUltimoClienteCargadoBarplot: (state,action) => {
      state.ultimoClienteCargadoBarplot = action.payload
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
  },
});

export const { setDesde, setHasta, setImpresiones,
              setUsuariosTotales,setImpresionesTotalesGoogle, setUsuariosTotalesMeta,
              setImpresionesTotalesInstagram, setImpresionesTotalesFacebook,setUsuariosTotalesGoogle, setFechas,
            setultimaFechaCargadaBarplot, setUltimoClienteCargadoBarplot, setComentariosFacebook, setComentariosInstagram,
            setLikesFacebook,setLikesInstagram,setCompartidosFacebook,setCompartidosInstagram,setReaccionesFacebook,setReaccionesInstagram} = barplotSlice.actions;
export default barplotSlice.reducer;
