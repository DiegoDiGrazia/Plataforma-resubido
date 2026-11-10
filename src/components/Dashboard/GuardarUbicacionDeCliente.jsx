import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {updateProvinciaUsuario, updateMunicipioUsuario } from '../../redux/formularioSlice';
import { obtenerProvincias, obtenerMunicipios } from '../Apis/geosApi';
import { obtenerClientes } from '../Apis/apis';

const GuardarUbicacionDeCliente= ({id_cliente}) => {
    if (!id_cliente) {
        console.error("El id_cliente no está definido");
    return <></>;
    }
    
    const TOKEN = useSelector((state) => state.formulario.token)
    const [clienteDelUsuario, setClienteDelUsuario] = useState([]);
    const dispatch = useDispatch(); // Agrega esto al inicio del componente
    const [provincia, setProvinciaLocal] = useState("");
    const [municipios, setMunicipiosLocal] = useState("");
    useEffect(() => {
        obtenerClientes(TOKEN).then((response) => {
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
    }, [TOKEN, dispatch]); 

    useEffect(() => {
        obtenerProvincias("1").then((response) => {
            let provincias = Array.isArray(response) ? response : [];
            let provinciaDelCliente = provincias.find((provincia) => String(provincia.provincia_id) === String(clienteDelUsuario?.provincia_id))
            if(provinciaDelCliente){
                setProvinciaLocal(provinciaDelCliente)
                dispatch(updateProvinciaUsuario(provinciaDelCliente));
            }
        })
        .catch((error) => console.error('Error al obtener provincias:', error));
    }, [TOKEN, clienteDelUsuario]);

    // Obtener municipios cuando cambia la provincia
    useEffect(() => {
        if (!provincia?.provincia_id) return;

        obtenerMunicipios(provincia.provincia_id).then((response) => {
            let municipiosDeLaProvincia = Array.isArray(response) ? response : [];
            let municipioDelCliente = municipiosDeLaProvincia.find((municipio) => String(municipio.municipio_id) === String(clienteDelUsuario?.municipio_id))
            if(municipioDelCliente){
                setMunicipiosLocal(municipioDelCliente);
                dispatch(updateMunicipioUsuario(municipioDelCliente));
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
