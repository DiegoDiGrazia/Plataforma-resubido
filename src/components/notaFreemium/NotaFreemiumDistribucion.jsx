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
import ArbolConSelectorMultiple from './ArbolConSelectorMultiple';
import { use } from 'react';
import SelectorConBuscadorMult from './SelectorConBuscadorMult';

export const formatearARS = (valor) => {
  if (valor === null || valor === undefined || isNaN(valor)) return "$ 0,00";

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(valor));
};

const canales = [
  {'id': "1", 'nombre': "DV360"},
  {'id': "2", 'nombre': "META"},

];


const NotaFreemiumDistribucion
 = () => {
  const [pais, setPais] = useState(null);
  const [provinciasSeleccionadas, setProvincias] = useState([]);
  const [municipiosSeleccionados, setMunicipios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [canalesSeleccionados, setCanalesSeleccionados] = useState(canales);
  const [geo, setGeo] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;  
  const TOKEN = useSelector((state) => state.formulario.token);
  const notaFreemium = useSelector((state) => state.formulario.notaFreemiumDistribucion);
  const [precioEstimado, setPrecioEstimado] = useState(0);
  const id_cliente = useSelector((state) => state.formulario.id_cliente);
  const id_usuario = useSelector((state) => state.formulario.usuario.id);

  const hoy = new Date();
  const fechaInicio = hoy.toISOString().split('T')[0];
  const fechaMas30 = new Date();
  fechaMas30.setDate(fechaMas30.getDate() + 30);
  const fechaFin = fechaMas30.toISOString().split('T')[0];
  const [fecha_inicio, setFechaInicio] = useState(fechaInicio);
  const [fecha_fin, setFechaFin] = useState(fechaFin);

  const [porcentajeUsuarios, setPorcentajeUsuarios] = useState(20);
  const [consolidacionCliente, setConsolidacionCliente] = useState(null);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState(0);
  const [respuestaDistribuirBoton, setRespuestaDistribuirBoton] = useState(null);
  const [valorMeta, setValorMeta] = useState(0);
  const [valorDv, setValorDv] = useState(0);
  const [total, setTotal] = useState(0);

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
            municipiosSeleccionados.length == 1 ? 'municipio' : provinciasSeleccionadas.length == 1 ? 'provincia' : 'pais',
            municipiosSeleccionados.length == 1 ? 
                municipiosSeleccionados[0].municipio_id : provinciasSeleccionadas.length == 1 ? 
                provinciasSeleccionadas[0].provincia_id : obtenerPaisId(geo.paises, pais.nombre),
            id_cliente
        );

        setPrecioEstimado(precio);
    };

    fetchPrecio();
}, [pais, provinciasSeleccionadas, municipiosSeleccionados, respuestaDistribuirBoton]);

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

  const comentariosLocalidades = useMemo(() => {
  if (municipiosSeleccionados.length > 0) {
    return `Distribuir en los municipios: ${municipiosSeleccionados.map(m => m.nombre).join(', ')}`;
  } else if (provinciasSeleccionadas.length > 0) {
    return `Distribuir en las provincias: ${provinciasSeleccionadas.map(p => p.nombre).join(', ')}`;
  }
  return "";
}, [municipiosSeleccionados, provinciasSeleccionadas]);

  

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
        municipiosSeleccionados.length == 1 ? 'municipio' : provinciasSeleccionadas.length == 1 ? 'provincia' : 'pais',
        municipiosSeleccionados.length == 1 ? 
            municipiosSeleccionados[0].municipio_id : provinciasSeleccionadas.length == 1 ? 
            provinciasSeleccionadas[0].provincia_id : obtenerPaisId(geo.paises, pais.nombre),
        id_usuario,
        usuarios,
        id_cliente,
        id_noti,
        monto_dv360,
        monto_meta,
        fecha_fin,
        fecha_inicio,
        comentariosLocalidades
      );

    setRespuestaDistribuirBoton(item);
  } catch (error) {
    console.error("Error al distribuir la nota:", error);
  }
};

useEffect(() => {
    const poblacion = Number(precioEstimado?.poblacion) || 0;
    setValorMeta(Number(precioEstimado?.precio_por_usuario_meta || 0) * poblacion * porcentajeUsuarios / 100);
    setValorDv(Number(precioEstimado?.precio_por_usuario_dv360 || 0) * poblacion * porcentajeUsuarios / 100);
    setTotal(valorMeta + valorDv);
  }, [precioEstimado, porcentajeUsuarios]); 

  return (
    <div className="content flex-grow-1 crearNotaGlobal">
      <div className='row d-flex align-items-stretch'>
        <div className='col'>
          <h3 id="saludo" className='headerTusNotas ml-0 mb-3 p-0 d-flex align-items-center'>
            <img src="/images/prisma.png" alt="Icono 1" className="icon me-2 icono_tusNotas" /> 
              {" ¿Como vas a distribuir tu nota? "}
          </h3>
        </div>
        <div className="col d-flex flex-column align-items-end justify-content-center">
  
  <div style={{
    background: "#fff",
    padding: "12px 16px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    textAlign: "center",
    minWidth: "250px"
  }}>
    
    <span style={{
      fontSize: "13px",
      color: "#5F6368"
    }}>
      Crédito disponible
    </span>

    <h3 style={{
      margin: "5px 0",
      fontWeight: "bold",
      color: "#202124"
    }}>
      {formatearARS(
        consolidacionCliente?.credito?.reduce(
          (acc, item) => acc + Number(item.monto_mensual), 
          0
        )
      )}
    </h3>

    <a
      target="_blank"
      rel="noreferrer"
      href={`https://noticiasd.mitiendanube.com/autogestion/?cliente_id=${id_cliente}`}
      style={{
        fontSize: "14px",
        color: "#34A853",
        textDecoration: "none",
        fontWeight: "500"
      }}
    >
      Recargar crédito →
    </a>

  </div>

</div>

        </div>
        <div className='row miPerfilContainer soporteContainer mt-0 d-flex align-items-stretch'>
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
              <ArbolConSelectorMultiple
                TOKEN={TOKEN}
                pais={pais}
                provinciasSeleccionadas={provinciasSeleccionadas}
                municipiosSeleccionados={municipiosSeleccionados}
                onSetPais={setPais}
                onSetProvincias={setProvincias}
                onSetMunicipios={setMunicipios}
              />
              <div>
                <h3>Cantidad de usuarios</h3>
                <BarraVolumen valor={porcentajeUsuarios} setValor={setPorcentajeUsuarios}
                 total={precioEstimado?.poblacion} />
              </div>
          </div>
          <div className='col-6 '>
              <div className="dropdown p-0">
                <SelectorConBuscadorMult
                  title="Canales"
                  options={canales}
                  selectedOptions={canalesSeleccionados}
                  onSelect={setCanalesSeleccionados}
                  onClear={() => setCanalesSeleccionados([])}
                  show={true}
                />
              </div>
              <InputFecha
                label="Fecha inicio:"
                name="fecha_publicacion"
                value={fecha_inicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
              <InputFecha
                label="Fecha fin:"
                name="fecha_fin"
                value={fecha_fin}
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
              <h3> <img src='./images/logoFB.png' style={{width: '25px'}}/> Valor en Meta: {formatearARS(valorMeta)}</h3>
              <h3> <img src='./images/dv360.png' style={{width: '25px'}}/> Valor en DV: {formatearARS(valorDv)}</h3>
              <h3> <img src='./images/exitoIcon.png' style={{width: '25px'}}/> Total: {formatearARS(total)}</h3>
            </div>

      </div>
    </div>
  );
};

export default NotaFreemiumDistribucion
;