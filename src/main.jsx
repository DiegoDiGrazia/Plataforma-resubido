import React from 'react';
import { createRoot } from 'react-dom/client';

// Orden de los estilos (no cambiarlo): Bootstrap → sistema de diseño (src/styles) → App,
// que trae legacy.css y el CSS de cada pantalla. Así el CSS de una pantalla le gana a
// Bootstrap y a los tokens en los empates, sin !important.
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
// Bootstrap JS una sola vez (dropdowns, modales con data-bs-*). Varias pantallas usan
// window.bootstrap.Modal, por eso se expone global.
import * as bootstrap from 'bootstrap';

import App from '@/app/App.jsx';
import { Provider } from 'react-redux';
import store, { persistor } from '@/store/store.js';
import { PersistGate } from 'redux-persist/integration/react';
import { instalarInterceptor401 } from '@/shared/utils/interceptor401.js';

window.bootstrap = bootstrap;
instalarInterceptor401();

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  // </StrictMode>
);
