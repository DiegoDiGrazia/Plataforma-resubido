import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import Etiquetas from './Etiquetas';
import ArbolDistribucion from './ArbolDistribucion';
import SelectorTipoContenido from './SelectorContenido';
import TextareaWithCounter from './textAreaConContador';
import SelectorAutor from './SelectorAutor';
import "./colEditorial.css"
import { useDispatch, useSelector } from 'react-redux';
import { setPais, setProvincia, setMunicipio } from '../../../redux/crearNotaSlice';
import { setDistribucionProioritaria,setNoHome, setFechaVencimiento, setFechaPublicacion} from '../../../redux/crearNotaSlice';
import SelectorCliente2 from './SelectorCliente2';
import EsDemo from './EsDemo';



const ColumnaEditorial = ({ indice }) => {
    const isCheckedDistribucionPrioritaria = useSelector((state) => state.crearNota.distribucion_prioritaria)
    const isCheckedNoHome = useSelector((state) => state.crearNota.es_home)
    const fechaVence = useSelector((state) => state.crearNota.f_vence)
    const fechaPublicacion = useSelector((state) => state.crearNota.f_pub)
    const provincia = useSelector((state) => state.crearNota.provincia);
    const municipio = useSelector((state) => state.crearNota.municipio);
    const pais = useSelector((state) => state.crearNota.pais);
    const TOKEN = useSelector((state) => state.formulario.token);



    const dispatch = useDispatch();


    const dispacharfechaVencimiento = (e) => {
      dispatch(setFechaVencimiento(e.target.value)); 
    };
    const dispacharfechaPublicacion = (e) => {
        dispatch(setFechaPublicacion(e.target.value)); 
      };

    return (
        <div className='col-4 align-self-start col_editorial'>
                <Etiquetas />
                    <span style={{ fontSize: "20px", fontWeight: "bold", padding: "0px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        Cuenta de la nota:
                        <div style={{ marginLeft: "auto" }}>
                            <SelectorCliente2/>
                        </div>
                    </span>
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
                    checked={isCheckedNoHome == '1'} 
                    onChange={() => dispatch(setNoHome(isCheckedNoHome == '1'? '0' : '1'))} 
                    />
            </div>

            <EsDemo></EsDemo>

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
                checked={isCheckedDistribucionPrioritaria == '1'} 
                onChange={() => dispatch(setDistribucionProioritaria(isCheckedDistribucionPrioritaria == '1'? '0' : '1'))} 
                />
        </div>
                    <SelectorAutor/>
                        <ArbolDistribucion
                        TOKEN={TOKEN}
                        pais={pais}
                        provincia={provincia}
                        municipio={municipio}
                        onSetPais={(p) => dispatch(setPais(p))}
                        onSetProvincia={(p) => dispatch(setProvincia(p))}
                        onSetMunicipio={(m) => dispatch(setMunicipio(m))}
                        />
                    <SelectorTipoContenido/>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px", padding: "0px" }}>
                    <span style={{ fontSize: "20px", fontWeight: "bold"}}>Fecha Publicacion:</span>
                    <input 
                        type="date" 
                        value={fechaPublicacion} 
                        onChange={dispacharfechaPublicacion} 
                        style={{ fontSize: "20px", fontWeight: "bold"}}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px", padding: "0px" }}>
                    <span style={{ fontSize: "20px", fontWeight: "bold"}}>Fecha de vencimiento:</span>
                    <input 
                        type="date" 
                        value={fechaVence} 
                        onChange={dispacharfechaVencimiento} 
                        style={{ fontSize: "20px", fontWeight: "bold"}}
                    />
                </div>
                <TextareaWithCounter/>
            </div>
        </div>
    );
};

export default ColumnaEditorial;
