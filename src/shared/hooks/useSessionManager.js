import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verificarToken } from '@/api/tokenApi.js';
import { obtenerPaginas } from '@/api/paginasApi.js';
import { guardarSesion } from '@/modules/auth/sesion.js';
import { EVENTO_SESION_EXPIRADA } from '@/shared/utils/interceptor401.js';

import {
    updateToken,
    updatePaginasDelUsuario
} from '@/store/formularioSlice';

export const useSessionManager = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const dispatch = useDispatch();

  const tokenActual = useSelector((state) => state.formulario.token);

  useEffect(() => {
    let isMounted = true;
    const channel = new BroadcastChannel('sesion_plataforma');

    const marcarSesionExpirada = () => {
      if (!isMounted) return;
      setMostrarModal(true);
      channel.postMessage({ type: 'SESION_EXPIRADA' });
    };

    channel.onmessage = (event) => {
      if (event.data.type === 'SESION_EXPIRADA') {
        setMostrarModal(true);
      } else if (event.data.type === 'SESION_RESTAURADA') {
        setMostrarModal(false);
        dispatch(updateToken(event.data.token));
      }
    };

    window.addEventListener(EVENTO_SESION_EXPIRADA, marcarSesionExpirada);

    const intervalo = setInterval( async () => {
      if (!tokenActual) return;

      let respuesta;
      try {
        respuesta = await verificarToken(tokenActual);
      } catch (error) {
        // Sin conexión o error del servidor (5xx): no es una sesión vencida.
        // Se reintenta en el próximo chequeo; un 401 real llega como { active: false }.
        console.warn('No se pudo verificar el token, se reintenta en 30 s:', error);
        return;
      }

      if (!respuesta?.active) {
        marcarSesionExpirada();
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalo);
      window.removeEventListener(EVENTO_SESION_EXPIRADA, marcarSesionExpirada);
      channel.close();
    };
  }, [dispatch, tokenActual]);

  const reloguear = async (email, sesion) => {
    setMostrarModal(false);
    guardarSesion(dispatch, email, sesion);

    try {
        const paginas = await obtenerPaginas(sesion.token, sesion.usuario.perfil);
        dispatch(updatePaginasDelUsuario(paginas));
    } catch (error) {
        console.error("Error al recuperar las páginas tras el relogin:", error);
    }

    const channel = new BroadcastChannel('sesion_plataforma');
    channel.postMessage({ type: 'SESION_RESTAURADA', token: sesion.token });
    channel.close();
  };

  return { mostrarModal, reloguear };
};
