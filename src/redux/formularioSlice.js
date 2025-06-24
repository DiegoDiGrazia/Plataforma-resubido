import { createSlice } from "@reduxjs/toolkit";


const formularioSlice = createSlice({
    name: "formulario",
    initialState: {
        email: "",
        contraseña: "",
        token: "",
        status: "",
        codigoRecuperacion : "",
        cliente:"",
        id_cliente :"",
        id_usuario :"",
        es_editor : false,
        usuario: "",
        todosLosClientesActivado: false,
        paisUsuario: "",
        provinciaUsuario: "",
        municipioUsuario: "",

    },
    reducers: {
        updateEmail: (state, action) => {
            state.email = action.payload;  // Asignación directa para cadenas de texto
        },
        updateIdUsuario: (state, action) => {
            state.email = action.payload;  // Asignación directa para cadenas de texto
        },
        updateContraseña: (state, action) => {
            state.contraseña = action.payload;  // Asignación directa para cadenas de texto
        },
        updateToken: (state, action) => {
            state.token = action.payload;  // Asignación directa para cadenas de texto
        },
        updateStatus: (state, action) => {
            state.status = action.payload;  // Asignación directa para cadenas de texto
        },
        updateCodigoRecuperacion: (state, action) => {
            state.codigoRecuperacion = action.payload;  // Asignación directa para cadenas de texto
        },
        updateCliente: (state, action) => {
            state.cliente = action.payload;  // Asignación directa para cadenas de texto
        },
        updateIdCliente: (state, action) => {
            state.id_cliente = action.payload;  // Asignación directa para cadenas de texto
        },
        updateEsEditor: (state, action) => {
            state.es_editor = action.payload;  // Asignación directa para cadenas de texto
        },
        updateUsuario: (state, action) =>{
            state.usuario = action.payload;
        },
        updatePaisUsuario: (state, action) => {
            state.paisUsuario = action.payload;  // Asignación directa para cadenas de texto
        },
        updateProvinciaUsuario: (state, action) => {
            state.provinciaUsuario = action.payload;  // Asignación directa para cadenas de texto
        },
        updateMunicipioUsuario: (state, action) => {
            state.municipioUsuario = action.payload;  // Asignación directa para cadenas de texto
        },

        updateActivarTodosLosClientes: (state,action ) =>{
            state.todosLosClientesActivado = action.payload;
        },
    }
});

export const { updateEmail, updateContraseña,updateEsEditor, updateCodigoRecuperacion, updateMunicipioUsuario,
    updatePaisUsuario, updateProvinciaUsuario,
    updateToken, updateCliente, updateIdCliente, setTodosLosClientes,updateUsuario, updateActivarTodosLosClientes,updateIdUsuario } = formularioSlice.actions;
export default formularioSlice.reducer;