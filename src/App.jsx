// App.js

import React, { Suspense, lazy } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../src/components/login/Formulario.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ArchivoProvider } from "./context/archivoContext";
import LayoutConSidebar from './LayoutConSidebar'; // Ajustá si está en otra carpeta
import Administrador from './components/administrador/Administrador';
import UsuariosAdmin from './components/administrador/gestores/UsuariosAdmin';
import PerfilesAdmin from './components/administrador/gestores/PerfilesAdmin';
import DistribucionAdmin from './components/administrador/gestores/Distribucion';
import NotaFreemiumDistribucion from './components/notaFreemium/NotaFreemiumDistribucion';
import Comercial from './components/comercial/comercial';
import CalculadoraVentas from './components/comercial/calculadoraDeVentas';
import AbmPerfiles from './components/comercial/AbmPerfiles';
import AbmComisionistas from './components/comercial/AbmComisionistas';

// 👇 Acá van tus componentes con lazy
const Formulario = lazy(() => import('./components/login/Formulario'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const CrearNota = lazy(() => import('./components/nota/CrearNota'));
const PublicarNota = lazy(() => import('./components/nota/PublicarNota'));
const VerNota = lazy(() => import('./components/nota/VerNota'));
const Perfil = lazy(() => import('./components/miPerfil/miPerfil'));
const Soporte = lazy(() => import('./components/miPerfil/soporte'));
const AbmClientes = lazy(() => import('./components/administrador/gestores/AbmClientes'));
const NotasParaEditorial = lazy(() => import('./components/nota/NotasParaEditorial'));
const RecuperarContraseña = lazy(() => import('./components/login/RecuperarContraseña'));
const UpdatePassword = lazy(() => import('./components/login/updatePassword'));
const AutoEntrevistasVideoAsk = lazy(() => import('./components/miPerfil/AutoEntrevistasVideoAsk'));
const NotasCliente = lazy(() => import('./components/administrador/gestores/NotasCliente'));

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
              <Route path="/administrador" element={<Administrador />} />
              <Route path="/usuarios" element={<UsuariosAdmin />} />
              <Route path="/perfiles" element={<PerfilesAdmin />} />
              <Route path="/distribucion" element={<DistribucionAdmin />} />
              <Route path="/clientes" element={<AbmClientes />} />
              <Route path="/distribuir-nota-freemium" element={<NotaFreemiumDistribucion />} />
              <Route path="/notas-cliente" element={<NotasCliente />} />
              <Route path="/mi-perfil" element={<Perfil />} />
              <Route path="/autoEntrevistas" element={<AutoEntrevistasVideoAsk />} />
              <Route path="/soporte-y-ayuda" element={<Soporte />} />
              <Route path="/verNota/:id_ruta?" element={<VerNota />} />
              <Route path="/notas" element={<NotasParaEditorial />} />
              <Route path="/notasEditorial" element={<NotasParaEditorial />} />
              

              {/* COMERCIAL */}
              <Route path="/comercial" element={<Comercial />} />
              <Route path="/comercial/calculadora-ventas" element={<CalculadoraVentas />} />
              <Route path="/comercial/abm-perfiles" element={<AbmPerfiles />} />
              <Route path="/comercial/abm-comisionistas" element={<AbmComisionistas />} />

            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ArchivoProvider>
  );
}

export default App;
