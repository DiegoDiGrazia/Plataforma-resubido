import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Formulario.css';
import './FormularioMobile.css';
import { updateEmail, updateGeo, updateContraseña, updateToken, updateCliente, updateIdCliente, updateEsEditor, updateUsuario, updateIdUsuario, resetFormulario } from '../../redux/formularioSlice';
import { obtenerGeo } from '../administrador/gestores/apisUsuarios';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Formulario = () => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [geo, setGeo] = useState({paises: []});
    const navigate = useNavigate();
    const CLIENTE_DEFAULT = ""
    const ID_CLIENTE_DEFAULT = ""
    const [contraseñaIncorrecta, setContraseñaIncorrecta] = useState(false)

    useEffect(() => {
        obtenerGeo().then(setGeo);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("https://panel.serviciosd.com/api/login", {
                usuario: email,
                password: contraseña
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if(response.data.message === "Usuario o Contrase\u00f1a incorrecta"){
                setContraseñaIncorrecta(true)
            }
            if (response.data.status === "true" && response.data.item.token) {
                dispatch(resetFormulario())
                dispatch(updateEmail(email));
                dispatch(updateContraseña(contraseña));
                dispatch(updateToken(response.data.item.token));
                dispatch(updateCliente(response.data.item.cliente))
                dispatch(updateIdCliente(response.data.item.id_cliente))
                dispatch(updateEsEditor(false))
                dispatch(updateUsuario(response.data.item))
                dispatch(updateIdUsuario(response.data.id))
                dispatch(updateGeo(geo.paises))

                if(!response.data.item.cliente){
                    console.log("entre porque no tiene cliente")
                    dispatch(updateCliente(CLIENTE_DEFAULT))
                    dispatch(updateIdCliente(ID_CLIENTE_DEFAULT))
                    dispatch(updateEsEditor(true))
                }
                if(!response.data.item.cliente){
                    navigate('/notasEditorial'); // Redirige al Dashboard
                }else{
                navigate('/dashboard'); // Redirige al Dashboard
                }

            } else {
                console.error('Error en los datos de la API:', response.data.message);
            }
        } catch (error) {
            if (error.response) {
                console.error('Error respuesta:', error.response.data);
                console.error('Código de estado:', error.response.status);
                console.error('Encabezados:', error.response.headers);
            } else if (error.request) {
                console.error('Error solicitud:', error.request);
            } else {
                console.error('Error:', error.message);
            }
        }
    };
    const mostrarFormularioRecuperarContraseña = () => {
        navigate('/recuperar-contraseña'); // Redirige al Dashboard
    };

    return (
        <div className="container-fluid">
            <div className="row" id="imagenLogo">
                <div className="col" id='imagen'>
                    <div className="image-container">
                        <img src="/images/foto-login.png" alt="Imagen de ejemplo" className="img-fluid" />
                    </div>
                </div>
                <div className="col" id='formulario'>
                    <div className="text-center mb-4">
                        <img src="/images/logoNdNegroNaranja.png" alt="Imagen de ejemplo" className="img-fluid mb-4" id='logo-nd'/>
                        <h2>Bienvenidos</h2>
                        <h3>Ingresa tus datos para acceder a la plataforma</h3>
                    </div>
                    <form className="mt-4" onSubmit={handleLogin}>
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
                            {contraseñaIncorrecta && <div id='olvide_contraseña' className='text-start'>Usuario y/o contraseña incorrecta </div>}
                        </div>
                        <button type="submit" id='iniciar_sesion'>Iniciar sesión</button>
                        <button type="button" className="btn btn-link" id="olvide_contraseña" onClick={mostrarFormularioRecuperarContraseña}>Olvidé mi contraseña</button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Formulario;