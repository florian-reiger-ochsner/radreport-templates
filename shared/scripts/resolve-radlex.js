#!/usr/bin/env node
/**
 * resolve-radlex.js — RadLex-Resolver gegen NCBO BioPortal (Schicht 2).
 *
 * Der "Lint-Server"-Teil: erdet die im Repo verwendeten RadLex-RIDs an einer
 * ECHTEN Quelle. Für jeden RID wird die BioPortal-Klasse abgefragt und ihr
 * prefLabel (+ Synonyme) in einen lokalen Cache geschrieben. Gegen diesen Cache
 * lintet validate-codes.js --resolve OFFLINE weiter — so bleibt CI/Round-Trip
 * netzfrei und deterministisch, während der Refresh ein bewusster Schritt ist.
 *
 *   RID  ──GET──▶  BioPortal RADLEX  ──prefLabel──▶  radlex-cache.json
 *                                                          │
 *                              validate-codes.js --resolve ◀┘  (offline)
 *
 * Quelle
 *   NCBO BioPortal REST API, Ontologie RADLEX.
 *   Klassen-URI-Schema (default): http://www.radlex.org/RID/RID<n>
 *   Endpoint: https://data.bioontology.org/ontologies/RADLEX/classes/<url-enc URI>
 *   Auth: API-Key als Query-Param `apikey` ODER Header `Authorization: apikey token=…`.
 *
 * API-Key
 *   NUR aus der Umgebung: env BIOPORTAL_APIKEY. Niemals im Code/Repo.
 *   Kostenlos unter https://bioportal.bioontology.org/account.
 *
 * Aufruf
 *   BIOPORTAL_APIKEY=xxxx node shared/scripts/resolve-radlex.js [template-dir]
 *        [--out <cache.json>] [--all] [--concurrency N] [--dry-run]
 *
 *   --dry-run     Nur RIDs sammeln + URLs zeigen, kein Netz, kein Key nötig.
 *   --all         Alle templates/ ** /template.html scannen (statt Default-Template).
 *   RADLEX_MOCK   Pfad zu einer JSON-Map {RID: prefLabel|{prefLabel,synonym}} —
 *                 ersetzt den Netz-Call (für Tests/Offline-Verifikation).
 *
 * Exit: 0 ok · 2 Aufruf-/IO-/Auth-Fehler
 * Abhängigkeiten: keine (globales fetch aus Node ≥ 18).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const RID_URI = (rid) => `http://www.radlex.org/RID/${rid}`; // Klassen-URI-Schema (BioPortal RADLEX)
const BP_BASE = 'https://data.bioontology.org/ontologies/RADLEX/classes/';
const RX_RID_G = /\bRID\d+\b/g;

/* ------------------------------- CLI ---------------------------------- */

function parseArgs(argv) {
  const o = { target: null, out: null, all: false, concurrency: 4, dryRun: false, diagnose: 0 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--all') o.all = true;
    else if (a === '--dry-run') o.dryRun = true;
    else if (a === '--diagnose') o.diagnose = Math.max(1, parseInt(argv[++i], 10) || 3);
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--concurrency') o.concurrency = Math.max(1, parseInt(argv[++i], 10) || 4);
    else if (a.startsWith('--')) die(`Unbekannte Option: ${a}`);
    else if (!o.target) o.target = a;
    else die(`Zu viele Argumente: ${a}`);
  }
  return o;
}

function die(msg) { process.stderr.write(`resolve-radlex: ${msg}\n`); process.exit(2); }

/* -------------------------- RID-Sammlung ------------------------------ */

function templateDirs(target, all) {
  const repoRoot = path.resolve(__dirname, '..', '..');
  if (all) {
    const out = [];
    (function walk(d) {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name === 'template.html') out.push(path.dirname(p));
      }
    })(path.join(repoRoot, 'templates'));
    return out;
  }
  let dir;
  if (!target) dir = path.join(repoRoot, 'templates', 'Roentgen', 'MSK', 'knie-praetep');
  else {
    const abs = path.resolve(target);
    if (!fs.existsSync(abs)) die(`Pfad nicht gefunden: ${abs}`);
    dir = fs.statSync(abs).isDirectory() ? abs : path.dirname(abs);
  }
  return [dir];
}

/** Nur data-radlex-RIDs aus dem <body> + alle RIDs aus dem Mapping. */
function collectRids(dirs) {
  const rids = new Map(); // rid -> Set(quellen)
  const add = (rid, src) => { (rids.get(rid) || rids.set(rid, new Set()).get(rid)).add(src); };
  for (const dir of dirs) {
    const htmlPath = path.join(dir, 'template.html');
    const mapPath = path.join(dir, 'RADLEX-MAPPING.md');
    if (fs.existsSync(htmlPath)) {
      const html = fs.readFileSync(htmlPath, 'utf8');
      const body = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/i) || [null, html])[1];
      const re = /data-radlex\s*=\s*"(RID\d+)"/g;
      let m; while ((m = re.exec(body)) !== null) add(m[1], `${path.basename(dir)}/template.html`);
    }
    if (fs.existsSync(mapPath)) {
      const md = fs.readFileSync(mapPath, 'utf8');
      for (const rid of md.match(RX_RID_G) || []) add(rid, `${path.basename(dir)}/RADLEX-MAPPING.md`);
    }
  }
  return rids;
}

/* --------------------------- BioPortal -------------------------------- */

function loadMock() {
  if (!process.env.RADLEX_MOCK) return null;
  const raw = JSON.parse(fs.readFileSync(path.resolve(process.env.RADLEX_MOCK), 'utf8'));
  const norm = {};
  for (const [rid, v] of Object.entries(raw)) {
    norm[rid] = typeof v === 'string' ? { prefLabel: v, synonym: [] } : v;
  }
  return norm;
}

const norm = (s) => String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Liefert { english, allLabels } aus den Properties.
 * Die BioPortal-RADLEX-Submission führt im Property `…/def/prefLabel` ein Array
 * mit DE+EN (Reihenfolge uneinheitlich); oben ist prefLabel die deutsche. Der
 * englische Term ist der Array-Eintrag, der NICHT der deutschen prefLabel gleicht.
 * Fallback: explizites `Preferred_name`-Property.
 */
function extractLabels(props, germanPref) {
  const out = { english: null, allLabels: [] };
  if (!props || typeof props !== 'object') return out;
  const key = Object.keys(props).find((k) => /(?:def\/|#)prefLabel$/.test(k));
  let arr = key && Array.isArray(props[key]) ? props[key].filter(Boolean).map(String) : [];
  out.allLabels = arr;
  if (arr.length) {
    const nonGerman = arr.filter((v) => norm(v) !== norm(germanPref));
    if (nonGerman.length) { out.english = nonGerman[0]; return out; }
  }
  for (const [k, v] of Object.entries(props)) {
    if (/preferred[_ ]?name$/i.test(k)) {
      const val = Array.isArray(v) ? v[0] : v;
      if (val && norm(val) !== norm(germanPref)) { out.english = String(val); return out; }
    }
  }
  return out;
}

async function fetchClass(rid, apikey) {
  const uri = RID_URI(rid);
  // include=properties liefert die RadLex-Annotationen (u.a. evtl. Preferred_name).
  const url = BP_BASE + encodeURIComponent(uri)
    + '?include=' + encodeURIComponent('prefLabel,synonym,definition,properties')
    + '&apikey=' + encodeURIComponent(apikey);
  let res;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch (err) {
    return { rid, uri, error: `network: ${err.message}` };
  }
  if (res.status === 401 || res.status === 403) throw new Error(`AUTH ${res.status}: API-Key ungültig/fehlt/Host blockiert.`);
  if (res.status === 404) return { rid, uri, notFound: true };
  if (!res.ok) return { rid, uri, error: `http ${res.status}` };
  let j;
  try { j = await res.json(); } catch (err) { return { rid, uri, error: `json: ${err.message}` }; }
  const { english, allLabels } = extractLabels(j.properties, j.prefLabel);
  // Alle Label-Varianten (DE+EN) + Synonyme in die Kandidatenliste, damit der
  // Abgleich sprachrobust ist, auch wenn die english-Heuristik mal danebenliegt.
  const syn = new Set([...(Array.isArray(j.synonym) ? j.synonym : []), ...allLabels]);
  if (j.prefLabel) syn.delete(j.prefLabel);
  return {
    rid,
    uri,
    prefLabel: j.prefLabel || null,
    englishLabel: english,
    synonyms: [...syn],
    definition: Array.isArray(j.definition) ? j.definition[0] : (j.definition || null),
    obsolete: !!j.obsolete,
    properties: j.properties || null,
  };
}

/** Kleiner Concurrency-Pool ohne Fremd-Deps. */
async function runPool(items, n, worker) {
  const out = new Array(items.length);
  let i = 0;
  async function one() {
    while (i < items.length) {
      const k = i++;
      out[k] = await worker(items[k], k);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, one));
  return out;
}

/* ------------------------------ Main ---------------------------------- */

async function main() {
  const o = parseArgs(process.argv.slice(2));
  const dirs = templateDirs(o.target, o.all);
  const ridsMap = collectRids(dirs);
  const rids = [...ridsMap.keys()].sort((a, b) =>
    (parseInt(a.slice(3), 10) || 0) - (parseInt(b.slice(3), 10) || 0));

  const outPath = o.out
    ? path.resolve(o.out)
    : path.resolve(__dirname, '..', 'codesystems', 'radlex-cache.json');

  process.stderr.write(`resolve-radlex: ${rids.length} eindeutige RIDs aus ${dirs.length} Template(s).\n`);

  if (o.dryRun) {
    for (const rid of rids) {
      process.stdout.write(`${rid}\t${BP_BASE}${encodeURIComponent(RID_URI(rid))}?apikey=…\n`);
    }
    process.stderr.write('resolve-radlex: --dry-run, kein Netz-Call.\n');
    return;
  }

  const mock = loadMock();
  const apikey = process.env.BIOPORTAL_APIKEY;
  if (!mock && !apikey) die('Kein API-Key: env BIOPORTAL_APIKEY setzen (oder RADLEX_MOCK für Offline-Test).');

  const results = await runPool(rids, o.concurrency, async (rid) => {
    if (mock) {
      const hit = mock[rid];
      return hit
        ? { rid, uri: RID_URI(rid), prefLabel: hit.prefLabel || null, englishLabel: hit.englishLabel || null, synonyms: hit.synonym || [], mocked: true }
        : { rid, uri: RID_URI(rid), notFound: true, mocked: true };
    }
    return fetchClass(rid, apikey);
  });

  // --diagnose: Rohfelder der ersten N aufgelösten RIDs zeigen (Feldstruktur klären)
  if (o.diagnose) {
    let shown = 0;
    process.stderr.write(`\n─── DIAGNOSE (erste ${o.diagnose} aufgelöste RIDs, Property-Keys + englishLabel) ───\n`);
    for (const r of results) {
      if (r.notFound || r.error || shown >= o.diagnose) continue;
      shown++;
      process.stderr.write(`\n${r.rid}  prefLabel=${JSON.stringify(r.prefLabel)}  englishLabel=${JSON.stringify(r.englishLabel)}\n`);
      const props = r.properties || {};
      for (const [k, v] of Object.entries(props)) {
        process.stderr.write(`   ${k} = ${JSON.stringify(Array.isArray(v) ? v.slice(0, 2) : v)}\n`);
      }
    }
    process.stderr.write('───────────────────────────────────────────────────────────────\n\n');
  }

  const terms = {};
  let ok = 0, missing = 0, errored = 0;
  for (const r of results) {
    const src = [...(ridsMap.get(r.rid) || [])].sort();
    if (r.error) { errored++; terms[r.rid] = { uri: r.uri, error: r.error, sources: src }; continue; }
    if (r.notFound) { missing++; terms[r.rid] = { uri: r.uri, notFound: true, sources: src }; continue; }
    ok++;
    terms[r.rid] = {
      uri: r.uri,
      prefLabel: r.prefLabel,
      englishLabel: r.englishLabel || null,
      synonyms: r.synonyms || [],
      obsolete: !!r.obsolete,
      sources: src,
    };
  }

  const cache = {
    codeSystem: 'http://radlex.org',
    source: mock ? 'RADLEX_MOCK' : 'NCBO BioPortal (ontologies/RADLEX)',
    generated: new Date().toISOString(),
    ridUriScheme: 'http://www.radlex.org/RID/RID<n>',
    counts: { total: rids.length, resolved: ok, notFound: missing, errors: errored },
    terms,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(cache, null, 2) + '\n');
  process.stderr.write(
    `resolve-radlex: geschrieben ${path.relative(process.cwd(), outPath)} — ` +
    `${ok} aufgelöst, ${missing} not-found, ${errored} Fehler.\n`);
}

main().catch((e) => die(e.message));
