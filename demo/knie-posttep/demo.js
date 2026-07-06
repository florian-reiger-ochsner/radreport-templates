// =============================================================================
// Demo-Interaktivität für "Röntgen Knie post-KTEP" (v1.1)
//
// ABGELEITET / Demo-Schicht: gehört NICHT ins kanonische template.html (nacktes,
// JS-freies, form-only MRRT). Baut das Viewer-Chrome zur Laufzeit:
//   - template-spezifisches Styling (Core kennt nur die rr-*-Basis)
//   - Implantat-Preset-Schnellwahl (#preset-bar)
//   - EndoCert-Badge/-Hinweis + Kerncheckliste (#ec-checklist)
//   - Ewald-Zonentabelle (#ewald-tbody)
//   - Komplikations-Flags (#flag-grid)
//   - kontextabhängige Sektionslogik + Hinweistexte (#ctx-hint, #align-intraop-hint)
//   - Live-Befundvorschau (Preview-Pane) + Beurteilungs-Vorschlag (#beurt-vorschlag)
//   - Kopier-/FHIR-/JSON-/Reset-Buttons + Status-Badge
//
// Textbau, Presets, Flags, Ewald-Zonen, EndoCert-Checkliste und FHIR-/JSON-Bundle
// verbatim portiert aus dem abgelösten Inline-Template. Die kodierten Felder
// selbst sind im kanonischen template.html deklariert; demo.js liest sie über
// id / data-radlex / data-en / data-loinc aus dem DOM.
// Eingebunden via build-demo.js in demo/index.html.
// =============================================================================

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 0. IMPLANTAT-PRESETS  (Konvenienz-Schnellwahl; hier anpassen)
  //    Nach Rücksprache mit der Orthopädie: Einträge editieren/ergänzen/entfernen.
  // ---------------------------------------------------------------------------
  var PRESETS = [
    { label: 'Persona PS', detail: 'Zimmer Biomet · PS · zementiert bds.',
      typ: 'bikondyläre KTEP', const_: 'PS (Posterior-stabilisiert)',
      hersteller: 'Zimmer Biomet', modell: 'Persona PS',
      fix_fem: 'zementiert', fix_tib: 'zementiert', patella: 'kein Patellaersatz' },
    { label: 'Persona CR', detail: 'Zimmer Biomet · CR · zementiert bds.',
      typ: 'bikondyläre KTEP', const_: 'CR (Kreuzband-erhaltend)',
      hersteller: 'Zimmer Biomet', modell: 'Persona CR',
      fix_fem: 'zementiert', fix_tib: 'zementiert', patella: 'kein Patellaersatz' },
    { label: 'NexGen PS', detail: 'Zimmer Biomet · PS · zementiert bds.',
      typ: 'bikondyläre KTEP', const_: 'PS (Posterior-stabilisiert)',
      hersteller: 'Zimmer Biomet', modell: 'NexGen LPS',
      fix_fem: 'zementiert', fix_tib: 'zementiert', patella: 'kein Patellaersatz' },
    { label: 'NexGen CR', detail: 'Zimmer Biomet · CR · zementiert bds.',
      typ: 'bikondyläre KTEP', const_: 'CR (Kreuzband-erhaltend)',
      hersteller: 'Zimmer Biomet', modell: 'NexGen CR-Flex',
      fix_fem: 'zementiert', fix_tib: 'zementiert', patella: 'kein Patellaersatz' }
  ];

  // ---------------------------------------------------------------------------
  // 0b. KOMPLIKATIONS-FLAGS (intern – kein Fließtext-Output, aber FHIR-kodiert)
  // ---------------------------------------------------------------------------
  var FLAGS = [
    { id: 'fl_fraktur',   label: 'Periprothetische Fraktur',        note: 'Vancouver-Klassifikation empfohlen',   rid: 'RID49830', en: 'periprosthetic fracture',            sev: 'alert' },
    { id: 'fl_luxation',  label: 'Luxation / Subluxation',          note: 'Sofortige Klinik-Info',                rid: 'RID49831', en: 'prosthesis dislocation',             sev: 'alert' },
    { id: 'fl_loosening', label: 'Lockerungszeichen',               note: 'Signifikanter Lysesaum / Migration',   rid: 'RID49832', en: 'prosthetic loosening',               sev: 'warn' },
    { id: 'fl_infekt',    label: 'V.a. periprothetische Infektion', note: 'Osteolyse + klinische Korrelation',    rid: 'RID49833', en: 'periprosthetic infection',           sev: 'alert' },
    { id: 'fl_malalign',  label: 'Relevantes Malalignment',         note: 'Korrektur prüfen',                     rid: 'RID49834', en: 'prosthetic malalignment',            sev: 'warn' },
    { id: 'fl_notching',  label: 'Relevantes Notching',             note: 'Frakturrisiko suprakondylär erhöht',   rid: 'RID49835', en: 'anterior femoral notching',          sev: 'warn' },
    { id: 'fl_ptx_alta',  label: 'Patella baja / infera',           note: 'Streckapparat prüfen',                 rid: 'RID49836', en: 'patella baja postoperative',         sev: 'warn' },
    { id: 'fl_hto',       label: 'Ausgeprägte HTO',                 note: 'Brooker III–IV',                       rid: 'RID49837', en: 'significant heterotopic ossification', sev: 'warn' }
  ];

  // ---------------------------------------------------------------------------
  // 0c. EWALD-ZONEN (vereinfacht Stufe 1) + Options
  // ---------------------------------------------------------------------------
  var EWALD_ZONES = [
    { id: 'ew_f1', grp: 'Femur (a.p.)',   label: 'F1 – lat. Femur' },
    { id: 'ew_f2', grp: 'Femur (a.p.)',   label: 'F2 – Femur zentral' },
    { id: 'ew_f3', grp: 'Femur (a.p.)',   label: 'F3 – med. Femur' },
    { id: 'ew_f4', grp: 'Femur (seitl.)', label: 'F4 – ant. Femur' },
    { id: 'ew_f5', grp: 'Femur (seitl.)', label: 'F5 – post. Femur' },
    { id: 'ew_t1', grp: 'Tibia (a.p.)',   label: 'T1 – lat. Tibia' },
    { id: 'ew_t2', grp: 'Tibia (a.p.)',   label: 'T2 – Tibia zentral' },
    { id: 'ew_t3', grp: 'Tibia (a.p.)',   label: 'T3 – med. Tibia' },
    { id: 'ew_t4', grp: 'Tibia (seitl.)', label: 'T4 – ant. Tibia' },
    { id: 'ew_t5', grp: 'Tibia (seitl.)', label: 'T5 – post. Tibia' }
  ];
  var LYSESAUM_OPTS  = [{ v: '', t: '–' }, { v: 'neg', t: 'keiner' }, { v: '1', t: '< 1 mm' }, { v: '2', t: '1–2 mm' }, { v: '3', t: '> 2 mm ⚠' }];
  var OSTEOLYSE_OPTS = [{ v: '', t: '–' }, { v: 'neg', t: 'keine' }, { v: 'fokal', t: 'fokal' }, { v: 'ausgedehnt', t: 'ausgedehnt ⚠' }];
  var VERLAUF_OPTS   = [{ v: '', t: '–' }, { v: 'stabil', t: 'stabil' }, { v: 'neu', t: 'neu ⚠' }, { v: 'progredient', t: 'progredient ⚠' }, { v: 'rückläufig', t: 'rückläufig' }];

  // ---------------------------------------------------------------------------
  // 0d. ENDOCERT-KERNCHECKLISTE
  // ---------------------------------------------------------------------------
  var EC_CHECKLIST = [
    { id: 'ec_pos',   label: 'Implantat korrekt positioniert',            note: 'Regelrechte Verankerung Femur + Tibia, kein offensichtliches Malalignment', rid: 'RID49770', en: 'implant position satisfactory' },
    { id: 'ec_zem',   label: 'Zementierung vollständig',                  note: 'Vollständiger Mantel, kein relevanter Defekt, keine bedenkliche Extrusion',  rid: 'RID49800', en: 'cement mantle complete' },
    { id: 'ec_frak',  label: 'Keine periprothetische Fraktur',            note: 'Kein Frakturhinweis im abgebildeten Bereich',                               rid: 'RID49830', en: 'no periprosthetic fracture' },
    { id: 'ec_lux',   label: 'Kein Hinweis auf Luxation',                 note: 'Kongruente Gelenkstellung, kein Implantat-Dislokationszeichen',              rid: 'RID49831', en: 'no dislocation' },
    { id: 'ec_align', label: 'Alignment ohne dringlichen Korrekturbedarf', note: 'Coronares + sagittales Alignment beider Komponenten akzeptabel',            rid: 'RID49771', en: 'alignment acceptable' },
    { id: 'ec_pat',   label: 'Patella zentriert (falls Patellaersatz)',   note: 'Tracking ok, kein Tilt, kein Überhang; n.a. ohne Patellaersatz',             rid: 'RID49780', en: 'patellar tracking satisfactory' }
  ];

  // ---------------------------------------------------------------------------
  // 1. DEMO-STYLING (Core kennt nur die rr-*-Basis; template-spezifische Klassen
  //    werden hier injiziert – wird nach dem Core-Link angehängt und überschreibt.)
  // ---------------------------------------------------------------------------
  var css = ''
    // Template-spezifische Farbtokens (Core kennt diese nicht; im abgelösten
    // Inline-Template waren sie undefiniert → hier verbindlich gesetzt).
    + ':root{--accent-deep:#1e4361;--endocert:#1a7a55;--endocert-pale:#e4f3ec}'
    // Sektions-Header
    + '.sh{display:flex;align-items:baseline;gap:12px;margin:28px 0 11px}'
    + '.sh h2{font-family:var(--rr-font-sans),sans-serif;font-weight:600;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--rr-accent)}'
    + '.sh-line{flex:1;height:1px;background:var(--rr-rule)}'
    + '.sh-sub{font-size:12px;color:var(--rr-ink-muted);margin:-6px 0 12px}'
    // Kontext-Modus
    + '.ctx-sw{display:flex;gap:0;border:1px solid var(--rr-field-border);border-radius:var(--rr-radius);overflow:hidden;margin-bottom:12px}'
    + '.ctx-sw input{display:none}'
    + '.ctx-sw label{flex:1;padding:9px 10px;text-align:center;font-size:12.5px;color:var(--rr-ink-muted);cursor:pointer;transition:all .15s;border-right:1px solid var(--rr-field-border);line-height:1.3}'
    + '.ctx-sw label:last-of-type{border-right:none}'
    + '.ctx-sw input:checked+label{background:var(--rr-accent);color:#fff;font-weight:600}'
    + '.ctx-sw label:hover{background:var(--rr-accent-pale);color:var(--rr-accent)}'
    // Fields
    + '.row{margin-bottom:12px}'
    + '.row label{display:flex;flex-direction:column;gap:4px}'
    + '.lbl{font-size:12px;font-weight:500;color:var(--rr-ink-soft);letter-spacing:.02em}'
    + '.unit{font-size:11px;color:var(--rr-ink-muted);margin-left:3px;font-weight:400}'
    + '.field-note{font-size:11px;color:var(--rr-ink-muted);margin-top:2px;font-style:italic}'
    + '.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}'
    + '.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}'
    // Side toggle
    + '.side-tg{display:flex;gap:0;border:1px solid var(--rr-field-border);border-radius:var(--rr-radius);overflow:hidden;max-width:130px;margin-bottom:8px}'
    + '.side-tg input{display:none}'
    + '.side-tg label{flex:1;padding:8px 16px;text-align:center;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s;border-right:1px solid var(--rr-field-border)}'
    + '.side-tg label:last-of-type{border-right:none}'
    + '.side-tg input:checked+label{background:var(--rr-accent);color:#fff}'
    + '.side-tg label:hover{background:var(--rr-accent-pale);color:var(--rr-accent)}'
    // AI field
    + '.ai-field input,.ai-field select{background:var(--rr-ai-tint);border-color:var(--rr-accent)}'
    // Winkel-Grid
    + '.winkel-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;background:var(--rr-bg-alt);border:1px solid var(--rr-rule);border-radius:var(--rr-radius);padding:16px 16px 10px;margin-bottom:14px}'
    + '.winkel-title{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--rr-ink-muted);margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--rr-rule)}'
    // Komplikations-Flags
    + '.flag-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px}'
    + '.flag-item{display:flex;align-items:flex-start;gap:8px;background:var(--rr-bg-alt);border:1px solid var(--rr-rule);border-radius:var(--rr-radius);padding:9px 11px;cursor:pointer;transition:all .15s}'
    + '.flag-item:hover{border-color:var(--rr-accent-light);background:var(--rr-accent-pale)}'
    + '.flag-item input[type=checkbox]{width:15px;height:15px;margin-top:2px;flex-shrink:0;accent-color:var(--rr-accent);cursor:pointer}'
    + '.flag-item.active{border-color:var(--rr-critical);background:#fdf0ef}'
    + '.flag-item .flag-lbl{font-size:12.5px;color:var(--rr-ink-soft);line-height:1.4}'
    + '.flag-item .flag-lbl strong{display:block;font-size:13px;color:var(--rr-ink);font-weight:600}'
    // Ewald-Tabelle
    + '.ewald-wrap{overflow-x:auto;margin:8px 0 14px}'
    + '.ewald-tbl{width:100%;border-collapse:collapse;font-size:12.5px}'
    + '.ewald-tbl th{text-align:center;padding:7px 8px;background:var(--rr-accent);color:#fff;font-weight:600;font-size:11px;letter-spacing:.04em;text-transform:uppercase;border:1px solid var(--accent-deep)}'
    + '.ewald-tbl th.side{background:var(--accent-deep)}'
    + '.ewald-tbl td{padding:5px 6px;border:1px solid var(--rr-rule);vertical-align:middle;text-align:center}'
    + '.ewald-tbl td.zone-lbl{font-size:11px;font-weight:600;color:var(--rr-ink-muted);text-align:left;background:var(--rr-bg-alt);white-space:nowrap}'
    + '.ewald-tbl select{border:none;background:transparent;padding:2px 4px;font-size:12px;color:var(--rr-ink);width:100%;min-width:90px}'
    + '.ewald-tbl select:focus{background:var(--rr-accent-pale);border-radius:3px}'
    // Collapsible
    + 'details{margin-bottom:8px}'
    + 'details>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px;padding:9px 13px;background:var(--rr-bg-alt);border-radius:var(--rr-radius);border:1px solid var(--rr-rule);font-size:13px;font-weight:500;color:var(--rr-ink-soft);user-select:none;transition:all .15s}'
    + 'details>summary:hover{background:var(--rr-accent-pale);color:var(--rr-accent);border-color:var(--rr-accent-light)}'
    + 'details>summary::-webkit-details-marker{display:none}'
    + 'details>summary::before{content:"▶";font-size:9px;color:var(--rr-ink-faint);transition:transform .15s}'
    + 'details[open]>summary::before{transform:rotate(90deg)}'
    + 'details>.db{padding:14px 13px 8px;border:1px solid var(--rr-rule);border-top:none;border-radius:0 0 var(--rr-radius) var(--rr-radius);background:var(--rr-bg)}'
    // Implantat-Presets
    + '.preset-bar{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px}'
    + '.preset-btn{display:flex;flex-direction:column;align-items:flex-start;padding:8px 13px;border:1.5px solid var(--rr-field-border);border-radius:var(--rr-radius);background:var(--rr-bg);cursor:pointer;transition:all .15s;text-align:left;font-family:inherit}'
    + '.preset-btn:hover{border-color:var(--rr-accent);background:var(--rr-accent-pale)}'
    + '.preset-btn.active{border-color:var(--rr-accent);background:var(--rr-accent-pale)}'
    + '.preset-btn .pb-name{font-size:13px;font-weight:600;color:var(--rr-ink);line-height:1.3}'
    + '.preset-btn .pb-detail{font-size:11px;color:var(--rr-ink-muted);margin-top:2px;line-height:1.3}'
    + '.preset-edit-hint{font-size:11px;color:var(--rr-ink-faint);margin:-6px 0 14px;font-style:italic}'
    + '.endocert-badge{display:inline-flex;align-items:center;gap:7px;background:var(--endocert-pale);border:1px solid var(--endocert);border-radius:var(--rr-radius);padding:6px 12px;font-size:12px;font-weight:600;color:var(--endocert);margin-bottom:14px}'
    + '.hint-endocert{background:var(--endocert-pale);border-left:3px solid var(--endocert);border-radius:0 var(--rr-radius) var(--rr-radius) 0;padding:9px 13px;font-size:12px;color:var(--endocert);margin:4px 0 12px}'
    + '.hint-endocert strong{color:var(--endocert)}'
    + '.ec-pill{display:none;align-items:center;gap:4px;background:var(--endocert-pale);border:1px solid var(--endocert);border-radius:10px;padding:2px 9px;font-size:11px;font-weight:600;color:var(--endocert);white-space:nowrap;flex-shrink:0}'
    + '.ec-pill.show{display:inline-flex}'
    // EndoCert Checkliste
    + '.ec-checklist{display:flex;flex-direction:column;gap:6px;margin:6px 0 14px}'
    + '.ec-cl-item{display:flex;align-items:flex-start;gap:10px;background:var(--rr-bg-alt);border:1px solid var(--rr-rule);border-radius:var(--rr-radius);padding:10px 13px;transition:all .15s}'
    + '.ec-cl-item.ok{border-color:var(--rr-success);background:#ecf7f2}'
    + '.ec-cl-item.nok{border-color:var(--rr-critical);background:#fdf0ef}'
    + '.ec-cl-inner{display:flex;gap:0;border:1px solid var(--rr-field-border);border-radius:4px;overflow:hidden;flex-shrink:0;margin-top:1px}'
    + '.ec-cl-inner label{padding:3px 9px;font-size:12px;font-weight:600;cursor:pointer;transition:all .12s;border-right:1px solid var(--rr-field-border);color:var(--rr-ink-muted)}'
    + '.ec-cl-inner label:last-of-type{border-right:none}'
    + '.ec-cl-inner input[type=radio]{display:none}'
    + '.ec-cl-inner input[type=radio]:checked+label.ec-ok{background:var(--rr-success);color:#fff;border-color:var(--rr-success)}'
    + '.ec-cl-inner input[type=radio]:checked+label.ec-nok{background:var(--rr-critical);color:#fff;border-color:var(--rr-critical)}'
    + '.ec-cl-inner input[type=radio]:checked+label.ec-na{background:var(--rr-ink-muted);color:#fff;border-color:var(--rr-ink-muted)}'
    + '.ec-cl-text{flex:1}'
    + '.ec-cl-text strong{display:block;font-size:13px;color:var(--rr-ink);font-weight:600;margin-bottom:1px}'
    + '.ec-cl-text span{font-size:11.5px;color:var(--rr-ink-muted);line-height:1.4}'
    // EndoCert Preview
    + '.ec-check-prev{display:flex;flex-direction:column;gap:4px;margin-top:4px}'
    + '.ec-check-row{display:flex;align-items:center;gap:7px;font-size:12.5px}'
    + '.ec-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}'
    + '.ec-dot.ok{background:var(--rr-success)}.ec-dot.nok{background:var(--rr-critical)}'
    + '.ec-dot.na{background:var(--rr-ink-faint)}.ec-dot.offen{background:transparent;border:1.5px dashed var(--rr-ink-muted)}'
    // Preview card
    + '.prev-lbl{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--rr-ink-muted);margin-bottom:14px;display:flex;align-items:center;gap:8px}'
    + '.prev-lbl::after{content:"";flex:1;height:1px;background:var(--rr-rule)}'
    + '.rcard{background:var(--rr-bg);border:1px solid var(--rr-rule);border-radius:10px;padding:24px 26px;box-shadow:var(--rr-shadow-sm)}'
    + '.rcard-header{border-bottom:2px solid var(--rr-accent);padding-bottom:12px;margin-bottom:16px}'
    + '.rcard-title{font-family:var(--rr-font-sans),sans-serif;font-weight:600;font-size:16px;color:var(--accent-deep);letter-spacing:-.01em}'
    + '.rcard-sub{font-size:12px;color:var(--rr-ink-muted);margin-top:3px}'
    + '.rsec{margin-bottom:14px}'
    + '.rsec-lbl{font-size:10.5px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--rr-accent);margin-bottom:4px}'
    + '.rtext{font-family:var(--rr-font-serif),Georgia,serif;font-size:13.5px;line-height:1.72;color:var(--rr-ink);white-space:pre-wrap;min-height:18px}'
    + '.rtext:empty::before{content:"—";color:var(--rr-ink-faint);font-style:italic;font-family:var(--rr-font-sans),sans-serif}'
    // Ampel
    + '.ampel{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}'
    + '.ampel-tag{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:10px;font-size:11.5px;font-weight:600}'
    + '.ampel-tag.ok{background:#ecf7f2;color:var(--rr-success)}'
    + '.ampel-tag.warn{background:#fdf6ec;color:var(--rr-warn)}'
    + '.ampel-tag.alert{background:#fdf0ef;color:var(--rr-critical)}'
    + '.stamp{margin-top:16px;padding-top:12px;border-top:1px solid var(--rr-rule);font-size:11px;color:var(--rr-ink-muted);display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px}'
    // Status badge
    + '.badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:11px;font-size:12px;font-weight:600;margin-top:12px}'
    + '.badge.ok{background:#ecf7f2;color:var(--rr-success)}'
    + '.badge.warn{background:#fdf6ec;color:var(--rr-warn)}'
    + '.badge.alert{background:#fdf0ef;color:var(--rr-critical)}'
    + '.badge.ec{background:var(--endocert-pale);color:var(--endocert)}'
    // Export area toggle fallback
    + '.rr-export-area{display:none;white-space:pre;overflow:auto;max-height:340px}'
    + '.rr-export-area.show{display:block}';
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ---------------------------------------------------------------------------
  // 2. HELPER
  // ---------------------------------------------------------------------------
  var gv = function (id) { var e = document.getElementById(id); return e ? ((e.value || '').trim()) : ''; };
  var gn = function (id) { var e = document.getElementById(id); var v = e ? parseFloat(e.value) : NaN; return isNaN(v) ? null : v; };
  function getCtx() { var r = document.querySelector('input[name=ctx]:checked'); return r ? r.value : 'frueh'; }
  function getSeite() { var r = document.querySelector('input[name=seite]:checked'); return r ? r.value : 're.'; }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var pane = document.querySelector('.rr-input-pane');
  var app = document.querySelector('.rr-app');

  // ---------------------------------------------------------------------------
  // 3. CHROME-INJEKTION
  // ---------------------------------------------------------------------------
  // 3a. Preset-Schnellwahl vor #preset-bar-Anker (Header + Buttons + Hinweis)
  var presetAnchor = document.getElementById('preset-bar');
  if (presetAnchor) {
    presetAnchor.className = 'preset-bar';
    presetAnchor.insertAdjacentHTML('beforebegin',
      '<div class="sh" style="margin-top:0;margin-bottom:8px"><h2 style="font-size:11px">Schnellwahl Implantat-Preset</h2><div class="sh-line"></div></div>');
    presetAnchor.insertAdjacentHTML('afterend',
      '<div class="preset-edit-hint">▸ Weitere Systeme ergänzen: PRESETS-Array in demo.js. Patellaersatz-Varianten oder Schlitten bei Bedarf hinzufügen.</div>');
  }

  // 3b. EndoCert-Badge + Hinweis vor die intraop-Felder
  var intraSection = document.getElementById('intraop-section');
  if (intraSection) {
    intraSection.insertAdjacentHTML('afterbegin',
      '<div class="endocert-badge">✓ EndoCert-Pflichtdokumentation – Knie-TEP-Implantation</div>'
      + '<div class="hint-endocert"><strong>EndoCert:</strong> Röntgen unmittelbar nach Implantation (liegend a.p. + seitlich). Befund muss Implantatposition, Zementierung und Ausschluss unmittelbarer Komplikationen dokumentieren. Befundung retrospektiv durch Radiologen, Output via RIS/PACS.</div>');
  }

  // 3c. Preview-Pane + Aktionen an .rr-app anhängen
  if (app) {
    app.insertAdjacentHTML('beforeend',
      '<aside class="rr-preview-pane">'
      + '<div class="prev-lbl">Befund-Vorschau (Live)</div>'
      + '<div class="rcard">'
      + '<div class="rcard-header" style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">'
      + '<div><div class="rcard-title">Röntgen Knie post-KTEP</div><div class="rcard-sub" id="prev-sub">–</div></div>'
      + '<div class="ec-pill" id="ec-pill">✓ EndoCert</div>'
      + '</div>'
      + '<div class="rsec"><div class="rsec-lbl">Technik</div><div class="rtext" id="prev-technik"></div></div>'
      + '<div class="rsec"><div class="rsec-lbl">Implantat</div><div class="rtext" id="prev-implantat"></div></div>'
      + '<div class="rsec" id="ec-prev-section" style="display:none"><div class="rsec-lbl">EndoCert-Checkliste</div><div class="ec-check-prev" id="prev-ec-checklist"></div></div>'
      + '<div class="rsec"><div class="rsec-lbl">Befund</div><div class="rtext" id="prev-befund"></div></div>'
      + '<div class="rsec"><div class="rsec-lbl" style="color:var(--rr-ink-muted)">Komplikations-Flags (intern – kein Befundtext-Output)</div><div class="ampel" id="prev-ampel"></div></div>'
      + '<div class="rsec"><div class="rsec-lbl">Beurteilung</div><div class="rtext" id="prev-beurt"></div></div>'
      + '<div class="stamp"><span>HJK-MRRT-KNIE-POSTTEP-v1.1</span><span id="prev-date"></span></div>'
      + '</div>'
      + '<div id="status-badge" class="badge warn">● Implantat-Typ ausfüllen</div>'
      + '<div class="rr-actions">'
      + '<button id="btn-copy" type="button">📋 Befundtext kopieren</button>'
      + '<button id="btn-fhir" type="button" class="rr-btn-secondary">{ } FHIR-Export</button>'
      + '<button id="btn-json" type="button" class="rr-btn-secondary">[ ] JSON-Export</button>'
      + '<button id="btn-reset" type="button" class="rr-btn-secondary">↺ Zurücksetzen</button>'
      + '</div>'
      + '<div class="rr-export-area" id="export-box"></div>'
      + '</aside>');
  }

  var prevDate = document.getElementById('prev-date');
  if (prevDate) prevDate.textContent = new Date().toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // ---------------------------------------------------------------------------
  // 4. RENDER: Presets, EndoCert-Checkliste, Ewald, Flags
  // ---------------------------------------------------------------------------
  var activePreset = null;

  function setSelectByValue(id, val) {
    var el = document.getElementById(id);
    if (!el || !val) return;
    for (var i = 0; i < el.options.length; i++) {
      if (el.options[i].value === val) { el.selectedIndex = i; return; }
    }
  }
  function clearPresetActive() {
    activePreset = null;
    [].forEach.call(document.querySelectorAll('.preset-btn'), function (b) { b.classList.remove('active'); });
  }
  function applyPreset(idx) {
    var p = PRESETS[idx];
    if (!p) return;
    setSelectByValue('imp_typ', p.typ);
    setSelectByValue('imp_const', p.const_);
    setSelectByValue('imp_hersteller', p.hersteller);
    setSelectByValue('imp_fix_fem', p.fix_fem);
    setSelectByValue('imp_fix_tib', p.fix_tib);
    setSelectByValue('imp_patella', p.patella);
    var modEl = document.getElementById('imp_modell');
    if (modEl) modEl.value = p.modell;
    [].forEach.call(document.querySelectorAll('.preset-btn'), function (b, i) { b.classList.toggle('active', i === idx); });
    activePreset = idx;
    update();
  }
  function renderPresets() {
    var bar = document.getElementById('preset-bar');
    if (!bar) return;
    bar.innerHTML = '';
    PRESETS.forEach(function (p, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'preset-btn';
      btn.id = 'preset-btn-' + idx;
      btn.innerHTML = '<span class="pb-name">' + escapeHtml(p.label) + '</span><span class="pb-detail">' + escapeHtml(p.detail) + '</span>';
      btn.addEventListener('click', function () { applyPreset(idx); });
      bar.appendChild(btn);
    });
  }

  function getEcVal(id) { var r = document.querySelector('input[name=' + id + ']:checked'); return r ? r.value : ''; }
  function getEcNok() { return EC_CHECKLIST.filter(function (c) { return getEcVal(c.id) === 'nok'; }); }
  function getEcOffen() { return EC_CHECKLIST.filter(function (c) { return getEcVal(c.id) === ''; }); }
  function renderEcChecklist() {
    var wrap = document.getElementById('ec-checklist');
    if (!wrap) return;
    wrap.innerHTML = '';
    EC_CHECKLIST.forEach(function (c) {
      var div = document.createElement('div');
      div.className = 'ec-cl-item';
      div.id = 'ec-wrap-' + c.id;
      div.innerHTML =
        '<div class="ec-cl-inner">'
        + '<input type="radio" name="' + c.id + '" id="' + c.id + '_ok" value="ok">'
        + '<label for="' + c.id + '_ok" class="ec-ok">✓ Ja</label>'
        + '<input type="radio" name="' + c.id + '" id="' + c.id + '_nok" value="nok">'
        + '<label for="' + c.id + '_nok" class="ec-nok">✗ Nein</label>'
        + '<input type="radio" name="' + c.id + '" id="' + c.id + '_na" value="na">'
        + '<label for="' + c.id + '_na" class="ec-na">n.a.</label>'
        + '</div>'
        + '<div class="ec-cl-text"><strong>' + escapeHtml(c.label) + '</strong><span>' + escapeHtml(c.note) + '</span></div>';
      wrap.appendChild(div);
      [].forEach.call(div.querySelectorAll('input[type=radio]'), function (r) {
        r.addEventListener('change', function () {
          var v = getEcVal(c.id);
          var w = document.getElementById('ec-wrap-' + c.id);
          w.classList.remove('ok', 'nok');
          if (v === 'ok') w.classList.add('ok');
          if (v === 'nok') w.classList.add('nok');
          update();
        });
      });
    });
  }

  function renderEwald() {
    var tbody = document.getElementById('ewald-tbody');
    if (!tbody) return;
    tbody.innerHTML =
      '<tr><td class="zone-lbl" colspan="4" style="background:var(--rr-accent-pale);color:var(--accent-deep);font-size:11px;padding:5px 8px;letter-spacing:.04em">FEMURKOMPONENTE (anterior → posterior)</td></tr>';
    var lastGrp = '';
    EWALD_ZONES.forEach(function (z) {
      if (z.grp !== lastGrp) {
        lastGrp = z.grp;
        var hdr = document.createElement('tr');
        hdr.innerHTML = '<td class="zone-lbl" colspan="4" style="background:var(--rr-bg-alt);color:var(--rr-ink-muted);font-size:10.5px;padding:4px 8px;letter-spacing:.04em">' + z.grp + '</td>';
        tbody.appendChild(hdr);
      }
      var lyseOpts = LYSESAUM_OPTS.map(function (o) { return '<option value="' + o.v + '">' + o.t + '</option>'; }).join('');
      var ostyOpts = OSTEOLYSE_OPTS.map(function (o) { return '<option value="' + o.v + '">' + o.t + '</option>'; }).join('');
      var verlOpts = VERLAUF_OPTS.map(function (o) { return '<option value="' + o.v + '">' + o.t + '</option>'; }).join('');
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="zone-lbl">' + z.label + '</td>'
        + '<td><select id="' + z.id + '_lyse">' + lyseOpts + '</select></td>'
        + '<td><select id="' + z.id + '_ost">' + ostyOpts + '</select></td>'
        + '<td><select id="' + z.id + '_verl">' + verlOpts + '</select></td>';
      tbody.appendChild(tr);
    });
  }

  function updateFlagStyle(id) {
    var cb = document.getElementById(id);
    var wrap = document.getElementById('flag-wrap-' + id);
    if (cb && wrap) wrap.classList.toggle('active', cb.checked);
  }
  function getActiveFlags() { return FLAGS.filter(function (f) { var e = document.getElementById(f.id); return e && e.checked; }); }
  function renderFlags() {
    var grid = document.getElementById('flag-grid');
    if (!grid) return;
    grid.innerHTML = '';
    FLAGS.forEach(function (f) {
      var div = document.createElement('label');
      div.className = 'flag-item';
      div.id = 'flag-wrap-' + f.id;
      div.innerHTML = '<input type="checkbox" id="' + f.id + '"><div class="flag-lbl"><strong>' + escapeHtml(f.label) + '</strong>' + escapeHtml(f.note) + '</div>';
      grid.appendChild(div);
      var cb = div.querySelector('input');
      cb.addEventListener('change', function () { updateFlagStyle(f.id); update(); });
    });
  }

  // ---------------------------------------------------------------------------
  // 5. KONTEXT-LOGIK
  // ---------------------------------------------------------------------------
  function updateCtxHint() {
    var ctx = getCtx();
    var hints = {
      intraop: '<strong>Intraoperativ / unmittelbar postoperativ (EndoCert):</strong> Liegend a.p. + seitlich. Retrospektive Befundung durch Radiologen via RIS/PACS. EndoCert-Checkliste vollständig ausfüllen.',
      frueh: '<strong>Früh-postoperativ (0–6 Wo):</strong> Implantat-Position, Komplikationsausschluss, Vergleich mit intraoperativem Röntgen.',
      verlauf: '<strong>Verlaufskontrolle (6 Wo – 2 Jahre):</strong> Osseointegration, Achsstabilität, periprothetische Lysesäume im Verlauf.',
      revision: '<strong>Revisionsverdacht:</strong> Loosening, periprothetische Infektion, Malalignment – klinische Korrelation essenziell.'
    };
    var ch = document.getElementById('ctx-hint');
    if (ch) ch.innerHTML = hints[ctx];
    var show = function (id, on) { var e = document.getElementById(id); if (e) e.style.display = on ? '' : 'none'; };
    show('intraop-section', ctx === 'intraop');
    show('peri-section', ctx !== 'intraop');
    show('bone-section', ctx !== 'intraop');
    show('komp-section', ctx !== 'intraop');
    var aih = document.getElementById('align-intraop-hint');
    if (aih) {
      aih.style.display = ctx === 'intraop' ? '' : 'none';
      aih.innerHTML = ctx === 'intraop'
        ? '<div class="hint-endocert" style="background:var(--rr-accent-pale);border-left-color:var(--rr-accent);color:var(--rr-ink-soft)"><strong style="color:var(--rr-accent)">Intraoperativ:</strong> Quantitative Winkelmessung nicht seriös beurteilbar (Liegendaufnahme, keine Kalibrierung). Nur qualitative Gesamteinschätzung dokumentieren.</div>'
        : '';
    }
    show('verlauf-section', ctx === 'verlauf' || ctx === 'revision');
    var pill = document.getElementById('ec-pill');
    if (pill) pill.classList.toggle('show', ctx === 'intraop');
    show('ec-prev-section', ctx === 'intraop');
  }

  // ---------------------------------------------------------------------------
  // 6. TEXT-BUILDER
  // ---------------------------------------------------------------------------
  function buildTechnik() {
    var ctx = getCtx();
    var ap = gv('pr_ap');
    var lat = gv('pr_lat') === 'ja' ? ', seitlich' : '';
    var pat = gv('pr_pat') === 'ja' ? ', Patella axial' : '';
    var lla = gv('pr_lla') !== 'nein' ? ', Ganzbein-Standaufnahme (kalibriert)' : '';
    var q = gv('qual');
    var op = gv('op_datum');
    var pop = gv('pop_tag');

    if (ctx === 'intraop') {
      var zt = gv('io_zeitpunkt') || 'unmittelbar intraoperativ';
      var ope = gv('io_operateur');
      var t = 'Röntgen Knie ' + getSeite() + ', ' + zt + ', liegend a.p. + seitlich. Aufnahmequalität ' + q + '.';
      if (op) t += ' OP-Datum: ' + op + '.';
      if (ope) t += ' Operateur: ' + ope + '.';
      return t;
    }

    var tt = 'Röntgen Knie ' + getSeite() + (ap ? ' (' + ap + ')' : '') + lat + pat + lla + '. Aufnahmequalität ' + q + '.';
    if (op || pop) tt += ' OP-Datum: ' + (op || '–') + (pop ? ', ' + pop : '') + '.';
    var vu = gv('vu_ja');
    if (vu) {
      var vuDat = gv('vu_datum');
      tt += ' Vergleich: ' + (vu === 'intraoperativ' ? 'intraoperatives Röntgen' : vu + (vuDat ? ' vom ' + vuDat : '')) + '.';
    }
    return tt;
  }

  function buildImplantat() {
    var typ = gv('imp_typ'), con = gv('imp_const'), her = gv('imp_hersteller'),
        mod = gv('imp_modell'), fixF = gv('imp_fix_fem'), fixT = gv('imp_fix_tib'), pat = gv('imp_patella');
    var s = '' + typ;
    if (con) s += ', ' + con;
    if (her || mod) s += ' (' + [her, mod].filter(Boolean).join(', ') + ')';
    s += '. Fixation: Femur ' + fixF + ', Tibia ' + fixT + '. ' + pat + '.';
    return s;
  }

  function buildBefund() {
    var lines = [];
    var ctx = getCtx();

    if (ctx === 'intraop') {
      var clItems = EC_CHECKLIST.map(function (c) {
        var v = getEcVal(c.id);
        var sym = v === 'ok' ? '✓' : v === 'nok' ? '✗' : v === 'na' ? '(n.a.)' : '○';
        return sym + ' ' + c.label;
      });
      lines.push('EndoCert-Checkliste:\n' + clItems.join('\n'));
    }

    var femCorQ = gv('fem_cor_q'), femSag = gv('fem_sag'), femNotch = gv('fem_notch'),
        tibCorQ = gv('tib_cor_q'), tibSlope = gv('tib_slope'), tibPos = gv('tib_pos'),
        alignGes = gv('align_ges'), hkaPost = gn('hka_post'), femCor = gn('fem_cor'), tibCor = gn('tib_cor');

    var komp = 'Komponentenstellung:';
    komp += ' Femurkomponente coronar ' + femCorQ + (femCor !== null ? ' (' + femCor.toFixed(1) + '°)' : '') + ', ' + femSag + '.';
    komp += ' ' + femNotch + '.';
    komp += ' Tibiakomponente coronar ' + tibCorQ + (tibCor !== null ? ' (' + tibCor.toFixed(1) + '°)' : '') + ', tibialer Slope ' + tibSlope + ', Position ' + tibPos + '.';
    lines.push(komp);

    var hka_txt = hkaPost !== null ? ' (HKA ' + hkaPost.toFixed(1) + '°)' : '';
    lines.push('Postoperative Gesamtachse: ' + alignGes + hka_txt + '.');

    lines.push('Periprothetische Beurteilung: ' + gv('peri_ges') + '.');

    var ewald_auff = [];
    EWALD_ZONES.forEach(function (z) {
      var lyse = (document.getElementById(z.id + '_lyse') || {}).value;
      var ost = (document.getElementById(z.id + '_ost') || {}).value;
      var verl = (document.getElementById(z.id + '_verl') || {}).value;
      if (lyse === '3' || lyse === '2' || ost === 'fokal' || ost === 'ausgedehnt' || verl === 'progredient' || verl === 'neu') {
        var s = z.label;
        if (lyse && lyse !== 'neg') { var lo = LYSESAUM_OPTS.filter(function (o) { return o.v === lyse; })[0]; s += ': Lysesaum ' + (lo ? lo.t : lyse); }
        if (ost && ost !== 'neg') s += ', Osteolyse ' + ost;
        if (verl && verl !== 'stabil') s += ', ' + verl;
        ewald_auff.push(s);
      }
    });
    if (ewald_auff.length) lines.push('Auffällige Zonen: ' + ewald_auff.join('; ') + '.');

    var zemFem = gv('zem_fem'), zemTib = gv('zem_tib');
    if (zemFem || zemTib) lines.push('Zementmantel: ' + [zemFem, zemTib].filter(Boolean).join('; ') + '.');

    var patH = gv('pat_hoehe'), patZ = gv('pat_zentr'), patK = gv('pat_komp');
    if (patH || patZ || patK) lines.push('Patella: ' + [patH, patZ, patK].filter(Boolean).join(', ') + '.');

    lines.push('Ossäre Strukturen: ' + gv('bone_q') + '. ' + gv('erguss') + '. ' + gv('hto') + '.');

    var verlQ = gv('verlauf_q');
    if (verlQ) lines.push(verlQ);

    var ft = gv('freetext');
    if (ft) lines.push(ft);

    return lines.join('\n');
  }

  function updateAmpel() {
    var flags = getActiveFlags();
    var ampel = document.getElementById('prev-ampel');
    if (!ampel) return;
    ampel.innerHTML = '';
    if (!flags.length) { ampel.innerHTML = '<span class="ampel-tag ok">✓ Keine Komplikations-Flags</span>'; return; }
    flags.forEach(function (f) {
      var tag = document.createElement('span');
      tag.className = 'ampel-tag ' + f.sev;
      tag.textContent = (f.sev === 'alert' ? '⚠ ' : '● ') + f.label;
      ampel.appendChild(tag);
    });
  }

  function buildBeurtVorschlag() {
    var ctx = getCtx(), s = getSeite(), typ = gv('imp_typ'), her = gv('imp_hersteller'),
        mod = gv('imp_modell'), con = gv('imp_const'), pop = gv('pop_tag'),
        align = gv('align_ges'), peri = gv('peri_ges');

    if (ctx === 'intraop') {
      var zt = gv('io_zeitpunkt') || 'intraoperativ';
      var fixF = gv('imp_fix_fem');
      var nok = getEcNok();
      var v = 'Röntgen Knie ' + s + ' ' + zt + ' nach ' + typ;
      if (con) v += ' (' + con;
      if (her || mod) v += ', ' + [her, mod].filter(Boolean).join(', ');
      if (con || her || mod) v += ')';
      v += ', ' + fixF + '. ' + align + '.';
      if (nok.length) v += ' EndoCert-Punkte nicht erfüllt: ' + nok.map(function (c) { return c.label; }).join(', ') + '.';
      else v += ' Alle EndoCert-Kernpunkte erfüllt.';
      v += ' Kein Hinweis auf unmittelbare Komplikation.';
      return v;
    }

    var vv = 'Röntgen Knie ' + s + ' postoperativ nach ' + typ;
    if (con) vv += ' (' + con;
    if (her || mod) vv += ', ' + [her, mod].filter(Boolean).join(', ');
    if (con || her || mod) vv += ')';
    if (pop) vv += ', ' + pop;
    vv += '. ' + align + '. ' + peri + '.';
    vv += ' Kein Hinweis auf ' + (ctx === 'frueh' ? 'Früh-Komplikation.' : 'Implantat-Komplikation.');
    return vv;
  }

  // ---------------------------------------------------------------------------
  // 7. MAIN UPDATE / RENDER
  // ---------------------------------------------------------------------------
  function setText(id, txt) { var e = document.getElementById(id); if (e) e.textContent = txt; }

  function update() {
    var ctx = getCtx();
    var ctxLabel = ctx === 'intraop' ? 'Intraoperativ (EndoCert)' : ctx === 'frueh' ? 'Früh-postop' : ctx === 'verlauf' ? 'Verlauf' : 'Revisionsverdacht';
    setText('prev-sub', 'Knie ' + getSeite() + ' · ' + ctxLabel);
    setText('prev-technik', buildTechnik());
    setText('prev-implantat', buildImplantat());
    setText('prev-befund', buildBefund());
    setText('prev-beurt', gv('beurt') || '—');
    updateAmpel();

    if (ctx === 'intraop') {
      var prev = document.getElementById('prev-ec-checklist');
      if (prev) {
        prev.innerHTML = '';
        EC_CHECKLIST.forEach(function (c) {
          var v = getEcVal(c.id);
          var row = document.createElement('div');
          row.className = 'ec-check-row';
          var dot = document.createElement('div');
          dot.className = 'ec-dot ' + (v === 'ok' ? 'ok' : v === 'nok' ? 'nok' : v === 'na' ? 'na' : 'offen');
          var txt = document.createElement('span');
          var prefix = v === 'ok' ? '✓ ' : v === 'nok' ? '✗ Nicht erfüllt: ' : v === 'na' ? 'n.a.: ' : '○ Offen: ';
          txt.textContent = prefix + c.label;
          txt.style.color = v === 'nok' ? 'var(--rr-critical)' : v === 'ok' ? 'var(--rr-success)' : 'var(--rr-ink-soft)';
          row.appendChild(dot); row.appendChild(txt); prev.appendChild(row);
        });
      }
    }

    // Beurteilungs-Vorschlag
    var vbox = document.getElementById('beurt-vorschlag');
    if (vbox) {
      if (!gv('beurt')) {
        var vorschlag = buildBeurtVorschlag();
        vbox.innerHTML = '<div class="rr-helper-info" id="beurt-vorschlag-apply" style="cursor:pointer" title="Klicken um zu übernehmen"><strong>Vorschlag (klicken zum Übernehmen):</strong><br>' + escapeHtml(vorschlag) + '</div>';
        vbox.dataset.suggestion = vorschlag;
        vbox.style.marginBottom = '10px';
      } else { vbox.innerHTML = ''; delete vbox.dataset.suggestion; }
    }

    // Status-Badge
    var hasImp = gv('imp_typ') !== '';
    var hasBeurt = gv('beurt').length > 10;
    var flags = getActiveFlags();
    var badge = document.getElementById('status-badge');
    if (!badge) return;

    if (ctx === 'intraop') {
      var nok = getEcNok(), offen = getEcOffen();
      var alertF = flags.filter(function (f) { return f.sev === 'alert'; });
      if (alertF.length) { badge.className = 'badge alert'; badge.textContent = '⚠ Komplikations-Flag aktiv'; }
      else if (nok.length) { badge.className = 'badge alert'; badge.textContent = '✗ ' + nok.length + ' EndoCert-Punkt(e) nicht erfüllt'; }
      else if (offen.length) { badge.className = 'badge warn'; badge.textContent = '● ' + offen.length + ' EndoCert-Punkt(e) offen'; }
      else if (!hasBeurt) { badge.className = 'badge warn'; badge.textContent = '● Beurteilung fehlt'; }
      else { badge.className = 'badge ec'; badge.textContent = '✓ EndoCert-konform – vollständig'; }
      return;
    }

    if (!hasImp) { badge.className = 'badge warn'; badge.textContent = '● Implantat-Typ ausfüllen'; }
    else if (!hasBeurt) { badge.className = 'badge warn'; badge.textContent = '● Beurteilung fehlt'; }
    else if (flags.some(function (f) { return f.sev === 'alert'; })) { badge.className = 'badge alert'; badge.textContent = '⚠ Komplikations-Flag aktiv'; }
    else if (flags.length) { badge.className = 'badge warn'; badge.textContent = '● Flag-Befund vorhanden'; }
    else { badge.className = 'badge ok'; badge.textContent = '✓ Vollständig'; }
  }

  // ---------------------------------------------------------------------------
  // 8. EXPORTS
  // ---------------------------------------------------------------------------
  function buildFhir() {
    var now = new Date().toISOString();
    var obsArr = [];
    var idx = 0;

    var addObs = function (rid, en, val, loinc, unit) {
      if (val === null || val === undefined || val === '') return;
      idx++;
      var coding = [];
      if (rid) coding.push({ system: 'http://radlex.org', code: rid, display: en });
      if (loinc) coding.push({ system: 'http://loinc.org', code: loinc, display: en });
      var obs = {
        resourceType: 'Observation', status: 'final', id: 'obs-' + idx,
        code: { coding: coding },
        valueQuantity: typeof val === 'number' ? { value: val, unit: unit || '' } : undefined,
        valueString: typeof val === 'string' ? val : undefined
      };
      obsArr.push({ fullUrl: 'urn:uuid:obs-' + idx, resource: obs });
    };
    var optData = function (id, key) {
      var el = document.getElementById(id);
      if (!el) return '';
      var o = el.options[el.selectedIndex];
      return o && o.dataset ? (o.dataset[key] || '') : '';
    };

    addObs(optData('imp_typ', 'radlex') || 'RID49700', optData('imp_typ', 'en') || 'knee arthroplasty type', gv('imp_typ'), null, null);
    addObs(optData('imp_const', 'radlex') || 'RID49706', optData('imp_const', 'en') || 'constraint', gv('imp_const'), null, null);
    addObs('RID49730', 'femoral component coronal alignment', gn('fem_cor'), null, '°');
    addObs('RID49750', 'tibial component coronal alignment', gn('tib_cor'), null, '°');
    addObs('RID49504', 'hip-knee-ankle angle postoperative', gn('hka_post'), 'LP410789-0', '°');
    addObs(optData('align_ges', 'radlex') || 'RID49770', optData('align_ges', 'en') || 'postoperative alignment', gv('align_ges'), null, null);
    addObs(optData('peri_ges', 'radlex') || 'RID49790', optData('peri_ges', 'en') || 'periprosthetic assessment', gv('peri_ges'), null, null);

    getActiveFlags().forEach(function (f) {
      idx++;
      obsArr.push({ fullUrl: 'urn:uuid:obs-' + idx, resource: {
        resourceType: 'Observation', status: 'final', id: 'obs-' + idx,
        code: { coding: [{ system: 'http://radlex.org', code: f.rid, display: f.en }] },
        valueString: 'KOMPLIKATIONS-FLAG: ' + f.label,
        interpretation: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'A', display: 'Abnormal' }] }]
      } });
    });

    var dr = {
      resourceType: 'DiagnosticReport', status: 'final', id: 'knee-posttep-report',
      code: { coding: [{ system: 'http://loinc.org', code: '24650-4', display: 'Knee X-ray AP and Lateral' }] },
      effectiveDateTime: now,
      identifier: [{ value: 'HJK-MRRT-KNIE-POSTTEP-v1.1' }],
      conclusion: gv('beurt'),
      result: obsArr.map(function (o) { return { reference: o.fullUrl }; }),
      presentedForm: [{ contentType: 'text/plain', title: 'Röntgen Knie post-KTEP',
        data: btoa(unescape(encodeURIComponent('TECHNIK\n' + buildTechnik() + '\n\nIMPLANTAT\n' + buildImplantat() + '\n\nBEFUND\n' + buildBefund() + '\n\nBEURTEILUNG\n' + gv('beurt')))) }]
    };

    return JSON.stringify({
      resourceType: 'Bundle', type: 'document', timestamp: now,
      meta: { tag: [{ system: 'http://hjk.wien/fhir/CodeSystem/radiology-templates', code: 'radlex-coded' }] },
      entry: [{ fullUrl: 'urn:uuid:knee-posttep-report', resource: dr }].concat(obsArr)
    }, null, 2);
  }

  function buildJson() {
    return JSON.stringify({
      id: 'HJK-MRRT-KNIE-POSTTEP-v1.1',
      timestamp: new Date().toISOString(),
      kontext: getCtx(), seite: getSeite(),
      implantat: { typ: gv('imp_typ'), constraint: gv('imp_const'), hersteller: gv('imp_hersteller'), modell: gv('imp_modell'), fixation: { femur: gv('imp_fix_fem'), tibia: gv('imp_fix_tib') }, patellaersatz: gv('imp_patella') },
      op_datum: gv('op_datum'), pop_tag: gv('pop_tag'),
      komponentenstellung: { femur: { coronar_grad: gn('fem_cor'), coronar_q: gv('fem_cor_q'), sagittal: gv('fem_sag'), notching: gv('fem_notch') }, tibia: { coronar_grad: gn('tib_cor'), coronar_q: gv('tib_cor_q'), slope: gv('tib_slope'), position: gv('tib_pos') }, hka_post: gn('hka_post'), alignment_gesamt: gv('align_ges') },
      periprothetisch: { gesamtbeurteilung: gv('peri_ges'), ewald_zonen: EWALD_ZONES.reduce(function (acc, z) { acc[z.id] = { lyse: (document.getElementById(z.id + '_lyse') || {}).value, ost: (document.getElementById(z.id + '_ost') || {}).value, verlauf: (document.getElementById(z.id + '_verl') || {}).value }; return acc; }, {}) },
      komplikations_flags: getActiveFlags().map(function (f) { return { id: f.id, label: f.label, rid: f.rid, severity: f.sev }; }),
      weichteile: { erguss: gv('erguss'), hto: gv('hto'), knochenstruktur: gv('bone_q') },
      beurteilung: gv('beurt'),
      fliesstext: { technik: buildTechnik(), implantat: buildImplantat(), befund: buildBefund(), beurteilung: gv('beurt') }
    }, null, 2);
  }

  var lastExport = '';
  function toggleExport(type) {
    var box = document.getElementById('export-box');
    if (!box) return;
    var content = type === 'fhir' ? buildFhir() : buildJson();
    if (box.classList.contains('show') && lastExport === type) { box.classList.remove('show'); lastExport = ''; return; }
    box.textContent = content; box.classList.add('show'); lastExport = type;
  }

  function buildReport() {
    return 'RÖNTGEN KNIE POST-KTEP\n'
      + new Date().toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + '\n\nTECHNIK\n' + buildTechnik()
      + '\n\nIMPLANTAT\n' + buildImplantat()
      + '\n\nBEFUND\n' + buildBefund()
      + '\n\nBEURTEILUNG\n' + gv('beurt');
  }
  function legacyCopy(t) {
    var el = document.createElement('textarea'); el.value = t; document.body.appendChild(el);
    el.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(el);
  }
  function copyReport(btn) {
    var t = buildReport();
    var done = function () { if (btn) { btn.textContent = '✓ Kopiert!'; setTimeout(function () { btn.textContent = '📋 Befundtext kopieren'; }, 2000); } };
    if (navigator.clipboard) { navigator.clipboard.writeText(t).then(done, function () { legacyCopy(t); done(); }); }
    else { legacyCopy(t); done(); }
  }

  function resetAll() {
    if (!window.confirm('Alle Eingaben zurücksetzen?')) return;
    [].forEach.call(document.querySelectorAll('select'), function (s) { s.selectedIndex = 0; });
    [].forEach.call(document.querySelectorAll('textarea, input[type=text], input[type=number]'), function (i) { i.value = ''; });
    [].forEach.call(document.querySelectorAll('input[type=checkbox]'), function (c) { c.checked = false; });
    EC_CHECKLIST.forEach(function (c) {
      [].forEach.call(document.querySelectorAll('input[name=' + c.id + ']'), function (r) { r.checked = false; });
      var w = document.getElementById('ec-wrap-' + c.id);
      if (w) w.classList.remove('ok', 'nok');
    });
    FLAGS.forEach(function (f) { var w = document.getElementById('flag-wrap-' + f.id); if (w) w.classList.remove('active'); });
    clearPresetActive();
    var sre = document.getElementById('s_re'); if (sre) sre.checked = true;
    var cf = document.getElementById('ctx_frueh'); if (cf) cf.checked = true;
    var vdr = document.getElementById('vu_datum_row'); if (vdr) vdr.style.display = 'none';
    var box = document.getElementById('export-box'); if (box) { box.classList.remove('show'); box.textContent = ''; }
    lastExport = '';
    updateCtxHint();
    update();
  }

  // ---------------------------------------------------------------------------
  // 9. EVENT-VERDRAHTUNG (addEventListener, kein Inline-onclick)
  // ---------------------------------------------------------------------------
  document.addEventListener('input', update);
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t && t.name === 'ctx') { updateCtxHint(); update(); return; }
    if (t && t.name === 'seite') { update(); return; }
    if (t && t.id === 'vu_ja') {
      var vdr = document.getElementById('vu_datum_row');
      if (vdr) vdr.style.display = t.value ? '' : 'none';
      update(); return;
    }
    if (t && ['imp_typ', 'imp_const', 'imp_hersteller', 'imp_fix_fem', 'imp_fix_tib', 'imp_patella'].indexOf(t.id) > -1) {
      clearPresetActive();
    }
    update();
  });
  // Manuelle Modell-Änderung deaktiviert aktiven Preset
  var modInput = document.getElementById('imp_modell');
  if (modInput) modInput.addEventListener('input', clearPresetActive);

  // Vorschlag klickbar übernehmen
  document.addEventListener('click', function (e) {
    var v = e.target.closest && e.target.closest('#beurt-vorschlag-apply');
    if (v) {
      var box = document.getElementById('beurt-vorschlag');
      var beurt = document.getElementById('beurt');
      if (box && beurt && box.dataset.suggestion) { beurt.value = box.dataset.suggestion; update(); }
    }
  });

  // Buttons
  var bc = document.getElementById('btn-copy'); if (bc) bc.addEventListener('click', function () { copyReport(bc); });
  var bf = document.getElementById('btn-fhir'); if (bf) bf.addEventListener('click', function () { toggleExport('fhir'); });
  var bj = document.getElementById('btn-json'); if (bj) bj.addEventListener('click', function () { toggleExport('json'); });
  var br = document.getElementById('btn-reset'); if (br) br.addEventListener('click', resetAll);

  // ---------------------------------------------------------------------------
  // INIT
  // ---------------------------------------------------------------------------
  renderPresets();
  renderEcChecklist();
  renderEwald();
  renderFlags();
  updateCtxHint();
  update();
})();
