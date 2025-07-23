// App.js

import React, { Suspense, lazy } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../src/components/login/Formulario.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ArchivoProvider } from "./context/archivoContext";
import LayoutConSidebar from './LayoutConSidebar'; // Ajustá si está en otra carpeta

// 👇 Acá van tus componentes con lazy
const Formulario = lazy(() => import('./components/login/Formulario'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const CrearNota = lazy(() => import('./components/nota/CrearNota'));
const PublicarNota = lazy(() => import('./components/nota/PublicarNota'));
const VerNota = lazy(() => import('./components/nota/VerNota'));
const Perfil = lazy(() => import('./components/miPerfil/miPerfil'));
const Soporte = lazy(() => import('./components/miPerfil/soporte'));
const NotasParaEditorial = lazy(() => import('./components/nota/NotasParaEditorial'));
const RecuperarContraseña = lazy(() => import('./components/login/RecuperarContraseña'));
const UpdatePassword = lazy(() => import('./components/login/updatePassword'));
const AutoEntrevistasVideoAsk = lazy(() => import('./components/miPerfil/AutoEntrevistasVideoAsk'));

function App() {
  return (
    <ArchivoProvider>
      <BrowserRouter>
        <Suspense fallback={<div>Cargando...</div>}>
          <Routes>
            {/* Rutas sin Sidebar */}
            <Route path="/" element={<Formulario />} />
            <Route path="/recuperar-contraseña" element={<RecuperarContraseña />} />
            <Route path="/actualizar-contraseña" element={<UpdatePassword />} />

            {/* Rutas con Sidebar */}
            <Route element={<LayoutConSidebar />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/crearNota" element={<CrearNota />} />
              <Route path="/publicarNota" element={<PublicarNota />} />
              <Route path="/mi-perfil" element={<Perfil />} />
              <Route path="/autoEntrevistas" element={<AutoEntrevistasVideoAsk />} />
              <Route path="/soporte-y-ayuda" element={<Soporte />} />
              <Route path="/verNota/:id_ruta?" element={<VerNota />} />
              <Route path="/notas" element={<NotasParaEditorial />} />
              <Route path="/notasEditorial" element={<NotasParaEditorial />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ArchivoProvider>
  );
}

export default App;
