#!/usr/bin/env node
/**
 * inline-css.js – ABGEKÜNDIGT / RETIRED (A-Struktur-Umstellung, 2026-07)
 *
 * Dieses Skript ist gegenstandslos. Es diente der alten B-Struktur, in der das
 * kanonische Artefakt ein gebautes, self-contained template.html mit INLINE-CSS
 * war (erzeugt aus template.source.html).
 *
 * Ab der A-Struktur gilt:
 *   - KANONISCH = template.html: nacktes deklaratives MRRT, rr-*-Klassen nur als
 *     Struktur-Hooks, KEIN CSS, KEIN <script>. Es gibt kein template.source.html
 *     und kein Inline-CSS mehr, also nichts zu "inlinen".
 *   - ABGELEITET = demo/<id>/index.html: wird aus dem kanonischen template.html
 *     via shared/scripts/build-demo.js erzeugt (Core-Link im <head>).
 *
 * Ersatz:  node shared/scripts/build-demo.js <template.html> <demo/index.html>
 *
 * Diese Datei bleibt vorerst als Wegweiser bestehen und bricht bewusst ab,
 * damit alte Aufrufe nicht stillschweigend Falsches tun.
 */

'use strict';

console.error('inline-css.js ist abgekündigt (A-Struktur-Umstellung).');
console.error('Das kanonische template.html trägt kein CSS mehr – es gibt nichts zu inlinen.');
console.error('Verwende stattdessen die Demo-Ableitung:');
console.error('  node shared/scripts/build-demo.js <template.html> <demo/index.html> [demo-js]');
process.exit(1);
