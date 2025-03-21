import { createSlice } from '@reduxjs/toolkit';
import { periodoUltimoAño } from '../components/barplot/Barplot.jsx';

const datospdfSlice = createSlice({
  name: 'datospdf',
  initialState: {
    barplot: "",
  },
  reducers: {
    setBarplot: (state, action) => {
      state.barplot = action.payload;
    },
  },
});

export const { setBarplot } = datospdfSlice.actions;
export default datospdfSlice.reducer;
