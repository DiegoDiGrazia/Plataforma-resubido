import React from 'react';
import axios from 'axios';


const BotonEliminarNota = ({ id, token }) => {
    const handleEliminar = async () => {
      axios.post(
          "https://panel.serviciosd.com/app_cambiar_estado_nota",
          { id: id, token: token, estado: "ELIMINADO" },
          { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      .then((response) => {
          if (response.data.status === "true") {
              // Recargar la página después de eliminar
              window.location.reload();
          } else {
              console.error('Error al cambiar de estado:', response.data.message);
          }
      })
      .catch((error) => console.error('Error al cambiar de estado:', error));
    };
  
    return (
      <button onClick={handleEliminar} className='p-0 m-2 border-0 bg-transparent'>
        Eliminar
      </button>
    );
  };
  
  export default BotonEliminarNota;