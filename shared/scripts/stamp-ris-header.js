#!/usr/bin/env node
/**
 * stamp-ris-header.js – Stempelt den geteilten RIS-/Signatur-Block aus
 *   shared/partials/ris-header.html in eine oder mehrere kanonische
 *   template.html. Idempotent: Marker vorhanden → Inhalt ersetzen;
 *   Marker fehlen → Block vor der ersten Befund-/Technik-Sektion einfügen.
 *
 * Warum ein Skript statt Copy-Paste:
 *   Der RIS-/Signatur-Block betrifft JEDES Template. Wird er von Hand kopiert,
 *   driften die Felder (IDs, data-ris-source, FHIR-Mapping) über die Templates
 *   auseinander. Das Partial ist die einzige Quelle; dieses Skript verteilt sie.
 *
 * Usage:
 *   node shared/scripts/stamp-ris-header.js <template.html> [<template.html> …]
 *   node shared/scripts/stamp-ris-header.js --check <template.html>   # nur prüfen
 *
 * Danach IMMER die Demo neu ableiten:
 *   node shared/scripts/build-demo.js <template.html> <demo/index.html> demo.js
 * build-demo.js führt den Lean- und den XML-Wohlgeformtheits-Guard aus.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const START = '<!-- rr:ris-header:start — gestempelt aus shared/partials/ris-header.html; NICHT hier editieren, Quelle ist das Partial -->';
const END = '<!-- rr:ris-header:end — Ende geteilter RIS-/Signatur-Block -->';

const repoRoot = path.resolve(__dirname, '..', '..');
const partialPath = path.join(repoRoot, 'shared', 'partials', 'ris-header.html');

function loadPartial() {
  if (!fs.existsSync(partialPath)) {
    console.error(`Fehler: Partial nicht gefunden: ${partialPath}`);
    process.exit(1);
  }
  return fs.readFileSync(partialPath, 'utf8').replace(/\s+$/, '');
}

/**
 * Baut den zu stempelnden Block mit passender Einrückung.
 * @param {string} partial  Inhalt des Partials
 * @param {string} indent   Einrückung des Ankers (z. B. zwei Leerzeichen)
 */
function buildBlock(partial, indent) {
  return indent + START + '\n' + partial + '\n' + indent + END;
}

/**
 * Stempelt den Block in den HTML-String.
 * @returns {{html: string, action: 'replaced'|'inserted'}}
 */
function stamp(html, partial) {
  const startIdx = html.indexOf(START);
  const endIdx = html.indexOf(END);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    // Marker vorhanden → Inhalt zwischen (inkl.) den Markern ersetzen.
    // Einrückung aus der Zeile des Start-Markers ableiten.
    const lineStart = html.lastIndexOf('\n', startIdx) + 1;
    const indent = html.slice(lineStart, startIdx).match(/^[ \t]*/)[0];
    const block = buildBlock(partial, indent);
    const before = html.slice(0, lineStart);
    const after = html.slice(endIdx + END.length);
    return { html: before + block + after, action: 'replaced' };
  }

  // Kein Marker → vor der ersten "rr-h2-wrap"-Sektion einfügen (stabiler
  // Anker über alle Templates: erste inhaltliche H2-Sektion nach dem Titel).
  const m = html.match(/\n([ \t]*)<div class="rr-h2-wrap">/);
  if (!m) {
    throw new Error(
      'Kein Anker gefunden: weder Marker noch <div class="rr-h2-wrap">. ' +
        'Marker manuell platzieren oder Anker prüfen.'
    );
  }
  const indent = m[1];
  const insertAt = m.index + 1; // hinter dem \n
  const block = buildBlock(partial, indent) + '\n\n';
  return {
    html: html.slice(0, insertAt) + block + html.slice(insertAt),
    action: 'inserted'
  };
}

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args[0] === '--check';
  const files = checkOnly ? args.slice(1) : args;

  if (!files.length) {
    console.error('Usage: node stamp-ris-header.js [--check] <template.html> [<template.html> …]');
    process.exit(1);
  }

  const partial = loadPartial();
  let changed = 0;

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.error(`Fehler: Template nicht gefunden: ${file}`);
      process.exitCode = 1;
      continue;
    }
    const orig = fs.readFileSync(file, 'utf8');
    let result;
    try {
      result = stamp(orig, partial);
    } catch (e) {
      console.error(`Fehler in ${file}: ${e.message}`);
      process.exitCode = 1;
      continue;
    }

    if (checkOnly) {
      if (result.html !== orig) {
        console.error(`✗ ${file}: RIS-Block fehlt oder weicht vom Partial ab (Stamp nötig).`);
        process.exitCode = 1;
      } else {
        console.log(`✓ ${file}: RIS-Block aktuell.`);
      }
      continue;
    }

    if (result.html === orig) {
      console.log(`= ${file}: unverändert (bereits aktuell).`);
    } else {
      fs.writeFileSync(file, result.html);
      console.log(`✓ ${file}: RIS-Block ${result.action === 'replaced' ? 'aktualisiert' : 'eingefügt'}.`);
      changed++;
    }
  }

  if (!checkOnly) {
    console.log(
      `\nFertig (${changed} geändert). Nicht vergessen: Demo neu ableiten ` +
        '(build-demo.js) – der Lean- und XML-Guard läuft dort.'
    );
  }
}

main();
