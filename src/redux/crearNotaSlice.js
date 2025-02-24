import { createSlice } from '@reduxjs/toolkit';

 export async function analizarHTML(html) {
  const resultados = [];

  // Crear un contenedor temporal para procesar el HTML
  const div = document.createElement("div");
  div.innerHTML = html;

  // Manejar párrafos
  const parrafos = div.querySelectorAll("p");
  parrafos.forEach(parrafo => {
    const strong = parrafo.querySelector("strong");
    const br = strong?.nextSibling?.nodeName === "BR";

    if (strong && br) {
      const subtitulo = strong.textContent.trim();
      resultados.push(["subtitulo", subtitulo]);
    }

    let textoParrafo = parrafo.innerHTML;

    if (strong && br) {
      textoParrafo = textoParrafo.replace(`<strong>${strong.textContent}</strong><br>`, "").trim();
    } else if (strong) {
      textoParrafo = textoParrafo.replace(`<strong>${strong.textContent}</strong>`, "").trim();
    }

    if (textoParrafo) {
      resultados.push(["parrafo", textoParrafo]);
    }
  });

  // Manejar imágenes

  return resultados;
}

// Función para convertir imágenes a Base64
export async function convertirImagenBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const crearNotaSlice = createSlice({
  name: 'crearNota',
  initialState: {
    tituloNota : "", ///listo
    contenidoNota :[],
    categorias: [], 
    categoriasNombres: "", ///listo
    imagenPrincipal: null,
    imagenRRSS: null,
    copete : "", ///listo
    comentarios: "", /// listo
    conDistribucion: "0",/// listo
    distribucion_prioritaria: "0",/// listo
    engagement: "", /// listo
    autor: "", /// listo 
    autor_cliente: "",/// listo
    es_demo: "0", /// listo
    es_home: "0", /// listo
    estado: "", /// listo
    id_noti: "",

  },
  reducers: {
    setCopete: (state, action) => {
      state.copete = action.payload;
    },  
    setTituloNota: (state, action) => {
      state.tituloNota = action.payload;
    },  
    setImagenPrincipal: (state, action) => {
      state.imagenPrincipal = action.payload;
    },  
    setImagenRRSS: (state, action) => {
      state.imagenRRSS = action.payload;
    },
    setImagenRRSS: (state, action) => {
      state.imagenRRSS = action.payload;
    },  
    setContenidoNota: (state, action) => { /// aca guardo las imagenes, subtitulos y parrafos
        state.contenidoNota.push(action.payload)
    },
    DeleteContenidoPorIndice: (state, action) =>{ /// action payload
        state.contenidoNota.splice(action.payload, 1)
    },
    SubirContenidoPorIndice: (state, action) => { 
      const index = action.payload;
      if (index >= 0 && index < state.contenidoNota.length - 1) {
        // Realiza el swap entre el elemento actual y el siguiente
        const temp = state.contenidoNota[index];
        state.contenidoNota[index] = state.contenidoNota[index + 1];
        state.contenidoNota[index + 1] = temp;
      }
    },
    BajarContenidoPorIndice: (state, action) => { 
      const index = action.payload;
      if (index > 0 && index < state.contenidoNota.length) {
        // Realiza el swap entre el elemento actual y el anterior
        const temp = state.contenidoNota[index];
        state.contenidoNota[index] = state.contenidoNota[index - 1];
        state.contenidoNota[index - 1] = temp;
      }
    },
    ///en action.payload, se aloja contenido el indice
    /// y el contenido con este formato [indice, contenido]
    setContenidoPorIndice: (state, action) =>{
      const indice = action.payload[0];
      const contenido = action.payload[1];
      state.contenidoNota[indice][1] = contenido;
      state.contenidoNota[indice][2] = action.payload[2]
      state.contenidoNota[indice][3] = action.payload[3]

    },
    setCategorias: (state, action) =>{
      state.categorias = action.payload;
    },
    setNotaAEditar:(state, action) =>{
      const nota = action.payload;
      state.tituloNota = nota.titulo;
      state.copete = nota.copete;
      state.categoriasNombres = nota.categorias;
      state.comentarios = nota.comentarios;
      state.engagement = nota.engagement;
      state.es_demo = nota.es_demo;
      state.es_home = nota.es_home;
      state.autor = nota.autor;
      state.autor_cliente = nota.autor_cliente;
      state.conDistribucion = nota.conDistribucion;
      state.distribucion_prioritaria = nota.distribucion_prioritaria;
      state.estado = nota.estado;
      state.id_noti = nota.term_id;

    },
    setContenidoAEditar: (state, action) =>{
      state.contenidoNota= action.payload;
    },
    }
});

export const { setTituloNota, setContenidoNota, DeleteContenidoPorIndice, setContenidoPorIndice,
                SubirContenidoPorIndice, BajarContenidoPorIndice, setCategorias, setImagenPrincipal, setImagenRRSS,
                setCopete, setNotaAEditar, setContenidoAEditar
 } = crearNotaSlice.actions;
export default crearNotaSlice.reducer;
