import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateToken } from '../redux/formularioSlice';
import axios from 'axios';
import { obtenerFacturas, validarToken } from '../components/administrador/gestores/apisUsuarios';

export const useSessionManager = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const dispatch = useDispatch();

  const tokenActual = useSelector((state) => state.formulario.token);

  useEffect(() => {
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
      const sesionActiva = await validarToken(tokenActual); 

      if (!sesionActiva) {
        setMostrarModal(true);
        channel.postMessage({ type: 'SESION_EXPIRADA' }); 
      }
    }, 30000); // se fija si el token expiró cada 30seg

    return () => {
      clearInterval(intervalo);
      channel.close();
    };
  }, [dispatch, tokenActual]);

  const reloguear = (nuevoToken) => {
    setMostrarModal(false);
    dispatch(updateToken(nuevoToken));

    const channel = new BroadcastChannel('sesion_plataforma');
    channel.postMessage({ type: 'SESION_RESTAURADA', token: nuevoToken });
    channel.close();
  };

  return { mostrarModal, reloguear };
};
