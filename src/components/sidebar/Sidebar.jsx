import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const Sidebar = ({ estadoActual }) => {
  const esEditor = useSelector((state) => state.formulario.es_editor);
  const cliente = useSelector((state) => state.formulario.cliente);
  const location = useLocation();

  estadoActual = location.pathname.split('/')[1] || 'dashboard'; // Obtiene el estado actual desde la URL
  console.log("Estado actual desde Sidebar:", estadoActual);
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const navigate = useNavigate();

  const handleClickBotonSidebar = (url) => {
    navigate(`/${url}`);
  };


  // Función para generar botones del sidebar
  const renderSidebarButton = (estado, url, icono, texto) => (
    <li
      className={`${
        estadoActual === estado ? 'boton_sidebar_clickeado' : 'boton_sidebar_Noclickeado'
      } ${isOpen ? 'openBoton' : 'closedBoton'}`}
    >
      <Button className="botonSidebar" variant="none" onClick={() => handleClickBotonSidebar(url)}>
        <img src={icono} alt={`Icono ${texto}`} className="icon me-2" />
        <span className={`descripcion_boton ${isOpen ? 'open' : 'closed'}`}>{texto}</span>
      </Button>
    </li>
  );

  return (
    <>
      <div className={`sidebar no-print ${isOpen ? 'open' : 'closed'}`}>
        <div className="flex-grow-1">
          {isOpen ? (
            <img
              src="/images/logoNdNegroNaranja.png"
              alt="Logo grande"
              className="img-fluid"
              id="logo-nd-sidebar"
            />
          ) : (
            <img
              src="/images/logoNdNegroNaranjaMini.png"
              alt="Logo miniatura"
              className="img-fluid"
              id="logo-nd-miniatura"
              style={{ width: '50px !important' }}
            />
          )}

          <Button className="sidebar-toggle" variant="none" onClick={toggleSidebar}>
            {isOpen ? (
              <img src="/images/sidebar_left_bot.png" alt="Cerrar sidebar" className="img-fluid" />
            ) : (
              <img src="/images/sidebar_right_bot.png" alt="Abrir sidebar" className="img-fluid" />
            )}
          </Button>

          <ul className="list-group list-group-flush no-border list-unstyled">
            {cliente &&
              renderSidebarButton(
                'dashboard',
                'dashboard',
                '/images/barchar_icon.png',
                'Dashboard'
              )}

            {esEditor === false
              ? renderSidebarButton('notas', 'notas', '/images/notas_icon.png', 'Notas')
              : renderSidebarButton(
                  'notasEditorial',
                  'notasEditorial',
                  '/images/notas_icon.png',
                  'Notas'
                )}

            {renderSidebarButton(
              'autoEntrevistas',
              'autoEntrevistas',
              '/images/auto_entrevistas_icon.png',
              'Auto-entrevistas'
            )}
            {/* {renderSidebarButton(
              'notificaciones',
              'notificaciones',
              '/images/notificacion_icon.png',
              'Notificaciones'
            )} */}

            <ul className="list-group list-unstyled botones_inferiories">
              {renderSidebarButton(
                'soporte-y-ayuda',
                'soporte-y-ayuda',
                '/images/ayuda_icon.png',
                'Ayuda y soporte'
              )}
              <li
                className={`${
                  estadoActual === 'mi-perfil'
                    ? 'boton_sidebar_clickeado'
                    : 'boton_sidebar_Noclickeado'
                } ${isOpen ? 'openBoton' : 'closedBoton'} mb-4`}
              >
                <Button
                  className="botonSidebar mb-4"
                  variant="none"
                  onClick={() => handleClickBotonSidebar('mi-perfil')}
                  style={{
                    position: 'relative',
                    right: '8px',
                  }}
                >
                  <img
                    src="/images/miPerfilIconMini.png"
                    alt="Icono Mi perfil"
                    className="icon me-2"
                  />
                  <span
                    style={{
                      position: 'relative',
                      top: '5px',
                    }}
                    className={`descripcion_boton ${isOpen ? 'open' : 'closed'} text-center`}
                  >
                    Mi perfil
                  </span>
                </Button>
              </li>
            </ul>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;