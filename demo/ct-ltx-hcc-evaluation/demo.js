// =============================================================================
// Demo-Interaktivität für "LTx-Evaluation HCC" (v1.0)
//
// ABGELEITET / Demo-Schicht: Dieses Skript gehört NICHT ins kanonische
// template.html (das ist nacktes, JS-freies, form-only MRRT). Es baut das
// Viewer-Chrome (Mailand-Kriterien-Box, Kriterien-Grid, §16-TPG-Compliance-
// Verdikt, Live-Vorschau, Export-Buttons) zur Laufzeit auf und liefert die
// gesamte Interaktivität für die GitHub-Pages-Demo. Eingebunden via
// build-demo.js in demo/index.html.
//
// Mailand-Logik anschlussfähig an DRG-Template gen_ltx_hcc.html
// (Pinto dos Santos D et al. 2017, CC BY 4.0).
// =============================================================================

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Kleines demo-eigenes Styling für das Kriterien-Grid (Rest kommt aus Core).
  // ---------------------------------------------------------------------------
  var css = ''
    + '.ltx-crit-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}'
    + '.ltx-crit{display:flex;justify-content:space-between;align-items:center;'
    + 'padding:8px 12px;border:1px solid var(--rr-line,#d9d9d9);border-left-width:3px;'
    + 'border-left-color:var(--rr-line,#d9d9d9);border-radius:4px;font-size:13px;'
    + 'background:var(--rr-bg,#fff)}'
    + '.ltx-crit.met{border-left-color:#2e7d32}'
    + '.ltx-crit.violated{border-left-color:#c62828}'
    + '.ltx-crit .lbl{color:var(--rr-ink-muted,#555)}'
    + '.ltx-crit .val{font-weight:600}'
    + '.rr-result-box.in{border-left-color:#2e7d32}'
    + '.rr-result-box.out{border-left-color:#c62828}'
    + '.ltx-milan-note{font-size:12px;color:var(--rr-ink-muted,#555);'
    + 'line-height:1.5;margin-top:12px}';
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ---------------------------------------------------------------------------
  // DEMO-CHROME AUFBAUEN
  // Anker-ids: row_anmeldung, row_tumorlast, mailand_anchor, .rr-app, .rr-input-pane
  // ---------------------------------------------------------------------------
  var app = document.querySelector('.rr-app');
  var anchor = document.getElementById('mailand_anchor');

  if (anchor) {
    anchor.innerHTML = ''
      + '<div class="rr-result-box" id="mailand_box">'
      + '  <div class="rr-result-value" id="mailand_value">–</div>'
      + '  <div class="rr-result-detail" id="mailand_detail">Bitte Knotenzahl und Durchmesser erfassen.</div>'
      + '</div>'
      + '<div class="ltx-crit-grid" id="ltx_crit_grid"></div>'
      + '<div class="ltx-milan-note"><strong>Mailand-Kriterien (Konsens 1996):</strong> '
      + 'solitärer Knoten ≤ 50 mm <em>oder</em> bis zu drei Knoten, alle ≤ 30 mm. '
      + 'Keine extrahepatische Manifestation, keine makrovaskuläre Invasion. '
      + 'Mehr als drei Knoten liegen außerhalb der Mailand-Kriterien.</div>';
  }

  // Vorschau-Pane als zweite Spalte
  if (app) {
    app.insertAdjacentHTML('beforeend', ''
      + '<aside class="rr-preview-pane">'
      + '  <h2 class="rr-preview-title">Befund-Vorschau</h2>'
      + '  <div class="rr-preview-title-rule"></div>'
      + '  <div class="rr-preview-section"><h4>Anmeldung</h4><div class="rr-preview-content" id="prev_anmeldung">–</div></div>'
      + '  <div class="rr-preview-section"><h4>Tumorlast</h4><div class="rr-preview-content" id="prev_tumor">–</div></div>'
      + '  <div class="rr-preview-section"><h4>Mailand / §16 TPG</h4><div class="rr-preview-content" id="prev_verdict">–</div></div>'
      + '  <div class="rr-preview-section"><h4>Beurteilung <span style="font-size:9px;color:var(--rr-ink-muted);letter-spacing:0.1em;margin-left:4px">EDITIERBAR</span></h4><textarea id="prev_beurteilung" class="rr-preview-editable"></textarea></div>'
      + '  <div class="rr-actions">'
      + '    <button id="btn_copy" type="button">Befund kopieren</button>'
      + '    <button id="btn_json" type="button" class="rr-btn-secondary">JSON</button>'
      + '    <button id="btn_reset" type="button" class="rr-btn-secondary">Zurücksetzen</button>'
      + '  </div>'
      + '  <div class="rr-export-area" id="exportArea"></div>'
      + '</aside>');
  }

  // ---------------------------------------------------------------------------
  // HELFER
  // ---------------------------------------------------------------------------
  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  function num(id) {
    var v = val(id);
    if (v === '') return null;
    var n = parseFloat(v.replace(',', '.'));
    return isNaN(n) ? null : n;
  }

  // ---------------------------------------------------------------------------
  // MAILAND-KRITERIEN (Logik portiert aus DRG calcMilan())
  // ---------------------------------------------------------------------------
  function computeMilan() {
    var diameters = [num('ltx_dm1'), num('ltx_dm2'), num('ltx_dm3')]
      .filter(function (d) { return d !== null && d > 0; });
    var nExplicit = num('ltx_n_knoten');
    // Knotenzahl: explizite Angabe hat Vorrang, sonst aus erfassten Durchmessern
    var n = (nExplicit !== null) ? Math.round(nExplicit) : diameters.length;

    var extrahepVal = val('ltx_extrahep');
    var makroVal = val('ltx_makrovask');
    var extrahep = extrahepVal === 'ja';
    var makro = makroVal === 'ja';

    var hasData = n > 0 || diameters.length > 0;

    // Größen-/Zahlkriterium
    var countOk = n >= 1 && n <= 3;
    var sizeOk = false;
    var sizeText = '–';
    if (diameters.length > 0) {
      if (n === 1) {
        sizeOk = diameters[0] <= 50;
        sizeText = diameters[0] <= 50 ? '≤ 50 mm ✓' : diameters[0] + ' mm ✗';
      } else if (n >= 2 && n <= 3) {
        var allSmall = diameters.every(function (d) { return d <= 30; });
        sizeOk = allSmall;
        sizeText = allSmall ? 'alle ≤ 30 mm ✓' : 'mind. 1 > 30 mm ✗';
      } else if (n > 3) {
        sizeText = '> 3 Knoten';
      }
    }

    return {
      hasData: hasData,
      n: n,
      countOk: countOk,
      sizeOk: sizeOk,
      sizeText: sizeText,
      extrahepSet: extrahepVal !== '',
      makroSet: makroVal !== '',
      keineExtrahep: !extrahep,
      keineMakro: !makro
    };
  }

  function renderMilan() {
    var box = document.getElementById('mailand_box');
    var value = document.getElementById('mailand_value');
    var detail = document.getElementById('mailand_detail');
    var grid = document.getElementById('ltx_crit_grid');
    if (!box || !value || !detail) return;

    var c = computeMilan();

    if (grid) {
      var items = [
        { lbl: 'Anzahl Knoten ≤ 3', ok: c.countOk, val: c.n > 0 ? String(c.n) : '–', active: c.n > 0 },
        { lbl: 'Größen erfüllt', ok: c.sizeOk, val: c.sizeText, active: c.sizeText !== '–' },
        { lbl: 'Keine extrahepat. Manifestation', ok: c.keineExtrahep, val: c.extrahepSet ? (c.keineExtrahep ? 'keine ✓' : 'vorhanden ✗') : '–', active: c.extrahepSet },
        { lbl: 'Keine makrovask. Invasion', ok: c.keineMakro, val: c.makroSet ? (c.keineMakro ? 'keine ✓' : 'Invasion ✗') : '–', active: c.makroSet }
      ];
      grid.innerHTML = items.map(function (it) {
        var cls = it.active ? (it.ok ? 'met' : 'violated') : '';
        return '<div class="ltx-crit ' + cls + '"><span class="lbl">' + it.lbl
          + '</span><span class="val">' + it.val + '</span></div>';
      }).join('');
    }

    if (!c.hasData) {
      value.textContent = '–';
      detail.innerHTML = 'Bitte Knotenzahl und Durchmesser erfassen.';
      box.className = 'rr-result-box';
      return;
    }

    var within = c.countOk && c.sizeOk && c.keineExtrahep && c.keineMakro;
    if (within) {
      value.textContent = 'Mailand erfüllt';
      detail.innerHTML = '<strong>Mailand-Kriterien erfüllt.</strong> Standard-Exception für LTx nach §16 TPG grundsätzlich möglich.';
      box.className = 'rr-result-box in';
    } else {
      value.textContent = 'Mailand nicht erfüllt';
      var v = [];
      if (!c.countOk) v.push('Knotenzahl (' + c.n + ')');
      if (!c.sizeOk) v.push('Größenkriterien');
      if (!c.keineExtrahep) v.push('extrahepat. Manifestation');
      if (!c.keineMakro) v.push('makrovaskuläre Invasion');
      detail.innerHTML = '<strong>Mailand-Kriterien nicht erfüllt.</strong> Verletzung: ' + v.join(', ') + '.';
      box.className = 'rr-result-box out';
    }
  }

  // ---------------------------------------------------------------------------
  // VORSCHAU
  // ---------------------------------------------------------------------------
  function renderPreview() {
    function selText(id) {
      var el = document.getElementById(id);
      if (!el || el.selectedIndex < 0) return '';
      var t = el.options[el.selectedIndex].text;
      return t === '–' ? '' : t;
    }
    var pa = document.getElementById('prev_anmeldung');
    if (pa) {
      var parts = [];
      if (val('ltx_etnr')) parts.push('ET-Nr.: ' + val('ltx_etnr'));
      if (val('ltx_datum_akt')) parts.push('Datum: ' + val('ltx_datum_akt'));
      if (selText('ltx_modalitaet')) parts.push('Modalität: ' + selText('ltx_modalitaet'));
      if (selText('ltx_ini_hcc')) parts.push('Initiales HCC: ' + selText('ltx_ini_hcc'));
      if (selText('ltx_verlauf')) parts.push('Verlaufsbericht: ' + selText('ltx_verlauf'));
      pa.textContent = parts.length ? parts.join(' · ') : '–';
    }
    var pt = document.getElementById('prev_tumor');
    if (pt) {
      var d = [num('ltx_dm1'), num('ltx_dm2'), num('ltx_dm3')]
        .filter(function (x) { return x !== null && x > 0; });
      var seg = [];
      if (val('ltx_n_knoten')) seg.push(val('ltx_n_knoten') + ' Knoten');
      if (d.length) seg.push('Ø ' + d.join(' / ') + ' mm');
      if (selText('ltx_extrahep')) seg.push('extrahep.: ' + selText('ltx_extrahep'));
      if (selText('ltx_makrovask')) seg.push('makrovask.: ' + selText('ltx_makrovask'));
      pt.textContent = seg.length ? seg.join(' · ') : '–';
    }
    var pv = document.getElementById('prev_verdict');
    var mv = document.getElementById('mailand_value');
    var md = document.getElementById('mailand_detail');
    if (pv && mv) {
      pv.innerHTML = '<strong>' + mv.textContent + '</strong>'
        + (md ? '<br>' + md.textContent : '');
    }
  }

  // ---------------------------------------------------------------------------
  // JSON-EXPORT (Demo)
  // ---------------------------------------------------------------------------
  function buildJson() {
    var c = computeMilan();
    return {
      template: 'HJK-MRRT-LTX-HCC-EVAL-v1.0',
      eurotransplant_nr: val('ltx_etnr') || null,
      datum: val('ltx_datum_akt') || null,
      modalitaet: val('ltx_modalitaet') || null,
      meldung_initiales_hcc: val('ltx_ini_hcc') || null,
      meldung_verlaufsbericht: val('ltx_verlauf') || null,
      hcc_gesichert: val('ltx_hcc_dx') || null,
      zirrhose_histologisch: val('ltx_lci_dx') || null,
      zweitverfahren: val('ltx_zweitverfahren') || null,
      anzahl_knoten: c.n || null,
      durchmesser_mm: [num('ltx_dm1'), num('ltx_dm2'), num('ltx_dm3')]
        .filter(function (x) { return x !== null && x > 0; }),
      extrahepatische_manifestation: val('ltx_extrahep') || null,
      makrovaskulaere_invasion: val('ltx_makrovask') || null,
      mailand_erfuellt: c.hasData
        ? (c.countOk && c.sizeOk && c.keineExtrahep && c.keineMakro)
        : null,
      freitext: val('freetext') || null
    };
  }

  // ---------------------------------------------------------------------------
  // BEFUND-TEXT
  // ---------------------------------------------------------------------------
  function buildReport() {
    var mv = document.getElementById('mailand_value');
    var md = document.getElementById('mailand_detail');
    var lines = [];
    lines.push('LTx-Evaluation HCC');
    if (val('ltx_etnr')) lines.push('Eurotransplant-Nr.: ' + val('ltx_etnr'));
    if (val('ltx_datum_akt')) lines.push('Untersuchungsdatum: ' + val('ltx_datum_akt'));
    var d = [num('ltx_dm1'), num('ltx_dm2'), num('ltx_dm3')]
      .filter(function (x) { return x !== null && x > 0; });
    if (val('ltx_n_knoten') || d.length) {
      lines.push('Tumorlast: ' + (val('ltx_n_knoten') || d.length) + ' Knoten'
        + (d.length ? ', Durchmesser ' + d.join(' / ') + ' mm' : '') + '.');
    }
    if (mv) lines.push('Beurteilung: ' + mv.textContent + '.'
      + (md ? ' ' + md.textContent.replace(/\s+/g, ' ') : ''));
    if (val('freetext')) lines.push('Ergänzung: ' + val('freetext'));
    return lines.join('\n');
  }

  // ---------------------------------------------------------------------------
  // EVENTS
  // ---------------------------------------------------------------------------
  function refresh() {
    renderMilan();
    renderPreview();
    var ta = document.getElementById('prev_beurteilung');
    if (ta && !ta.dataset.touched) {
      var mv = document.getElementById('mailand_value');
      var md = document.getElementById('mailand_detail');
      ta.value = mv ? (mv.textContent + (md ? '. ' + md.textContent : '')) : '';
    }
  }

  document.addEventListener('input', refresh);
  document.addEventListener('change', refresh);

  var taB = document.getElementById('prev_beurteilung');
  if (taB) taB.addEventListener('input', function () { taB.dataset.touched = '1'; });

  var btnCopy = document.getElementById('btn_copy');
  if (btnCopy) btnCopy.addEventListener('click', function () {
    var ta = document.getElementById('prev_beurteilung');
    var text = (ta && ta.value) ? buildReport().replace(/Beurteilung:.*/, 'Beurteilung: ' + ta.value) : buildReport();
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    var area = document.getElementById('exportArea');
    if (area) area.textContent = 'Befund in Zwischenablage kopiert.';
  });

  var btnJson = document.getElementById('btn_json');
  if (btnJson) btnJson.addEventListener('click', function () {
    var area = document.getElementById('exportArea');
    if (area) area.innerHTML = '<pre style="white-space:pre-wrap;font-size:11px;margin:0">'
      + JSON.stringify(buildJson(), null, 2) + '</pre>';
  });

  var btnReset = document.getElementById('btn_reset');
  if (btnReset) btnReset.addEventListener('click', function () {
    document.querySelectorAll('.rr-input-pane input, .rr-input-pane select, .rr-input-pane textarea')
      .forEach(function (el) {
        if (el.tagName === 'SELECT') el.selectedIndex = 0; else el.value = '';
      });
    var ta = document.getElementById('prev_beurteilung');
    if (ta) { ta.value = ''; delete ta.dataset.touched; }
    var area = document.getElementById('exportArea');
    if (area) area.textContent = '';
    refresh();
  });

  // INIT
  refresh();
})();
