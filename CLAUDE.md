# Plataforma Noticias (d)

React 18 + react-bootstrap 5.3 + Redux Toolkit. Build/dev con webpack (`npm start`, puerto 4001).

## Estilos — obligatorio en cualquier cambio visual

Antes de escribir o modificar CSS, `className`, `style={{}}`, colores de gráficos o un componente
visual, cargá la skill **noticiasd-design-system** (`.claude/skills/noticiasd-design-system/SKILL.md`).

Reglas mínimas (el detalle está en la skill):

- Todo valor visual sale de los tokens de `src/styles/tokens.css` (`var(--nd-…)`): colores,
  tamaños de fuente, pesos, espaciado, radios, sombras, z-index. **Nunca hex, px de fuente,
  radios ni sombras literales** fuera de `src/styles/`.
- Usar tokens semánticos (`--nd-color-text-secondary`, `--nd-color-border`), no primitivos.
- Botones: `<Button variant="primary|secondary|outline-primary|outline-secondary|danger|link">`.
  El único botón naranja es `primary` (naranja de marca #EE4C01, letra blanca). No usar
  `variant="none"` ni pintar botones con estilos propios o inline.
- Antes de CSS nuevo: ¿lo resuelve Bootstrap (ya tematizado) o una clase `.nd-*` de
  `src/styles/components.css`? Clases nuevas: prefijo `nd-`, BEM-lite.
- Chart.js / react-pdf no entienden `var()`: usar `color`, `palette`, `seriesColors` de `src/styles/tokens.js`.
- Sin `!important` y sin `style={{}}` con valores visuales.
- Breakpoints solo `380 / 576 / 768 / 1366px` (`max-width`).
- Al terminar, auditar lo tocado:
  `node .claude/skills/noticiasd-design-system/scripts/audit.mjs <ruta> --detail`
