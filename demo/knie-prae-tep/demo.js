// =============================================================================
// Demo-Interaktivität für "Planungsröntgen Knie vor TEP" (v1.7)
//
// ABGELEITET / Demo-Schicht: Dieses Skript gehört NICHT ins kanonische
// template.html (das ist nacktes, JS-freies, form-only MRRT). Es baut das
// Viewer-Chrome (Attestierungs-Bedienelemente, Live-Vorschau, CPAK-/KL-
// Anzeigeboxen, Export-Buttons, Konsistenzprüfung) zur Laufzeit auf und liefert
// die gesamte Interaktivität für die GitHub-Pages-Demo. Eingebunden via
// build-demo.js in demo/index.html.
//
// v1.7 – Umsetzung SPEC-ADDENDUM-A (Verification Floor / Feldzustände am
// Messwert). Der frühere direkte LAMA-Vorbefüll-Modus ("stille Auffüllung")
// ist durch das kanonische Fünf-Zustands-Modell ersetzt:
//   active-confirmed · active-corrected · active-rejected ·
//   passive-accepted · not-attested  (+ manual-entered ohne KI-Beteiligung)
// Status wird ABGELEITET (A3), nicht gesetzt. Anzeige-Export-Konsistenz (A4/A6),
// Vorschlag-Erhalt in aiSource.rawValue (A2.2/A7), Transform vor Anzeige (A5).
// =============================================================================


// =============================================================================
// KONFIGURATION – KI-Quelle, Rohwerte, Transformationen, Ablehngründe
// =============================================================================

// Modell-/Quellprovenance (feldübergreifend; landet je Feld in aiSource)
const MODEL_VERSION   = 'IB Lab LAMA 4.2';
const SOURCE_ARTIFACT = 'DICOM SR (LAMA) · StudyUID …7731 · Serie 3';

// Rohwerte, wie sie das externe Werkzeug ausgibt (externe Konvention).
// transform bildet Rohwert -> interne Anzeige-/Vergleichskonvention ab (A5).
// HKA: externe Ausgabe als varus-positive Abweichung; interne Konvention als
// absoluter Tragachsenwinkel (<180° = Varus). Der Schritt kehrt das Vorzeichen
// der Abweichung um (sign-inversion-applied) und erfolgt VOR der Anzeige.
// >>> KLINISCHE KONVENTION (HKA) durch FR zu bestätigen – siehe README/CHANGELOG.
const AI_RAW = {
  hka:   { raw: 5.8,   transform: 'sign-inversion' },
  mad:   { raw: -12.4, transform: 'identity' },
  lld:   { raw: -3.0,  transform: 'identity' },
  mldfa: { raw: 88.5,  transform: 'identity' },
  mmpta: { raw: 84.1,  transform: 'identity' },
  jlca:  { raw: 3.8,   transform: 'identity' }
};

const TRANSFORMS = {
  'identity':       { step: 'identity', label: 'unverändert',
                      apply: v => v },
  'sign-inversion': { step: 'sign-inversion-applied',
                      label: 'Konventionsanpassung: Vorzeicheninversion der Abweichung (extern varus-positiv → intern absolut, <180° = Varus)',
                      apply: v => 180 - v }
};

// Lokale Ablehngründe (dataAbsentReason). Vokabular provisorisch (Addendum A12).
const ABSENT_CS = 'http://hjk.wien/fhir/CodeSystem/measurement-absent-reason';
const ABSENT_REASONS = [
  { code: 'insufficient-acquisition', de: 'unzureichende Ganzbeinaufnahme' },
  { code: 'rotation-malposition',     de: 'Rotationsfehlstellung' },
  { code: 'calibration-missing',      de: 'Kalibrationskugel nicht erkennbar' },
  { code: 'incomplete-imaging',       de: 'unvollständige Abbildung' }
];
const LOCAL_CS = 'http://hjk.wien/fhir/CodeSystem/radiology-templates';
const ATTEST_EXT_URL = 'http://hjk.wien/fhir/StructureDefinition/ai-attestation';

const TEMPLATE_ID = 'HJK-MRRT-KNIE-PRAETEP';
const TEMPLATE_VERSION = '1.7';

// Feld-Metadaten für Befundtext/Export (Reihenfolge = Anzeigereihenfolge)
const AXIS_SPEC = [
  { id: 'hka',   label: 'Tragachsenwinkel (HKA)', unit: '°',  direction: true },
  { id: 'mad',   label: 'MAD',                     unit: ' mm', signed: true },
  { id: 'mldfa', label: 'mLDFA',                   unit: '°' },
  { id: 'mmpta', label: 'mMPTA',                   unit: '°' },
  { id: 'jlca',  label: 'JLCA',                    unit: '°' },
  { id: 'lld',   label: 'Beinlängendifferenz',     unit: ' mm', signed: true }
];

// KI-Felder deklarativ aus dem Formular lesen (data-ai im kanonischen Template)
const AI_FIELDS = Array.from(document.querySelectorAll('input[data-ai]')).map(e => e.id);

// Laufzeit-Zustand pro KI-Feld. aiSource wird beim Aktivieren des LAMA-Modus
// gesetzt (nicht null => Vorschlag liegt vor). interaction: null bis ein
// Auswahlakt stattfindet. reason: Ablehngrund-Code bei reject.
const fieldState = {};
AI_FIELDS.forEach(id => { fieldState[id] = { aiSource: null, interaction: null, reason: null }; });

let currentMode = 'manual'; // 'manual' | 'lama'


// =============================================================================
// HELPERS
// =============================================================================
function round1(v) { return Math.round(v * 10) / 10; }
function parseNum(v) { const n = parseFloat(v); return isNaN(n) ? null : n; }
function approxEq(a, b) { return Math.abs(a - b) < 0.05; }
function fmt(v, spec) {
  const s = (spec && spec.signed && v > 0) ? '+' : '';
  return `${s}${v.toFixed(1)}${spec ? spec.unit : ''}`;
}
function gv(id) { const e = document.getElementById(id); return e ? e.value : ''; }
function gn(id) { return parseNum(gv(id)); }
function gc(id) { const e = document.getElementById(id); return e ? e.checked : false; }
function reasonDe(code) { const r = ABSENT_REASONS.find(x => x.code === code); return r ? r.de : null; }
function transformOf(id) { const r = AI_RAW[id]; return TRANSFORMS[(r && r.transform) || 'identity']; }
function displayFromRaw(id) {
  const r = AI_RAW[id]; if (!r) return null;
  return round1(TRANSFORMS[r.transform].apply(r.raw));
}


// =============================================================================
// FELDZUSTAND ABLEITEN (Addendum A3 – Reihenfolge verbindlich)
//   kein Vorschlag & kein Wert            -> not-attested
//   aiSource == null                      -> manual-entered
//   interactionEvent == null              -> passive-accepted
//   interactionEvent.kind == 'reject'     -> active-rejected
//   value == transform(rawValue)          -> active-confirmed
//   sonst                                 -> active-corrected
// =============================================================================
function resolveField(id) {
  const inp = document.getElementById(id);
  const st = fieldState[id] || { aiSource: null, interaction: null, reason: null };
  const valNum = parseNum(inp ? inp.value : '');
  const hasSug = !!st.aiSource;

  if (!hasSug && valNum === null) {
    return { id, status: 'not-attested', value: null, referenceLabel: false,
             aiSource: null, interaction: null };
  }
  if (!hasSug) {
    return { id, status: 'manual-entered', value: valNum, referenceLabel: true,
             aiSource: null, interaction: null };
  }
  const disp = st.aiSource.displayValue;
  const ie = st.interaction;
  const base = { id, aiSource: st.aiSource, interaction: ie };
  if (ie == null) {
    return { ...base, status: 'passive-accepted', value: disp, referenceLabel: false };
  }
  if (ie.kind === 'reject') {
    return { ...base, status: 'active-rejected', value: null, referenceLabel: false,
             absentReason: st.reason };
  }
  if (valNum !== null && approxEq(valNum, disp)) {
    return { ...base, status: 'active-confirmed', value: disp, referenceLabel: true };
  }
  return { ...base, status: 'active-corrected', value: valNum, referenceLabel: true };
}

const STATUS_LABEL = {
  'not-attested':    'nicht attestiert',
  'manual-entered':  'manuell erfasst · Referenzlabel',
  'passive-accepted':'durchgewinkt (passive-accepted) · nicht im Referenzset',
  'active-confirmed':'bestätigt (active-confirmed) · Referenzlabel',
  'active-corrected':'korrigiert (active-corrected) · Referenzlabel',
  'active-rejected': 'nicht beurteilbar (active-rejected) · Observation ohne Wert'
};


// =============================================================================
// DEMO-CHROME AUFBAUEN
// =============================================================================
(function buildChrome() {
  const app = document.querySelector('.rr-app');
  const pane = document.querySelector('.rr-input-pane');

  // --- Laufzeit-Styles nur für die Demo (kanonisches Template bleibt nackt) --
  const style = document.createElement('style');
  style.textContent = `
    .rr-mode-switch input[type="radio"]{display:none;}
    .rr-attest{margin-top:6px;padding:8px 10px;border:1px solid var(--rr-rule);
      border-radius:var(--rr-radius-sm);background:var(--rr-bg-alt);display:none;}
    .rr-attest.rr-is-on{display:block;}
    .rr-attest-suggestion{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;
      font-size:var(--rr-fs-xs);color:var(--rr-ink-soft);margin-bottom:6px;}
    .rr-attest-sug-label{font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
      color:var(--rr-accent);}
    .rr-attest-sug-value{font-family:var(--rr-font-serif);font-size:var(--rr-fs-lg);
      font-weight:600;color:var(--rr-ink);}
    .rr-attest-sug-meta{color:var(--rr-ink-muted);font-family:var(--rr-font-mono);
      font-size:10px;}
    .rr-attest-choices{display:flex;gap:4px;}
    .rr-attest-choices label{flex:1;text-align:center;font-size:var(--rr-fs-xs);
      padding:5px 6px;border:1px solid var(--rr-field-border);border-radius:var(--rr-radius-xs);
      background:var(--rr-bg);color:var(--rr-ink-soft);cursor:pointer;letter-spacing:0.02em;
      text-transform:none;font-weight:500;margin:0;}
    .rr-attest-choices input[type="radio"]{display:none;}
    .rr-attest-choices label:has(input[value="confirm"]:checked){
      background:var(--rr-accent-pale);border-color:var(--rr-accent);color:var(--rr-accent);font-weight:700;}
    .rr-attest-choices label:has(input[value="correct"]:checked){
      background:#fdf4e3;border-color:#c4a558;color:#8b6914;font-weight:700;}
    .rr-attest-choices label:has(input[value="reject"]:checked){
      background:#fbe9e7;border-color:#c45848;color:#9c2c1a;font-weight:700;}
    .rr-attest-reason{margin-top:6px;}
    .rr-attest-reason select{font-size:var(--rr-fs-sm);padding:6px 8px;}
    .rr-attest-status{margin-top:6px;font-size:10px;font-family:var(--rr-font-mono);
      color:var(--rr-ink-muted);letter-spacing:0.02em;}
    input[readonly]{background:var(--rr-bg-alt);color:var(--rr-ink-soft);cursor:default;}
    input:disabled{background:#f2eceb;color:var(--rr-ink-faint);}
    .rr-consistency{margin-top:16px;padding:12px 14px;border-radius:var(--rr-radius);
      border:1px solid var(--rr-rule);background:var(--rr-bg);}
    .rr-consistency h4{margin:0 0 8px;font-size:10px;letter-spacing:0.14em;
      text-transform:uppercase;color:var(--rr-ink-muted);font-weight:600;}
    .rr-check{display:flex;gap:8px;align-items:flex-start;font-size:var(--rr-fs-xs);
      color:var(--rr-ink-soft);margin:4px 0;line-height:1.4;}
    .rr-check .rr-dot{flex:none;width:14px;height:14px;border-radius:50%;margin-top:1px;
      font-size:10px;line-height:14px;text-align:center;color:#fff;font-weight:700;}
    .rr-check.rr-ok .rr-dot{background:var(--rr-success);}
    .rr-check.rr-fail .rr-dot{background:var(--rr-critical);}
    .rr-loa{margin-top:8px;font-size:10px;font-family:var(--rr-font-mono);
      color:var(--rr-ink-muted);line-height:1.5;}
  `;
  document.head.appendChild(style);

  // --- Modus-Switch (nur zwei Modi: Manuell ohne KI / LAMA mit Attestierung) --
  pane.querySelector('.rr-title-rule').insertAdjacentHTML('afterend', `
    <div class="rr-mode-switch">
      <input type="radio" name="mode" id="mode-manual" value="manual" checked="checked">
      <label for="mode-manual">Manuell (ohne KI)</label>
      <input type="radio" name="mode" id="mode-lama" value="lama">
      <label for="mode-lama">LAMA-Vorschlag (attestieren)</label>
    </div>
    <div class="rr-helper-info" id="modeHelper"><strong>Modus Manuell:</strong> Achsenwerte werden manuell erfasst (kein KI-Vorschlag). Ausgefüllte Felder gelten als <em>manual-entered</em> und zählen als Referenzlabel.</div>
  `);

  // --- Attestierungs-Block je KI-Feld unter das Feld hängen ------------------
  AI_FIELDS.forEach(id => {
    const inp = document.getElementById(id);
    const label = inp.closest('label');
    const note = label.querySelector('.rr-field-note');
    const reasonOpts = ABSENT_REASONS
      .map(r => `<option value="${r.code}">${r.de}</option>`).join('');
    const block = document.createElement('div');
    block.className = 'rr-attest';
    block.dataset.field = id;
    block.innerHTML = `
      <div class="rr-attest-suggestion">
        <span class="rr-attest-sug-label">KI-Vorschlag</span>
        <span class="rr-attest-sug-value" data-role="sug"></span>
        <span class="rr-attest-sug-meta" data-role="meta"></span>
      </div>
      <div class="rr-attest-choices" role="radiogroup" aria-label="Attestierung ${id}">
        <label><input type="radio" name="attest-${id}" value="confirm">Bestätigen</label>
        <label><input type="radio" name="attest-${id}" value="correct">Korrigieren</label>
        <label><input type="radio" name="attest-${id}" value="reject">Nicht beurteilbar</label>
      </div>
      <div class="rr-attest-reason rr-u-hidden">
        <select data-role="reason">
          <option value="">– Grund der Nicht-Beurteilbarkeit –</option>
          ${reasonOpts}
        </select>
      </div>
      <div class="rr-attest-status" data-role="status"></div>`;
    if (note && note.parentNode) note.parentNode.insertBefore(block, note.nextSibling);
    else label.appendChild(block);

    block.querySelectorAll(`input[name="attest-${id}"]`).forEach(radio => {
      radio.addEventListener('change', () => onAttestChoice(id, radio.value));
    });
    block.querySelector('[data-role="reason"]').addEventListener('change', e => {
      fieldState[id].reason = e.target.value || null;
      updatePreview();
    });
  });

  // --- CPAK-Ergebnisbox nach der Achsen-Zeile --------------------------------
  document.getElementById('row_achsen').insertAdjacentHTML('afterend', `
    <div class="rr-result-box">
      <div class="rr-result-value" id="cpak_result">–</div>
      <div class="rr-result-detail" id="cpak_detail">aHKA und JLO benötigen mLDFA + mMPTA</div>
    </div>
  `);

  // --- Kellgren-Lawrence-Zusammenfassung nach der KL-Zeile -------------------
  document.getElementById('row_kl').insertAdjacentHTML('afterend', `
    <div class="rr-grade-summary">
      <div class="rr-grade-item">Medial<strong id="kl_sum_med">–</strong></div>
      <div class="rr-grade-item">Lateral<strong id="kl_sum_lat">–</strong></div>
      <div class="rr-grade-item">PF<strong id="kl_sum_pf">–</strong></div>
    </div>
  `);

  // --- Vorschau-Pane + Aktionen + Konsistenzprüfung --------------------------
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
// MODUS-UMSCHALTUNG
// =============================================================================
const modeHelpers = {
  manual: "<strong>Modus Manuell:</strong> Achsenwerte werden manuell erfasst (kein KI-Vorschlag). Ausgefüllte Felder gelten als <em>manual-entered</em> und zählen als Referenzlabel.",
  lama:   "<strong>Modus LAMA-Vorschlag:</strong> KI-Werte liegen vor und sind je Feld zu attestieren: bestätigen, korrigieren oder als nicht beurteilbar ablehnen. Ohne Auswahlakt bleibt der Wert <em>passive-accepted</em> (durchgewinkt) und wird aus dem Referenzset ausgeschlossen."
};

function applyMode(mode) {
  currentMode = mode;
  document.getElementById('modeHelper').innerHTML = modeHelpers[mode];

  AI_FIELDS.forEach(id => {
    const inp = document.getElementById(id);
    const label = inp.closest('label');
    const badge = label.querySelector('.rr-ai-badge');
    const attest = label.querySelector('.rr-attest');

    // Zustand zurücksetzen (keine Vorauswahl – Invariante A6.2)
    fieldState[id] = { aiSource: null, interaction: null, reason: null };
    attest.querySelectorAll('input[type="radio"]').forEach(r => { r.checked = false; });
    attest.querySelector('[data-role="reason"]').value = '';
    attest.querySelector('.rr-attest-reason').classList.add('rr-u-hidden');
    inp.removeAttribute('readonly');
    inp.removeAttribute('disabled');

    if (mode === 'lama') {
      // aiSource setzen; Rohwert bleibt erhalten (A2.2/A7)
      const disp = displayFromRaw(id);
      const tf = transformOf(id);
      fieldState[id].aiSource = {
        rawValue: AI_RAW[id].raw,
        modelVersion: MODEL_VERSION,
        sourceArtifact: SOURCE_ARTIFACT,
        transform: { name: AI_RAW[id].transform, step: tf.step, label: tf.label },
        displayValue: disp
      };
      // Vorschlag anzeigen; Feld read-only bis "Korrigieren" (Default: passive-accepted)
      inp.value = disp;
      inp.setAttribute('readonly', 'readonly');
      inp.classList.add('rr-is-ai-filled');
      badge.classList.add('rr-is-active');
      attest.classList.add('rr-is-on');
      const unit = (AXIS_SPEC.find(a => a.id === id) || {}).unit || '';
      const meta = AI_RAW[id].transform === 'identity'
        ? `${MODEL_VERSION} · Rohwert ${AI_RAW[id].raw}`
        : `${MODEL_VERSION} · Rohwert ${AI_RAW[id].raw} · ${tf.step}`;
      attest.querySelector('[data-role="sug"]').textContent = disp + unit.trim();
      attest.querySelector('[data-role="meta"]').textContent = meta;
    } else {
      inp.value = '';
      inp.classList.remove('rr-is-ai-filled');
      badge.classList.remove('rr-is-active');
      attest.classList.remove('rr-is-on');
    }
  });
  updatePreview();
}

// Auswahlakt an einem Feld (erzeugt Interaktionsereignis mit Zeitstempel, A6.5)
function onAttestChoice(id, kind) {
  const inp = document.getElementById(id);
  const attest = inp.closest('label').querySelector('.rr-attest');
  const reasonWrap = attest.querySelector('.rr-attest-reason');
  const st = fieldState[id];
  if (!st.aiSource) return; // ohne Vorschlag kein Attestierungsakt

  st.interaction = { kind, timestamp: new Date().toISOString() };

  if (kind === 'confirm') {
    reasonWrap.classList.add('rr-u-hidden');
    inp.removeAttribute('disabled');
    inp.setAttribute('readonly', 'readonly');       // Vorschlag bleibt, nicht editierbar
    inp.value = st.aiSource.displayValue;
    st.reason = null;
  } else if (kind === 'correct') {
    reasonWrap.classList.add('rr-u-hidden');
    inp.removeAttribute('disabled');
    inp.removeAttribute('readonly');                 // erst jetzt eingabefähig (A6.3)
    if (typeof inp.focus === 'function') inp.focus();
    st.reason = null;
  } else if (kind === 'reject') {
    reasonWrap.classList.remove('rr-u-hidden');      // Grund erfassbar
    inp.value = '';                                  // kein Wert
    inp.setAttribute('readonly', 'readonly');
    inp.setAttribute('disabled', 'disabled');
    st.reason = attest.querySelector('[data-role="reason"]').value || null;
  }
  updatePreview();
}

document.querySelectorAll('input[name="mode"]').forEach(r => {
  r.addEventListener('change', () => applyMode(document.querySelector('input[name="mode"]:checked').value));
});


// =============================================================================
// CPAK  (nie vorberechnet konsumiert – intern aus aufgelösten aHKA/JLO, A5)
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
  const aHKA = mmpta - mldfa;          // Varus negativ (interne Konvention)
  const JLO = mmpta + mldfa;
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
  const kugel = gv('proj_kugel') === 'ja'
    ? ' Kalibrationskugel mitabgebildet, Längenmessungen entsprechend kalibriert.' : '';
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

  // Achsenvermessung – jeder angezeigte Wert ist durch eine Observation gedeckt,
  // Ablehnungen erscheinen als explizite Abwesenheitsangabe (A4/A6).
  const achseTeile = [];
  AXIS_SPEC.forEach(spec => {
    const res = resolveField(spec.id);
    if (res.status === 'not-attested') return;
    if (res.status === 'active-rejected') {
      const grund = res.absentReason ? ` (${reasonDe(res.absentReason)})` : '';
      achseTeile.push(`${spec.label} nicht beurteilbar${grund}`);
      return;
    }
    if (res.value === null) return;
    if (spec.direction) {
      let dir = ' (neutrale Achse)';
      if (res.value < 178) dir = ' (Varus)';
      else if (res.value > 182) dir = ' (Valgus)';
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
    const kompartimente = [];
    if (parseInt(klM) >= 3) kompartimente.push('medial');
    if (parseInt(klL) >= 3) kompartimente.push('lateral');
    if (parseInt(klPF) >= 3) kompartimente.push('patellofemoral');
    parts.push(`Fortgeschrittene Gonarthrose ${seite}, ${kompartimente.join('-')}-betont (KL ${klMax}).`);
  } else if (klMax === 2) {
    parts.push(`Mäßige Gonarthrose ${seite} (KL 2).`);
  } else if (klMax <= 1) {
    parts.push(`Keine bzw. allenfalls fragliche radiologische Arthrosezeichen ${seite}.`);
  }

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
// PFLICHTFELD-VALIDIERUNG (visuell, nur Demo)
// =============================================================================
function updateRequiredIndicators() {
  const seiteEl = document.querySelector('input[name="seite"]:checked');
  const seiteOk = seiteEl && seiteEl.value;
  document.getElementById('side_toggle').classList.toggle('rr-is-required-empty', !seiteOk);
  ['kl_med','kl_lat','kl_pf'].forEach(id => {
    const sel = document.getElementById(id);
    sel.classList.toggle('rr-is-required-empty', sel.value === '');
  });
}


// =============================================================================
// ATTESTIERUNGS-STATUS je Feld anzeigen
// =============================================================================
function updateAttestStatus() {
  AI_FIELDS.forEach(id => {
    const res = resolveField(id);
    const st = document.querySelector(`.rr-attest[data-field="${id}"] [data-role="status"]`);
    if (!st) return;
    let txt = STATUS_LABEL[res.status] || res.status;
    if (res.status === 'active-rejected')
      txt += res.absentReason ? ` · ${reasonDe(res.absentReason)}` : ' · Grund offen (dataAbsentReason unknown)';
    st.textContent = txt;
  });
}


// =============================================================================
// FHIR-MAPPING – Bausteine
// =============================================================================
function attestationExtension(res) {
  // Attestierung als Observation.extension, feldgebunden (A8)
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
  const obs = {
    resourceType: 'Observation', status: 'final',
    code: { coding: [{ system: meta.sys, code: meta.code, display: meta.display }] },
    bodySite: bodySite
  };
  if (res.status === 'active-rejected') {
    // Observation OHNE value[x], mit dataAbsentReason (A8)
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
  hka:   { code: 'LP410789-0', sys: 'http://loinc.org', display: 'Hip-knee-ankle angle', unit: 'deg' },
  mad:   { code: 'MAD',        sys: LOCAL_CS, display: 'Mechanical axis deviation', unit: 'mm' },
  mldfa: { code: 'mLDFA',      sys: LOCAL_CS, display: 'Mechanical lateral distal femoral angle', unit: 'deg' },
  mmpta: { code: 'mMPTA',      sys: LOCAL_CS, display: 'Mechanical medial proximal tibial angle', unit: 'deg' },
  jlca:  { code: 'JLCA',       sys: LOCAL_CS, display: 'Joint line convergence angle', unit: 'deg' },
  lld:   { code: 'LP35279-5',  sys: 'http://loinc.org', display: 'Leg length discrepancy', unit: 'mm' }
};


// =============================================================================
// KONSISTENZPRÜFUNG (Assertions A5/A6/A7)
// =============================================================================
function buildObservationList(bodySite) {
  const obs = [];
  AXIS_SPEC.forEach(spec => {
    const res = resolveField(spec.id);
    if (res.status === 'not-attested') return;      // keine Observation
    obs.push({ field: spec.id, res, obs: measurementObservation(res, AXIS_FHIR[spec.id], bodySite) });
  });
  return obs;
}

function runConsistencyCheck() {
  const dummyBody = { text: 'Knie' };
  const list = buildObservationList(dummyBody);

  // A5 – keine stille Auffüllung
  let a5ok = true; const a5detail = [];
  list.forEach(({ field, res, obs }) => {
    if (res.status === 'active-rejected') {
      if ('valueQuantity' in obs || !obs.dataAbsentReason) { a5ok = false; a5detail.push(`${field}: rejected mit Wert`); }
    }
  });
  AI_FIELDS.forEach(id => {
    const res = resolveField(id);
    if (res.status === 'not-attested' && list.some(x => x.field === id)) {
      a5ok = false; a5detail.push(`${id}: not-attested emittiert`);
    }
  });

  // A6 – Anzeige-Export-Konsistenz
  let a6ok = true; const a6detail = [];
  AXIS_SPEC.forEach(spec => {
    const res = resolveField(spec.id);
    const entry = list.find(x => x.field === spec.id);
    const displayed = res.value !== null && res.status !== 'not-attested';
    const hasValue = entry && 'valueQuantity' in entry.obs;
    if (displayed && !hasValue) { a6ok = false; a6detail.push(`${spec.id}: angezeigt ohne value[x]`); }
    if (hasValue && !displayed) { a6ok = false; a6detail.push(`${spec.id}: value[x] ohne Anzeige`); }
    if (hasValue && displayed && !approxEq(entry.obs.valueQuantity.value, res.value)) {
      a6ok = false; a6detail.push(`${spec.id}: Wert ≠ Anzeige`);
    }
  });

  // A7 – Erhalt des Vorschlags: rawValue in jedem Zustand mit Vorschlag auflösbar
  let a7ok = true; const a7detail = [];
  AI_FIELDS.forEach(id => {
    const res = resolveField(id);
    if (res.aiSource) {
      const raw = res.aiSource.rawValue;
      if (raw === null || raw === undefined || raw !== AI_RAW[id].raw) {
        a7ok = false; a7detail.push(`${id}: rawValue nicht erhalten`);
      }
    }
  });

  return [
    { id: 'A5', label: 'Keine stille Auffüllung', ok: a5ok, detail: a5detail.join('; ') },
    { id: 'A6', label: 'Anzeige-Export-Konsistenz', ok: a6ok, detail: a6detail.join('; ') },
    { id: 'A7', label: 'Erhalt des Vorschlags (rawValue)', ok: a7ok, detail: a7detail.join('; ') }
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
  if (loa) loa.innerHTML =
    `LoA-Referenzset: ${ref.length ? ref.join(', ') : '–'}<br>ausgeschlossen: ${excl.length ? excl.join(', ') : '–'}`;
}


// =============================================================================
// PREVIEW UPDATE
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
  const t = ['TECHNIK', document.getElementById('prev_technik').textContent,
             '', 'KLINISCHE ANGABE', document.getElementById('prev_klinik').textContent,
             '', 'BEFUND', document.getElementById('prev_befund').textContent,
             '', 'BEURTEILUNG', document.getElementById('prev_beurteilung').value].join('\n');
  navigator.clipboard.writeText(t).then(() => alert('Befund in Zwischenablage kopiert.'));
}

function resetForm() {
  if (!confirm('Wirklich alles zurücksetzen?')) return;
  location.reload();
}

function getCodingFromSelectedOption(selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return null;
  const opt = sel.options[sel.selectedIndex];
  if (!opt || !opt.value) return null;
  const rid = opt.getAttribute('data-radlex');
  const en = opt.getAttribute('data-en');
  const status = opt.getAttribute('data-radlex-status');
  const coding = [];
  if (rid) coding.push({ system: 'http://radlex.org', code: rid, display: en || opt.text });
  else if (status === 'local') coding.push({ system: LOCAL_CS, code: opt.value.toLowerCase().replace(/\s+/g,'-'), display: en || opt.text });
  return { coding, text: opt.text };
}

function getCodingFromCheckbox(checkboxId) {
  const cb = document.getElementById(checkboxId);
  if (!cb || !cb.checked) return null;
  const rid = cb.getAttribute('data-radlex');
  const en = cb.getAttribute('data-en');
  const status = cb.getAttribute('data-radlex-status');
  const coding = [];
  if (rid) coding.push({ system: 'http://radlex.org', code: rid, display: en });
  else if (status === 'local') coding.push({ system: LOCAL_CS, code: checkboxId, display: en });
  return coding;
}

// baut die Achsen-Attestierungsübersicht für den JSON-Export
function achsenAttestierung() {
  const out = {};
  AXIS_SPEC.forEach(spec => {
    const res = resolveField(spec.id);
    out[spec.id.toUpperCase()] = {
      status: res.status,
      wert: res.value,
      referenzlabel: res.referenceLabel,
      aiSource: res.aiSource ? {
        rawValue: res.aiSource.rawValue,
        modelVersion: res.aiSource.modelVersion,
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
    area.classList.add('rr-is-visible');
    return;
  }
  const cpak = calculateCPAK();
  const mode = currentMode;   // Quelle der Wahrheit; von applyMode gesetzt
  const konsistenz = runConsistencyCheck();

  const refSet = [], exclSet = [];
  AI_FIELDS.forEach(id => {
    const r = resolveField(id);
    if (r.status === 'not-attested') return;
    (r.referenceLabel ? refSet : exclSet).push(id);
  });

  const data = {
    metadata: {
      template: TEMPLATE_ID, version: TEMPLATE_VERSION,
      variante: mode === 'manual' ? 'manuell' : 'lama-attestiert',
      hinweis_variante: 'Verblindeter Anbietervergleich erfordert eine eigene Vorlagenvariante ohne diese Felder (Addendum A7), kein umschaltbarer Modus.',
      seite: seite.value,
      seite_radlex: { code: seite.getAttribute('data-radlex'), system: 'http://radlex.org', display: seite.getAttribute('data-en') },
      datum: new Date().toISOString(),
      modus: mode
    },
    technik: {
      ap_stehend: gv('proj_ap'), seitlich: gv('proj_lat'),
      patella_tangential: gv('proj_pat'), ganzbein_einseitig: gv('proj_lla'),
      rosenberg: gv('proj_rb'), kalibrationskugel: gv('proj_kugel')
    },
    klinische_angabe: gv('indikation'),
    achsenvermessung: achsenAttestierung(),
    loa_referenzset: { referenzlabel: refSet, ausgeschlossen: exclSet },
    cpak: cpak,
    kellgren_lawrence: {
      medial: parseInt(gv('kl_med'))||null,
      lateral: parseInt(gv('kl_lat'))||null,
      patellofemoral: parseInt(gv('kl_pf'))||null
    },
    patellofemoral: { insall_salvati: gv('ps_is'), caton_deschamps: gv('ps_cd'), tilt: gv('ps_tilt'), dejour: gv('ps_dejour') },
    slope: gn('slope'),
    zusatzbefunde: {
      osteophyten: gc('add_osteophyten'), zysten: gc('add_zysten'),
      sklerose: gc('add_sklerose'), freikoerper: gc('add_freikorper'),
      erguss: gc('add_erguss'), baker: gc('add_baker'),
      verkalkungen: gc('add_verkalk'), chondrokalzinose: gc('add_chondrocalc')
    },
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

  if (format === 'json') {
    area.textContent = JSON.stringify(data, null, 2);
  } else if (format === 'fhir') {
    const obs = [];
    const bodySite = {
      coding: [
        { system: 'http://radlex.org', code: 'RID2472', display: 'knee' },
        { system: 'http://radlex.org', code: seite.getAttribute('data-radlex'), display: seite.getAttribute('data-en') }
      ],
      text: `Knie ${seite.value}`
    };

    // Achsenmessungen – zustandsabhängig (value[x] ODER dataAbsentReason), immer
    // mit feldgebundener Attestierungs-Extension inkl. aiSource-Provenance.
    buildObservationList(bodySite).forEach(entry => obs.push(entry.obs));

    // Tibialer Slope (kein KI-Feld) – klassisch
    const slopeVal = gn('slope');
    if (slopeVal !== null) {
      obs.push({
        resourceType:'Observation', status:'final',
        code:{ coding:[{ system:LOCAL_CS, code:'tibial-slope', display:'Posterior tibial slope' }] },
        bodySite: bodySite,
        valueQuantity:{ value:slopeVal, unit:'deg', system:'http://unitsofmeasure.org', code:'deg' }
      });
    }

    [['kl_med','medial'],['kl_lat','lateral'],['kl_pf','patellofemoral']].forEach(([id,kompart]) => {
      const v = parseInt(gv(id));
      if (!isNaN(v)) {
        const sel = document.getElementById(id);
        const opt = sel.options[sel.selectedIndex];
        const rid = opt.getAttribute('data-radlex');
        const coding = [{ system:'http://loinc.org', code:'LP410785-8', display:`Kellgren-Lawrence ${kompart}` }];
        if (rid) coding.push({ system:'http://radlex.org', code:rid, display:opt.getAttribute('data-en') });
        else coding.push({ system:LOCAL_CS, code:`kl-${kompart}-grade-${v}`, display:opt.getAttribute('data-en') });
        obs.push({ resourceType:'Observation', status:'final', code:{ coding }, bodySite, valueInteger:v, interpretation:[{ text:opt.text }] });
      }
    });

    if (cpak) {
      obs.push({
        resourceType:'Observation', status:'final',
        code:{ coding:[{ system:LOCAL_CS, code:'CPAK', display:'Coronal Plane Alignment of the Knee phenotype (MacDessi 2021)' }] },
        bodySite,
        valueString:`Type ${cpak.type}`,
        component:[
          { code:{ text:'aHKA' }, valueQuantity:{ value:parseFloat(cpak.aHKA), unit:'deg' } },
          { code:{ text:'JLO' }, valueQuantity:{ value:parseFloat(cpak.JLO), unit:'deg' } }
        ],
        note:[{ text:'Abgeleitet aus mMPTA/mLDFA – nicht als KI-Wert konsumiert.' }]
      });
    }

    ['ps_is','ps_cd','ps_tilt','ps_dejour','bone_q','vu_trend'].forEach(id => {
      const c = getCodingFromSelectedOption(id);
      if (c && c.coding.length > 0) {
        obs.push({ resourceType:'Observation', status:'final',
          code:{ coding:[{ system:LOCAL_CS, code:id, display:id }] },
          bodySite, valueCodeableConcept:{ coding:c.coding, text:c.text } });
      }
    });

    ['add_osteophyten','add_zysten','add_sklerose','add_freikorper','add_erguss','add_baker','add_verkalk','add_chondrocalc'].forEach(id => {
      const c = getCodingFromCheckbox(id);
      if (c) obs.push({ resourceType:'Observation', status:'final', code:{ coding:c }, bodySite, valueBoolean:true });
    });

    const bundle = {
      resourceType:'Bundle', type:'collection',
      meta:{ profile:['http://hjk.local/StructureDefinition/KneePreTEPReport'],
             tag:[{ system:'http://hjk.wien/fhir/template-variant', code: data.metadata.variante, display:`Vorlage ${TEMPLATE_ID} v${TEMPLATE_VERSION}` }] },
      entry:[
        {
          resource:{
            resourceType:'DiagnosticReport', status:'final',
            category:[{ coding:[{ system:'http://loinc.org', code:'LP29684-5', display:'Radiology' }] }],
            code:{ coding:[
              { system:'http://loinc.org', code:'36572-4', display:'Knee X-ray, preoperative' },
              { system:'http://radlex.org', code:'RPID218', display:'Knee X-ray' }
            ] },
            bodySite,
            conclusion: data.fliesstext.beurteilung,
            presentedForm:[{ contentType:'text/plain', data:btoa(unescape(encodeURIComponent(Object.values(data.fliesstext).join('\n\n')))) }]
          }
        },
        ...obs.map(o => ({ resource:o }))
      ]
    };
    area.textContent = JSON.stringify(bundle, null, 2);
  }
  area.classList.add('rr-is-visible');
}


// =============================================================================
// BUTTON-WIRING (kanonisches Template ist onclick-frei; hier verdrahten)
// =============================================================================
document.getElementById('btn_copy').addEventListener('click', copyAll);
document.getElementById('btn_fhir').addEventListener('click', () => showExport('fhir'));
document.getElementById('btn_json').addEventListener('click', () => showExport('json'));
document.getElementById('btn_reset').addEventListener('click', resetForm);

// Testbarkeit im Headless-DOM (jsdom): interne Funktionen exponieren
try {
  if (typeof window !== 'undefined')
    window.__demo = { resolveField, runConsistencyCheck, applyMode, onAttestChoice, showExport, fieldState, AI_RAW, displayFromRaw, buildObservationList };
} catch (e) {}

// Initiales Rendern (Startzustand: Manuell, keine Vorauswahl)
updatePreview();
