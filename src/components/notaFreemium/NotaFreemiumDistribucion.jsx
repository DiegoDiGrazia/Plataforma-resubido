import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import axios from 'axios';
import ModalMensaje from '../administrador/gestores/ModalMensaje';
import { obtenerUsuarios, obtenerClientes, obtenerPerfiles, obtenerGeo, obtenerPlanesMarketing, obtenerPrecioUsuario, setComprarDistribucion } from '../administrador/gestores/apisUsuarios'; // Importa la función para obtener usuarios
import ArbolDistribucion from '../nota/Editorial/ArbolDistribucion';
import SelectorConBuscador from '../nota/Editorial/SelectorConBuscador';
import  {obtenerPaisId}  from '../comercial/calculadoraDeVentas';
import InputFecha from '../nota/Editorial/InputFecha';
import BarraVolumen from './BarraVolumen';
import BotonDistribuirNota from './BotonDistribuir';
import { obtenerConsolidacionCliente } from '../administrador/gestores/apisUsuarios';

const canales = [
  {'id': "1", 'nombre': "DV360"},
  {'id': "2", 'nombre': "META"},
  {'id': "3", 'nombre': "AMBOS"},

];


const NotaFreemiumDistribucion
 = () => {
  const [pais, setPais] = useState("");
  const [provincia, setProvincia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [clientes, setClientes] = useState([]);
  const [canalSelected, setCanalSelected] = useState(null);
  const [geo, setGeo] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;  
  const TOKEN = useSelector((state) => state.formulario.token);
  const notaFreemium = useSelector((state) => state.formulario.notaFreemiumDistribucion);
  const [precioEstimado, setPrecioEstimado] = useState(0);
  const id_cliente = useSelector((state) => state.formulario.id_cliente);
  const id_usuario = useSelector((state) => state.formulario.usuario.id);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [porcentajeUsuarios, setPorcentajeUsuarios] = useState(20);
  const [consolidacionCliente, setConsolidacionCliente] = useState(null);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState(0);
  const [respuestaDistribuirBoton, setRespuestaDistribuirBoton] = useState(null);

  useEffect(() => {
    obtenerClientes(TOKEN).then(setClientes);
    obtenerGeo().then(setGeo);
}, [TOKEN]);

useEffect(() => {
  setUsuariosSeleccionados((porcentajeUsuarios/100) * (Number(precioEstimado?.poblacion) || 0));
}, [porcentajeUsuarios, precioEstimado]);

  // Filtrar por búsqueda
  const filteredClientes = useMemo(() => {
    return clientes.filter((item) =>  //-- Cambia esto a usuarios cuando tengas la API
      item.name.toLowerCase().includes(search.toLowerCase()) 
    );
  }, [search, clientes]);

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [search]);
   const obtenerPaisId = (geo, nombrePais) => {
    const paisEncontrado = geo.find((p) => p.nombre.toLowerCase() === nombrePais.toLowerCase());
    return paisEncontrado ? paisEncontrado.pais_id : null;
  }

useEffect(() => {
    const fetchPrecio = async () => {


        if(!pais) return; 
        const precio = await obtenerPrecioUsuario(
            TOKEN,
            municipio ? 'municipio' : provincia ? 'provincia' : 'pais',
            municipio ? municipio.municipio_id : provincia ? provincia.provincia_id : obtenerPaisId(geo.paises, pais.nombre),
            id_cliente
        );

        setPrecioEstimado(precio);
    };

    fetchPrecio();
}, [pais, provincia, municipio, respuestaDistribuirBoton]);

useEffect(() => {
    const fetchConsolidacionCliente = async () => {
        const response = await obtenerConsolidacionCliente(
            TOKEN,
            id_cliente

        );

        setConsolidacionCliente(response);
    };
    fetchConsolidacionCliente();
}, [id_cliente]);

  const handleDistribuirClick = async () => {
  if (!TOKEN || !canalSelected || !notaFreemium?.term_id) return;

  const usuarios = Math.floor(usuariosSeleccionados);
  if (usuarios <= 0) return;

  const id_noti = notaFreemium.term_id;

  let monto_dv360 = null;
  let monto_meta = null;

  if (canalSelected.id === "1") {
    monto_dv360 = valorDv;
  }

  if (canalSelected.id === "2") {
    monto_meta = valorMeta;
  }

  if (canalSelected.id === "3") {
    monto_dv360 = valorDv;
    monto_meta = valorMeta;
  }

  try {
    const item = await setComprarDistribucion(
      TOKEN,
      id_usuario,
      usuarios,
      id_cliente,
      id_noti,
      monto_dv360,
      monto_meta
    );

    setRespuestaDistribuirBoton(item);
  } catch (error) {
    console.error("Error al distribuir la nota:", error);
  }
};

  const poblacion = Number(precioEstimado?.poblacion) || 0;

  const valorMeta =
    Number(precioEstimado?.precio_por_usuario_meta || 0) * poblacion;

  const valorDv =
    Number(precioEstimado?.precio_por_usuario_dv360 || 0) * poblacion;

  // Si el total es la suma de ambos (ajustá si la lógica es otra)
  const total = valorMeta + valorDv;

  return (
    <div className="content flex-grow-1 crearNotaGlobal">
      <div className='row miPerfilContainer soporteContainer d-flex align-items-stretch'>
        <h3 id="saludo" className='headerTusNotas ml-0 mb-3 p-0'>
          <img src="/images/prisma.png" alt="Icono 1" className="icon me-2 icono_tusNotas" /> 
            {" Distribuye esta nota "}
        </h3>
        <h4>Credito disponible: {consolidacionCliente?.credito[0].monto_mensual || 0}</h4>
        <div className='col-4 p-0 me-3 align-self-center'>
          <img 
            src={'https://panel.serviciosd.com/img' + notaFreemium.imagen_principal } 
            alt="Imagen Destacada" 
            className="imagenDestacadaCrearNota" 
          />
        </div>
        <div className='col-7 p-0'>
          <h4 className='fw-bold'>{notaFreemium.titulo}</h4>
          <div className='abajoDeTusNotas'>
            {notaFreemium.copete}
          </div>
        </div>
      </div>
      {/* Búsqueda */}
      <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-3'>
          <div className='col-6'>
          <ArbolDistribucion
            TOKEN={TOKEN}
            pais={pais}
            provincia={provincia}
            municipio={municipio}
            onSetPais={(p) => setPais(p)}
            onSetProvincia={(p) => setProvincia(p)}
            onSetMunicipio={(m) => setMunicipio(m)}
          />
              <div>
                <h3>Cantidad de usuarios</h3>
                <BarraVolumen valor={porcentajeUsuarios} setValor={setPorcentajeUsuarios}
                 total={precioEstimado?.poblacion} />
              </div>
          </div>
          <div className='col-6 '>
              <div className="dropdown p-0">
                <SelectorConBuscador
                  title="Canales"
                  options={canales}
                  selectedOption={canalSelected}
                  onSelect={setCanalSelected}
                  onClear={() => setCanalSelected(null)}
                />  
              </div>
              <InputFecha
                label="Fecha inicio:"
                name="fecha_publicacion"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
              <InputFecha
                label="Fecha fin:"
                name="fecha_fin"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
              <div className="d-flex">
                <div className="ms-auto">
                  <BotonDistribuirNota onClick={handleDistribuirClick} />
                </div>
              </div>
            </div>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              width: "100%" 
            }}>
              <h3>Valor en Meta: {valorMeta}</h3>
              <h3>Valor en DV: {valorDv}</h3>
              <h3>Total: {total}</h3>
            </div>

      </div>
    </div>
  );
};

export default NotaFreemiumDistribucion
;