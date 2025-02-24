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

const ColumnaEditorial = ({ indice }) => {
    const [isChecked, setIsChecked] = useState(true); // Track the state of the checkbox

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked); // Toggle the state when the checkbox is clicked
    };

    /// FECHA SECCION
    const [fecha, setFecha] = useState("");

    const handleChange = (e) => {
      setFecha(e.target.value);
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
                    value="" 
                    id="flexCheckDefault" 
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
                    value="" 
                    id="flexCheckChecked1" 
                    checked={isChecked} 
                    onChange={handleCheckboxChange} 
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
                value="" 
                id="flexCheckChecked2" 
                checked={isChecked} 
                onChange={handleCheckboxChange} 
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
