import React, { useState } from 'react';
import axios from 'axios';

const ReloginModal = ({ onLoginExitoso }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post("https://panel.serviciosd.com/api/login", {
            usuario: email,
            password: password
        }, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.status === "true" && response.data.item.token) {
            setErrorLogin(false);
            onLoginExitoso(response.data.item.token); 
        } else {
            setErrorLogin(true);
        }
    } catch (error) {
        console.error('Error al intentar reloguear:', error);
        setErrorLogin(true);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow">
          
          <div className="modal-header border-0 pb-0">
            <h4 className="modal-title text-center w-100 fw-bold mt-2">Tu sesión expiró</h4>
          </div>

          <div className="modal-body px-4 pb-4 pt-3">
            <p className="text-center text-muted mb-4">
              Por favor, ingresá tus datos para continuar.
            </p>
            
            <form onSubmit={handleSubmit}>
              {errorLogin && (
                <div className="text-danger text-center mb-2 ms-1" role="alert">
                    Usuario y/o contraseña incorrecta
                </div>
              )}
              
              <div className="mb-3">
                <strong className='ms-1 mb-1' style={{ fontSize: '13px' }}>Email:</strong>
                <input 
                  type="email" 
                  placeholder="Ingresa tu email aquí" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="form-control mt-1"
                  required
                />
              </div>
              
              <div className="mb-3">
                <strong className='ms-1' style={{ fontSize: '13px' }}>Contraseña:</strong>
                <input 
                  type="password" 
                  placeholder="Ingresa tu contraseña aquí" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="form-control mt-1"
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">
                Volver a la sesión
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReloginModal;