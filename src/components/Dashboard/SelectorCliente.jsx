import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';
import { setTodosLosClientes } from '../../redux/dashboardSlice';
import axios from 'axios';
import { updateActivarTodosLosClientes, updateCliente, updateIdCliente } from '../../redux/formularioSlice';
import './Dashboard.css';
import { Navigate, useNavigate } from 'react-router-dom';
import { setClienteNota } from '../../redux/crearNotaSlice';



const SelectorCliente= () => {
    const esEditor = useSelector((state) => state.formulario.esEditor)
    const paisID = useSelector((state) => state.formulario.usuario.id_pais)
    const nombreCliente = useSelector((state) => state.formulario.cliente)
    const TOKEN = useSelector((state) => state.formulario.token)
    const todosLosClientes = useSelector((state) => state.dashboard.todosLosClientes) || []
    const navigate = useNavigate();
    
        const dispatch = useDispatch(); // Agrega esto al inicio del componente

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
                        let clientes  = response.data.item
                        if(paisID){
                            clientes = clientes.filter(cliente => cliente.pais_id === paisID);
                        }
                        clientes.sort((a, b) => {
                            if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                            if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                            return 0;
                        });
                        
                        // Despachar la lista ordenada al store
                        dispatch(setTodosLosClientes(clientes));
                    } else {
                        console.error('Error en la respuesta de la API:', response.data.message);
                    }
                })
                .catch((error) => {
                    console.error('Error al hacer la solicitud:', error);
                });
            }
            console.log(todosLosClientes, "todos los clientes")
        }, [TOKEN, dispatch]); // Agrega dependencias relevantes

    const editarCliente =(cliente) =>{
        dispatch(updateCliente(cliente.name))
        dispatch(setClienteNota(cliente.name))
        if(cliente.id){
            dispatch(updateIdCliente(cliente.id))
        }
        dispatch(updateActivarTodosLosClientes(false))

    }
    const TodosLosClientesParaEditor =() =>{
        dispatch(updateCliente(""))
        dispatch(updateIdCliente(""))
        dispatch(updateActivarTodosLosClientes(true))
        navigate("/notasEditorial");

    }

    const [filtro, setFiltro] = useState(''); // Estado para almacenar el filtro de búsqueda

    // Filtrar los clientes en base al texto ingresado
    const clientesFiltrados = todosLosClientes.filter((cliente) =>
        cliente.name.toLowerCase().includes(filtro.toLowerCase())
    );


    return (
        <div className="dropdown no-print">
            
            {esEditor === false &&
            <h4 id="saludo">Hola</h4>
            }
            <button
                className="btn custom-dropdown-button dropdown-toggle boton_cliente mb-2 ml-5"
                type="button"
                id="dropdownMenuButtonSelectorCliente"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                {nombreCliente == "" ? "Todas las cuentas" : nombreCliente }
            </button>
            <ul className="dropdown-menu listaClientes" aria-labelledby="dropdownMenuButton1" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {/* Campo de búsqueda */}


                
                <li>
                    <input
                        type="text"
                        className="form-control dropdown-search"
                        placeholder="Buscar cuenta..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        style={{ margin: '0.5rem', maxHeight: "250px !important" }}
                    
                    />
                </li>
                <li key={"Todas las cuentas"}>
                        <button
                            className="dropdown-item"
                            onClick={() => TodosLosClientesParaEditor("")}
                        >
                            {"Todas las cuentas"}
                        </button>
                    </li>
                {/* Renderizar clientes filtrados */}
                {clientesFiltrados.map((cliente) => (
                    <li key={cliente.id}>
                        <button
                            className="dropdown-item"
                            onClick={() => editarCliente(cliente)}
                        >
                            {cliente.name}
                        </button>
                    </li>
                ))}
                {/* Mensaje si no hay clientes coincidentes */}
                {clientesFiltrados.length === 0 && (
                    <li className="text-center text-muted">No se encontraron cuentas</li>
                )}
            </ul>
        </div>
    );
};

export default SelectorCliente;
