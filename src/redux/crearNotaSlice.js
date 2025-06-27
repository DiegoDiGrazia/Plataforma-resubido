import { createSlice } from '@reduxjs/toolkit';
import { comprimirImagen } from '../components/nota/componetesNota/ImagenPrincipal.jsx';

function extraerTagImg(texto) {
  const match = texto.match(/<img[^>]*>/);
  return match ? match[0] : null;
}

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
      textoParrafo = textoParrafo.replace(`<strong>${strong.textContent}</strong>`, "").trim();
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
export async function convertirImagenBase64(url, maxWidth = 1600) {
  try {
    url = url.replace("https://panel.serviciosd.com/img/", "https://noticiasd.com/wp-content/img/");
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error al descargar la imagen: ${response.status}`);
    }

    const blob = await response.blob();

    const base64 = await comprimirImagen(blob, 1, maxWidth); 

    return base64;

  } catch (error) {
    console.error("Error en convertirImagenBase64:", error);
    throw error;
  }
}



const initialState = {
  listaDeImagenesContenidoEnBase64: "", ///listo
  epigrafeImagenPpal: "", ///listo
  tituloNota: "", ///listo
  contenidoNota: [], // [[tipo, contenido, abre etiqueta, cierra etiqueta ]]
  categorias: [],
  categoriasNombres: "", ///listo
  categoriasActivas: [], ///listo
  imagenPrincipal: null, ///listo
  imagenRRSS: null, ///listo
  con_distribucion: '0', /// listo
  copete: "", ///listo
  comentarios: "", /// listo
  distribucion_prioritaria: '0', /// listo
  engagement: "", /// listo
  autor: "", /// listo
  autor_cliente: "", /// listo
  es_demo: '0', /// listo
  es_home: '0', /// listo
  etiquetas: [],
  estado: "", /// listo
  id_noti: "",
  tipoContenido: "gestion",
  f_pub: "",
  f_vence: "",
  engagement: "",
  bajada: "",
  provincia: {
    "provincia_id": "",
    "nombre": "",
    "iso_nombre": "",
    "categoria": "",
    "centroide_lat": "",
    "centroide_lon": "",
    "iso_id": "",
    "nombre_completo": "",
    "Poblacion": ""
  },
  municipio: {
    "municipio_id": "",
    "nombre": "",
    "nombre_completo": "",
    "provincia_id": "",
    "centroide_lat": "",
    "centroide_lon": "",
    "categoria": "",
    "poblacion": ""
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
  atachmentsArchivos: {
    attachment_archivo1: null,
    attachment_archivo2: null,
    attachment_archivo3: null,
  },
  attachment_video1: null,
  numeroDeAtachment: 1,
  id_att: "",
  cliente: "",
};

const crearNotaSlice = createSlice({
  name: 'crearNota',
  initialState,
  reducers: {
    setCopete: (state, action) => {
      state.copete = action.payload;
    },
    setEpigrafeImagenPpal: (state, action) => {
      state.epigrafeImagenPpal = action.payload;
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
    setAttachment_video1: (state,action) =>{
      state.attachment_video1 = action.payload
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
    setAttachmentToNull: (state, action) => {
      const numero = action.payload; 
      const key = `attachment_${numero}`;
      if (state.atachments.hasOwnProperty(key)) {
        state.atachments[key] = null;
      }
    },
    setAttachmentArchivoToNull: (state, action) => {
      const numero = action.payload; 
      const key = `attachment_${numero}`;
      if (state.atachmentsArchivos.hasOwnProperty(key)) {
        state.atachmentsArchivos[key] = null;
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
      if(action.payload[4] !== undefined) {
        state.contenidoNota[indice][4] = action.payload[4];}
    },
    setEpigrafeDeImagen: (state, action) => {
      ///Recibe indice( action.payload[0] ) y epigrafe action.payload[1]
      const indice = action.payload[0];
      const epigrafe = action.payload[1];
      const tagImg = extraerTagImg(state.contenidoNota[indice][2]);
      state.contenidoNota[indice][2] = tagImg + `<span class="epigrafe">${epigrafe}</span>`;   
    },
    setCategorias: (state, action) => {
      state.categorias = action.payload;
    },
    setNotaAEditar: (state, action) => {
      const nota = action.payload;
      state.tituloNota = nota.titulo;
      state.copete = nota.copete;
      state.comentarios = nota.comentarios;
      state.categoriasNombres = nota.categorias;
      state.engagement = nota.engagement;
      state.es_demo = nota.es_demo;
      state.es_home = nota.es_home;
      state.autor = nota.autor;
      state.autor_cliente = nota.autor_cliente;
      state.con_distribucion = nota.con_distribucion;
      state.distribucion_prioritaria = nota.distribucion_prioritaria == 'Prioritaria' ? '1' : nota.distribucion_prioritaria;
      state.estado = nota.estado;
      state.id_noti = nota.id;
      state.etiquetas = nota.etiquetas.split(",");
      state.f_vence = nota.fecha_vencimiento;
      state.f_pub = nota.fecha_publicacion;
      state.autor = nota.autor;
      state.pais = {'nombre': nota.pais };
      state.provincia = {'nombre': nota.provincia };
      state.municipio = {'nombre': nota.municipio };
      state.cliente = nota.cliente;
      state.engagement = nota.engagement || nota.titulo;
      state.bajada = nota.extracto || nota.copete;
      state.tipoContenido = nota.tipo_contenido;
      state.epigrafeImagenPpal = nota.epigrafe_ppal || "";
    },
    setContenidoAEditar: (state, action) => {
    state.contenidoNota = [...state.contenidoNota, ...action.payload];
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
    setFechaPublicacion: (state, action) => {
      state.f_pub= action.payload;
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
    setComentario: (state, action) => {
      state.comentarios = action.payload;
    },
    ///ejemplo dispatch(setAtachment({ key, value }));
    setAtachment: (state, action) => {
      const { key, value } = action.payload; // Extraer valores del payload
      if (state.atachments.hasOwnProperty(key)) {
        state.atachments[key] = value; // Actualizar el attachment correspondiente
      }
    },
    setAttachmentArchivo: (state, action) => {
      const { key, value } = action.payload; // Extraer valores del payload
      if (state.atachmentsArchivos.hasOwnProperty(key)) {
        state.atachmentsArchivos[key] = value; // Actualizar el attachment correspondiente
      }
    },
    setNumeroDeAtachment: (state, action) => {
      state.numeroDeAtachment = action.payload
    },
    setSelectedOptionDistribucion: (state, action) => {
      state.con_distribucion = action.payload;
    },
    setSumarUnoAlNumeroDeAtachment: (state, action) => {
      state.numeroDeAtachment = state.numeroDeAtachment + 1
    },
    setIdAtt: (state, action) => {
      state.id_att = action.payload
    },
    setCategoriasActivasEnStore: (state, action) => {
      state.categoriasActivas = action.payload;
    },
    setClienteNota: (state,action) => {
      state.cliente = action.payload;
    },
    resetCrearNota: () => initialState
  }
});

export const {
  setTituloNota,setAttachmentArchivo,setAttachmentArchivoToNull, setClienteNota, setContenidoNota, setAttachment_video1, DeleteContenidoPorIndice, setContenidoPorIndice,setFechaPublicacion, setAttachmentToNull,
  SubirContenidoPorIndice, BajarContenidoPorIndice, setCategorias, setImagenPrincipal, setImagenRRSS,
  setCopete, setNotaAEditar, setContenidoAEditar, setItemsEtiquetas, setEsDemo, setNoHome, setCategoriasActivasEnStore,
  setDistribucionProioritaria, setTipoContenido, setFechaVencimiento, setBajada, setEngagement, setComentario, setSelectedOptionDistribucion,
  setAutor, setMunicipio,setEpigrafeImagenPpal, setMunicipios, setProvincia,setPais, setIdAtt,setProvincias, resetCrearNota, setEpigrafeDeImagen, setListaImagenesContenidoEnBase64, setAtachment, setSumarUnoAlNumeroDeAtachment
} = crearNotaSlice.actions;

export default crearNotaSlice.reducer;