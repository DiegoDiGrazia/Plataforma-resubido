// App.js

import React, { Suspense, lazy } from 'react';
import './App.css';
// Bootstrap y el sistema de diseño se cargan antes, en main.jsx.
// Clases legacy compartidas entre módulos: DESPUÉS de Bootstrap (para ganarle a .row > *, .col-*)
// y ANTES de importar las pantallas (para que el CSS propio de cada una les gane).
import '@/styles/legacy.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ArchivoProvider } from "@/shared/context/archivoContext";
import LayoutConSidebar from './LayoutConSidebar'; // Ajustá si está en otra carpeta
import Administrador from '@/modules/administracion/Administrador';
import UsuariosAdmin from '@/modules/administracion/UsuariosAdmin';
import PerfilesAdmin from '@/modules/administracion/PerfilesAdmin';
import DistribucionAdmin from '@/modules/distribucion/Distribucion';
import NotaFreemiumDistribucion from '@/modules/notas/freemium/NotaFreemiumDistribucion';
import Comercial from '@/modules/comercial/Comercial';
import AbmPlanes from '@/modules/comercial/AbmPlanes';
import AbmComisionistas from '@/modules/comercial/AbmComisionistas';
import AbmContratos from '@/modules/comercial/AbmContratos';
import Facturas from '@/modules/comercial/Facturas';
import AbmSitiosRelevantes from '@/modules/administracion/AbmSitiosRelevantes';
import MonitorEditorial from '@/modules/monitor/MonitorEditorial';
import GestionPresupuestos from '@/modules/comercial/calculadora/GestionPresupuestos';
import GestionReportes from '@/modules/gestionReportes/GestionReportes';

// 👇 Acá van tus componentes con lazy
const Formulario = lazy(() => import('@/modules/auth/Formulario'));
const Dashboard = lazy(() => import('@/modules/dashboard/Dashboard'));
const CrearNota = lazy(() => import('@/modules/notas/CrearNota'));
const PublicarNota = lazy(() => import('@/modules/notas/PublicarNota'));
const EditorNota = lazy(() => import('@/modules/notas/EditorNota'));
const RedirigirEditorLegacy = lazy(() => import('@/modules/notas/RedirigirEditorLegacy'));
const VerNota = lazy(() => import('@/modules/notas/VerNota'));
const Perfil = lazy(() => import('@/modules/perfil/miPerfil'));
const Soporte = lazy(() => import('@/modules/soporte/soporte'));
const AbmClientes = lazy(() => import('@/modules/administracion/AbmClientes'));
const NotasParaEditorial = lazy(() => import('@/modules/notas/NotasParaEditorial'));
const CambiarClave = lazy(() => import('@/modules/auth/CambiarClave'));
const AutoEntrevistasVideoAsk = lazy(() => import('@/modules/autoEntrevistas/AutoEntrevistasVideoAsk'));
const NotasCliente = lazy(() => import('@/modules/distribucion/NotasCliente'));
const Feed = lazy(() => import('@/modules/feed/Feed'));
function App() {
  return (
    <ArchivoProvider>
      <BrowserRouter>
        <Suspense fallback={<div>Cargando...</div>}>
          <Routes>
            {/* Rutas sin Sidebar */}
            <Route path="/" element={<Formulario />} />
            <Route path="/cambiar-clave" element={<CambiarClave />} />


            {/* Rutas con Sidebar */}
            <Route element={<LayoutConSidebar />}>
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Editor de notas: la URL identifica la nota (id o "nueva-<uuid>"), así cada pestaña edita la suya */}
              <Route path="/notas/editar/:clave" element={<EditorNota />}>
                <Route index element={<CrearNota />} />
                <Route path="publicar" element={<PublicarNota />} />
              </Route>
              {/* Rutas viejas: redirigen a la nueva con la nota que esté en memoria */}
              <Route path="/crearNota" element={<RedirigirEditorLegacy />} />
              <Route path="/publicarNota" element={<RedirigirEditorLegacy publicar />} />
              <Route path="/administrador" element={<Administrador />} />
              <Route path="/usuarios" element={<UsuariosAdmin />} />
              <Route path="/perfiles" element={<PerfilesAdmin />} />
              <Route path="/distribucion" element={<DistribucionAdmin />} />
              <Route path="/clientes" element={<AbmClientes />} />
              <Route path='/sitios-relevantes' element={<AbmSitiosRelevantes/>} />
              <Route path="/distribuir-nota-freemium" element={<NotaFreemiumDistribucion />} />
              <Route path="/notas-cliente/:cliente/:desde/:hasta" element={<NotasCliente />} />
              <Route path="/mi-perfil" element={<Perfil />} />
              <Route path="/autoEntrevistas" element={<AutoEntrevistasVideoAsk />} />
              <Route path="/soporte-y-ayuda" element={<Soporte />} />
              <Route path="/verNota/:id_ruta?" element={<VerNota />} />
              <Route path="/notas" element={<NotasParaEditorial />} />
              <Route path="/notasEditorial" element={<NotasParaEditorial />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/monitorEditorial" element={<MonitorEditorial />} />
              <Route path="/gestion-reportes" element={<GestionReportes />} />

              

              {/* COMERCIAL */}
              <Route path="/comercial" element={<Comercial />} />
              <Route path="/comercial/abm-presupuestos" element={<GestionPresupuestos />} />
              <Route path="/comercial/abm-planes" element={<AbmPlanes />} />
              <Route path="/comercial/abm-comisionistas" element={<AbmComisionistas />} />
              <Route path="/comercial/abm-contratos" element={<AbmContratos />} />
              <Route path="/comercial/facturas" element={<Facturas />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ArchivoProvider>
  );
}

export default App;
