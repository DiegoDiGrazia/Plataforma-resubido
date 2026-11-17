import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import './Formulario.css';
import './FormularioMobile.css';
import { resetFormulario } from '../../redux/formularioSlice';
import { cambiarClave } from '../Apis/authApi.js';
import { autenticar, guardarSesion, rutaInicial } from './sesion.js';
import { useCuentaRegresiva, formatearCuentaRegresiva } from '../../hooks/useCuentaRegresiva.js';
import VideoBienvenida from './VideoBienvenida';

const LARGO_MINIMO = 8;

const CambiarClave = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const debeCambiar = Boolean(location.state?.debeCambiar);

    const [email, setEmail] = useState(location.state?.email || '');
    const [claveActual, setClaveActual] = useState('');
    const [claveNueva, setClaveNueva] = useState('');
    const [claveRepetida, setClaveRepetida] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [segundosBloqueo, setSegundosBloqueo] = useCuentaRegresiva();
    const [rutaDestino, setRutaDestino] = useState(null);

    const validar = () => {
        if (claveNueva.length < LARGO_MINIMO) return `La clave nueva debe tener al menos ${LARGO_MINIMO} caracteres`;
        if (claveNueva !== claveRepetida) return 'Las claves nuevas no coinciden';
        if (claveNueva === claveActual) return 'La clave nueva debe ser distinta de la actual';
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cargando || segundosBloqueo > 0) return;

        const errorValidacion = validar();
        setError(errorValidacion);
        if (errorValidacion) return;

        setCargando(true);
        try {
            await cambiarClave(email, claveActual, claveNueva);
        } catch (err) {
            if (err.status === 429 && err.retryAfter) {
                setSegundosBloqueo(err.retryAfter);
            }
            setError(err.status ? err.message : 'No se pudo conectar con el servidor. Probá de nuevo.');
            console.error('Error al cambiar la clave:', err);
            setCargando(false);
            return;
        }

        // La clave ya cambio: hacemos el login automatico con la clave nueva
        try {
            const sesion = await autenticar(email, claveNueva);
            dispatch(resetFormulario());
            guardarSesion(dispatch, email, sesion);
            setRutaDestino(rutaInicial(sesion.usuario));
        } catch (err) {
            console.error('Error en el login automático:', err);
            navigate('/', { replace: true });
        } finally {
            setCargando(false);
        }
    };

    const textoBoton = cargando
        ? 'Guardando...'
        : segundosBloqueo > 0
            ? `Probá de nuevo en ${formatearCuentaRegresiva(segundosBloqueo)}`
            : 'Cambiar contraseña';

    return (
        <div className="container-fluid containerFormulario">
            <div id='formulario'>
                <div className="text-center mb-4">
                    <img src="/images/logoNdNegroNaranja.png" alt="Noticias (d)" className="img-fluid mb-4" id='logo-nd'/>
                    <h2>Cambiá tu contraseña</h2>
                    <h3>
                        {debeCambiar
                            ? 'Tu contraseña venció o fue reseteada. Elegí una nueva para continuar.'
                            : 'Ingresá tu contraseña actual y elegí una nueva.'}
                    </h3>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email:</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            required
                            autoComplete="username"
                            placeholder='Ingresa tu email aquí'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="clave-actual" className="form-label">Contraseña actual:</label>
                        <input
                            type="password"
                            id="clave-actual"
                            className="form-control"
                            required
                            autoComplete="current-password"
                            placeholder='Ingresa tu contraseña actual'
                            value={claveActual}
                            onChange={(e) => setClaveActual(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="clave-nueva" className="form-label">Contraseña nueva:</label>
                        <input
                            type="password"
                            id="clave-nueva"
                            className="form-control"
                            required
                            minLength={LARGO_MINIMO}
                            autoComplete="new-password"
                            placeholder={`Mínimo ${LARGO_MINIMO} caracteres`}
                            value={claveNueva}
                            onChange={(e) => setClaveNueva(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="clave-repetida" className="form-label">Repetir contraseña nueva:</label>
                        <input
                            type="password"
                            id="clave-repetida"
                            className="form-control"
                            required
                            autoComplete="new-password"
                            placeholder='Repetí la contraseña nueva'
                            value={claveRepetida}
                            onChange={(e) => setClaveRepetida(e.target.value)}
                        />
                        {error && <div className='olvide_contraseña text-start' role="alert">{error}</div>}
                    </div>
                    <button type="submit" id='iniciar_sesion' disabled={cargando || segundosBloqueo > 0}>
                        {cargando && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
                        {textoBoton}
                    </button>
                    <button type="button" className="btn btn-link" id="olvide_contraseña" onClick={() => navigate('/')}>Volver al inicio</button>
                </form>
            </div>
            {rutaDestino && (
                <VideoBienvenida
                    src="/images/videoInicioSesion.mp4"
                    duracionMs={4000}
                    onFinish={() => navigate(rutaDestino)}
                />
            )}
        </div>
    );
};

export default CambiarClave;
