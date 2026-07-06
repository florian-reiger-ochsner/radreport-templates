// =============================================================================
// Demo-Interaktivität für "Röntgen Thorax (p.a. ± lateral)" (v2.2)
//
// ABGELEITET / Demo-Schicht: Dieses Skript gehört NICHT ins kanonische
// template.html (das ist nacktes, JS-freies, form-only MRRT mit voller
// RadLex-Kodierung). Es
//   1. injiziert das template-spezifische rr-tx-*-Stylesheet (nur Demo),
//   2. baut das Viewer-Chrome zur Laufzeit auf (Normalbefund-/Voice-Makro,
//      Stack-Add/Delete-Buttons, Aktions-Buttons, LOINC-Override, FHIR-Mapping-
//      Box, Legende, Live-Vorschau, Status-Badge) und verdrahtet es via
//      addEventListener / Event-Delegation (kein Inline-onclick),
//   3. liefert die gesamte Report-/FHIR-Logik.
// Die RadLex-Codes werden NICHT hier dupliziert, sondern zur Laufzeit aus dem
// kanonischen DOM gelesen (data-radlex / data-en). Eingebunden via build-demo.js.
// =============================================================================

// -----------------------------------------------------------------------------
// 1) Template-spezifisches Stylesheet (nur Demo) injizieren. SSOT der generischen
//    Tokens/Klassen bleibt shared/styles/radreport-core.css (per Core-Link).
// -----------------------------------------------------------------------------
(function injectStyle() {
  const css = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--rr-bg-alt);color:var(--rr-ink);font-family:"Source Sans 3",sans-serif;font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased}
.rr-tx-sh{display:flex;align-items:baseline;gap:12px;margin:30px 0 8px}
.rr-tx-sh h2{font-weight:600;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--rr-accent)}
.rr-tx-sh-line{flex:1;height:1px;background:var(--rr-rule)}
.rr-tx-sh-sub{font-size:12px;color:var(--rr-ink-muted);margin:-3px 0 9px}
.rr-tx-row{margin-bottom:10px}
.rr-tx-row label{display:flex;flex-direction:column;gap:4px}
.rr-tx-lbl{font-size:12px;font-weight:500;color:var(--rr-ink-soft);letter-spacing:.02em}
.rr-tx-field-note{font-size:11px;color:var(--rr-ink-muted);margin-top:2px;font-style:italic}
select,textarea,input[type=text],input[type=number]{width:100%;background:#fff;border:1px solid var(--rr-field-border);border-radius:6px;padding:8px 11px;font-family:"Source Sans 3",sans-serif;font-size:13.5px;color:var(--rr-ink);transition:border-color .15s,box-shadow .15s;appearance:none;-webkit-appearance:none}
select:focus,textarea:focus,input:focus{outline:none;border-color:var(--rr-accent);box-shadow:0 0 0 3px var(--rr-accent-pale)}
select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath fill='%238b97a3' d='M5 6L0 0h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 11px center;padding-right:30px}
textarea{resize:vertical;min-height:48px}
.rr-tx-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.rr-tx-rl{display:inline-block;font-size:10px;font-weight:600;color:var(--rr-accent);background:var(--rr-accent-pale);border-radius:3px;padding:1px 5px;margin-left:5px;vertical-align:middle}
.rr-tx-hint{background:var(--rr-accent-pale);border-left:3px solid var(--rr-accent);border-radius:0 6px 6px 0;padding:9px 13px;font-size:12px;color:var(--rr-ink-soft);margin:4px 0 12px}
.rr-tx-hint strong{color:var(--rr-accent)}
.rr-tx-proj-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
.rr-tx-proj-chips input[type=checkbox]{display:none}
.rr-tx-proj-chips label{padding:7px 14px;border:1px solid var(--rr-field-border);border-radius:18px;font-size:12.5px;color:var(--rr-ink-soft);cursor:pointer;transition:all .12s;user-select:none}
.rr-tx-proj-chips input:checked + label{background:var(--rr-accent);border-color:var(--rr-accent);color:#fff;font-weight:600}
.rr-tx-macro-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:linear-gradient(to right,var(--rr-accent-pale),var(--rr-bg-alt));border:1px solid var(--rr-accent-pale);border-radius:6px;padding:12px 15px;margin:18px 0}
.rr-tx-macro-bar .rr-tx-macro-txt{flex:1;min-width:200px;font-size:12px;color:var(--rr-ink-soft);line-height:1.45}
.rr-tx-macro-bar .rr-tx-macro-txt strong{color:var(--rr-accent)}
#btn-normal{background:var(--rr-success);color:#fff;white-space:nowrap;border:none;border-radius:6px;padding:9px 16px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s}
#btn-normal:hover{filter:brightness(1.07);transform:translateY(-1px)}
#btn-voice{background:var(--rr-bg);color:var(--rr-accent);border:1px solid var(--rr-accent);border-radius:6px;padding:9px 14px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}
#btn-voice:hover{background:var(--rr-accent-pale)}
body.rr-tx-voice-on #btn-voice{background:var(--rr-accent);color:#fff}
.rr-tx-vh{display:none;align-items:center;gap:4px;font-size:10.5px;color:var(--rr-accent);background:var(--rr-accent-pale);border:1px solid var(--rr-accent-light);border-radius:10px;padding:1px 8px;margin-top:4px;line-height:1.6;font-weight:600;white-space:nowrap;width:max-content;max-width:100%}
body.rr-tx-voice-on .rr-tx-vh{display:inline-flex}
.rr-tx-region-head .rr-tx-vh{margin:0}
.rr-tx-region{border:1px solid var(--rr-rule);border-radius:6px;margin-bottom:10px;background:var(--rr-bg);transition:border-color .15s}
.rr-tx-region.rr-tx-is-bef{border-color:var(--rr-accent-light)}
.rr-tx-region.rr-tx-is-crit{border-color:var(--notfall)}
.rr-tx-region-head{display:flex;align-items:center;gap:12px;padding:11px 14px;flex-wrap:wrap}
.rr-tx-region-name{flex:1;min-width:160px;font-size:13.5px;font-weight:600;color:var(--rr-ink)}
.rr-tx-tri{display:inline-flex;border:1px solid var(--rr-field-border);border-radius:6px;overflow:hidden;flex-shrink:0}
.rr-tx-tri input[type=radio]{display:none}
.rr-tx-tri label{padding:6px 13px;cursor:pointer;font-size:12px;font-weight:500;background:var(--rr-bg);color:var(--rr-ink-soft);transition:all .12s;border-right:1px solid var(--rr-field-border)}
.rr-tx-tri label:last-child{border-right:none}
.rr-tx-tri label:hover{background:var(--rr-bg-alt)}
.rr-tx-tri .rr-tx-t-unset{color:var(--rr-ink-faint)}
.rr-tx-tri input.rr-tx-t-unset-in:checked + label{background:var(--rr-ink-faint);color:#fff}
.rr-tx-tri input.rr-tx-t-ob-in:checked + label{background:var(--rr-success);color:#fff;font-weight:600}
.rr-tx-tri input.rr-tx-t-bef-in:checked + label{background:var(--rr-accent);color:#fff;font-weight:600}
.rr-tx-region.rr-tx-is-crit .rr-tx-tri input.rr-tx-t-bef-in:checked + label{background:var(--notfall)}
.rr-tx-region-detail{display:none;padding:2px 14px 14px;border-top:1px solid var(--rr-rule-soft)}
.rr-tx-region.rr-tx-is-bef .rr-tx-region-detail{display:block}
.rr-tx-cg{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.rr-tx-ci{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid var(--rr-field-border);border-radius:16px;font-size:12.5px;color:var(--rr-ink-soft);cursor:pointer;transition:all .12s;user-select:none}
.rr-tx-ci:hover{border-color:var(--rr-accent-light)}
.rr-tx-ci input{width:auto;margin:0}
.rr-tx-ci:has(input:checked){background:var(--rr-accent-pale);border-color:var(--rr-accent);color:var(--rr-accent);font-weight:600}
.rr-tx-stack-item{border:1px solid var(--rr-rule);border-radius:6px;padding:11px 13px;margin-top:9px;background:var(--rr-bg-alt)}
.rr-tx-stack-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}
.rr-tx-stack-num{font-size:11px;font-weight:600;text-transform:uppercase;color:var(--rr-accent)}
.rr-tx-stack-del{background:#fef2f2;color:#c0392b;border:1px solid #f5c6c6;border-radius:5px;width:24px;height:24px;cursor:pointer;font-size:13px;line-height:1}
.rr-tx-add-btn{margin-top:10px;background:var(--rr-bg);color:var(--rr-accent);border:1px dashed var(--rr-accent-light);border-radius:6px;padding:8px 14px;font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer}
.rr-tx-add-btn:hover{background:var(--rr-accent-pale)}
details{border:1px solid var(--rr-rule);border-radius:6px;margin-top:12px;background:var(--rr-bg)}
summary{cursor:pointer;padding:12px 14px;font-size:13px;font-weight:600;color:var(--rr-ink);list-style:none}
summary::-webkit-details-marker{display:none}
summary::before{content:"\\25B8 ";color:var(--rr-accent)}
details[open] summary::before{content:"\\25BE "}
details > div{padding:0 14px 14px}
.rr-tx-bmod{display:inline-flex;border:1px solid var(--rr-field-border);border-radius:6px;overflow:hidden;margin-top:6px}
.rr-tx-bmod input[type=radio]{display:none}
.rr-tx-bmod label{padding:6px 16px;cursor:pointer;font-size:12.5px;font-weight:500;background:var(--rr-bg);color:var(--rr-ink-soft);border-right:1px solid var(--rr-field-border)}
.rr-tx-bmod label:last-child{border-right:none}
.rr-tx-bmod input:checked + label{background:var(--rr-accent);color:#fff;font-weight:600}
.rr-tx-rcard{background:var(--rr-bg);border:1px solid var(--rr-rule);border-radius:10px;padding:22px 24px;box-shadow:var(--rr-shadow-sm)}
.rr-tx-rcard-header{border-bottom:2px solid var(--rr-accent);padding-bottom:11px;margin-bottom:15px}
.rr-tx-rcard-title{font-weight:600;font-size:16px;color:var(--rr-accent)}
.rr-tx-rcard-sub{font-size:11.5px;color:var(--rr-ink-muted);margin-top:3px}
.rr-tx-rsec{margin-bottom:13px}
.rr-tx-rsec-lbl{font-size:10.5px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--rr-accent);margin-bottom:4px}
.rr-tx-rtext{font-family:"Source Serif 4","Georgia",serif;font-size:13px;line-height:1.72;color:var(--rr-ink);white-space:pre-wrap;min-height:16px}
.rr-tx-rtext:empty::before{content:"\\2014";color:var(--rr-ink-faint);font-style:italic;font-family:"Source Sans 3",sans-serif}
.rr-tx-stamp{margin-top:14px;padding-top:11px;border-top:1px solid var(--rr-rule);font-size:11px;color:var(--rr-ink-muted);display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px}
.rr-tx-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:11px;font-size:12px;font-weight:600;margin-top:12px}
.rr-tx-badge.rr-tx-ok{background:#ecf7f2;color:var(--rr-success)}
.rr-tx-badge.rr-tx-warn{background:#fdf6ec;color:var(--rr-warn)}
.rr-tx-badge.rr-tx-crit{background:var(--notfall-pale);color:var(--notfall)}
.rr-tx-ebox{display:none;margin-top:14px;background:#1a2535;color:#93b8d4;border-radius:6px;padding:16px 18px;font-family:"SF Mono","Menlo",monospace;font-size:11px;white-space:pre;overflow:auto;max-height:340px;line-height:1.55}
.rr-tx-ebox.rr-tx-show{display:block}
.rr-tx-legend{margin-top:16px;font-size:11px;color:var(--rr-ink-muted)}
.rr-tx-legend .rr-tx-rl{margin-left:0}
.rr-tx-btn-row{display:flex;gap:9px;flex-wrap:wrap;margin-top:22px}
button.rr-tx-act{padding:9px 18px;border:none;border-radius:6px;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;transition:all .15s}
.rr-tx-btn-p{background:var(--rr-accent);color:#fff}
.rr-tx-btn-p:hover{background:var(--rr-accent-light)}
.rr-tx-btn-s{background:var(--rr-bg);color:var(--rr-ink-soft);border:1px solid var(--rr-field-border)}
.rr-tx-btn-s:hover{background:var(--rr-accent-pale);color:var(--rr-accent);border-color:var(--rr-accent)}
.rr-tx-btn-d{background:#fef2f2;color:#c0392b;border:1px solid #f5c6c6}
.rr-tx-loinc-ovr{margin:10px 0;font-size:12px}
.rr-tx-loinc-ovr label{display:flex;flex-direction:column;gap:4px}
`;
  const el = document.createElement('style');
  el.id = 'rr-tx-demo-style';
  el.textContent = css;
  document.head.appendChild(el);
})();

// -----------------------------------------------------------------------------
// 2) Kleine Helfer (lesen aus dem statischen kanonischen DOM)
// -----------------------------------------------------------------------------
const gv = id => document.getElementById(id)?.value?.trim() ?? '';
const gc = id => !!document.getElementById(id)?.checked;
const regRid = key => document.getElementById('rg-' + key)?.dataset.radlex || 'RID0';
const regEn  = key => document.getElementById('rg-' + key)?.dataset.en || '';
const elRid  = id  => document.getElementById(id)?.dataset.radlex || 'RID0';
const elEn   = id  => document.getElementById(id)?.dataset.en || '';

const SEITE_SHORT = '<option value="">–</option><option value="re.">re.</option><option value="li.">li.</option><option value="bds.">bds.</option>';

// Befundungs-/Ausgabe-Reihenfolge (Reihenfolge = Befundungsreihenfolge).
const ORDER = ['zwerchfell', 'pleura', 'herzmediastinum', 'lunge', 'skelett'];

// -----------------------------------------------------------------------------
// 3) Regions-Prosa + Satzlogik (Demo-Schicht; Codes kommen aus dem DOM)
// -----------------------------------------------------------------------------
const REG = {
  lunge: {
    crit: false,
    neg: 'Lunge: Seitengleich belüftet und entfaltet. Keine pathologische Transparenzminderung, keine Herdschatten, kein Hinweis auf Infiltrat.',
    build(st) {
      if (st === 'ob') return this.neg;
      const items = getParItems();
      if (!items.length) return 'Lunge: Pathologischer Befund – bitte Typ wählen.';
      const parts = items.map(i => { let s = i.de; if (i.seite && i.lok) s += ` ${i.seite} (${i.lok})`; else if (i.seite) s += ` ${i.seite}`; else if (i.lok) s += ` (${i.lok})`; if (i.ft) s += `, ${i.ft}`; return s; });
      return 'Lunge: ' + parts.join('; ') + '.';
    }
  },
  pleura: {
    crit: false,
    critWhen() { return gc('pl_ptx'); },
    neg: 'Pleura: Kein Pleuraerguss. Kein Pneumothorax. Sinus phrenicocostales bds. frei.',
    build(st) {
      if (st === 'ob') return this.neg;
      const seite = gv('pl_seite'), p = [];
      if (gc('pl_erguss')) {
        const re = gv('pl_erg_re'), li = gv('pl_erg_li');
        if (re && li) p.push(`${re} Pleuraerguss rechts und ${li} Pleuraerguss links`);
        else if (re) p.push(`${re} Pleuraerguss rechts`);
        else if (li) p.push(`${li} Pleuraerguss links`);
        else p.push(`Pleuraerguss${seite ? ' ' + seite : ''}`);
      }
      if (gc('pl_ptx')) {
        const re = gv('pl_ptx_re'), li = gv('pl_ptx_li');
        const fmt = (s, g) => `Pneumothorax ${s}${g ? ' – ' + g : ''}`;
        if (re && li) p.push(`${fmt('rechts', re)} und ${fmt('links', li)}`);
        else if (re) p.push(fmt('rechts', re));
        else if (li) p.push(fmt('links', li));
        else p.push('Pneumothorax');
      }
      if (gc('pl_schwarte')) p.push(`Pleuraschwarte/-verdickung${seite ? ' ' + seite : ''}`);
      if (gc('pl_kalk')) p.push(`Pleurakalk${seite ? ' ' + seite : ''}`);
      if (gc('pl_tumor')) p.push(`Pleuratumor/Raumforderung${seite ? ' ' + seite : ''}`);
      if (!p.length) return 'Pleura: Pathologischer Befund – bitte Typ wählen.';
      return 'Pleura: ' + p.join('; ') + '.';
    }
  },
  herzmediastinum: {
    crit: false,
    neg: 'Herz und Mediastinum: Herz normal groß (CTR ≤ 0,5), regelrecht konfiguriert. Mediastinum nicht verbreitert. Hili bds. regelrecht. Aorta unauffällig.',
    build(st) {
      if (st === 'ob') return this.neg;
      const gr = gv('herz_gr');
      const kfg = [gc('hkfg_links') ? 'linksbetont' : null, gc('hkfg_rechts') ? 'rechtsbetont' : null, gc('hkfg_mitral') ? 'Mitralform' : null, gc('hkfg_aorten') ? 'Aortenform' : null].filter(Boolean).join(', ');
      const med = [gc('md_verb') ? 'verbreitert' : null, gc('md_rf') ? 'Raumforderung' : null, gc('md_trach') ? 'Trachealdeviation' : null, gc('md_shift') ? 'Mediastinalshift kontralateral' : null].filter(Boolean).join(', ');
      const hs = gv('hil_seite');
      const hil = [gc('hil_vergr') ? 'vergrößert' : null, gc('hil_versch') ? 'verschattet' : null].filter(Boolean).join(', ');
      const ao = [gc('ao_elon') ? 'elongiert, wandverkalkt' : null, gc('ao_dil') ? 'dilatiert' : null].filter(Boolean).join(', ');
      let s = `Herz und Mediastinum: Herz ${gr}`; if (kfg) s += `, ${kfg}`; s += '.';
      s += med ? ` Mediastinum: ${med}.` : ' Mediastinum nicht verbreitert.';
      if (hil) s += ` Hilus${hs ? ' ' + hs : ''}: ${hil}.`; else s += ' Hili bds. regelrecht.';
      if (ao) s += ` Aorta ${ao}.`;
      const stau = gv('herz_stau'); if (stau) s += ` ${stau.charAt(0).toUpperCase() + stau.slice(1)} pulmonalvenöse Stauungszeichen.`;
      return s;
    }
  },
  zwerchfell: {
    crit: false,
    neg: 'Zwerchfell bds. regelrecht gestellt, Sinus phrenicocostales frei.',
    build(st) { if (st === 'ob') return this.neg; const z = gv('zwf'); return 'Zwerchfell: ' + (z || 'siehe Auswahl') + '.'; }
  },
  skelett: {
    crit: false,
    critWhen() { return gc('sk_dest'); },
    neg: 'Skelett und Weichteile: Miterfasstes Skelett und Weichteile der Thoraxwand unauffällig.',
    build(st) {
      if (st === 'ob') return this.neg;
      const sk = [gc('sk_deg') ? 'degenerative WS-Veränderungen' : null, gc('sk_wk') ? 'Wirbelkörperfraktur/Sinterung' : null, gc('sk_rip') ? 'Rippenfraktur' : null, gc('sk_stern') ? 'Sternumfraktur' : null, gc('sk_dest') ? 'ossäre Destruktion / V.a. Metastase' : null, gc('sk_kyph') ? 'Kyphoskoliose' : null, gc('sk_stern_op') ? 'St.p. Sternotomie' : null].filter(Boolean).join(', ') || 'unauffällig';
      const wt = [gc('wt_emph') ? 'Weichteilemphysem' : null, gc('wt_rf') ? 'Weichteilverdichtung/RF' : null, gc('wt_mast_re') ? 'St.p. Mastektomie re.' : null, gc('wt_mast_li') ? 'St.p. Mastektomie li.' : null].filter(Boolean).join(', ');
      let s = `Skelett: ${sk}.`; if (wt) s += ` Weichteile: ${wt}.`; return s;
    }
  },
};
const oREG = ORDER.map(k => ({ key: k, ...REG[k] }));

// -----------------------------------------------------------------------------
// 4) Chrome aufbauen (Canonical ist form-only; Anker: .rr-title-rule, #par-list,
//    #dev-list, #par-item-1, #dev-item-1, .rr-input-pane, .rr-app)
// -----------------------------------------------------------------------------
let parTemplateHTML = '', devTemplateHTML = '', parCount = 1, devCount = 1;

(function buildChrome() {
  const app = document.querySelector('.rr-app');
  const pane = document.querySelector('.rr-input-pane');

  // Makro-Bar (Normalbefund + Voice) direkt nach der Titel-Linie
  pane.querySelector('.rr-title-rule').insertAdjacentHTML('afterend', `
    <div class="rr-tx-macro-bar">
      <div class="rr-tx-macro-txt"><strong>Additives Modell:</strong> Keine Region ist vorbelegt. Du <strong>attestierst</strong> (o.&nbsp;B.) oder <strong>fügst Pathologie hinzu</strong> (Befund). Der Makro setzt alle offenen Regionen in einem Akt auf o.&nbsp;B. — bewusste Attestierung, kein stiller Default.</div>
      <button type="button" id="btn-normal">✓ Normalbefund attestieren</button>
      <button type="button" id="btn-voice" title="Sprechbefehle pro Feld ein-/ausblenden">🎙 Voice-Hints</button>
    </div>
  `);

  // Stack-Kopf (Nummer + Löschen) in die statischen Erst-Items einsetzen
  document.getElementById('par-item-1').insertAdjacentHTML('afterbegin',
    '<div class="rr-tx-stack-head"><span class="rr-tx-stack-num">Parenchymbefund 1</span><button type="button" class="rr-tx-stack-del" title="entfernen">✕</button></div>');
  document.getElementById('dev-item-1').insertAdjacentHTML('afterbegin',
    '<div class="rr-tx-stack-head"><span class="rr-tx-stack-num">Device 1</span><button type="button" class="rr-tx-stack-del" title="entfernen">✕</button></div>');

  // Add-Buttons (Chrome) nach den Stack-Listen
  document.getElementById('par-list').insertAdjacentHTML('afterend',
    '<button type="button" class="rr-tx-add-btn" id="btn-add-par">＋ Parenchymbefund hinzufügen</button>');
  document.getElementById('dev-list').insertAdjacentHTML('afterend',
    '<button type="button" class="rr-tx-add-btn" id="btn-add-dev">＋ Device hinzufügen</button>');

  // Pristine-Vorlagen der Stack-Items festhalten (mit Stack-Kopf, ohne Voice-Chips)
  parTemplateHTML = document.getElementById('par-item-1').outerHTML;
  devTemplateHTML = document.getElementById('dev-item-1').outerHTML;

  // Aktions-Zeile + LOINC-Override + FHIR-Box + Legende ans Ende des Eingabe-Panes
  pane.insertAdjacentHTML('beforeend', `
    <div class="rr-actions rr-tx-btn-row">
      <button type="button" class="rr-tx-act rr-tx-btn-p" id="btn-copy">📋 Befundtext kopieren</button>
      <button type="button" class="rr-tx-act rr-tx-btn-s" id="btn-fhir">{ } FHIR-Mapping (Demo)</button>
      <button type="button" class="rr-tx-act rr-tx-btn-d" id="btn-reset">↺ Zurücksetzen</button>
    </div>
    <div class="rr-tx-loinc-ovr">
      <label>
        <span style="color:var(--rr-ink-muted)">Untersuchungstyp · LOINC <em style="font-style:normal;color:var(--rr-ink-soft)">— i. d. R. vom RIS/Auftrag gesetzt (RT/Gerät); hier manueller Override für den Standalone-Export</em></span>
        <select id="loinc_override">
          <option value="36643-5|XR Chest 2 Views">36643-5 · XR Chest 2 Views — Default (p.a. ± seitlich)</option>
          <option value="42272-5|XR Chest PA and Lateral">42272-5 · XR Chest PA and Lateral</option>
          <option value="24647-0|XR Chest PA and Lateral upright">24647-0 · XR Chest PA and Lateral upright (stehend)</option>
          <option value="24648-8|XR Chest PA upright">24648-8 · XR Chest PA upright — Single View (p.a. stehend)</option>
        </select></label>
    </div>
    <div class="rr-tx-ebox" id="fhir-box"></div>
    <p class="rr-demo-note" style="font-size:11px;color:var(--rr-ink-muted);margin-top:6px;max-width:64ch;line-height:1.45">Demo-Mapping, kein produktiver Export: zeigt, welches Feld auf welche FHIR-Observation und welchen Code abgebildet wird. Die tatsächliche FHIR-Erzeugung erfolgt plattformseitig.</p>
    <div class="rr-tx-legend"><span class="rr-tx-rl">RadLex</span> RID-Codes auf allen Optionen · <span class="rr-tx-rl">LOINC</span> 36643-5 (Default, Override möglich) im DiagnosticReport · <span class="rr-tx-rl">FHIR</span> R4 – NEG/POS-Interpretation als Verification Floor</div>
  `);

  // Vorschau-Pane + Status-Badge als zweite Spalte
  app.insertAdjacentHTML('beforeend', `
    <aside class="rr-preview-pane">
      <div class="rr-preview-title">Befund-Vorschau (Live)</div>
      <div class="rr-tx-rcard">
        <div class="rr-tx-rcard-header"><div class="rr-tx-rcard-title">Röntgen Thorax</div><div class="rr-tx-rcard-sub" id="prev-sub">–</div></div>
        <div class="rr-tx-rsec"><div class="rr-tx-rsec-lbl">Technik</div><div class="rr-tx-rtext" id="prev-technik"></div></div>
        <div class="rr-tx-rsec"><div class="rr-tx-rsec-lbl">Befund</div><div class="rr-tx-rtext" id="prev-befund"></div></div>
        <div class="rr-tx-rsec"><div class="rr-tx-rsec-lbl">Beurteilung</div><div class="rr-tx-rtext" id="prev-beurt"></div></div>
        <div class="rr-tx-stamp"><span>HJK-MRRT-ROE-THORAX-v2.2</span><span id="prev-date"></span></div>
      </div>
      <div id="status-badge" class="rr-tx-badge rr-tx-warn">● Befund ausfüllen</div>
    </aside>
  `);
})();

// -----------------------------------------------------------------------------
// 5) Tri-State / Regions-Verhalten
// -----------------------------------------------------------------------------
function regStatus(key) { return document.querySelector(`input[name=st_${key}]:checked`)?.value ?? ''; }
function onStatus(key) {
  const st = regStatus(key), rg = document.getElementById('rg-' + key), cfg = REG[key];
  rg.classList.toggle('rr-tx-is-bef', st === 'bef');
  rg.classList.toggle('rr-tx-is-crit', st === 'bef' && (cfg.crit || (cfg.critWhen && cfg.critWhen())));
  decorateVoiceHints(); update();
}
function plToggle() {
  const e = document.getElementById('pl_erguss_row'); if (e) e.style.display = gc('pl_erguss') ? '' : 'none';
  const p = document.getElementById('pl_ptx_row'); if (p) p.style.display = gc('pl_ptx') ? '' : 'none';
  const sr = document.getElementById('pl_seite_row'); if (sr) sr.style.display = (gc('pl_schwarte') || gc('pl_kalk') || gc('pl_tumor')) ? '' : 'none';
}
function setNormalbefund() {
  Object.keys(REG).forEach(key => { if (regStatus(key) === '') { document.getElementById(`st_${key}_ob`).checked = true; onStatus(key); } });
  update();
}

// -----------------------------------------------------------------------------
// 6) Parenchym-Stack (klont die kanonische Erst-Instanz)
// -----------------------------------------------------------------------------
function addParItem() {
  parCount++; const n = parCount;
  const html = parTemplateHTML
    .replace(/(id="par-[a-z]+)-1"/g, `$1-${n}"`)
    .replace('Parenchymbefund 1', 'Parenchymbefund ' + n);
  document.getElementById('par-list').insertAdjacentHTML('beforeend', html);
  const added = document.getElementById(`par-item-${n}`);
  added.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
  added.querySelectorAll('input[type=text]').forEach(i => i.value = '');
  decorateVoiceHints(); update();
}
function getParItems() {
  const items = [];
  document.querySelectorAll('.rr-tx-par-item').forEach(el => {
    const id = el.id.replace('par-item-', '');
    const t = document.getElementById(`par-typ-${id}`), o = t?.options[t.selectedIndex];
    items.push({ rid: t?.value || '', de: o?.dataset.de || '', en: o?.dataset.en || '', seite: gv(`par-seite-${id}`), lok: gv(`par-lok-${id}`), ft: gv(`par-ft-${id}`) });
  });
  return items.filter(i => i.rid);
}

// -----------------------------------------------------------------------------
// 7) Device-Stack (klont die kanonische Erst-Instanz)
// -----------------------------------------------------------------------------
function addDevItem() {
  devCount++; const n = devCount;
  const html = devTemplateHTML
    .replace(/(id="dev-[a-z]+)-1"/g, `$1-${n}"`)
    .replace('Device 1', 'Device ' + n);
  document.getElementById('dev-list').insertAdjacentHTML('beforeend', html);
  const added = document.getElementById(`dev-item-${n}`);
  added.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
  added.querySelectorAll('input[type=text]').forEach(i => i.value = '');
  decorateVoiceHints(); update();
}
function devTypChange(id) {
  const s = document.getElementById(`dev-typ-${id}`), o = s?.options[s.selectedIndex], l = document.getElementById(`dev-lage-${id}`);
  if (o?.dataset.ph && l && !l.value) l.placeholder = o.dataset.ph;
}
function getDevItems() {
  const items = [];
  document.querySelectorAll('.rr-tx-dev-item').forEach(el => {
    const id = el.id.replace('dev-item-', '');
    const t = document.getElementById(`dev-typ-${id}`), o = t?.options[t.selectedIndex];
    items.push({ typ: t?.value || '', rid: o?.dataset?.rid || '', en: o?.dataset?.en || '', lage: gv(`dev-lage-${id}`), burt: gv(`dev-burt-${id}`) || 'regelrecht platziert, Lage korrekt', ft: gv(`dev-ft-${id}`) });
  });
  return items.filter(i => i.typ);
}
function devCrit() { return getDevItems().some(d => /dringlich/i.test(d.burt)); }

// -----------------------------------------------------------------------------
// 8) Voice-Hints
// -----------------------------------------------------------------------------
function decorateVoiceHints() {
  document.querySelectorAll('.rr-input-pane [data-voice]').forEach(el => {
    if (el.dataset.vhDone) return;
    const tag = el.tagName.toLowerCase();
    if (!['select', 'input', 'textarea'].includes(tag)) return;
    const phrase = el.getAttribute('data-voice'); if (!phrase) return;
    const chip = document.createElement('span'); chip.className = 'rr-tx-vh'; chip.textContent = '🎙 „' + phrase + '"';
    el.insertAdjacentElement('afterend', chip); el.dataset.vhDone = '1';
  });
}
function toggleVoice() { document.body.classList.toggle('rr-tx-voice-on'); }

// -----------------------------------------------------------------------------
// 9) Report-Text
// -----------------------------------------------------------------------------
function buildTechnik() {
  const projs = [];
  if (gc('p_pa')) projs.push('p.a.'); if (gc('p_lat')) projs.push('seitlich (li.)');
  if (gc('p_ex')) projs.push('Exspirations-Aufnahme');
  const q = gv('qual') || 'gut, diagnostisch ausreichend';
  const f = gv('frage') === '__ft__' ? gv('frage_ft') : gv('frage');
  let t = `Röntgen Thorax, ${projs.join(' + ') || 'p.a.'}. Aufnahmequalität ${q}.`;
  if (f) t += ` Fragestellung: ${f}.`; return t;
}
function buildBefund() {
  const lines = [];
  oREG.forEach(r => { const st = regStatus(r.key); if (st === '') return; let line = r.build(st); const ft = gv('ft_' + r.key); if (ft) line += ' ' + ft + (/[.!?]$/.test(ft) ? '' : '.'); lines.push(line); });
  const dev = getDevItems();
  if (dev.length) { const t = dev.map(i => { let s = i.typ; if (i.lage) s += ` (${i.lage})`; s += ` – ${i.burt}`; if (i.ft) s += `, ${i.ft}`; return s; }).join('; '); lines.push('Devices: ' + t + '.'); }
  if (gv('vgl_ja') === 'yes') { const d = gv('vgl_datum'), v = gv('vgl_verlauf'); let s = 'Vergleich:'; if (d) s += ` Voruntersuchung vom ${d} liegt vor.`; if (v) s += ` ${v}`; if (s !== 'Vergleich:') lines.push(s); }
  return lines.join('\n');
}
function buildBeurteilung() {
  if (gc('bmod_ft')) return gv('beurt_ft');
  const pos = oREG.filter(r => regStatus(r.key) === 'bef'); const parts = [];
  pos.forEach(r => {
    if (r.key === 'lunge') { getParItems().forEach(i => { let s = i.de; if (i.seite) s += ` ${i.seite}`; if (i.lok) s += ` (${i.lok})`; parts.push(s + '.'); }); }
    else if (r.key === 'pleura') {
      const seite = gv('pl_seite'), p = [];
      if (gc('pl_erguss')) p.push('Pleuraerguss');
      if (gc('pl_ptx')) p.push((gv('pl_ptx_re') === 'Spannungspneumothorax (!)' || gv('pl_ptx_li') === 'Spannungspneumothorax (!)') ? 'Spannungspneumothorax' : 'Pneumothorax');
      if (gc('pl_schwarte')) p.push('Pleuraschwarte'); if (gc('pl_tumor')) p.push('Pleuratumor');
      if (p.length) parts.push(p.join(', ') + (seite ? ' ' + seite : '') + '.');
    }
    else if (r.key === 'herzmediastinum') {
      const gr = gv('herz_gr'); if (gr && gr.indexOf('normal') === -1) parts.push(`Herzgröße: ${gr}.`);
      const stau = gv('herz_stau'); if (stau) parts.push(`${stau.charAt(0).toUpperCase() + stau.slice(1)} pulmonalvenöse Stauungszeichen.`);
      const med = [gc('md_verb') ? 'Mediastinalverbreiterung' : null, gc('md_rf') ? 'mediastinale Raumforderung' : null].filter(Boolean).join(', ');
      if (med) parts.push(med.charAt(0).toUpperCase() + med.slice(1) + '.');
    }
    else if (r.key === 'skelett') { if (gc('sk_dest')) parts.push('Ossäre Destruktion / V.a. Metastase.'); if (gc('sk_wk')) parts.push('Wirbelkörperfraktur / Sinterung.'); if (gc('sk_rip')) parts.push('Rippenfraktur.'); }
  });
  if (devCrit()) parts.unshift('Device-Fehllage – dringliche Korrektur erforderlich.');
  if (!parts.length) { if (nUnassessed() === 0) return 'Röntgen Thorax ohne pathologischen Befund.'; return ''; }
  const verl = gv('vgl_verlauf'); if (gv('vgl_ja') === 'yes' && verl) parts.push(verl);
  return parts.join(' ');
}
function nUnassessed() { return Object.keys(REG).filter(key => regStatus(key) === '').length; }
function hasCrit() { return Object.keys(REG).some(key => regStatus(key) === 'bef' && (REG[key].crit || (REG[key].critWhen && REG[key].critWhen()))) || devCrit(); }
function toggleBmod() { document.getElementById('beurt_ft_row').style.display = gc('bmod_ft') ? '' : 'none'; update(); }
function update() {
  document.getElementById('prev-technik').textContent = buildTechnik();
  document.getElementById('prev-befund').textContent = buildBefund();
  document.getElementById('prev-beurt').textContent = buildBeurteilung();
  const f = gv('frage') === '__ft__' ? gv('frage_ft') : gv('frage'); const projs = [];
  if (gc('p_pa')) projs.push('p.a.'); if (gc('p_lat')) projs.push('lateral'); if (gc('p_ex')) projs.push('Exsp.');
  document.getElementById('prev-sub').textContent = (projs.join(' + ') || 'p.a.') + (f ? ' · ' + f : '');
  const badge = document.getElementById('status-badge'), open = nUnassessed();
  if (hasCrit()) { badge.className = 'rr-tx-badge rr-tx-crit'; badge.textContent = '⚠ Kritischer Befund – ' + (open ? open + ' Region(en) noch offen' : 'alle Regionen beurteilt'); }
  else if (open > 0) { badge.className = 'rr-tx-badge rr-tx-warn'; badge.textContent = '● ' + open + ' Region(en) unbeurteilt'; }
  else if (buildBeurteilung().length <= 2) { badge.className = 'rr-tx-badge rr-tx-warn'; badge.textContent = '● Beurteilung fehlt'; }
  else { badge.className = 'rr-tx-badge rr-tx-ok'; badge.textContent = '✓ Vollständig'; }
}

// -----------------------------------------------------------------------------
// 10) FHIR-Mapping (Demo). Codes werden aus dem kanonischen DOM gelesen.
// -----------------------------------------------------------------------------
function buildFhir() {
  const now = new Date().toISOString(); const obsArr = []; let n = 0;
  const push = (rid, en, text, isNeg, key) => {
    n++;
    obsArr.push({ fullUrl: `urn:uuid:obs-${key || n}`, resource: {
      resourceType: 'Observation', status: 'final', id: `obs-${key || n}`,
      code: { coding: [{ system: 'http://radlex.org', code: rid || 'RID0', display: en || '' }] },
      interpretation: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: isNeg ? 'NEG' : 'POS', display: isNeg ? 'Negative' : 'Positive' }] }],
      valueCodeableConcept: { text: text },
      note: [{ text: isNeg ? 'Ärztlich attestierter Negativbefund (o.B.).' : 'Befund.' }],
    } });
  };
  oREG.forEach(r => {
    const st = regStatus(r.key); if (st === '') return;
    if (st === 'ob') { push(regRid(r.key), regEn(r.key), r.neg, true, r.key); return; }
    if (r.key === 'lunge') {
      const items = getParItems();
      if (!items.length) { push(regRid(r.key), regEn(r.key), r.build('bef'), false, r.key); }
      items.forEach((i, k) => { let txt = i.de; if (i.seite) txt += ' ' + i.seite; if (i.lok) txt += ' (' + i.lok + ')'; if (i.ft) txt += ', ' + i.ft; push(i.rid, i.en, txt, false, `lunge-${k + 1}`); });
    } else if (r.key === 'pleura') {
      const seite = gv('pl_seite'); const map = [['pl_erguss'], ['pl_ptx'], ['pl_schwarte'], ['pl_kalk'], ['pl_tumor']];
      let any = false;
      map.forEach(([id], k) => {
        if (gc(id)) {
          any = true; const rid = elRid(id), en = elEn(id); let txt = en + (seite ? ' ' + seite : '');
          if (id === 'pl_erguss') { const re = gv('pl_erg_re'), li = gv('pl_erg_li'); txt = 'Pleuraerguss' + (re ? ' rechts ' + re : '') + (li ? ' links ' + li : ''); }
          if (id === 'pl_ptx') { const re = gv('pl_ptx_re'), li = gv('pl_ptx_li'); txt = 'Pneumothorax' + (re ? ' rechts ' + re : '') + (li ? ' links ' + li : ''); }
          push(rid, en, txt, false, `pleura-${k + 1}`);
        }
      });
      if (!any) push(regRid(r.key), regEn(r.key), r.build('bef'), false, r.key);
    } else if (r.key === 'herzmediastinum') {
      push(regRid(r.key), regEn(r.key), r.build('bef'), false, r.key);
      const stau = gv('herz_stau'); if (stau) push(elRid('herz_stau'), elEn('herz_stau'), stau + ' pulmonalvenöse Stauungszeichen', false, 'herz-stau');
    } else { push(regRid(r.key), regEn(r.key), r.build('bef'), false, r.key); }
  });
  getDevItems().forEach((d, k) => { let txt = d.typ + (d.lage ? ' (' + d.lage + ')' : '') + ' – ' + d.burt + (d.ft ? ', ' + d.ft : ''); push(d.rid, d.en, txt, false, `dev-${k + 1}`); });
  const lo = (gv('loinc_override') || '36643-5|XR Chest 2 Views').split('|');
  const dr = {
    resourceType: 'DiagnosticReport', status: 'final', id: 'thorax-report',
    code: { coding: [{ system: 'http://loinc.org', code: lo[0], display: lo[1] }, { system: 'http://radlex.org', code: 'RID10211', display: 'chest radiograph' }] },
    effectiveDateTime: now, identifier: [{ value: 'HJK-MRRT-ROE-THORAX-v2.2' }],
    conclusion: buildBeurteilung(), result: obsArr.map(o => ({ reference: o.fullUrl })),
    presentedForm: [{ contentType: 'text/plain', title: 'Röntgen Thorax', data: btoa(unescape(encodeURIComponent('TECHNIK\n' + buildTechnik() + '\n\nBEFUND\n' + buildBefund() + '\n\nBEURTEILUNG\n' + buildBeurteilung()))) }],
  };
  return JSON.stringify({ resourceType: 'Bundle', type: 'document', timestamp: now, meta: { tag: [{ system: 'http://hjk.wien/fhir/CodeSystem/radiology-templates', code: 'radlex-coded' }] }, entry: [{ fullUrl: 'urn:uuid:thorax-report', resource: dr }, ...obsArr] }, null, 2);
}
function toggleFhir() { const b = document.getElementById('fhir-box'); if (b.classList.contains('rr-tx-show')) { b.classList.remove('rr-tx-show'); return; } b.textContent = buildFhir(); b.classList.add('rr-tx-show'); }

// -----------------------------------------------------------------------------
// 11) Kopieren / Zurücksetzen
// -----------------------------------------------------------------------------
function copyReport(btn) {
  const t = `RÖNTGEN THORAX\n${new Date().toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })}\n\nTECHNIK\n${buildTechnik()}\n\nBEFUND\n${buildBefund()}\n\nBEURTEILUNG\n${buildBeurteilung()}`;
  const done = () => { if (btn) { btn.textContent = '✓ Kopiert!'; setTimeout(() => { btn.textContent = '📋 Befundtext kopieren'; }, 2000); } };
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(done).catch(() => fallbackCopy(t, done));
  else fallbackCopy(t, done);
}
function fallbackCopy(t, done) {
  const el = document.createElement('textarea'); el.value = t; document.body.appendChild(el); el.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(el); done && done();
}
function resetAll() {
  if (!confirm('Alle Eingaben zurücksetzen?')) return;
  parCount = 1; devCount = 1;
  document.getElementById('par-list').innerHTML = parTemplateHTML;
  document.getElementById('dev-list').innerHTML = devTemplateHTML;
  document.querySelectorAll('.rr-input-pane select').forEach(s => { if (s.id) s.selectedIndex = 0; });
  document.querySelectorAll('.rr-input-pane input[type=text],.rr-input-pane input[type=number],.rr-input-pane textarea').forEach(i => i.value = '');
  document.querySelectorAll('.rr-tx-proj-chips input').forEach(c => c.checked = false);
  Object.keys(REG).forEach(key => {
    const u = document.getElementById(`st_${key}_unset`); if (u) u.checked = true;
    const rg = document.getElementById('rg-' + key); if (rg) rg.classList.remove('rr-tx-is-bef', 'rr-tx-is-crit');
  });
  document.getElementById('bmod_auto').checked = true;
  document.getElementById('beurt_ft_row').style.display = 'none';
  document.getElementById('frage_ft_row').style.display = 'none';
  ['pl_erguss_row', 'pl_ptx_row', 'pl_seite_row'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
  document.getElementById('fhir-box').classList.remove('rr-tx-show');
  decorateVoiceHints(); update();
}

// -----------------------------------------------------------------------------
// 12) Verdrahtung (Event-Delegation; kein Inline-onclick)
// -----------------------------------------------------------------------------
(function wire() {
  const pane = document.querySelector('.rr-input-pane');

  pane.addEventListener('input', () => update());

  pane.addEventListener('change', e => {
    const t = e.target; if (!t) return;
    if (t.name && t.name.indexOf('st_') === 0) { onStatus(t.name.slice(3)); return; }
    if (['pl_erguss', 'pl_ptx', 'pl_schwarte', 'pl_kalk', 'pl_tumor'].includes(t.id)) { plToggle(); update(); return; }
    if (t.id === 'frage') { document.getElementById('frage_ft_row').style.display = t.value === '__ft__' ? '' : 'none'; update(); return; }
    if (t.name === 'bmod') { toggleBmod(); return; }
    if (t.id && t.id.indexOf('dev-typ-') === 0) { devTypChange(t.id.replace('dev-typ-', '')); update(); return; }
    if (t.id === 'loinc_override') { const b = document.getElementById('fhir-box'); if (b.classList.contains('rr-tx-show')) b.textContent = buildFhir(); return; }
    update();
  });

  // Stack-Löschen (Delegation)
  document.getElementById('par-list').addEventListener('click', e => {
    if (e.target.classList.contains('rr-tx-stack-del')) { e.target.closest('.rr-tx-par-item')?.remove(); update(); }
  });
  document.getElementById('dev-list').addEventListener('click', e => {
    if (e.target.classList.contains('rr-tx-stack-del')) { e.target.closest('.rr-tx-dev-item')?.remove(); update(); }
  });

  // Buttons
  document.getElementById('btn-normal').addEventListener('click', setNormalbefund);
  document.getElementById('btn-voice').addEventListener('click', toggleVoice);
  document.getElementById('btn-add-par').addEventListener('click', addParItem);
  document.getElementById('btn-add-dev').addEventListener('click', addDevItem);
  document.getElementById('btn-copy').addEventListener('click', e => copyReport(e.currentTarget));
  document.getElementById('btn-fhir').addEventListener('click', toggleFhir);
  document.getElementById('btn-reset').addEventListener('click', resetAll);

  // Initialer Aufbau
  // Anfangs-Verbergung der bedingten Felder (kanonisch sind sie sichtbar/CSS-frei;
  // das Ein-/Ausblenden ist Viewer-Verhalten und wird hier zur Laufzeit gesetzt).
  plToggle();
  document.getElementById('frage_ft_row').style.display = 'none';
  document.getElementById('beurt_ft_row').style.display = 'none';
  const pd = document.getElementById('prev-date'); if (pd) pd.textContent = new Date().toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  decorateVoiceHints();
  update();
})();
