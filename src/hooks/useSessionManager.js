import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validarToken, obtenerPaginas } from '../components/administrador/gestores/apisUsuarios';
import {  
    updateToken, 
    updateCliente, 
    updateIdCliente, 
    updateEsEditor, 
    updateUsuario, 
    updateIdUsuario,
    updatePaginasDelUsuario 
} from '../redux/formularioSlice';

export const useSessionManager = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const dispatch = useDispatch();

  const tokenActual = useSelector((state) => state.formulario.token);

  useEffect(() => {
    let isMounted = true; 
    const channel = new BroadcastChannel('sesion_plataforma');

    channel.onmessage = (event) => {
      if (event.data.type === 'SESION_EXPIRADA') {
        setMostrarModal(true);
      } else if (event.data.type === 'SESION_RESTAURADA') {
        setMostrarModal(false);
        dispatch(updateToken(event.data.token)); 
      }
    };

    const intervalo = setInterval( async () => {
      if (!tokenActual) return; 

      const sesionActiva = await validarToken(tokenActual); 

      if (!isMounted) return; 

      if (!sesionActiva) {
        setMostrarModal(true);
        channel.postMessage({ type: 'SESION_EXPIRADA' }); 
      }
    }, 30000); 

    return () => {
      isMounted = false; 
      clearInterval(intervalo);
      channel.close();
    };
  }, [dispatch, tokenActual]);

  const reloguear = async (dataCompletaApi) => {
    setMostrarModal(false);
    
    const item = dataCompletaApi.item;
    
    dispatch(updateToken(item.token));
    dispatch(updateCliente(item.cliente));
    dispatch(updateIdCliente(item.id_cliente));
    dispatch(updateUsuario(item));
    dispatch(updateIdUsuario(dataCompletaApi.id));
    
    if(!item.cliente){
        dispatch(updateCliente(""));
        dispatch(updateIdCliente(""));
        dispatch(updateEsEditor(true));
    } else {
        dispatch(updateEsEditor(false));
    }

    try {
        const paginas = await obtenerPaginas(item.token, item.perfil);
        dispatch(updatePaginasDelUsuario(paginas));
    } catch (error) {
        console.error("Error al recuperar las páginas tras el relogin:", error);
    }

    const channel = new BroadcastChannel('sesion_plataforma');
    channel.postMessage({ type: 'SESION_RESTAURADA', token: item.token });
    channel.close();
  };

  return { mostrarModal, reloguear };
};