import React from 'react';

function CopiarTexto({ textoACopiar, TituloBoton }) {
  const copiarAlPortapapeles = () => {
    navigator.clipboard.writeText(textoACopiar)
      .then(() => {
        alert(`Se a copiado con exito: \n ${textoACopiar} ✅`);
      })
      .catch(err => {
        console.error('Error al copiar: ', err);
      });
  };

  return (
    <button className="btn btn-outline-secondary w-100" onClick={copiarAlPortapapeles}>
      {TituloBoton || 'Copiar Texto'} 
    </button>
  );
}

export default CopiarTexto;
