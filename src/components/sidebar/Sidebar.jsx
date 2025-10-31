import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { obtenerPaginas } from '../administrador/gestores/apisUsuarios';

const Sidebar = ({ estadoActual }) => {
  const esEditor = useSelector((state) => state.formulario.es_editor);
  const cliente = useSelector((state) => state.formulario.cliente);
  const PerfilUsuario = useSelector((state) => state.formulario.usuario.perfil);
  const TOKEN = useSelector((state) => state.formulario.token);
  const [paginasDelPerfil, setPaginasPerfil]= useState([]);

  // Cargar usuarios
  useEffect(() => {
    if (!PerfilUsuario ) return;
    obtenerPaginas(TOKEN, PerfilUsuario).then(setPaginasPerfil);
}, [PerfilUsuario]);


  const location = useLocation();

  estadoActual = location.pathname.split('/')[1] || 'dashboard'; // Obtiene el estado actual desde la URL
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const navigate = useNavigate();

  const handleClickBotonSidebar = (url) => {
    navigate(`/${url}`);
  };

  const renderSidebarButton = (estado, url, icono, texto, iconoBootstrap) => (
    <li
      className={`${
        estadoActual === estado ? 'boton_sidebar_clickeado' : 'boton_sidebar_Noclickeado'
      } ${isOpen ? 'openBoton' : 'closedBoton'}`}
    >
      <Button className="botonSidebar" variant="none" onClick={() => handleClickBotonSidebar(url)}>
        <i class={`fs-4 mb-4 ${iconoBootstrap}`} style={{color: '#3e4658ff', marginRight: '5px', bottom: '10px'}}></i>
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
                'Dashboard',
                'bi bi-bar-chart-fill'
              )}  
            {esEditor === false
              ? renderSidebarButton('notas', 'notas', '/images/notas_icon.png', 'Notas', 'bi bi-stack')
              : renderSidebarButton(
                  'notasEditorial',
                  'notasEditorial',
                  '/images/notas_icon.png',
                  'Notas',
                  'bi bi-stack'
                )}
            {renderSidebarButton(
              'autoEntrevistas',
              'autoEntrevistas',
              '/images/auto_entrevistas_icon.png',
              'Auto-entrevistas',
              'bi bi-mic-fill'
            )}
            {PerfilUsuario == '1' && renderSidebarButton(
              'Administrador',
              'administrador',
              '/images/auto_entrevistas_icon.png',
              'Administrador',
              'bi bi-gear-fill'
            )}
            {paginasDelPerfil.find((pagina) => pagina.nombre == "Distribucion" || pagina.nombre == "Monitor Distribucion" ) && renderSidebarButton(
              'distribucion',
              'distribucion',
              '/images/auto_entrevistas_icon.png',
              'Distribucion',
              'bi bi-clipboard2-check-fill'
            )}
            <ul className="list-group list-unstyled botones_inferiories">
              {renderSidebarButton(
                'soporte-y-ayuda',
                'soporte-y-ayuda',
                '/images/ayuda_icon.png',
                'Ayuda y soporte',
                'bi bi-headset'
              )}
              {renderSidebarButton(
                'mi-perfil',
                'mi-perfil',
                '',
                'Mi perfl',
                'bi bi-person-fill'
              )}
            </ul>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;