import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { autenticar } from './sesion.js';
import { useCuentaRegresiva, formatearCuentaRegresiva } from '../../hooks/useCuentaRegresiva.js';

const ReloginModal = ({ onLoginExitoso }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [segundosBloqueo, setSegundosBloqueo] = useCuentaRegresiva();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cargando || segundosBloqueo > 0) return;

    setError('');
    setCargando(true);
    try {
      const sesion = await autenticar(email, password);
      await onLoginExitoso(email, sesion);
    } catch (err) {
      if (err.status === 403) {
        navigate('/cambiar-clave', { state: { email, debeCambiar: true } });
        return;
      }
      if (err.status === 429 && err.retryAfter) {
        setSegundosBloqueo(err.retryAfter);
      }
      console.error('Error al intentar reloguear:', err);
      setError(err.status ? err.message : 'No se pudo conectar con el servidor. Probá de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const textoBoton = cargando
    ? 'Ingresando...'
    : segundosBloqueo > 0
      ? `Probá de nuevo en ${formatearCuentaRegresiva(segundosBloqueo)}`
      : 'Volver a la sesión';

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
              {error && (
                <div className="text-danger text-center mb-2 ms-1" role="alert">
                    {error}
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

              <button
                type="submit"
                className="btn w-100 py-2 fw-semibold text-light"
                style={{backgroundColor: '#FF653B'}}
                disabled={cargando || segundosBloqueo > 0}
              >
                {cargando && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
                {textoBoton}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReloginModal;
