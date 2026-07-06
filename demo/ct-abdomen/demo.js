// =============================================================================
// Demo-Interaktivität für "CT Abdomen + Becken" (v2.0)
//
// ABGELEITET / Demo-Schicht: gehört NICHT ins kanonische template.html (nacktes,
// JS-freies, form-only MRRT). Baut das Viewer-Chrome zur Laufzeit:
//   - Organ-Navigation (Tabs aus data-organ-Panels)
//   - Segmentierte Notfall-Checkliste (pos/neg-Highlight)
//   - RECIST-1.1-SLD-Summe (aus deklarativen Zeilen)
//   - Live-Vorschau-Pane + Ampel-Status
//   - Textbausteine (Technik / Befund / Notfall / Beurteilungsvorschlag)
//   - FHIR-R4-Export + Kopier-/Reset-Buttons
//
// Der frühere 3-Kontext-Modiswitch (allg/notfall/onko) ist AUFGELÖST: Notfall-
// Checkliste und onkologischer Kontext/RECIST sind im kanonischen Template
// optionale <details>-Sektionen, immer zugänglich. Die Textbausteine schalten
// inhaltsgetrieben (Notfall-Positiva bzw. RECIST-Daten vorhanden), nicht mehr
// über einen Modus. Eingebunden via build-demo.js in demo/index.html.
// =============================================================================

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. DEMO-STYLING (Core kennt die Template-Widgets nicht)
  // ---------------------------------------------------------------------------
  var css = ''
    + ':root{--nf-crit:var(--rr-critical,#c0392b);--nf-ok:var(--rr-success,#2d8a4f);}'
    + '.rr-app{display:grid;grid-template-columns:minmax(540px,1fr) minmax(400px,500px);align-items:start;max-width:1640px;margin:0 auto;}'
    + '@media(max-width:1120px){.rr-app{grid-template-columns:1fr;}}'
    + '.rr-input-pane{padding:40px 48px 120px;}'
    + '.rr-phase-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:5px;}'
    + '.rr-phase-chips input[type=checkbox]{display:none;}'
    + '.rr-phase-chips label{padding:5px 13px;border-radius:18px;border:1px solid var(--rr-field-border,#ccc);font-size:12.5px;color:var(--rr-ink-soft,#556);cursor:pointer;transition:all .15s;user-select:none;}'
    + '.rr-phase-chips input:checked+label{background:var(--rr-accent,#31708f);color:#fff;border-color:var(--rr-accent,#31708f);font-weight:500;}'
    + '.rr-phase-chips label:hover{border-color:var(--rr-accent,#31708f);color:var(--rr-accent,#31708f);}'
    + '.rr-checkgroup{display:flex;flex-wrap:wrap;gap:7px 14px;margin-top:4px;}'
    + '.rr-check{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;color:var(--rr-ink-soft,#445);}'
    + '.rr-check input{width:14px;height:14px;accent-color:var(--rr-accent,#31708f);cursor:pointer;}'
    // Optional-Sektionen (<details>)
    + '.rr-section-optional{margin:14px 0;}'
    + '.rr-section-optional>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--rr-bg-alt,#f4f5f6);border:1px solid var(--rr-rule,#e2e5e8);border-radius:var(--rr-radius,7px);font-size:13px;font-weight:600;color:var(--rr-ink-soft,#445);user-select:none;}'
    + '.rr-section-optional>summary::-webkit-details-marker{display:none;}'
    + '.rr-section-optional>summary::before{content:"\\25B6";font-size:9px;color:var(--rr-ink-faint,#99a);transition:transform .15s;}'
    + '.rr-section-optional[open]>summary::before{transform:rotate(90deg);}'
    + '.rr-section-optional>summary:hover{border-color:var(--rr-accent,#31708f);color:var(--rr-accent,#31708f);}'
    + '.rr-details-body{padding:14px 4px 4px;}'
    + '.rr-section-optional .rr-field-note{font-weight:400;margin-left:2px;}'
    // Notfall-Grid
    + '.rr-nf-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:6px 0 4px;}'
    + '@media(max-width:640px){.rr-nf-grid{grid-template-columns:1fr;}}'
    + '.rr-nf-item{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--rr-bg-alt,#f6f7f8);border:1px solid var(--rr-rule,#e2e5e8);border-radius:var(--rr-radius,7px);padding:9px 12px;margin:0;transition:all .15s;}'
    + '.rr-nf-item.is-pos{border-color:var(--nf-crit);background:#fdf0ef;}'
    + '.rr-nf-item.is-neg{border-color:var(--nf-ok);background:#ecf7f2;}'
    + '.rr-nf-text strong{display:block;font-size:13px;color:var(--rr-ink,#222);font-weight:600;}'
    + '.rr-nf-text span{font-size:11px;color:var(--rr-ink-muted,#778);line-height:1.35;}'
    + '.rr-nf-seg{display:flex;border:1px solid var(--rr-field-border,#ccc);border-radius:5px;overflow:hidden;flex-shrink:0;}'
    + '.rr-nf-seg input[type=radio]{display:none;}'
    + '.rr-nf-seg label{padding:4px 9px;font-size:11.5px;font-weight:600;cursor:pointer;color:var(--rr-ink-muted,#778);border-right:1px solid var(--rr-field-border,#ccc);white-space:nowrap;}'
    + '.rr-nf-seg label:last-of-type{border-right:none;}'
    + '.rr-nf-seg input:checked+label.rr-nf-pos{background:var(--nf-crit);color:#fff;}'
    + '.rr-nf-seg input:checked+label.rr-nf-neg{background:var(--nf-ok);color:#fff;}'
    + '.rr-nf-seg input:checked+label.rr-nf-na{background:var(--rr-ink-muted,#889);color:#fff;}'
    // RECIST-Tabelle
    + '.rr-recist-tbl{width:100%;border-collapse:collapse;font-size:13px;margin:8px 0 14px;}'
    + '.rr-recist-tbl th{text-align:left;padding:7px 9px;background:var(--rr-accent,#31708f);color:#fff;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;}'
    + '.rr-recist-tbl td{padding:5px 8px;border:1px solid var(--rr-rule,#e2e5e8);vertical-align:middle;}'
    + '.rr-recist-tbl td:first-child{font-weight:600;color:var(--rr-accent,#31708f);text-align:center;width:28px;}'
    + '.rr-recist-tbl input,.rr-recist-tbl select{border:none;background:transparent;padding:3px 4px;font-size:12.5px;width:100%;min-width:56px;font-family:inherit;color:var(--rr-ink,#222);}'
    + '.rr-recist-tbl input:focus,.rr-recist-tbl select:focus{background:var(--rr-accent-pale,#eef4f7);border-radius:3px;outline:none;}'
    + '.rr-recist-sumlbl{text-align:right;font-weight:600;font-size:12px;color:var(--rr-ink-soft,#445);}'
    + '.rr-recist-sumval{font-weight:700;color:var(--rr-accent,#31708f);font-size:14px;}'
    // Organ-Navigation
    + '.rr-organ-nav{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0 16px;}'
    + '.rr-organ-tab{padding:5px 12px;border-radius:16px;border:1px solid var(--rr-field-border,#ccc);font-size:12.5px;color:var(--rr-ink-muted,#778);cursor:pointer;transition:all .15s;user-select:none;background:var(--rr-bg,#fff);}'
    + '.rr-organ-tab:hover{border-color:var(--rr-accent,#31708f);color:var(--rr-accent,#31708f);}'
    + '.rr-organ-tab.is-active{background:var(--rr-accent,#31708f);color:#fff;border-color:var(--rr-accent,#31708f);font-weight:500;}'
    + '.rr-organ-tab.is-flagged{border-color:var(--rr-warn,#c88a00);color:var(--rr-warn,#c88a00);background:#fdf6ec;}'
    + '.rr-organ-tab.is-flagged.is-active{background:var(--rr-warn,#c88a00);color:#fff;}'
    + '.rr-organ-panel{display:none;}'
    + '.rr-organ-panel.is-active{display:block;}'
    // Vorschau-Pane
    + '.rr-preview-pane{padding:40px 40px 120px;background:var(--rr-bg-alt,#f4f5f6);position:sticky;top:0;align-self:start;max-height:100vh;overflow-y:auto;}'
    + '.rr-preview-title{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--rr-ink-muted,#778);margin-bottom:14px;}'
    + '.rr-rcard{background:var(--rr-bg,#fff);border:1px solid var(--rr-rule,#e2e5e8);border-radius:10px;padding:22px 24px;box-shadow:var(--rr-shadow-sm,0 1px 3px rgba(0,0,0,.06));}'
    + '.rr-rcard-header{border-bottom:2px solid var(--rr-accent,#31708f);padding-bottom:11px;margin-bottom:15px;}'
    + '.rr-rcard-title{font-weight:600;font-size:16px;color:var(--rr-accent,#31708f);}'
    + '.rr-rcard-sub{font-size:11.5px;color:var(--rr-ink-muted,#778);margin-top:3px;}'
    + '.rr-rsec{margin-bottom:13px;}'
    + '.rr-rsec-lbl{font-size:10.5px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--rr-accent,#31708f);margin-bottom:4px;}'
    + '.rr-rsec-lbl.crit{color:var(--nf-crit);}'
    + '.rr-rtext{font-family:var(--rr-font-serif,Georgia,serif);font-size:13px;line-height:1.7;color:var(--rr-ink,#222);white-space:pre-wrap;min-height:14px;}'
    + '.rr-rtext:empty::before{content:"\\2014";color:var(--rr-ink-faint,#99a);font-family:var(--rr-font-sans,sans-serif);}'
    + '.rr-stamp{margin-top:14px;padding-top:11px;border-top:1px solid var(--rr-rule,#e2e5e8);font-size:11px;color:var(--rr-ink-muted,#778);display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;}'
    + '.rr-status-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:11px;font-size:12px;font-weight:600;margin-top:12px;}'
    + '.rr-status-badge.ok{background:#ecf7f2;color:var(--nf-ok);}'
    + '.rr-status-badge.warn{background:#fdf6ec;color:var(--rr-warn,#c88a00);}'
    + '.rr-status-badge.alert{background:#fdf0ef;color:var(--nf-crit);}'
    + '.rr-vorschlag{cursor:pointer;margin:10px 0;}'
    + '.rr-ebox{display:none;margin-top:14px;background:#1a2535;color:#93b8d4;border-radius:var(--rr-radius,7px);padding:16px 18px;font-family:var(--rr-font-mono,monospace);font-size:11px;white-space:pre;overflow:auto;max-height:340px;line-height:1.55;}'
    + '.rr-ebox.is-open{display:block;}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var pane = document.querySelector('.rr-input-pane');
  var app = document.querySelector('.rr-app');

  // ---------------------------------------------------------------------------
  // 2. HILFSFUNKTIONEN
  // ---------------------------------------------------------------------------
  function $(id) { return document.getElementById(id); }
  function gv(id) { var e = $(id); return e && e.value ? String(e.value).trim() : ''; }
  function checked(id) { var e = $(id); return !!(e && e.checked); }

  // Texte der aktivierten Checkboxen in einem Wrap (aus dem <span>-Label)
  function checkedLabels(wrapId) {
    var wrap = $(wrapId);
    if (!wrap) return [];
    return Array.prototype.slice.call(wrap.querySelectorAll('input[type=checkbox]'))
      .filter(function (c) { return c.checked; })
      .map(function (c) {
        var span = c.parentNode.querySelector('span');
        return span ? span.textContent.trim() : c.id;
      });
  }
  function joinLabels(wrapId, fallback) {
    var l = checkedLabels(wrapId);
    return l.length ? l.join(', ') : (fallback || '');
  }
  function nfVal(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }

  // ---------------------------------------------------------------------------
  // 3. ORGAN-NAVIGATION (aus data-organ-Panels)
  // ---------------------------------------------------------------------------
  var panels = Array.prototype.slice.call(document.querySelectorAll('.rr-organ-panel'));
  var nav = $('organ-nav');
  var activeOrgan = panels.length ? panels[0].dataset.organ : null;

  function showOrgan(id) {
    activeOrgan = id;
    panels.forEach(function (p) { p.classList.toggle('is-active', p.dataset.organ === id); });
    if (nav) {
      Array.prototype.slice.call(nav.children).forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.tab === id);
      });
    }
  }
  function flagOrgan(id, flag) {
    if (!nav) return;
    var b = nav.querySelector('[data-tab="' + id + '"]');
    if (b) b.classList.toggle('is-flagged', !!flag);
  }
  // Ist ein Organ "auffällig"? (irgendein nicht-Normalfeld gesetzt)
  function organFlagged(panel) {
    var flagged = false;
    // Checkboxen: markiert, wenn irgendeine NICHT-Norm-Box aktiv
    panel.querySelectorAll('input[type=checkbox]').forEach(function (c) {
      if (c.checked && !/_norm$/.test(c.id)) flagged = true;
    });
    // Selects: markiert, wenn Wert gesetzt und nicht die (erste) Normal-Option
    panel.querySelectorAll('select').forEach(function (s) {
      if (s.selectedIndex > 0) {
        var v = s.value.toLowerCase();
        if (!/unauff|normal|nicht dilatiert|kein|keine|nicht beurteilbar/.test(v)) flagged = true;
      }
    });
    // Freitext-Ergänzung gefüllt
    panel.querySelectorAll('textarea').forEach(function (t) {
      if (t.value.trim()) flagged = true;
    });
    return flagged;
  }

  if (nav) {
    panels.forEach(function (p) {
      var tab = document.createElement('div');
      tab.className = 'rr-organ-tab';
      tab.dataset.tab = p.dataset.organ;
      tab.textContent = p.dataset.organLabel || p.dataset.organ;
      tab.addEventListener('click', function () { showOrgan(p.dataset.organ); });
      nav.appendChild(tab);
    });
  }

  // ---------------------------------------------------------------------------
  // 4. NOTFALL-SEGMENTE (pos/neg-Highlight)
  // ---------------------------------------------------------------------------
  var NF = [
    { name: 'nf_perforation', label: 'Freie Luft / Perforation' },
    { name: 'nf_ileus', label: 'Ileus' },
    { name: 'nf_ischaemie', label: 'Mesenteriale Ischämie' },
    { name: 'nf_appendizitis', label: 'Appendizitis' },
    { name: 'nf_divertikulitis', label: 'Divertikulitis' },
    { name: 'nf_pankreatitis', label: 'Akute Pankreatitis' },
    { name: 'nf_cholezystitis', label: 'Akute Cholezystitis' },
    { name: 'nf_aaa', label: 'Aortenaneurysma (ruptur.)' }
  ];
  NF.forEach(function (c) {
    var wrap = $('nf-wrap-' + c.name);
    if (!wrap) return;
    wrap.querySelectorAll('input[type=radio]').forEach(function (r) {
      r.addEventListener('change', function () {
        var v = nfVal(c.name);
        wrap.classList.remove('is-pos', 'is-neg');
        if (v === 'positiv') wrap.classList.add('is-pos');
        if (v === 'negativ') wrap.classList.add('is-neg');
        update();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 5. RECIST – SLD-Summe
  // ---------------------------------------------------------------------------
  function calcRecist() {
    var sum = 0, any = false;
    for (var i = 1; i <= 5; i++) {
      var v = parseFloat(gv('rl_la_' + i));
      if (!isNaN(v)) { sum += v; any = true; }
    }
    var el = $('recist-sum');
    if (el) el.textContent = any && sum > 0 ? sum.toFixed(1) + ' mm' : '– mm';
  }
  function getRecistRows() {
    var rows = [];
    for (var i = 1; i <= 5; i++) {
      var lok = gv('rl_lok_' + i), la = gv('rl_la_' + i),
          ka = gv('rl_ka_' + i), verl = gv('rl_verl_' + i);
      if (lok || la) rows.push({ n: i, lok: lok || '–', la: la || '–', ka: ka || '–', verl: verl || '–' });
    }
    return rows;
  }
  function hasOnkoData() {
    return !!(gv('tumor_entitaet') || gv('recist_response') || getRecistRows().length);
  }

  // ---------------------------------------------------------------------------
  // 6. TEXTBAUSTEINE
  // ---------------------------------------------------------------------------
  function buildTechnik() {
    var phasen = [];
    if (checked('ph_nativ')) phasen.push('Nativ');
    if (checked('ph_art')) phasen.push('arteriell');
    if (checked('ph_pv')) phasen.push('portal-venös');
    if (checked('ph_spaet')) phasen.push('Spätphase');
    if (checked('ph_nativ_nkm')) phasen.push('nativ + portal-venös');
    var km_menge = gv('km_menge'), km_praep = gv('km_praep');
    var schicht = gv('schicht') || '5 mm', rekon = gv('rekon') || 'axial';
    var qual = gv('qual') || 'gut, diagnostisch ausreichend';
    var frage = gv('fragestellung');
    var t = 'CT Abdomen + Becken';
    if (phasen.length) t += ', ' + phasen.join(' + ') + '.';
    if (km_praep && km_menge) t += ' KM: ' + km_praep + ' ' + km_menge + ' ml i.v.';
    else if (km_menge) t += ' KM: ' + km_menge + ' ml i.v.';
    t += ' Schichtdicke ' + schicht + ', Rekonstruktion ' + rekon + '. Qualität ' + qual + '.';
    if (frage) t += ' Fragestellung: ' + frage + '.';
    return t;
  }

  function buildNfText() {
    var pos = [], neg = [], nb = [];
    NF.forEach(function (c) {
      var v = nfVal(c.name);
      if (v === 'positiv') pos.push(c.label);
      else if (v === 'negativ') neg.push(c.label);
      else if (v === 'n.b.') nb.push(c.label);
    });
    var t = '';
    if (pos.length) t += 'POSITIV: ' + pos.join(', ') + '.\n';
    if (neg.length) t += 'Ausgeschlossen: ' + neg.join(', ') + '.\n';
    if (nb.length) t += 'Nicht beurteilbar: ' + nb.join(', ') + '.';
    return t.trim();
  }

  function buildBefund() {
    var lines = [], organ = [];

    // Onkologischer Kontext / RECIST (inhaltsgetrieben)
    if (hasOnkoData()) {
      var entitaet = gv('tumor_entitaet'), staging = gv('staging_zeitpunkt');
      if (entitaet || staging) lines.push('Onkologischer Kontext: ' + [entitaet, staging].filter(Boolean).join(', ') + '.');
      var rows = getRecistRows();
      if (rows.length) {
        var rl = rows.map(function (r) {
          return '  ' + r.n + '. ' + r.lok + ': LA ' + r.la + ' mm'
            + (r.ka !== '–' ? ', KA ' + r.ka + ' mm' : '')
            + (r.verl !== '–' ? ' – ' + r.verl : '');
        });
        var sum = $('recist-sum') ? $('recist-sum').textContent : '';
        lines.push('RECIST 1.1 Zielläsionen:\n' + rl.join('\n') + '\n  SLD: ' + sum);
      }
      var resp = gv('recist_response'), nont = gv('recist_nontarget');
      if (resp) lines.push('RECIST-Ansprechen: ' + resp + '.');
      if (nont) lines.push('Nicht-Zielläsionen: ' + nont + '.');
    }

    // Leber
    var lg = gv('leber_groesse');
    var leber = 'Leber:';
    if (lg && lg !== 'normal groß') leber += ' ' + lg + '.';
    leber += ' Parenchym ' + joinLabels('lp_wrap', 'unauffällig') + '.';
    if (gv('leber_fokal')) leber += ' ' + gv('leber_fokal') + '.';
    if (gv('leber_fokal_ft')) leber += ' ' + gv('leber_fokal_ft') + '.';
    if (gv('leber_gw')) leber += ' Intrahepatische Gallenwege ' + gv('leber_gw') + '.';
    organ.push(leber);

    // Gallenblase
    organ.push('Gallenblase: ' + joinLabels('gb_wrap', 'unauffällig') + '. Ductus choledochus: ' + (gv('chd') || 'nicht dilatiert') + '.');

    // Pankreas
    var pankreas = 'Pankreas: Parenchym ' + (gv('pank_par') || 'unauffällig')
      + '. Ductus pancreaticus ' + (gv('pank_duct') || 'nicht dilatiert')
      + '. ' + (gv('pank_fokal') || 'keine fokale Raumforderung') + '.';
    if (gv('pank_fokal_ft')) pankreas += ' ' + gv('pank_fokal_ft') + '.';
    organ.push(pankreas);

    // Milz
    organ.push('Milz: ' + (gv('milz_gr') || 'normal groß') + '. Parenchym ' + joinLabels('mlz_wrap', 'unauffällig') + '.');

    // Nieren / NN
    var nieren = 'Nieren: ' + joinLabels('niere_wrap', 'bds. unauffällig') + '.';
    var nn = joinLabels('nn_wrap', '');
    if (nn) nieren += ' Nebennieren: ' + nn + '.';
    if (gv('nieren_ft')) nieren += ' ' + gv('nieren_ft') + '.';
    organ.push(nieren);

    // GI-Trakt
    var gi = 'GI-Trakt: Magen ' + (gv('gi_magen') || 'unauffällig')
      + '. Dünndarm ' + joinLabels('gid_wrap', 'unauffällig')
      + '. Colon/Rektum ' + joinLabels('gic_wrap', 'unauffällig') + '.';
    if (gv('gi_ft')) gi += ' ' + gv('gi_ft') + '.';
    organ.push(gi);

    // Gefäße
    var gef = 'Gefäße: Aorta abdominalis ' + (gv('gef_aorta') || 'unauffällig')
      + '. ' + (gv('gef_pfortader') || 'Pfortader unauffällig durchströmbar') + '.';
    if (gv('gef_ft')) gef += ' ' + gv('gef_ft') + '.';
    organ.push(gef);

    // Lymphknoten
    var lymph = 'Lymphknoten: ' + (gv('lymph_retro') || 'unauffällig') + '. ' + joinLabels('lym_wrap', 'unauffällig') + '.';
    if (gv('lymph_ft')) lymph += ' ' + gv('lymph_ft') + '.';
    organ.push(lymph);

    // Peritoneum / Aszites
    organ.push('Peritoneum: ' + joinLabels('peri_wrap', 'unauffällig') + '. Aszites: ' + (gv('aszites') || 'kein Aszites') + '.');

    // Becken
    var becken = 'Becken: Harnblase ' + (gv('blase') || 'unauffällig') + '.';
    var gyn = joinLabels('gyn_wrap', '');
    if (gyn) becken += ' Uterus/Adnexe: ' + gyn + '.';
    if (gv('becken_prostata')) becken += ' ' + gv('becken_prostata') + '.';
    if (gv('becken_ft')) becken += ' ' + gv('becken_ft') + '.';
    organ.push(becken);

    // Skelett / Weichteile
    var skel = 'Skelett / Weichteile: ' + joinLabels('sk_wrap', 'unauffällig') + '. ' + joinLabels('wt_wrap', 'unauffällig') + '.';
    if (gv('skel_ft')) skel += ' ' + gv('skel_ft') + '.';
    organ.push(skel);

    lines.push(organ.join('\n'));

    // Vergleich
    if (gv('vgl_ja') === 'yes') {
      var vgl = 'Vergleich:';
      if (gv('vgl_dat')) vgl += ' Voruntersuchung ' + gv('vgl_dat') + '.';
      if (gv('vgl_verl')) vgl += ' ' + gv('vgl_verl');
      lines.push(vgl);
    }
    if (gv('zufall_ft')) lines.push('Zufallsbefunde: ' + gv('zufall_ft'));
    if (gv('freetext')) lines.push(gv('freetext'));

    return lines.join('\n\n');
  }

  function buildVorschlag() {
    var nfPos = NF.filter(function (c) { return nfVal(c.name) === 'positiv'; }).map(function (c) { return c.label; });
    if (nfPos.length) {
      return 'CT Abdomen + Becken: Nachweis von ' + nfPos.join(', ')
        + '. Klinische Korrelation und unmittelbare Information des zuweisenden Arztes empfohlen.';
    }
    if (hasOnkoData()) {
      var v = 'CT Abdomen + Becken';
      var entitaet = gv('tumor_entitaet'), staging = gv('staging_zeitpunkt'), resp = gv('recist_response');
      if (entitaet) v += ' bei bekanntem ' + entitaet;
      if (staging) v += ' (' + staging + ')';
      v += '.';
      if (resp) v += ' RECIST 1.1: ' + resp + '.';
      if (getRecistRows().length) v += ' SLD: ' + ($('recist-sum') ? $('recist-sum').textContent : '') + '.';
      return v;
    }
    // Notfall-Sektion offen/beantwortet, aber ohne Positiva
    var anyNf = NF.some(function (c) { return nfVal(c.name); });
    if (anyNf) return 'CT Abdomen + Becken: Kein Hinweis auf akutes intraabdominelles Geschehen.';
    return 'CT Abdomen + Becken ohne wegweisenden pathologischen Befund.';
  }

  // ---------------------------------------------------------------------------
  // 7. FHIR-R4-EXPORT
  // ---------------------------------------------------------------------------
  function buildFhir() {
    var now = new Date().toISOString();
    var obs = [], idx = 0;
    function addObs(rid, en, val, status) {
      if (!val) return;
      idx++;
      var coding = [];
      if (rid) coding.push({ system: 'http://radlex.org', code: rid, display: en });
      else coding.push({ system: 'http://hjk.wien/fhir/CodeSystem/radiology-templates', code: 'local:' + en, display: en });
      obs.push({ fullUrl: 'urn:uuid:obs-' + idx, resource: {
        resourceType: 'Observation', status: 'final', id: 'obs-' + idx,
        code: { coding: coding }, valueString: val
      } });
    }

    // Organ-Freitext-Ergänzungen (aus Panels)
    panels.forEach(function (p) {
      var ft = p.querySelector('textarea');
      if (ft && ft.value.trim()) addObs(p.dataset.radlex || '', p.dataset.en || p.dataset.organ, ft.value.trim(), null);
    });

    // RECIST-Ansprechen
    var respSel = $('recist_response');
    if (respSel && respSel.value) {
      var opt = respSel.options[respSel.selectedIndex];
      addObs(opt.dataset.radlex || 'RID49860', opt.dataset.en || 'RECIST response', respSel.value, null);
    }

    // Notfall-Positiva (Abnormal)
    NF.forEach(function (c) {
      if (nfVal(c.name) === 'positiv') {
        var wrap = $('nf-wrap-' + c.name);
        var rid = wrap ? wrap.dataset.radlex : '';
        var en = wrap ? wrap.dataset.en : c.label;
        idx++;
        obs.push({ fullUrl: 'urn:uuid:obs-' + idx, resource: {
          resourceType: 'Observation', status: 'final', id: 'obs-' + idx,
          code: { coding: [ rid
            ? { system: 'http://radlex.org', code: rid, display: en }
            : { system: 'http://hjk.wien/fhir/CodeSystem/radiology-templates', code: 'local:' + en, display: en } ] },
          valueString: 'POSITIV: ' + c.label,
          interpretation: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'A', display: 'Abnormal' }] }]
        } });
      }
    });

    var dr = {
      resourceType: 'DiagnosticReport', status: 'final', id: 'ct-abd-report',
      code: { coding: [{ system: 'http://loinc.org', code: '30652-8', display: 'CT Abdomen and Pelvis' }] },
      effectiveDateTime: now,
      identifier: [{ value: 'HJK-MRRT-CT-ABDBECKEN-v2.0' }],
      conclusion: gv('beurt'),
      result: obs.map(function (o) { return { reference: o.fullUrl }; }),
      presentedForm: [{ contentType: 'text/plain', title: 'CT Abdomen + Becken',
        data: btoa(unescape(encodeURIComponent(
          'TECHNIK\n' + buildTechnik() + '\n\nBEFUND\n' + buildBefund() + '\n\nBEURTEILUNG\n' + gv('beurt')
        ))) }]
    };
    return JSON.stringify({
      resourceType: 'Bundle', type: 'document', timestamp: now,
      meta: { tag: [{ system: 'http://hjk.wien/fhir/CodeSystem/radiology-templates', code: 'radlex-coded' }] },
      entry: [{ fullUrl: 'urn:uuid:ct-abd-report', resource: dr }].concat(obs)
    }, null, 2);
  }

  // ---------------------------------------------------------------------------
  // 8. VORSCHAU-PANE + AKTIONEN (Chrome zur Laufzeit)
  // ---------------------------------------------------------------------------
  // Aktionsleiste + Export-Box ans Ende der Input-Pane
  var actions = document.createElement('div');
  actions.className = 'rr-actions';
  actions.innerHTML =
    '<button type="button" class="rr-btn" id="btn-copy">Befundtext kopieren</button>'
    + '<button type="button" class="rr-btn-secondary" id="btn-fhir">{ } FHIR-Export</button>'
    + '<button type="button" class="rr-btn-secondary" id="btn-reset">Zurücksetzen</button>';
  pane.appendChild(actions);
  var ebox = document.createElement('pre');
  ebox.className = 'rr-ebox';
  ebox.id = 'export-box';
  pane.appendChild(ebox);

  // Vorschau-Aside
  var aside = document.createElement('aside');
  aside.className = 'rr-preview-pane';
  aside.innerHTML =
    '<div class="rr-preview-title">Befund-Vorschau (Live)</div>'
    + '<div class="rr-rcard">'
    + '  <div class="rr-rcard-header"><div class="rr-rcard-title">CT Abdomen + Becken</div><div class="rr-rcard-sub" id="prev-sub">–</div></div>'
    + '  <div class="rr-rsec"><div class="rr-rsec-lbl">Technik</div><div class="rr-rtext" id="prev-technik"></div></div>'
    + '  <div class="rr-rsec" id="prev-nf-sec" style="display:none"><div class="rr-rsec-lbl crit">Notfall-Checkliste</div><div class="rr-rtext" id="prev-nf"></div></div>'
    + '  <div class="rr-rsec"><div class="rr-rsec-lbl">Befund</div><div class="rr-rtext" id="prev-befund"></div></div>'
    + '  <div class="rr-rsec"><div class="rr-rsec-lbl">Beurteilung</div><div class="rr-rtext" id="prev-beurt"></div></div>'
    + '  <div class="rr-stamp"><span>HJK-MRRT-CT-ABDBECKEN-v2.0</span><span id="prev-date"></span></div>'
    + '</div>'
    + '<div id="status-badge" class="rr-status-badge warn">Befund ausfüllen</div>';
  app.appendChild(aside);

  // Vorschlag-Box vor der Aktionsleiste
  var vbox = document.createElement('div');
  vbox.id = 'vorschlag-box';
  pane.insertBefore(vbox, actions);

  // ---------------------------------------------------------------------------
  // 9. UPDATE
  // ---------------------------------------------------------------------------
  function update() {
    calcRecist();

    $('prev-technik').textContent = buildTechnik();
    $('prev-befund').textContent = buildBefund();
    $('prev-beurt').textContent = gv('beurt') || '';

    var phasen = [];
    if (checked('ph_nativ')) phasen.push('nativ');
    if (checked('ph_art')) phasen.push('art.');
    if (checked('ph_pv')) phasen.push('PV');
    if (checked('ph_spaet')) phasen.push('Spät');
    if (checked('ph_nativ_nkm')) phasen.push('nativ+PV');
    var ctxLabel = NF.some(function (c) { return nfVal(c.name) === 'positiv'; }) ? 'Akutes Abdomen'
      : hasOnkoData() ? 'Onkologie/RECIST' : 'Organsystematik';
    var frage = gv('fragestellung');
    $('prev-sub').textContent = (phasen.join('+') || 'PV') + ' · ' + ctxLabel + (frage ? ' · ' + frage : '');

    // Notfall-Vorschau nur, wenn irgendein NF-Item beantwortet
    var anyNf = NF.some(function (c) { return nfVal(c.name); });
    $('prev-nf-sec').style.display = anyNf ? '' : 'none';
    if (anyNf) $('prev-nf').textContent = buildNfText();

    // Organ-Flags
    panels.forEach(function (p) { flagOrgan(p.dataset.organ, organFlagged(p)); });

    // Vorschlag
    if (!gv('beurt')) {
      var v = buildVorschlag();
      vbox.innerHTML = '<div class="rr-helper-info rr-vorschlag" title="Klicken zum Übernehmen"><strong>Vorschlag (klicken):</strong><br>' + v + '</div>';
      var vd = vbox.querySelector('.rr-vorschlag');
      if (vd) vd.addEventListener('click', function () { $('beurt').value = v; update(); });
    } else {
      vbox.innerHTML = '';
    }

    // Ampel-Status
    var badge = $('status-badge');
    var nfPos = NF.some(function (c) { return nfVal(c.name) === 'positiv'; });
    var hasBeurt = gv('beurt').length > 10;
    if (nfPos) { badge.className = 'rr-status-badge alert'; badge.textContent = '⚠ Positiver Notfall-Befund'; }
    else if (!hasBeurt) { badge.className = 'rr-status-badge warn'; badge.textContent = 'Beurteilung fehlt'; }
    else { badge.className = 'rr-status-badge ok'; badge.textContent = '✓ Vollständig'; }
  }

  // ---------------------------------------------------------------------------
  // 10. VERDRAHTUNG
  // ---------------------------------------------------------------------------
  document.querySelectorAll('input, select, textarea').forEach(function (el) {
    var ev = (el.type === 'checkbox' || el.type === 'radio' || el.tagName === 'SELECT') ? 'change' : 'input';
    el.addEventListener(ev, update);
  });

  // Konditionelle Detail-Felder
  function toggleDetail(selId, detailId, emptyVal) {
    var sel = $(selId), det = $(detailId);
    if (!sel || !det) return;
    function sync() { det.style.display = (sel.value && sel.value !== emptyVal) ? '' : 'none'; }
    sel.addEventListener('change', sync);
    sync();
  }
  toggleDetail('leber_fokal', 'leber_fokal_detail', 'keine fokale Leberläsion nachweisbar');
  toggleDetail('pank_fokal', 'pank_fokal_detail', 'keine fokale Raumforderung');

  $('btn-copy').addEventListener('click', function () {
    var t = 'CT ABDOMEN + BECKEN\n'
      + new Date().toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + '\n\nTECHNIK\n' + buildTechnik() + '\n\nBEFUND\n' + buildBefund() + '\n\nBEURTEILUNG\n' + gv('beurt');
    var btn = this;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () {
        btn.textContent = '✓ Kopiert!';
        setTimeout(function () { btn.textContent = 'Befundtext kopieren'; }, 2000);
      });
    } else {
      var ta = document.createElement('textarea'); ta.value = t;
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    }
  });
  $('btn-fhir').addEventListener('click', function () {
    if (ebox.classList.contains('is-open')) { ebox.classList.remove('is-open'); return; }
    ebox.textContent = buildFhir();
    ebox.classList.add('is-open');
  });
  $('btn-reset').addEventListener('click', function () {
    if (!confirm('Alle Eingaben zurücksetzen?')) return;
    document.querySelectorAll('select').forEach(function (s) { s.selectedIndex = 0; });
    document.querySelectorAll('textarea, input[type=text], input[type=number]').forEach(function (i) { i.value = ''; });
    document.querySelectorAll('input[type=checkbox]').forEach(function (c) { c.checked = false; });
    document.querySelectorAll('input[type=radio]').forEach(function (r) { r.checked = false; });
    if ($('ph_pv')) $('ph_pv').checked = true;
    NF.forEach(function (c) { var w = $('nf-wrap-' + c.name); if (w) w.classList.remove('is-pos', 'is-neg'); });
    ebox.classList.remove('is-open');
    showOrgan(activeOrgan || (panels[0] && panels[0].dataset.organ));
    update();
  });

  // ---------------------------------------------------------------------------
  // 11. INIT
  // ---------------------------------------------------------------------------
  $('prev-date').textContent = new Date().toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  if (panels.length) showOrgan(panels[0].dataset.organ);
  update();
})();
