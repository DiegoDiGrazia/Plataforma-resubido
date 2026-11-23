// Definición del menú lateral: ítems, permisos y qué rutas marcan cada ítem como activo.
import { useSelector } from 'react-redux';

/** true si la ruta actual es `ruta` o una sub-ruta (`/notas` cubre `/notas/editar/12`). */
export const coincideRuta = (pathname, rutas = []) =>
  rutas.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));

/** Un ítem (o grupo) está activo si la ruta actual coincide con él o con alguno de sus hijos. */
export const estaActivo = (item, pathname) =>
  coincideRuta(pathname, item.rutas) || (item.hijos || []).some((hijo) => estaActivo(hijo, pathname));

const visibles = (items) => items.filter((item) => item.visible);

export const useMenuSidebar = () => {
  // Con la sesión vencida la API devuelve un objeto de error en vez de la lista.
  const paginasStore = useSelector((state) => state.formulario.paginasDelUsuario);
  const paginas = Array.isArray(paginasStore) ? paginasStore : [];
  const esEditor = useSelector((state) => state.formulario.es_editor);
  const cliente = useSelector((state) => state.formulario.cliente);

  const tiene = (nombre) => paginas.some((pagina) => pagina.nombre === nombre);
  const permisoAdmin = tiene('Administracion');

  const hijosAdministracion = visibles([
    { id: 'usuarios', texto: 'Usuarios', url: '/usuarios', rutas: ['/usuarios'], visible: tiene('Usuarios: Listado') },
    { id: 'perfiles', texto: 'Perfiles', url: '/perfiles', rutas: ['/perfiles'], visible: tiene('Perfiles: Listado') },
    { id: 'cuentas', texto: 'Cuentas', url: '/clientes', rutas: ['/clientes'], visible: tiene('Cuentas: Listado') },
    { id: 'sitios', texto: 'Sitios relevantes', url: '/sitios-relevantes', rutas: ['/sitios-relevantes'], visible: tiene('Sitios: Listado') },
  ]);

  const hijosComercial = visibles([
    { id: 'presupuestos', texto: 'Presupuestos', url: '/comercial/abm-presupuestos', rutas: ['/comercial/abm-presupuestos'], visible: true },
    { id: 'planes', texto: 'Planes', url: '/comercial/abm-planes', rutas: ['/comercial/abm-planes'], visible: tiene('Planes: Listado') },
    { id: 'comisionistas', texto: 'Comisionistas', url: '/comercial/abm-comisionistas', rutas: ['/comercial/abm-comisionistas'], visible: tiene('Comisionistas: Listado') },
    { id: 'contratos', texto: 'Contratos', url: '/comercial/abm-contratos', rutas: ['/comercial/abm-contratos'], visible: tiene('Contratos: Listado') },
    { id: 'facturas', texto: 'Facturas', url: '/comercial/facturas', rutas: ['/comercial/facturas'], visible: tiene('Facturas: Listado') },
  ]);

  const principal = visibles([
    {
      id: 'dashboard', texto: 'Dashboard', icono: 'bi bi-bar-chart-fill',
      url: '/dashboard', rutas: ['/dashboard'],
      visible: Boolean(cliente) && tiene('Dashboard: Datos'),
    },
    {
      id: 'notas', texto: 'Notas', icono: 'bi bi-stack',
      url: esEditor === false ? '/notas' : '/notasEditorial',
      rutas: ['/notas', '/notasEditorial', '/verNota', '/crearNota', '/publicarNota'],
      visible: true,
    },
    {
      id: 'monitor', texto: 'Monitor Contenido', icono: 'bi bi-display-fill',
      url: '/monitorEditorial', rutas: ['/monitorEditorial'],
      visible: tiene('Monitor Editorial'),
    },
    {
      id: 'autoEntrevistas', texto: 'Auto-entrevistas', icono: 'bi bi-mic-fill',
      url: '/autoEntrevistas', rutas: ['/autoEntrevistas'],
      visible: true,
    },
    {
      id: 'administracion', texto: 'Administración', icono: 'bi bi-gear-fill',
      hijos: hijosAdministracion,
      visible: permisoAdmin && hijosAdministracion.length > 0,
    },
    {
      id: 'gestionReportes', texto: 'Gestión reportes', icono: 'bi bi-file-earmark-bar-graph-fill',
      url: '/gestion-reportes', rutas: ['/gestion-reportes'],
      visible: permisoAdmin,
    },
    {
      id: 'feed', texto: 'Feed', icono: 'bi bi-rss-fill',
      url: '/feed', rutas: ['/feed'],
      visible: permisoAdmin || paginas.some((pagina) => pagina.nombre === 'Feed' || pagina.id === 92),
    },
    {
      id: 'distribucion', texto: 'Distribución', icono: 'bi bi-clipboard2-check-fill',
      url: '/distribucion', rutas: ['/distribucion', '/distribuir-nota-freemium', '/notas-cliente'],
      visible: tiene('Distribucion: Listado'),
    },
    {
      id: 'comercial', texto: 'Comercial', icono: 'bi bi-bag-fill',
      hijos: hijosComercial,
      visible: tiene('Comercial') && hijosComercial.length > 0,
    },
  ]);

  const pie = [
    { id: 'soporte', texto: 'Ayuda y soporte', icono: 'bi bi-headset', url: '/soporte-y-ayuda', rutas: ['/soporte-y-ayuda'] },
    { id: 'perfil', texto: 'Mi perfil', icono: 'bi bi-person-fill', url: '/mi-perfil', rutas: ['/mi-perfil'] },
  ];

  return { principal, pie };
};
