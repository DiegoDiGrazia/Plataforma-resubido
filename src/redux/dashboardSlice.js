import { createSlice } from '@reduxjs/toolkit';
import { periodoUltimoAño } from '../components/barplot/Barplot.jsx';

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    filtro: "Ultimo Año",
    periodos_api: periodoUltimoAño(),
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
  },
});

export const { setFiltro, setFechaDesde, setFechaHasta, setTodosLosClientes } = dashboardSlice.actions;
export default dashboardSlice.reducer;
