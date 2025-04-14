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
  url = url.replace("https://panel.serviciosd.com/img/", "https://diego.serviciosd.com/oldpanel/");
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}


const initialState = {
  listaDeImagenesContenidoEnBase64: "", ///listo
  tituloNota: "", ///listo
  contenidoNota: [], // [[tipo, contenido, abre etiqueta, cierra etiqueta ]]
  categorias: [],
  categoriasNombres: "", ///listo
  imagenPrincipal: null, ///listo
  imagenRRSS: null, ///listo
  copete: "", ///listo
  comentarios: "", /// listo
  conDistribucion: "0", /// listo
  distribucion_prioritaria: false, /// listo
  engagement: "", /// listo
  autor: "", /// listo
  autor_cliente: "", /// listo
  es_demo: false, /// listo
  es_home: false, /// listo
  etiquetas: [],
  estado: "", /// listo
  id_noti: "",
  tipoContenido: "gestion",
  f_vence: "",
  engagement: "",
  bajada: "",
  provincia: {
    "provincia_id": "54",
    "nombre": "Misiones",
    "iso_nombre": "Misiones",
    "categoria": "Provincia",
    "centroide_lat": "-26.8753965086829",
    "centroide_lon": "-54.6516966230371",
    "iso_id": "AR-N",
    "nombre_completo": "Provincia de Misiones",
    "Poblacion": "0"
  },
  municipio: {
    "municipio_id": "746252",
    "nombre": "Beazley",
    "nombre_completo": "Comisión Municipal Beazley",
    "provincia_id": "74",
    "centroide_lat": "-33.7572721991329",
    "centroide_lon": "-66.6446207562444",
    "categoria": "Comisión Municipal",
    "poblacion": "0"
  },
  pais: {
    "nombre": "Argentina",
  },
  atachments: {
    attachment_1: null,
    attachment_2: null,
    attachment_3: null,
    attachment_4: null,
    attachment_5: null,
    attachment_6: null,
    attachment_7: null,
    attachment_8: null,
    attachment_9: null,
    attachment_10: null,
  },
  numeroDeAtachment: 2,
  id_att: "",
};

const crearNotaSlice = createSlice({
  name: 'crearNota',
  initialState,
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
    setContenidoNota: (state, action) => {
      state.contenidoNota.push(action.payload);
    },
    DeleteContenidoPorIndice: (state, action) => {
      state.contenidoNota.splice(action.payload, 1);
    },
    SubirContenidoPorIndice: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.contenidoNota.length - 1) {
        const temp = state.contenidoNota[index];
        state.contenidoNota[index] = state.contenidoNota[index + 1];
        state.contenidoNota[index + 1] = temp;
      }
    },
    BajarContenidoPorIndice: (state, action) => {
      const index = action.payload;
      if (index > 0 && index < state.contenidoNota.length) {
        const temp = state.contenidoNota[index];
        state.contenidoNota[index] = state.contenidoNota[index - 1];
        state.contenidoNota[index - 1] = temp;
      }
    },
    setContenidoPorIndice: (state, action) => {
      const indice = action.payload[0];
      const contenido = action.payload[1];
      state.contenidoNota[indice][1] = contenido;
      state.contenidoNota[indice][2] = action.payload[2];
      state.contenidoNota[indice][3] = action.payload[3];
    },
    setCategorias: (state, action) => {
      state.categorias = action.payload;
    },
    setNotaAEditar: (state, action) => {
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
      state.id_noti = nota.id;
    },
    setContenidoAEditar: (state, action) => {
      state.contenidoNota = action.payload;
    },
    setItemsEtiquetas: (state, action) => {
      state.etiquetas = action.payload;
    },
    setEsDemo: (state, action) => {
      state.es_demo = action.payload;
    },
    setNoHome: (state, action) => {
      state.es_home = action.payload;
    },
    setDistribucionProioritaria: (state, action) => {
      state.distribucion_prioritaria = action.payload;
    },
    setTipoContenido: (state, action) => {
      state.tipoContenido = action.payload;
    },
    setFechaVencimiento: (state, action) => {
      state.f_vence = action.payload;
    },
    setEngagement: (state, action) => {
      state.engagement = action.payload;
    },
    setBajada: (state, action) => {
      state.bajada = action.payload;
    },
    setAutor: (state, action) => {
      state.autor = action.payload;
    },
    setProvincia: (state, action) => {
      state.provincia = action.payload;
    },
    setMunicipio: (state, action) => {
      state.municipio = action.payload;
    },
    setPais: (state, action) => {
      state.pais = action.payload;
    },
    setListaImagenesContenidoEnBase64: (state, action) => {
      state.listaDeImagenesContenidoEnBase64 = action.payload;
    },

    ///ejemplo dispatch(setAtachment({ key, value }));
    setAtachment: (state, action) => {
      const { key, value } = action.payload; // Extraer valores del payload
      if (state.atachments.hasOwnProperty(key)) {
        state.atachments[key] = value; // Actualizar el attachment correspondiente
      }
    },
    setNumeroDeAtachment: (state, action) => {
      state.numeroDeAtachment = action.payload
    },
    setSumarUnoAlNumeroDeAtachment: (state, action) => {
      console.log("Se ejecuta")
      state.numeroDeAtachment = state.numeroDeAtachment + 1
    },
    setIdAtt: (state, action) => {
      state.id_att = action.payload
    },
    

    resetCrearNota: () => initialState
  }
});

export const {
  setTituloNota, setContenidoNota, DeleteContenidoPorIndice, setContenidoPorIndice,
  SubirContenidoPorIndice, BajarContenidoPorIndice, setCategorias, setImagenPrincipal, setImagenRRSS,
  setCopete, setNotaAEditar, setContenidoAEditar, setItemsEtiquetas, setEsDemo, setNoHome,
  setDistribucionProioritaria, setTipoContenido, setFechaVencimiento, setBajada, setEngagement,
  setAutor, setMunicipio, setMunicipios, setProvincia,setPais, setIdAtt,setProvincias, resetCrearNota, setListaImagenesContenidoEnBase64, setAtachment, setSumarUnoAlNumeroDeAtachment
} = crearNotaSlice.actions;

export default crearNotaSlice.reducer;