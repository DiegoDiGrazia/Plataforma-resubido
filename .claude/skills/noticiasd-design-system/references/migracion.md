# Migración de pantallas existentes

## Proceso por pantalla (un PR por pantalla o módulo)

1. **Auditar**
   `node .claude/skills/noticiasd-design-system/scripts/audit.mjs src/components/<modulo> --detail`
2. **Botones**: todo `<Button variant="none" className="...">` o `<button style={{backgroundColor:'#FF653B'}}>`
   → `<Button variant="primary|secondary|...">`. Borrar las clases CSS que solo pintaban el botón
   (`.btnNuevoContrato`, `.btn-cerrar-modal-*`, …).
3. **Colores** → tabla de abajo. Si un hex no está, elegir por **rol** (¿es texto, borde, fondo, acento?), no por parecido visual.
4. **Font-size / weight / radius / shadow** → escalas de abajo.
5. **Patrones** → reemplazar por `.nd-*` (ver componentes.md): stat tiles, filtros, cards, badges, listas activas.
6. **`!important`**: quitarlo y probar. Si algo se rompe, subir especificidad con la clase raíz de la
   pantalla (`.contratosPage .x`) en vez de `!important`.
7. **Inline styles**: mover a clase. Si es dinámico (ancho %, posición), dejarlo pero sin colores/tamaños literales.
8. **Mobile**: unificar `*Mobile.css` dentro del CSS de la pantalla con `@media (max-width: 768px)`.
9. Verificar visualmente en desktop, 1366px y 768px. Reauditar: 0 en hex/fontSize/radius/shadow.

## Mapeo legacy → token

### Colores
| Legacy | Token |
|---|---|
| `#FF653B` `#FB6514` `#FF6600` `#ff6236` `#E05A10` `#E65C00` `#E67E00` | `--nd-color-primary` |
| `#e6552d` `#e55a35` `#E65B35` | `--nd-color-primary-hover` |
| `#FFF1EC` `#FFF3ED` `#FFF6ED` | `--nd-color-primary-subtle` |
| `#FFE0D8` / `#FED3A7` | `--nd-orange-100` / `--nd-orange-200` |
| `#000` `#0E0E0E` `#050505` `#101828` `#212529` `#1a1a1a` | `--nd-color-text` |
| `#292929` `#333` `#3e4658ff` | `--nd-gray-800` |
| `#344054` `#475467` | `--nd-gray-700` (o `--nd-color-text-secondary` si es texto de apoyo) |
| `#667085` `#6c757d` `#888` | `--nd-color-text-secondary` |
| `#999` `#9e9e9e` `#98A2B3` | `--nd-color-text-muted` |
| `#EAECF0` `#e0e0e0` `#dee2e6` `#e9ecef` `#eee` `#ddd` `#e7dfdf` `#e2e0e0` `#f0f0f0` | `--nd-color-border` |
| `#D0D5DD` `#ccc` `#c1c3c7` | `--nd-color-border-strong` |
| `#fff` `#ffffff` | `--nd-color-bg-surface` |
| `#f8f9fa` `#fbfcfc` `#f9f9f9` | `--nd-color-bg-page` |
| `#f5f5f5` `#f2f2f2` `#F2F4F7` | `--nd-color-bg-muted` |
| `#dc3545` | `--nd-color-danger` |
| `#027A48` / `#ECFDF3` | `--nd-color-success` / `--nd-color-success-subtle` |
| `#e8f0fe` `#EFF8FF` `#F5FAFF` / `#c5d4f5` | `--nd-color-info-subtle` / `--nd-sky-100` |
| `#1a73e8` (pasos, totales en NotaFreemium) | `--nd-color-secondary` |
| `#0d6efd` inline (Facturas) | quitar el style: `variant="primary"` |
| `#34A853` / `#1877F2` / `#dc3545` (gráficos: medios / redes / videos) | `seriesColors.medios` / `.redes` / `.videos` (tokens.js); en CSS `--nd-chart-1/2/3` |
| `rgba(0,0,0,0.5)` overlays | `--nd-color-overlay` o `.nd-loading-overlay` |
| `rgba(16,24,40,.08)` y sombras sueltas | `--nd-shadow-sm` / `-md` / `-lg` |

### Font-size
| Legacy | Token |
|---|---|
| 9, 10, 11, 12px · 0.65rem · 0.75rem | `--nd-font-size-xs` (12) |
| 13px · 0.85rem | `--nd-font-size-sm` (13) |
| 14, 15px · 0.9rem | `--nd-font-size-base` (14) |
| 16px · 1rem · 1.1rem | `--nd-font-size-md` (16) |
| 18px | `--nd-font-size-lg` |
| 19, 20px | `--nd-font-size-xl` |
| 24px | `--nd-font-size-2xl` |
| 28px | `--nd-font-size-3xl` |
| 32, 35px · 3.5rem · 300% | `--nd-font-size-4xl` (o revisar si es un icono: entonces está bien en el icono) |

### Font-weight
`bold`, `700` → `--nd-font-weight-bold` · `600`, `550` → `semibold` · `500` → `medium` ·
`normal`, `400` → `regular` · `lighter`, `200`, `300` → `light`.

### Border-radius
`3–5px` → `--nd-radius-sm` · `6–8px`, `.375rem`, `.5rem` → `--nd-radius-md` ·
`10–14px` → `--nd-radius-lg` · `15–20px` → `--nd-radius-xl` · `27px`, `30px` → `--nd-radius-pill` ·
`50%` → `--nd-radius-full`.

### Breakpoints
`max-width: 768px` se mantiene. `1366px` se mantiene. `380px` y `576px` se mantienen.
`min-width: 768px` → reescribir como estilos base + `max-width: 768px`.

## Prioridad sugerida (por deuda según auditoría inicial)

1. `nota/nota.css` (203) — pantalla central, mayor impacto.
2. `notaFreemium/NotaFreemiumDistribucion.jsx` (49 inline styles).
3. `nota/NotasParaEditorialMobile.css`, `nota/verNotaMobile.css`, `nota/VerNota.css` (casi todo `!important`).
4. `comercial/AbmContratos.css` + `Facturas.*` — ya tienen buena estructura, son las que más rápido quedan como referencia.
5. `Dashboard/*`, `monitor/MonitorEditorial.css`, `sidebar/*`, `login/*`, `miPerfil/*`.
6. `utils/toastify/toastify.css` → toasts con tokens.

## Pendientes de infraestructura (fuera de pantallas)

- `index.html` carga Bootstrap 5.3.0 desde CDN **dos veces** y además 58 archivos hacen
  `import 'bootstrap/dist/css/bootstrap.min.css'`. Dejar un solo import (en `main.jsx`, antes de `./index.css`).
- `index.html` pide "Aeonik" a Google Fonts (no existe ahí): borrar ese `<link>`, la fuente
  ahora sale de `src/styles/fonts.css`. También sobra el de Roboto si nadie lo usa.
- `ionic-icons@latest` por CDN: fijar versión.
- Fuente Aeonik es trial: comprar licencia y reemplazar archivos (ideal `.woff2`).
