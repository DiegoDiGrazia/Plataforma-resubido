import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';
import { setTodosLosClientes } from '../../redux/dashboardSlice';
import axios from 'axios';

import { updatePaisUsuario, updateProvinciaUsuario, updateMunicipioUsuario } from '../../redux/formularioSlice';
import './Dashboard.css';



const GuardarUbicacionDeCliente= ({id_cliente}) => {

    if (!id_cliente) {
        console.error("El id_cliente no está definido");
        return <></>;
    }
    const TOKEN = useSelector((state) => state.formulario.token)
    const [clienteDelUsuario, setClienteDelUsuario] = useState([]);
    const dispatch = useDispatch(); // Agrega esto al inicio del componente
    const  [provincia, setProvinciaLocal] = useState("");
    const [municipios, setMunicipiosLocal] = useState("");

        useEffect(() => {
            if (true) { // Verifica si el arreglo está vacío
                axios.post(
                    "https://panel.serviciosd.com/app_obtener_clientes",
                    {
                        token: TOKEN,
                        cliente: "",
                    },
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        }
                    }
                )
                .then((response) => {
                    console.log('Respuesta:', response.status);
        
                    if (response.data.status === "true") {
                        console.log(response.data);
                        let clientes = response.data.item;
                        // Filtra y guarda el resultado en una nueva variable
                        let clientesFiltrados = clientes.filter((cliente) => cliente.id === id_cliente);
                        setClienteDelUsuario(clientesFiltrados[0]);
                    } else {
                        console.error('Error en la respuesta de la API:', response.data.message);
                    }
                })
                .catch((error) => {
                    console.error('Error al hacer la solicitud:', error);
                });
            }
        }, [TOKEN, dispatch]); // Agrega dependencias relevantes

        useEffect(() => {
            axios.post(
                "https://panel.serviciosd.com/app_obtener_provincias",
                { token: TOKEN },
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            .then((response) => {
                if (response.data.status === "true") {
                    let provincias = response.data.item;
                    console.log("provincias", provincias)
                    let provinciaDelCliente = provincias.find((provincia) => provincia.provincia_id == clienteDelUsuario.provincia_id)
                    console.log("provinciaDelCliente", provinciaDelCliente)
                    if(provinciaDelCliente){
                        setProvinciaLocal(provinciaDelCliente)
                        dispatch(updateProvinciaUsuario(provinciaDelCliente));
                    }
                } else {
                    console.error('Error en la respuesta de la API:', response.data.message);
                }   
            })
            .catch((error) => console.error('Error al obtener provincias:', error));
        }, [TOKEN, clienteDelUsuario]);

        // Obtener municipios cuando cambia la provincia
        useEffect(() => {
            if (!provincia?.provincia_id) return;

            axios.post(
                "https://panel.serviciosd.com/app_obtener_municipios",
                { token: TOKEN, provincia_id: provincia.provincia_id },
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            .then((response) => {
                if (response.data.status === "true") {
                    let municipiosDeLaProvincia = response.data.item;
                    let municipioDelCliente = municipiosDeLaProvincia.find((municipio) => municipio.municipio_id == clienteDelUsuario.municipio_id)
                    if(municipioDelCliente){
                    setMunicipiosLocal(municipioDelCliente);
                    dispatch(updateMunicipioUsuario(municipioDelCliente));
                }
                    
                } else {
                    console.error('Error en la respuesta de la API:', response.data.message);
                }
            })
            .catch((error) => console.error('Error al obtener municipios:', error));
        }, [provincia]);

    console.log("clienteDelUsuario", clienteDelUsuario)
    console.log("provincia", provincia)
    console.log("municipios", municipios)


    return (
        <>

        </>
    );
};

export default GuardarUbicacionDeCliente;
