#!/usr/bin/env node
/**
 * suggest-radlex.js — schlägt für jedes Template-Konzept (data-en) den passenden
 * RadLex-RID vor (BioPortal-Suche). Skaliert den Rebuild: statt hunderte RIDs von
 * Hand zu suchen, entsteht eine Review-Liste (Konzept → Vorschlag + Konfidenz),
 * mit dem echten Label des AKTUELL kodierten (oft falschen) RIDs daneben.
 *
 *   data-en ──exakt/fuzzy──▶ BioPortal RADLEX search ──▶ Vorschlag {rid,label,konfidenz}
 *   aktueller RID ──radlex-cache.json──▶ echtes Label (zeigt, ob bisher falsch)
 *
 * Konfidenz:
 *   exact  require_exact_match-Treffer ODER Label==data-en  → hohe Sicherheit
 *   fuzzy  bester Fuzzy-Treffer                             → prüfen
 *   none   kein Treffer                                     → manuell/local
 *
 * Aufruf
 *   BIOPORTAL_APIKEY=xxxx node shared/scripts/suggest-radlex.js [template-dir]
 *        [--all] [--out <suggestions.json>] [--cache <radlex-cache.json>]
 *        [--concurrency N] [--dry-run]
 *   Default: --all (alle Templates). RADLEX_MOCK=map.json für Offline-Test.
 *
 * Exit: 0 ok · 2 Aufruf-/IO-/Auth-Fehler.  Abhängigkeiten: keine (fetch ≥ Node 18).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const BP_SEARCH = 'https://data.bioontology.org/search';
const RX_RID = /RID\d+/;

/* ------------------------------- CLI ---------------------------------- */

function parseArgs(argv) {
  const o = { target: null, all: false, out: null, cache: null, concurrency: 3, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--all') o.all = true;
    else if (a === '--dry-run') o.dryRun = true;
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--cache') o.cache = argv[++i];
    else if (a === '--concurrency') o.concurrency = Math.max(1, parseInt(argv[++i], 10) || 3);
    else if (a.startsWith('--')) die(`Unbekannte Option: ${a}`);
    else if (!o.target) o.target = a;
    else die(`Zu viele Argumente: ${a}`);
  }
  if (!o.target) o.all = true; // ohne Ziel: repo-weit
  return o;
}

function die(msg) { process.stderr.write(`suggest-radlex: ${msg}\n`); process.exit(2); }

const norm = (s) => String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim();

/* -------------------------- Template-Scan ----------------------------- */

function templateDirs(target, all) {
  const repoRoot = path.resolve(__dirname, '..', '..');
  if (all || !target) {
    const out = [];
    (function walk(d) {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
      }
      if (fs.existsSync(path.join(d, 'template.html'))) out.push(d);
    })(path.join(repoRoot, 'templates'));
    return out.sort();
  }
  const abs = path.resolve(target);
  if (!fs.existsSync(abs)) die(`Pfad nicht gefunden: ${abs}`);
  return [fs.statSync(abs).isDirectory() ? abs : path.dirname(abs)];
}

function parseAttrs(raw) {
  const attrs = {}; const re = /([\w:-]+)\s*=\s*"([^"]*)"/g; let m;
  while ((m = re.exec(raw)) !== null) attrs[m[1]] = m[2];
  return attrs;
}

/** Sammelt kodierte Konzepte (data-en) über alle Templates, dedupliziert. */
function collectConcepts(dirs) {
  const byEn = new Map(); // norm(data-en) -> { dataEn, baseRids:Set, uses:[] }
  for (const dir of dirs) {
    const name = path.basename(dir);
    const html = fs.readFileSync(path.join(dir, 'template.html'), 'utf8');
    const body = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/i) || [null, html])[1];
    const push = (a, field) => {
      const en = a['data-en']; if (!en) return;
      const rawRid = a['data-radlex'] || null;
      let base = rawRid, qual = null;
      if (rawRid) { const mm = rawRid.match(/^(RID\d+)-(.+)$/); if (mm) { base = mm[1]; qual = mm[2]; } }
      const key = norm(en);
      if (!byEn.has(key)) byEn.set(key, { dataEn: en, baseRids: new Set(), uses: [] });
      const rec = byEn.get(key);
      if (base) rec.baseRids.add(base);
      rec.uses.push({ template: name, field, currentRaw: rawRid, qualifier: qual });
    };
    let m;
    const optRe = /<option\b([^>]*)>([\s\S]*?)<\/option>/g;
    while ((m = optRe.exec(body)) !== null) { const a = parseAttrs(m[1]); push(a, a['id'] || a['value'] || '?'); }
    const inpRe = /<input\b([^>]*?)\/?>/g;
    while ((m = inpRe.exec(body)) !== null) { const a = parseAttrs(m[1]); push(a, a['id'] || a['value'] || '?'); }
  }
  return [...byEn.values()].sort((a, b) => a.dataEn.localeCompare(b.dataEn));
}

/* --------------------------- BioPortal -------------------------------- */

function loadMock() {
  if (!process.env.RADLEX_MOCK) return null;
  return JSON.parse(fs.readFileSync(path.resolve(process.env.RADLEX_MOCK), 'utf8'));
}

async function bpSearch(term, apikey, exact) {
  const url = BP_SEARCH + '?q=' + encodeURIComponent(term)
    + '&ontologies=RADLEX' + (exact ? '&require_exact_match=true' : '&suggest=true')
    + '&pagesize=5&apikey=' + encodeURIComponent(apikey);
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (res.status === 401 || res.status === 403) throw new Error(`AUTH ${res.status}: API-Key/Host-Problem.`);
  if (!res.ok) return null;
  const j = await res.json();
  const c = (j.collection || [])[0];
  if (!c) return null;
  const rid = ((c['@id'] || '').match(RX_RID) || [null])[0];
  return rid ? { rid, label: c.prefLabel || null } : null;
}

async function suggestOne(concept, apikey, mock) {
  const term = concept.dataEn;
  if (mock) {
    const hit = mock[term] || mock[norm(term)];
    return hit
      ? { rid: hit.rid || hit, label: hit.label || null, confidence: hit.confidence || 'exact' }
      : { rid: null, label: null, confidence: 'none' };
  }
  try {
    let hit = await bpSearch(term, apikey, true);          // exakt
    if (hit) return { ...hit, confidence: 'exact' };
    hit = await bpSearch(term, apikey, false);             // fuzzy
    if (hit) return { ...hit, confidence: norm(hit.label) === norm(term) ? 'exact' : 'fuzzy' };
    return { rid: null, label: null, confidence: 'none' };
  } catch (err) {
    if (/AUTH/.test(err.message)) throw err;
    return { rid: null, label: null, confidence: 'error', error: err.message };
  }
}

async function runPool(items, n, worker) {
  const out = new Array(items.length); let i = 0;
  async function one() { while (i < items.length) { const k = i++; out[k] = await worker(items[k], k); } }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, one));
  return out;
}

/* ------------------------------ Main ---------------------------------- */

async function main() {
  const o = parseArgs(process.argv.slice(2));
  const dirs = templateDirs(o.target, o.all);
  const concepts = collectConcepts(dirs);
  process.stderr.write(`suggest-radlex: ${concepts.length} eindeutige Konzepte aus ${dirs.length} Template(s).\n`);

  if (o.dryRun) {
    for (const c of concepts) process.stdout.write(`${c.dataEn}\t[${[...c.baseRids].join(',') || '—'}]\t${c.uses.length}×\n`);
    return;
  }

  const mock = loadMock();
  const apikey = process.env.BIOPORTAL_APIKEY;
  if (!mock && !apikey) die('Kein API-Key: env BIOPORTAL_APIKEY setzen (oder RADLEX_MOCK).');

  // aktuelles (evtl. falsches) Label aus dem Cache
  let cache = null;
  const cachePath = o.cache ? path.resolve(o.cache) : path.resolve(__dirname, '..', 'codesystems', 'radlex-cache.json');
  if (fs.existsSync(cachePath)) { try { cache = JSON.parse(fs.readFileSync(cachePath, 'utf8')); } catch (_) {} }
  const currentLabel = (rid) => {
    const t = cache && cache.terms && cache.terms[rid];
    if (!t) return null;
    return t.notFound ? '⌀ nicht gefunden' : (t.englishLabel || t.prefLabel || null);
  };

  const suggestions = await runPool(concepts, o.concurrency, (c) => suggestOne(c, apikey, mock));

  const rows = concepts.map((c, k) => {
    const s = suggestions[k];
    const current = [...c.baseRids].map((r) => `${r}=${currentLabel(r) || '?'}`);
    const changes = !c.baseRids.has(s.rid);
    return {
      concept: c.dataEn,
      suggestedRid: s.rid, suggestedLabel: s.label, confidence: s.confidence,
      currentRids: current,
      changes: !!s.rid && changes,
      uses: c.uses,
    };
  });

  const tally = rows.reduce((t, r) => { t[r.confidence] = (t[r.confidence] || 0) + 1; return t; }, {});
  const out = { generated: 'suggest-radlex', source: mock ? 'RADLEX_MOCK' : 'NCBO BioPortal search', total: rows.length, tally, suggestions: rows };

  const outPath = o.out ? path.resolve(o.out) : path.resolve(__dirname, '..', 'codesystems', 'radlex-suggestions.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');

  process.stderr.write(
    `suggest-radlex: geschrieben ${path.relative(process.cwd(), outPath)}\n` +
    `  exact=${tally.exact || 0}  fuzzy=${tally.fuzzy || 0}  none=${tally.none || 0}  error=${tally.error || 0}  (von ${rows.length})\n`);
}

main().catch((e) => die(e.message));
