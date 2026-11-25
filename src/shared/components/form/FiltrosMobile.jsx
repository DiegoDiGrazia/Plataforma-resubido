import React, { useState } from 'react';
import Offcanvas from 'react-bootstrap/Offcanvas';
import './FiltrosMobile.css';

/**
 * Barra de filtros para mobile: [buscador] [Filtros (n)] [acciones], debajo un chip
 * naranja por cada filtro fuera de su valor por defecto, y un panel desde abajo con
 * todos los filtros (children).
 *
 * chips: [{ clave, texto, limpiar, requerido? }]
 *   - limpiar(): vuelve ese filtro a su valor por defecto (la × del chip). Sin limpiar,
 *     el chip es solo informativo (sin ×) y "Limpiar filtros" no lo toca.
 *   - requerido: el chip se muestra pero no cuenta en el número del botón ni se
 *     borra con "Limpiar filtros" (ej. la fecha del Monitor, sin la que no carga).
 *
 * Uso:
 *   <FiltrosMobile buscador={<input … />} chips={chips} acciones={<button …/>}>
 *     <SelectorFecha bloque … />
 *     <DropdownFiltro … />
 *   </FiltrosMobile>
 */
const FiltrosMobile = ({
    buscador = null,
    acciones = null,
    chips = [],
    children,
    titulo = 'Filtros',
    panelClassName = '',
    className = '',
}) => {
    const [abierto, setAbierto] = useState(false);
    const opcionales = chips.filter((chip) => !chip.requerido && chip.limpiar);
    const limpiarFiltros = () => opcionales.forEach((chip) => chip.limpiar());

    return (
        <div className={`nd-filtros-mobile ${className}`}>
            <div className="nd-filtros-mobile__barra">
                {buscador && <div className="nd-filtros-mobile__buscador">{buscador}</div>}
                <button
                    type="button"
                    className="btn btn-secondary nd-filtros-mobile__boton"
                    onClick={() => setAbierto(true)}
                >
                    <i className="bi bi-sliders" aria-hidden="true" />
                    {titulo}
                    {opcionales.length > 0 && (
                        <span className="nd-filtros-mobile__contador">{opcionales.length}</span>
                    )}
                </button>
                {acciones}
            </div>

            {chips.length > 0 && (
                <div className="nd-filtros-mobile__chips">
                    {chips.map((chip) => (
                        <span key={chip.clave} className="nd-badge nd-badge--primary nd-filtros-mobile__chip">
                            <span className="nd-filtros-mobile__chip-texto">{chip.texto}</span>
                            {chip.limpiar && (
                                <button
                                    type="button"
                                    className="btn-close nd-filtros-mobile__chip-cerrar"
                                    aria-label={`Quitar filtro ${chip.texto}`}
                                    onClick={chip.limpiar}
                                />
                            )}
                        </span>
                    ))}
                </div>
            )}

            <Offcanvas
                show={abierto}
                onHide={() => setAbierto(false)}
                placement="bottom"
                className={`nd-filtros-mobile__panel ${panelClassName}`}
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{titulo}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="nd-filtros-mobile__cuerpo">
                    {children}
                </Offcanvas.Body>
                <div className="nd-filtros-mobile__pie">
                    <button type="button" className="btn btn-link" onClick={limpiarFiltros}>
                        Limpiar filtros
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => setAbierto(false)}>
                        Ver resultados
                    </button>
                </div>
            </Offcanvas>
        </div>
    );
};

export default FiltrosMobile;
