// src/components/layouts/LayoutConSidebar.js
import React from 'react';
import Sidebar from '../src/components/sidebar/Sidebar'; // Ajustá el path
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import GuardarUbicacionDeCliente from '../src/components/Dashboard/GuardarUbicacionDeCliente'; // Ajustá el path

const LayoutConSidebar = () => {
    const id_cliente = useSelector((state) => state.formulario.id_cliente);

    return (
                <div className="container-fluid sinPadding">
                <GuardarUbicacionDeCliente id_cliente={id_cliente}/>
                <div className="d-flex h-100">
                    <Sidebar estadoActual={"dashboard"} className='no-print' />
                    <div className="content flex-grow-1">
                        <Outlet />
                    </div>
                </div>
            </div>
        );
    };

export default LayoutConSidebar;
