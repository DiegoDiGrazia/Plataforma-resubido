import { createSlice } from '@reduxjs/toolkit';
import { resetCrearNota } from './crearNotaSlice.js';

// Datos de distribución de la nota que se está editando/publicando
// (Meta, X, YouTube, Search, banner, distribución diferida).
// Separado de crearNota: no forma parte del deshacer/rehacer del editor.
// con_distribucion y distribucion_prioritaria siguen en crearNota porque son
// atributos de la nota que llegan con setNotaAEditar.
const initialState = {
  fecha_vencimiento: '',
  comentarios: '',
  meta_titulo: '',
  meta_engagement: '',
  x_descripcion: '',
  yt_titulo: '',
  yt_descripcion: '',
  yt_link: '',
  search_titulo: '',
  search_descripcion: '',
  banner_data: '',
  diferida: false,
  fecha_diferida: '',
  hora_diferida: '',
};

const distribucionNotaSlice = createSlice({
  name: 'distribucionNota',
  initialState,
  reducers: {
    setDistribucionFechaVencimiento: (state, action) => { state.fecha_vencimiento = action.payload; },
    setDistribucionComentarios: (state, action) => { state.comentarios = action.payload; },
    setDistribucionMetaTitulo: (state, action) => { state.meta_titulo = action.payload; },
    setDistribucionMetaEngagement: (state, action) => { state.meta_engagement = action.payload; },
    setDistribucionXDescripcion: (state, action) => { state.x_descripcion = action.payload; },
    setDistribucionYtTitulo: (state, action) => { state.yt_titulo = action.payload; },
    setDistribucionYtDescripcion: (state, action) => { state.yt_descripcion = action.payload; },
    setDistribucionYtLink: (state, action) => { state.yt_link = action.payload; },
    setDistribucionSearchTitulo: (state, action) => { state.search_titulo = action.payload; },
    setDistribucionSearchDescripcion: (state, action) => { state.search_descripcion = action.payload; },
    setDistribucionBannerData: (state, action) => { state.banner_data = action.payload; },
    setDistribucionDiferida: (state, action) => { state.diferida = action.payload; },
    setDistribucionFechaDiferida: (state, action) => { state.fecha_diferida = action.payload; },
    setDistribucionHoraDiferida: (state, action) => { state.hora_diferida = action.payload; },
    resetDistribucionNota: () => initialState,
  },
  extraReducers: (builder) => {
    // Al resetear la nota (nueva nota, volver al listado) se limpia también la distribución
    builder.addCase(resetCrearNota, () => initialState);
  },
});

export const {
  setDistribucionFechaVencimiento, setDistribucionComentarios, setDistribucionMetaTitulo,
  setDistribucionMetaEngagement, setDistribucionXDescripcion, setDistribucionYtTitulo,
  setDistribucionYtDescripcion, setDistribucionYtLink, setDistribucionSearchTitulo,
  setDistribucionSearchDescripcion, setDistribucionBannerData, setDistribucionDiferida,
  setDistribucionFechaDiferida, setDistribucionHoraDiferida, resetDistribucionNota,
} = distribucionNotaSlice.actions;

export default distribucionNotaSlice.reducer;
