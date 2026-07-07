// =============================================================================
// Demo-Interaktivität für "CT Urolithiasis (Steinsuche, nativ)" (v1.1)
//
// ABGELEITET / Demo-Schicht: gehört NICHT ins kanonische template.html (nacktes,
// JS-freies, form-only MRRT). Baut das Viewer-Chrome zur Laufzeit:
//   - Uro-Nachweis-Radio-Logik (Stein-Sektion ein-/ausblenden)
//   - Multi-Stein-Stack: klont den EINEN deklarierten Konkrement-Block,
//     Add/Del-Steuerung, Neu-Nummerierung
//   - Live-Vorschau (Technik / Befund / Beurteilung) + Status-Badge
//   - Beurteilungsvorschlag (klickbar, aus Hauptstein + Harntransport)
//   - Aktions-Buttons: Befund kopieren, FHIR-Export, Zurücksetzen
//   - data-show-if-Sichtbarkeitslogik (Vergleichsdatum)
//
// Text-Builder und FHIR-Bundle verbatim portiert aus dem abgelösten Inline-
// Template. Eingebunden via build-demo.js in demo/index.html.
// =============================================================================

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. DEMO-STYLING (Core kennt keine Choice/Checkgrid/Stein/Seiten-Klassen)
  // ---------------------------------------------------------------------------
  var css = ''
    + '.rr-choice-row{display:flex;gap:8px;margin-top:6px;flex-wrap:wrap}'
    + '.rr-choice{display:inline-flex;align-items:center;gap:6px;cursor:pointer;padding:6px 14px;'
    + 'border:1px solid var(--rr-field-border,#c9d2da);border-radius:16px;font-size:13px;'
    + 'color:var(--rr-ink-soft,#556);transition:all .15s}'
    + '.rr-choice input{accent-color:var(--rr-accent,#31708f)}'
    + '.rr-choice.rr-is-active-neg{background:var(--rr-success,#2d8a4f);color:#fff;border-color:var(--rr-success,#2d8a4f);font-weight:500}'
    + '.rr-choice.rr-is-active-pos{background:var(--rr-accent,#31708f);color:#fff;border-color:var(--rr-accent,#31708f);font-weight:500}'
    + '.rr-checkgrid{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px;margin:8px 0}'
    + '.rr-check{display:flex;align-items:center;gap:8px;font-size:13.5px;cursor:pointer;line-height:1.35}'
    + '.rr-unit{font-size:11px;color:var(--rr-ink-muted,#667);margin-left:3px;font-weight:400}'
    + '.rr-note-block{font-size:13px;color:var(--rr-ink,#333);line-height:1.5;padding:12px 14px}'
    + '.rr-evidence-footer{margin-top:28px;padding-top:14px;border-top:1px solid var(--rr-rule,#e2e6ea);'
    + 'font-size:11.5px;color:var(--rr-ink-muted,#667);line-height:1.7}'
    + '.rr-seiten-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;background:var(--rr-bg-alt,#f7f7f5);'
    + 'border:1px solid var(--rr-rule,#e2e6ea);border-radius:var(--rr-radius,6px);padding:14px 16px;margin-bottom:14px}'
    + '@media(max-width:640px){.rr-seiten-grid{grid-template-columns:1fr}}'
    + '.rr-seiten-title{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;'
    + 'color:var(--rr-ink-muted,#667);margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--rr-rule,#e2e6ea)}'
    + '.rr-stein-block{background:var(--rr-bg-alt,#f7f7f5);border:1px solid var(--rr-rule,#e2e6ea);'
    + 'border-radius:var(--rr-radius,6px);padding:13px 15px;margin-bottom:10px;position:relative}'
    + '.rr-stein-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}'
    + '.rr-stein-num{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--rr-accent,#31708f)}'
    + '.rr-stein-del{background:none;border:none;cursor:pointer;color:var(--rr-ink-faint,#99a);font-size:16px;line-height:1;padding:0;transition:color .15s}'
    + '.rr-stein-del:hover{color:#c0392b}'
    + '.rr-stein-add{display:flex;align-items:center;gap:7px;justify-content:center;padding:8px 14px;'
    + 'background:var(--rr-bg,#fff);border:1px dashed var(--rr-field-border,#c9d2da);border-radius:var(--rr-radius,6px);'
    + 'font-size:13px;color:var(--rr-ink-muted,#667);cursor:pointer;width:100%;transition:all .15s;font:inherit}'
    + '.rr-stein-add:hover{border-color:var(--rr-accent,#31708f);color:var(--rr-accent,#31708f);background:var(--rr-accent-pale,#eef4f7)}'
    + '.rr-status-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:12px;'
    + 'font-size:12px;font-weight:600;margin-top:14px}'
    + '.rr-status-badge.ok{background:#ecf7f2;color:var(--rr-success,#2d8a4f)}'
    + '.rr-status-badge.warn{background:#fdf6ec;color:var(--rr-warn,#b7791f)}'
    + '.rr-suggest{cursor:pointer}.rr-suggest strong{color:var(--rr-accent,#31708f)}'
    + '[data-show-if]{display:none}[data-show-if].rr-shown{display:block}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var app = document.querySelector('.rr-app');

  // ---------------------------------------------------------------------------
  // 2. HELFER
  // ---------------------------------------------------------------------------
  function gv(id) { var e = document.getElementById(id); return e && e.value ? e.value.trim() : ''; }
  function gn(id) { var e = document.getElementById(id); var v = e ? parseFloat(e.value) : NaN; return isNaN(v) ? null : v; }
  function fv(el) { return el && el.value ? el.value.trim() : ''; }
  function fn(el) { var v = el ? parseFloat(el.value) : NaN; return isNaN(v) ? null : v; }

  // ---------------------------------------------------------------------------
  // 3. STEIN-STACK (klont den deklarierten Block, Add/Del, Neu-Nummerierung)
  // ---------------------------------------------------------------------------
  var steinList = document.getElementById('stein_list');
  var protoBlock = steinList.querySelector('.rr-stein-block').cloneNode(true);

  function decorate(block) {
    if (block.querySelector('.rr-stein-del')) return;
    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'rr-stein-del';
    del.setAttribute('aria-label', 'Konkrement entfernen');
    del.textContent = '✕';
    del.addEventListener('click', function () { block.remove(); renumber(); refresh(); });
    block.querySelector('.rr-stein-head').appendChild(del);
  }

  function renumber() {
    var blocks = steinList.querySelectorAll('.rr-stein-block');
    blocks.forEach(function (b, i) {
      var n = i + 1;
      b.setAttribute('data-stein', String(n));
      b.querySelectorAll('[data-stein]').forEach(function (el) { el.setAttribute('data-stein', String(n)); });
      var num = b.querySelector('.rr-stein-num');
      if (num) num.textContent = 'Konkrement ' + n;
    });
  }

  function addStein() {
    var clone = protoBlock.cloneNode(true);
    steinList.appendChild(clone);
    decorate(clone);
    renumber();
    refresh();
  }

  // Add-Button an den Anker
  var addAnchor = document.getElementById('stein_add_anchor');
  if (addAnchor) {
    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'rr-stein-add';
    addBtn.textContent = '＋ Weiteres Konkrement hinzufügen';
    addBtn.addEventListener('click', addStein);
    addAnchor.appendChild(addBtn);
  }

  // Erstblock (Konkrement 1) mit Del-Button ausstatten
  steinList.querySelectorAll('.rr-stein-block').forEach(decorate);
  renumber();

  function readSteine() {
    var out = [];
    steinList.querySelectorAll('.rr-stein-block').forEach(function (b) {
      function f(field) { return b.querySelector('[data-field="' + field + '"]'); }
      out.push({
        typ: fv(f('typ')), seite: fv(f('seite')), lok: fv(f('lok')),
        dia: fn(f('dia')), vol: fn(f('vol')), hu: fn(f('hu')),
        subst: fv(f('subst')), rim: fv(f('rim')), zda: fv(f('zda')), comet: fv(f('comet'))
      });
    });
    return out;
  }

  // ---------------------------------------------------------------------------
  // 4. URO-NACHWEIS-RADIO
  // ---------------------------------------------------------------------------
  var steinSection = document.getElementById('stein_section');
  function uroJa() { var e = document.getElementById('uro_ja'); return !!(e && e.checked); }

  function applyUro() {
    var ja = uroJa();
    steinSection.style.display = ja ? '' : 'none';
    if (ja && !steinList.querySelector('.rr-stein-block')) addStein();
    var choiceJa = document.getElementById('uro_ja').closest('.rr-choice');
    var choiceNein = document.getElementById('uro_nein').closest('.rr-choice');
    if (choiceJa) choiceJa.classList.toggle('rr-is-active-pos', ja);
    if (choiceNein) choiceNein.classList.toggle('rr-is-active-neg', !ja);
  }
  document.querySelectorAll('input[name="uro_nachweis"]').forEach(function (r) {
    r.addEventListener('change', function () { applyUro(); refresh(); });
  });

  // ---------------------------------------------------------------------------
  // 5. data-show-if (Vergleichsdatum)
  // ---------------------------------------------------------------------------
  function applyShowIf() {
    document.querySelectorAll('[data-show-if]').forEach(function (el) {
      var cond = el.getAttribute('data-show-if');
      var show;
      if (cond.indexOf('=') > -1) {
        var p = cond.split('=');
        show = gv(p[0]) === p[1];
      } else {
        var c = document.getElementById(cond);
        show = c && c.type === 'checkbox' ? c.checked : !!(c && c.value);
      }
      el.classList.toggle('rr-shown', !!show);
    });
  }

  // ---------------------------------------------------------------------------
  // 6. TEXT-BUILDER (verbatim portiert)
  // ---------------------------------------------------------------------------
  function buildTechnik() {
    var prot = gv('protokoll') || 'Nativ (NECT)';
    var sch = gv('schicht') || '3 mm';
    var qual = gv('qual') || 'gut, diagnostisch ausreichend';
    var frage = gv('fragestellung');
    var t = 'CT Abdomen/Becken, ' + prot + '. Schichtdicke ' + sch + '. Bildqualität ' + qual + '.';
    if (frage) t += ' Fragestellung: ' + frage + '.';
    if (gv('vgl_ja') === 'yes') {
      var d = gv('vgl_dat');
      t += ' Vergleichsuntersuchung' + (d ? ' vom ' + d : '') + ' liegt vor.';
    }
    return t;
  }

  function basalerThorax() {
    var parts = [];
    if (document.getElementById('bth_norm').checked) parts.push('unauffällig');
    if (document.getElementById('bth_erguss').checked) parts.push('Pleuraerguss');
    if (document.getElementById('bth_atel').checked) parts.push('basale Atelektase');
    if (document.getElementById('bth_sonst').checked) parts.push('sonstiger Befund');
    return parts.length ? parts.join(', ') : 'unauffällig';
  }

  function buildBefund() {
    var lines = [];
    if (!uroJa()) {
      lines.push('Urolithiasis: Kein Konkrement nachweisbar.');
    } else {
      var steine = readSteine();
      if (!steine.length) {
        lines.push('Urolithiasis: Konkrement(e) beschreiben.');
      } else {
        steine.forEach(function (s, i) {
          var l = 'Konkrement ' + (i + 1) + ': ' + s.typ + ' ' + s.seite + ', Lokalisation ' + s.lok;
          if (s.dia !== null) l += ', maximaler Durchmesser ' + s.dia + ' mm';
          if (s.vol !== null) l += ', Volumen ' + s.vol + ' mm³';
          if (s.hu !== null) l += ', mittlere Dichte ' + s.hu + ' HU';
          if (s.subst) l += '. Substanz: ' + s.subst;
          if (s.rim) l += '. Soft-tissue-rim-sign: ' + s.rim;
          if (s.zda) l += '. Zentrale Dichteabsenkung: ' + s.zda;
          if (s.comet) l += '. Comet-tail-sign: ' + s.comet;
          l += '.';
          lines.push(l);
        });
      }
    }

    var nbks_li = gv('nbks_li'), nbks_re = gv('nbks_re');
    var urt_li = gv('ureter_li'), urt_re = gv('ureter_re');
    var urt_li_d = gn('ureter_li_dia'), urt_re_d = gn('ureter_re_dia');
    var peri_li = gv('peririnal_li'), peri_re = gv('peririnal_re');

    var hasTransport = nbks_li !== 'keine' || nbks_re !== 'keine' || urt_li !== 'keine' ||
      urt_re !== 'keine' || peri_li !== 'keines' || peri_re !== 'keines';
    if (hasTransport) {
      var li_parts = [];
      if (nbks_li !== 'keine') li_parts.push('NBKS-Aufweitung ' + nbks_li);
      if (urt_li !== 'keine') li_parts.push('Ureter aufgeweitet ' + urt_li + (urt_li_d !== null ? ', Ø ' + urt_li_d + ' mm' : ''));
      if (peri_li !== 'keines') li_parts.push('perirenales Ödem');
      var re_parts = [];
      if (nbks_re !== 'keine') re_parts.push('NBKS-Aufweitung ' + nbks_re);
      if (urt_re !== 'keine') re_parts.push('Ureter aufgeweitet ' + urt_re + (urt_re_d !== null ? ', Ø ' + urt_re_d + ' mm' : ''));
      if (peri_re !== 'keines') re_parts.push('perirenales Ödem');
      var ht = 'Harntransportstörung:';
      if (li_parts.length) ht += ' Li.: ' + li_parts.join(', ') + '.';
      if (re_parts.length) ht += ' Re.: ' + re_parts.join(', ') + '.';
      lines.push(ht);
    } else {
      lines.push('Harntransportstörung: Keine Aufweitung des Nierenbeckenkelchsystems oder Harnleiters bds. Kein perirenales Ödem.');
    }

    var bao = gv('bauchorgane'), gef = gv('gefaesse'), ly = gv('lymph'), sk = gv('skelett');
    lines.push('Bauchorgane: ' + bao + '. Gefäße: ' + gef + '. Lymphknoten: ' + ly +
      '. Skelett: ' + sk + '. Basaler Thorax: ' + basalerThorax() + '.');

    var umgft = gv('umg_ft');
    if (umgft) lines.push(umgft);

    return lines.join('\n');
  }

  function buildVorschlag() {
    if (!uroJa()) return 'CT Abdomen/Becken nativ: Kein Konkrement nachweisbar. Kein Harnaufstau.';
    var steine = readSteine();
    if (!steine.length) return '';
    var s = steine[0];
    var nbks_re = gv('nbks_re'), nbks_li = gv('nbks_li');
    var v = '';
    if (s.subst) v += s.subst + ' ';
    v += s.typ + ' ' + s.seite + ', ' + s.lok;
    if (s.dia !== null) v += ', ' + s.dia + ' mm';
    if (nbks_re !== 'keine' || nbks_li !== 'keine') {
      v += '. Vorgeschaltete Harntransportstörung';
      if (nbks_re !== 'keine') v += ' re. ' + nbks_re;
      if (nbks_li !== 'keine') v += ' li. ' + nbks_li;
      v += '.';
    } else {
      v += '. Kein Harnaufstau.';
    }
    if (steine.length > 1) v += ' Weitere ' + (steine.length - 1) + ' Konkrement(e) – Details siehe Befund.';
    return v;
  }

  // ---------------------------------------------------------------------------
  // 7. FHIR-BUNDLE (verbatim portiert)
  // ---------------------------------------------------------------------------
  function buildFhir() {
    var now = new Date().toISOString();
    var obsArr = [];
    readSteine().forEach(function (s, i) {
      var obs = {
        resourceType: 'Observation', status: 'final', id: 'calculus-' + (i + 1),
        code: { coding: [
          { system: 'http://radlex.org', code: 'RID5154', display: 'urinary calculus' },
          { system: 'http://loinc.org', code: '24634-8', display: 'CT KUB' }
        ] },
        bodySite: { text: s.seite + ' ' + s.lok },
        component: [
          s.dia !== null ? { code: { coding: [{ system: 'http://radlex.org', code: 'RID5161', display: 'calculus diameter' }] }, valueQuantity: { value: s.dia, unit: 'mm' } } : null,
          s.hu !== null ? { code: { coding: [{ system: 'http://radlex.org', code: 'RID5163', display: 'calculus density' }] }, valueQuantity: { value: s.hu, unit: 'HU' } } : null,
          s.subst ? { code: { text: 'composition' }, valueString: s.subst } : null
        ].filter(Boolean)
      };
      obsArr.push({ fullUrl: 'urn:uuid:calculus-' + (i + 1), resource: obs });
    });

    var dr = {
      resourceType: 'DiagnosticReport', status: 'final', id: 'uro-report',
      code: { coding: [
        { system: 'http://loinc.org', code: '24634-8', display: 'CT KUB' },
        { system: 'http://radlex.org', code: 'RID10361', display: 'CT urolithiasis' }
      ] },
      effectiveDateTime: now,
      identifier: [
        { value: 'HJK-MRRT-CT-UROLITHIASIS-v1.1' },
        { system: 'http://drg.de', value: 'DRG-041807.2.2203092150-CC-BY-4.0' }
      ],
      conclusion: gv('beurt'),
      result: obsArr.map(function (o) { return { reference: o.fullUrl }; }),
      presentedForm: [{ contentType: 'text/plain', title: 'CT Urolithiasis',
        data: btoa(unescape(encodeURIComponent(
          'TECHNIK\n' + buildTechnik() + '\n\nBEFUND\n' + buildBefund() + '\n\nBEURTEILUNG\n' + gv('beurt')
        ))) }]
    };

    return JSON.stringify({
      resourceType: 'Bundle', type: 'document', timestamp: now,
      meta: { tag: [
        { system: 'http://hjk.wien/fhir/CodeSystem/radiology-templates', code: 'radlex-coded' },
        { system: 'http://drg.de', code: 'drg-cc-by-4.0' }
      ] },
      entry: [{ fullUrl: 'urn:uuid:uro-report', resource: dr }].concat(obsArr)
    }, null, 2);
  }

  // ---------------------------------------------------------------------------
  // 8. VORSCHAU-PANE + AKTIONEN
  // ---------------------------------------------------------------------------
  if (app) {
    app.insertAdjacentHTML('beforeend',
      '<aside class="rr-preview-pane">'
      + '<h2 class="rr-preview-title">Befund-Vorschau (Live)</h2><div class="rr-preview-title-rule"></div>'
      + '<div class="rr-preview-section"><h4>Technik</h4><div class="rr-preview-content" id="prev-technik">–</div></div>'
      + '<div class="rr-preview-section"><h4>Befund</h4><div class="rr-preview-content" id="prev-befund">–</div></div>'
      + '<div class="rr-preview-section"><h4>Beurteilung</h4><div class="rr-preview-content" id="prev-beurt">–</div></div>'
      + '<div id="status-badge" class="rr-status-badge warn">● Befund ausfüllen</div>'
      + '<div class="rr-actions"><button id="btn-copy" type="button" class="rr-btn">Befundtext kopieren</button>'
      + '<button id="btn-fhir" type="button" class="rr-btn-secondary">{ } FHIR-Export</button>'
      + '<button id="btn-reset" type="button" class="rr-btn-secondary">Zurücksetzen</button></div>'
      + '<div class="rr-export-area" id="fhir-box"></div></aside>');
  }

  // Vorschlags-Box an den Anker
  var suggestAnchor = document.getElementById('beurteilung_anchor');

  function renderSuggest() {
    if (!suggestAnchor) return;
    if (gv('beurt')) { suggestAnchor.innerHTML = ''; return; }
    var v = buildVorschlag();
    if (!v) { suggestAnchor.innerHTML = ''; return; }
    suggestAnchor.innerHTML = '<div class="rr-helper-info rr-suggest" title="Klicken zum Übernehmen">'
      + '<strong>Vorschlag (klicken):</strong><br>' + v + '</div>';
    var box = suggestAnchor.querySelector('.rr-suggest');
    box.addEventListener('click', function () {
      var ta = document.getElementById('beurt');
      ta.value = v; ta.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  // ---------------------------------------------------------------------------
  // 9. REFRESH-ZYKLUS
  // ---------------------------------------------------------------------------
  function refresh() {
    applyShowIf();
    var pt = document.getElementById('prev-technik'); if (pt) pt.textContent = buildTechnik();
    var pb = document.getElementById('prev-befund'); if (pb) pb.textContent = buildBefund();
    var pj = document.getElementById('prev-beurt'); if (pj) pj.textContent = gv('beurt') || '—';
    renderSuggest();

    var badge = document.getElementById('status-badge');
    if (badge) {
      var hasBeurt = gv('beurt').length > 5;
      if (uroJa() && !steinList.querySelector('.rr-stein-block')) {
        badge.className = 'rr-status-badge warn'; badge.textContent = '● Stein-Details ausfüllen';
      } else if (!hasBeurt) {
        badge.className = 'rr-status-badge warn'; badge.textContent = '● Beurteilung fehlt';
      } else {
        badge.className = 'rr-status-badge ok'; badge.textContent = '✓ Vollständig';
      }
    }
  }

  document.addEventListener('input', refresh);
  document.addEventListener('change', refresh);

  // Buttons
  var bc = document.getElementById('btn-copy');
  if (bc) bc.addEventListener('click', function () {
    var txt = 'CT UROLITHIASIS\n'
      + new Date().toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + '\n\nTECHNIK\n' + buildTechnik() + '\n\nBEFUND\n' + buildBefund() + '\n\nBEURTEILUNG\n' + gv('beurt');
    if (navigator.clipboard) navigator.clipboard.writeText(txt);
    bc.textContent = '✓ Kopiert!';
    setTimeout(function () { bc.textContent = 'Befundtext kopieren'; }, 2000);
  });

  var bf = document.getElementById('btn-fhir');
  if (bf) bf.addEventListener('click', function () {
    var box = document.getElementById('fhir-box');
    if (box.classList.contains('rr-is-visible')) {
      box.classList.remove('rr-is-visible'); box.textContent = ''; return;
    }
    box.textContent = buildFhir();
    box.classList.add('rr-is-visible');
  });

  var br = document.getElementById('btn-reset');
  if (br) br.addEventListener('click', function () {
    if (!confirm('Alle Eingaben zurücksetzen?')) return;
    steinList.querySelectorAll('.rr-stein-block').forEach(function (b, i) { if (i > 0) b.remove(); });
    document.querySelectorAll('.rr-input-pane select').forEach(function (s) { s.selectedIndex = 0; });
    document.querySelectorAll('.rr-input-pane textarea, .rr-input-pane input[type=text], .rr-input-pane input[type=number]')
      .forEach(function (i) { i.value = ''; });
    document.querySelectorAll('.rr-input-pane input[type=checkbox]').forEach(function (c) { c.checked = false; });
    document.getElementById('uro_nein').checked = true;
    var box = document.getElementById('fhir-box'); if (box) { box.classList.remove('rr-is-visible'); box.textContent = ''; }
    renumber(); applyUro(); refresh();
  });

  // ---------------------------------------------------------------------------
  // INIT
  // ---------------------------------------------------------------------------
  applyUro();
  refresh();
})();
