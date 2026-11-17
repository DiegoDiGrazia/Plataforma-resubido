import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import './Formulario.css';
import './FormularioMobile.css';
import { updateGeo, resetFormulario } from '@/store/formularioSlice';
import { obtenerGeo } from '@/api/geosApi.js';
import { useNavigate } from 'react-router-dom';
import VideoBienvenida from './VideoBienvenida';
import { autenticar, guardarSesion, rutaInicial } from './sesion.js';
import { useCuentaRegresiva, formatearCuentaRegresiva } from '@/shared/hooks/useCuentaRegresiva.js';

const Formulario = () => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [contraseña, setContraseña] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [segundosBloqueo, setSegundosBloqueo] = useCuentaRegresiva();
    const [rutaDestino, setRutaDestino] = useState(null)

    useEffect(() => {
        obtenerGeo().then((datos) => {
            dispatch(updateGeo(Array.isArray(datos) ? datos : []));
        })
        .catch((err) => console.error('Error al obtener geo:', err));
    }, [dispatch]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (cargando || segundosBloqueo > 0) return;

        setError('');
        setCargando(true);
        try {
            const sesion = await autenticar(email, contraseña);
            dispatch(resetFormulario());
            guardarSesion(dispatch, email, sesion);
            setRutaDestino(rutaInicial(sesion.usuario));
        } catch (err) {
            if (err.status === 403) {
                navigate('/cambiar-clave', { state: { email, debeCambiar: true } });
                return;
            }
            if (err.status === 429 && err.retryAfter) {
                setSegundosBloqueo(err.retryAfter);
            }
            setError(err.status ? err.message : 'No se pudo conectar con el servidor. Probá de nuevo.');
            console.error('Error al iniciar sesión:', err);
        } finally {
            setCargando(false);
        }
    };

    const textoBoton = cargando
        ? 'Ingresando...'
        : segundosBloqueo > 0
            ? `Probá de nuevo en ${formatearCuentaRegresiva(segundosBloqueo)}`
            : 'Iniciar sesión';

    return (
        <div className="container-fluid containerFormulario">
            <div id='formulario'>
                <div className="text-center mb-4">
                    <img src="/images/logoNdNegroNaranja.png" alt="Imagen de ejemplo" className="img-fluid mb-4" id='logo-nd'/>
                    <h2>Bienvenidos</h2>
                    <h3>Ingresa tus datos para acceder a la plataforma</h3>
                </div>
                <form  onSubmit={handleLogin}>
                    <div className="mb-3 emailbox">
                        <label htmlFor="email" className="form-label">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            required
                            placeholder='Ingresa tu email aquí'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-3 contraseña">
                        <label htmlFor="password" className="form-label">Contraseña:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-control"
                            required
                            placeholder='Ingresa tu contraseña aquí'
                            value={contraseña}
                            onChange={(e) => setContraseña(e.target.value)}
                        />
                        {error && <div className='olvide_contraseña text-start' role="alert">{error}</div>}
                    </div>
                    <button type="submit" id='iniciar_sesion' disabled={cargando || segundosBloqueo > 0}>
                        {cargando && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
                        {textoBoton}
                    </button>
                    <button type="button" className="btn btn-link olvide_contraseña" onClick={() => navigate('/cambiar-clave', { state: { email } })}>Cambiar mi contraseña</button>
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

export default Formulario;