import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';
import { setTodosLosClientes } from '../../../redux/dashboardSlice';
import axios from 'axios';
import { updateActivarTodosLosClientes, updateCliente, updateIdCliente } from '../../../redux/formularioSlice';
import '../../Dashboard/Dashboard.css';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { setClienteNota } from '../../../redux/crearNotaSlice';



const SelectorCliente2= () => {
    const esEditor = useSelector((state) => state.formulario.esEditor)
    const nombreCliente = useSelector((state) => state.crearNota.cliente)
    const TOKEN = useSelector((state) => state.formulario.token)
    const todosLosClientes = useSelector((state) => state.dashboard.todosLosClientes) || []
    const navigate = useNavigate();
    
        const dispatch = useDispatch(); // Agrega esto al inicio del componente

        useEffect(() => {
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
                if (response.data.status === "true") {
                    let clientes = response.data.item;
                    clientes.sort((a, b) => a.name.localeCompare(b.name));
                    dispatch(setTodosLosClientes(clientes));
                } else {
                    console.error('Error en la respuesta de la API:', response.data.message);
                }
            })
            .catch((error) => {
                console.error('Error al hacer la solicitud:', error);
            });

        }, [TOKEN, dispatch]);

    const editarCliente =(cliente) =>{
        dispatch(setClienteNota(cliente.name))
    }

    const TodosLosClientesParaEditor =() =>{
        dispatch(setClienteNota(""))
    }

    const [filtro, setFiltro] = useState(''); // Estado para almacenar el filtro de búsqueda

    // Filtrar los clientes en base al texto ingresado
    const clientesFiltrados = todosLosClientes.filter((cliente) =>
        cliente.name.toLowerCase().includes(filtro.toLowerCase())
    );


    return (
        <div className="dropdown no-print">
            
            {esEditor === false ? <h4 id="saludo">Hola</h4> : null}
            <button
                className="btn custom-dropdown-button dropdown-toggle boton_cliente mb-2 ml-5"
                type="button"
                id="dropdownMenuButton1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                {nombreCliente == "" ? "Nota sin cliente" : nombreCliente }
            </button>
            <ul className="dropdown-menu listaClientes" aria-labelledby="dropdownMenuButton1" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {/* Campo de búsqueda */}


                
                <li>
                    <input
                        type="text"
                        className="form-control dropdown-search"
                        placeholder="Buscar cliente..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        style={{ margin: '0.5rem', maxHeight: "250px !important" }}
                    
                    />
                </li>
                <li key={"Sin Cliente"}>
                        <button
                            className="dropdown-item"
                            onClick={() => TodosLosClientesParaEditor("")}
                        >
                            {"Sin Cliente"}
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
                    <li className="text-center text-muted">No se encontraron clientes</li>
                )}
            </ul>
        </div>
    );
};

export default SelectorCliente2;
