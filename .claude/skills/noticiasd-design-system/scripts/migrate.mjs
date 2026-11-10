#!/usr/bin/env node
/**
 * Codemod de estilos — Noticias (d)
 *
 * Reemplaza colores hex, border-radius y box-shadow literales por tokens --nd-*
 * en CSS y en estilos inline de JSX. El token de color se elige según la
 * PROPIEDAD: un #fff en `color` → --nd-color-text-inverse, en `background`
 * → --nd-color-bg-surface, en `border` → --nd-color-border.
 *
 * Uso (desde la raíz del repo):
 *   node .claude/skills/noticiasd-design-system/scripts/migrate.mjs [ruta]           # dry-run: muestra cambios
 *   node .claude/skills/noticiasd-design-system/scripts/migrate.mjs [ruta] --write   # aplica
 *   flags: --only=color,radius,shadow   (default: los tres)
 *
 * No toca: src/styles/, src/index.css, archivos que importan chart.js /
 * react-chartjs-2 / @react-pdf (canvas/PDF no resuelven var(); usar tokens.js).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const target = args.find((a) => !a.startsWith('--')) || 'src';
const onlyArg = args.find((a) => a.startsWith('--only='));
const ONLY = new Set((onlyArg ? onlyArg.slice(7) : 'color,radius,shadow').split(','));

const IGNORE_PATHS = ['node_modules', 'dist', join('src', 'styles'), join('src', 'index.css')];
const IGNORE_IMPORTS = /from\s+['"](chart\.js|react-chartjs-2|@react-pdf\/renderer)['"]/;

/* ---------- Colores: hex → familia ---------- */
const FAMILY = {};
const fam = (name, list) => list.forEach((h) => { FAMILY[h] = name; });
fam('orange', ['ff653b', 'fb6514', 'ff6600', 'ff6236', 'e05a10', 'e65c00', 'e67e00', 'ee4c01', '0d6efd']);
fam('orangeHover', ['e6552d', 'e55a35', 'e65b35']);
fam('orangeSubtle', ['fff1ec', 'fff3ed', 'fff6ed', 'ffe0d8', 'fed3a7']);
fam('dark', ['000', '000000', '0e0e0e', '0f0f0f', '050505', '101828', '212529', '1a1a1a', '202124', '242424', '213547',
  '292929', '333', '333333', '3e4658', '3e4658ff', '464d55ff', '303238', '323232', '36383b', '4e4e4e', '344054', '495057']);
fam('mid', ['475467', '667085', '6c757d', '5f6368', '666', '666666', '888', '868e96']);
fam('muted', ['9e9e9e', '98a2b3', '999', '999999', 'ada4a1', 'b9b9c3']);
fam('borderStrong', ['ccc', 'cccccc', 'c1c3c7', 'd0d5dd', 'd1d5dd']);
fam('borderLight', ['eaecf0', 'e0e0e0', 'dee2e6', 'e9ecef', 'eee', 'eeeeee', 'ddd', 'dddddd', 'e7dfdf', 'e2e0e0', 'f0f0f0',
  'e9e9ec', 'eaecf5', 'eaecf5de', 'edeef3']);
fam('bgMuted', ['f5f5f5', 'f2f2f2', 'f2f4f7', 'f1f2f2']);
fam('bgPage', ['f8f9fa', 'fbfcfc', 'f9f9f9', 'fcfffc', 'f7f8f8']);
fam('white', ['fff', 'ffffff']);
fam('danger', ['dc3545', 'd92d20']);
fam('success', ['069435', '027a48', '2ea054', '34a853']);
fam('successSubtle', ['ecfdf3']);
fam('warning', ['b54708']);
fam('warningSubtle', ['fffaeb']);
fam('infoSubtle', ['e8f0fe', 'eff8ff', 'f5faff', 'c4d4f4', '153f7d62']);
fam('infoBorder', ['c5d4f5']);
fam('blue', ['3b82f6', '1a73e8', '175cd3', '2164d5', '052c65', '2029ff', '4f46e5', '1877f2', '1d1a9b']);

const NAMED = {
  white: 'white', whitesmoke: 'bgMuted', black: 'dark', gray: 'mid', grey: 'mid', darkgray: 'mid', darkgrey: 'mid',
  lightgray: 'borderLight', lightgrey: 'borderLight', silver: 'borderStrong',
  red: 'danger', green: 'success', blue: 'blue', orange: 'orange',
};

/* familia × rol de la propiedad → token */
const ROLE_TOKEN = {
  text: {
    orange: 'color-primary-text', orangeHover: 'color-link-hover', orangeSubtle: 'orange-200',
    dark: 'color-text', mid: 'color-text-secondary', muted: 'color-text-muted',
    borderStrong: 'color-text-muted', borderLight: 'color-text-muted', bgMuted: 'color-text-muted', bgPage: 'color-text-inverse',
    white: 'color-text-inverse', danger: 'color-danger', success: 'color-success', successSubtle: 'color-success',
    warning: 'color-warning', warningSubtle: 'color-warning', infoSubtle: 'color-info', infoBorder: 'color-info', blue: 'color-secondary',
  },
  bg: {
    orange: 'color-primary', orangeHover: 'color-primary-hover', orangeSubtle: 'color-primary-subtle',
    dark: 'color-bg-inverse', mid: 'gray-600', muted: 'gray-400', borderStrong: 'gray-300', borderLight: 'color-bg-muted',
    bgMuted: 'color-bg-muted', bgPage: 'color-bg-page', white: 'color-bg-surface',
    danger: 'color-danger', success: 'color-success', successSubtle: 'color-success-subtle',
    warning: 'color-warning', warningSubtle: 'color-warning-subtle', infoSubtle: 'color-info-subtle', infoBorder: 'sky-100', blue: 'color-secondary',
  },
  border: {
    orange: 'color-primary', orangeHover: 'color-primary-hover', orangeSubtle: 'orange-200',
    dark: 'color-text', mid: 'color-border-strong', muted: 'color-border-strong', borderStrong: 'color-border-strong',
    borderLight: 'color-border', bgMuted: 'color-border', bgPage: 'color-border', white: 'color-bg-surface',
    danger: 'color-danger', success: 'color-success', successSubtle: 'color-success',
    warning: 'color-warning', warningSubtle: 'color-warning', infoSubtle: 'sky-100', infoBorder: 'sky-100', blue: 'color-secondary',
  },
};

const roleOf = (prop) => {
  const p = (prop || '').toLowerCase().replace(/-/g, '');
  if (p.includes('background') || p === 'fill') return 'bg';
  if (p.includes('border') || p.includes('outline') || p === 'stroke') return 'border';
  if (p === 'color' || p === 'bodycolor' || p === 'caretcolor' || p === 'webkittextfillcolor' || p === 'textdecorationcolor') return 'text';
  return 'bg'; // accent-color, scrollbar-color, box-shadow, --vars…
};

/* propiedad más cercana a la izquierda del match en la misma "declaración" */
const propBefore = (line, idx) => {
  const left = line.slice(0, idx);
  const m = [...left.matchAll(/([a-zA-Z-]+)\s*:/g)].pop();
  return m ? m[1] : '';
};

/* ---------- Radios ---------- */
const radiusToken = (raw) => {
  const m = /^([\d.]+)(px|rem|em|%)?$/.exec(raw);
  if (!m) return null;
  const n = +m[1];
  if (n === 0) return null;
  if (m[2] === '%') return n === 50 ? 'radius-full' : null;
  const px = m[2] === 'rem' || m[2] === 'em' ? n * 16 : n;
  if (px <= 5) return 'radius-sm';
  if (px <= 9) return 'radius-md';
  if (px <= 14) return 'radius-lg';
  if (px <= 20) return 'radius-xl';
  return 'radius-pill';
};

/* ---------- Sombras ---------- */
const shadowToken = (value) => {
  if (/inset/.test(value)) return null;
  const parts = value.split(/,(?![^(]*\))/);
  let maxBlur = 0; let focus = false;
  for (const p of parts) {
    const nums = (p.replace(/rgba?\([^)]*\)|#[0-9a-f]+/gi, '').match(/-?[\d.]+(px|rem)?/g) || [])
      .map((x) => (x.endsWith('rem') ? parseFloat(x) * 16 : parseFloat(x)));
    const [x = 0, y = 0, blur = 0, spread = 0] = nums;
    if (x === 0 && y === 0 && blur === 0 && spread > 0) focus = true;
    maxBlur = Math.max(maxBlur, blur);
  }
  if (focus) return 'shadow-focus';
  if (maxBlur <= 6) return 'shadow-sm';
  if (maxBlur <= 16) return 'shadow-md';
  return 'shadow-lg';
};

const v = (t) => `var(--nd-${t})`;

/* ---------- Transformaciones por línea ---------- */
const changes = [];
const unmapped = {};

function transformLine(line, isJsx) {
  let out = line;

  if (ONLY.has('shadow')) {
    // CSS
    out = out.replace(/(box-shadow\s*:\s*)(?![\s]*(?:var\(|none|inherit|initial|unset))([^;{}!]+?)(\s*(?:!important)?\s*;)/gi,
      (all, pre, val, post) => { const t = shadowToken(val); return t ? `${pre}${v(t)}${post}` : all; });
    // JSX: boxShadow: '...'
    if (isJsx) out = out.replace(/(boxShadow\s*:\s*)(['"])((?!var\()[^'"]+)\2/g,
      (all, pre, q, val) => { const t = shadowToken(val); return t ? `${pre}${q}${v(t)}${q}` : all; });
  }

  if (ONLY.has('radius')) {
    // CSS: border-radius / border-*-radius con 1–4 valores
    out = out.replace(/(border(?:-[a-z]+)*-radius\s*:\s*)([^;{}!]+?)(\s*(?:!important)?\s*;|\s*$)/gi, (all, pre, val, post) => {
      if (/var\(|inherit|none|initial/.test(val)) return all;
      let changed = false;
      const mapped = val.trim().split(/\s+/).map((tok) => { const t = radiusToken(tok); if (t) { changed = true; return v(t); } return tok; });
      return changed ? `${pre}${mapped.join(' ')}${post}` : all;
    });
    if (isJsx) {
      out = out.replace(/(border(?:[A-Z][a-z]+)*Radius\s*:\s*)(?:(['"])([^'"]+)\2|(\d+(?:\.\d+)?)(?=\s*[,}\s]))/g, (all, pre, q, str, num) => {
        const val = str ?? `${num}px`;
        if (/var\(/.test(val)) return all;
        let changed = false;
        const mapped = val.trim().split(/\s+/).map((tok) => { const t = radiusToken(/^\d+(\.\d+)?$/.test(tok) ? `${tok}px` : tok); if (t) { changed = true; return v(t); } return tok; });
        return changed ? `${pre}'${mapped.join(' ')}'` : all;
      });
    }
  }

  if (ONLY.has('color')) {
    // overlays negros translúcidos en fondos
    out = out.replace(/((?:background|background-color|backgroundColor)\s*:\s*['"]?)rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0?\.([5-8])\d*\s*\)/g,
      (all, pre) => `${pre}${v('color-overlay')}`);

    out = out.replace(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, (all, hex, idx, str) => {
      const h = hex.toLowerCase();
      // en JSX solo hex dentro de strings
      if (isJsx) {
        const before = str.slice(0, idx);
        const quotes = (before.match(/['"`]/g) || []).length;
        if (quotes % 2 === 0) return all;
      }
      const f = FAMILY[h];
      if (!f) { unmapped[h] = (unmapped[h] || 0) + 1; return all; }
      const role = roleOf(propBefore(str, idx));
      return v(ROLE_TOKEN[role][f]);
    });

    // colores por nombre, solo como valor de propiedades de color
    out = out.replace(
      /(?<![=&\w.-])(color|background(?:-color)?|backgroundColor|border(?:-[a-z]+)*|border(?:[A-Z][a-z]+)*|outline(?:-color)?)(\s*:\s*['"]?[^;'"{}]*?)\b(white|black|gray|grey|red|green|blue|orange|lightgray|lightgrey|darkgray|darkgrey|silver|whitesmoke)\b(?![-\w])/gi,
      (all, prop, mid, name) => {
        const f = NAMED[name.toLowerCase()];
        return f ? `${prop}${mid}${v(ROLE_TOKEN[roleOf(prop)][f])}` : all;
      });
  }
  return out;
}

/* ---------- Recorrido ---------- */
const walk = (p) => {
  if (IGNORE_PATHS.some((i) => p.includes(i))) return [];
  const st = statSync(p);
  if (st.isFile()) return ['.css', '.jsx'].includes(extname(p)) ? [p] : [];
  return readdirSync(p).flatMap((f) => walk(join(p, f)));
};

const skipped = [];
for (const f of walk(target)) {
  const src = readFileSync(f, 'utf8');
  const isJsx = f.endsWith('.jsx');
  if (isJsx && IGNORE_IMPORTS.test(src)) { skipped.push(relative(process.cwd(), f)); continue; }
  let inComment = false;
  const lines = src.split('\n');
  const next = lines.map((line, i) => {
    // no tocar comentarios /* */ de CSS
    if (!isJsx) {
      if (inComment) { if (line.includes('*/')) inComment = false; return line; }
      if (line.trim().startsWith('/*') && !line.includes('*/')) { inComment = true; return line; }
    }
    const res = transformLine(line, isJsx);
    if (res !== line) changes.push({ file: relative(process.cwd(), f), line: i + 1, before: line.trim(), after: res.trim() });
    return res;
  });
  if (WRITE && next.join('\n') !== src) writeFileSync(f, next.join('\n'));
}

const byFile = changes.reduce((a, c) => ((a[c.file] = (a[c.file] || 0) + 1), a), {});
if (!WRITE || args.includes('--verbose')) changes.forEach((c) => console.log(`${c.file}:${c.line}\n  - ${c.before}\n  + ${c.after}`));
console.log(`\n${WRITE ? 'Aplicado' : 'Dry-run'}: ${changes.length} líneas en ${Object.keys(byFile).length} archivos.`);
if (skipped.length) console.log(`Saltados (canvas/PDF, migrar con tokens.js): ${skipped.join(', ')}`);
if (Object.keys(unmapped).length) console.log('Hex sin mapeo (revisar a mano):', unmapped);
