# Componentes — catálogo

Orden de preferencia: **react-bootstrap tematizado → clase `.nd-*` → CSS nuevo con tokens.**

## Bootstrap ya tematizado (no hace falta CSS)

| Componente | Uso correcto |
|---|---|
| Botones | `<Button variant="primary">Guardar</Button>` · `variant="secondary"` para Cancelar · `size="sm"` en tablas/filtros |
| Botón con icono | `<Button variant="primary"><i className="bi bi-plus-lg" /> Nuevo contrato</Button>` (el gap ya está) |
| Inputs | `<Form.Group><Form.Label>…</Form.Label><Form.Control /></Form.Group>` |
| Select | `<Form.Select>` |
| Check / switch | `<Form.Check>` (naranja al marcar) |
| Modal | `<Modal centered>` + `<Modal.Header closeButton><Modal.Title>` · footer: secundario a la izquierda, primario a la derecha |
| Tabs | `<Tabs>` / `.nav-tabs` → subrayado naranja en el activo |
| Accordion | `<Accordion>` |
| Tabla | `<Table hover responsive>` dentro de `.nd-table-wrap` |
| Spinner | `<Spinner animation="border" />` (naranja por defecto) |
| Dropdown, Pagination, ListGroup, Badge, Tooltip, Progress | sin estilos extra |

## Clases `.nd-*` (src/styles/components.css)

### Encabezado de página
```jsx
<div className="nd-page">
  <header className="nd-page-header">
    <div>
      <h1 className="nd-page-header__title">Contratos</h1>
      <p className="nd-page-header__subtitle">Gestión de contratos activos y vencidos</p>
    </div>
    <div className="nd-page-header__actions">
      <Button variant="secondary">Exportar</Button>
      <Button variant="primary"><i className="bi bi-plus-lg" /> Nuevo</Button>
    </div>
  </header>
  {/* contenido */}
</div>
```

### KPIs
```jsx
<div className="nd-stats">
  <div className="nd-stat">
    <span className="nd-stat__icon"><i className="bi bi-file-text" /></span>
    <div>
      <div className="nd-stat__label">Contratos activos</div>
      <div className="nd-stat__value">128</div>
    </div>
  </div>
</div>
```
Reemplaza: `.contratosPage .statTile`, tiles de Dashboard, InteraccionPorNota.

### Barra de filtros
```jsx
<div className="nd-toolbar">
  <label className="nd-field">
    <span className="nd-field__label">Desde</span>
    <input type="date" className="nd-input nd-input--sm" />
  </label>
  <div className="nd-search nd-toolbar__end">
    <i className="bi bi-search nd-search__icon" />
    <input className="nd-input" placeholder="Buscar…" />
  </div>
</div>
```
Reemplaza: `.filtrosCard`, `.buscadorNotasForm`, `.inputBuscadorNotas`, `#filtroNotas`.

### Card
```jsx
<article className="nd-card nd-card--interactive">
  <div className="nd-card__header">
    <h3 className="nd-card__title">Municipio de Pilar</h3>
    <span className="nd-badge nd-badge--success nd-badge--dot">Activo</span>
  </div>
  <p className="nd-card__meta">Vence el 12/03/2027</p>
</article>
```
Modificadores: `--interactive` (hover), `--flat` (sin sombra), `--compact` (padding chico).

### Badges de estado
`.nd-badge` + `--primary | --success | --danger | --warning | --info | --blue | --magenta`, opcional `--dot`.

| Estado de negocio | Variante |
|---|---|
| Activo, pagado, publicada | `success` |
| Vencido, rechazado, error | `danger` |
| Pendiente, borrador, por vencer | `warning` |
| Destacado / nuevo | `primary` |
| Informativo, categoría | `info`, `blue`, `magenta` |

### Otros
| Clase | Para |
|---|---|
| `.nd-section-title` | título de bloque dentro de la página |
| `.nd-tabs` + `.nd-tabs__item(--active)` | tabs sin react-bootstrap (`aria-selected="true"` también activa) |
| `.nd-list` + `.nd-list__item(--active)` | listas seleccionables de ABMs (reemplaza `.list-group-item.active-brand`) |
| `.nd-table-wrap` | envoltorio con borde y radio para `<Table>` |
| `.nd-icon-btn(--danger|--primary)` | editar/borrar en filas |
| `.nd-empty` + `__icon`, `__title` | "No hay resultados" |
| `.nd-loading-overlay` | loader a pantalla completa (reemplaza los `rgba(0,0,0,0.5)` sueltos) |
| `.nd-avatar(--sm|--lg)` | fotos de perfil |

## Utilidades (src/styles/utilities.css)

- Texto: `.nd-text-primary|secondary|muted|blue|success|danger`, `.nd-text-xs…2xl`, `.nd-fw-regular|medium|semibold|bold`, `.nd-caps`
- Fondo: `.nd-bg-primary|primary-subtle|secondary|surface|muted|page`
- Forma: `.nd-border`, `.nd-rounded-sm|md|lg|pill`, `.nd-shadow-sm|md`
- Layout/spacing: usar las de Bootstrap (`d-flex`, `gap-2`, `p-3`, `mb-4`…).

**Alias legacy** (existen, ya apuntan a tokens, no usar en código nuevo):
`.text-brand`, `.bg-brand`, `.btn-brand`, `.btn-orange`.

## Agregar un componente nuevo al catálogo
1. Verificar que se repite en ≥2 pantallas.
2. Escribirlo en `components.css` con prefijo `nd-`, BEM-lite y solo tokens.
3. Documentarlo acá con un snippet JSX y qué clases legacy reemplaza.
