import React, { useEffect, useState } from 'react';
import 'cropperjs/dist/cropper.css';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setTodosLosClientes } from '@/store/dashboardSlice';
import axios from 'axios';
import '@/modules/dashboard/Dashboard.css';
import { setClienteNota } from '@/store/crearNotaSlice';



const SelectorCliente2= () => {
    const esEditor = useSelector((state) => state.formulario.esEditor)
    const paisID = useSelector((state) => state.formulario.usuario.id_pais)
    
    const nombreCliente = useSelector((state) => state.crearNota.cliente)
    const TOKEN = useSelector((state) => state.formulario.token)
    const todosLosClientes = useSelector((state) => state.dashboard.todosLosClientes) || []
    
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
                    let clientes  = response.data.item
                        if(paisID){
                            clientes = clientes.filter(cliente => cliente.pais_id === paisID);
                        }
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
        dispatch(setClienteNota({ nombre: cliente.name, id: cliente.id }))
    }

    const TodosLosClientesParaEditor =() =>{
        dispatch(setClienteNota(null))
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
                {nombreCliente == "" ? "Nota sin cuenta" : nombreCliente }
            </button>
            <ul className="dropdown-menu listaClientes" aria-labelledby="dropdownMenuButton1">
                {/* Campo de búsqueda */}


                
                <li>
                    <input
                        type="text"
                        className="form-control dropdown-search m-2"
                        placeholder="Buscar cuenta..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        
                    
                    />
                </li>
                <li key={"Sin Cuenta"}>
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
                    <li className="text-center text-muted">No se encontraron cuentas</li>
                )}
            </ul>
        </div>
    );
};

export default SelectorCliente2;
