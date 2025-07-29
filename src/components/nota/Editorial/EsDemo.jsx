import React, { useState } from 'react';
import "./colEditorial.css"
import { useDispatch, useSelector } from 'react-redux';
import { setEsDemo} from '../../../redux/crearNotaSlice';
import { useEffect } from 'react';
import axios from 'axios';
import SelectorConBuscador from './SelectorConBuscador';
import { setDemo } from '../../../redux/crearNotaSlice';



const EsDemo = ({ indice }) => {

    const isCheckedDemo = useSelector((state) => state.crearNota.es_demo)
    const demo = useSelector((state) => state.crearNota.demo)
    const dispatch = useDispatch();
    const TOKEN = useSelector((state) => state.formulario.token);
    const [demos, setDemos] = useState([]);
    const [ejecutarDemos, setEjecutarDemos] = useState(1);
 

    const handleAgregarDemo = () => {
        const nuevaDemo = prompt('Ingresá el nombre de la demo:');
        if (nuevaDemo && nuevaDemo.trim() !== '') {
             axios.post(
                "https://panel.serviciosd.com/app_nueva_demo",
                { token: TOKEN, nombre: nuevaDemo },
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            .then((response) => {
                if (response.data.status === "true") {
                    setDemos([]);
                    setEjecutarDemos(ejecutarDemos + 1)
                } else {
                    console.error('Error en la respuesta de la API:', response.data.message);
                }
            })
            .catch((error) => console.error('Error al obtener provincias:', error));
        }
    };

        useEffect(() => {
            axios.post(
                "https://panel.serviciosd.com/app_obtener_demos",
                { token: TOKEN },
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            .then((response) => {
                if (response.data.status === "true") {
                    setDemos(response.data.item);
                    console.log(response)
                } else {
                    console.error('Error en la respuesta de la API:', response.data.message);
                }
            })
            .catch((error) => console.error('Error al obtener provincias:', error));
        }, [TOKEN, ejecutarDemos]);


    return (
     
            <>
            <div 
                className="form-check form_editorial p-0" 
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
                <label 
                    className="form-check-label" 
                    htmlFor="flexCheckChecked1" 
                    style={{ fontSize: "20px", fontWeight: "bold", marginRight: "10px" }}
                >
                    Es demo
                </label>
                <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="flexCheckChecked1" 
                    checked={isCheckedDemo == '1'} 
                    onChange={() => {
                        dispatch(setEsDemo(isCheckedDemo === '1' ? '0' : '1'));
                        dispatch(setDemo(isCheckedDemo === '1' ? '' : ''));
                    }}
                    />
            </div>
            {isCheckedDemo == '1' &&
            <>
            <div className="dropdown p-0">
                <SelectorConBuscador title={'Demo'} options={demos} selectedOption={demo}
                                onSelect={(demo) => dispatch(setDemo(demo))}
                                onClear={() => dispatch(setDemo(''))}
                ></SelectorConBuscador>
            </div>
            
            <button 
                type="button" 
                className="btn btn-light mb-2" 
                onClick={handleAgregarDemo}
            >
                Agregar demo +
            </button>
            </>
            }
            </>

    );
};

export default EsDemo;
