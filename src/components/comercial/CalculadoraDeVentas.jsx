import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import axios from 'axios';
import ModalMensaje from '../administrador/gestores/ModalMensaje';
import { obtenerPoblacion, obtenerClientes, obtenerGeo} from '../administrador/gestores/apisUsuarios'; // Importa la función para obtener usuarios
import ArbolDistribucion from '../nota/Editorial/ArbolDistribucion';
import SelectorConBuscador from '../nota/Editorial/SelectorConBuscador';
import SelectorNumerosEnteros from '../nota/Editorial/SelectorNumerosEnteros';
import TablaReadOnly from './TablaReadOnly';
import InputNumerico from '../nota/Editorial/InputNumerico';



const tiposPlataformas = [
  {'id': "1", 'nombre': "META"},
  {'id': "2", 'nombre': "DV"},
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

const CalculadoraVentas
 = () => {
  const [pais, setPais] = useState("Argentina");
  const [provincia, setProvincia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [poblacionEstimada, setPoblacionEstimada] = useState("");
  const [clientes, setClientes] = useState([]);
  const [canalSelected, setCanalSelected] = useState(null);
  const [geo, setGeo] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;  
  const TOKEN = useSelector((state) => state.formulario.token);
  const [cantidadDeNotas, setCantidadDeNotas] = useState(1);
  const [alcancePorNota, setalcancePorNota] = useState(null);
  const [margen, setMargen] = useState(70);
  const [data, setData] = useState([[]]);
  const [margenAgencia, setMargenAgencia] = useState(15);
  const [margenAgencia2, setMargenAgencia2] = useState(0);
  const [cpmPersonalizado, setCpmPersonalizado] = useState(0);
  const costoPorNota = 100;
  const [selectedRows, setSelectedRows] = useState([true, true, true, true]);


  const columns = ["CPM", 'CPM + Plataforma', "Costo por nota", "Costo total", 'Precio por nota', 'Precio de venta neto', 'Precio con Agencia']
  const rows = ["dv 360", "Meta", 'Youtube', 'Personalizado', "Total seleccionado"]


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

const obtenerPaisId = (paises = [], nombrePais) => {
  if (!Array.isArray(paises) || !nombrePais) return null;

  const nombre =
    typeof nombrePais === 'string'
      ? nombrePais
      : nombrePais?.nombre;

  if (!nombre) return null;

  const paisEncontrado = paises.find(
    (p) => p.nombre?.toLowerCase() === nombre.toLowerCase()
  );

  return paisEncontrado?.pais_id ?? null;
};

useEffect(() => {
    const fetchPoblacion = async () => {
      console.log('geo data:', geo);
      console.log('Fetching poblacion for:', { pais, provincia, municipio });

        if(!pais) return; 
        const poblacion = await obtenerPoblacion(
            TOKEN,
            municipio ? 'municipio' : provincia ? 'provincia' : 'pais',
            municipio ? municipio.municipio_id : provincia ? provincia.provincia_id : obtenerPaisId(geo.paises, pais)
            // obtenerPaisId(geo.paises, pais.nombre) || provincia.provincia_id || municipio.municipio_id
        );

        setPoblacionEstimada(poblacion);
    };

    fetchPoblacion();
}, [pais, provincia, municipio]);
const toggleRow = (index) => {
  setSelectedRows(prev => {
    const copy = [...prev];
    copy[index] = !copy[index];
    return copy;
  });
};
useEffect(() => {
  console.log(poblacionEstimada);
  if(!poblacionEstimada ) return;
  // setalcancePorNota(Math.floor(poblacionEstimada.poblacion * 0.6));

  const dv_cpm = Number(poblacionEstimada?.gv?.cpm ?? 0);
  const cpm_agencia = dv_cpm / (1 - margenAgencia/100);
  const dv_costo_por_nota = cpm_agencia * alcancePorNota * 3/1000;
  const dv_costo_total = dv_costo_por_nota * cantidadDeNotas;
  const dv_precio_por_nota = dv_costo_por_nota / (1-margen/100)
  const dv_precio_total = dv_precio_por_nota * cantidadDeNotas;
  const dv_precioConAgencia = dv_precio_total / (1 - margenAgencia2/100);

  const meta_cpm = Number(poblacionEstimada?.meta?.cpm ?? 0);
  const meta_cpm_agencia = meta_cpm / (1 - margenAgencia/100);
  const meta_costo_por_nota = meta_cpm_agencia * alcancePorNota * 2/1000;
  const meta_costo_total = meta_costo_por_nota * cantidadDeNotas;
  const meta_precio_por_nota = meta_costo_por_nota / (1-margen/100)
  const meta_precio_total = meta_precio_por_nota * cantidadDeNotas;
  const meta_precioConAgencia = meta_precio_total / (1 - margenAgencia2/100);

  const youtube_cpm = Number(poblacionEstimada?.meta?.cpm ?? 0);
  const youtube_cpm_agencia = meta_cpm / (1 - margenAgencia/100);
  const youtube_costo_por_nota = meta_cpm_agencia * alcancePorNota * 2/1000;
  const youtube_costo_total = meta_costo_por_nota * cantidadDeNotas;
  const youtube_precio_por_nota = meta_costo_por_nota / (1-margen/100)
  const youtube_precio_total = meta_precio_por_nota * cantidadDeNotas;
  const youtube_precioConAgencia = meta_precio_total / (1 - margenAgencia2/100);

  const personalizado_cpm = cpmPersonalizado;
  const personalizado_cpm_agencia = personalizado_cpm / (1 - margenAgencia/100);
  const personalizado_costo_por_nota = personalizado_cpm_agencia * alcancePorNota * 2/1000;
  const personalizado_costo_total = personalizado_costo_por_nota * cantidadDeNotas;
  const personalizado_precio_por_nota = personalizado_costo_por_nota / (1-margen/100)
  const personalizado_precio_total = personalizado_precio_por_nota * cantidadDeNotas;
  const personalizado_precioConAgencia = personalizado_precio_total / (1 - margenAgencia2/100);

  const filas = [
  {
    activo: selectedRows[0],
    valores: [dv_cpm, cpm_agencia, dv_costo_por_nota, dv_costo_total, dv_precio_por_nota, dv_precio_total, dv_precioConAgencia]
  },
  {
    activo: selectedRows[1],
    valores: [meta_cpm, meta_cpm_agencia, meta_costo_por_nota, meta_costo_total, meta_precio_por_nota, meta_precio_total, meta_precioConAgencia]
  },
  {
    activo: selectedRows[2],
    valores: [youtube_cpm, youtube_cpm_agencia, youtube_costo_por_nota, youtube_costo_total, youtube_precio_por_nota, youtube_precio_total, youtube_precioConAgencia]
  },
  {
    activo: selectedRows[3],
    valores: [personalizado_cpm, personalizado_cpm_agencia, personalizado_costo_por_nota, personalizado_costo_total, personalizado_precio_por_nota, personalizado_precio_total, personalizado_precioConAgencia]
  }
];

const totales = new Array(7).fill(0);

filas.forEach(fila => {
  if (!fila.activo) return;

  fila.valores.forEach((val, i) => {
    totales[i] += val;
  });
});

setData([
  filas[0].valores.map(v => v.toFixed(2)),
  filas[1].valores.map(v => v.toFixed(2)),
  filas[2].valores.map(v => v.toFixed(2)),
  filas[3].valores.map(v => v.toFixed(2)),
  totales.map(v => v.toFixed(2))
]);

}, [poblacionEstimada, alcancePorNota, cantidadDeNotas, margen, 
  margenAgencia, cpmPersonalizado, selectedRows, margenAgencia2]);


  return (
    <div className="content flex-grow-1 crearNotaGlobal">
      <div className='row miPerfilContainer soporteContainer d-flex align-items-stretch'>
        <h3 id="saludo" className='headerTusNotas ml-0 mb-3 p-0'>
          <i class={`fs-4 mb-4 bi bi-bag-fill`} style={{color: '#3e4658ff', marginRight: '5px', bottom: '10px'}}></i>
            {" Calculadora de ventas "}
        </h3>
        <div className='col-7 p-0'>
          <h4 className='fw-bold'>{'Realice sus calculos'}</h4>
          <div className='abajoDeTusNotas'>
            {'Aqui podra realizar los calculos en tiempo real para armar propuestas comerciales segun los datos de poblacion estimada y alcance por nota.'}
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
            <h3>población: {Number(poblacionEstimada?.poblacion || 0).toLocaleString('es-AR') || 0} </h3>
          </div>
          <div className='col-6 '>
              {/* <div className="dropdown p-0">
                <SelectorConBuscador
                  title="Plataformas"
                  options={tiposPlataformas}
                  selectedOption={canalSelected}
                  onSelect={setCanalSelected}
                  onClear={() => setCanalSelected(null)}
                />  
              </div> */}
              <div className="dropdown p-0">
                <SelectorNumerosEnteros
                  title="Cantidad de notas"
                  start={1}
                  end={20}
                  selectedValue={cantidadDeNotas}
                  onSelect={setCantidadDeNotas}
                  onClear={() => setCantidadDeNotas(1)}
                /> 
                <InputNumerico
                  title="Usuarios a alcanzar por nota"
                  selectedValue={alcancePorNota}
                  isPercentual={false}
                  min={1}
                  max={Number(poblacionEstimada?.poblacion || 0)}
                  onSelect={setalcancePorNota}
                  onClear={() => setalcancePorNota(1)}
                  isDecimal={false}
                />
                <InputNumerico
                  title="Margen"
                  selectedValue={margen}
                  isPercentual ={true}
                  min={0}
                  max={99.9}
                  onSelect={setMargen}
                  onClear={() => setMargen(null)}
                  isDecimal={true}
                />
                <InputNumerico
                  title="Fee plataformas"
                  selectedValue={margenAgencia}
                  isPercentual ={true}
                  min={0}
                  max={99.9}
                  onSelect={setMargenAgencia}
                  onClear={() => setMargenAgencia(null)}
                  isDecimal={true}
                />

                <InputNumerico
                  title="Margen agencia"
                  selectedValue={margenAgencia2}
                  isPercentual ={true}
                  min={0}
                  max={99.9}
                  onSelect={setMargenAgencia2}
                  onClear={() => setMargenAgencia2(0)}
                  isDecimal={true}
                />
                <InputNumerico
                  title="CPM personalizado (opcional)"
                  selectedValue={cpmPersonalizado}
                  isPercentual ={false}
                  min={0}
                  max={10000000}
                  onSelect={setCpmPersonalizado}
                  onClear={() => setCpmPersonalizado(0)}
                  isDecimal={true}
                />
              </div>
              
            </div>
        <div style={{ padding: "20px" }}>
          <h2>Datos </h2>
          <TablaReadOnly
            columns={columns}
            rows={rows}
            data={data}
            selectedRows={selectedRows}
            onToggleRow={toggleRow}
          />
        </div>
      </div>
    </div>
  );
};

export default CalculadoraVentas
;