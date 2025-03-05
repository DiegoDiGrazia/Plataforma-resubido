import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import Etiquetas from './Etiquetas';
import ArbolDistribucion from './ArbolDistribucion';
import SelectorCliente from '../../Dashboard/SelectorCliente';
import SelectorTipoContenido from './SelectorContenido';
import TextareaWithCounter from './textAreaConContador';
import SelectorAutor from './SelectorAutor';
import "./colEditorial.css"
import { useDispatch, useSelector } from 'react-redux';
import { setEsDemo, setDistribucionProioritaria,setNoHome, setFechaVencimiento} from '../../../redux/crearNotaSlice';



const ColumnaEditorial = ({ indice }) => {

    const isCheckedDemo = useSelector((state) => state.crearNota.es_demo)
    const isCheckedDistribucionPrioritaria = useSelector((state) => state.crearNota.distribucion_prioritaria)
    const isCheckedNoHome = useSelector((state) => state.crearNota.es_home)
    const fecha = useSelector((state) => state.crearNota.f_vence)

    const dispatch = useDispatch();


    const handleChange = (e) => {
      dispatch(setFechaVencimiento(e.target.value)); 
    };

    return (
        <div className='col-4 align-self-start col_editorial'>
                <Etiquetas />
            <div className='row pt-0'>
                <div 
                className="form-check form_editorial p-0" 
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                <label 
                    className="form-check-label" 
                    htmlFor="flexCheckDefault" 
                    style={{ fontSize: "20px", fontWeight: "bold", marginRight: "10px", padding: "0px" }}
                >
                    No home
                </label>
                <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="flexCheckChecked1" 
                    checked={isCheckedNoHome} 
                    onChange={() => dispatch(setNoHome(!isCheckedNoHome))} 
                    />
            </div>

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
                    checked={isCheckedDemo} 
                    onChange={() => dispatch(setEsDemo(!isCheckedDemo))} 
                    />

            </div>

        <div 
            className="form-check form_editorial p-0" 
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
            <label 
                className="form-check-label" 
                htmlFor="flexCheckChecked2" 
                style={{ fontSize: "20px", fontWeight: "bold", marginRight: "10px" }}
            >
                Distribucion prioritaria
            </label>
            <input 
                className="form-check-input" 
                type="checkbox" 
                id="flexCheckChecked2" 
                checked={isCheckedDistribucionPrioritaria} 
                onChange={() => dispatch(setDistribucionProioritaria(!isCheckedDistribucionPrioritaria))} 
                />
        </div>
                    <SelectorAutor/>
                    <ArbolDistribucion/>
                    <SelectorTipoContenido/>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px", padding: "0px" }}>
                    <span style={{ fontSize: "20px", fontWeight: "bold"}}>Fecha de vencimiento:</span>
                    <input 
                        type="date" 
                        value={fecha} 
                        onChange={handleChange} 
                        style={{ fontSize: "20px", fontWeight: "bold"}}
                    />
                </div>
                <TextareaWithCounter/>
            </div>
        </div>
    );
};

export default ColumnaEditorial;
