// Detecta los 401 de la API de services (token vencido o invalido) en cualquier fetch de la app
// y avisa con un evento, para que useSessionManager abra el modal de "Tu sesion expiro".
// Los 401 de /auth/* son errores de login (email o clave incorrectos) y no cuentan.

export const EVENTO_SESION_EXPIRADA = 'sesion-expirada';

const esApiServices = (url) =>
  url.startsWith('/services/') || url.includes('services.noticiasd.com');

export const instalarInterceptor401 = () => {
  if (window.__interceptor401Instalado) return;
  window.__interceptor401Instalado = true;

  const fetchOriginal = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const res = await fetchOriginal(input, init);

    const url = typeof input === 'string' ? input : input?.url || '';
    if (res.status === 401 && esApiServices(url) && !url.includes('/auth/')) {
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    }

    return res;
  };
};
