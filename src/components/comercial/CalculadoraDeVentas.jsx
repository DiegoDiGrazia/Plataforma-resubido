import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import { obtenerPoblacion, obtenerGeo} from '../administrador/gestores/apisUsuarios';
import ArbolDistribucion from '../nota/Editorial/ArbolDistribucion';
import SelectorNumerosEnteros from '../nota/Editorial/SelectorNumerosEnteros';
import TablaReadOnly from './TablaReadOnly';
import InputNumerico from '../nota/Editorial/InputNumerico';
import { descargarExcel } from '../funciones/creacionCSV';

const CalculadoraDeVentas = () => {
  const [pais, setPais] = useState("Argentina");
  const [provincia, setProvincia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [poblacionEstimada, setPoblacionEstimada] = useState("");
  const [geo, setGeo] = useState([]);
  const TOKEN = useSelector((state) => state.formulario.token);

  const [cantidadDeNotas, setCantidadDeNotas] = useState(1);
  const [alcancePorNota, setalcancePorNota] = useState(null);
  const [rentabilidad, setRentabilidad] = useState(65);
  const [data, setData] = useState([[]]);
  const [feeAgencia, setFeeAgencia] = useState(15);
  const [selectedRows, setSelectedRows] = useState([true, true, true, true]);

  const [tableOverrides, setTableOverrides] = useState({});

  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelFileName, setExcelFileName] = useState("Presupuesto");
  const [exportApi, setExportApi] = useState(true);

  const columns = ["CPM", "% Inversión", "Alcance", "Frecuencia", "Impresiones", "% Rentabilidad", "Costo mkt por nota", "Costo de Marketing", 'Costo con Fee', 'Precio de Venta']
  const rows = ["dv 360", "Meta", 'Youtube', 'X', "Totales"]

  const editableColumns = [0, 1, 3, 5]; // guarda los index de las columnas que van a ser inputs.
  const currencyColumns = [0, 6, 7, 8, 9]; // guarda los index de las columnas que llevan el signo $.
  const highlightedTotalColumns = [6, 7, 8, 9]; // guarda los index de las columnas que estan resaltadas en color. 

  const [searchOverrides, setSearchOverrides] = useState({});
  const [searchSelected, setSearchSelected] = useState([true]);
  const [searchData, setSearchData] = useState([[]]);

  const searchColumns = ["CPC", "Clics", "Costo en pesos", "Valor USD", "Costo en USD", "% Rentabilidad", "Costo con Fee", "Precio de Venta"];
  const searchRows = ["Search"];
  const searchEditableColumns = [0, 1, 3, 5]; // CPC, Clics, Valor USD
  const searchCurrencyColumns = [0, 2, 3, 4, 6, 7]; // guarda los index de las columnas que llevan el signo $ para la tabla search.

  const apiRows = ["dv 360", "Meta", "Youtube", "Totales"];
  const apiEditableColumns = []; 
  const [apiSelectedRows, setApiSelectedRows] = useState([true, true, true]);
  const [apiData, setApiData] = useState([[]]);

  const toggleApiRow = (index) => {
    setApiSelectedRows(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  useEffect(() => {
    obtenerGeo().then(setGeo);
  }, [TOKEN]);

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

  const handleCellChange = (rowIndex, colIndex, value) => {
    setTableOverrides(prev => ({
      ...prev,
      [rowIndex]: {
        ...(prev[rowIndex] || {}),
        [colIndex]: value
      }
    }));
  };

  const toggleSearchRow = (index) => {
    setSearchSelected(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const handleSearchCellChange = (rowIndex, colIndex, value) => {
    setSearchOverrides(prev => ({
      ...prev,
      [rowIndex]: {
        ...(prev[rowIndex] || {}),
        [colIndex]: value
      }
    }));
  };

useEffect(() => {
  if(!poblacionEstimada ) return;
  
  const getValor = (rowIdx, colIdx, valorPorDefecto) => {
    const editado = tableOverrides[rowIdx]?.[colIdx];
    if (editado === "") return 0;
    return editado !== undefined ? Number(editado) : valorPorDefecto;
  };

  const calcularFila = (rowIdx, defaultCpm, defaultFrecuencia, isApiTable = false) => {
    const cpm = isApiTable ? defaultCpm : getValor(rowIdx, 0, defaultCpm);
    const inversion = getValor(rowIdx, 1, 100);
    const alcance_usuarios = alcancePorNota * (inversion / 100);
    const frecuencia = getValor(rowIdx, 3, defaultFrecuencia);
    
    const impresiones = cantidadDeNotas * alcance_usuarios * frecuencia;
    const rentabilidadFila = getValor(rowIdx, 5, rentabilidad);
    const costo_marketing = (impresiones * cpm) / 1000;
    const costo_con_fee = costo_marketing * (feeAgencia / 100) + costo_marketing;
    const costo_mkt_por_nota = costo_marketing / cantidadDeNotas;
    const precio_de_venta = costo_con_fee / (1 - rentabilidadFila / 100);

    return [
      cpm, 
      inversion, 
      alcance_usuarios, 
      frecuencia, 
      impresiones, 
      rentabilidadFila,
      costo_mkt_por_nota, 
      costo_marketing, 
      costo_con_fee, 
      precio_de_venta
    ];
  };

  const cpm_dv = Math.trunc(Number(poblacionEstimada?.gv?.cpm ?? 0) * 100) / 100;
  const cpm_meta = Math.trunc(Number(poblacionEstimada?.meta?.cpm ?? 0) * 100) / 100;

  // CALCULO PRIMER TABLA 

  const filas = [
    {
      activo: selectedRows[0],
      valores: calcularFila(0, cpm_dv, 3)
    },
    {
      activo: selectedRows[1],
      valores: calcularFila(1, cpm_meta, 2)
    },
    {
      activo: selectedRows[2],
      valores: calcularFila(2, cpm_meta, 2)
    },
    {
      activo: selectedRows[3],
      valores: calcularFila(3, 0, 2)
    }
  ];

  // el numero de columnas del cual se quere calcular el total
  const columnasASumar = [2, 4, 6, 7, 8, 9];

  const totales = new Array(10).fill("");
  
  columnasASumar.forEach(i => totales[i] = 0);

  filas.forEach(fila => {
    if (!fila.activo) return;

    columnasASumar.forEach((i) => {
      totales[i] += fila.valores[i];
    });
  });

  setData([
    filas[0].valores,
    filas[1].valores,
    filas[2].valores,
    filas[3].valores,
    totales
  ]);

  // CALCULO SEGUNDA TABLA 

  const getSearchValor = (colIdx, valorPorDefecto) => {
    const editado = searchOverrides[0]?.[colIdx];
    if (editado === "") return 0;
    return editado !== undefined ? Number(editado) : valorPorDefecto;
  };

  const search_cpc = getSearchValor(0, 400);
  const search_clics = getSearchValor(1, 0);
  const search_costo_pesos = search_cpc * search_clics;
  const search_valor_usd = getSearchValor(3, 1400);
  const search_costo_usd = search_valor_usd ? search_costo_pesos / search_valor_usd : 0;
  const search_rentabilidad = getSearchValor(5, rentabilidad);
  const search_costo_fee = (search_costo_pesos * (feeAgencia / 100)) + search_costo_pesos;
  const search_precio_venta = search_costo_fee / (1 - search_rentabilidad / 100);

  setSearchData([
    [search_cpc, search_clics, search_costo_pesos, search_valor_usd, search_costo_usd, search_rentabilidad, search_costo_fee, search_precio_venta]
  ]);

  // CALCULO TERCER TABLA 

    const apiFilas = [
    { activo: apiSelectedRows[0], valores: calcularFila(0, cpm_dv, 3, true) },
    { activo: apiSelectedRows[1], valores: calcularFila(1, cpm_meta, 2, true) },
    { activo: apiSelectedRows[2], valores: calcularFila(2, cpm_meta, 2, true) },
  ];

  const apiTotales = new Array(10).fill("");
  columnasASumar.forEach(i => apiTotales[i] = 0);

  apiFilas.forEach(fila => {
    if (!fila.activo) return;
    columnasASumar.forEach((i) => {
      apiTotales[i] += fila.valores[i];
    });
  });

  setApiData([
    apiFilas[0].valores,
    apiFilas[1].valores,
    apiFilas[2].valores,
    apiTotales
  ]);
  
}, [poblacionEstimada, alcancePorNota, cantidadDeNotas, rentabilidad, feeAgencia, selectedRows, tableOverrides, searchOverrides, apiSelectedRows]);

const confirmarDescargaExcel = () => {
    const datosAExportar = [];
    
    // DESCARGA PRIMER TABLA
    for (let i = 0; i < rows.length - 1; i++) {
      if (selectedRows[i]) { 
        let filaObj = { Plataforma: rows[i] };
        columns.forEach((columna, colIndex) => {
          filaObj[columna] = data[i]?.[colIndex] ?? "-";
        });
        datosAExportar.push(filaObj);
      }
    }

    let filaTotales = { Plataforma: rows[rows.length - 1] };
    columns.forEach((columna, colIndex) => {
      filaTotales[columna] = data[data.length - 1]?.[colIndex] ?? "-";
    });
    datosAExportar.push(filaTotales);

    // DESCARGA SEGUNDA TABLA (SEARCH ALINEADA)
    if (searchSelected[0]) {
      datosAExportar.push({}); 
      datosAExportar.push({ Plataforma: "--- SEARCH ---" }); 
      
      let searchHeaderObj = { Plataforma: "Plataforma" };
      columns.forEach((columna, colIndex) => {
        searchHeaderObj[columna] = searchColumns[colIndex] || "";
      });
      datosAExportar.push(searchHeaderObj);

      let filaSearch = { Plataforma: searchRows[0] };
      columns.forEach((columna, colIndex) => {
        filaSearch[columna] = searchData[0]?.[colIndex] ?? "";
      });
      datosAExportar.push(filaSearch);
    }

    // DESCARGA TERCER TABLA
    if (exportApi) {
      datosAExportar.push({}); 
      datosAExportar.push({ Plataforma: "--- PRESUPUESTO HISTÓRICO ---" });

      for (let i = 0; i < apiRows.length - 1; i++) {
        if (apiSelectedRows[i]) { 
          let filaObj = { Plataforma: apiRows[i] };
          columns.forEach((columna, colIndex) => {
            filaObj[columna] = apiData[i]?.[colIndex] ?? "-";
          });
          datosAExportar.push(filaObj);
        }
      }

      let filaTotalesApi = { Plataforma: apiRows[apiRows.length - 1] };
      columns.forEach((columna, colIndex) => {
        filaTotalesApi[columna] = apiData[apiData.length - 1]?.[colIndex] ?? "-";
      });
      datosAExportar.push(filaTotalesApi);
    }

    descargarExcel(datosAExportar, excelFileName || "Presupuesto");
    setShowExcelModal(false);
  };

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
                  title="Rentabilidad"
                  selectedValue={rentabilidad}
                  isPercentual ={true}
                  min={0}
                  max={99.9}
                  onSelect={setRentabilidad}
                  onClear={() => setRentabilidad(null)}
                  isDecimal={true}
                />
                <InputNumerico
                  title="Fee Agencia"
                  selectedValue={feeAgencia}
                  isPercentual ={true}
                  min={0}
                  max={99.9}
                  onSelect={setFeeAgencia}
                  onClear={() => setFeeAgencia(null)}
                  isDecimal={true}
                />

              </div>
              
            </div>
        <div style={{ padding: "20px" }}>
          <div className='d-flex flex-row justify-content-between align-items-center'>

            <h2>Presupuesto por Plataformas</h2>
            <button 
                id='descargar-excel' 
                className='btn w-auto h-50 bg-success'
                title="Descargar presupuesto en Excel"
                onClick={() => setShowExcelModal(true)}
                >
                <i className="bi bi-filetype-xlsx fs-4 m-0" style={{color:'rgb(41, 40, 40)'}}></i> {/**bi-file-earmark-excel-fill / bi-journal-x / bi-filetype-xlsx*/}
            </button>
          </div>

          {/* TABLA PRINCIPAL */}
          <TablaReadOnly
            columns={columns}
            rows={rows}
            data={data}
            selectedRows={selectedRows}
            onToggleRow={toggleRow}
            editableColumns={editableColumns}
            tableOverrides={tableOverrides}
            onCellChange={handleCellChange}
            currencyColumns={currencyColumns}
            highlightedTotalColumns={highlightedTotalColumns}
          />
          
          <h3 className="mt-4 mb-3"></h3>
          
          {/* TABLA SEARCH */}
          <TablaReadOnly
            columns={searchColumns}
            rows={searchRows}
            data={searchData}
            selectedRows={searchSelected}
            onToggleRow={toggleSearchRow}
            editableColumns={searchEditableColumns}
            tableOverrides={searchOverrides}
            onCellChange={handleSearchCellChange}
            hasTotalsRow={false}
            currencyColumns={searchCurrencyColumns}
          />
          
          {/* TABLA CON CPM HISTÓRICO */}
          <h2>Presupuesto Histórico</h2>
          <TablaReadOnly
            columns={columns} 
            rows={apiRows}
            data={apiData}
            selectedRows={apiSelectedRows}
            onToggleRow={toggleApiRow}
            editableColumns={apiEditableColumns} 
            tableOverrides={{}} 
            onCellChange={() => {}} 
            currencyColumns={currencyColumns}
            highlightedTotalColumns={highlightedTotalColumns}
          />
        </div>
      </div>

      {/* Modal de Descargar Excel */}
      {showExcelModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Descargar Presupuesto</h5>
                <button type="button" className="btn-close" onClick={() => setShowExcelModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Nombre del archivo:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={excelFileName} 
                    onChange={(e) => setExcelFileName(e.target.value)} 
                  />
                </div>
                <label className="form-label mb-2 fw-bold">Seleccione las plataformas a incluir:</label>
                {rows.slice(0, -1).map((plataforma, index) => (
                  <div className="form-check d-flex gap-2 p-0" key={index}>
                    <input 
                      type="checkbox" 
                      id={`check-${index}`}
                      checked={selectedRows[index]} 
                      onChange={() => toggleRow(index)} 
                      style={{ cursor: "pointer" }}
                    />
                    <label className="form-check-label" htmlFor={`check-${index}`} style={{ cursor: "pointer" }}>
                      {plataforma}
                    </label>
                  </div>
                ))}
                <div className="form-check d-flex gap-2 p-0">
                  <input 
                    type="checkbox" 
                    id="check-search"
                    checked={searchSelected[0]} 
                    onChange={() => toggleSearchRow(0)} 
                    style={{ cursor: "pointer" }}
                  />
                  <label className="form-check-label" htmlFor="check-search" style={{ cursor: "pointer" }}>
                    Search
                  </label>
                </div>
                <div className="form-check d-flex gap-2 p-0">
                  <input 
                    type="checkbox" 
                    id="check-api-export"
                    checked={exportApi} 
                    onChange={() => setExportApi(!exportApi)} 
                    style={{ cursor: "pointer" }}
                  />
                  <label className="form-check-label" htmlFor="check-api-export" style={{ cursor: "pointer" }}>
                    Presupuesto Histórico
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowExcelModal(false)}>Cancelar</button>
                <button className="btn btn-success" onClick={confirmarDescargaExcel}>Descargar XLSX</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CalculadoraDeVentas;