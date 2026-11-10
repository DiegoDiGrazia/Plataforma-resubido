---
name: noticiasd-design-system
description: Sistema de diseño de la plataforma Noticias (d) — tokens de color de marca, tipografía Aeonik, espaciado, radios, sombras, overrides de Bootstrap y clases .nd-*. Usar SIEMPRE que se cree o modifique CSS, className, estilos inline (style={{}}), colores de Chart.js, un componente visual o una pantalla de este repo, y cuando se pida "normalizar", "tokenizar", "migrar estilos", "ajustar al manual de marca" o auditar CSS.
---

# Sistema de diseño Noticias (d)

La plataforma es React 18 + react-bootstrap 5.3 + CSS planos por pantalla. Este sistema
le pone una capa de tokens arriba para que todo el equipo use los mismos valores.

```
src/styles/
  index.css                ← entrada (importada desde src/index.css → main.jsx)
  tokens.css               ← ÚNICA fuente de verdad (--nd-*)
  tokens.js                ← espejo para JS: Chart.js, react-pdf, MUI sx
  fonts.css                ← @font-face Aeonik
  base.css                 ← estilos por etiqueta (body, h1–h6, a, label…)
  bootstrap-overrides.css  ← Bootstrap re-mapeado a tokens (btn, form, modal, tabs…)
  components.css           ← clases .nd-* (card, stat, toolbar, badge, tabs…)
  utilities.css            ← utilidades .nd-text-*, .nd-bg-* + alias legacy
```

## Reglas (no negociables)

1. **Cero valores literales** de color, font-size, font-weight, border-radius, box-shadow,
   font-family o z-index fuera de `src/styles/`. Siempre `var(--nd-…)`.
   Spacing: tokens `--nd-space-*` en CSS o utilidades Bootstrap (`p-3`, `gap-2`) en JSX.
2. **Componentes usan tokens semánticos** (`--nd-color-text-secondary`, `--nd-color-border`),
   no primitivos (`--nd-gray-600`). Primitivos solo para data-viz o etiquetas de color.
3. **Bootstrap primero.** Antes de escribir CSS nuevo: ¿lo resuelve `<Button variant="primary">`,
   `.form-control`, `.nav-tabs`, `.table`? Ya están tematizados. Después buscar una `.nd-*`.
   Recién si no existe, CSS nuevo con tokens.
4. **Variantes de botón permitidas:** `primary` (acción principal, 1 por vista/modal),
   `secondary` (cancelar/volver), `outline-primary`, `outline-secondary`, `danger`,
   `outline-danger`, `link`. No usar `variant="none"` + estilos propios: es la causa #1 de
   botones inconsistentes hoy (30 casos). Los `variant="none"` existentes quedan con los
   defaults de Bootstrap (`.btn-none` en bootstrap-overrides.css) para no romper su layout:
   al migrar uno, pasarlo a un variant real o a una clase propia con tokens (ej. sidebar).
   Nunca cambiar `display`/`justify-content` en `.btn` global: rompe los layouts legacy.
5. **Nada de `!important`** salvo para ganarle a un estilo inline de una librería de terceros.
   Si hace falta para pisar CSS propio, el problema es el CSS propio: arreglalo.
6. **Nada de `style={{}}` con valores visuales.** Solo valores dinámicos calculados en runtime
   (ancho de una barra, posición). Si igual hace falta un color inline, usar
   `'var(--nd-color-…)'` como string, nunca hex.
7. **Contraste:** naranja `#EE4C01` sobre blanco da 3.7:1 → sirve para fondos de botón (con texto
   blanco semibold) e iconos, **no para texto**. Texto naranja = `--nd-color-primary-text`
   (#D14301). Amarillo de marca nunca como texto ni línea fina.
8. **Tamaño mínimo de fuente: 12px** (`--nd-font-size-xs`). Hoy hay 9/10/11px: subirlos.
9. **Breakpoints:** solo `380 / 576 / 768 / 1366px` (`max-width`). Las variables CSS no
   funcionan en `@media`: escribir el número literal, uno de esos cuatro.
10. Clases nuevas propias: prefijo `nd-` + BEM-lite (`.nd-card__title`, `.nd-badge--success`).
    Estilos específicos de una pantalla: anidados bajo la clase raíz de la pantalla
    (`.contratosPage .algo`) y en el CSS de esa pantalla, siempre con tokens.

## Cheat-sheet de tokens

| Necesito… | Token |
|---|---|
| Naranja de marca (botón, icono, acento) | `--nd-color-primary` (#EE4C01) |
| Hover / active del naranja | `--nd-color-primary-hover` / `-active` |
| Fondo naranja suave (icono de KPI, fila activa) | `--nd-color-primary-subtle` |
| Texto/link naranja | `--nd-color-primary-text` |
| Azul de marca (secundario, info destacada) | `--nd-color-secondary` (#1D1A9B) |
| Texto principal / secundario / apagado | `--nd-color-text` / `-text-secondary` / `-text-muted` |
| Fondo app / card / gris suave | `--nd-color-bg-page` / `-bg-surface` / `-bg-muted` |
| Borde divisor / borde input | `--nd-color-border` / `--nd-color-border-strong` |
| Éxito / error / aviso / info | `--nd-color-success` / `-danger` / `-warning` / `-info` (+ `-subtle` para fondos) |
| Fuente | `--nd-font-family` |
| Tamaños | `xs 12 · sm 13 · base 14 · md 16 · lg 18 · xl 20 · 2xl 24 · 3xl 28 · 4xl 32` → `--nd-font-size-*` |
| Pesos | `regular 400 · medium 500 · semibold 600 · bold 700` → `--nd-font-weight-*` |
| Espaciado (base 4) | `--nd-space-1`=4 · `2`=8 · `3`=12 · `4`=16 · `5`=20 · `6`=24 · `8`=32 · `10`=40 · `12`=48 |
| Radios | `sm 4` (badge) · `md 8` (botón/input) · `lg 12` (card) · `xl 16` (modal) · `pill` · `full` |
| Sombras | `--nd-shadow-sm` (card) · `-md` (hover/dropdown) · `-lg` (modal) · `-focus` (foco) |
| Transiciones | `--nd-duration-fast/base/slow` + `--nd-easing` |
| z-index | `--nd-z-dropdown/sticky/sidebar/overlay/modal/popover/toast` |

Tabla completa con hex, contraste y uso de cada color: [references/tokens.md](references/tokens.md).

## Mapa de etiquetas → estilo

| Elemento | Cómo |
|---|---|
| Título de página | `<h1>` o `.nd-page-header__title` (28px bold) — uno por pantalla |
| Título de sección | `<h2>` o `.nd-section-title` (24px) |
| Título de card / modal | `<h3>`/`.modal-title` (20px) · `.nd-card__title` (16px bold) |
| Subtítulo / texto de apoyo | `.nd-page-header__subtitle`, `.nd-text-secondary` |
| Cuerpo | `<p>` sin clases (14px, line-height 1.5) |
| Label de formulario | `<Form.Label>` / `.form-label` / `.nd-field__label` (13px medium gris) |
| Label de KPI / encabezado de tabla | `.nd-stat__label`, `thead th` (12px, mayúsculas, tracking) |
| Link | `<a>` sin clases |
| Input | `<Form.Control>` / `.form-control`; fuera de Bootstrap `.nd-input` |
| Estado (activo, vencido, pendiente) | `.nd-badge .nd-badge--success|danger|warning|info|primary` |

## Flujos de trabajo

### A. Crear UI nueva
1. Armar con react-bootstrap + clases de [references/componentes.md](references/componentes.md).
2. Si falta algo, CSS en el archivo de la pantalla, solo con `var(--nd-…)`.
3. Si el patrón se va a repetir en ≥2 pantallas, moverlo a `components.css` como `.nd-*`
   y documentarlo en `references/componentes.md`.
4. Correr la auditoría sobre los archivos tocados (debe dar 0 en hex/fontSize/radius/shadow).

### A2. Modificar un archivo existente (por cualquier motivo)
Si tocás un `.css` o `.jsx` aunque sea por un bug o una feature, ese archivo queda normalizado
completo antes de terminar: `migrate.mjs <archivo> --write` (después de revisar el dry-run),
font-size / weight / spacing / `!important` / inline styles a mano, y `audit.mjs <archivo>` en 0
para hex, fontSize, radius y shadow. Si el CSS de una pantalla está repartido (`X.css` + `XMobile.css`),
normalizar ambos. Avisar al usuario los cambios visuales que resulten.

### B. Migrar una pantalla existente
Seguir [references/migracion.md](references/migracion.md). Resumen:
1. `node .claude/skills/noticiasd-design-system/scripts/audit.mjs <ruta> --detail`
   → lista línea por línea con el token sugerido.
2. Reemplazar valores por tokens (tabla de mapeo legacy en migracion.md).
3. Borrar reglas que Bootstrap tematizado ya resuelve (`.btnNuevoContrato` → `variant="primary"`).
4. Quitar `!important` y `style={{}}` visuales.
5. Verificar en desktop y en 768px. Volver a correr la auditoría.

### C. Agregar / cambiar un token
Solo en `tokens.css` **y** `tokens.js` (mismo valor), actualizar `references/tokens.md`.
Nunca crear un token para un uso único: usar el más cercano de la escala.

## Auditoría

```bash
node .claude/skills/noticiasd-design-system/scripts/audit.mjs                 # ranking de todo src/
node .claude/skills/noticiasd-design-system/scripts/audit.mjs src/components/nota --detail
```

## Codemod (reemplazo automático)

```bash
node .claude/skills/noticiasd-design-system/scripts/migrate.mjs src/components/x            # dry-run
node .claude/skills/noticiasd-design-system/scripts/migrate.mjs src/components/x --write    # aplica
node .claude/skills/noticiasd-design-system/scripts/migrate.mjs src --only=radius --write    # solo radios
```
Reemplaza hex, colores por nombre (`white`, `black`…), `border-radius`, `box-shadow` y overlays
`rgba(0,0,0,.5–.8)` por tokens, eligiendo el token según la propiedad (texto / fondo / borde).
Salta archivos con Chart.js o react-pdf (canvas/PDF no entienden `var()`): ahí usar
`seriesColors` / `color` / `palette` de `tokens.js`. Revisar siempre el dry-run antes de `--write`.

## Estado

- 2026-11-10 inicio: 316 hex · 248 font-size · 101 radius · 508 `!important` · 347 `style={{}}`.
- 2026-11-10 tras codemod: **0 hex · 0 radius** · 1 shadow · 242 font-size · 476 `!important` · 341 `style={{}}`.

Pendiente: font-size, `!important`, inline styles. Objetivo: cada PR que toque una pantalla
la deja en 0 en hex/font-size/radius/shadow.
