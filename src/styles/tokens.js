/**
 * Noticias (d) — tokens para JS.
 *
 * Usar SOLO donde no se puede usar CSS: Chart.js, react-pdf, canvas, MUI `sx`,
 * colores calculados en runtime. Para estilos inline normales preferí
 * `var(--nd-...)`: style={{ color: 'var(--nd-color-text-secondary)' }}.
 *
 * Mantener sincronizado con src/styles/tokens.css (mismos nombres en camelCase).
 */

export const palette = {
  orange50: '#FFF3ED',
  orange100: '#FFE2D3',
  orange200: '#FCC3A5',
  orange500: '#EE4C01',
  orange600: '#D14301',
  orange700: '#B33A01',

  blue50: '#EEEEFB',
  blue500: '#1D1A9B',
  blue600: '#17157D',

  sky50: '#F0F1FD',
  sky500: '#6D77EA',
  sky600: '#5560D9',

  magenta50: '#FEEDF6',
  magenta500: '#F238A7',
  magenta600: '#C21E80',

  yellow50: '#FDFDE3',
  yellow500: '#EFEF43',
  yellow700: '#8A6A00',

  gray0: '#FFFFFF',
  gray50: '#F7F8F8',
  gray100: '#F1F2F2',
  gray200: '#E4E5E8',
  gray300: '#CFD0D7',
  gray400: '#B9B9C3',
  gray500: '#8A8A96',
  gray600: '#63636E',
  gray700: '#45454F',
  gray800: '#2A2A30',
  gray900: '#0F0F0F',

  green50: '#ECF7F0',
  green500: '#177A3F',
  red50: '#FEF0EF',
  red500: '#D92D20',
  red600: '#B42318',
};

export const color = {
  primary: palette.orange500,
  primaryHover: palette.orange600,
  primarySubtle: palette.orange50,
  primaryText: palette.orange600,
  secondary: palette.blue500,
  text: palette.gray900,
  textSecondary: palette.gray600,
  textMuted: palette.gray500,
  border: palette.gray200,
  borderStrong: palette.gray300,
  bgPage: palette.gray50,
  bgSurface: palette.gray0,
  bgMuted: palette.gray100,
  success: palette.green500,
  danger: palette.red500,
  warning: palette.yellow700,
  info: palette.sky600,
};

/** Orden fijo de series para gráficos. No reordenar entre pantallas. */
export const chartColors = [
  palette.orange500,
  palette.blue500,
  palette.sky500,
  palette.magenta500,
  palette.gray400,
  palette.yellow500,
];

/**
 * Color fijo por tipo de canal en TODOS los gráficos y leyendas (barras,
 * líneas y los puntitos .blue-dot-* de Barplot.css, que usan --nd-chart-1/2/3).
 * Reemplaza los colores de terceros (#34A853, #1877F2, #dc3545).
 */
export const seriesColors = {
  medios: chartColors[0], // Google / medios — naranja
  redes: chartColors[1],  // RRSS / Meta — azul
  videos: chartColors[2], // Videos — celeste
};

/** Hex → rgba, para rellenos de área en Chart.js */
export const withAlpha = (hex, alpha) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

export const font = {
  family: "'Aeonik', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  size: { xs: 12, sm: 13, base: 14, md: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 28, '4xl': 32 },
  weight: { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700 },
};

export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 };

export const radius = { sm: 4, md: 8, lg: 12, xl: 16, pill: 999 };

export const breakpoints = { xs: 380, sm: 576, md: 768, xl: 1366 };

/** Defaults globales para Chart.js. Llamar una vez: applyChartDefaults(Chart) */
export const applyChartDefaults = (Chart) => {
  Chart.defaults.font.family = font.family;
  Chart.defaults.font.size = font.size.sm;
  Chart.defaults.color = color.textSecondary;
  Chart.defaults.borderColor = color.border;
  Chart.defaults.plugins.tooltip.backgroundColor = palette.gray900;
  Chart.defaults.plugins.tooltip.cornerRadius = radius.md;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
};
