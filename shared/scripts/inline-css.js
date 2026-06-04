#!/usr/bin/env node
/**
 * inline-css.js – Injiziert radreport-core.css inline in MRRT-Templates
 *
 * Usage:
 *   node shared/scripts/inline-css.js <source-html>
 *
 * Beispiel:
 *   node shared/scripts/inline-css.js templates/Roentgen/MSK/knie-praetep/template.source.html
 *
 * Erzeugt: templates/Roentgen/MSK/knie-praetep/template.html
 *
 * Hintergrund:
 *   IHE MRRT verlangt self-contained HTML-Dateien. Die Quelldatei
 *   (.source.html) referenziert radreport-core.css per <link>; dieses Skript
 *   ersetzt den Link durch einen <style>-Block mit dem inlined CSS.
 *   Damit ist das produktive Template (.html) MRRT-konform und Carbon-import-fähig.
 */

const fs = require('fs');
const path = require('path');

const sourcePath = process.argv[2];
if (!sourcePath) {
  console.error('Fehler: Quelldatei angeben.');
  console.error('Usage: node inline-css.js <source-html>');
  process.exit(1);
}

// CSS-Pfad relativ zu diesem Skript: ../styles/radreport-core.css
const cssPath = path.join(__dirname, '..', 'styles', 'radreport-core.css');
const outPath = sourcePath.replace(/\.source\.html$/, '.html');

if (sourcePath === outPath) {
  console.error('Fehler: Quelldatei muss auf .source.html enden.');
  process.exit(1);
}

if (!fs.existsSync(sourcePath)) {
  console.error(`Fehler: Quelldatei nicht gefunden: ${sourcePath}`);
  process.exit(1);
}

if (!fs.existsSync(cssPath)) {
  console.error(`Fehler: Stylesheet nicht gefunden: ${cssPath}`);
  process.exit(1);
}

const html = fs.readFileSync(sourcePath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

// Ersetze <link ... radreport-core.css"> durch <style>...</style>
const linkRegex = /<link\s+rel=["']stylesheet["']\s+href=["'][^"']*radreport-core\.css["']\s*\/?>/i;

if (!linkRegex.test(html)) {
  console.error('Fehler: Kein <link> auf radreport-core.css in Quelldatei gefunden.');
  process.exit(1);
}

const output = html.replace(
  linkRegex,
  `<style>\n/* Inlined from radreport-core.css – do not edit here, edit source */\n${css}\n</style>`
);

// MRRT-Banner mit Build-Datum hinzufügen
const buildBanner = `<!-- Build: ${new Date().toISOString()} | radreport-core.css inlined for MRRT-conformance -->`;
const finalOutput = output.replace(/<head>/, `<head>\n  ${buildBanner}`);

fs.writeFileSync(outPath, finalOutput);

const kb = (finalOutput.length / 1024).toFixed(1);
console.log(`✓ ${path.basename(outPath)} (${kb} KB) – build successful`);
