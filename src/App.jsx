import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import UpdatePassword from './components/login/updatePassword';
import Dashboard from './components/Dashboard/Dashboard';
import Formulario from './components/login/Formulario';
import RecuperarContraseña from './components/login/RecuperarContraseña';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link, BrowserRouter, Routes, Route } from 'react-router-dom'; 
import Notas from './components/nota/Notas';
import VerNota from './components/nota/VerNota';
import CrearNota from './components/nota/CrearNota';
import PublicarNota from './components/nota/PublicarNota';
import Perfil from './components/miPerfil/miPerfil';
import Soporte from './components/miPerfil/soporte';
import Notificaciones from './components/miPerfil/Notificaciones';
import AutoEntrevistas from './components/miPerfil/AutoEntrevistas';
import NotasParaEditorial from './components/nota/NotasParaEditorial';

const inlineStyles = {
  marginRight: '10px'
};

function App() {

  
  return (
    <BrowserRouter>
      <header>
      </header>
      
      <Routes>
        <Route path="/crearNota/" element={<CrearNota/>} />
        <Route path="/publicarNota/" element={<PublicarNota/>} />
        <Route path="/mi-perfil/" element={<Perfil/>} />
        <Route path="/autoEntrevistas/" element={<AutoEntrevistas/>} />

        <Route path="/soporte-y-ayuda/" element={<Soporte/>} />
        <Route path="/notificaciones/" element={<Notificaciones/>} />
        <Route path="/verNota/:id_ruta?" element={<VerNota/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notas" element={<Notas/>} />
        <Route path="/notasEditorial" element={<NotasParaEditorial/>} />

        <Route path="/recuperar-contraseña" element={<RecuperarContraseña/>} />
        <Route path="/actualizar-contraseña" element={<UpdatePassword/>} />
        <Route path="/" element={<Formulario />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
