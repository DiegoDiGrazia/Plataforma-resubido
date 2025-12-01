import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import axios from 'axios';
import ModalMensaje from '../administrador/gestores/ModalMensaje';
import { obtenerUsuarios, obtenerClientes, obtenerPerfiles, obtenerGeo, obtenerPlanesMarketing } from '../administrador/gestores/apisUsuarios'; // Importa la función para obtener usuarios
import ArbolDistribucion from '../nota/Editorial/ArbolDistribucion';
import SelectorConBuscador from '../nota/Editorial/SelectorConBuscador';

const canales = [
  {'id': "1", 'nombre': "INSTAGRAM"},
  {'id': "2", 'nombre': "FACEBOOK"},
  {'id': "3", 'nombre': "INSTAGRAM Y FACEBOOK"},
  {'id': "4", 'nombre': "MEDIOS"},
  {'id': "5", 'nombre': "MEDIOS Y FACEBOOK"},
  {'id': "6", 'nombre': "MEDIOS Y INSTAGRAM"},
  {'id': "7", 'nombre': "TODOS"},
];

const clienteVacio = {
  id: "0",
  name: "",
  slug: "",
  code: "",
  population_connected: "",
  population_shown: "",
  authors: "",
  fecha_alta: "",
  id_plan: "",
  jurisdiccion: "",
  muestra_consumo: "0",
  municipio_id: "",
  pais_id: "",
  provincia_id: "",
  term_id: "",
  tipo: ""
};

const NotaFreemiumDistribucion
 = () => {
  const [pais, setPais] = useState("");
  const [provincia, setProvincia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [clientes, setClientes] = useState([]);
  const [canalSelected, setCanalSelected] = useState(null);
  const [geo, setGeo] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mensajeModalExito, setMensajeModalExito] = useState("Los cambios se realizaron correctamente.");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({});
  const itemsPerPage = 10;  
  const desdeMarketing = new Date().toISOString().split('T')[0];
  const TOKEN = useSelector((state) => state.formulario.token);
  const notaFreemium = useSelector((state) => state.formulario.notaFreemiumDistribucion);

  useEffect(() => {
    obtenerClientes(TOKEN).then(setClientes);
    obtenerGeo().then(setGeo);
}, [TOKEN]);

  // Filtrar por búsqueda
  const filteredClientes = useMemo(() => {
    return clientes.filter((item) =>  //-- Cambia esto a usuarios cuando tengas la API
      item.name.toLowerCase().includes(search.toLowerCase()) 
    );
  }, [search, clientes]);

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredClientes.slice(start, start + itemsPerPage);
  }, [filteredClientes, page]);

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setFormData({ 
        ...client,
        tipo_cliente: client.tipo 
    }); 
    const modal = new window.bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
};

const handleSave = () => {
  axios
    .post(
      "https://panel.serviciosd.com/app_cliente_edit",
      {
        token: TOKEN,
        ...formData,
      },
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
    .then(() => {
      setMensajeModalExito('Los cambios se realizaron correctamente.');
      setShowModal(true);
      setTimeout(() => {
        window.location.reload(); 
      }, 1500);
    })
    .catch((err) => {
      console.log("Error al guardar cambios:", err);
    });
  };

  return (
    <div className="content flex-grow-1 crearNotaGlobal">
      <div className='row miPerfilContainer soporteContainer d-flex align-items-stretch'>
        <h3 id="saludo" className='headerTusNotas ml-0 mb-3 p-0'>
          <img src="/images/prisma.png" alt="Icono 1" className="icon me-2 icono_tusNotas" /> 
            {" Distribuye esta nota "}
        </h3>
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
            </div>
      </div>
    </div>
  );
};

export default NotaFreemiumDistribucion
;