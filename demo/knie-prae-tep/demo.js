// =============================================================================
// Demo-Interaktivität für "Planungsröntgen Knie vor TEP" (v1.5)
//
// ABGELEITET / Demo-Schicht: Dieses Skript gehört NICHT ins kanonische
// template.html (das ist nacktes, JS-freies, form-only MRRT). Es baut das
// Viewer-Chrome (Modus-Switch, Live-Vorschau, CPAK-/KL-Anzeigeboxen,
// Export-Buttons, Validierungs-Marker) zur Laufzeit auf und liefert die
// gesamte Interaktivität für die GitHub-Pages-Demo. Eingebunden via
// build-demo.js in demo/index.html.
// =============================================================================

// =============================================================================
// DEMO-CHROME AUFBAUEN (Canonical ist form-only; Anker-ids: row_achsen,
// row_kl, side_toggle, .rr-app, .rr-input-pane, .rr-title-rule)
// =============================================================================
(function buildChrome() {
  const app = document.querySelector('.rr-app');
  const pane = document.querySelector('.rr-input-pane');

  // Modus-Switch + Helfertext direkt nach der Titel-Linie
  pane.querySelector('.rr-title-rule').insertAdjacentHTML('afterend', `
    <div class="rr-mode-switch">
      <input type="radio" name="mode" id="mode-manual" value="manual" checked>
      <label for="mode-manual">Manuell</label>
      <input type="radio" name="mode" id="mode-lama" value="lama">
      <label for="mode-lama">LAMA vorbefüllt</label>
      <input type="radio" name="mode" id="mode-hybrid" value="hybrid">
      <label for="mode-hybrid">Hybrid (Validierung)</label>
    </div>
    <div class="rr-helper-info" id="modeHelper"><strong>Modus Manuell:</strong> Alle Felder werden manuell befüllt. Für Fallback und Testzwecke.</div>
  `);

  // CPAK-Ergebnisbox nach der Achsen-Zeile
  document.getElementById('row_achsen').insertAdjacentHTML('afterend', `
    <div class="rr-result-box">
      <div class="rr-result-value" id="cpak_result">–</div>
      <div class="rr-result-detail" id="cpak_detail">aHKA und JLO benötigen mLDFA + mMPTA</div>
    </div>
  `);

  // Kellgren-Lawrence-Zusammenfassung nach der KL-Zeile
  document.getElementById('row_kl').insertAdjacentHTML('afterend', `
    <div class="rr-grade-summary">
      <div class="rr-grade-item">Medial<strong id="kl_sum_med">–</strong></div>
      <div class="rr-grade-item">Lateral<strong id="kl_sum_lat">–</strong></div>
      <div class="rr-grade-item">PF<strong id="kl_sum_pf">–</strong></div>
    </div>
  `);

  // Vorschau-Pane + Aktions-Buttons als zweite Spalte
  app.insertAdjacentHTML('beforeend', `
    <aside class="rr-preview-pane">
      <h2 class="rr-preview-title">Befund-Vorschau</h2>
      <div class="rr-preview-title-rule"></div>
      <div class="rr-preview-section"><h4>Technik</h4><div class="rr-preview-content" id="prev_technik">–</div></div>
      <div class="rr-preview-section"><h4>Klinische Angabe</h4><div class="rr-preview-content" id="prev_klinik">–</div></div>
      <div class="rr-preview-section"><h4>Befund</h4><div class="rr-preview-content" id="prev_befund">–</div></div>
      <div class="rr-preview-section"><h4>Beurteilung <span style="font-size:9px;color:var(--rr-ink-muted);letter-spacing:0.1em;margin-left:4px">EDITIERBAR · ENDOCERT-KONFORM</span></h4><textarea id="prev_beurteilung" class="rr-preview-editable"></textarea></div>
      <div class="rr-actions">
        <button id="btn_copy" type="button">Befund kopieren</button>
        <button id="btn_fhir" type="button" class="rr-btn-secondary">FHIR-Mapping (Demo)</button>
        <button id="btn_json" type="button" class="rr-btn-secondary">JSON</button>
        <button id="btn_reset" type="button" class="rr-btn-secondary">Zurücksetzen</button>
      </div>
      <div class="rr-export-area" id="exportArea"></div>
      <p class="rr-demo-note" style="font-size:11px;color:var(--rr-ink-muted);margin-top:6px;max-width:64ch;line-height:1.45">Demo-Mapping, kein produktiver Export: zeigt, welches Feld auf welche FHIR-Observation und welchen Code abgebildet wird. Die tatsächliche FHIR-Erzeugung erfolgt plattformseitig.</p>
    </aside>
  `);
})();

// =============================================================================
// MOCK LAMA DATA
// =============================================================================
const MOCK_LAMA = {
  hka: 174.2, mad: -12.4, lld: -3.0,
  mldfa: 88.5, mmpta: 84.1, jlca: 3.8
};

const modeHelpers = {
  manual: "<strong>Modus Manuell:</strong> Alle Felder werden manuell befüllt. Für Fallback und Testzwecke.",
  lama: "<strong>Modus LAMA vorbefüllt:</strong> Achsenwerte aus DICOM SR übernommen, vom Radiologen zu validieren.",
  hybrid: "<strong>Modus Hybrid:</strong> KI-Werte sichtbar, Eingabe ins Feld validiert / korrigiert. KI-Vorschlag steht unter dem Feld."
};

document.querySelectorAll('input[name="mode"]').forEach(r => {
  r.addEventListener('change', () => {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    document.getElementById('modeHelper').innerHTML = modeHelpers[mode];
    const aiFields = ['hka','mad','lld','mldfa','mmpta','jlca'];
    aiFields.forEach(id => {
      const inp = document.getElementById(id);
      const label = inp.closest('label');
      const badge = label.querySelector('.rr-ai-badge');
      const note = label.querySelector('.rr-field-note');
      inp.classList.remove('rr-is-ai-filled');
      badge.classList.remove('rr-is-active');
      if (note.dataset.original) note.innerHTML = note.dataset.original;
      if (mode === 'lama') {
        inp.value = MOCK_LAMA[id];
        inp.classList.add('rr-is-ai-filled');
        badge.classList.add('rr-is-active');
      } else if (mode === 'hybrid') {
        inp.classList.add('rr-is-ai-filled');
        badge.classList.add('rr-is-active');
        if (!note.dataset.original) note.dataset.original = note.innerHTML;
        note.innerHTML = `KI-Vorschlag: <strong>${MOCK_LAMA[id]}</strong> – Wert eintragen zum Validieren`;
      } else {
        inp.value = '';
      }
    });
    updatePreview();
  });
});

// =============================================================================
// CPAK
// =============================================================================
function calculateCPAK() {
  const mldfa = parseFloat(document.getElementById('mldfa').value);
  const mmpta = parseFloat(document.getElementById('mmpta').value);
  const box = document.getElementById('cpak_result');
  const detail = document.getElementById('cpak_detail');
  if (isNaN(mldfa) || isNaN(mmpta)) {
    box.textContent = '–';
    detail.textContent = 'aHKA und JLO benötigen mLDFA + mMPTA';
    return null;
  }
  const aHKA = mmpta - mldfa;
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
  box.textContent = `Typ ${type}`;
  detail.innerHTML = `aHKA <strong style="color:var(--rr-accent)">${aHKA.toFixed(1)}°</strong> ${aHKAtxt} <br>JLO <strong style="color:var(--rr-accent)">${JLO.toFixed(1)}°</strong> ${JLOtxt}`;
  return { type, aHKA: aHKA.toFixed(1), JLO: JLO.toFixed(1), aHKAcat, JLOcat };
}

// =============================================================================
// HELPERS
// =============================================================================
function gv(id) { return document.getElementById(id).value; }
function gn(id) { const v = parseFloat(document.getElementById(id).value); return isNaN(v) ? null : v; }
function gc(id) { return document.getElementById(id).checked; }

// =============================================================================
// TEXT GENERATION
// =============================================================================
function generateTechnik() {
  const seiteEl = document.querySelector('input[name="seite"]:checked');
  if (!seiteEl || !seiteEl.value) {
    return '⚠️ Bitte zuerst Seite (re. / li.) wählen.';
  }
  const proj = [];
  if (gv('proj_ap') === 'ja') proj.push('a.p. stehend');
  if (gv('proj_lat') === 'ja') proj.push('seitlich');
  if (gv('proj_pat') === 'ja') proj.push('Patella tangential');
  if (gv('proj_lla') === 'ja') proj.push('Ganzbein-Standaufnahme der Untersuchungsseite');
  if (gv('proj_rb') === 'ja') proj.push('Rosenberg-Aufnahme');
  const seite = seiteEl.value;
  const kugel = gv('proj_kugel') === 'ja'
    ? ' Kalibrationskugel mitabgebildet, Längenmessungen entsprechend kalibriert.'
    : '';
  return `Planungsröntgen Knie ${seite} in folgenden Projektionen: ${proj.join(', ') || '–'}.${kugel}`;
}

function generateKlinik() {
  const ind = gv('indikation').trim();
  if (!ind) return '–';
  return ind.endsWith('.') ? ind : ind + '.';
}

function generateBefund() {
  const seiteEl = document.querySelector('input[name="seite"]:checked');
  if (!seiteEl || !seiteEl.value) {
    return '⚠️ Befund kann erst nach Auswahl der Seite generiert werden.';
  }
  const seite = seiteEl.value;
  const lines = [];
  const hka = gn('hka'), mad = gn('mad'), lld = gn('lld');
  const mldfa = gn('mldfa'), mmpta = gn('mmpta'), jlca = gn('jlca');
  const cpak = calculateCPAK();

  const achseTeile = [];
  if (hka !== null) {
    let achsenrichtung = '';
    if (hka < 178) achsenrichtung = ' (Varus)';
    else if (hka > 182) achsenrichtung = ' (Valgus)';
    else achsenrichtung = ' (neutrale Achse)';
    achseTeile.push(`Tragachsenwinkel (HKA) ${hka.toFixed(1)}°${achsenrichtung}`);
  }
  if (mad !== null) achseTeile.push(`MAD ${mad > 0 ? '+' : ''}${mad.toFixed(1)} mm`);
  if (mldfa !== null) achseTeile.push(`mLDFA ${mldfa.toFixed(1)}°`);
  if (mmpta !== null) achseTeile.push(`mMPTA ${mmpta.toFixed(1)}°`);
  if (jlca !== null) achseTeile.push(`JLCA ${jlca.toFixed(1)}°`);
  if (lld !== null) achseTeile.push(`Beinlängendifferenz ${lld > 0 ? '+' : ''}${lld.toFixed(1)} mm`);
  if (achseTeile.length > 0) {
    lines.push(`Achsenvermessung Bein ${seite}: ${achseTeile.join(', ')}.`);
  }
  if (cpak) {
    lines.push(`CPAK-Phänotyp Typ ${cpak.type} (aHKA ${cpak.aHKA}° ${cpak.aHKAcat}, JLO ${cpak.JLO}° ${cpak.JLOcat}).`);
  }

  const klM = gv('kl_med'), klL = gv('kl_lat'), klPF = gv('kl_pf');
  document.getElementById('kl_sum_med').textContent = klM || '–';
  document.getElementById('kl_sum_lat').textContent = klL || '–';
  document.getElementById('kl_sum_pf').textContent = klPF || '–';
  const klParts = [];
  if (klM) klParts.push(`medial KL ${klM}`);
  if (klL) klParts.push(`lateral KL ${klL}`);
  if (klPF) klParts.push(`patellofemoral KL ${klPF}`);
  if (klParts.length > 0) {
    lines.push(`Arthrosegrade nach Kellgren-Lawrence (KL): ${klParts.join(', ')}.`);
  }

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
  if (vuDate || vuTrend) {
    lines.push(`Im Vergleich zur Voruntersuchung${vuDate ? ` (${vuDate})` : ''}${vuTrend ? `: ${vuTrend}` : ''}.`);
  }

  const ft = gv('freetext');
  if (ft) lines.push(ft);

  return lines.join(' ');
}

function generateBeurteilung() {
  const seiteEl = document.querySelector('input[name="seite"]:checked');
  if (!seiteEl || !seiteEl.value) return '';
  const seite = seiteEl.value;
  const hka = gn('hka');
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

  if (klMax >= 3) {
    parts.push('Befunde mit dem klinischen Bild einer Primärgonarthrose vereinbar; TEP-Indikation aus radiologischer Sicht gegeben.');
  }
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
// PREVIEW UPDATE
// =============================================================================
function updatePreview() {
  updateRequiredIndicators();
  document.getElementById('prev_technik').textContent = generateTechnik();
  document.getElementById('prev_klinik').textContent = generateKlinik();
  document.getElementById('prev_befund').textContent = generateBefund();
  const beur = document.getElementById('prev_beurteilung');
  if (!beur.dataset.touched) beur.value = generateBeurteilung();
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
  else if (status === 'local') coding.push({ system: 'http://hjk.wien/fhir/CodeSystem/radiology-templates', code: opt.value.toLowerCase().replace(/\s+/g,'-'), display: en || opt.text });
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
  else if (status === 'local') coding.push({ system: 'http://hjk.wien/fhir/CodeSystem/radiology-templates', code: checkboxId, display: en });
  return coding;
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
  const data = {
    metadata: {
      template: 'HJK-MRRT-KNIE-PRAETEP', version: '1.5',
      seite: seite.value,
      seite_radlex: { code: seite.getAttribute('data-radlex'), system: 'http://radlex.org', display: seite.getAttribute('data-en') },
      datum: new Date().toISOString(),
      modus: document.querySelector('input[name="mode"]:checked').value
    },
    technik: {
      ap_stehend: gv('proj_ap'), seitlich: gv('proj_lat'),
      patella_tangential: gv('proj_pat'), ganzbein_einseitig: gv('proj_lla'),
      rosenberg: gv('proj_rb'), kalibrationskugel: gv('proj_kugel')
    },
    klinische_angabe: gv('indikation'),
    achsenvermessung: {
      HKA: gn('hka'), MAD: gn('mad'), LLD: gn('lld'),
      mLDFA: gn('mldfa'), mMPTA: gn('mmpta'), JLCA: gn('jlca'),
      datenquelle: document.querySelector('input[name="mode"]:checked').value === 'manual'
        ? 'manuell' : 'IB-Lab-LAMA via DICOM-SR'
    },
    cpak: cpak,
    kellgren_lawrence: {
      medial: parseInt(gv('kl_med'))||null,
      lateral: parseInt(gv('kl_lat'))||null,
      patellofemoral: parseInt(gv('kl_pf'))||null
    },
    patellofemoral: {
      insall_salvati: gv('ps_is'), caton_deschamps: gv('ps_cd'),
      tilt: gv('ps_tilt'), dejour: gv('ps_dejour')
    },
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
    }
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

    const quantMap = [
      { id:'hka', code:'LP410789-0', sys:'http://loinc.org', display:'Hip-knee-ankle angle', val:gn('hka'), unit:'deg' },
      { id:'mad', code:'MAD', sys:'http://hjk.wien/fhir/CodeSystem/radiology-templates', display:'Mechanical axis deviation', val:gn('mad'), unit:'mm' },
      { id:'mldfa', code:'mLDFA', sys:'http://hjk.wien/fhir/CodeSystem/radiology-templates', display:'Mechanical lateral distal femoral angle', val:gn('mldfa'), unit:'deg' },
      { id:'mmpta', code:'mMPTA', sys:'http://hjk.wien/fhir/CodeSystem/radiology-templates', display:'Mechanical medial proximal tibial angle', val:gn('mmpta'), unit:'deg' },
      { id:'jlca', code:'JLCA', sys:'http://hjk.wien/fhir/CodeSystem/radiology-templates', display:'Joint line convergence angle', val:gn('jlca'), unit:'deg' },
      { id:'lld', code:'LP35279-5', sys:'http://loinc.org', display:'Leg length discrepancy', val:gn('lld'), unit:'mm' },
      { id:'slope', code:'tibial-slope', sys:'http://hjk.wien/fhir/CodeSystem/radiology-templates', display:'Posterior tibial slope', val:gn('slope'), unit:'deg' }
    ];
    quantMap.forEach(o => {
      if (o.val !== null && o.val !== undefined) {
        obs.push({
          resourceType:'Observation', status:'final',
          code:{ coding:[{ system:o.sys, code:o.code, display:o.display }] },
          bodySite: bodySite,
          valueQuantity:{ value:o.val, unit:o.unit, system:'http://unitsofmeasure.org', code:o.unit }
        });
      }
    });

    [['kl_med','medial'],['kl_lat','lateral'],['kl_pf','patellofemoral']].forEach(([id,kompart]) => {
      const v = parseInt(gv(id));
      if (!isNaN(v)) {
        const sel = document.getElementById(id);
        const opt = sel.options[sel.selectedIndex];
        const rid = opt.getAttribute('data-radlex');
        const coding = [
          { system:'http://loinc.org', code:'LP410785-8', display:`Kellgren-Lawrence ${kompart}` }
        ];
        if (rid) coding.push({ system:'http://radlex.org', code:rid, display:opt.getAttribute('data-en') });
        else coding.push({ system:'http://hjk.wien/fhir/CodeSystem/radiology-templates', code:`kl-${kompart}-grade-${v}`, display:opt.getAttribute('data-en') });
        obs.push({
          resourceType:'Observation', status:'final',
          code:{ coding },
          bodySite: bodySite,
          valueInteger: v,
          interpretation:[{ text:opt.text }]
        });
      }
    });

    if (cpak) {
      obs.push({
        resourceType:'Observation', status:'final',
        code:{ coding:[{ system:'http://hjk.wien/fhir/CodeSystem/radiology-templates', code:'CPAK', display:'Coronal Plane Alignment of the Knee phenotype (MacDessi 2021)' }] },
        bodySite: bodySite,
        valueString:`Type ${cpak.type}`,
        component:[
          { code:{ text:'aHKA' }, valueQuantity:{ value:parseFloat(cpak.aHKA), unit:'deg' } },
          { code:{ text:'JLO' }, valueQuantity:{ value:parseFloat(cpak.JLO), unit:'deg' } }
        ]
      });
    }

    const categoricalSelects = ['ps_is','ps_cd','ps_tilt','ps_dejour','bone_q','vu_trend'];
    categoricalSelects.forEach(id => {
      const c = getCodingFromSelectedOption(id);
      if (c && c.coding.length > 0) {
        obs.push({
          resourceType:'Observation', status:'final',
          code:{ coding:[{ system:'http://hjk.wien/fhir/CodeSystem/radiology-templates', code:id, display:id }] },
          bodySite: bodySite,
          valueCodeableConcept:{ coding:c.coding, text:c.text }
        });
      }
    });

    const zusatz = ['add_osteophyten','add_zysten','add_sklerose','add_freikorper','add_erguss','add_baker','add_verkalk','add_chondrocalc'];
    zusatz.forEach(id => {
      const c = getCodingFromCheckbox(id);
      if (c) {
        obs.push({
          resourceType:'Observation', status:'final',
          code:{ coding:c },
          bodySite: bodySite,
          valueBoolean: true
        });
      }
    });

    const bundle = {
      resourceType:'Bundle', type:'collection',
      meta:{ profile:['http://hjk.local/StructureDefinition/KneePreTEPReport'] },
      entry:[
        {
          resource:{
            resourceType:'DiagnosticReport', status:'final',
            category:[{ coding:[{ system:'http://loinc.org', code:'LP29684-5', display:'Radiology' }] }],
            code:{ coding:[
              { system:'http://loinc.org', code:'36572-4', display:'Knee X-ray, preoperative' },
              { system:'http://radlex.org', code:'RPID218', display:'Knee X-ray' }
            ] },
            bodySite: bodySite,
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

updatePreview();
