#!/usr/bin/env node
/**
 * apply-decisions.js — wendet eine RadLex-Entscheidungsdatei auf ein Template an.
 *
 * decisions.json: { "<data-en>": {"rid":"RID5578","en":"central venous catheter"}
 *                                | {"local":true}, ... }
 *   Schlüssel = aktueller data-en-Wert im Template (eindeutig je Konzept).
 *   - rid+en : setzt data-radlex="rid", data-en="en", entfernt data-radlex-status.
 *   - local  : setzt data-radlex-status="local", entfernt data-radlex; data-en bleibt.
 *
 * Aufruf: node apply-decisions.js <template.html> <decisions.json> [--out <datei>] [--report]
 * Ohne --out wird in-place geschrieben. --report listet jede Änderung + ungenutzte/
 * unabgedeckte Schlüssel (Sicherheitsnetz gegen Tippfehler).
 */
'use strict';
const fs = require('fs');

const [, , tplPath, decPath, ...rest] = process.argv;
if (!tplPath || !decPath) { console.error('usage: apply-decisions.js <template.html> <decisions.json> [--out f] [--report]'); process.exit(2); }
let outPath = tplPath, report = false;
for (let i = 0; i < rest.length; i++) { if (rest[i] === '--out') outPath = rest[++i]; else if (rest[i] === '--report') report = true; }

const norm = (s) => String(s == null ? '' : s).replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const decisions = JSON.parse(fs.readFileSync(decPath, 'utf8'));
const decByEn = new Map(Object.entries(decisions).map(([k, v]) => [norm(k), v]));
let html = fs.readFileSync(tplPath, 'utf8');

const usedKeys = new Set();
const changes = [];
const uncovered = new Set();

function setAttr(tag, name, value) {
  const re = new RegExp('\\s' + name + '="[^"]*"');
  if (re.test(tag)) return tag.replace(re, ` ${name}="${value}"`);
  // nach data-en einfügen (oder vor schließendem >)
  if (/\sdata-en="[^"]*"/.test(tag)) return tag.replace(/(\sdata-en="[^"]*")/, `$1 ${name}="${value}"`);
  return tag.replace(/(\/?>)$/, ` ${name}="${value}"$1`);
}
function delAttr(tag, name) { return tag.replace(new RegExp('\\s' + name + '="[^"]*"'), ''); }

function processTag(tag) {
  const enm = tag.match(/\sdata-en="([^"]*)"/);
  if (!enm) return tag;
  const key = norm(enm[1]);
  const dec = decByEn.get(key);
  if (!dec) { uncovered.add(enm[1]); return tag; }
  usedKeys.add(key);
  const before = (tag.match(/\sdata-radlex(?:-status)?="[^"]*"/g) || []).join(' ');
  let t = tag;
  if (dec.local) {
    t = delAttr(t, 'data-radlex');
    t = setAttr(t, 'data-radlex-status', 'local');
  } else if (dec.rid) {
    t = delAttr(t, 'data-radlex-status');
    t = setAttr(t, 'data-radlex', dec.rid);
    if (dec.en) t = t.replace(/\sdata-en="[^"]*"/, ` data-en="${dec.en}"`);
  }
  changes.push(`${enm[1]}  [${before.trim() || '—'}] -> ${dec.local ? 'local' : dec.rid + (dec.en ? ` (${dec.en})` : '')}`);
  return t;
}

html = html.replace(/<option\b[^>]*>/g, processTag);
html = html.replace(/<input\b[^>]*?\/?>/g, processTag);

fs.writeFileSync(outPath, html);

if (report) {
  console.log(`Änderungen: ${changes.length}`);
  for (const c of changes) console.log('  ' + c);
  const unused = [...decByEn.keys()].filter((k) => !usedKeys.has(k));
  if (unused.length) { console.log(`\n⚠ Entscheidungs-Schlüssel NICHT im Template gefunden (${unused.length}):`); unused.forEach((k) => console.log('  ' + k)); }
  if (uncovered.size) { console.log(`\n⚠ Template-data-en OHNE Entscheidung (${uncovered.size}):`); [...uncovered].forEach((k) => console.log('  ' + k)); }
}
