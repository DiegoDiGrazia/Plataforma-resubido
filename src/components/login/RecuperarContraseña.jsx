import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Formulario.css';
import { updateEmail, updateCodigoRecuperacion } from '../../redux/formularioSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import formularioReducers from '../../redux/formularioSlice'

const RecuperarContraseña = () => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const token = useSelector((state) => state.formulario.token);
    const codigoRecuperacion = useSelector((state) => state.formulario.codigoRecuperacion);
    const navigate = useNavigate();
    var email_no_encontrado = false;
    const [codigoTipeado, setCodigoTipeado] = useState('');
    const [codigoIncorrecto, setCodigoIncorrecto] = useState(false);

    const handleRecuperarAcceso = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("codigo_recuperacion", {
                usuario: "diego.digrazia@noticiasd.com",
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Respuesta:', response.status);

            if (response.data.status === "true") {
                console.log('pude entrar a la api');
                dispatch(updateEmail(email));
                dispatch(updateCodigoRecuperacion(response.data.item.codigo));

            } else {
                console.error('Error en los datos de la API:', response.data.message);
                email_no_encontrado = true
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

    const handleVerificarCodigo = async (e) => {
        e.preventDefault();
        // Implementa la lógica para recuperar la contraseña aquí
        if (codigoRecuperacion == codigoTipeado){
            navigate('/actualizar-contraseña');
        }
        else {
            setCodigoIncorrecto(true);
        }
    };

    const volverALogin = () => {
        navigate('/');
    };

    return (
        <div className="container-fluid">
            <div className="row" id="imagenLogo">
                <div className="col-6" id='imagen'>
                    <div className="image-container">
                        <img src="/images/foto-login.png" alt="Imagen de ejemplo" className="img-fluid" />
                    </div>
                </div>

                {(codigoRecuperacion === "") ? (
                    <div className="col-4" id='formulario'>
                        <div className="text-center mb-4">
                            <img src="/images/noticiasdlogo.png" alt="Imagen de ejemplo" className="img-fluid mb-4" id='logo-nd'/>
                            <h2>Recuperar Acceso</h2>
                            <h3>Ingrsá el email asosiado a tu cuenta, y te enviaremos un codigo de recuperacion</h3>
                        </div>
                        <form className="mt-4" onSubmit={handleRecuperarAcceso}>
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
                            <button type="submit" id='iniciar_sesion'>Recuperar acceso</button>

                            <button type="button" className="btn btn-link" id="olvide_contraseña" onClick={volverALogin}>Volver</button>
                        </form>
                    </div>
                ) : (
                    <div className="col-4" id='formulario'>
                        <div className="text-center mb-4">
                            <img src="/images/noticiasdlogo.png" alt="Imagen de ejemplo" className="img-fluid mb-4" id='logo-nd'/>
                            <h2>Recuperar Contraseña</h2>
                            <h3>Te enviamos un codigo al mail {email}</h3>
                        </div>
                        <form className="mt-4" onSubmit={handleVerificarCodigo}>
                            <div className="mb-3">
                                <label htmlFor="codigo" className="form-label">Codigo:</label>
                                <input 
                                    type="codigo" 
                                    id="codigo" 
                                    name="codigo" 
                                    className="form-control" 
                                    required 
                                    placeholder='Ingresa tu codigo aquí' 
                                    value={codigoTipeado}
                                    onChange={(e) => setCodigoTipeado(e.target.value)}
                                />
                            </div>
                            {codigoIncorrecto && <p id= "inputError">codigoIncorrecto</p>}
                            <button type="submit" id='iniciar_sesion'>Recuperar contraseña</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecuperarContraseña;