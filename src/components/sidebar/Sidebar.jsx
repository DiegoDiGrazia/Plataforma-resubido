import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { obtenerConsolidacionCliente, obtenerContratos } from '../administrador/gestores/apisUsuarios';
import { obtenerPaginas } from '../Apis/paginasApi.js';
import { updateContratoConFacturacionAbierta, updatePaginasDelUsuario } from '../../redux/formularioSlice';
import { useDispatch } from 'react-redux';

const Sidebar = ({ estadoActual }) => {
  const esEditor = useSelector((state) => state.formulario.es_editor);
  const esContratoConFacturacionAbierta = useSelector((state) => state.formulario.contratoConFacturacionAbierta);
  const cliente = useSelector((state) => state.formulario.cliente);
  const PerfilUsuario = useSelector((state) => state.formulario.usuario.perfil);
  const TOKEN = useSelector((state) => state.formulario.token);
  const id_cliente = useSelector((state) => state.formulario.id_cliente);
  const [paginasDelPerfil, setPaginasPerfil]= useState([]);
  const [respuestaCreditos, setRespuestaCreditos] = useState(null);
  const dispatch = useDispatch();

  const permisoDashboard = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Dashboard: Datos") || false);
  const permisoFeed = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Feed" || permiso.id === 92) || false);
  const permisoAdmin = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Administracion") || false);
  const permisoMonitor = useSelector((state) => state.formulario.paginasDelUsuario?.some(permiso => permiso.nombre === "Monitor Editorial") || false);

  useEffect(() => {
    if (!PerfilUsuario) return;

    const cargarPaginas = async () => {
      try {
        const res = await obtenerPaginas(TOKEN, PerfilUsuario);
        setPaginasPerfil(res);
        dispatch(updatePaginasDelUsuario(res));
      } catch (err) {
        console.error(err);
      }
    };
    cargarPaginas();
  }, [PerfilUsuario]);

  useEffect(() => {
    if (!id_cliente) return;
    const cargarCredito = async () => {
      try {
        const res = await obtenerConsolidacionCliente(TOKEN, id_cliente);
        setRespuestaCreditos(res);
      } catch (err) {
        console.error(err);
      }
    };
    const tieneContratoConFacturacionAbierta = async () => {
      try {
        const contratos = await obtenerContratos(TOKEN);
        const contratoAbierto = contratos.find(contrato => 
        contrato.id_cliente === id_cliente && contrato.abierto === 'SI');
        console.log('Contrato', contratoAbierto);
        dispatch(updateContratoConFacturacionAbierta(contratoAbierto ? true : false));
      } catch (err) {
        console.error(err);
      }
    };
    tieneContratoConFacturacionAbierta();
    cargarCredito();
  }, [id_cliente]);
  const location = useLocation();

  estadoActual = location.pathname.split('/')[1] || 'dashboard'; // Obtiene el estado actual desde la URL

  // Solo mobile: el menú se abre a pantalla completa desde la hamburguesa.
  // En desktop el sidebar está siempre visible y este estado no tiene efecto.
  const [menuMobileVisible, setMenuMobileVisible] = useState(false);
  const cerrarMenuMobile = () => setMenuMobileVisible(false);

  useEffect(() => {
    if (!menuMobileVisible) return;
    const cerrarConEscape = (e) => e.key === 'Escape' && cerrarMenuMobile();
    document.addEventListener('keydown', cerrarConEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', cerrarConEscape);
      document.body.style.overflow = '';
    };
  }, [menuMobileVisible]);

  const navigate = useNavigate();

  const handleClickBotonSidebar = (url) => {
    navigate(`/${url}`);
    cerrarMenuMobile();
  };

  const renderSidebarButton = (estado, url, icono, texto, iconoBootstrap) => {
    const activo = estadoActual === estado;
    return (
      <li className={`sidebar__item ${activo ? 'sidebar__item--activo' : ''}`}>
        <button
          type="button"
          className="sidebar__link"
          aria-current={activo ? 'page' : undefined}
          onClick={() => handleClickBotonSidebar(url)}
        >
          <i className={`sidebar__icono ${iconoBootstrap}`} aria-hidden="true"></i>
          <span className="sidebar__texto">{texto}</span>
        </button>
      </li>
    );
  };

  const obtenerCreditoDisponible = (respuestaCreditos) => {
    const creditoTotal = respuestaCreditos?.credito?.reduce(
    (acc, item) => acc + Number(item.monto_mensual),
    0
  ) ?? 0;

  const consumoTotal = respuestaCreditos?.consumo?.reduce(
    (acc, item) =>
      acc + Number(item.monto_dv360 || 0) + Number(item.monto_meta || 0),
    0
  ) ?? 0;

  const totalFormateado = (creditoTotal - consumoTotal).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    })
    return totalFormateado;
  }

  return (
    <>
      {/* Barra superior mobile: hamburguesa + logo (oculta en desktop) */}
      <header className="sidebar-topbar no-print">
        <button
          type="button"
          className="sidebar-topbar__boton"
          aria-label="Abrir menú"
          aria-expanded={menuMobileVisible}
          aria-controls="sidebar-navegacion"
          onClick={() => setMenuMobileVisible(true)}
        >
          <i className="bi bi-list" aria-hidden="true"></i>
        </button>
        <img src="/images/logoNdNegroNaranja.png" alt="Noticias (d)" className="sidebar-topbar__logo" />
      </header>

      <aside
        id="sidebar-navegacion"
        className={`sidebar no-print ${menuMobileVisible ? 'sidebar--mobile-visible' : ''}`}
        aria-label="Navegación principal"
      >
        <div className="sidebar__header">
          <img src="/images/logoNdNegroNaranja.png" alt="Noticias (d)" className="sidebar__logo" />
          <button
            type="button"
            className="sidebar__cerrar"
            aria-label="Cerrar menú"
            onClick={cerrarMenuMobile}
          >
            <i className="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__lista">
            {cliente && permisoDashboard &&
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
            {permisoMonitor && renderSidebarButton(
              'monitor',
              'monitorEditorial',
              '/images/auto_entrevistas_icon.png',
              'Monitor Contenido',
              'bi bi-display-fill'
            )}
            {renderSidebarButton(
              'autoEntrevistas',
              'autoEntrevistas',
              '/images/auto_entrevistas_icon.png',
              'Auto-entrevistas',
              'bi bi-mic-fill'
            )}
            {(permisoAdmin) && renderSidebarButton(
              'Administrador',
              'administrador',
              '/images/auto_entrevistas_icon.png',
              'Administración',
              'bi bi-gear-fill'
            )}
            {permisoAdmin && renderSidebarButton(
              'gestion-reportes',
              'gestion-reportes',
              '/images/auto_entrevistas_icon.png',
              'Gestión reportes',
              'bi bi-file-earmark-bar-graph-fill'
            )}
            {(permisoAdmin || permisoFeed) && renderSidebarButton(
              'Feed',
              'feed',
              '/images/auto_entrevistas_icon.png',
              'Feed',
              'bi bi-rss-fill'
            )}
            {paginasDelPerfil.find((pagina) => pagina.nombre === "Distribucion: Listado") && renderSidebarButton(
              'distribucion',
              'distribucion',
              '/images/auto_entrevistas_icon.png',
              'Distribución',
              'bi bi-clipboard2-check-fill'
            )}
            
            {paginasDelPerfil.find((pagina) => pagina.nombre == "Comercial" ) && renderSidebarButton(
              'comercial',
              'comercial',
              '/images/auto_entrevistas_icon.png',
              'Comercial',
              'bi bi-bag-fill'
            )}
          </ul>
        </nav>

        <div className="sidebar__footer">
          {(respuestaCreditos && esContratoConFacturacionAbierta) && (
            <div className="sidebar__credito">
              <span className="sidebar__credito-label">Crédito disponible</span>
              <span className="sidebar__credito-valor">$ {obtenerCreditoDisponible(respuestaCreditos)}</span>
              <a
                className="sidebar__credito-link"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://noticiasd.mitiendanube.com/autogestion/?clid=${id_cliente}`}
              >
                Recargar crédito
              </a>
            </div>
          )}
          <ul className="sidebar__lista">
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
                'Mi perfil',
                'bi bi-person-fill'
              )}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;