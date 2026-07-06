// =============================================================================
// Demo-Interaktivität für "CT Leber – LI-RADS v2018" (v1.3)
//
// ABGELEITET / Demo-Schicht: gehört NICHT ins kanonische template.html (nacktes,
// JS-freies, form-only MRRT). Baut das Viewer-Chrome zur Laufzeit:
//   - Mode-Switch (Manuell / Geführt / Direkt)
//   - Läsions-Tabs (multipliziert den EINEN deklarierten Läsionsblock auf 3)
//   - LR-Kategorie-Box + 4-Schritte-Berechnungsanzeige je Läsion
//   - Live-Vorschau + Export
//   - data-show-if-Sichtbarkeitslogik
//
// LR-Algorithmus (calculateLR) verbatim portiert aus dem abgelösten Inline-
// Template (ACR LI-RADS CT/MRI v2018; didaktisch nach Schima/Kopf/Eisenhuber
// RöFo 2023). Eingebunden via build-demo.js in demo/index.html.
// =============================================================================

(function () {
  'use strict';

  var LESION_COUNT = 3;

  // ---------------------------------------------------------------------------
  // 1. DEMO-STYLING (Core kennt keine Feature-Grid/Tab/Card/LR-Box-Klassen)
  // ---------------------------------------------------------------------------
  var css = ''
    + '.rr-mode-switch{display:flex;gap:6px;margin:14px 0 4px}'
    + '.rr-mode-switch input{display:none}'
    + '.rr-mode-switch label{padding:7px 14px;border:1px solid var(--rr-line,#ccc);'
    + 'border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;color:var(--rr-ink-muted,#555)}'
    + '.rr-mode-switch input:checked+label{background:var(--rr-accent,#31708f);color:#fff;border-color:var(--rr-accent,#31708f)}'
    + '.rr-helper-info{font-size:12.5px;color:var(--rr-ink-muted,#555);margin:0 0 14px;line-height:1.5}'
    + '.rr-checkgrid{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px;margin:8px 0}'
    + '.rr-check{display:flex;align-items:flex-start;gap:8px;font-size:13.5px;cursor:pointer;line-height:1.35}'
    + '.rr-subhead{font-size:12px;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;'
    + 'color:var(--rr-ink-soft,#667);margin:16px 0 4px}'
    + '.rr-subhead-malig{color:#b3392f}.rr-subhead-benign{color:#2d8a4f}'
    + '.rr-note-block{font-size:12.5px;color:var(--rr-ink-muted,#555);line-height:1.5;'
    + 'padding:10px 12px;border-left:3px solid var(--rr-line,#ccc);background:var(--rr-bg-soft,#f7f7f5)}'
    + '.rr-lesion-tabs{display:flex;gap:4px;margin:10px 0}'
    + '.rr-lesion-tab{padding:7px 16px;border:1px solid var(--rr-line,#ccc);border-bottom:none;'
    + 'border-radius:6px 6px 0 0;cursor:pointer;font-size:13px;background:var(--rr-bg-soft,#f2f2ef)}'
    + '.rr-lesion-tab.active{background:var(--rr-accent,#31708f);color:#fff;border-color:var(--rr-accent,#31708f)}'
    + '.rr-lesion-tab .cat{margin-left:8px;font-size:11px;opacity:0.85}'
    + '.rr-lesion-card{border:1px solid var(--rr-line,#ddd);border-radius:0 8px 8px 8px;padding:16px 18px}'
    + '.rr-lr-box{display:flex;justify-content:space-between;align-items:center;gap:16px;'
    + 'margin-top:16px;padding:14px 18px;border-radius:8px;border-left:5px solid #8b97a3;background:var(--rr-bg-soft,#f5f6f7)}'
    + '.rr-lr-box .lr-label{font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--rr-ink-muted,#555)}'
    + '.rr-lr-box .lr-value{font-size:22px;font-weight:700}'
    + '.rr-lr-box .lr-detail{font-size:12.5px;color:var(--rr-ink-muted,#555);text-align:right;max-width:40ch}'
    + '.rr-calc-steps{margin-top:10px;font-size:12px;color:var(--rr-ink-muted,#555);line-height:1.7}'
    + '.rr-calc-steps .step-applied{color:var(--rr-accent,#31708f);font-weight:600}'
    + '.rr-calc-steps .step-skipped{opacity:0.55}'
    + '.rr-direct-grid{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}'
    + '.rr-direct-grid button{padding:8px 14px;border:1px solid var(--rr-line,#ccc);border-radius:6px;'
    + 'cursor:pointer;font-size:13px;font-weight:600;background:#fff}'
    + '.rr-direct-grid button.selected{background:var(--rr-accent,#31708f);color:#fff;border-color:var(--rr-accent,#31708f)}'
    + '[data-show-if]{display:none}[data-show-if].rr-shown{display:block}'
    + '.rr-check[data-show-if].rr-shown{display:flex}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var pane = document.querySelector('.rr-input-pane');
  var app = document.querySelector('.rr-app');

  // ---------------------------------------------------------------------------
  // 2. MODE-SWITCH
  // ---------------------------------------------------------------------------
  var HELP = {
    manual: '<strong>Modus Manuell:</strong> Alle Haupt- und Hilfskriterien direkt setzen; die LR-Kategorie wird automatisch nach dem 4-Schritte-Algorithmus berechnet.',
    guided: '<strong>Modus Geführt (Made Easy):</strong> Schritt-für-Schritt nach Schima/Kopf/Eisenhuber (RöFo 2023) – die Schritte werden nacheinander eingeblendet. Empfohlen für die Einarbeitung.',
    direct: '<strong>Modus Direkt:</strong> Erfahrener Befunder weist die LR-Kategorie direkt zu; begründende Merkmale im Freitext.'
  };
  var rule = pane.querySelector('.rr-title-rule');
  if (rule) {
    rule.insertAdjacentHTML('afterend',
      '<div class="rr-mode-switch">'
      + '<input type="radio" name="lrmode" id="lrmode-manual" value="manual" checked><label for="lrmode-manual">Manuell</label>'
      + '<input type="radio" name="lrmode" id="lrmode-guided" value="guided"><label for="lrmode-guided">Geführt</label>'
      + '<input type="radio" name="lrmode" id="lrmode-direct" value="direct"><label for="lrmode-direct">Direkt</label>'
      + '</div><div class="rr-helper-info" id="lrModeHelper">' + HELP.manual + '</div>');
  }

  // ---------------------------------------------------------------------------
  // 3. LÄSIONSBLOCK MULTIPLIZIEREN (1 deklariert → 3 Tabs)
  // ---------------------------------------------------------------------------
  var block = document.getElementById('lesion_block');
  var blockParent = block.parentNode;
  var lesionCards = [];

  // Läsion 1 = der deklarierte Block; in Karte einwickeln
  block.classList.add('rr-lesion-card');
  var wrap1 = document.createElement('div');
  wrap1.className = 'rr-lesion-wrap';
  wrap1.dataset.lesionWrap = '1';
  blockParent.insertBefore(wrap1, block);
  wrap1.appendChild(block);
  lesionCards.push(wrap1);

  // Stabile Einfüge-Referenz NACH wrap1 (Element, das im Original auf den
  // Läsionsblock folgt – z. B. die Freitext-Überschrift).
  var afterRef = wrap1.nextSibling;
  for (var n = 2; n <= LESION_COUNT; n++) {
    var clone = block.cloneNode(true);
    remapLesion(clone, n);
    var wrap = document.createElement('div');
    wrap.className = 'rr-lesion-wrap';
    wrap.dataset.lesionWrap = String(n);
    wrap.style.display = 'none';
    wrap.appendChild(clone);
    blockParent.insertBefore(wrap, afterRef); // in Reihenfolge vor afterRef
    lesionCards.push(wrap);
  }

  function remapLesion(root, n) {
    root.setAttribute('data-lesion', String(n));
    root.querySelectorAll('[data-lesion]').forEach(function (el) {
      el.setAttribute('data-lesion', String(n));
    });
    // ids eindeutig machen (lr_calc_anchor etc.)
    root.querySelectorAll('[id]').forEach(function (el) {
      el.id = el.id + '_' + n;
    });
    if (root.id) root.id = 'lesion_block_' + n;
    // Radio/Checkbox-name-Kollisionen vermeiden (hier keine name-Gruppen, safe)
  }

  // Tabs an den Anker
  var tabsAnchor = document.getElementById('lesion_tabs_anchor');
  if (tabsAnchor) {
    var tabsHtml = '<div class="rr-lesion-tabs">';
    for (var t = 1; t <= LESION_COUNT; t++) {
      tabsHtml += '<button type="button" class="rr-lesion-tab' + (t === 1 ? ' active' : '')
        + '" data-tab="' + t + '">Läsion ' + t + '<span class="cat" id="tab_cat_' + t + '"></span></button>';
    }
    tabsHtml += '</div>';
    tabsAnchor.innerHTML = tabsHtml;
    tabsAnchor.querySelectorAll('.rr-lesion-tab').forEach(function (btn) {
      btn.addEventListener('click', function () { showLesion(parseInt(btn.dataset.tab, 10)); });
    });
  }

  function showLesion(n) {
    lesionCards.forEach(function (w) {
      w.style.display = (w.dataset.lesionWrap === String(n)) ? 'block' : 'none';
    });
    document.querySelectorAll('.rr-lesion-tab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === String(n));
    });
  }

  // ---------------------------------------------------------------------------
  // 4. LR-BOX + CALC-STEPS + DIREKT-PICKER je Läsion injizieren
  // ---------------------------------------------------------------------------
  for (var m = 1; m <= LESION_COUNT; m++) {
    var anchor = lesionAnchor(m);
    if (!anchor) continue;
    anchor.innerHTML =
      '<div class="rr-direct-grid" data-role="direct" style="display:none">'
      + ['LR-1', 'LR-2', 'LR-3', 'LR-4', 'LR-5', 'LR-M'].map(function (c) {
        return '<button type="button" data-cat="' + c + '">' + c + '</button>';
      }).join('')
      + '</div>'
      + '<div class="rr-lr-box"><div><div class="lr-label">LI-RADS Kategorie</div>'
      + '<div class="lr-value" data-role="lrval">–</div></div>'
      + '<div class="lr-detail" data-role="lrdetail">Bitte Hauptkriterien angeben.</div></div>'
      + '<div class="rr-calc-steps" data-role="steps"></div>';
    // Direkt-Picker verdrahten
    (function (lesN) {
      anchor.querySelectorAll('[data-role="direct"] button').forEach(function (b) {
        b.addEventListener('click', function () {
          directCat[lesN] = (directCat[lesN] === b.dataset.cat) ? null : b.dataset.cat;
          refresh();
        });
      });
    })(m);
  }

  var directCat = {};

  function lesionAnchor(n) {
    return document.querySelector('#lr_calc_anchor' + (n === 1 ? '' : '_' + n))
      || document.querySelector('[data-lesion="' + n + '"] [id^="lr_calc_anchor"]');
  }

  // ---------------------------------------------------------------------------
  // 5. LÄSION AUS DOM LESEN
  // ---------------------------------------------------------------------------
  function fieldEl(n, field) {
    return document.querySelector('[data-field="' + field + '"][data-lesion="' + n + '"]');
  }
  function readLesion(n) {
    var l = { direct_category: directCat[n] || null };
    document.querySelectorAll('[data-field][data-lesion="' + n + '"]').forEach(function (el) {
      var f = el.getAttribute('data-field');
      if (el.type === 'checkbox') l[f] = el.checked;
      else if (el.type === 'number') l[f] = el.value ? parseFloat(el.value) : null;
      else l[f] = el.value || null;
    });
    l.used = isUsed(l);
    return l;
  }
  function isUsed(l) {
    if (l.direct_category) return true;
    if (l.size) return true;
    if (l.treated) return true;
    if (l.tiv || l.lrm_targetoid || l.lrm_infiltrative || l.lrm_necrosis || l.lrm_diffusion) return true;
    return ['aphe', 'washout', 'capsule', 'thresholdGrowth'].some(function (k) { return l[k]; });
  }

  // ---------------------------------------------------------------------------
  // 6. LR-ALGORITHMUS (verbatim portiert)
  // ---------------------------------------------------------------------------
  function calculateLR(l) {
    if (!l.used) return null;
    if (l.direct_category) return l.direct_category;

    if (l.treated) {
      if (l.lrtr_subcat) {
        var trMap = {
          nonviable: 'LR-TR nonviable', equivocal: 'LR-TR equivocal',
          viable: 'LR-TR viable', nonevaluable: 'LR-TR nonevaluable'
        };
        return trMap[l.lrtr_subcat];
      }
      return 'LR-TR';
    }

    if (l.tiv) {
      if (l.tiv_subtype === 'def_hcc') return 'LR-TIV (definitiv HCC)';
      if (l.tiv_subtype === 'prob_nonhcc') return 'LR-TIV (wahrsch. Nicht-HCC)';
      if (l.tiv_subtype === 'prob_hcc') return 'LR-TIV (wahrsch. HCC)';
      return 'LR-TIV';
    }

    if (l.lrm_targetoid || l.lrm_infiltrative || l.lrm_necrosis || l.lrm_diffusion) return 'LR-M';

    if (!l.size) return null;

    var size = l.size;
    var mfCount = 0;
    if (l.washout) mfCount++;
    if (l.capsule) mfCount++;
    if (l.thresholdGrowth) mfCount++;

    var baseCat;
    if (size < 10) {
      if (!l.aphe) baseCat = 'LR-3';
      else if (mfCount === 0) baseCat = 'LR-3';
      else baseCat = 'LR-4';
    } else if (size < 20) {
      if (!l.aphe && mfCount === 0) baseCat = 'LR-3';
      else if (l.aphe && mfCount === 0) baseCat = 'LR-3';
      else if (!l.aphe && mfCount >= 1) baseCat = 'LR-4';
      else if (l.aphe && l.washout) baseCat = 'LR-5';
      else if (l.aphe && mfCount >= 1) baseCat = 'LR-4';
      else baseCat = 'LR-3';
    } else {
      if (!l.aphe && mfCount === 0) baseCat = 'LR-3';
      else if (l.aphe && mfCount === 0) baseCat = 'LR-4';
      else if (!l.aphe && mfCount >= 1) baseCat = 'LR-4';
      else baseCat = 'LR-5';
    }
    l.baseCat = baseCat;

    var afMalig = ['af_m_us_visible', 'af_m_growth_subthreshold', 'af_m_diffusion_restricted',
      'af_m_t2_mild_moderate', 'af_m_corona', 'af_m_fat_sparing', 'af_m_iron_sparing',
      'af_hcc_nonenhancing_capsule', 'af_hcc_nodule_in_nodule', 'af_hcc_mosaic',
      'af_hcc_blood_products', 'af_hcc_fat_in_nodule'].some(function (k) { return l[k]; });
    var afBen = ['af_b_size_stability', 'af_b_size_reduction', 'af_b_parallels_vessels',
      'af_b_undistorted_vessels', 'af_b_iron_higher', 'af_b_t2_marked'].some(function (k) { return l[k]; });

    var afCat = baseCat;
    l.afApplied = null;
    if (afMalig && afBen) {
      l.afApplied = 'none';
    } else if (afMalig) {
      var upMap = { 'LR-1': 'LR-2', 'LR-2': 'LR-3', 'LR-3': 'LR-4', 'LR-4': 'LR-4', 'LR-5': 'LR-5' };
      afCat = upMap[baseCat] || baseCat;
      l.afApplied = 'up';
    } else if (afBen) {
      var downMap = { 'LR-5': 'LR-4', 'LR-4': 'LR-3', 'LR-3': 'LR-2', 'LR-2': 'LR-1', 'LR-1': 'LR-1' };
      afCat = downMap[baseCat] || baseCat;
      l.afApplied = 'down';
    }

    var tieCat = afCat;
    l.tieApplied = false;
    if (l.tiebreak_uncertain && l.tiebreak_direction) {
      if (l.tiebreak_direction === 'down_malig') {
        var m1 = { 'LR-5': 'LR-4', 'LR-4': 'LR-3' };
        if (m1[afCat]) { tieCat = m1[afCat]; l.tieApplied = true; }
      } else if (l.tiebreak_direction === 'down_bening') {
        var m2 = { 'LR-1': 'LR-2', 'LR-2': 'LR-3' };
        if (m2[afCat]) { tieCat = m2[afCat]; l.tieApplied = true; }
      } else if (l.tiebreak_direction === 'to_lrm') {
        if (afCat === 'LR-4' || afCat === 'LR-5') { tieCat = 'LR-M'; l.tieApplied = true; }
      }
    }
    return tieCat;
  }

  var LR_DESC = {
    'LR-1': 'definitiv benigne', 'LR-2': 'wahrscheinlich benigne',
    'LR-3': 'intermediäre Wahrscheinlichkeit für HCC', 'LR-4': 'wahrscheinlich HCC',
    'LR-5': 'definitiv HCC', 'LR-M': 'maligne, nicht HCC-spezifisch',
    'LR-TIV': 'definitiver Tumor in Vene', 'LR-TIV (definitiv HCC)': 'Tumor in Vene, definitiv HCC',
    'LR-TIV (wahrsch. HCC)': 'Tumor in Vene, wahrscheinlich HCC',
    'LR-TIV (wahrsch. Nicht-HCC)': 'Tumor in Vene, wahrscheinlich Nicht-HCC',
    'LR-TR': 'behandelte Observation', 'LR-TR nonviable': 'behandelt, avital',
    'LR-TR equivocal': 'behandelt, unklar', 'LR-TR viable': 'behandelt, vital (Residualtumor)',
    'LR-TR nonevaluable': 'behandelt, nicht beurteilbar'
  };
  function catColor(cat) {
    if (!cat) return '#8b97a3';
    if (cat.indexOf('LR-TR') === 0) return '#6b4caa';
    if (cat === 'LR-1' || cat === 'LR-2') return '#2d8a4f';
    if (cat === 'LR-3') return '#c47f2a';
    return '#b3392f';
  }

  // ---------------------------------------------------------------------------
  // 7. RENDER je Läsion
  // ---------------------------------------------------------------------------
  function renderLesion(n) {
    var l = readLesion(n);
    var cat = calculateLR(l);
    var anchor = lesionAnchor(n);
    if (!anchor) return { l: l, cat: cat };
    var valEl = anchor.querySelector('[data-role="lrval"]');
    var detEl = anchor.querySelector('[data-role="lrdetail"]');
    var stepsEl = anchor.querySelector('[data-role="steps"]');
    var boxEl = anchor.querySelector('.rr-lr-box');

    if (cat) {
      valEl.textContent = cat;
      valEl.style.color = catColor(cat);
      boxEl.style.borderLeftColor = catColor(cat);
      detEl.textContent = LR_DESC[cat] || '';
    } else {
      valEl.textContent = '–'; valEl.style.color = '#8b97a3';
      boxEl.style.borderLeftColor = '#8b97a3';
      detEl.textContent = l.used ? 'Angaben unvollständig.' : 'Bitte Hauptkriterien angeben.';
    }

    if (stepsEl) {
      if (l.direct_category) {
        stepsEl.innerHTML = '<div><strong>Direkt zugewiesen:</strong> <span class="step-applied">' + l.direct_category + '</span></div>';
      } else {
        stepsEl.innerHTML =
          step('Schritt 1', 'Hauptkriterien', l.baseCat ? l.baseCat : (l.tiv ? 'LR-TIV' : (cat === 'LR-M' ? 'LR-M' : 'nicht ausgewertet')))
          + step('Schritt 2', 'Hilfskriterien', l.afApplied === 'up' ? 'Upgrade' : l.afApplied === 'down' ? 'Downgrade' : l.afApplied === 'none' ? 'neutralisiert' : 'nicht angewendet')
          + step('Schritt 3', 'Tie-Breaking', l.tieApplied ? 'angewendet' : 'nicht aktiviert')
          + step('Schritt 4', 'Final Check', fieldVal(n, 'final_check_ok') === 'nein' ? 'Reevaluierung' : fieldVal(n, 'final_check_ok') === 'ja' ? 'plausibel' : 'ausstehend');
      }
    }

    var tabCat = document.getElementById('tab_cat_' + n);
    if (tabCat) tabCat.textContent = cat ? cat.replace(/ .*/, '') : '';
    return { l: l, cat: cat };
  }
  function step(num, label, applied) {
    var skipped = /nicht|ausstehend|nicht ausgewertet/.test(applied);
    return '<div><strong>' + num + '</strong> ' + label + ': <span class="'
      + (skipped ? 'step-skipped' : 'step-applied') + '">' + applied + '</span></div>';
  }
  function fieldVal(n, f) { var e = fieldEl(n, f); return e ? e.value : ''; }

  // ---------------------------------------------------------------------------
  // 8. data-show-if Sichtbarkeit
  // ---------------------------------------------------------------------------
  function applyShowIf() {
    document.querySelectorAll('[data-show-if]').forEach(function (el) {
      var wrap = el.closest('[data-lesion]');
      var n = wrap ? wrap.getAttribute('data-lesion') : '1';
      var cond = el.getAttribute('data-show-if');
      var show;
      if (cond.indexOf('=') > -1) {
        var parts = cond.split('=');
        show = fieldVal(n, parts[0]) === parts[1];
      } else {
        var c = fieldEl(n, cond);
        show = c && c.type === 'checkbox' ? c.checked : !!(c && c.value);
      }
      el.classList.toggle('rr-shown', !!show);
    });
  }

  // ---------------------------------------------------------------------------
  // 9. MODE-Verhalten
  // ---------------------------------------------------------------------------
  function currentMode() {
    var r = document.querySelector('input[name="lrmode"]:checked');
    return r ? r.value : 'manual';
  }
  function applyMode() {
    var mode = currentMode();
    var helper = document.getElementById('lrModeHelper');
    if (helper) helper.innerHTML = HELP[mode];
    // Direkt-Picker ein-/ausblenden, Feature-Eingaben aus-/einblenden
    document.querySelectorAll('.rr-lesion-wrap').forEach(function (w) {
      w.querySelectorAll('[data-role="direct"]').forEach(function (d) {
        d.style.display = (mode === 'direct') ? 'flex' : 'none';
      });
      w.querySelectorAll('.rr-checkgrid, details').forEach(function (g) {
        g.style.display = (mode === 'direct') ? 'none' : '';
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 10. VORSCHAU + EXPORT
  // ---------------------------------------------------------------------------
  if (app) {
    app.insertAdjacentHTML('beforeend',
      '<aside class="rr-preview-pane">'
      + '<h2 class="rr-preview-title">Befund-Vorschau</h2><div class="rr-preview-title-rule"></div>'
      + '<div class="rr-preview-section"><h4>Technik &amp; Klinik</h4><div class="rr-preview-content" id="prev_tech">–</div></div>'
      + '<div class="rr-preview-section"><h4>Läsionen</h4><div class="rr-preview-content" id="prev_les">–</div></div>'
      + '<div class="rr-preview-section"><h4>Beurteilung <span style="font-size:9px;color:var(--rr-ink-muted);letter-spacing:0.1em">EDITIERBAR</span></h4><textarea id="prev_beurteilung" class="rr-preview-editable"></textarea></div>'
      + '<div class="rr-actions"><button id="btn_copy" type="button">Befund kopieren</button>'
      + '<button id="btn_json" type="button" class="rr-btn-secondary">JSON</button>'
      + '<button id="btn_reset" type="button" class="rr-btn-secondary">Zurücksetzen</button></div>'
      + '<div class="rr-export-area" id="exportArea"></div></aside>');
  }

  function selText(id) {
    var el = document.getElementById(id);
    if (!el || el.selectedIndex < 0) return '';
    var t = el.options[el.selectedIndex].text;
    return (t.indexOf('–') === 0 || t.indexOf('- ') === 0) ? '' : t;
  }
  function renderPreview(results) {
    var pt = document.getElementById('prev_tech');
    if (pt) {
      var tp = [];
      if (selText('indikation')) tp.push('Indikation: ' + selText('indikation'));
      if (selText('tech_geraet')) tp.push(selText('tech_geraet'));
      if (selText('tech_quality')) tp.push('Qualität: ' + selText('tech_quality'));
      pt.textContent = tp.length ? tp.join(' · ') : '–';
    }
    var pl = document.getElementById('prev_les');
    if (pl) {
      var lines = results.map(function (r, i) {
        if (!r.cat && !r.l.used) return null;
        var seg = fieldVal(i + 1, 'segment');
        var sz = r.l.size ? r.l.size + ' mm' : '';
        return 'Läsion ' + (i + 1) + (seg ? ' (Segment ' + seg + ')' : '') + (sz ? ', ' + sz : '')
          + ': <strong>' + (r.cat || '–') + '</strong>';
      }).filter(Boolean);
      pl.innerHTML = lines.length ? lines.join('<br>') : '–';
    }
  }

  function buildReport(results) {
    var out = ['CT Leber – LI-RADS v2018'];
    if (selText('indikation')) out.push('Indikation: ' + selText('indikation'));
    results.forEach(function (r, i) {
      if (!r.cat && !r.l.used) return;
      var seg = fieldVal(i + 1, 'segment');
      out.push('Läsion ' + (i + 1) + (seg ? ' (Segment ' + seg + ')' : '')
        + (r.l.size ? ', ' + r.l.size + ' mm' : '') + ': ' + (r.cat || '–')
        + (r.cat && LR_DESC[r.cat] ? ' – ' + LR_DESC[r.cat] : '') + '.');
    });
    if (document.getElementById('freetext') && document.getElementById('freetext').value)
      out.push('Ergänzung: ' + document.getElementById('freetext').value);
    return out.join('\n');
  }
  function buildJson(results) {
    return {
      template: 'HJK-MRRT-CT-LEBER-LIRADS-v1.3',
      indikation: (document.getElementById('indikation') || {}).value || null,
      laesionen: results.map(function (r, i) {
        if (!r.cat && !r.l.used) return null;
        return { nr: i + 1, segment: fieldVal(i + 1, 'segment') || null, groesse_mm: r.l.size || null, li_rads: r.cat || null };
      }).filter(Boolean)
    };
  }

  // ---------------------------------------------------------------------------
  // 11. REFRESH-ZYKLUS
  // ---------------------------------------------------------------------------
  function refresh() {
    applyShowIf();
    var results = [];
    for (var i = 1; i <= LESION_COUNT; i++) results.push(renderLesion(i));
    renderPreview(results);
    var ta = document.getElementById('prev_beurteilung');
    if (ta && !ta.dataset.touched) ta.value = buildReport(results).split('\n').slice(1).join('\n');
    return results;
  }

  document.addEventListener('input', refresh);
  document.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'lrmode') applyMode();
    refresh();
  });

  var tb = document.getElementById('prev_beurteilung');
  if (tb) tb.addEventListener('input', function () { tb.dataset.touched = '1'; });

  var bc = document.getElementById('btn_copy');
  if (bc) bc.addEventListener('click', function () {
    var ta = document.getElementById('prev_beurteilung');
    var txt = ta && ta.value ? ta.value : buildReport(refresh());
    if (navigator.clipboard) navigator.clipboard.writeText(txt);
    var a = document.getElementById('exportArea'); if (a) a.textContent = 'Befund kopiert.';
  });
  var bj = document.getElementById('btn_json');
  if (bj) bj.addEventListener('click', function () {
    var a = document.getElementById('exportArea');
    if (a) a.innerHTML = '<pre style="white-space:pre-wrap;font-size:11px;margin:0">'
      + JSON.stringify(buildJson(refresh()), null, 2) + '</pre>';
  });
  var br = document.getElementById('btn_reset');
  if (br) br.addEventListener('click', function () {
    document.querySelectorAll('.rr-input-pane input, .rr-input-pane select, .rr-input-pane textarea')
      .forEach(function (el) {
        if (el.type === 'checkbox') el.checked = false;
        else if (el.tagName === 'SELECT') el.selectedIndex = 0;
        else el.value = '';
      });
    directCat = {};
    var ta = document.getElementById('prev_beurteilung'); if (ta) { ta.value = ''; delete ta.dataset.touched; }
    var a = document.getElementById('exportArea'); if (a) a.textContent = '';
    document.querySelectorAll('.rr-direct-grid button.selected').forEach(function (b) { b.classList.remove('selected'); });
    applyMode(); refresh();
  });

  // ---------------------------------------------------------------------------
  // INIT
  // ---------------------------------------------------------------------------
  showLesion(1);
  applyMode();
  refresh();
})();
