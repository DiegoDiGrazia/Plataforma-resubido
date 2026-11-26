import React, { useEffect, useMemo, useRef, useState } from 'react';
import { borrarTildes } from '@/shared/utils/funcionesVarias';

/**
 * Páginas (accesos) de un perfil: todas las páginas agrupadas por sección, con un
 * checkbox cada una. No llama a la API: el padre guarda la selección completa de una
 * sola vez (PUT /perfiles/{id} con { paginas }).
 *
 * Sección = lo que va antes de ":" en el nombre ("Distribucion: Listado" → "Distribucion").
 * Una página sin ":" que nombra una sección existente va a esa sección
 * ("Monitor Editorial" → "Editorial"). Las secciones de una sola página se juntan en "Otras".
 *
 * Props: paginas [{ id, nombre }], seleccionadas (Set de ids), onChange(nuevoSet), cargando.
 */

const GRUPO_OTRAS = 'Otras';

const normalizar = (texto) => borrarTildes(String(texto || '').toLowerCase());

const seccionDe = (nombre) => {
    const [seccion, ...resto] = String(nombre).split(':');
    return resto.length ? seccion.trim() : String(nombre).trim();
};

const etiquetaDe = (nombre) => {
    const [, ...resto] = String(nombre).split(':');
    return resto.length ? resto.join(':').trim() : String(nombre).trim();
};

/** Checkbox con estado "a medias" (algunas páginas del grupo marcadas). */
const CheckboxGrupo = ({ marcado, aMedias, onChange, id, children }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current) ref.current.indeterminate = aMedias;
    }, [aMedias]);
    return (
        <label className="perfilesPaginas__grupo-titulo" htmlFor={id}>
            <input
                ref={ref}
                id={id}
                type="checkbox"
                className="form-check-input"
                checked={marcado}
                onChange={onChange}
            />
            {children}
        </label>
    );
};

const SelectorPaginasPerfil = ({ paginas = [], seleccionadas, onChange, cargando = false }) => {
    const [busqueda, setBusqueda] = useState('');
    const [soloAsignadas, setSoloAsignadas] = useState(false);

    // Agrupa por sección; las secciones de una sola página van a "Otras"
    const grupos = useMemo(() => {
        const porSeccion = new Map();
        paginas.forEach((pagina) => {
            const seccion = seccionDe(pagina.nombre);
            if (!porSeccion.has(seccion)) porSeccion.set(seccion, []);
            porSeccion.get(seccion).push(pagina);
        });
        // Páginas sueltas (sección de una sola página) cuyo nombre incluye una sección
        // existente como palabra: van a esa sección ("Monitor Editorial" → "Editorial")
        const seccionesConVarias = [...porSeccion.keys()].filter((seccion) => porSeccion.get(seccion).length > 1);
        porSeccion.forEach((lista, seccion) => {
            if (lista.length !== 1) return;
            const palabras = normalizar(lista[0].nombre).split(/\s+/);
            const destino = seccionesConVarias.find((s) => s !== seccion && palabras.includes(normalizar(s)));
            if (destino) {
                porSeccion.get(destino).push(lista[0]);
                porSeccion.delete(seccion);
            }
        });

        const resultado = [];
        const otras = [];
        porSeccion.forEach((lista, seccion) => {
            if (lista.length > 1) resultado.push({ seccion, paginas: lista });
            else otras.push(...lista);
        });
        resultado.sort((a, b) => a.seccion.localeCompare(b.seccion, 'es'));
        if (otras.length) {
            otras.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
            resultado.push({ seccion: GRUPO_OTRAS, paginas: otras });
        }
        return resultado;
    }, [paginas]);

    // Filtros: texto (busca en el nombre completo) y "solo las asignadas"
    const gruposVisibles = useMemo(() => {
        const q = normalizar(busqueda.trim());
        return grupos
            .map((grupo) => ({
                ...grupo,
                paginas: grupo.paginas.filter((p) =>
                    (!q || normalizar(p.nombre).includes(q) || normalizar(grupo.seccion).includes(q))
                    && (!soloAsignadas || seleccionadas.has(p.id))
                ),
            }))
            .filter((grupo) => grupo.paginas.length > 0);
    }, [grupos, busqueda, soloAsignadas, seleccionadas]);

    const visibles = gruposVisibles.flatMap((g) => g.paginas);

    const marcar = (ids, valor) => {
        const nuevo = new Set(seleccionadas);
        ids.forEach((id) => (valor ? nuevo.add(id) : nuevo.delete(id)));
        onChange(nuevo);
    };

    if (cargando) {
        return <div className="perfilesPaginas__vacio">Cargando páginas…</div>;
    }

    return (
        <div className="perfilesPaginas">
            <div className="perfilesPaginas__herramientas">
                <input
                    type="search"
                    className="form-control"
                    placeholder="Buscar página o sección…"
                    aria-label="Buscar página"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <div className="perfilesPaginas__acciones">
                    <div className="form-check form-switch perfilesPaginas__switch">
                        <input
                            id="perfil-solo-asignadas"
                            type="checkbox"
                            role="switch"
                            className="form-check-input"
                            checked={soloAsignadas}
                            onChange={(e) => setSoloAsignadas(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="perfil-solo-asignadas">Solo las asignadas</label>
                    </div>
                    <div className="perfilesPaginas__masivas">
                        <button type="button" className="btn btn-link btn-sm" onClick={() => marcar(visibles.map((p) => p.id), true)} disabled={!visibles.length}>
                            Marcar visibles
                        </button>
                        <button type="button" className="btn btn-link btn-sm" onClick={() => marcar(visibles.map((p) => p.id), false)} disabled={!visibles.length}>
                            Desmarcar visibles
                        </button>
                    </div>
                </div>
            </div>

            {gruposVisibles.length === 0 ? (
                <div className="perfilesPaginas__vacio">No hay páginas que coincidan.</div>
            ) : (
                <div className="perfilesPaginas__grupos">
                    {gruposVisibles.map((grupo) => {
                        const ids = grupo.paginas.map((p) => p.id);
                        const marcadas = ids.filter((id) => seleccionadas.has(id)).length;
                        const idGrupo = `perfil-grupo-${normalizar(grupo.seccion).replace(/\W+/g, '-')}`;
                        return (
                            <fieldset key={grupo.seccion} className="perfilesPaginas__grupo">
                                <legend className="visually-hidden">{grupo.seccion}</legend>
                                <div className="perfilesPaginas__grupo-cabecera">
                                    <CheckboxGrupo
                                        id={idGrupo}
                                        marcado={marcadas === ids.length}
                                        aMedias={marcadas > 0 && marcadas < ids.length}
                                        onChange={() => marcar(ids, marcadas !== ids.length)}
                                    >
                                        {grupo.seccion}
                                    </CheckboxGrupo>
                                    <span className="perfilesPaginas__contador">{marcadas}/{ids.length}</span>
                                </div>
                                <div className="perfilesPaginas__lista">
                                    {grupo.paginas.map((pagina) => (
                                        <label key={pagina.id} className="perfilesPaginas__pagina" htmlFor={`perfil-pagina-${pagina.id}`}>
                                            <input
                                                id={`perfil-pagina-${pagina.id}`}
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={seleccionadas.has(pagina.id)}
                                                onChange={(e) => marcar([pagina.id], e.target.checked)}
                                            />
                                            <span title={pagina.nombre}>
                                                {grupo.seccion === GRUPO_OTRAS ? pagina.nombre : etiquetaDe(pagina.nombre)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SelectorPaginasPerfil;
