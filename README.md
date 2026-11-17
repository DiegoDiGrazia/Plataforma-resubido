# Plataforma Noticias (d)

Panel de clientes y editores de Noticias (d): notas, distribución, monitor, reportes y comercial.

## Desarrollo

```bash
npm install
npm start          # webpack dev server en http://localhost:4001
```

## Dónde está cada cosa

La estructura de carpetas, las convenciones de imports y el editor de notas están documentados en
[CLAUDE.md](CLAUDE.md). El sistema de diseño (tokens, componentes, auditoría de estilos) está en
[.claude/skills/noticiasd-design-system/SKILL.md](.claude/skills/noticiasd-design-system/SKILL.md).

```bash
# Auditar estilos hardcodeados de una carpeta o archivo
node .claude/skills/noticiasd-design-system/scripts/audit.mjs src/modules/notas --detail
```
