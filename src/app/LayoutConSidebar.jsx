import React from 'react';
import Sidebar from '@/shared/components/sidebar/Sidebar';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import GuardarUbicacionDeCliente from '@/modules/dashboard/GuardarUbicacionDeCliente';
import ReloginModal from '@/modules/auth/ReloginModal.jsx';
import { useSessionManager } from '@/shared/hooks/useSessionManager.js';
import './LayoutConSidebar.css';

const LayoutConSidebar = () => {
    const id_cliente = useSelector((state) => state.formulario.id_cliente);
    const { mostrarModal, reloguear } = useSessionManager();

    return (
        <div className="app-layout">
            <GuardarUbicacionDeCliente id_cliente={id_cliente} />
            <div className="app-layout__cuerpo">
                <Sidebar className="no-print" />
                <div className="app-layout__contenido content">
                    <Outlet />
                </div>
            </div>
            {mostrarModal && (
                <ReloginModal onLoginExitoso={reloguear} />
            )}
        </div>
    );
};

export default LayoutConSidebar;
