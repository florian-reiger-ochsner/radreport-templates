#!/usr/bin/env node
/**
 * validate-codes.js — Code-Treue-Lint für radreport-templates (Schicht 1: offline).
 *
 * Zweck
 *   Fängt die "valid-but-wrong"-Falle: ein Code kann existieren und trotzdem das
 *   falsche Konzept/Label tragen (vgl. der 24627-2-Bug). Existenzprüfung allein
 *   reicht nicht — geprüft wird die DISPLAY-TREUE:
 *
 *       Template-Display  ==  Mapping-Display  ( ==  Registry-Display )
 *
 *   "Display" = der am Code hängende englische RadLex-Term. Im kanonischen
 *   template.html sitzt er als `data-en` an <option>/<input>; in RADLEX-MAPPING.md
 *   in der Term-/`data-en`-Spalte; in der Registry als prefLabel (Schicht 2,
 *   siehe resolve-radlex.js / --resolve).
 *
 * Prüfungen
 *   [STRUKTUR]  Formfehler: fehlendes data-en an kodiertem Feld, ungültiges
 *               RID-/LOINC-Format, widersprüchliche Kodierung (echter RID UND
 *               status=local/needs-mapping am selben Element).
 *   [DISPLAY]   Code steht in Template UND Mapping → Displays müssen verbatim
 *               gleich sein. Abweichung = harter Fehler (exit != 0).
 *   [ABDECKUNG] Template-Codes ohne Mapping-Eintrag und umgekehrt. Deckt die
 *               RID-Basis-Divergenz auf (gleiches Konzept, anderer RID).
 *   [STATUS]    Konzept im Template `local`, im Mapping aber ✅ verifiziert
 *               (oder umgekehrt). Report — Schiedsrichter ist die Registry.
 *   [REGISTRY]  (nur mit --resolve) Abgleich echter RIDs gegen radlex-cache.json:
 *               existiert der RID, und passt prefLabel zum Display?
 *
 * Exit-Code
 *   0  keine harten Fehler (Warnungen erlaubt)
 *   1  mindestens ein harter Fehler (STRUKTUR / DISPLAY / REGISTRY)
 *   2  Aufruf-/IO-Fehler
 *
 * Aufruf
 *   node shared/scripts/validate-codes.js <template-dir | template.html>
 *        [--resolve] [--cache <radlex-cache.json>] [--strict-status] [--json]
 *
 *   Ohne Argument: Default-Template templates/Roentgen/MSK/knie-praetep.
 *
 * Abhängigkeiten: keine (reines Node, konsistent mit build-demo.js).
 */

'use strict';

const fs = require('fs');
const path = require('path');

/* ----------------------------------------------------------------------- *
 * CLI
 * ----------------------------------------------------------------------- */

function parseArgs(argv) {
  const opts = { target: null, resolve: false, cache: null, strictStatus: false, json: false, all: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--resolve') opts.resolve = true;
    else if (a === '--all') opts.all = true;
    else if (a === '--strict-status') opts.strictStatus = true;
    else if (a === '--json') opts.json = true;
    else if (a === '--cache') opts.cache = argv[++i];
    else if (a.startsWith('--')) fail(`Unbekannte Option: ${a}`, 2);
    else if (!opts.target) opts.target = a;
    else fail(`Zu viele Argumente: ${a}`, 2);
  }
  return opts;
}

function fail(msg, code) {
  process.stderr.write(`validate-codes: ${msg}\n`);
  process.exit(code == null ? 2 : code);
}

/** Alle Template-Verzeichnisse (template.html + RADLEX-MAPPING.md) unter templates/. */
function allTargets() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
    }
    if (fs.existsSync(path.join(d, 'template.html')) && fs.existsSync(path.join(d, 'RADLEX-MAPPING.md'))) {
      out.push({ html: path.join(d, 'template.html'), mapping: path.join(d, 'RADLEX-MAPPING.md'), name: path.basename(d), dir: d });
    }
  })(path.join(repoRoot, 'templates'));
  return out.sort((a, b) => a.dir.localeCompare(b.dir));
}

/** Löst target zu { html, mapping, name } auf. */
function resolveTarget(target) {
  const repoRoot = path.resolve(__dirname, '..', '..');
  let dir;
  if (!target) {
    dir = path.join(repoRoot, 'templates', 'Roentgen', 'MSK', 'knie-praetep');
  } else {
    const abs = path.resolve(target);
    if (!fs.existsSync(abs)) fail(`Pfad nicht gefunden: ${abs}`, 2);
    dir = fs.statSync(abs).isDirectory() ? abs : path.dirname(abs);
  }
  const html = path.join(dir, 'template.html');
  const mapping = path.join(dir, 'RADLEX-MAPPING.md');
  if (!fs.existsSync(html)) fail(`template.html fehlt in ${dir}`, 2);
  if (!fs.existsSync(mapping)) fail(`RADLEX-MAPPING.md fehlt in ${dir}`, 2);
  return { html, mapping, name: path.basename(dir), dir };
}

/* ----------------------------------------------------------------------- *
 * Code-Format
 * ----------------------------------------------------------------------- */

const RE_RID = /^RID\d+$/;
const RE_LOINC_PART = /^LP\d+-\d$/;      // RadLex/LOINC Part, z.B. LP410789-0
const RE_LOINC_FULL = /^\d{3,}-\d$/;     // LOINC voll, z.B. 24650-4
const RX_RID_G = /\bRID\d+\b/g;
const RX_LOINC_G = /\b(?:LP\d+-\d|\d{3,}-\d)\b/g;

function isRid(s) { return RE_RID.test(s); }
function isLoinc(s) { return RE_LOINC_PART.test(s) || RE_LOINC_FULL.test(s); }

/* ----------------------------------------------------------------------- *
 * Template-Parser (kanonisches MRRT-HTML)
 * ----------------------------------------------------------------------- */

function parseAttrs(raw) {
  const attrs = {};
  const re = /([\w:-]+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(raw)) !== null) attrs[m[1]] = m[2];
  return attrs;
}

function decodeText(t) {
  return t
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrahiert kodierte Formularelemente. Nur der <body> zählt; <meta>/<head>
 * bleiben außen vor (Body-Region-RID im Header ist kein Formularcode).
 */
function parseTemplate(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : html;
  const entries = [];

  // Kontext-Feld-id (nächstes umschließendes <select id> nur grob via laufender id):
  // für Reporting reicht die Element-eigene id bzw. bei <option> der name/parent.
  // <option>
  const optRe = /<option\b([^>]*)>([\s\S]*?)<\/option>/g;
  let m;
  while ((m = optRe.exec(body)) !== null) {
    const a = parseAttrs(m[1]);
    entries.push(mkEntry('option', a, decodeText(m[2])));
  }
  // <input ...> (radio, checkbox, number, text) — self-closing XHTML
  const inpRe = /<input\b([^>]*?)\/?>/g;
  while ((m = inpRe.exec(body)) !== null) {
    const a = parseAttrs(m[1]);
    entries.push(mkEntry('input', a, ''));
  }
  return entries;
}

function mkEntry(kind, a, text) {
  const rawRid = a['data-radlex'] || null;
  // Konvention RID<basis>-<qualifier> (z.B. RID5352-neg) erkennen: Basis-RID
  // gegen die Registry prüfbar, Suffix = lokaler Qualifier (→ NORMALISIEREN).
  let rid = rawRid, qualifier = null;
  if (rawRid) {
    const mm = rawRid.match(/^(RID\d+)-(.+)$/);
    if (mm) { rid = mm[1]; qualifier = mm[2]; }
  }
  const loinc = a['data-loinc'] || null;
  const status = a['data-radlex-status'] || null;
  return {
    kind,
    inputType: a['type'] || null,
    id: a['id'] || a['name'] || null,
    value: a['value'] != null ? a['value'] : null,
    display: a['data-en'] || null,     // der kodierte englische Term
    rid,                               // Basis-RID (Suffix entfernt)
    rawRid,                            // roher data-radlex-Wert
    qualifier,                         // lokaler Suffix oder null
    loinc,
    status,
    text,                              // sichtbarer (deutscher) Text
    // "kodiert" = trägt einen echten Code (RID oder LOINC)
    coded: !!(rid || loinc),
  };
}

/* ----------------------------------------------------------------------- *
 * Mapping-Parser (RADLEX-MAPPING.md, Markdown-Tabellen)
 * ----------------------------------------------------------------------- */

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map((c) => c.trim());
}

const STATUS_EMOJI = { '✅': 'verified', '🟡': 'local', '🔲': 'pending' };

function statusOf(text) {
  for (const e of Object.keys(STATUS_EMOJI)) if (text.includes(e)) return STATUS_EMOJI[e];
  return null;
}

/** Erkennt die "Term/Display"-Spalte anhand der Headerzeile. */
function termColIndex(header) {
  const idx = header.findIndex((h) => /data-en|radlex-term|\bterm\b/i.test(h));
  if (idx >= 0) return idx;
  // Fallback: erste Spalte, die nicht Code/Status/Hinweis/Binding ist
  const skip = /rid|loinc|status|hinweis|binding|system|ressource|code/i;
  return header.findIndex((h) => !skip.test(h));
}

function parseMapping(md) {
  const lines = md.split(/\r?\n/);
  const rows = []; // { term, rids:[], loincs:[], status, section }
  let section = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h = line.match(/^#{1,6}\s+(.*)$/);
    if (h) { section = h[1].trim(); continue; }
    if (!/^\s*\|/.test(line)) continue;
    // Tabellenkopf gefunden? nächste Zeile ist |---|
    const next = lines[i + 1] || '';
    if (!/^\s*\|?[\s:-]*\|[\s:|-]*$/.test(next)) continue;
    const header = splitRow(line);
    const tcol = termColIndex(header);
    i += 2; // Body ab hier
    for (; i < lines.length; i++) {
      if (!/^\s*\|/.test(lines[i])) { i--; break; }
      const cells = splitRow(lines[i]);
      const joined = cells.join(' | ');
      const rids = (joined.match(RX_RID_G) || []).filter((v, k, arr) => arr.indexOf(v) === k);
      const loincs = (joined.match(RX_LOINC_G) || []).filter((v, k, arr) => arr.indexOf(v) === k);
      const term = tcol >= 0 && cells[tcol] ? stripFmt(cells[tcol]) : '';
      rows.push({ term, rids, loincs, status: statusOf(joined), section, cells });
    }
  }
  return rows;
}

function stripFmt(s) {
  return s.replace(/\*\*/g, '').replace(/`/g, '').replace(/\s+/g, ' ').trim();
}

/* ----------------------------------------------------------------------- *
 * Analyse
 * ----------------------------------------------------------------------- */

function normTerm(s) { return (s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }

function analyze(entries, mapRows, opts, cache) {
  const errors = [];   // harte Fehler → exit 1
  const warnings = []; // Report

  // Indizes aus dem Mapping
  const mapByRid = new Map();
  const mapByLoinc = new Map();
  const mapByTerm = new Map();
  for (const r of mapRows) {
    for (const rid of r.rids) if (!mapByRid.has(rid)) mapByRid.set(rid, r);
    for (const lo of r.loincs) if (!mapByLoinc.has(lo)) mapByLoinc.set(lo, r);
    const nt = normTerm(r.term);
    if (nt && !mapByTerm.has(nt)) mapByTerm.set(nt, r);
  }

  const usedTemplateRids = new Set();
  const usedTemplateLoincs = new Set();

  for (const e of entries) {
    const where = `${e.kind}#${e.id || '?'}${e.value ? `="${e.value}"` : ''}`;

    // [STRUKTUR] Widersprüche & Format
    if (e.rid && e.status && e.status !== 'verified') {
      errors.push(`[STRUKTUR] ${where}: trägt echten RID ${e.rid} UND data-radlex-status="${e.status}" (widersprüchlich).`);
    }
    if (e.rid && !isRid(e.rid)) {
      errors.push(`[STRUKTUR] ${where}: ungültiges RID-Format "${e.rid}".`);
    }
    // [NORMALISIEREN] Suffix-Konvention RID<basis>-<qualifier> → auflösen
    if (e.qualifier) {
      warnings.push(`[NORMALISIEREN] ${where}: data-radlex="${e.rawRid}" (Basis ${e.rid} + Qualifier "${e.qualifier}", data-en="${e.display || '—'}"). Basis-RID als reinen RadLex-Code, Qualifier separat/local.`);
    }
    if (e.loinc && !isLoinc(e.loinc)) {
      errors.push(`[STRUKTUR] ${where}: ungültiges LOINC-Format "${e.loinc}".`);
    }
    if (e.coded && !e.display) {
      errors.push(`[STRUKTUR] ${where}: kodiertes Feld ohne data-en (Display fehlt).`);
    }
    // needs-mapping darf keinen Code tragen
    if (e.status === 'needs-mapping' && e.coded) {
      errors.push(`[STRUKTUR] ${where}: status="needs-mapping", trägt aber einen Code (${e.rid || e.loinc}).`);
    }

    // [STATUS] Konzept lokal im Template, aber im Mapping als verifiziert geführt.
    // Gilt AUCH für nicht-kodierte (status=local) Elemente — daher vor dem
    // coded-Filter. Genau der Zusatzbefunde-Fall (local vs ✅).
    if (e.status === 'local' && e.display) {
      const mt = mapByTerm.get(normTerm(e.display));
      if (mt && mt.status === 'verified') {
        const msg = `[STATUS] "${e.display}": Template=local, Mapping=✅verified (${mt.rids.join('/') || '—'}). Registry muss arbitrieren.`;
        (opts.strictStatus ? errors : warnings).push(msg);
      }
    }

    if (!e.coded) continue; // ab hier nur echte Codes (RID/LOINC)

    // [DISPLAY] Abgleich per Code gegen Mapping (nur saubere, nicht-qualifizierte
    // RIDs — bei Suffix-Codes differiert das spezifische Konzept von der Basis).
    if (e.rid) {
      usedTemplateRids.add(e.rid);
      if (!e.qualifier) {
        const mr = mapByRid.get(e.rid);
        if (mr && mr.term && e.display && mr.term !== e.display) {
          errors.push(`[DISPLAY] RID ${e.rid}: Template data-en="${e.display}" ≠ Mapping "${mr.term}" (${mr.section}).`);
        }
      }
    }
    if (e.loinc) {
      usedTemplateLoincs.add(e.loinc);
      const mr = mapByLoinc.get(e.loinc);
      if (mr && mr.term && e.display && mr.term !== e.display) {
        errors.push(`[DISPLAY] LOINC ${e.loinc}: Template data-en="${e.display}" ≠ Mapping "${mr.term}" (${mr.section}).`);
      }
    }

    // [ABDECKUNG] Code im Template, aber nirgends im Mapping
    if (e.rid && !mapByRid.has(e.rid)) {
      // Gibt es das Konzept unter anderem RID im Mapping? → RID-Divergenz
      const mt = mapByTerm.get(normTerm(e.display));
      if (mt && mt.rids.length) {
        warnings.push(`[ABDECKUNG] RID-Divergenz "${e.display}": Template ${e.rid} ↔ Mapping ${mt.rids.join('/')} (${mt.section}).`);
      } else {
        warnings.push(`[ABDECKUNG] RID ${e.rid} ("${e.display}") ohne Mapping-Eintrag.`);
      }
    }

    // [REGISTRY] Cache-Abgleich (nur --resolve)
    if (opts.resolve && e.rid) {
      const c = cache && cache.terms && cache.terms[e.rid];
      if (!c) {
        errors.push(`[REGISTRY] RID ${e.rid} ("${e.display}") nicht im Cache — via resolve-radlex.js gegen BioPortal auflösen.`);
      } else if (c.notFound) {
        errors.push(`[REGISTRY] RID ${e.rid} in BioPortal nicht gefunden (existiert nicht).`);
      } else if (e.qualifier) {
        // Suffix-Code: kein Strict-Match (spez. Konzept ≠ Basis); Basis-Label
        // zeigen, damit sichtbar wird, ob schon die Basis falsch ist.
        warnings.push(`[NORMALISIEREN] Basis ${e.rid} = RadLex "${c.englishLabel || c.prefLabel}" — Template-Feld "${e.display}" (Qualifier "${e.qualifier}"): spezifisches RadLex-Konzept suchen oder local.`);
      } else if (e.display) {
        // BioPortals RADLEX-prefLabel ist teils deutsch → data-en gegen den
        // englischen Term (englishLabel/Preferred_name), prefLabel ODER Synonyme
        // prüfen (sprachrobust).
        const cand = new Set(
          [c.englishLabel, c.prefLabel, ...(c.synonyms || [])].filter(Boolean).map(normTerm));
        if (cand.size && !cand.has(normTerm(e.display))) {
          const alt = [c.englishLabel, c.prefLabel, ...(c.synonyms || []).slice(0, 3)].filter(Boolean).join(' | ');
          errors.push(`[REGISTRY] RID ${e.rid}: Template "${e.display}" ≠ RadLex [${alt}].`);
        }
      }
    }
  }

  // [ABDECKUNG] Mapping-Codes ohne Verwendung im Template (nur echte, keine Platzhalter-Notiz)
  for (const [rid, r] of mapByRid) {
    if (!usedTemplateRids.has(rid)) {
      warnings.push(`[ABDECKUNG] Mapping-RID ${rid} ("${r.term}", ${r.section}) im Template nicht verwendet.`);
    }
  }

  const dedup = (arr) => arr.filter((v, k) => arr.indexOf(v) === k);
  return { errors: dedup(errors), warnings: dedup(warnings) };
}

/* ----------------------------------------------------------------------- *
 * Main
 * ----------------------------------------------------------------------- */

/** Analysiert genau ein Template. */
function runOne(t, cache, opts) {
  const html = fs.readFileSync(t.html, 'utf8');
  const md = fs.readFileSync(t.mapping, 'utf8');
  const entries = parseTemplate(html);
  const mapRows = parseMapping(md);
  const { errors, warnings } = analyze(entries, mapRows, opts, cache);
  return { name: t.name, dir: t.dir, coded: entries.filter((e) => e.coded).length, mappingRows: mapRows.length, errors, warnings };
}

function loadCache(opts) {
  if (!opts.resolve) return null;
  const cachePath = opts.cache
    ? path.resolve(opts.cache)
    : path.resolve(__dirname, '..', 'codesystems', 'radlex-cache.json');
  if (!fs.existsSync(cachePath)) {
    fail(`--resolve verlangt Cache, aber ${cachePath} fehlt. Erst: node shared/scripts/resolve-radlex.js --all`, 2);
  }
  return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
}

function printOne(r, opts, header) {
  const line = '─'.repeat(72);
  if (header) { console.log(line); console.log(`validate-codes · ${r.name}`);
    console.log(`  kodierte Formularelemente: ${r.coded}   Mapping-Zeilen: ${r.mappingRows}` +
      (opts.resolve ? '   [--resolve gegen Cache]' : '   [offline]'));
    console.log(line); }
  if (r.errors.length) { console.log(`\n✗ HARTE FEHLER (${r.errors.length}):`); for (const e of r.errors) console.log('  ' + e); }
  if (r.warnings.length) { console.log(`\n⚠ REPORT (${r.warnings.length}):`); for (const w of r.warnings) console.log('  ' + w); }
  console.log('');
  if (r.errors.length === 0) console.log('✓ Keine harten Fehler.' + (r.warnings.length ? ` (${r.warnings.length} Report-Hinweise)` : ''));
  else console.log(`✗ ${r.errors.length} harte(r) Fehler → exit 1.`);
  console.log(line);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const cache = loadCache(opts);
  const targets = opts.all ? allTargets() : [resolveTarget(opts.target)];
  if (opts.all && !targets.length) fail('Keine Templates unter templates/ gefunden.', 2);

  const results = targets.map((t) => runOne(t, cache, opts));
  const totalErr = results.reduce((n, r) => n + r.errors.length, 0);

  if (opts.json) {
    process.stdout.write(JSON.stringify(
      opts.all ? { templates: results.map((r) => ({ template: r.name, coded: r.coded, errors: r.errors, warnings: r.warnings, ok: r.errors.length === 0 })), ok: totalErr === 0 }
               : { template: results[0].name, coded: results[0].coded, mappingRows: results[0].mappingRows, errors: results[0].errors, warnings: results[0].warnings, ok: totalErr === 0 },
      null, 2) + '\n');
  } else if (opts.all) {
    const line = '═'.repeat(72);
    console.log(line);
    console.log(`validate-codes · ALLE Templates (${results.length})` + (opts.resolve ? '   [--resolve]' : '   [offline]'));
    console.log(line);
    for (const r of results) printOne(r, opts, true);
    console.log('\n' + line + '\nGESAMT-ÜBERSICHT');
    for (const r of results) {
      const mark = r.errors.length ? '✗' : '✓';
      console.log(`  ${mark} ${r.name.padEnd(22)} ${String(r.errors.length).padStart(2)} Fehler   ${String(r.warnings.length).padStart(2)} Report`);
    }
    console.log(line);
    console.log(totalErr === 0 ? `✓ Alle ${results.length} Templates ohne harte Fehler.` : `✗ ${totalErr} harte Fehler über ${results.filter((r) => r.errors.length).length} Template(s) → exit 1.`);
    console.log(line);
  } else {
    printOne(results[0], opts, true);
  }

  process.exit(totalErr === 0 ? 0 : 1);
}

main();
