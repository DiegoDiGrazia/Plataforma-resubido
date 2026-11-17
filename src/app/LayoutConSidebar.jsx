// src/components/layouts/LayoutConSidebar.js
import React from 'react';
import Sidebar from '@/shared/components/sidebar/Sidebar'; // Ajustá el path
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import GuardarUbicacionDeCliente from '@/modules/dashboard/GuardarUbicacionDeCliente'; 
import ReloginModal from '@/modules/auth/ReloginModal.jsx';
import { useSessionManager } from '@/shared/hooks/useSessionManager.js';


const LayoutConSidebar = () => {
    const id_cliente = useSelector((state) => state.formulario.id_cliente);
    const { mostrarModal, reloguear } = useSessionManager();

    return (
                <div className="container-fluid sinPadding">
                <GuardarUbicacionDeCliente id_cliente={id_cliente}/>
                <div className="d-flex h-100">
                    <Sidebar className='no-print' />
                    <div className="content flex-grow-1">
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
