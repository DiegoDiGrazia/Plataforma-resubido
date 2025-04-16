import { createSlice } from '@reduxjs/toolkit';
import { periodoUltimoAño } from '../components/barplot/Barplot.jsx';

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    filtro: "Ultimo Año",
    periodos_api: "",
    desde: "", 
    hasta: "",
    todosLosClientes : [],
    nuevoSluce : "",
  },
  reducers: {
    setFiltro: (state, action) => {
      state.filtro = action.payload;
    },
    setFechaDesde: (state) => {
      state.desde = action.payload;
    },
    setFechaHasta: (state) => {
      state.desde = action.payload;
    },
    setTodosLosClientes: (state, action) => {
      state.todosLosClientes = action.payload;
    },
    setPeriodoApi: (state, action) => {
      state.periodos_api = action.payload;
    },
  },
});

export const { setFiltro, setFechaDesde, setFechaHasta, setTodosLosClientes,setPeriodoApi } = dashboardSlice.actions;
export default dashboardSlice.reducer;
