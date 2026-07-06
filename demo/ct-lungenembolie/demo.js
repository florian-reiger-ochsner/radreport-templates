// =============================================================================
// Demo-Interaktivität für "CT Lungenarterien (CTPA) – Lungenembolie" (v1.0)
//
// ABGELEITET / Demo-Schicht: Dieses Skript gehört NICHT ins kanonische
// template.html (das ist nacktes, JS-freies, form-only MRRT). Es baut das
// Viewer-Chrome (RV/LV-Ratio-Ergebnisbox, LE-Pill, Live-Vorschau,
// Beurteilungsvorschlag, Export-/Aktions-Buttons, FHIR-Ausgabe, Status-Badge)
// zur Laufzeit auf und liefert die gesamte Interaktivität für die
// GitHub-Pages-Demo. Eingebunden via build-demo.js in demo/index.html.
//
// Feldsatz anschlussfähig an DRG-Template 041807.2.1806120000 (CC BY 4.0).
// Risikostratifizierung: RV/LV-Ratio ≥ 1,0 nach ESC 2019.
// =============================================================================

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Demo-eigenes Styling (Chips, Checkbox-Gruppen, Toggle-Farben, Pill,
  // RV/LV-Box, Vorschlag, Badge). Grundlayout kommt aus radreport-core.css.
  // ---------------------------------------------------------------------------
  var css = ''
    + '.ctpa-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}'
    + '.ctpa-chips input{display:none}'
    + '.ctpa-chip{padding:5px 13px;border-radius:18px;border:1px solid var(--rr-field-border);'
    + 'font-size:12.5px;color:var(--rr-ink-soft);cursor:pointer;transition:all .15s;user-select:none}'
    + '.ctpa-chip:hover{border-color:var(--rr-accent);color:var(--rr-accent)}'
    + '.ctpa-chip input:checked+span{color:#fff}'
    + '.ctpa-chip:has(input:checked){background:var(--rr-accent);color:#fff;border-color:var(--rr-accent);font-weight:500}'
    + '.ctpa-checkgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px 20px;'
    + 'background:var(--rr-bg-alt);border:1px solid var(--rr-rule);border-radius:var(--rr-radius);'
    + 'padding:14px 16px;margin-top:12px}'
    + '.ctpa-col-head{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;'
    + 'color:var(--rr-ink-muted);margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--rr-rule)}'
    + '.ctpa-checkrow{display:flex;flex-wrap:wrap;gap:8px 16px;margin-top:6px}'
    + '.ctpa-check{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:var(--rr-ink-soft)}'
    + '.ctpa-check input{width:14px;height:14px;accent-color:var(--rr-accent);cursor:pointer;flex-shrink:0}'
    + '.ctpa-check:has(input:checked){color:var(--rr-accent);font-weight:500}'
    // LE-Toggle Farbcodierung (Positiv rot / Negativ grün / Fraglich gelb)
    + '#le_ja:checked+label{background:var(--rr-critical);border-color:var(--rr-critical);color:#fff}'
    + '#le_nein:checked+label{background:var(--rr-success);border-color:var(--rr-success);color:#fff}'
    + '#le_fraglich:checked+label{background:var(--rr-warn);border-color:var(--rr-warn);color:#fff}'
    // RV/LV-Box Zustände
    + '.rr-result-box.high{background:linear-gradient(to right,#fdf0ef,var(--rr-bg-alt));border-color:var(--rr-critical)}'
    + '.rr-result-box.high .rr-result-value{color:var(--rr-critical)}'
    + '.rr-result-box.low{background:linear-gradient(to right,#ecf7f2,var(--rr-bg-alt));border-color:var(--rr-success)}'
    + '.rr-result-box.low .rr-result-value{color:var(--rr-success)}'
    // Preview-Pill
    + '.ctpa-pill{display:inline-block;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:700}'
    + '.ctpa-pill.ja{background:#fdf0ef;color:var(--rr-critical);border:1px solid var(--rr-critical)}'
    + '.ctpa-pill.nein{background:#ecf7f2;color:var(--rr-success);border:1px solid var(--rr-success)}'
    + '.ctpa-pill.fraglich{background:#fdf6ec;color:var(--rr-warn);border:1px solid var(--rr-warn)}'
    // Vorschlag
    + '.ctpa-vorschlag{background:var(--rr-accent-pale);border-left:3px solid var(--rr-accent);'
    + 'border-radius:0 var(--rr-radius) var(--rr-radius) 0;padding:9px 13px;font-size:12px;'
    + 'color:var(--rr-ink-soft);margin-top:8px;cursor:pointer}'
    + '.ctpa-vorschlag strong{color:var(--rr-accent)}'
    // Status-Badge
    + '.ctpa-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:11px;'
    + 'font-size:12px;font-weight:600;margin-top:12px}'
    + '.ctpa-badge.ok{background:#ecf7f2;color:var(--rr-success)}'
    + '.ctpa-badge.warn{background:#fdf6ec;color:var(--rr-warn)}'
    + '.ctpa-badge.alert{background:#fdf0ef;color:var(--rr-critical)}';
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ---------------------------------------------------------------------------
  // DEMO-CHROME AUFBAUEN
  // ---------------------------------------------------------------------------
  var app = document.querySelector('.rr-app');
  var anchor = document.getElementById('anchor_rvlv');

  if (anchor) {
    anchor.innerHTML = ''
      + '<div class="rr-result-box" id="rvlv_box">'
      + '  <div class="rr-result-value" id="rvlv_val">–</div>'
      + '  <div class="rr-result-detail">'
      + '    <div id="rvlv_risk" style="font-weight:600">RV/LV-Ratio – Werte eingeben</div>'
      + '    <div id="rvlv_detail">RV- und LV-Durchmesser eingeben</div>'
      + '  </div>'
      + '</div>';
  }

  if (app) {
    app.insertAdjacentHTML('beforeend', ''
      + '<aside class="rr-preview-pane">'
      + '  <h2 class="rr-preview-title">Befund-Vorschau (Live)</h2>'
      + '  <div class="rr-preview-title-rule"></div>'
      + '  <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:6px">'
      + '    <strong id="prev_sub" style="font-size:12px;color:var(--rr-ink-muted)">Lungenembolie-Ausschluss</strong>'
      + '    <span class="ctpa-pill nein" id="le_pill">LE negativ</span>'
      + '  </div>'
      + '  <div class="rr-preview-section"><h4>Technik</h4><div class="rr-preview-content" id="prev_technik">–</div></div>'
      + '  <div class="rr-preview-section"><h4>Befund</h4><div class="rr-preview-content" id="prev_befund">–</div></div>'
      + '  <div class="rr-preview-section"><h4>Beurteilung</h4><div class="rr-preview-content" id="prev_beurt">–</div></div>'
      + '  <div id="vorschlag_box"></div>'
      + '  <div class="rr-actions">'
      + '    <button id="btn_copy" type="button">Befundtext kopieren</button>'
      + '    <button id="btn_fhir" type="button" class="rr-btn-secondary">FHIR-Export</button>'
      + '    <button id="btn_reset" type="button" class="rr-btn-secondary">Zurücksetzen</button>'
      + '  </div>'
      + '  <div class="rr-export-area" id="fhir_box"></div>'
      + '  <div class="ctpa-badge warn" id="status_badge">● Befund ausfüllen</div>'
      + '</aside>');
  }

  // ---------------------------------------------------------------------------
  // HELFER
  // ---------------------------------------------------------------------------
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function num(id) {
    var v = val(id);
    if (v === '') return null;
    var n = parseFloat(v.replace(',', '.'));
    return isNaN(n) ? null : n;
  }
  function chk(id) { var el = document.getElementById(id); return !!(el && el.checked); }
  function getLe() {
    var r = document.querySelector('input[name=le_nachweis]:checked');
    return r ? r.value : 'nein';
  }

  // ---------------------------------------------------------------------------
  // RV/LV-KALKULATOR
  // ---------------------------------------------------------------------------
  function renderRVLV() {
    var box = document.getElementById('rvlv_box');
    var valEl = document.getElementById('rvlv_val');
    var riskEl = document.getElementById('rvlv_risk');
    var detEl = document.getElementById('rvlv_detail');
    if (!box || !valEl) return;

    var rv = num('rv_dia'), lv = num('lv_dia');
    if (rv === null || lv === null || lv === 0) {
      valEl.textContent = '–';
      riskEl.textContent = 'RV/LV-Ratio – Werte eingeben';
      detEl.textContent = 'RV- und LV-Durchmesser eingeben';
      box.className = 'rr-result-box';
      return;
    }
    var ratio = rv / lv;
    valEl.textContent = ratio.toFixed(2);
    if (ratio >= 1.0) {
      box.className = 'rr-result-box high';
      riskEl.textContent = '⚠ Erhöhtes Risiko – RV/LV ≥ 1,0';
      detEl.textContent = 'RV ' + rv + ' mm / LV ' + lv + ' mm → Rechtsherzbelastung wahrscheinlich (ESC 2019)';
    } else {
      box.className = 'rr-result-box low';
      riskEl.textContent = '✓ Niedriges Risiko – RV/LV < 1,0';
      detEl.textContent = 'RV ' + rv + ' mm / LV ' + lv + ' mm → Kein Hinweis auf relevante Rechtsherzbelastung';
    }
  }

  // ---------------------------------------------------------------------------
  // TEXT-BAUSTEINE
  // ---------------------------------------------------------------------------
  function joinChecks(pairs) {
    return pairs.filter(function (p) { return chk(p[0]); }).map(function (p) { return p[1]; });
  }

  function buildTechnik() {
    var t = 'CT Pulmonalisangiographie (CTPA)';
    if (val('km_menge')) t += ', KM ' + val('km_menge') + ' ml i.v.';
    t += '. ';
    if (val('bolus')) t += 'Kontrastierung: ' + val('bolus') + '. ';
    if (val('ddimer')) t += 'D-Dimer: ' + val('ddimer') + ' mg/l FEU. ';
    if (val('fragestellung')) t += 'Fragestellung: ' + val('fragestellung') + '. ';
    if (val('vgl_ja') === 'yes') {
      t += 'Vergleichsuntersuchung' + (val('vgl_dat') ? ' vom ' + val('vgl_dat') : '') + ' liegt vor.';
    }
    return t.trim();
  }

  function buildBefund() {
    var lines = [];
    var le = getLe();

    if (le === 'nein') {
      lines.push('Lungenembolie: Kein Hinweis auf Lungenembolie. Die Lungenarterien bis in die Subsegmentarterien regelrecht kontrastiert und frei durchströmbar.');
    } else if (le === 'fraglich') {
      lines.push('Lungenembolie: Fraglich – suboptimale Kontrastierung / nicht sicher abgrenzbare Füllungsdefekte. Klinische Korrelation empfohlen.');
    } else {
      var ebenen = joinChecks([
        ['lok_zentral', 'zentral'], ['lok_lobär', 'lobär'],
        ['lok_segmental', 'segmental'], ['lok_subsegmental', 'subsegmental']
      ]);
      lines.push('Lungenembolie: Nachweis einer Lungenembolie'
        + (ebenen.length ? ' (' + ebenen.join(', ') + ')' : '') + '.');

      var beteiligte = joinChecks([
        ['loc_trpulm_re', 'Truncus/A. pulmonalis re.'], ['loc_ol_re', 'Oberlappen re.'],
        ['loc_ml_re', 'Mittellappen re.'], ['loc_ul_re', 'Unterlappen re.'],
        ['loc_trpulm_li', 'A. pulmonalis li.'], ['loc_ol_li', 'Oberlappen/Lingula li.'],
        ['loc_ul_li', 'Unterlappen li.']
      ]);
      if (beteiligte.length) lines.push('Beteiligte Abschnitte: ' + beteiligte.join(', ') + '.');

      var alt = joinChecks([
        ['alt_dil', 'dilatierte Bronchialarterien'], ['alt_wand', 'wandständige Thromben'],
        ['alt_webs', 'Webs/Bands']
      ]);
      if (alt.length) lines.push('Zeichen älterer Embolien: ' + alt.join(', ') + '.');
    }

    // Rechtsherzbelastung
    var rv = num('rv_dia'), lv = num('lv_dia'), trpD = num('trpulm_dia');
    var rhbLine = 'Rechtsherzbelastung:';
    if (rv !== null && lv !== null && lv > 0) {
      rhbLine += ' RV/LV-Ratio: ' + (rv / lv).toFixed(2) + ' (RV ' + rv + ' mm, LV ' + lv + ' mm).';
    }
    if (trpD !== null) rhbLine += ' Truncus pulmonalis-Ø ' + trpD + ' mm.';
    if (val('rhb_qual')) rhbLine += ' ' + val('rhb_qual') + '.';
    if (val('ivs_shift')) rhbLine += ' ' + val('ivs_shift') + '.';
    if (val('km_stau')) rhbLine += ' ' + val('km_stau') + '.';
    lines.push(rhbLine);

    // Weitere Thorax-Befunde
    var paren = joinChecks([
      ['par_norm', 'unauffällig'], ['par_infarkt', 'Infarktpneumonie'],
      ['par_hampton', 'Hamptons Hump'], ['par_konsol', 'Konsolidierung/Infiltrat'],
      ['par_ggo', 'Milchglastrübung'], ['par_emph', 'Emphysem']
    ]).join(', ') || '–';
    var hgef = joinChecks([
      ['hg_unauf', 'unauffällig'], ['hg_peri', 'Perikarderguss'], ['hg_ao', 'Aortensklerose']
    ]).join(', ') || '–';
    var kn = joinChecks([
      ['kno_norm', 'unauffällig'], ['kno_deg', 'degenerativ'], ['kno_dest', 'Destruktion/Metastase']
    ]).join(', ') || '–';

    lines.push('Pleura: ' + (val('pleura') || '–')
      + '. Lungenparenchym: ' + paren
      + '. Zentrale Atemwege: ' + (val('atemwege') || '–')
      + '. Lymphknoten mediastinal: ' + (val('lymph') || '–')
      + '. Herz und übrige Gefäße: ' + hgef
      + '. Oberbauch: ' + (val('oberbauch') || '–')
      + '. Knochen: ' + kn + '.');
    if (val('sonstiges')) lines.push('Sonstiges: ' + val('sonstiges'));

    return lines.join('\n');
  }

  function buildVorschlag() {
    var le = getLe();
    if (le === 'nein') return 'CTPA: Kein Hinweis auf Lungenembolie. Keine Rechtsherzbelastungszeichen.';
    if (le === 'fraglich') return 'CTPA: Fraglicher Befund – klinische Korrelation und ggf. weiterführende Diagnostik empfohlen.';

    var ebenen = joinChecks([
      ['lok_zentral', 'zentral'], ['lok_lobär', 'lobär'],
      ['lok_segmental', 'segmental'], ['lok_subsegmental', 'subsegmental']
    ]);
    var rv = num('rv_dia'), lv = num('lv_dia');
    var v = 'CTPA: Nachweis einer Lungenembolie'
      + (ebenen.length ? ' (' + ebenen.join(', ') + ')' : '') + '.';
    if (val('rhb_qual')) v += ' ' + val('rhb_qual') + '.';
    if (rv !== null && lv !== null && lv > 0) v += ' RV/LV-Ratio ' + (rv / lv).toFixed(2) + '.';
    if (val('ivs_shift') && val('ivs_shift') !== 'kein IVS-Shift') v += ' ' + val('ivs_shift') + '.';
    v += ' Klinische Korrelation empfohlen.';
    return v;
  }

  // ---------------------------------------------------------------------------
  // PILL / STATUS
  // ---------------------------------------------------------------------------
  function updatePill(le) {
    var pill = document.getElementById('le_pill');
    if (!pill) return;
    pill.className = 'ctpa-pill ' + le;
    pill.textContent = le === 'ja' ? '⚠ LE positiv' : le === 'nein' ? '✓ LE negativ' : '? LE fraglich';
  }

  // ---------------------------------------------------------------------------
  // VORSCHAU
  // ---------------------------------------------------------------------------
  function renderPreview() {
    var le = getLe();
    document.getElementById('prev_technik').textContent = buildTechnik();
    document.getElementById('prev_befund').textContent = buildBefund();
    document.getElementById('prev_beurt').textContent = val('beurt') || '—';
    document.getElementById('prev_sub').textContent =
      le === 'ja' ? 'LE positiv' : le === 'fraglich' ? 'LE fraglich' : 'LE ausgeschlossen';
    updatePill(le);

    var vbox = document.getElementById('vorschlag_box');
    if (!val('beurt')) {
      vbox.innerHTML = '<div class="ctpa-vorschlag" id="vorschlag_apply" title="Klicken zum Übernehmen">'
        + '<strong>Vorschlag (klicken):</strong><br>' + buildVorschlag() + '</div>';
      var apply = document.getElementById('vorschlag_apply');
      if (apply) apply.addEventListener('click', function () {
        document.getElementById('beurt').value = buildVorschlag();
        refresh();
      });
    } else {
      vbox.innerHTML = '';
    }

    var badge = document.getElementById('status_badge');
    var hasBeurt = val('beurt').length > 5;
    if (le === 'ja' && !hasBeurt) { badge.className = 'ctpa-badge alert'; badge.textContent = '⚠ LE positiv – Beurteilung fehlt'; }
    else if (!hasBeurt) { badge.className = 'ctpa-badge warn'; badge.textContent = '● Beurteilung fehlt'; }
    else if (le === 'ja') { badge.className = 'ctpa-badge alert'; badge.textContent = '⚠ LE positiv dokumentiert'; }
    else { badge.className = 'ctpa-badge ok'; badge.textContent = '✓ Vollständig'; }
  }

  // ---------------------------------------------------------------------------
  // FHIR-EXPORT (R4 Bundle)
  // ---------------------------------------------------------------------------
  function buildFhir() {
    var now = new Date().toISOString();
    var le = getLe();
    var rv = num('rv_dia'), lv = num('lv_dia');
    var obsArr = [];

    var leRid = le === 'ja' ? 'RID5352' : le === 'nein' ? 'RID5352-neg' : 'RID5352-frag';
    var leEn = le === 'ja' ? 'pulmonary embolism' : le === 'nein' ? 'no pulmonary embolism' : 'indeterminate for pulmonary embolism';
    obsArr.push({ fullUrl: 'urn:uuid:pe-obs', resource: {
      resourceType: 'Observation', status: 'final', id: 'pe-obs',
      code: { coding: [
        { system: 'http://radlex.org', code: leRid, display: leEn },
        { system: 'http://snomed.info/sct', code: '59282003', display: 'Pulmonary embolism' }
      ] },
      valueString: le === 'ja' ? 'Lungenembolie nachgewiesen' : le === 'nein' ? 'Keine Lungenembolie' : 'Fraglich',
      interpretation: le === 'ja' ? [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'A', display: 'Abnormal' }] }] : undefined
    } });

    if (rv !== null && lv !== null && lv > 0) {
      var ratio = parseFloat((rv / lv).toFixed(2));
      obsArr.push({ fullUrl: 'urn:uuid:rvlv-obs', resource: {
        resourceType: 'Observation', status: 'final', id: 'rvlv-obs',
        code: { coding: [
          { system: 'http://radlex.org', code: 'RID5076', display: 'RV/LV ratio' },
          { system: 'http://loinc.org', code: '79900-0', display: 'Right ventricular internal diameter' }
        ] },
        valueQuantity: { value: ratio, unit: 'ratio' },
        interpretation: ratio >= 1.0 ? [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'H', display: 'High' }] }] : undefined,
        component: [
          { code: { coding: [{ system: 'http://radlex.org', code: 'RID5069', display: 'right ventricular diameter' }] }, valueQuantity: { value: rv, unit: 'mm' } },
          { code: { coding: [{ system: 'http://radlex.org', code: 'RID5073', display: 'left ventricular diameter' }] }, valueQuantity: { value: lv, unit: 'mm' } }
        ]
      } });
    }

    var dr = {
      resourceType: 'DiagnosticReport', status: 'final', id: 'ctpa-report',
      code: { coding: [
        { system: 'http://loinc.org', code: '24634-8', display: 'CT Pulmonary Angiography' },
        { system: 'http://radlex.org', code: 'RID10361', display: 'CT pulmonary angiography' }
      ] },
      effectiveDateTime: now,
      identifier: [
        { value: 'HJK-MRRT-CT-LUNGENEMBOLIE-v1.0' },
        { system: 'http://drg.de', value: 'DRG-041807.2.1806120000-CC-BY-4.0' }
      ],
      conclusion: val('beurt'),
      result: obsArr.map(function (o) { return { reference: o.fullUrl }; }),
      presentedForm: [{ contentType: 'text/plain', title: 'CT Lungenarterien CTPA',
        data: btoa(unescape(encodeURIComponent(
          'TECHNIK\n' + buildTechnik() + '\n\nBEFUND\n' + buildBefund() + '\n\nBEURTEILUNG\n' + val('beurt')
        ))) }]
    };

    return JSON.stringify({
      resourceType: 'Bundle', type: 'document', timestamp: now,
      meta: { tag: [
        { system: 'http://hjk.wien/fhir/CodeSystem/radiology-templates', code: 'radlex-coded' },
        { system: 'http://drg.de', code: 'drg-cc-by-4.0' }
      ] },
      entry: [{ fullUrl: 'urn:uuid:ctpa-report', resource: dr }].concat(obsArr)
    }, null, 2);
  }

  // ---------------------------------------------------------------------------
  // EVENTS
  // ---------------------------------------------------------------------------
  function refresh() {
    renderRVLV();
    renderPreview();
  }

  document.addEventListener('input', refresh);
  document.addEventListener('change', refresh);

  var btnCopy = document.getElementById('btn_copy');
  if (btnCopy) btnCopy.addEventListener('click', function () {
    var t = 'CT LUNGENARTERIEN (CTPA)\n'
      + new Date().toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + '\n\nTECHNIK\n' + buildTechnik()
      + '\n\nBEFUND\n' + buildBefund()
      + '\n\nBEURTEILUNG\n' + val('beurt');
    if (navigator.clipboard) navigator.clipboard.writeText(t);
    btnCopy.textContent = '✓ Kopiert!';
    setTimeout(function () { btnCopy.textContent = 'Befundtext kopieren'; }, 2000);
  });

  var btnFhir = document.getElementById('btn_fhir');
  if (btnFhir) btnFhir.addEventListener('click', function () {
    var box = document.getElementById('fhir_box');
    if (box.classList.contains('rr-is-visible')) { box.classList.remove('rr-is-visible'); return; }
    box.innerHTML = '<pre style="white-space:pre;overflow:auto;font-size:11px;margin:0">' + buildFhir() + '</pre>';
    box.classList.add('rr-is-visible');
  });

  var btnReset = document.getElementById('btn_reset');
  if (btnReset) btnReset.addEventListener('click', function () {
    if (!confirm('Alle Eingaben zurücksetzen?')) return;
    document.querySelectorAll('.rr-input-pane select').forEach(function (s) { s.selectedIndex = 0; });
    document.querySelectorAll('.rr-input-pane input[type=text], .rr-input-pane input[type=number], .rr-input-pane textarea')
      .forEach(function (i) { i.value = ''; });
    document.querySelectorAll('.rr-input-pane input[type=checkbox], .rr-input-pane input[type=radio]')
      .forEach(function (c) { c.checked = false; });
    var box = document.getElementById('fhir_box');
    if (box) { box.classList.remove('rr-is-visible'); box.innerHTML = ''; }
    refresh();
  });

  // INIT
  refresh();
})();
