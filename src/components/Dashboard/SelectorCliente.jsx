import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'cropperjs/dist/cropper.css';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';
import { setTodosLosClientes } from '../../redux/dashboardSlice';
import { obtenerClientes } from '../Apis/apis';
import { updateActivarTodosLosClientes, updateCliente, updateIdCliente } from '../../redux/formularioSlice';
import './Dashboard.css';
import { Navigate, useNavigate } from 'react-router-dom';
import { setClienteNota } from '../../redux/crearNotaSlice';
import { borrarTildes } from '../../utils/funcionesVarias';

const SelectorCliente = ({ incluirTodos = true }) => {
    const esEditor = useSelector((state) => state.formulario.esEditor);
    const paisID = useSelector((state) => state.formulario.usuario.id_pais);
    const nombreCliente = useSelector((state) => state.formulario.cliente);
    const TOKEN = useSelector((state) => state.formulario.token);
    const idClienteLogueado = useSelector((state) => state.formulario.usuario.id_cliente);
    const todosLosClientes = useSelector((state) => state.dashboard.todosLosClientes) || [];
    const navigate = useNavigate();
    const [esFranquicia, setEsFranquicia] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        obtenerClientes(TOKEN)
            .then((data) => {
                let clientes = Array.isArray(data) ? data : [];
                if (paisID) {
                    clientes = clientes.filter(cliente => cliente.pais_id === paisID);
                }

                const clienteLogueado = clientes.find((cliente) => cliente.id == idClienteLogueado);
                const logueadoEsFranquicia = clienteLogueado?.tipo === 'FRANQUICIA';
                setEsFranquicia(logueadoEsFranquicia);

                if (logueadoEsFranquicia) {
                    let cuentasCreadas = [];
                    try {
                        const datos = clienteLogueado.datosFranquicia ? JSON.parse(clienteLogueado.datosFranquicia) : null;
                        cuentasCreadas = Array.isArray(datos?.cuentas_creadas) ? datos.cuentas_creadas : [];
                    } catch (err) {
                        cuentasCreadas = [];
                    }
                    const idsPermitidos = [clienteLogueado.id, ...cuentasCreadas.map((cuenta) => cuenta.id)];
                    clientes = clientes.filter((cliente) => idsPermitidos.includes(cliente.id));
                }

                clientes.sort((a, b) => {
                    if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                    if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                    return 0;
                });

                dispatch(setTodosLosClientes(clientes));
            })
            .catch((error) => {
                console.error('Error al obtener clientes:', error);
            });
    }, [TOKEN, dispatch, paisID, idClienteLogueado]);

    const editarCliente = (cliente) => {
        dispatch(updateCliente(cliente.name));
        dispatch(setClienteNota(cliente.name));
        if (cliente.id) {
            dispatch(updateIdCliente(cliente.id));
        }
        dispatch(updateActivarTodosLosClientes(false));
    };

    const TodosLosClientesParaEditor = () => {
        dispatch(updateCliente(""));
        dispatch(updateIdCliente(""));
        dispatch(updateActivarTodosLosClientes(true));
        navigate("/notasEditorial");
    };

    const [filtro, setFiltro] = useState('');

    const clientesFiltrados = todosLosClientes.filter((cliente) =>
        borrarTildes(cliente.name.toLowerCase()).includes(borrarTildes(filtro.toLowerCase()))
    );

    const textoSinSeleccion = incluirTodos ? "Todas las cuentas" : "Seleccionar cuenta...";

    return (
        <div className="dropdown no-print">
            {esEditor === false && <h4 id="saludo">Hola</h4>}
            <button
                className="btn custom-dropdown-button dropdown-toggle boton_cliente mb-2 ml-5"
                type="button"
                id="dropdownMenuButtonSelectorCliente"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                {nombreCliente === "" ? textoSinSeleccion : nombreCliente}
            </button>
            <ul className="dropdown-menu listaClientes" aria-labelledby="dropdownMenuButton1" style={{ maxHeight: '200px', overflowY: 'auto' }}>
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
                {!esFranquicia && incluirTodos && (
                    <li key={"Todas las cuentas"}>
                        <button
                            className="dropdown-item"
                            onClick={() => TodosLosClientesParaEditor("")}
                        >
                            {"Todas las cuentas"}
                        </button>
                    </li>
                )}
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
                {clientesFiltrados.length === 0 && (
                    <li className="text-center text-muted">No se encontraron cuentas</li>
                )}
            </ul>
        </div>
    );
};

export default SelectorCliente;