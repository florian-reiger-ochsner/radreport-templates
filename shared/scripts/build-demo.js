#!/usr/bin/env node
/**
 * build-demo.js – Leitet aus dem kanonischen (lean) template.html die
 *                 abgeleitete demo/<id>/index.html ab.
 *
 * Usage:
 *   node shared/scripts/build-demo.js <canonical template.html> <demo/index.html> [demo-js]
 *
 * Beispiel:
 *   node shared/scripts/build-demo.js \
 *     templates/CT/lirads-leber/template.html \
 *     demo/ct-lirads-leber/index.html
 *
 *   # optional: eigenes Demo-Skript für Vorschau/Interaktivität mit einbinden
 *   node shared/scripts/build-demo.js \
 *     templates/CT/lirads-leber/template.html \
 *     demo/ct-lirads-leber/index.html \
 *     demo.js
 *
 * Architektur (A-Struktur):
 *   - KANONISCH = template.html: nacktes deklaratives MRRT. rr-*-Klassen als
 *     Struktur-Hooks, VOLLE Kodierung (data-radlex RID + data-en, LOINC auf
 *     Messwerten), MRRT-Metadaten. KEIN <link> auf ein Stylesheet, KEIN
 *     <style>, KEIN <script>. Das ist das Plattform-/Import-Gesicht.
 *   - ABGELEITET = demo/<id>/index.html: das kanonische File PLUS externem
 *     Core-Link im <head> (plus optional Demo-JS). Self-contained lauffähig,
 *     GitHub-Pages-tauglich. Schaufenster/Zitier-Gesicht – NIE Quelle der
 *     Wahrheit.
 *
 *   Doppelpflege vermeiden: Inhalt IMMER im kanonischen template.html ändern,
 *   danach dieses Skript laufen lassen. Die demo/index.html wird bei jedem
 *   Build überschrieben und darf nicht von Hand editiert werden.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const canonicalPath = process.argv[2];
const demoPath = process.argv[3];
const demoJs = process.argv[4]; // optional: Dateiname eines Demo-Skripts

if (!canonicalPath || !demoPath) {
  console.error('Fehler: kanonisches Template und Demo-Ausgabepfad angeben.');
  console.error('Usage: node build-demo.js <template.html> <demo/index.html> [demo-js]');
  process.exit(1);
}

if (!fs.existsSync(canonicalPath)) {
  console.error(`Fehler: Kanonisches Template nicht gefunden: ${canonicalPath}`);
  process.exit(1);
}

let html = fs.readFileSync(canonicalPath, 'utf8');

// --- Guard: kanonisches Template muss lean sein --------------------------
// Das kanonische File darf kein Styling/Script tragen. Wenn doch, ist es
// (noch) nicht auf A-Struktur migriert – abbrechen, statt eine inkonsistente
// Demo zu erzeugen.
const violations = [];
if (/<link\b[^>]*stylesheet/i.test(html)) violations.push('<link rel="stylesheet">');
if (/<style[\s>]/i.test(html)) violations.push('<style>');
if (/<script[\s>]/i.test(html)) violations.push('<script>');
if (violations.length) {
  console.error(
    'Fehler: Kanonisches template.html ist nicht lean. Gefunden: ' +
      violations.join(', ') + '.'
  );
  console.error(
    'Das kanonische Template trägt kein CSS/JS. Styling/Interaktivität ' +
      'gehören ausschließlich in die abgeleitete Demo.'
  );
  process.exit(1);
}

// --- Relative Tiefe zum Core-Stylesheet berechnen ------------------------
// shared/styles/radreport-core.css liegt im Repo-Root. Der Core-Link wird
// relativ zum Demo-File aufgelöst.
const repoRoot = path.resolve(__dirname, '..', '..');
const demoDir = path.dirname(path.resolve(demoPath));
const coreAbs = path.join(repoRoot, 'shared', 'styles', 'radreport-core.css');
let coreHref = path.relative(demoDir, coreAbs).split(path.sep).join('/');
if (!coreHref.startsWith('.')) coreHref = './' + coreHref;

// --- Head-Injektion: Fonts + Core-Link -----------------------------------
const FONT_LINKS =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Source+Serif+4:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">';

const genBanner =
  '<!-- ABGELEITET (build-demo.js) – NICHT von Hand editieren. ' +
  'Quelle der Wahrheit: kanonisches template.html. Build: ' +
  new Date().toISOString() + ' -->';

const headInjection =
  '\n  ' + genBanner +
  '\n  <!-- Core-Stylesheet nur in der Demo (Schaufenster), nicht im kanonischen Template -->\n  ' +
  FONT_LINKS.replace(/\n/g, '\n  ') +
  '\n  <link rel="stylesheet" href="' + coreHref + '">\n';

if (!/<\/head>/i.test(html)) {
  console.error('Fehler: kein </head> im kanonischen Template gefunden.');
  process.exit(1);
}
html = html.replace(/<\/head>/i, headInjection + '</head>');

// --- Optionaler Demo-JS-Slot ---------------------------------------------
if (demoJs) {
  const scriptTag = '\n  <script src="' + demoJs + '"></script>\n';
  if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, scriptTag + '</body>');
  } else {
    html += scriptTag;
  }
}

// --- Schreiben (Verzeichnis bei Bedarf anlegen) --------------------------
fs.mkdirSync(demoDir, { recursive: true });
fs.writeFileSync(demoPath, html);

const kb = (html.length / 1024).toFixed(1);
console.log(`✓ ${demoPath} (${kb} KB) – Demo abgeleitet aus ${path.basename(canonicalPath)}`);
console.log(`  Core-Link: ${coreHref}${demoJs ? ' | Demo-JS: ' + demoJs : ''}`);
