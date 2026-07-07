// =============================================================================
// Demo-Interaktivität für "CT Schädel nativ (CCT)" (v1.1)
//
// ABGELEITET / Demo-Schicht: gehört NICHT ins kanonische template.html (nacktes,
// JS-freies, form-only MRRT). Baut das Viewer-Chrome zur Laufzeit:
//   - Normalbefund-Makro (bewusster Attestierungsakt, kein Default)
//   - Tri-State-Reveal je Region (— / o.B. / Befund → Detail einblenden)
//   - Live-Befundvorschau (Technik · Befund · Beurteilung) + Status-Badge
//   - klickbarer Beurteilungs-Vorschlag
//   - Kopier-/FHIR-/Reset-Buttons
//   - data-show-if-Sichtbarkeitslogik (Vergleichsdatum)
//
// Textbau (neg-Sätze + build(st) je Region), Normalbefund-Makro und
// FHIR-Bundle verbatim portiert aus dem abgelösten Inline-Template. Die
// Regionen selbst sind im kanonischen template.html deklariert; demo.js liest
// sie über data-region / data-f / data-radlex / data-en aus dem DOM.
// Eingebunden via build-demo.js in demo/index.html.
// =============================================================================

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 0. REGION-TEXTLOGIK (Core/Canonical kennen keinen Satzbau)
  //    key muss dem data-region im kanonischen Template entsprechen.
  // ---------------------------------------------------------------------------
  var REGIONS = [
    {
      key: 'blutung',
      neg: 'Keine intra- oder extraaxiale Blutung.',
      build: function (st) {
        if (st === 'ob') return this.neg;
        var types = [].slice.call(document.querySelectorAll('#rd-blutung input[data-bt]:checked'))
          .map(function (c) { return c.parentElement.querySelector('span').textContent; });
        var seite = rf('blutung', 'seite'), dicke = rf('blutung', 'dicke'),
            alter = rf('blutung', 'alter'), lok = rf('blutung', 'lok');
        if (!types.length && !lok) return 'Intrakranielle Blutung: Typ bitte spezifizieren.';
        var s = 'Blutung: ' + (types.length ? types.join(', ') : 'Blutung');
        if (seite) s += ' ' + seite;
        if (alter) s += ', ' + alter;
        if (dicke) s += ', max. ' + dicke + ' mm';
        if (lok) s += ' (' + lok + ')';
        return s + '.';
      }
    },
    {
      key: 'ischaemie',
      neg: 'Keine Infarktfrühzeichen, keine umschriebene Hypodensität, Mark-Rinden-Differenzierung erhalten.',
      build: function (st) {
        if (st === 'ob') return this.neg;
        var stad = rf('ischaemie', 'stadium'), terr = rf('ischaemie', 'territorium'),
            seite = rf('ischaemie', 'seite'), asp = rf('ischaemie', 'aspects'),
            ht = rf('ischaemie', 'ht'), lok = rf('ischaemie', 'lok');
        var s = 'Ischämie: ' + (stad || 'Ischämiezeichen');
        if (terr) s += ' im ' + terr + '-Stromgebiet';
        if (seite) s += ' ' + seite;
        if (asp !== '') s += ', ASPECTS ' + asp;
        if (ht && ht !== 'keine') s += ', hämorrhagische Transformation: ' + ht;
        else if (ht === 'keine') s += ', keine hämorrhagische Transformation';
        if (lok) s += ' (' + lok + ')';
        return s + '.';
      }
    },
    {
      key: 'raumforderung',
      neg: 'Kein Nachweis einer intrakraniellen Raumforderung.',
      build: function (st) {
        if (st === 'ob') return this.neg;
        var lok = rf('raumforderung', 'lok'), gr = rf('raumforderung', 'groesse'),
            oe = rf('raumforderung', 'oedem'), ch = rf('raumforderung', 'char');
        var s = 'Raumforderung' + (lok ? ' ' + lok : '');
        if (gr) s += ', ' + gr + ' mm';
        if (oe === 'vorhanden') s += ', mit perifokalem Ödem';
        else if (oe === 'kein') s += ', ohne perifokales Ödem';
        if (ch) s += ' (' + ch + ')';
        return s + '.';
      }
    },
    {
      key: 'mittellinie',
      neg: 'Mittellinie mittelständig. Keine raumfordernde Wirkung, keine Herniation. Basale Zisternen frei.',
      build: function (st) {
        if (st === 'ob') return this.neg;
        var mls = rf('mittellinie', 'mls'), ri = rf('mittellinie', 'richtung'),
            he = rf('mittellinie', 'herniation'), zi = rf('mittellinie', 'zisternen');
        var parts = [];
        if (mls) parts.push('Mittellinienverlagerung ' + mls + ' mm' + (ri ? ' ' + ri : ''));
        else parts.push('Mittellinie mittelständig');
        if (he) parts.push(he);
        if (zi) parts.push('basale Zisternen ' + zi);
        return parts.join(', ') + '.';
      }
    },
    {
      key: 'ventrikel',
      neg: 'Inneres und äußeres Liquorraumsystem altersentsprechend konfiguriert, kein Hydrozephalus.',
      build: function (st) {
        if (st === 'ob') return this.neg;
        var inn = rf('ventrikel', 'innen'), au = rf('ventrikel', 'aussen'), lok = rf('ventrikel', 'lok');
        var parts = [];
        if (inn) parts.push('innere Liquorräume ' + inn);
        if (au) parts.push('äußere Liquorräume ' + au);
        var s = (parts.length ? 'Liquorräume: ' + parts.join(', ') : 'Liquorräume: siehe Freitext');
        if (lok) s += ' (' + lok + ')';
        return s + '.';
      }
    },
    {
      key: 'parenchym',
      neg: 'Hirnparenchym regelrecht, Mark-Rinden-Differenzierung erhalten, keine fokalen Dichteveränderungen.',
      build: function (st) {
        if (st === 'ob') return this.neg;
        var fa = rf('parenchym', 'fazekas'), de = rf('parenchym', 'defekte'), lok = rf('parenchym', 'lok');
        var parts = [];
        if (fa) parts.push('Marklager: ' + fa);
        if (de && de !== 'keine') parts.push('alte Defekte: ' + de);
        else if (de === 'keine') parts.push('keine alten Defekte');
        var s = parts.length ? 'Parenchym: ' + parts.join(', ') : 'Parenchym: siehe Freitext';
        if (lok) s += ' (' + lok + ')';
        return s + '.';
      }
    },
    {
      key: 'extraaxial',
      neg: 'Kalvaria intakt, kein Frakturnachweis. Miterfasste NNH und Mastoide unauffällig pneumatisiert. Weichteile unauffällig.',
      build: function (st) {
        if (st === 'ob') return this.neg;
        var ka = rf('extraaxial', 'kalvaria'), nn = rf('extraaxial', 'nnh'),
            we = rf('extraaxial', 'weichteile'), lok = rf('extraaxial', 'lok');
        var parts = [];
        if (ka) parts.push('Kalvaria: ' + ka);
        if (nn) parts.push('NNH/Mastoid: ' + nn);
        if (we) parts.push('Weichteile: ' + we);
        var s = parts.length ? parts.join(', ') : 'Kalvaria/NNH/Weichteile: siehe Freitext';
        if (lok) s += ' (' + lok + ')';
        return s + '.';
      }
    }
  ];

  function regEl(key) { return document.getElementById('rg-' + key); }
  function isCrit(key) { var e = regEl(key); return !!(e && e.dataset.crit === '1'); }
  function regRadlex(key) { var e = document.getElementById('rd-' + key); return e ? (e.dataset.radlex || '') : ''; }
  function regEn(key) { var e = document.getElementById('rd-' + key); return e ? (e.dataset.en || '') : ''; }
  function regStatus(key) {
    var r = document.querySelector('input[name=st_' + key + ']:checked');
    return r ? r.value : '';
  }
  // Feld-Lesehelfer innerhalb einer Region: data-f Attribut
  function rf(key, f) {
    var el = document.querySelector('#rd-' + key + ' [data-f="' + f + '"]');
    return el ? (el.value || '').trim() : '';
  }
  var gv = function (id) { var e = document.getElementById(id); return e ? (e.value || '').trim() : ''; };

  // ---------------------------------------------------------------------------
  // 1. DEMO-STYLING (Core kennt keine Region-/Tri-/Chip-/Makro-/Badge-Klassen)
  // ---------------------------------------------------------------------------
  var css = ''
    + '.rr-macro-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;'
    + 'background:linear-gradient(to right,var(--rr-accent-pale),var(--rr-bg-alt));'
    + 'border:1px solid var(--rr-accent-pale);border-radius:var(--rr-radius);padding:12px 15px;margin:16px 0 4px}'
    + '.rr-macro-bar .macro-txt{flex:1;min-width:200px;font-size:12px;color:var(--rr-ink-soft);line-height:1.45}'
    + '.rr-macro-bar .macro-txt strong{color:var(--rr-accent)}'
    + '.rr-macro-bar button{background:var(--rr-success);color:#fff;white-space:nowrap;border:none;'
    + 'border-radius:var(--rr-radius);padding:9px 16px;font:inherit;font-weight:600;cursor:pointer}'
    + '.rr-macro-bar button:hover{filter:brightness(1.07)}'
    + '.rr-region{border:1px solid var(--rr-rule);border-radius:var(--rr-radius);margin-bottom:10px;'
    + 'background:var(--rr-bg);transition:border-color .15s}'
    + '.rr-region.is-bef{border-color:var(--rr-accent-light)}'
    + '.rr-region.is-crit{border-color:var(--notfall)}'
    + '.rr-region-head{display:flex;align-items:center;gap:12px;padding:11px 14px}'
    + '.rr-region-name{flex:1;font-size:13.5px;font-weight:600;color:var(--rr-ink)}'
    + '.rr-tri{display:inline-flex;border:1px solid var(--rr-field-border);border-radius:var(--rr-radius);'
    + 'overflow:hidden;flex-shrink:0}'
    + '.rr-tri input[type=radio]{display:none}'
    + '.rr-tri label{padding:6px 13px;cursor:pointer;font-size:12px;font-weight:500;background:var(--rr-bg);'
    + 'color:var(--rr-ink-soft);transition:all .12s;border-right:1px solid var(--rr-field-border);margin:0}'
    + '.rr-tri label:last-child{border-right:none}'
    + '.rr-tri label:hover{background:var(--rr-bg-alt)}'
    + '.rr-tri .t-unset{color:var(--rr-ink-faint)}'
    + '.rr-tri input.t-unset-in:checked+label{background:var(--rr-ink-faint);color:#fff}'
    + '.rr-tri input.t-ob-in:checked+label{background:var(--rr-success);color:#fff;font-weight:600}'
    + '.rr-tri input.t-bef-in:checked+label{background:var(--rr-accent);color:#fff;font-weight:600}'
    + '.rr-region.is-crit .rr-tri input.t-bef-in:checked+label{background:var(--notfall)}'
    + '.rr-region-detail{display:none;padding:2px 14px 14px;border-top:1px solid var(--rr-rule-soft)}'
    + '.rr-region.is-bef .rr-region-detail{display:block}'
    + '.rr-cg{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}'
    + '.rr-ci{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid var(--rr-field-border);'
    + 'border-radius:16px;font-size:12.5px;color:var(--rr-ink-soft);cursor:pointer;transition:all .12s;user-select:none}'
    + '.rr-ci:hover{border-color:var(--rr-accent-light)}'
    + '.rr-ci input{width:auto;margin:0}'
    + '.rr-ci:has(input:checked){background:var(--rr-accent-pale);border-color:var(--rr-accent);'
    + 'color:var(--rr-accent);font-weight:600}'
    + '.rr-vorschlag{background:var(--rr-accent-pale);border-left:3px solid var(--rr-accent);'
    + 'border-radius:0 var(--rr-radius) var(--rr-radius) 0;padding:9px 13px;font-size:12px;'
    + 'color:var(--rr-ink-soft);margin:8px 0 0;cursor:pointer}'
    + '.rr-vorschlag strong{color:var(--rr-accent)}'
    + '.rr-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:11px;'
    + 'font-size:12px;font-weight:600;margin-top:12px}'
    + '.rr-badge.ok{background:#ecf7f2;color:var(--rr-success)}'
    + '.rr-badge.warn{background:#fdf6ec;color:var(--rr-warn)}'
    + '.rr-badge.crit{background:var(--notfall-pale);color:var(--notfall)}'
    + '[data-show-if]{display:none}[data-show-if].rr-shown{display:grid}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var pane = document.querySelector('.rr-input-pane');
  var app = document.querySelector('.rr-app');

  // ---------------------------------------------------------------------------
  // 2. NORMALBEFUND-MAKRO (vor die Regionen injizieren)
  // ---------------------------------------------------------------------------
  var regionsWrap = document.getElementById('befund_regions');
  if (regionsWrap) {
    regionsWrap.insertAdjacentHTML('beforebegin',
      '<div class="rr-macro-bar">'
      + '<div class="macro-txt"><strong>Additives Modell:</strong> Keine Region ist vorbelegt. '
      + 'Sie <strong>attestieren</strong> (o.&nbsp;B.) oder <strong>fügen Pathologie hinzu</strong> (Befund). '
      + 'Der Makro setzt alle offenen Regionen in einem Akt auf o.&nbsp;B. — als bewusste Attestierung, kein stiller Default.</div>'
      + '<button type="button" id="btn-normal">✓ Normalbefund attestieren</button>'
      + '</div>');
  }

  // ---------------------------------------------------------------------------
  // 3. VORSCHLAG-BOX (nach Beurteilungs-Zeile injizieren)
  // ---------------------------------------------------------------------------
  var beurtRow = document.getElementById('beurt_row');
  if (beurtRow) {
    beurtRow.insertAdjacentHTML('afterend', '<div id="vorschlag-box"></div>');
  }

  // ---------------------------------------------------------------------------
  // 4. PREVIEW-PANE + AKTIONEN (an .rr-app anhängen)
  // ---------------------------------------------------------------------------
  if (app) {
    app.insertAdjacentHTML('beforeend',
      '<aside class="rr-preview-pane">'
      + '<h2 class="rr-preview-title">Befund-Vorschau (Live)</h2><div class="rr-preview-title-rule"></div>'
      + '<div class="rr-preview-section"><h4>Technik</h4><div class="rr-preview-content" id="prev-technik">–</div></div>'
      + '<div class="rr-preview-section"><h4>Befund</h4><div class="rr-preview-content" id="prev-befund">–</div></div>'
      + '<div class="rr-preview-section"><h4>Beurteilung</h4><div class="rr-preview-content" id="prev-beurt">–</div></div>'
      + '<div id="status-badge" class="rr-badge warn">● Befund ausfüllen</div>'
      + '<div class="rr-actions">'
      + '<button id="btn-copy" type="button">📋 Befundtext kopieren</button>'
      + '<button id="btn-fhir" type="button" class="rr-btn-secondary">{ } FHIR-Export</button>'
      + '<button id="btn-reset" type="button" class="rr-btn-secondary">↺ Zurücksetzen</button>'
      + '</div>'
      + '<div class="rr-export-area" id="fhir-box"></div>'
      + '</aside>');
  }

  // ---------------------------------------------------------------------------
  // 5. TRI-STATE-VERHALTEN
  // ---------------------------------------------------------------------------
  function onStatus(key) {
    var st = regStatus(key);
    var rg = regEl(key);
    if (!rg) return;
    rg.classList.toggle('is-bef', st === 'bef');
    rg.classList.toggle('is-crit', st === 'bef' && isCrit(key));
  }

  // Normalbefund-Makro: alle noch offenen ("—") Regionen auf o.B.
  function setNormalbefund() {
    REGIONS.forEach(function (r) {
      if (regStatus(r.key) === '') {
        var ob = document.getElementById('st_' + r.key + '_ob');
        if (ob) { ob.checked = true; onStatus(r.key); }
      }
    });
    refresh();
  }

  // ---------------------------------------------------------------------------
  // 6. data-show-if (Vergleichsdatum)
  // ---------------------------------------------------------------------------
  function applyShowIf() {
    document.querySelectorAll('[data-show-if]').forEach(function (el) {
      var cond = el.getAttribute('data-show-if');
      var show = false;
      if (cond.indexOf('=') > -1) {
        var parts = cond.split('=');
        show = gv(parts[0]) === parts[1];
      }
      el.classList.toggle('rr-shown', !!show);
    });
  }

  // ---------------------------------------------------------------------------
  // 7. TEXT-BUILDER
  // ---------------------------------------------------------------------------
  function buildTechnik() {
    var g = gv('geraet'), p = gv('protokoll'), q = gv('qual'), fr = gv('fragestellung');
    var t = 'CT des Schädels, ' + p + ' (' + g + '). Bildqualität: ' + q + '.';
    if (fr) t += ' Fragestellung: ' + fr + '.';
    if (gv('vgl') === 'yes') { var d = gv('vgl_dat'); t += ' Voruntersuchung' + (d ? ' (' + d + ')' : '') + ' zum Vergleich vorliegend.'; }
    return t;
  }
  function buildBefund() {
    var lines = [];
    REGIONS.forEach(function (r) {
      var st = regStatus(r.key);
      if (st === '') return;                 // unbeurteilt → kein Satz (kein Default)
      lines.push(r.build(st));
    });
    return lines.join('\n');
  }
  function nUnassessed() { return REGIONS.filter(function (r) { return regStatus(r.key) === ''; }).length; }
  function hasCrit() { return REGIONS.some(function (r) { return isCrit(r.key) && regStatus(r.key) === 'bef'; }); }
  function buildVorschlag() {
    var pos = REGIONS.filter(function (r) { return regStatus(r.key) === 'bef'; })
      .map(function (r) { return r.build('bef'); });
    if (!pos.length) {
      if (nUnassessed() === 0) return 'CT Schädel nativ: Altersentsprechender unauffälliger Befund. Keine intrakranielle Blutung, kein Infarktnachweis, keine Mittellinienverlagerung.';
      return '';
    }
    return pos.join(' ');
  }

  // ---------------------------------------------------------------------------
  // 8. UPDATE / RENDER
  // ---------------------------------------------------------------------------
  function refresh() {
    applyShowIf();
    setText('prev-technik', buildTechnik());
    setText('prev-befund', buildBefund() || '—');
    setText('prev-beurt', gv('beurt') || '—');

    // Beurteilungs-Vorschlag
    var vbox = document.getElementById('vorschlag-box');
    if (vbox) {
      if (!gv('beurt')) {
        var v = buildVorschlag();
        if (v) {
          vbox.innerHTML = '<div class="rr-vorschlag" id="vorschlag-apply" title="Klicken zum Übernehmen">'
            + '<strong>Vorschlag (klicken):</strong><br>' + escapeHtml(v) + '</div>';
          vbox.dataset.suggestion = v;
        } else { vbox.innerHTML = ''; delete vbox.dataset.suggestion; }
      } else { vbox.innerHTML = ''; delete vbox.dataset.suggestion; }
    }

    // Status-Badge
    var badge = document.getElementById('status-badge');
    if (badge) {
      var open = nUnassessed();
      if (hasCrit()) { badge.className = 'rr-badge crit'; badge.textContent = '⚠ Kritischer Befund – ' + (open ? open + ' Region(en) noch offen' : 'alle Regionen beurteilt'); }
      else if (open > 0) { badge.className = 'rr-badge warn'; badge.textContent = '● ' + open + ' Region(en) unbeurteilt'; }
      else if (gv('beurt').length <= 5) { badge.className = 'rr-badge warn'; badge.textContent = '● Beurteilung fehlt'; }
      else { badge.className = 'rr-badge ok'; badge.textContent = '✓ Vollständig'; }
    }
  }
  function setText(id, txt) { var e = document.getElementById(id); if (e) e.textContent = txt; }
  function escapeHtml(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------------------------------------------------------------------------
  // 9. FHIR (nur beurteilte Regionen → Observation; o.B. = attestierter Neg.)
  // ---------------------------------------------------------------------------
  function buildFhir() {
    var now = new Date().toISOString();
    var obsArr = [];
    REGIONS.forEach(function (r) {
      var st = regStatus(r.key);
      if (st === '') return;
      var isNeg = (st === 'ob');
      var obs = {
        resourceType: 'Observation', status: 'final', id: 'obs-' + r.key,
        code: { coding: [{ system: 'http://radlex.org', code: regRadlex(r.key), display: regEn(r.key) }] },
        interpretation: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: isNeg ? 'NEG' : 'POS', display: isNeg ? 'Negative' : 'Positive' }] }],
        valueCodeableConcept: { text: r.build(st) },
        note: [{ text: isNeg ? 'Ärztlich attestierter Negativbefund (o.B.).' : 'Befund.' }]
      };
      obsArr.push({ fullUrl: 'urn:uuid:obs-' + r.key, resource: obs });
    });

    var dr = {
      resourceType: 'DiagnosticReport', status: 'final', id: 'cct-report',
      code: { coding: [
        { system: 'http://loinc.org', code: '30799-1', display: 'CT Head' },
        { system: 'http://radlex.org', code: 'RID10337', display: 'CT head' }
      ] },
      effectiveDateTime: now,
      identifier: [
        { value: 'HJK-MRRT-CT-SCHAEDEL-NATIV-v1.1' },
        { system: 'http://drg.de', value: 'DRG-041807.2.2104072101-CC-BY-4.0' }
      ],
      conclusion: gv('beurt'),
      result: obsArr.map(function (o) { return { reference: o.fullUrl }; }),
      presentedForm: [{ contentType: 'text/plain', title: 'CT Schädel nativ',
        data: btoa(unescape(encodeURIComponent('TECHNIK\n' + buildTechnik() + '\n\nBEFUND\n' + buildBefund() + '\n\nBEURTEILUNG\n' + gv('beurt')))) }]
    };

    return JSON.stringify({
      resourceType: 'Bundle', type: 'document', timestamp: now,
      meta: { tag: [
        { system: 'http://hjk.wien/fhir/CodeSystem/radiology-templates', code: 'radlex-coded' },
        { system: 'http://drg.de', code: 'drg-cc-by-4.0' }
      ] },
      entry: [{ fullUrl: 'urn:uuid:cct-report', resource: dr }].concat(obsArr)
    }, null, 2);
  }
  function toggleFhir() {
    var box = document.getElementById('fhir-box');
    if (!box) return;
    if (box.classList.contains('show')) { box.classList.remove('show'); box.textContent = ''; return; }
    box.textContent = buildFhir();
    box.classList.add('show');
  }

  function buildReport() {
    return 'CT SCHÄDEL NATIV\n'
      + new Date().toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + '\n\nTECHNIK\n' + buildTechnik()
      + '\n\nBEFUND\n' + buildBefund()
      + '\n\nBEURTEILUNG\n' + gv('beurt');
  }
  function copyReport(btn) {
    var t = buildReport();
    var done = function () { if (btn) { btn.textContent = '✓ Kopiert!'; setTimeout(function () { btn.textContent = '📋 Befundtext kopieren'; }, 2000); } };
    if (navigator.clipboard) { navigator.clipboard.writeText(t).then(done, function () { legacyCopy(t); done(); }); }
    else { legacyCopy(t); done(); }
  }
  function legacyCopy(t) {
    var el = document.createElement('textarea'); el.value = t; document.body.appendChild(el);
    el.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(el);
  }

  function resetAll() {
    if (!window.confirm('Alle Eingaben zurücksetzen?')) return;
    pane.querySelectorAll('select').forEach(function (s) { s.selectedIndex = 0; });
    pane.querySelectorAll('textarea, input[type=text], input[type=number]').forEach(function (i) { i.value = ''; });
    pane.querySelectorAll('input[type=checkbox]').forEach(function (c) { c.checked = false; });
    REGIONS.forEach(function (r) {
      var u = document.getElementById('st_' + r.key + '_unset');
      if (u) { u.checked = true; onStatus(r.key); }
    });
    var fb = document.getElementById('fhir-box'); if (fb) { fb.classList.remove('show'); fb.textContent = ''; }
    refresh();
  }

  // ---------------------------------------------------------------------------
  // 10. EVENT-VERDRAHTUNG (addEventListener, kein Inline-onclick)
  // ---------------------------------------------------------------------------
  document.addEventListener('input', refresh);
  document.addEventListener('change', function (e) {
    if (e.target && e.target.name && e.target.name.indexOf('st_') === 0) {
      onStatus(e.target.name.slice(3));
    }
    refresh();
  });

  var bn = document.getElementById('btn-normal');
  if (bn) bn.addEventListener('click', setNormalbefund);
  var bc = document.getElementById('btn-copy');
  if (bc) bc.addEventListener('click', function () { copyReport(bc); });
  var bf = document.getElementById('btn-fhir');
  if (bf) bf.addEventListener('click', toggleFhir);
  var br = document.getElementById('btn-reset');
  if (br) br.addEventListener('click', resetAll);

  document.addEventListener('click', function (e) {
    var v = e.target.closest && e.target.closest('#vorschlag-apply');
    if (v) {
      var box = document.getElementById('vorschlag-box');
      var beurt = document.getElementById('beurt');
      if (box && beurt && box.dataset.suggestion) { beurt.value = box.dataset.suggestion; refresh(); }
    }
  });

  // ---------------------------------------------------------------------------
  // INIT
  // ---------------------------------------------------------------------------
  REGIONS.forEach(function (r) { onStatus(r.key); });
  refresh();
})();
