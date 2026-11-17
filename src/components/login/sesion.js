import { login } from '../Apis/authApi.js';
import { updateEmail, updateToken, updateCliente, updateIdCliente, updateEsEditor, updateUsuario } from '../../redux/formularioSlice';

// /auth/login devuelve {token, expiration_date, usuario}, con usuario =
// {id, email, nombre, perfil, cliente, id_cliente, id_pais, celular_reporte}.
// id_cliente queda como number (o null si el usuario es editor, sin cliente).
const normalizarUsuario = (usuario) => ({
    ...usuario,
    cliente: usuario.cliente || '',
    id_cliente: usuario.id_cliente ?? null,
});

// Hace el login. Si falla, tira el error de authApi (con status, message y retryAfter)
// para que la pantalla decida que mostrar.
export const autenticar = async (email, clave) => {
    const { token, usuario } = await login(email, clave);
    return { token, usuario: normalizarUsuario(usuario) };
};

export const guardarSesion = (dispatch, email, { token, usuario }) => {
    dispatch(updateEmail(email.trim().toLowerCase()));
    dispatch(updateToken(token));
    dispatch(updateUsuario(usuario));
    dispatch(updateCliente(usuario.cliente));
    dispatch(updateIdCliente(usuario.id_cliente));
    dispatch(updateEsEditor(!usuario.cliente));
};

export const rutaInicial = (usuario) => (usuario.cliente ? '/dashboard' : '/notasEditorial');
