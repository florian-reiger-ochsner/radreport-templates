// =============================================================================
// Demo-Interaktivität für "Planungsröntgen Knie vor TEP" (v1.7)
//
// ABGELEITET / Demo-Schicht. Das kanonische template.html trägt die
// Attestierungs-STRUKTUR jetzt selbst deklarativ (je KI-Messfeld ein
// <fieldset> mit: schreibgeschütztem KI-/DICOM-SR-Feld, Verdict-Radiogruppe
// [übernommen | eigene Messung | nicht verwertbar], eigenem Messfeld und
// Grund-Select). Dieses Skript INJIZIERT diese Bedienelemente nicht mehr,
// sondern VERDRAHTET nur ihr Verhalten (Ein-/Ausblenden, Vorbelegen), leitet
// den Feldzustand ab (SPEC-ADDENDUM-A, A3) und erzeugt Vorschau, Konsistenz-
// prüfung und FHIR-/JSON-Export. Kein CSS/JS im kanonischen Template.
// =============================================================================


// =============================================================================
// KONFIGURATION – KI-Quelle, Rohwerte, Transformationen, Ablehngründe
// =============================================================================
const MODEL_VERSION   = 'IB Lab LAMA 4.2';
const SOURCE_ARTIFACT = 'DICOM SR (LAMA) · StudyUID …7731 · Serie 3';

// Rohwerte, wie sie das externe Werkzeug ausgibt (externe Konvention).
// transform bildet Rohwert -> interne Anzeige-/Vergleichskonvention ab (A5).
// HKA: extern varus-positive Abweichung -> intern absoluter Winkel (<180°=Varus),
// Schritt sign-inversion-applied VOR der Anzeige. LAMA-Konvention noch zu
// bestätigen (nicht geraten) – siehe README/CHANGELOG.
const AI_RAW = {
  hka:   { raw: 5.8,   transform: 'sign-inversion' },
  mad:   { raw: -12.4, transform: 'identity' },
  lld:   { raw: -3.0,  transform: 'identity' },
  mldfa: { raw: 88.5,  transform: 'identity' },
  mmpta: { raw: 84.1,  transform: 'identity' },
  jlca:  { raw: 3.8,   transform: 'identity' }
};

const TRANSFORMS = {
  'identity':       { step: 'identity', label: 'unverändert', apply: v => v },
  'sign-inversion': { step: 'sign-inversion-applied',
                      label: 'Konventionsanpassung: Vorzeicheninversion der Abweichung (extern varus-positiv → intern absolut, <180° = Varus)',
                      apply: v => 180 - v }
};

const ABSENT_CS = 'http://hjk.wien/fhir/CodeSystem/measurement-absent-reason';
const ABSENT_DE = {
  'insufficient-acquisition': 'unzureichende Ganzbeinaufnahme',
  'rotation-malposition':     'Rotationsfehlstellung',
  'calibration-missing':      'Kalibrationskugel nicht erkennbar',
  'incomplete-imaging':       'unvollständige Abbildung'
};
const LOCAL_CS = 'http://hjk.wien/fhir/CodeSystem/radiology-templates';
const ATTEST_EXT_URL = 'http://hjk.wien/fhir/StructureDefinition/ai-attestation';
const TEMPLATE_ID = 'HJK-MRRT-KNIE-PRAETEP';
const TEMPLATE_VERSION = '1.7';

const AXIS_SPEC = [
  { id: 'hka',   label: 'Tragachsenwinkel (HKA)', unit: '°',  direction: true },
  { id: 'mad',   label: 'MAD',                     unit: ' mm', signed: true },
  { id: 'mldfa', label: 'mLDFA',                   unit: '°' },
  { id: 'mmpta', label: 'mMPTA',                   unit: '°' },
  { id: 'jlca',  label: 'JLCA',                    unit: '°' },
  { id: 'lld',   label: 'Beinlängendifferenz',     unit: ' mm', signed: true }
];

// KI-Felder deklarativ aus dem Template lesen (eigenes Messfeld trägt die id)
const AI_FIELDS = Array.from(document.querySelectorAll('input[data-ai-role="own"]')).map(e => e.id);

// Laufzeit-Zustand: aiSource (bei LAMA gesetzt) + interaction-Zeitstempel.
// Verdict/own/reason werden live aus den kanonischen Controls gelesen.
const fieldState = {};
AI_FIELDS.forEach(id => { fieldState[id] = { aiSource: null, tsByKind: {} }; });

let currentMode = 'manual'; // 'manual' | 'lama'


// =============================================================================
// HELPERS
// =============================================================================
function round1(v) { return Math.round(v * 10) / 10; }
function parseNum(v) { const n = parseFloat(v); return isNaN(n) ? null : n; }
function approxEq(a, b) { return Math.abs(a - b) < 0.05; }
function fmt(v, spec) { const s = (spec && spec.signed && v > 0) ? '+' : ''; return `${s}${v.toFixed(1)}${spec ? spec.unit : ''}`; }
function gv(id) { const e = document.getElementById(id); return e ? e.value : ''; }
function gn(id) { return parseNum(gv(id)); }
function gc(id) { const e = document.getElementById(id); return e ? e.checked : false; }

const srEl     = id => document.getElementById(id + '_sr');
const ownEl    = id => document.getElementById(id);
const reasonEl = id => document.getElementById(id + '_reason');
const fieldset = id => document.getElementById('field_' + id);
function verdictOf(id) { const r = document.querySelector(`input[name="verdict_${id}"]:checked`); return r ? r.value : null; }
const VERDICT_KIND = { accept: 'confirm', own: 'correct', reject: 'reject' };

function transformOf(id) { const r = AI_RAW[id]; return TRANSFORMS[(r && r.transform) || 'identity']; }
function displayFromRaw(id) { const r = AI_RAW[id]; if (!r) return null; return round1(TRANSFORMS[r.transform].apply(r.raw)); }
function reasonDe(code) { return ABSENT_DE[code] || null; }


// =============================================================================
// FELDZUSTAND ABLEITEN (Addendum A3 – Reihenfolge verbindlich)
//   kein Vorschlag & kein Wert            -> not-attested
//   aiSource == null                      -> manual-entered
//   verdict == null (kein Auswahlakt)     -> passive-accepted
//   verdict == reject                     -> active-rejected
//   value == transform(rawValue)          -> active-confirmed
//   sonst                                 -> active-corrected
// =============================================================================
function resolveField(id) {
  const st = fieldState[id] || { aiSource: null, tsByKind: {} };
  const hasSug = !!st.aiSource;
  const own = parseNum(ownEl(id) ? ownEl(id).value : '');
  const verdict = verdictOf(id);

  if (!hasSug && verdict === null && own === null) {
    return { id, status: 'not-attested', value: null, referenceLabel: false, aiSource: null, interaction: null };
  }
  if (!hasSug) {
    return { id, status: 'manual-entered', value: own, referenceLabel: true, aiSource: null, interaction: null };
  }
  const disp = st.aiSource.displayValue;
  const kind = verdict ? VERDICT_KIND[verdict] : null;
  const interaction = verdict ? { kind, timestamp: st.tsByKind[kind] || null } : null;
  const base = { id, aiSource: st.aiSource, interaction };

  if (verdict === null) return { ...base, status: 'passive-accepted', value: disp, referenceLabel: false };
  if (verdict === 'reject') {
    const reason = reasonEl(id) ? (reasonEl(id).value || null) : null;
    return { ...base, status: 'active-rejected', value: null, referenceLabel: false, absentReason: reason };
  }
  const value = (verdict === 'own') ? (own !== null ? own : disp) : disp;
  if (approxEq(value, disp)) return { ...base, status: 'active-confirmed', value: disp, referenceLabel: true };
  return { ...base, status: 'active-corrected', value, referenceLabel: true };
}

const STATUS_LABEL = {
  'not-attested':    'nicht attestiert',
  'manual-entered':  'manuell erfasst · Referenzlabel',
  'passive-accepted':'durchgewinkt (passive-accepted) · nicht im Referenzset',
  'active-confirmed':'übernommen (active-confirmed) · Referenzlabel',
  'active-corrected':'eigene Messung (active-corrected) · Referenzlabel',
  'active-rejected': 'nicht verwertbar (active-rejected) · Observation ohne Wert'
};


// =============================================================================
// DEMO-CHROME AUFBAUEN (Controls existieren bereits im Template)
// =============================================================================
(function buildChrome() {
  const app = document.querySelector('.rr-app');
  const pane = document.querySelector('.rr-input-pane');

  const style = document.createElement('style');
  style.textContent = `
    .rr-mode-switch input[type="radio"]{display:none;}
    fieldset.rr-ai-field{border:1px solid var(--rr-rule);border-radius:var(--rr-radius-sm);
      padding:10px 12px 12px;margin:0;background:var(--rr-bg);}
    fieldset.rr-ai-field legend{font-size:var(--rr-fs-xs);font-weight:700;letter-spacing:0.08em;
      text-transform:uppercase;color:var(--rr-ink-muted);padding:0 6px;display:flex;gap:6px;align-items:center;}
    .rr-ai-field .rr-lbl{margin-bottom:4px;}
    .rr-ai-field .rr-ai-sr input{background:var(--rr-ai-tint);border-color:var(--rr-ai-border);}
    .rr-ai-verdict{margin:8px 0 6px;}
    .rr-ai-verdict > .rr-lbl{margin-bottom:4px;}
    .rr-ai-opt{display:inline-flex;align-items:center;gap:4px;font-size:var(--rr-fs-xs);
      padding:4px 7px;margin:2px 4px 2px 0;border:1px solid var(--rr-field-border);
      border-radius:var(--rr-radius-xs);background:var(--rr-bg-alt);cursor:pointer;
      text-transform:none;letter-spacing:0;font-weight:500;color:var(--rr-ink-soft);}
    .rr-ai-opt input{margin:0;}
    .rr-ai-opt:has(input[value="accept"]:checked){background:var(--rr-accent-pale);border-color:var(--rr-accent);color:var(--rr-accent);font-weight:700;}
    .rr-ai-opt:has(input[value="own"]:checked){background:#fdf4e3;border-color:#c4a558;color:#8b6914;font-weight:700;}
    .rr-ai-opt:has(input[value="reject"]:checked){background:#fbe9e7;border-color:#c45848;color:#9c2c1a;font-weight:700;}
    .rr-ai-reason.rr-u-hidden,.rr-ai-own.rr-u-hidden{display:none;}
    .rr-ai-status{margin-top:6px;font-size:10px;font-family:var(--rr-font-mono);color:var(--rr-ink-muted);letter-spacing:0.02em;}
    input[readonly]{background:var(--rr-bg-alt);color:var(--rr-ink-soft);cursor:default;}
    input:disabled,select:disabled{background:#f2eceb;color:var(--rr-ink-faint);cursor:not-allowed;}
    .rr-ai-field.rr-is-manual .rr-ai-sr,.rr-ai-field.rr-is-manual .rr-ai-verdict{opacity:.45;}
    .rr-consistency{margin-top:16px;padding:12px 14px;border-radius:var(--rr-radius);border:1px solid var(--rr-rule);background:var(--rr-bg);}
    .rr-consistency h4{margin:0 0 8px;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--rr-ink-muted);font-weight:600;}
    .rr-check{display:flex;gap:8px;align-items:flex-start;font-size:var(--rr-fs-xs);color:var(--rr-ink-soft);margin:4px 0;line-height:1.4;}
    .rr-check .rr-dot{flex:none;width:14px;height:14px;border-radius:50%;margin-top:1px;font-size:10px;line-height:14px;text-align:center;color:#fff;font-weight:700;}
    .rr-check.rr-ok .rr-dot{background:var(--rr-success);}
    .rr-check.rr-fail .rr-dot{background:var(--rr-critical);}
    .rr-loa{margin-top:8px;font-size:10px;font-family:var(--rr-font-mono);color:var(--rr-ink-muted);line-height:1.5;}
  `;
  document.head.appendChild(style);

  pane.querySelector('.rr-title-rule').insertAdjacentHTML('afterend', `
    <div class="rr-mode-switch">
      <input type="radio" name="mode" id="mode-manual" value="manual" checked="checked">
      <label for="mode-manual">Manuell (ohne KI)</label>
      <input type="radio" name="mode" id="mode-lama" value="lama">
      <label for="mode-lama">LAMA-Vorschlag (attestieren)</label>
    </div>
    <div class="rr-helper-info" id="modeHelper"></div>
  `);

  // je Feld: Status-Zeile (Demo-only) ans fieldset hängen + Verhalten verdrahten
  AI_FIELDS.forEach(id => {
    const fs = fieldset(id);
    const status = document.createElement('div');
    status.className = 'rr-ai-status';
    status.dataset.field = id;
    fs.appendChild(status);
    document.querySelectorAll(`input[name="verdict_${id}"]`).forEach(radio => {
      radio.addEventListener('change', () => onVerdict(id, radio.value));
    });
  });

  document.getElementById('row_achsen').insertAdjacentHTML('afterend', `
    <div class="rr-result-box">
      <div class="rr-result-value" id="cpak_result">–</div>
      <div class="rr-result-detail" id="cpak_detail">aHKA und JLO benötigen mLDFA + mMPTA</div>
    </div>
  `);

  document.getElementById('row_kl').insertAdjacentHTML('afterend', `
    <div class="rr-grade-summary">
      <div class="rr-grade-item">Medial<strong id="kl_sum_med">–</strong></div>
      <div class="rr-grade-item">Lateral<strong id="kl_sum_lat">–</strong></div>
      <div class="rr-grade-item">PF<strong id="kl_sum_pf">–</strong></div>
    </div>
  `);

  app.insertAdjacentHTML('beforeend', `
    <aside class="rr-preview-pane">
      <h2 class="rr-preview-title">Befund-Vorschau</h2>
      <div class="rr-preview-title-rule"></div>
      <div class="rr-preview-section"><h4>Technik</h4><div class="rr-preview-content" id="prev_technik">–</div></div>
      <div class="rr-preview-section"><h4>Klinische Angabe</h4><div class="rr-preview-content" id="prev_klinik">–</div></div>
      <div class="rr-preview-section"><h4>Befund</h4><div class="rr-preview-content" id="prev_befund">–</div></div>
      <div class="rr-preview-section"><h4>Beurteilung <span style="font-size:9px;color:var(--rr-ink-muted);letter-spacing:0.1em;margin-left:4px">EDITIERBAR · ENDOCERT-KONFORM</span></h4><textarea id="prev_beurteilung" class="rr-preview-editable"></textarea></div>
      <div class="rr-consistency" id="consistencyBox">
        <h4>Anzeige-Export-Konsistenz (Addendum A5/A6/A7)</h4>
        <div id="checks"></div>
        <div class="rr-loa" id="loaBox"></div>
      </div>
      <div class="rr-actions">
        <button id="btn_copy" type="button">Befund kopieren</button>
        <button id="btn_fhir" type="button" class="rr-btn-secondary">FHIR-Mapping (Demo)</button>
        <button id="btn_json" type="button" class="rr-btn-secondary">JSON</button>
        <button id="btn_reset" type="button" class="rr-btn-secondary">Zurücksetzen</button>
      </div>
      <div class="rr-export-area" id="exportArea"></div>
      <p class="rr-demo-note" style="font-size:11px;color:var(--rr-ink-muted);margin-top:6px;max-width:64ch;line-height:1.45">Demo-Mapping, kein produktiver Export: zeigt Feld → FHIR-Observation inkl. Attestierungs-Extension, dataAbsentReason und aiSource-Provenance. Die tatsächliche FHIR-Erzeugung erfolgt plattformseitig.</p>
    </aside>
  `);
})();


// =============================================================================
// MODUS + CONTROL-VERHALTEN
// =============================================================================
const modeHelpers = {
  manual: "<strong>Modus Manuell:</strong> kein KI-Wert aus DICOM SR. Nur die eigene Messung ist aktiv; ausgefüllt = <em>manual-entered</em> (Referenzlabel), leer = <em>not-attested</em>.",
  lama:   "<strong>Modus LAMA-Vorschlag:</strong> KI-Wert aus DICOM SR (schreibgeschützt). Je Feld ein Auswahlakt: übernommen / eigene Messung / nicht verwertbar. Ohne Auswahl bleibt der Wert <em>passive-accepted</em> (durchgewinkt, nicht im Referenzset)."
};

// Steuert Sichtbarkeit/Aktivierung der Controls je Feld anhand von Modus+Verdict
function syncControls(id) {
  const fs = fieldset(id), own = ownEl(id), reason = reasonEl(id), sr = srEl(id);
  const reasonWrap = fs.querySelector('.rr-ai-reason');
  const ownWrap = fs.querySelector('.rr-ai-own');
  const verdict = verdictOf(id);

  if (currentMode === 'manual') {
    fs.classList.add('rr-is-manual');
    sr.value = ''; sr.setAttribute('disabled', 'disabled');
    fs.querySelectorAll(`input[name="verdict_${id}"]`).forEach(r => r.setAttribute('disabled', 'disabled'));
    reason.setAttribute('disabled', 'disabled'); reasonWrap.classList.add('rr-u-hidden');
    ownWrap.classList.remove('rr-u-hidden');
    own.removeAttribute('disabled'); own.removeAttribute('readonly');
    return;
  }

  fs.classList.remove('rr-is-manual');
  sr.removeAttribute('disabled'); sr.setAttribute('readonly', 'readonly');
  fs.querySelectorAll(`input[name="verdict_${id}"]`).forEach(r => r.removeAttribute('disabled'));

  // Grund nur bei "nicht verwertbar"
  if (verdict === 'reject') { reason.removeAttribute('disabled'); reasonWrap.classList.remove('rr-u-hidden'); }
  else { reason.setAttribute('disabled', 'disabled'); reason.value = ''; reasonWrap.classList.add('rr-u-hidden'); }

  // eigenes Messfeld nur bei "eigene Messung" eingabefähig (A6.3)
  if (verdict === 'own') {
    ownWrap.classList.remove('rr-u-hidden');
    own.removeAttribute('disabled'); own.removeAttribute('readonly');
  } else {
    own.value = '';
    own.setAttribute('disabled', 'disabled');
    ownWrap.classList.add('rr-u-hidden');
  }
}

function onVerdict(id, value) {
  const kind = VERDICT_KIND[value];
  fieldState[id].tsByKind[kind] = new Date().toISOString();   // Interaktionsereignis (A6.5)
  syncControls(id);
  if (value === 'own') {                                       // Vorschlag als Startwert der Korrektur
    const own = ownEl(id);
    if (parseNum(own.value) === null) own.value = fieldState[id].aiSource.displayValue;
    if (typeof own.focus === 'function') own.focus();
  }
  updatePreview();
}

function applyMode(mode) {
  currentMode = mode;
  document.getElementById('modeHelper').innerHTML = modeHelpers[mode];
  AI_FIELDS.forEach(id => {
    // Auswahl zurücksetzen (keine Vorauswahl – A6.2)
    document.querySelectorAll(`input[name="verdict_${id}"]`).forEach(r => { r.checked = false; });
    fieldState[id].tsByKind = {};
    const badge = fieldset(id).querySelector('.rr-ai-badge');
    if (mode === 'lama') {
      const tf = transformOf(id);
      fieldState[id].aiSource = {
        rawValue: AI_RAW[id].raw, modelVersion: MODEL_VERSION, sourceArtifact: SOURCE_ARTIFACT,
        transform: { name: AI_RAW[id].transform, step: tf.step, label: tf.label },
        displayValue: displayFromRaw(id)
      };
      srEl(id).value = displayFromRaw(id);
      if (badge) badge.style.visibility = 'visible';
    } else {
      fieldState[id].aiSource = null;
      srEl(id).value = '';
      if (badge) badge.style.visibility = 'hidden';
    }
    syncControls(id);
  });
  updatePreview();
}

document.querySelectorAll('input[name="mode"]').forEach(r => {
  r.addEventListener('change', () => applyMode(document.querySelector('input[name="mode"]:checked').value));
});


// =============================================================================
// CPAK (nie vorberechnet konsumiert – intern aus aufgelösten aHKA/JLO, A5)
// =============================================================================
function calculateCPAK() {
  const mldfa = resolveField('mldfa').value;
  const mmpta = resolveField('mmpta').value;
  const box = document.getElementById('cpak_result');
  const detail = document.getElementById('cpak_detail');
  if (mldfa === null || mmpta === null) {
    if (box) box.textContent = '–';
    if (detail) detail.textContent = 'aHKA und JLO benötigen mLDFA + mMPTA';
    return null;
  }
  const aHKA = mmpta - mldfa, JLO = mmpta + mldfa;
  let aHKAcat, aHKAtxt;
  if (aHKA < -2) { aHKAcat = 'varus'; aHKAtxt = 'Varus'; }
  else if (aHKA > 2) { aHKAcat = 'valgus'; aHKAtxt = 'Valgus'; }
  else { aHKAcat = 'neutral'; aHKAtxt = 'Neutral'; }
  let JLOcat, JLOtxt;
  if (JLO < 177) { JLOcat = 'apex-distal'; JLOtxt = 'apex distal'; }
  else if (JLO > 183) { JLOcat = 'apex-proximal'; JLOtxt = 'apex proximal'; }
  else { JLOcat = 'neutral'; JLOtxt = 'neutral'; }
  const cpakMap = {
    'varus_apex-distal':'I','neutral_apex-distal':'II','valgus_apex-distal':'III',
    'varus_neutral':'IV','neutral_neutral':'V','valgus_neutral':'VI',
    'varus_apex-proximal':'VII','neutral_apex-proximal':'VIII','valgus_apex-proximal':'IX'
  };
  const type = cpakMap[`${aHKAcat}_${JLOcat}`];
  if (box) box.textContent = `Typ ${type}`;
  if (detail) detail.innerHTML = `aHKA <strong style="color:var(--rr-accent)">${aHKA.toFixed(1)}°</strong> ${aHKAtxt} <br>JLO <strong style="color:var(--rr-accent)">${JLO.toFixed(1)}°</strong> ${JLOtxt}`;
  return { type, aHKA: aHKA.toFixed(1), JLO: JLO.toFixed(1), aHKAcat, JLOcat };
}


// =============================================================================
// TEXT-GENERIERUNG
// =============================================================================
function generateTechnik() {
  const seiteEl = document.querySelector('input[name="seite"]:checked');
  if (!seiteEl || !seiteEl.value) return '⚠️ Bitte zuerst Seite (re. / li.) wählen.';
  const proj = [];
  if (gv('proj_ap') === 'ja') proj.push('a.p. stehend');
  if (gv('proj_lat') === 'ja') proj.push('seitlich');
  if (gv('proj_pat') === 'ja') proj.push('Patella tangential');
  if (gv('proj_lla') === 'ja') proj.push('Ganzbein-Standaufnahme der Untersuchungsseite');
  if (gv('proj_rb') === 'ja') proj.push('Rosenberg-Aufnahme');
  const seite = seiteEl.value;
  const kugel = gv('proj_kugel') === 'ja' ? ' Kalibrationskugel mitabgebildet, Längenmessungen entsprechend kalibriert.' : '';
  return `Planungsröntgen Knie ${seite} in folgenden Projektionen: ${proj.join(', ') || '–'}.${kugel}`;
}

function generateKlinik() {
  const ind = gv('indikation').trim();
  if (!ind) return '–';
  return ind.endsWith('.') ? ind : ind + '.';
}

function generateBefund() {
  const seiteEl = document.querySelector('input[name="seite"]:checked');
  if (!seiteEl || !seiteEl.value) return '⚠️ Befund kann erst nach Auswahl der Seite generiert werden.';
  const seite = seiteEl.value;
  const lines = [];
  const cpak = calculateCPAK();

  const achseTeile = [];
  AXIS_SPEC.forEach(spec => {
    const res = resolveField(spec.id);
    if (res.status === 'not-attested') return;
    if (res.status === 'active-rejected') {
      const grund = res.absentReason ? ` (${reasonDe(res.absentReason)})` : '';
      achseTeile.push(`${spec.label} nicht beurteilbar${grund}`); return;
    }
    if (res.value === null) return;
    if (spec.direction) {
      let dir = ' (neutrale Achse)';
      if (res.value < 178) dir = ' (Varus)'; else if (res.value > 182) dir = ' (Valgus)';
      achseTeile.push(`${spec.label} ${res.value.toFixed(1)}°${dir}`);
    } else {
      achseTeile.push(`${spec.label} ${fmt(res.value, spec)}`);
    }
  });
  if (achseTeile.length > 0) lines.push(`Achsenvermessung Bein ${seite}: ${achseTeile.join(', ')}.`);
  if (cpak) lines.push(`CPAK-Phänotyp Typ ${cpak.type} (aHKA ${cpak.aHKA}° ${cpak.aHKAcat}, JLO ${cpak.JLO}° ${cpak.JLOcat}).`);

  const klM = gv('kl_med'), klL = gv('kl_lat'), klPF = gv('kl_pf');
  document.getElementById('kl_sum_med').textContent = klM || '–';
  document.getElementById('kl_sum_lat').textContent = klL || '–';
  document.getElementById('kl_sum_pf').textContent = klPF || '–';
  const klParts = [];
  if (klM) klParts.push(`medial KL ${klM}`);
  if (klL) klParts.push(`lateral KL ${klL}`);
  if (klPF) klParts.push(`patellofemoral KL ${klPF}`);
  if (klParts.length > 0) lines.push(`Arthrosegrade nach Kellgren-Lawrence (KL): ${klParts.join(', ')}.`);

  const pfParts = [];
  if (gv('ps_is')) pfParts.push(`Insall-Salvati: ${gv('ps_is')}`);
  if (gv('ps_cd')) pfParts.push(`Caton-Deschamps: ${gv('ps_cd')}`);
  if (gv('ps_tilt')) pfParts.push(`Patella-Tilt: ${gv('ps_tilt')}`);
  if (gv('ps_dejour')) pfParts.push(`Trochleadysplasie: ${gv('ps_dejour')}`);
  if (pfParts.length > 0) lines.push(pfParts.join('; ') + '.');

  const slope = gn('slope');
  if (slope !== null) lines.push(`Tibialer Slope ${slope.toFixed(1)}° (sagittal).`);

  const zb = [];
  if (gc('add_osteophyten')) zb.push('osteophytäre Randanbauten');
  if (gc('add_zysten')) zb.push('subchondrale Zysten');
  if (gc('add_sklerose')) zb.push('subchondrale Sklerose');
  if (gc('add_freikorper')) zb.push('intraartikuläre Freikörper');
  if (gc('add_erguss')) zb.push('Gelenkserguss');
  if (gc('add_baker')) zb.push('Baker-Zyste');
  if (gc('add_verkalk')) zb.push('Weichteilverkalkungen');
  if (gc('add_chondrocalc')) zb.push('Chondrokalzinose');
  if (zb.length > 0) lines.push(`Begleitbefunde: ${zb.join(', ')}.`);

  const bone = gv('bone_q');
  if (bone) lines.push(`Knochenstruktur ${bone}.`);

  const vuDate = gv('vu_date'), vuTrend = gv('vu_trend');
  if (vuDate || vuTrend) lines.push(`Im Vergleich zur Voruntersuchung${vuDate ? ` (${vuDate})` : ''}${vuTrend ? `: ${vuTrend}` : ''}.`);

  const ft = gv('freetext');
  if (ft) lines.push(ft);
  return lines.join(' ');
}

function generateBeurteilung() {
  const seiteEl = document.querySelector('input[name="seite"]:checked');
  if (!seiteEl || !seiteEl.value) return '';
  const seite = seiteEl.value;
  const hka = resolveField('hka').value;
  const cpak = calculateCPAK();
  const klM = gv('kl_med'), klL = gv('kl_lat'), klPF = gv('kl_pf');
  if (!klM && !klL && !klPF) return '';
  const parts = [];
  const klMax = Math.max(parseInt(klM)||0, parseInt(klL)||0, parseInt(klPF)||0);
  if (klMax >= 3) {
    const komp = [];
    if (parseInt(klM) >= 3) komp.push('medial');
    if (parseInt(klL) >= 3) komp.push('lateral');
    if (parseInt(klPF) >= 3) komp.push('patellofemoral');
    parts.push(`Fortgeschrittene Gonarthrose ${seite}, ${komp.join('-')}-betont (KL ${klMax}).`);
  } else if (klMax === 2) parts.push(`Mäßige Gonarthrose ${seite} (KL 2).`);
  else if (klMax <= 1) parts.push(`Keine bzw. allenfalls fragliche radiologische Arthrosezeichen ${seite}.`);
  if (hka !== null) {
    if (hka < 178) parts.push(`Varus-Beinachse (Tragachsenwinkel ${hka.toFixed(1)}°).`);
    else if (hka > 182) parts.push(`Valgus-Beinachse (Tragachsenwinkel ${hka.toFixed(1)}°).`);
    else parts.push(`Neutrale Beinachse (Tragachsenwinkel ${hka.toFixed(1)}°).`);
  }
  if (cpak) parts.push(`CPAK-Phänotyp Typ ${cpak.type}.`);
  if (klMax >= 3) parts.push('Befunde mit dem klinischen Bild einer Primärgonarthrose vereinbar; TEP-Indikation aus radiologischer Sicht gegeben.');
  parts.push('Die präoperative Achsenvermessung ist EndoCert-konform dokumentiert (kalibrierter Tragachsenwinkel; Vorabdokumentation für postoperative Verlaufskontrolle).');
  return parts.join(' ');
}


// =============================================================================
// PFLICHTFELD-VALIDIERUNG + ATTESTIERUNGS-STATUS
// =============================================================================
function updateRequiredIndicators() {
  const seiteEl = document.querySelector('input[name="seite"]:checked');
  document.getElementById('side_toggle').classList.toggle('rr-is-required-empty', !(seiteEl && seiteEl.value));
  ['kl_med','kl_lat','kl_pf'].forEach(id => {
    const sel = document.getElementById(id);
    sel.classList.toggle('rr-is-required-empty', sel.value === '');
  });
}

function updateAttestStatus() {
  AI_FIELDS.forEach(id => {
    const res = resolveField(id);
    const el = document.querySelector(`.rr-ai-status[data-field="${id}"]`);
    if (!el) return;
    let txt = STATUS_LABEL[res.status] || res.status;
    if (res.status === 'active-rejected') txt += res.absentReason ? ` · ${reasonDe(res.absentReason)}` : ' · Grund offen (dataAbsentReason unknown)';
    if (res.aiSource) txt += ` · Rohwert ${res.aiSource.rawValue}${res.aiSource.transform.name !== 'identity' ? ' (' + res.aiSource.transform.step + ')' : ''}`;
    el.textContent = txt;
  });
}


// =============================================================================
// FHIR-MAPPING – Bausteine
// =============================================================================
function attestationExtension(res) {
  const sub = [
    { url: 'attestationState', valueCode: res.status },
    { url: 'referenceLabel',  valueBoolean: res.referenceLabel }
  ];
  if (res.aiSource) {
    const ai = [
      { url: 'rawValue',       valueString: String(res.aiSource.rawValue) },
      { url: 'modelVersion',   valueString: res.aiSource.modelVersion },
      { url: 'sourceArtifact', valueString: res.aiSource.sourceArtifact }
    ];
    if (res.aiSource.transform && res.aiSource.transform.name !== 'identity') {
      ai.push({ url: 'transform', valueString: res.aiSource.transform.step });
      ai.push({ url: 'transformLabel', valueString: res.aiSource.transform.label });
    }
    sub.push({ url: 'aiSource', extension: ai });
  }
  if (res.interaction) {
    sub.push({ url: 'interactionEvent', extension: [
      { url: 'kind', valueCode: res.interaction.kind },
      { url: 'timestamp', valueDateTime: res.interaction.timestamp }
    ]});
  }
  return { url: ATTEST_EXT_URL, extension: sub };
}

function measurementObservation(res, meta, bodySite) {
  const obs = { resourceType: 'Observation', status: 'final',
    code: { coding: [{ system: meta.sys, code: meta.code, display: meta.display }] }, bodySite };
  if (res.status === 'active-rejected') {
    obs.dataAbsentReason = res.absentReason
      ? { coding: [{ system: ABSENT_CS, code: res.absentReason, display: reasonDe(res.absentReason) }] }
      : { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason', code: 'unknown', display: 'Unknown' }] };
  } else {
    obs.valueQuantity = { value: res.value, unit: meta.unit, system: 'http://unitsofmeasure.org', code: meta.unit };
  }
  obs.extension = [attestationExtension(res)];
  return obs;
}

const AXIS_FHIR = {
  hka:   { code: 'HKA', sys: LOCAL_CS, display: 'Hip-knee-ankle angle', unit: 'deg' },
  mad:   { code: 'MAD',        sys: LOCAL_CS, display: 'Mechanical axis deviation', unit: 'mm' },
  mldfa: { code: 'mLDFA',      sys: LOCAL_CS, display: 'Mechanical lateral distal femoral angle', unit: 'deg' },
  mmpta: { code: 'mMPTA',      sys: LOCAL_CS, display: 'Mechanical medial proximal tibial angle', unit: 'deg' },
  jlca:  { code: 'JLCA',       sys: LOCAL_CS, display: 'Joint line convergence angle', unit: 'deg' },
  lld:   { code: 'LLD', sys: LOCAL_CS, display: 'Leg length discrepancy', unit: 'mm' }
};


// =============================================================================
// KONSISTENZPRÜFUNG (Assertions A5/A6/A7)
// =============================================================================
function buildObservationList(bodySite) {
  const obs = [];
  AXIS_SPEC.forEach(spec => {
    const res = resolveField(spec.id);
    if (res.status === 'not-attested') return;
    obs.push({ field: spec.id, res, obs: measurementObservation(res, AXIS_FHIR[spec.id], bodySite) });
  });
  return obs;
}

function runConsistencyCheck() {
  const list = buildObservationList({ text: 'Knie' });
  let a5ok = true; const a5 = [];
  list.forEach(({ field, res, obs }) => {
    if (res.status === 'active-rejected' && ('valueQuantity' in obs || !obs.dataAbsentReason)) { a5ok = false; a5.push(`${field}: rejected mit Wert`); }
  });
  AI_FIELDS.forEach(id => { if (resolveField(id).status === 'not-attested' && list.some(x => x.field === id)) { a5ok = false; a5.push(`${id}: not-attested emittiert`); } });

  let a6ok = true; const a6 = [];
  AXIS_SPEC.forEach(spec => {
    const res = resolveField(spec.id);
    const entry = list.find(x => x.field === spec.id);
    const displayed = res.value !== null && res.status !== 'not-attested';
    const hasValue = entry && 'valueQuantity' in entry.obs;
    if (displayed && !hasValue) { a6ok = false; a6.push(`${spec.id}: angezeigt ohne value[x]`); }
    if (hasValue && !displayed) { a6ok = false; a6.push(`${spec.id}: value[x] ohne Anzeige`); }
    if (hasValue && displayed && !approxEq(entry.obs.valueQuantity.value, res.value)) { a6ok = false; a6.push(`${spec.id}: Wert ≠ Anzeige`); }
  });

  let a7ok = true; const a7 = [];
  AI_FIELDS.forEach(id => {
    const res = resolveField(id);
    if (res.aiSource && res.aiSource.rawValue !== AI_RAW[id].raw) { a7ok = false; a7.push(`${id}: rawValue nicht erhalten`); }
  });

  return [
    { id: 'A5', label: 'Keine stille Auffüllung', ok: a5ok, detail: a5.join('; ') },
    { id: 'A6', label: 'Anzeige-Export-Konsistenz', ok: a6ok, detail: a6.join('; ') },
    { id: 'A7', label: 'Erhalt des Vorschlags (rawValue)', ok: a7ok, detail: a7.join('; ') }
  ];
}

function renderConsistency() {
  const checks = runConsistencyCheck();
  const box = document.getElementById('checks');
  if (box) box.innerHTML = checks.map(c => `
    <div class="rr-check ${c.ok ? 'rr-ok' : 'rr-fail'}">
      <span class="rr-dot">${c.ok ? '✓' : '!'}</span>
      <span><strong>${c.id}</strong> ${c.label}${c.ok ? '' : ' — ' + c.detail}</span>
    </div>`).join('');
  const ref = [], excl = [];
  AI_FIELDS.forEach(id => {
    const res = resolveField(id);
    if (res.status === 'not-attested') return;
    (res.referenceLabel ? ref : excl).push(`${id}:${res.status}`);
  });
  const loa = document.getElementById('loaBox');
  if (loa) loa.innerHTML = `LoA-Referenzset: ${ref.length ? ref.join(', ') : '–'}<br>ausgeschlossen: ${excl.length ? excl.join(', ') : '–'}`;
}


// =============================================================================
// PREVIEW
// =============================================================================
function updatePreview() {
  updateRequiredIndicators();
  updateAttestStatus();
  document.getElementById('prev_technik').textContent = generateTechnik();
  document.getElementById('prev_klinik').textContent = generateKlinik();
  document.getElementById('prev_befund').textContent = generateBefund();
  const beur = document.getElementById('prev_beurteilung');
  if (!beur.dataset.touched) beur.value = generateBeurteilung();
  renderConsistency();
}

document.addEventListener('input', updatePreview);
document.addEventListener('change', updatePreview);
document.getElementById('prev_beurteilung').addEventListener('input', e => e.target.dataset.touched = '1');


// =============================================================================
// COPY / RESET / EXPORT
// =============================================================================
function copyAll() {
  const t = ['TECHNIK', document.getElementById('prev_technik').textContent, '',
             'KLINISCHE ANGABE', document.getElementById('prev_klinik').textContent, '',
             'BEFUND', document.getElementById('prev_befund').textContent, '',
             'BEURTEILUNG', document.getElementById('prev_beurteilung').value].join('\n');
  navigator.clipboard.writeText(t).then(() => alert('Befund in Zwischenablage kopiert.'));
}
function resetForm() { if (confirm('Wirklich alles zurücksetzen?')) location.reload(); }

function getCodingFromSelectedOption(selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return null;
  const opt = sel.options[sel.selectedIndex];
  if (!opt || !opt.value) return null;
  const rid = opt.getAttribute('data-radlex'), en = opt.getAttribute('data-en'), status = opt.getAttribute('data-radlex-status');
  const coding = [];
  if (rid) coding.push({ system: 'http://radlex.org', code: rid, display: en || opt.text });
  else if (status === 'local') coding.push({ system: LOCAL_CS, code: opt.value.toLowerCase().replace(/\s+/g,'-'), display: en || opt.text });
  return { coding, text: opt.text };
}
function getCodingFromCheckbox(checkboxId) {
  const cb = document.getElementById(checkboxId);
  if (!cb || !cb.checked) return null;
  const rid = cb.getAttribute('data-radlex'), en = cb.getAttribute('data-en'), status = cb.getAttribute('data-radlex-status');
  const coding = [];
  if (rid) coding.push({ system: 'http://radlex.org', code: rid, display: en });
  else if (status === 'local') coding.push({ system: LOCAL_CS, code: checkboxId, display: en });
  return coding;
}

function achsenAttestierung() {
  const out = {};
  AXIS_SPEC.forEach(spec => {
    const res = resolveField(spec.id);
    out[spec.id.toUpperCase()] = {
      status: res.status, wert: res.value, referenzlabel: res.referenceLabel,
      aiSource: res.aiSource ? {
        rawValue: res.aiSource.rawValue, modelVersion: res.aiSource.modelVersion,
        sourceArtifact: res.aiSource.sourceArtifact,
        transform: res.aiSource.transform.name === 'identity' ? null : res.aiSource.transform.step
      } : null,
      interactionEvent: res.interaction,
      dataAbsentReason: res.status === 'active-rejected' ? (res.absentReason || 'unknown') : null
    };
  });
  return out;
}

function showExport(format) {
  const area = document.getElementById('exportArea');
  const seite = document.querySelector('input[name="seite"]:checked');
  if (!seite || !seite.value) {
    area.textContent = '// Export nicht möglich: Bitte zuerst Seite (re. / li.) wählen.';
    area.classList.add('rr-is-visible'); return;
  }
  const cpak = calculateCPAK();
  const mode = currentMode;
  const konsistenz = runConsistencyCheck();
  const refSet = [], exclSet = [];
  AI_FIELDS.forEach(id => { const r = resolveField(id); if (r.status === 'not-attested') return; (r.referenceLabel ? refSet : exclSet).push(id); });

  const data = {
    metadata: {
      template: TEMPLATE_ID, version: TEMPLATE_VERSION,
      variante: mode === 'manual' ? 'manuell' : 'lama-attestiert',
      hinweis_variante: 'Verblindeter Anbietervergleich erfordert eine eigene Vorlagenvariante ohne diese Felder (Addendum A7), kein umschaltbarer Modus.',
      seite: seite.value,
      seite_radlex: { code: seite.getAttribute('data-radlex'), system: 'http://radlex.org', display: seite.getAttribute('data-en') },
      datum: new Date().toISOString(), modus: mode
    },
    technik: { ap_stehend: gv('proj_ap'), seitlich: gv('proj_lat'), patella_tangential: gv('proj_pat'),
      ganzbein_einseitig: gv('proj_lla'), rosenberg: gv('proj_rb'), kalibrationskugel: gv('proj_kugel') },
    klinische_angabe: gv('indikation'),
    achsenvermessung: achsenAttestierung(),
    loa_referenzset: { referenzlabel: refSet, ausgeschlossen: exclSet },
    cpak: cpak,
    kellgren_lawrence: { medial: parseInt(gv('kl_med'))||null, lateral: parseInt(gv('kl_lat'))||null, patellofemoral: parseInt(gv('kl_pf'))||null },
    patellofemoral: { insall_salvati: gv('ps_is'), caton_deschamps: gv('ps_cd'), tilt: gv('ps_tilt'), dejour: gv('ps_dejour') },
    slope: gn('slope'),
    zusatzbefunde: { osteophyten: gc('add_osteophyten'), zysten: gc('add_zysten'), sklerose: gc('add_sklerose'),
      freikoerper: gc('add_freikorper'), erguss: gc('add_erguss'), baker: gc('add_baker'),
      verkalkungen: gc('add_verkalk'), chondrokalzinose: gc('add_chondrocalc') },
    knochenstruktur: gv('bone_q'),
    voruntersuchung: { datum: gv('vu_date'), trend: gv('vu_trend') },
    freitext: gv('freetext'),
    fliesstext: {
      technik: document.getElementById('prev_technik').textContent,
      klinik: document.getElementById('prev_klinik').textContent,
      befund: document.getElementById('prev_befund').textContent,
      beurteilung: document.getElementById('prev_beurteilung').value
    },
    _konsistenz: konsistenz
  };

  if (format === 'json') { area.textContent = JSON.stringify(data, null, 2); }
  else if (format === 'fhir') {
    const obs = [];
    const bodySite = { coding: [
      { system: 'http://radlex.org', code: 'RID2472', display: 'knee' },
      { system: 'http://radlex.org', code: seite.getAttribute('data-radlex'), display: seite.getAttribute('data-en') }
    ], text: `Knie ${seite.value}` };

    buildObservationList(bodySite).forEach(entry => obs.push(entry.obs));

    const slopeVal = gn('slope');
    if (slopeVal !== null) obs.push({ resourceType:'Observation', status:'final',
      code:{ coding:[{ system:LOCAL_CS, code:'tibial-slope', display:'Posterior tibial slope' }] }, bodySite,
      valueQuantity:{ value:slopeVal, unit:'deg', system:'http://unitsofmeasure.org', code:'deg' } });

    [['kl_med','medial'],['kl_lat','lateral'],['kl_pf','patellofemoral']].forEach(([id,kompart]) => {
      const v = parseInt(gv(id));
      if (!isNaN(v)) {
        const sel = document.getElementById(id), opt = sel.options[sel.selectedIndex], rid = opt.getAttribute('data-radlex');
        const coding = [{ system:LOCAL_CS, code:'kellgren-lawrence', display:`Kellgren-Lawrence ${kompart}` }];
        if (rid) coding.push({ system:'http://radlex.org', code:rid, display:opt.getAttribute('data-en') });
        else coding.push({ system:LOCAL_CS, code:`kl-${kompart}-grade-${v}`, display:opt.getAttribute('data-en') });
        obs.push({ resourceType:'Observation', status:'final', code:{ coding }, bodySite, valueInteger:v, interpretation:[{ text:opt.text }] });
      }
    });

    if (cpak) obs.push({ resourceType:'Observation', status:'final',
      code:{ coding:[{ system:LOCAL_CS, code:'CPAK', display:'Coronal Plane Alignment of the Knee phenotype (MacDessi 2021)' }] }, bodySite,
      valueString:`Type ${cpak.type}`,
      component:[ { code:{ text:'aHKA' }, valueQuantity:{ value:parseFloat(cpak.aHKA), unit:'deg' } },
                  { code:{ text:'JLO' }, valueQuantity:{ value:parseFloat(cpak.JLO), unit:'deg' } } ],
      note:[{ text:'Abgeleitet aus mMPTA/mLDFA – nicht als KI-Wert konsumiert.' }] });

    ['ps_is','ps_cd','ps_tilt','ps_dejour','bone_q','vu_trend'].forEach(id => {
      const c = getCodingFromSelectedOption(id);
      if (c && c.coding.length > 0) obs.push({ resourceType:'Observation', status:'final',
        code:{ coding:[{ system:LOCAL_CS, code:id, display:id }] }, bodySite, valueCodeableConcept:{ coding:c.coding, text:c.text } });
    });

    ['add_osteophyten','add_zysten','add_sklerose','add_freikorper','add_erguss','add_baker','add_verkalk','add_chondrocalc'].forEach(id => {
      const c = getCodingFromCheckbox(id);
      if (c) obs.push({ resourceType:'Observation', status:'final', code:{ coding:c }, bodySite, valueBoolean:true });
    });

    const bundle = { resourceType:'Bundle', type:'collection',
      meta:{ profile:['http://hjk.local/StructureDefinition/KneePreTEPReport'],
             tag:[{ system:'http://hjk.wien/fhir/template-variant', code: data.metadata.variante, display:`Vorlage ${TEMPLATE_ID} v${TEMPLATE_VERSION}` }] },
      entry:[ { resource:{ resourceType:'DiagnosticReport', status:'final',
            category:[{ coding:[{ system:'http://loinc.org', code:'LP29684-5', display:'Radiology' }] }],
            code:{ coding:[ { system:'http://radlex.org', code:'RPID218', display:'Knee X-ray' } ] },
            bodySite, conclusion: data.fliesstext.beurteilung,
            presentedForm:[{ contentType:'text/plain', data:btoa(unescape(encodeURIComponent(Object.values(data.fliesstext).join('\n\n')))) }] } },
        ...obs.map(o => ({ resource:o })) ] };
    area.textContent = JSON.stringify(bundle, null, 2);
  }
  area.classList.add('rr-is-visible');
}


// =============================================================================
// BUTTON-WIRING + INIT
// =============================================================================
document.getElementById('btn_copy').addEventListener('click', copyAll);
document.getElementById('btn_fhir').addEventListener('click', () => showExport('fhir'));
document.getElementById('btn_json').addEventListener('click', () => showExport('json'));
document.getElementById('btn_reset').addEventListener('click', resetForm);

try {
  if (typeof window !== 'undefined')
    window.__demo = { resolveField, runConsistencyCheck, applyMode, onVerdict, showExport, fieldState, AI_RAW, displayFromRaw, buildObservationList };
} catch (e) {}

applyMode('manual');   // Startzustand: Manuell, keine Vorauswahl (setzt Controls + rendert)
