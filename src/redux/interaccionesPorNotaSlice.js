import { createSlice } from '@reduxjs/toolkit';

const interaccionesPorNota = createSlice({
  name: 'interaccionesPorNota',
  initialState: {
    notasMayorInteraccion : [],
    mediosMayorInteraccion :[],
    categoriasMayorInteraccion :[],
  },
  reducers: {
    setNotasMayorInteraccion: (state, action) => {
      state.notasMayorInteraccion = action.payload;
    },
    setMediosMayorInteraccion: (state, action) => {
      state.mediosMayorInteraccion = action.payload;
    },
    setCategoriasMayorInteraccion: (state, action) => {
      state.categoriasMayorInteraccion = action.payload;
    },

  },
});

export const { setNotasMayorInteraccion, setMediosMayorInteraccion, 
    setCategoriasMayorInteraccion } = interaccionesPorNota.actions;
export default interaccionesPorNota.reducer;
