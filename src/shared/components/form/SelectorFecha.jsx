import React, { useEffect, useRef, useState } from 'react';
import './SelectorFecha.css';

/**
 * Selector de fecha único de la plataforma: reemplaza a los <input type="date|month">.
 *
 * modo="dia" (YYYY-MM-DD) o modo="mes" (YYYY-MM). Los valores entran y salen como string,
 * igual que el value de un input nativo, así se usa con los mismos estados de siempre.
 *
 * Fecha única:   <SelectorFecha modo="dia" valor={fecha} onChange={setFecha} />
 * Rango:         <SelectorFecha modo="mes" label="Vencimiento"
 *                    desde={fechaDesde} hasta={fechaHasta}
 *                    onChangeDesde={setFechaDesde} onChangeHasta={setFechaHasta} />
 *
 * Es rango si recibe onChangeDesde/onChangeHasta. Los atajos de un rango llaman a los dos
 * setters seguidos: si ambos escriben en el mismo objeto de estado, usar el updater
 * funcional (setForm((f) => ({ ...f, fecha_inicio: v }))).
 */

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const dosDigitos = (n) => String(n).padStart(2, '0');
const aDia = (fecha) => `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
const aMes = (fecha) => aDia(fecha).slice(0, 7);

/** "2026-11-25" → "25/11/2026" (o "25/11" corto) · "2026-11" → "Nov 2026". Sin Date: no hay corrimiento por zona horaria. */
const formatear = (valor, modo, corto = false) => {
    if (!valor) return '';
    const [anio, mes, dia] = String(valor).split('-');
    if (modo === 'mes') return `${MESES[Number(mes) - 1] || mes} ${anio}`;
    if (!dia) return String(valor);
    return corto ? `${dia.slice(0, 2)}/${mes}` : `${dia.slice(0, 2)}/${mes}/${anio}`;
};

const crearAtajos = (modo, rango) => {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = hoy.getMonth();

    if (modo === 'mes') {
        const mesRelativo = (n) => aMes(new Date(anio, mes + n, 1));
        return rango
            ? [
                { label: 'Este mes', desde: mesRelativo(0), hasta: mesRelativo(0) },
                { label: 'Últimos 3 meses', desde: mesRelativo(-2), hasta: mesRelativo(0) },
                { label: 'Este año', desde: `${anio}-01`, hasta: `${anio}-12` },
            ]
            : [
                { label: 'Mes pasado', valor: mesRelativo(-1) },
                { label: 'Este mes', valor: mesRelativo(0) },
                { label: 'Mes próximo', valor: mesRelativo(1) },
            ];
    }

    const diaRelativo = (n) => aDia(new Date(anio, mes, hoy.getDate() + n));
    if (!rango) {
        return [
            { label: 'Ayer', valor: diaRelativo(-1) },
            { label: 'Hoy', valor: diaRelativo(0) },
            { label: 'Mañana', valor: diaRelativo(1) },
        ];
    }
    const desdeLunes = (hoy.getDay() + 6) % 7;
    return [
        { label: 'Hoy', desde: diaRelativo(0), hasta: diaRelativo(0) },
        { label: 'Esta semana', desde: diaRelativo(-desdeLunes), hasta: diaRelativo(6 - desdeLunes) },
        { label: 'Este mes', desde: aDia(new Date(anio, mes, 1)), hasta: aDia(new Date(anio, mes + 1, 0)) },
    ];
};

const SelectorFecha = ({
    modo = 'dia',
    label,
    // Fecha única
    valor,
    onChange,
    // Rango
    desde,
    hasta,
    onChangeDesde,
    onChangeHasta,
    etiquetaDesde = 'Desde',
    etiquetaHasta = 'Hasta',
    // Comunes
    min,
    max,
    required = false,
    disabled = false,
    permitirLimpiar = !required,
    atajos = true,
    placeholder,
    bloque = false,            // ocupa todo el ancho (campos de formulario)
    alineacionDerecha = false, // el panel se abre hacia la izquierda
    id,
    className = '',
}) => {
    const esRango = typeof onChangeDesde === 'function' || typeof onChangeHasta === 'function';
    const tipoInput = modo === 'mes' ? 'month' : 'date';
    const [abierto, setAbierto] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!abierto) return;
        const cerrarAfuera = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
        };
        const cerrarConEscape = (e) => e.key === 'Escape' && setAbierto(false);
        document.addEventListener('mousedown', cerrarAfuera);
        document.addEventListener('keydown', cerrarConEscape);
        return () => {
            document.removeEventListener('mousedown', cerrarAfuera);
            document.removeEventListener('keydown', cerrarConEscape);
        };
    }, [abierto]);

    const cambiarDesde = (v) => onChangeDesde?.(v);
    const cambiarHasta = (v) => onChangeHasta?.(v);

    const aplicarAtajo = (atajo) => {
        if (esRango) {
            cambiarDesde(atajo.desde);
            cambiarHasta(atajo.hasta);
        } else {
            onChange?.(atajo.valor);
        }
        setAbierto(false);
    };

    const limpiar = () => {
        if (esRango) {
            cambiarDesde('');
            cambiarHasta('');
        } else {
            onChange?.('');
        }
        setAbierto(false);
    };

    const textoVacio = placeholder || (esRango ? 'Todas' : modo === 'mes' ? 'Elegir mes' : 'Elegir fecha');
    let texto;
    let titulo;
    if (esRango) {
        const corto = modo === 'dia';
        texto = desde && hasta ? `${formatear(desde, modo, corto)} → ${formatear(hasta, modo, corto)}`
            : desde ? `Desde ${formatear(desde, modo, corto)}`
            : hasta ? `Hasta ${formatear(hasta, modo, corto)}`
            : '';
        titulo = desde || hasta
            ? `${formatear(desde, modo) || '…'} → ${formatear(hasta, modo) || '…'}`
            : textoVacio;
    } else {
        texto = formatear(valor, modo);
        titulo = texto || textoVacio;
    }
    const vacio = !texto;
    const listaAtajos = atajos ? crearAtajos(modo, esRango) : [];

    return (
        <div
            ref={ref}
            className={`dropdown nd-selector-fecha ${bloque ? 'nd-selector-fecha--bloque' : ''} ${className}`}
        >
            <button
                type="button"
                id={id}
                className="btn custom-dropdown-button dropdown-toggle nd-selector-fecha__boton"
                aria-haspopup="dialog"
                aria-expanded={abierto}
                disabled={disabled}
                title={label ? `${label}: ${titulo}` : titulo}
                onClick={() => setAbierto((a) => !a)}
            >
                <i className={`bi ${modo === 'mes' ? 'bi-calendar3' : 'bi-calendar-date'}`} aria-hidden="true" />
                {label && <strong className="nd-selector-fecha__label">{label}:</strong>}
                <span className={`nd-selector-fecha__valor ${vacio ? 'nd-selector-fecha__valor--vacio' : ''}`}>
                    {vacio ? textoVacio : texto}
                </span>
            </button>

            {required && !esRango && (
                <input
                    className="nd-selector-fecha__validacion"
                    tabIndex={-1}
                    aria-hidden="true"
                    value={valor || ''}
                    onChange={() => {}}
                    required
                    disabled={disabled}
                />
            )}

            {abierto && (
                <div
                    className={`dropdown-menu show nd-selector-fecha__menu ${alineacionDerecha ? 'dropdown-menu-end' : ''}`}
                    data-bs-popper="static"
                    role="dialog"
                    aria-label={label || (modo === 'mes' ? 'Elegir mes' : 'Elegir fecha')}
                >
                    {esRango ? (
                        <div className="nd-selector-fecha__campos">
                            <label className="nd-selector-fecha__campo">
                                <span>{etiquetaDesde}</span>
                                <input
                                    type={tipoInput}
                                    className="form-control form-control-sm"
                                    value={desde || ''}
                                    min={min}
                                    max={hasta || max}
                                    onChange={(e) => cambiarDesde(e.target.value)}
                                />
                            </label>
                            <label className="nd-selector-fecha__campo">
                                <span>{etiquetaHasta}</span>
                                <input
                                    type={tipoInput}
                                    className="form-control form-control-sm"
                                    value={hasta || ''}
                                    min={desde || min}
                                    max={max}
                                    onChange={(e) => cambiarHasta(e.target.value)}
                                />
                            </label>
                        </div>
                    ) : (
                        <input
                            type={tipoInput}
                            className="form-control form-control-sm"
                            aria-label={label || (modo === 'mes' ? 'Mes' : 'Fecha')}
                            value={valor || ''}
                            min={min}
                            max={max}
                            onChange={(e) => onChange?.(e.target.value)}
                        />
                    )}

                    {listaAtajos.length > 0 && (
                        <div className="nd-selector-fecha__atajos">
                            {listaAtajos.map((atajo) => (
                                <button
                                    key={atajo.label}
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => aplicarAtajo(atajo)}
                                >
                                    {atajo.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {permitirLimpiar && (
                        <div className="nd-selector-fecha__pie">
                            <button type="button" className="btn btn-sm btn-link" onClick={limpiar}>
                                Limpiar
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SelectorFecha;
