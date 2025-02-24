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
    }
  },
});

export const { setDesde, setHasta, setImpresiones,
              setUsuariosTotales,setImpresionesTotalesGoogle, setUsuariosTotalesMeta,
              setImpresionesTotalesInstagram, setImpresionesTotalesFacebook,setUsuariosTotalesGoogle, setFechas,
            setultimaFechaCargadaBarplot, setUltimoClienteCargadoBarplot } = barplotSlice.actions;
export default barplotSlice.reducer;
