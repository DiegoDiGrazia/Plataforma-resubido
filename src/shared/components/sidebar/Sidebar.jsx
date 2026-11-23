import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { obtenerConsolidacionCliente, obtenerContratos } from '@/api/apisUsuarios';
import { obtenerPaginas } from '@/api/paginasApi.js';
import { updateContratoConFacturacionAbierta, updatePaginasDelUsuario } from '@/store/formularioSlice';
import { useMenuSidebar, estaActivo } from './menuSidebar';

const LOGO = '/images/logoNdNegroNaranja.png';

const obtenerCreditoDisponible = (respuestaCreditos) => {
  const creditoTotal = respuestaCreditos?.credito?.reduce(
    (acc, item) => acc + Number(item.monto_mensual),
    0
  ) ?? 0;
  const consumoTotal = respuestaCreditos?.consumo?.reduce(
    (acc, item) => acc + Number(item.monto_dv360 || 0) + Number(item.monto_meta || 0),
    0
  ) ?? 0;
  return (creditoTotal - consumoTotal).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const Sidebar = () => {
  const esContratoConFacturacionAbierta = useSelector((state) => state.formulario.contratoConFacturacionAbierta);
  const PerfilUsuario = useSelector((state) => state.formulario.usuario.perfil);
  const TOKEN = useSelector((state) => state.formulario.token);
  const id_cliente = useSelector((state) => state.formulario.id_cliente);
  const [respuestaCreditos, setRespuestaCreditos] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { principal, pie } = useMenuSidebar();

  useEffect(() => {
    if (!PerfilUsuario) return;
    obtenerPaginas(TOKEN, PerfilUsuario)
      .then((res) => dispatch(updatePaginasDelUsuario(res)))
      .catch((err) => console.error(err));
  }, [PerfilUsuario]);

  useEffect(() => {
    if (!id_cliente) return;
    obtenerConsolidacionCliente(TOKEN, id_cliente)
      .then(setRespuestaCreditos)
      .catch((err) => console.error(err));
    obtenerContratos(TOKEN)
      .then((contratos) => {
        const contratoAbierto = contratos.find((contrato) =>
          Number(contrato.id_cliente) === id_cliente && contrato.abierto === 'SI');
        dispatch(updateContratoConFacturacionAbierta(Boolean(contratoAbierto)));
      })
      .catch((err) => console.error(err));
  }, [id_cliente]);

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

  // Desplegables (Administración, Comercial): el del grupo de la pantalla actual se abre solo.
  const [gruposAbiertos, setGruposAbiertos] = useState({});
  const idGrupoActivo = principal.find((item) => item.hijos && estaActivo(item, pathname))?.id;
  useEffect(() => {
    if (idGrupoActivo) setGruposAbiertos((prev) => ({ ...prev, [idGrupoActivo]: true }));
  }, [idGrupoActivo]);
  const alternarGrupo = (id) => setGruposAbiertos((prev) => ({ ...prev, [id]: !prev[id] }));

  const irA = (url) => {
    navigate(url);
    cerrarMenuMobile();
  };

  const renderItem = (item, { subitem = false } = {}) => {
    const activo = estaActivo(item, pathname);
    return (
      <li key={item.id} className={`sidebar__item ${subitem ? 'sidebar__item--sub' : ''} ${activo ? 'sidebar__item--activo' : ''}`}>
        <button
          type="button"
          className="sidebar__link"
          aria-current={activo ? 'page' : undefined}
          onClick={() => irA(item.url)}
        >
          {item.icono && <i className={`sidebar__icono ${item.icono}`} aria-hidden="true"></i>}
          <span className="sidebar__texto">{item.texto}</span>
        </button>
      </li>
    );
  };

  const renderGrupo = (grupo) => {
    const activo = estaActivo(grupo, pathname);
    const abierto = Boolean(gruposAbiertos[grupo.id]);
    const idSubmenu = `sidebar-submenu-${grupo.id}`;
    return (
      <li
        key={grupo.id}
        className={`sidebar__item sidebar__grupo ${activo ? 'sidebar__grupo--activo' : ''} ${abierto ? 'sidebar__grupo--abierto' : ''}`}
      >
        <button
          type="button"
          className="sidebar__link"
          aria-expanded={abierto}
          aria-controls={idSubmenu}
          onClick={() => alternarGrupo(grupo.id)}
        >
          <i className={`sidebar__icono ${grupo.icono}`} aria-hidden="true"></i>
          <span className="sidebar__texto">{grupo.texto}</span>
          <i className="sidebar__chevron bi bi-chevron-down" aria-hidden="true"></i>
        </button>
        {abierto && (
          <ul id={idSubmenu} className="sidebar__sublista">
            {grupo.hijos.map((hijo) => renderItem(hijo, { subitem: true }))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Barra superior mobile: logo centrado + hamburguesa a la derecha (oculta en desktop) */}
      <header className="sidebar-topbar no-print">
        <img src={LOGO} alt="Noticias (d)" className="sidebar-topbar__logo" />
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
      </header>

      <aside
        id="sidebar-navegacion"
        className={`sidebar no-print ${menuMobileVisible ? 'sidebar--mobile-visible' : ''}`}
        aria-label="Navegación principal"
      >
        <div className="sidebar__header">
          <img src={LOGO} alt="Noticias (d)" className="sidebar__logo" />
          {/* Misma hamburguesa y misma posición que en la barra superior: abre y cierra */}
          <button
            type="button"
            className="sidebar__cerrar"
            aria-label="Cerrar menú"
            aria-expanded={menuMobileVisible}
            onClick={cerrarMenuMobile}
          >
            <i className="bi bi-list" aria-hidden="true"></i>
          </button>
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__lista">
            {principal.map((item) => (item.hijos ? renderGrupo(item) : renderItem(item)))}
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
            {pie.map((item) => renderItem(item))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
