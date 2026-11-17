import { createSlice } from '@reduxjs/toolkit';

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
