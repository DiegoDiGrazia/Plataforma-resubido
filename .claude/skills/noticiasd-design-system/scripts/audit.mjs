#!/usr/bin/env node
/**
 * Auditoría de estilos hardcodeados — Noticias (d)
 *
 * Uso (desde la raíz del repo):
 *   node .claude/skills/noticiasd-design-system/scripts/audit.mjs            # resumen de todo src/
 *   node .claude/skills/noticiasd-design-system/scripts/audit.mjs src/components/comercial
 *   node .claude/skills/noticiasd-design-system/scripts/audit.mjs src/components/nota/nota.css --detail
 *
 * Reporta por archivo: colores literales (con token sugerido), font-size,
 * border-radius, box-shadow y font-family sin token, !important y style={{}}.
 * Ignora src/styles/ (ahí viven los tokens).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const args = process.argv.slice(2);
const detail = args.includes('--detail');
const target = args.find((a) => !a.startsWith('--')) || 'src';
const EXT = new Set(['.css', '.jsx', '.js', '.tsx', '.ts']);
const IGNORE = ['node_modules', 'dist', join('src', 'styles')];

/* Mapeo valor legacy → token. Mantener alineado con references/migracion.md */
const COLOR_MAP = {
  // naranjas
  '#ff653b': '--nd-color-primary', '#fb6514': '--nd-color-primary', '#ff6600': '--nd-color-primary',
  '#ff6236': '--nd-color-primary', '#e05a10': '--nd-color-primary', '#e65c00': '--nd-color-primary',
  '#e67e00': '--nd-color-primary', '#ee4c01': '--nd-color-primary',
  '#e6552d': '--nd-color-primary-hover', '#e55a35': '--nd-color-primary-hover', '#e65b35': '--nd-color-primary-hover',
  '#fff1ec': '--nd-color-primary-subtle', '#fff3ed': '--nd-color-primary-subtle', '#fff6ed': '--nd-color-primary-subtle',
  '#ffe0d8': '--nd-orange-100', '#fed3a7': '--nd-orange-200', '#fffaeb': '--nd-color-warning-subtle',
  // texto
  '#000': '--nd-color-text', '#000000': '--nd-color-text', '#0e0e0e': '--nd-color-text', '#0f0f0f': '--nd-color-text',
  '#050505': '--nd-color-text', '#101828': '--nd-color-text', '#212529': '--nd-color-text', '#1a1a1a': '--nd-color-text',
  '#292929': '--nd-gray-800', '#333': '--nd-gray-800', '#3e4658': '--nd-gray-800', '#3e4658ff': '--nd-gray-800',
  '#344054': '--nd-gray-700', '#475467': '--nd-gray-700',
  '#667085': '--nd-color-text-secondary', '#6c757d': '--nd-color-text-secondary', '#888': '--nd-color-text-secondary',
  '#999': '--nd-color-text-muted', '#9e9e9e': '--nd-color-text-muted', '#98a2b3': '--nd-color-text-muted',
  // bordes
  '#eaecf0': '--nd-color-border', '#e0e0e0': '--nd-color-border', '#dee2e6': '--nd-color-border', '#e9ecef': '--nd-color-border',
  '#eee': '--nd-color-border', '#ddd': '--nd-color-border', '#e7dfdf': '--nd-color-border', '#e2e0e0': '--nd-color-border',
  '#f0f0f0': '--nd-color-border', '#e9e9ec': '--nd-color-border', '#eaecf5': '--nd-color-border', '#edeef3': '--nd-color-border',
  '#d0d5dd': '--nd-color-border-strong', '#ccc': '--nd-color-border-strong', '#c1c3c7': '--nd-color-border-strong',
  '#b9b9c3': '--nd-gray-400',
  // fondos
  '#fff': '--nd-color-bg-surface', '#ffffff': '--nd-color-bg-surface',
  '#f8f9fa': '--nd-color-bg-page', '#fbfcfc': '--nd-color-bg-page', '#f9f9f9': '--nd-color-bg-page', '#fcfffc': '--nd-color-bg-page',
  '#f5f5f5': '--nd-color-bg-muted', '#f2f2f2': '--nd-color-bg-muted', '#f2f4f7': '--nd-color-bg-muted', '#f1f2f2': '--nd-color-bg-muted',
  // estados
  '#dc3545': '--nd-color-danger', '#027a48': '--nd-color-success', '#ecfdf3': '--nd-color-success-subtle',
  '#e8f0fe': '--nd-color-info-subtle', '#eff8ff': '--nd-color-info-subtle', '#f5faff': '--nd-color-info-subtle',
  '#c5d4f5': '--nd-sky-100',
  // azules legacy / plataformas
  '#0d6efd': '--nd-color-primary (era el azul default de Bootstrap)', '#646cff': '(borrar: estilo default de Vite)',
  '#1a73e8': '--nd-color-secondary', '#1877f2': 'seriesColors.redes (tokens.js) / --nd-chart-2', '#34a853': 'seriesColors.medios (tokens.js) / --nd-chart-1',
};

const FONT_SIZE_MAP = {
  9: 'xs', 10: 'xs', 11: 'xs', 12: 'xs', 13: 'sm', 14: 'base', 15: 'base', 16: 'md', 17: 'md', 18: 'lg',
  19: 'xl', 20: 'xl', 22: '2xl', 24: '2xl', 26: '3xl', 28: '3xl', 30: '4xl', 32: '4xl', 35: '4xl',
};
const RADIUS_MAP = (px) => (px <= 5 ? 'sm' : px <= 9 ? 'md' : px <= 14 ? 'lg' : px <= 20 ? 'xl' : 'pill');

const walk = (p) => {
  if (IGNORE.some((i) => p.includes(i))) return [];
  const st = statSync(p);
  if (st.isFile()) return EXT.has(extname(p)) ? [p] : [];
  return readdirSync(p).flatMap((f) => walk(join(p, f)));
};

const rx = {
  hex: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g,
  rgb: /rgba?\([^)]*\)/g,
  fontSize: /font-?size\s*:\s*['"]?([\d.]+)(px|rem|em|%)?/gi,
  radius: /border-?radius\s*:\s*['"]?([\d.]+)(px|rem|%)?/gi,
  shadow: /box-?shadow\s*:(?![\s'"]*(?:var\(|none))[^;}\n]+/gi,
  fontFamily: /font-?family\s*:(?![\s'"]*(?:var\(|inherit))[^;}\n]+/gi,
  important: /!important/g,
  inline: /style=\{\{/g,
};

const files = walk(target);
const rows = [];
const hexTotals = {};

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const isCss = f.endsWith('.css');
  const hexes = src.match(rx.hex) || [];
  const r = {
    file: relative(process.cwd(), f),
    hex: hexes.length,
    rgb: (src.match(rx.rgb) || []).length,
    fontSize: [...src.matchAll(rx.fontSize)].length,
    radius: [...src.matchAll(rx.radius)].filter((m) => m[1] !== '0').length,
    shadow: (src.match(rx.shadow) || []).length,
    fontFamily: (src.match(rx.fontFamily) || []).length,
    important: isCss ? (src.match(rx.important) || []).length : 0,
    inline: (src.match(rx.inline) || []).length,
  };
  r.total = r.hex + r.rgb + r.fontSize + r.radius + r.shadow + r.fontFamily + r.important + r.inline;
  if (r.total) rows.push(r);
  hexes.forEach((h) => { const k = h.toLowerCase(); hexTotals[k] = (hexTotals[k] || 0) + 1; });

  if (detail) {
    console.log(`\n== ${r.file}`);
    src.split('\n').forEach((line, i) => {
      const hints = [];
      for (const h of line.match(rx.hex) || []) hints.push(`${h} → ${COLOR_MAP[h.toLowerCase()] || 'sin mapeo: elegir token por rol'}`);
      for (const m of line.matchAll(rx.fontSize)) {
        const px = m[2] === 'rem' ? Math.round(+m[1] * 16) : +m[1];
        if (!m[2] || m[2] === 'px' || m[2] === 'rem') hints.push(`font-size ${m[1]}${m[2] || ''} → --nd-font-size-${FONT_SIZE_MAP[px] || '?'}`);
      }
      for (const m of line.matchAll(rx.radius)) {
        if (m[1] === '0') continue;
        if (m[2] === '%') { hints.push('radius % → --nd-radius-full (si es círculo)'); continue; }
        const px = m[2] === 'rem' ? +m[1] * 16 : +m[1];
        hints.push(`border-radius ${m[1]}${m[2] || ''} → --nd-radius-${RADIUS_MAP(px)}`);
      }
      if (rx.shadow.test(line)) hints.push('box-shadow → --nd-shadow-sm|md|lg|focus');
      rx.shadow.lastIndex = 0;
      if (isCss && line.includes('!important')) hints.push('!important → subir especificidad o usar token/clase .nd-*');
      if (hints.length) console.log(`  L${i + 1}: ${hints.join(' | ')}`);
    });
  }
}

rows.sort((a, b) => b.total - a.total);
const sum = (k) => rows.reduce((s, r) => s + r[k], 0);

console.log(`\nAuditoría de estilos — ${target}  (${files.length} archivos, ${rows.length} con deuda)\n`);
console.table(rows.slice(0, detail ? rows.length : 25).map(({ file, ...r }) => ({ archivo: file, ...r })));
console.log('Totales:', {
  hex: sum('hex'), rgb: sum('rgb'), fontSize: sum('fontSize'), radius: sum('radius'),
  shadow: sum('shadow'), fontFamily: sum('fontFamily'), important: sum('important'), inlineStyle: sum('inline'),
});

if (!detail) {
  console.log('\nColores literales más usados → token sugerido:');
  Object.entries(hexTotals).sort((a, b) => b[1] - a[1]).slice(0, 20)
    .forEach(([h, n]) => console.log(`  ${String(n).padStart(4)}  ${h.padEnd(10)} → ${COLOR_MAP[h] || 'sin mapeo: elegir token por rol'}`));
  console.log('\nTip: agregá --detail y una ruta para ver línea por línea con el token sugerido.');
}
