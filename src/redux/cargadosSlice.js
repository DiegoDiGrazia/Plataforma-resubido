import { createSlice } from '@reduxjs/toolkit';

const cargadoSlice = createSlice({
  name: 'cargado',
  initialState: {
    fechaActual: "",
  },
  reducers: {
    setFechaActual: (state, action) => {
      state.fechaActual = action.payload;
    },
  },
});

export const { setFechaActual, } = cargadoSlice.actions;
export default cargadoSlice.reducer;
