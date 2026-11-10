# Tokens — referencia completa

Fuente: `src/styles/tokens.css` (CSS) y `src/styles/tokens.js` (JS). Manual de marca, lámina 21 "Paleta de color".

## Paleta de marca

| Color | Hex | RGB | CMYK | Rol en la plataforma |
|---|---|---|---|---|
| Naranja (d) | `#EE4C01` | 238 76 1 | C0 M80 Y100 K0 | Primario: CTA, acentos, tab activo, foco, serie 1 de gráficos |
| Azul (d) | `#1D1A9B` | 29 26 155 | C100 M92 Y5 K28 | Secundario: info destacada, serie 2 |
| Celeste | `#6D77EA` | 109 119 234 | C68 M56 Y0 K0 | Info, serie 3, etiquetas |
| Magenta | `#F238A7` | 242 56 167 | C11 M83 Y0 K0 | Etiquetas, serie 4 |
| Amarillo | `#EFEF43` | 239 239 67 | C14 M0 Y78 K0 | Fondos de aviso, resaltado. Nunca texto |
| Blanco perlado | `#F1F2F2` | 241 242 242 | C7 M4 Y5 K0 | `--nd-gray-100`: fondos muted, header de tabla |
| Gris | `#B9B9C3` | 185 185 195 | C31 M24 Y18 K2 | `--nd-gray-400`: decorativo, serie "total" |
| Negro | `#0F0F0F` | 15 15 15 | C81 M71 Y62 K90 | `--nd-gray-900`: texto principal |

## Escalas derivadas

| Token | Hex | Contraste s/ blanco | Uso |
|---|---|---|---|
| `--nd-orange-50` | `#FFF3ED` | — | fondo icono KPI, fila activa, badge primary |
| `--nd-orange-100` | `#FFE2D3` | — | selección de texto |
| `--nd-orange-200` | `#FCC3A5` | — | botón primario deshabilitado |
| `--nd-orange-500` | `#EE4C01` | 3.70 | fondos de botón, iconos (no texto) |
| `--nd-orange-600` | `#D14301` | 4.65 ✅ AA | hover, texto/links naranja |
| `--nd-orange-700` | `#B33A01` | 5.96 ✅ | active, texto en badge naranja |
| `--nd-blue-500` | `#1D1A9B` | 12.55 ✅ | texto o fondo |
| `--nd-sky-500` / `600` | `#6D77EA` / `#5560D9` | 3.83 / 5.17 | 500 decorativo, 600 texto |
| `--nd-magenta-500` / `600` | `#F238A7` / `#C21E80` | 3.56 / 5.54 | 500 decorativo, 600 texto |
| `--nd-yellow-500` / `700` | `#EFEF43` / `#8A6A00` | 1.23 / 5.07 | 500 fondos, 700 texto warning |

### Neutros

| Token | Hex | Contraste s/ blanco | Semántico que lo usa |
|---|---|---|---|
| `--nd-gray-0` | `#FFFFFF` | — | `--nd-color-bg-surface` |
| `--nd-gray-50` | `#F7F8F8` | — | `--nd-color-bg-page` |
| `--nd-gray-100` | `#F1F2F2` | — | `--nd-color-bg-muted` |
| `--nd-gray-200` | `#E4E5E8` | — | `--nd-color-border` |
| `--nd-gray-300` | `#CFD0D7` | — | `--nd-color-border-strong` |
| `--nd-gray-400` | `#B9B9C3` | 1.95 | decorativo |
| `--nd-gray-500` | `#8A8A96` | 3.41 | `--nd-color-text-muted` (placeholder, disabled) |
| `--nd-gray-600` | `#63636E` | 5.93 ✅ | `--nd-color-text-secondary` |
| `--nd-gray-700` | `#45454F` | 9.47 ✅ | texto de badge neutro |
| `--nd-gray-800` | `#2A2A30` | — | texto botón secundario |
| `--nd-gray-900` | `#0F0F0F` | 19+ ✅ | `--nd-color-text` |

### Estados (fuera de la paleta de marca)

| Token | Hex | Uso |
|---|---|---|
| `--nd-color-success` / `-subtle` | `#177A3F` / `#ECF7F0` | confirmaciones, "activo", "pagado" |
| `--nd-color-danger` / `-subtle` | `#D92D20` / `#FEF0EF` | errores, borrar, "vencido" |
| `--nd-color-warning` / `-subtle` | `#8A6A00` / `#FDFDE3` | "pendiente", avisos |
| `--nd-color-info` / `-subtle` | `#5560D9` / `#F0F1FD` | información neutra |

> ⚠️ Accesibilidad: el botón primario (blanco sobre `#EE4C01`) da 3.7:1, que cumple AA solo para
> texto grande/negrita. Se acepta por fidelidad de marca con `font-weight: 600`. Si accesibilidad
> pasa a ser requisito duro, cambiar `--nd-color-primary` del botón a `--nd-orange-600`.

## Data-viz

Orden fijo de series (`chartColors` en tokens.js, `--nd-chart-1…6` en CSS):
naranja → azul → celeste → magenta → gris → amarillo.

Por canal (`seriesColors`): medios (Google) = naranja, redes (RRSS/Meta) = azul, videos = celeste. Los puntos de leyenda (`.blue-dot-*` en Barplot.css) usan `--nd-chart-1/2/3`, así barras y leyenda coinciden siempre.

```js
import { Chart } from 'chart.js';
import { applyChartDefaults, chartColors, seriesColors, withAlpha } from '@/styles/tokens';
applyChartDefaults(Chart); // una vez, ej. en App.jsx

datasets: [{ label: "Redes", borderColor: seriesColors.redes,
             backgroundColor: withAlpha(seriesColors.redes, 0.15) }]
```

## Tipografía

Familia: **Aeonik** (`--nd-font-family`), fallback Inter/system-ui. Archivos trial en
`public/New Aeonik Trials/` → reemplazar por la licencia antes de producción.
Pesos disponibles: Light, Regular, Bold. `500` renderiza Regular, `600` renderiza Bold.

| Token | px | Uso típico |
|---|---|---|
| `--nd-font-size-xs` | 12 | labels en mayúsculas, badges, notas al pie, thead |
| `--nd-font-size-sm` | 13 | labels de form, metadatos, celdas de tabla |
| `--nd-font-size-base` | 14 | cuerpo, inputs, botones |
| `--nd-font-size-md` | 16 | cuerpo destacado, título de card |
| `--nd-font-size-lg` | 18 | subtítulo de sección |
| `--nd-font-size-xl` | 20 | título de modal, valor de KPI |
| `--nd-font-size-2xl` | 24 (20 mobile) | título de sección |
| `--nd-font-size-3xl` | 28 (24 mobile) | título de página |
| `--nd-font-size-4xl` | 32 | KPI grande |

Line-height: `tight 1.2` títulos · `snug 1.35` UI densa · `normal 1.5` párrafos.

## Espaciado, radios, sombras, capas

- Espaciado base 4px: `--nd-space-0,1,2,3,4,5,6,8,10,12,16` = 0,4,8,12,16,20,24,32,40,48,64.
  Bootstrap `p-1..5` = 4, 8, 16, 24, 48 (compatibles).
- Radios: `sm 4` · `md 8` · `lg 12` · `xl 16` · `pill 999` · `full 50%`.
- Sombras: `sm` cards · `md` hover y dropdowns · `lg` modales · `focus` anillo naranja 3px.
- z-index: dropdown 1000 · sticky 1020 · sidebar 1030 · overlay 1040 · modal 1055 · popover 1070 · toast 1090.
- Layout: `--nd-sidebar-width` 250 / colapsado 55 · `--nd-page-padding` 24 (16 en mobile) ·
  `--nd-control-height` 38 / sm 32.
- Breakpoints (literal en `@media (max-width: …)`): 380 · 576 · **768** · 1366.
