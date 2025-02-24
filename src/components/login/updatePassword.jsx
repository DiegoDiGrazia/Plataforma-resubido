import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Formulario.css';
import { updateEmail, updateContraseña, updateToken } from '../../redux/formularioSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const updatePassword = () => {
    const dispatch = useDispatch();
    const [nuevaContraseña, setNuevaContraseña] = useState('');
    const [contraseñaRepetida, setContraseñaRepetida] = useState('');
    const email = useSelector((state) => state.formulario.email);
    const codigoRecuperacion = useSelector((state) => state.formulario.codigoRecuperacion);
    const [contresenaEsCorrecta, setcontrasenaEsCorrecta] = useState(true);
    const [pudeActualizarContraseña, setPudeActualizarContraseña] = useState(false);

    const navigate = useNavigate();
    

    const actualizarContraseña = async (e) => {
        e.preventDefault();
        if (nuevaContraseña == contraseñaRepetida){
            try {
                const response = await axios.post("cambiar_clave", {
                    usuario: email,
                    nueva_clave: nuevaContraseña,
                    codigo: codigoRecuperacion,
                }, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                console.log('Respuesta:', response.status);

                if (response.data.status === "true") {
                    setPudeActualizarContraseña(true);

                } else {
                    console.error('Error en los datos de la API:', response.data.message);
                }
            } catch (error) {
                console.error('Hubo un problema al acceder a la api:', error.response.data);
            }
        }
        else{
            // logica para ver que hago si las dos contraseñas no son iguales
            setcontrasenaEsCorrecta(false)
            if (length(nuevaContraseña) < 8)[
                setcontrasenaEsCorrecta(false)
            ]
        }
    };

    const handleRecuperarContraseña = async (e) => {
        e.preventDefault();
        // Implementa la lógica para recuperar la contraseña aquí
        console.log('Recuperar contraseña para:', email);
    };

    const mostrarFormularioRecuperarContraseña = () => {
        navigate('/recuperar-contraseña'); // Redirige al Dashboard
    };

    const volverALogin = () => {
        navigate('/');
    };

    return (
        
        <div className="container-fluid">
        {pudeActualizarContraseña &&
        <div className="cartel">
            <button className="close-btn" onClick={() => {setPudeActualizarContraseña(false)}}>X</button>
            <img src="/images/check-circle.png" alt="Imagen de ejemplo" className="img-fluid img-check" />
            <span className='actualizaste'>Actualizaste tu contraseña</span>
            <span className='cartel_actualizaste'>Los cambios en tu contraseña se completaron con éxito!</span>
        </div>
        }

            <div className="row" id="imagenLogo">
                <div className="col-6" id='imagen'>
                    <div className="image-container">
                        <img src="/images/foto-login.png" alt="Imagen de ejemplo" className="img-fluid" />
                    </div>
                </div>

                <div className="col-4" id='formulario'>
                    <div className="text-center mb-4">
                        <img src="/images/noticiasdlogo.png" alt="Imagen de ejemplo" className="img-fluid mb-4" id='logo-nd'/>
                        <h2>Restablece tu contraseasdasdña</h2>
                        <h3>Ingresa una nueva contraseña para la cuenta.</h3>
                    </div>
                    <form className="mt-4" onSubmit={actualizarContraseña}>
                        <div className="mb-3 emailbox">
                            <label htmlFor="password" className="form-label">Nueva Contraseña</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                className="form-control" 
                                required 
                                placeholder='Ingresa tu nueva contraseña aqui'
                                value={nuevaContraseña}
                                onChange={(e) => setNuevaContraseña(e.target.value)}
                            />
                        </div>
                        <div className="mb-3 contraseña">
                            <label htmlFor="password" className="form-label">Repetir contraseña</label>
                            <input 
                                type="password" 
                                id="password2" 
                                name="password" 
                                className="form-control" 
                                required 
                                placeholder='Repeti tu nueva contraseña' 
                                value={contraseñaRepetida}
                                onChange={(e) => setContraseñaRepetida(e.target.value)}
                            />
                        </div>
                        {!contresenaEsCorrecta && 
                        <h2> Debe colocar una contraseña correcta  </h2>
                        }
                        <button type="submit" id='iniciar_sesion'>Establecer contraseña</button>
                        <button type="button" className="btn btn-link" id="olvide_contraseña" onClick={volverALogin}>Volver al inicio</button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default updatePassword;