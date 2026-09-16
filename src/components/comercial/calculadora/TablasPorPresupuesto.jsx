import React, { useState, useEffect } from 'react';
import TablaReadOnly from './TablaReadOnly';

const TablasPorPresupuesto = ({ 
    id, 
    poblacionEstimada, 
    alcancePorNota, 
    cantidadDeNotas, 
    rentabilidad, 
    feeAgencia, 
    onEliminar, 
    onDataUpdate,
    titulo // Para poder pasarle "Presupuesto por Plataformas" o "Presupuesto Alternativo"
}) => {
    
    // --- ESTADOS TABLA PRINCIPAL ---
    const [data, setData] = useState([[]]);
    const [selectedRows, setSelectedRows] = useState([true, true, true, true]);
    const [tableOverrides, setTableOverrides] = useState({});

    const columns = ["CPM", "% Inversión", "Alcance", "Frecuencia", "Impresiones", "% Rentabilidad", "Costo mkt por nota", "Costo de Marketing", 'Costo con Fee', 'Precio de Venta'];
    const rows = ["dv 360", "Meta", 'Youtube', 'X', "Totales"];
    const editableColumns = [0, 1, 2, 3, 5];
    const currencyColumns = [0, 6, 7, 8, 9];
    const highlightedTotalColumns = [6, 7, 8, 9];

    // --- ESTADOS TABLA SEARCH ---
    const [searchOverrides, setSearchOverrides] = useState({});
    const [searchSelected, setSearchSelected] = useState([true]);
    const [searchData, setSearchData] = useState([[]]);

    const searchColumns = ["CPC", "Clics", "Costo en pesos", "Valor USD", "Costo en USD", "% Rentabilidad", "Costo con Fee", "Precio de Venta"];
    const searchRows = ["Search"];
    const searchEditableColumns = [0, 1, 3, 5]; 
    const searchCurrencyColumns = [0, 2, 3, 4, 6, 7]; 

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
            [rowIndex]: { ...(prev[rowIndex] || {}), [colIndex]: value }
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
            [rowIndex]: { ...(prev[rowIndex] || {}), [colIndex]: value }
        }));
    };

    // --- LÓGICA DE CÁLCULO ---
    useEffect(() => {
        if (!poblacionEstimada) return;

        // --- CÁLCULO TABLA PRINCIPAL ---
        const getValor = (rowIdx, colIdx, valorPorDefecto) => {
            const editado = tableOverrides[rowIdx]?.[colIdx];
            if (editado === "") return 0;
            return editado !== undefined ? Number(editado) : valorPorDefecto;
        };

        const calcularFila = (rowIdx, defaultCpm, defaultFrecuencia) => {
            const cpm = getValor(rowIdx, 0, defaultCpm);

            // Obtenemos qué celda se editó explícitamente en el estado
            const manualInversion = tableOverrides[rowIdx]?.[1];
            const manualAlcance = tableOverrides[rowIdx]?.[2];

            let inversion;
            let alcance_usuarios;
            const baseAlcance = alcancePorNota || 0; 

            // Si hay un alcance manual definido, ignoramos la inversión para el cálculo.
            // Tratamos ese alcance manual como la nueva base.
            if (manualAlcance !== undefined && manualAlcance !== "") {
                alcance_usuarios = Number(manualAlcance);
                // Mantenemos la inversión visual tal cual está (o 100 por defecto) sin modificarla por código.
                inversion = manualInversion !== undefined && manualInversion !== "" ? Number(manualInversion) : 100;
            } 
            // Si NO hay alcance manual, calculamos en base a la inversión.
            else {
                inversion = manualInversion !== undefined && manualInversion !== "" ? Number(manualInversion) : 100;
                alcance_usuarios = baseAlcance * (inversion / 100);
            }

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

        const filas = [
            { activo: selectedRows[0], valores: calcularFila(0, cpm_dv, 3) },
            { activo: selectedRows[1], valores: calcularFila(1, cpm_meta, 2) },
            { activo: selectedRows[2], valores: calcularFila(2, cpm_meta, 2) },
            { activo: selectedRows[3], valores: calcularFila(3, 0, 2) }
        ];

        const columnasASumar = [2, 4, 6, 7, 8, 9];
        const totales = new Array(10).fill("");
        columnasASumar.forEach(i => totales[i] = 0);

        filas.forEach(fila => {
            if (!fila.activo) return;
            columnasASumar.forEach(i => totales[i] += fila.valores[i]);
        });

        const newData = [filas[0].valores, filas[1].valores, filas[2].valores, filas[3].valores, totales];

        // --- CÁLCULO TABLA SEARCH ---
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

        const newSearchData = [
            [search_cpc, search_clics, search_costo_pesos, search_valor_usd, search_costo_usd, search_rentabilidad, search_costo_fee, search_precio_venta]
        ];

        setData(newData); 
        setSearchData(newSearchData);

        if (onDataUpdate) {
            onDataUpdate(id, {
                data: newData,
                selectedRows,
                searchData: newSearchData,
                searchSelected
            });
        }

    }, [poblacionEstimada, alcancePorNota, cantidadDeNotas, rentabilidad, feeAgencia, selectedRows, tableOverrides, searchOverrides]);

    return (
        <div className={onEliminar ? "mt-5 pt-4 border-top" : ""}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fw-bold">{titulo || "Presupuesto"}</h2>
                {onEliminar && (
                    <button className="btn btn-danger btn-sm" onClick={() => onEliminar(id)}>
                        <i className="bi bi-trash3 me-1"></i> Eliminar
                    </button>
                )}
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
            
            <div className="mb-4"></div>

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
        </div>
    );
};

export default TablasPorPresupuesto;