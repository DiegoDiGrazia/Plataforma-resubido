import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../../miPerfil/miPerfil.css";
import { useSelector } from 'react-redux';
import { obtenerPoblacion, obtenerGeo } from '../../administrador/gestores/apisUsuarios';
import ArbolDistribucion from '../../nota/Editorial/ArbolDistribucion';
import SelectorNumerosEnteros from '../../nota/Editorial/SelectorNumerosEnteros';
import TablaReadOnly from './TablaReadOnly';
import InputNumerico from '../../nota/Editorial/InputNumerico';
import { descargarExcel } from '../../funciones/creacionCSV';
import TablasPorPresupuesto from './TablasPorPresupuesto';

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
  const [feeAgencia, setFeeAgencia] = useState(15);

  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelFileName, setExcelFileName] = useState("Presupuesto");
  
  const [exportPlatforms, setExportPlatforms] = useState([true, true, true, true]); // dv 360, Meta, Youtube, X
  const [exportSearch, setExportSearch] = useState(true);
  const [exportApi, setExportApi] = useState(true);

  const columns = ["CPM", "% Inversión", "Alcance", "Frecuencia", "Impresiones", "% Rentabilidad", "Costo mkt por nota", "Costo de Marketing", 'Costo con Fee', 'Precio de Venta']
  const rows = ["dv 360", "Meta", 'Youtube', 'X', "Totales"]
  const searchColumns = ["CPC", "Clics", "Costo en pesos", "Valor USD", "Costo en USD", "% Rentabilidad", "Costo con Fee", "Precio de Venta"];
  const searchRows = ["Search"];

  const apiRows = ["dv 360", "Meta", "Youtube", "Totales"];
  const apiEditableColumns = []; 
  const currencyColumns = [0, 6, 7, 8, 9];
  const highlightedTotalColumns = [6, 7, 8, 9];
  const [apiSelectedRows, setApiSelectedRows] = useState([true, true, true]);
  const [apiData, setApiData] = useState([[]]);

  const [calculadorasExtras, setCalculadorasExtras] = useState([]);
  const [siguienteId, setSiguienteId] = useState(1);
  const datosPresupuestos = useRef({});

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
    const nombre = typeof nombrePais === 'string' ? nombrePais : nombrePais?.nombre;
    if (!nombre) return null;
    const paisEncontrado = paises.find((p) => p.nombre?.toLowerCase() === nombre.toLowerCase());
    return paisEncontrado?.pais_id ?? null;
  };

  useEffect(() => {
      const fetchPoblacion = async () => {
          if(!pais) return; 
          const poblacion = await obtenerPoblacion(
              TOKEN,
              municipio ? 'municipio' : provincia ? 'provincia' : 'pais',
              municipio ? municipio.municipio_id : provincia ? provincia.provincia_id : obtenerPaisId(geo.paises, pais)
          );
          setPoblacionEstimada(poblacion);
      };
      fetchPoblacion();
  }, [pais, provincia, municipio]);

  const agregarCalculadora = () => {
    setCalculadorasExtras([...calculadorasExtras, { id: siguienteId }]);
    setSiguienteId(siguienteId + 1);
  };

  const eliminarCalculadora = (id) => {
    setCalculadorasExtras(calculadorasExtras.filter(calc => calc.id !== id));
    delete datosPresupuestos.current[id];
  };

  const handleUpdateDatos = (id, infoCargada) => {
      datosPresupuestos.current[id] = infoCargada;
  };

  // CÁLCULO HISTÓRICO
  useEffect(() => {
    if(!poblacionEstimada ) return;

    const cpm_dv = Math.trunc(Number(poblacionEstimada?.gv?.cpm ?? 0) * 100) / 100;
    const cpm_meta = Math.trunc(Number(poblacionEstimada?.meta?.cpm ?? 0) * 100) / 100;

    const calcularFilaApi = (defaultCpm, defaultFrecuencia) => {
      const cpm = defaultCpm;
      const inversion = 100;
      const alcance_usuarios = alcancePorNota || 0;
      const frecuencia = defaultFrecuencia;
      const impresiones = cantidadDeNotas * alcance_usuarios * frecuencia;
      const rentabilidadFila = rentabilidad;
      const costo_marketing = (impresiones * cpm) / 1000;
      const costo_con_fee = costo_marketing * (feeAgencia / 100) + costo_marketing;
      const costo_mkt_por_nota = costo_marketing / cantidadDeNotas;
      const precio_de_venta = costo_con_fee / (1 - rentabilidadFila / 100);

      return [cpm, inversion, alcance_usuarios, frecuencia, impresiones, rentabilidadFila, costo_mkt_por_nota, costo_marketing, costo_con_fee, precio_de_venta];
    };

    const apiFilas = [
      { activo: apiSelectedRows[0], valores: calcularFilaApi(cpm_dv, 3) },
      { activo: apiSelectedRows[1], valores: calcularFilaApi(cpm_meta, 2) },
      { activo: apiSelectedRows[2], valores: calcularFilaApi(cpm_meta, 2) },
    ];

    const columnasASumar = [2, 4, 6, 7, 8, 9];
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
  }, [poblacionEstimada, alcancePorNota, cantidadDeNotas, rentabilidad, feeAgencia, apiSelectedRows]);

  const confirmarDescargaExcel = () => {
    const datosAExportar = [];
    const columnasASumar = [2, 4, 6, 7, 8, 9];
    
    const exportarPresupuesto = (id, info, nombrePrincipal = false) => {
        if(!info) return;

        datosAExportar.push({}); 
        datosAExportar.push({ Plataforma: nombrePrincipal ? "--- PRESUPUESTO PRINCIPAL ---" : `--- PROPUESTA ALTERNATIVA #${id} ---` });

        let tienePlataformas = false;
        const exportTotales = new Array(columns.length).fill("");
        columnasASumar.forEach(i => exportTotales[i] = 0);

        // TABLAS PRINCIPALES
        for (let i = 0; i < rows.length - 1; i++) {
          if (info.selectedRows[i] && exportPlatforms[i]) { 
            tienePlataformas = true;
            let filaObj = { Plataforma: rows[i] };
            columns.forEach((columna, colIndex) => {
              filaObj[columna] = info.data[i]?.[colIndex] ?? "-";
              if (columnasASumar.includes(colIndex)) {
                  exportTotales[colIndex] += Number(info.data[i]?.[colIndex] || 0);
              }
            });
            datosAExportar.push(filaObj);
          }
        }

        if (tienePlataformas) {
            let filaTotales = { Plataforma: "Totales" };
            columns.forEach((columna, colIndex) => {
                filaTotales[columna] = columnasASumar.includes(colIndex) ? exportTotales[colIndex] : "-";
            });
            datosAExportar.push(filaTotales);
        }

        // TABLAS SEARCH
        if (info.searchSelected[0] && exportSearch) {
          datosAExportar.push({}); 
          datosAExportar.push({ Plataforma: "--- SEARCH ---" }); 
          
          let searchHeaderObj = { Plataforma: "Plataforma" };
          columns.forEach((columna, colIndex) => {
            searchHeaderObj[columna] = searchColumns[colIndex] || "";
          });
          datosAExportar.push(searchHeaderObj);

          let filaSearch = { Plataforma: searchRows[0] };
          columns.forEach((columna, colIndex) => {
            filaSearch[columna] = info.searchData[0]?.[colIndex] ?? "";
          });
          datosAExportar.push(filaSearch);
        }
    };

    exportarPresupuesto("principal", datosPresupuestos.current["principal"], true);

    calculadorasExtras.forEach(calc => {
        exportarPresupuesto(calc.id, datosPresupuestos.current[calc.id]);
    });

    if (exportApi) {
      datosAExportar.push({}); 
      datosAExportar.push({ Plataforma: "--- PRESUPUESTO HISTÓRICO ---" });

      let tieneApi = false;
      const apiExportTotales = new Array(columns.length).fill("");
      columnasASumar.forEach(i => apiExportTotales[i] = 0);

      for (let i = 0; i < apiRows.length - 1; i++) {
        if (apiSelectedRows[i] && exportPlatforms[i]) { 
          tieneApi = true;
          let filaObj = { Plataforma: apiRows[i] };
          columns.forEach((columna, colIndex) => {
            filaObj[columna] = apiData[i]?.[colIndex] ?? "-";
            if (columnasASumar.includes(colIndex)) {
                apiExportTotales[colIndex] += Number(apiData[i]?.[colIndex] || 0);
            }
          });
          datosAExportar.push(filaObj);
        }
      }

      if (tieneApi) {
          let filaTotalesApi = { Plataforma: "Totales" };
          columns.forEach((columna, colIndex) => {
              filaTotalesApi[columna] = columnasASumar.includes(colIndex) ? apiExportTotales[colIndex] : "-";
          });
          datosAExportar.push(filaTotalesApi);
      }
    }

    descargarExcel(datosAExportar, excelFileName || "Presupuesto");
    setShowExcelModal(false);
  };

  return (
    <div className="content flex-grow-1 crearNotaGlobal">
      <div className='row miPerfilContainer soporteContainer d-flex align-items-stretch'>
        <h3 id="saludo" className='headerTusNotas ml-0 mb-3 p-0'>
          <i className={`fs-4 mb-4 bi bi-bag-fill`} style={{color: '#3e4658ff', marginRight: '5px', bottom: '10px'}}></i>
            {" Calculadora de ventas "}
        </h3>
        <div className='col-7 p-0'>
          <h4 className='fw-bold'>{'Realice sus calculos'}</h4>
          <div className='abajoDeTusNotas'>
            {'Aqui podra realizar los calculos en tiempo real para armar propuestas comerciales segun los datos de poblacion estimada y alcance por nota.'}
          </div>
        </div>
      </div>
      
      {/* FILTROS */}
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
          
          <div className='d-flex flex-row justify-content-end mb-2'>
            <button 
                id='descargar-excel' 
                className='btn w-auto h-50 bg-success'
                title="Descargar presupuesto en Excel"
                onClick={() => setShowExcelModal(true)}
                >
                <i className="bi bi-filetype-xlsx fs-4 m-0" style={{color:'rgb(41, 40, 40)'}}></i>
            </button>
          </div>

          {/* PRESUPUESTO PRINCIPAL */}
          <TablasPorPresupuesto
              id="principal"
              titulo="Presupuesto por Plataformas"
              poblacionEstimada={poblacionEstimada}
              alcancePorNota={alcancePorNota}
              cantidadDeNotas={cantidadDeNotas}
              rentabilidad={rentabilidad}
              feeAgencia={feeAgencia}
              onDataUpdate={handleUpdateDatos}
          />

          {/* PRESUPUESTOS EXTRAS */}
          {calculadorasExtras.map(calc => (
             <TablasPorPresupuesto
                key={calc.id}
                id={calc.id}
                onEliminar={eliminarCalculadora}
                poblacionEstimada={poblacionEstimada}
                alcancePorNota={alcancePorNota}
                cantidadDeNotas={cantidadDeNotas}
                rentabilidad={rentabilidad}
                feeAgencia={feeAgencia}
                onDataUpdate={handleUpdateDatos}
             />
          ))}

          <div className="mt-4 mb-5 text-center border-bottom pb-4">
            <button className="btn fw-bold btn-outline-success" onClick={agregarCalculadora}>
               <i className="bi bi-plus-circle me-2"></i> Agregar Presupuesto Alternativo
            </button>
          </div>

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
                
                <label className="form-label mb-2 fw-bold mt-2">Seleccione las plataformas a incluir:</label>
                {rows.slice(0, -1).map((plataforma, index) => (
                  <div className="form-check d-flex gap-2 p-0" key={index}>
                    <input 
                      type="checkbox" 
                      id={`export-check-${index}`}
                      checked={exportPlatforms[index]} 
                      onChange={() => {
                        setExportPlatforms(prev => {
                            const copy = [...prev];
                            copy[index] = !copy[index];
                            return copy;
                        });
                      }} 
                      style={{ cursor: "pointer" }}
                    />
                    <label className="form-check-label" htmlFor={`export-check-${index}`} style={{ cursor: "pointer" }}>
                      {plataforma}
                    </label>
                  </div>
                ))}
                
                <div className="form-check d-flex gap-2 p-0">
                  <input 
                    type="checkbox" 
                    id="export-check-search"
                    checked={exportSearch} 
                    onChange={() => setExportSearch(!exportSearch)} 
                    style={{ cursor: "pointer" }}
                  />
                  <label className="form-check-label" htmlFor="export-check-search" style={{ cursor: "pointer" }}>
                    Search
                  </label>
                </div>

                <div className="form-check d-flex gap-2 p-0 mt-3 border-top pt-3">
                  <input 
                    type="checkbox" 
                    id="check-api-export"
                    checked={exportApi} 
                    onChange={() => setExportApi(!exportApi)} 
                    style={{ cursor: "pointer" }}
                  />
                  <label className="form-check-label fw-bold" htmlFor="check-api-export" style={{ cursor: "pointer" }}>
                    Incluir Presupuesto Histórico
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