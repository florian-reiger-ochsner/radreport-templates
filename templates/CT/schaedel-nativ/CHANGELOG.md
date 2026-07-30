# Changelog – CT Schädel nativ

Format orientiert an Keep a Changelog. Versionierung: SemVer.

## [1.3.0] – 2026-07-21
### Korrigiert (RadLex-Kodierung – Registry-verifiziert gegen NCBO BioPortal)
- **Gesamte RadLex-Kodierung neu belegt** (Rebuild 6/8). Fast alle bisherigen RIDs trafen Fremdkonzepte
  (RID13882 „image quality" = right parietal lobe, RID4702 „epidural hematoma" = contusion,
  RID4703 „subdural" = hemarthrosis, RID6043 „basal cisterns" = equal density).
- **38 Felder registry-verifiziert:** Blutungen epidural RID4708 / subdural RID4706 / SAB RID4710,
  Herniationen subfalcine RID4949 / uncal RID4950 / transtentorial RID4951 / cerebral RID4948,
  hydrocephalus RID4885, atrophy RID5046, Anatomie cerebral ventricle RID7123, subarachnoid cistern
  RID7180, paranasal sinuses RID28579, skull RID9196, edema RID4865, ischemia RID3376, mass RID3874 u. a.
- **Hybrid-Oberbegriffe** wo kein exaktes Konzept: intraparenchymal/intraventricular/intracranial
  hemorrhage → hemorrhage RID4700; skull fracture → fracture RID4650; old/demarcated infarct → infarction RID5172.
- **45 Werte/Scores/Anker auf `local`:** Fazekas 0–3, ASPECTS, ACA/MCA/PCA territory, midline shift,
  brain parenchyma, white matter disease, non-contrast CT head, Bildqualitäts-Limitationen u. a.
- `RADLEX-MAPPING.md` neu generiert. Feld-`id`s unverändert.

## [1.2.0] – 2026-07-08

### Hinzugefügt (RIS-/Signatur-Ebene)
- **Geteilter RIS-/Signatur-Block** (Pilot). Neuer Kopfbereich mit
  Auftrags-/RIS-Feldern (Zugangsnummer/Accession, Patient-ID,
  Untersuchungsdatum, Zuweiser) und Signatur (signierender Befunder als ID +
  optionaler Klartext, Signaturdatum). Administrative Felder tragen
  `data-ris-source` (HL7/RIS-Mapping-Schlüssel), bewusst **kein** `data-radlex`.
  In Produktion vom RIS/HL7 gefüllt, im Standalone-Export überschreibbar; keine
  Defaults.
- **Single-Source-Mechanik:** Der Block ist genau einmal in
  `shared/partials/ris-header.html` definiert und wird via
  `shared/scripts/stamp-ris-header.js` idempotent in die kanonische
  `template.html` gestempelt (Marker `rr:ris-header:start/end`). Verhindert
  Copy-Paste-Drift über die Templates.
- **FHIR-Export erweitert** (`demo.js`): `DiagnosticReport.resultsInterpreter`
  referenziert einen `Practitioner` mit generischem Identifier
  (`http://hjk.wien/fhir/sid/interpreter`) → ermöglicht die Auswertung „nur
  meine Befunde". Zusätzlich `subject` (Patient-Identifier),
  Accession-Identifier (v2-0203 `ACSN`), `effectiveDateTime` aus
  Untersuchungsdatum, `issued` aus Signaturdatum. Alle Zusätze nur bei
  ausgefüllten Feldern (sauberer Leerfall).

### Hinweis
- Pilot auf diesem Template. Rollout auf die übrigen Templates erfolgt je
  Template durch erneutes `stamp-ris-header.js` + `build-demo.js`.

## [1.1.0] – 2026-07-06

### Geändert (Architektur A-Struktur)
- Umstellung auf **A-Struktur**: kanonisches `template.html` ist jetzt nacktes,
  JS-/CSS-freies MRRT (Struktur-Hooks `rr-*`, volle RadLex-Kodierung, MRRT-Metadaten).
  Die 7 Befundregionen sind deklarativ ausgeschrieben (vormals per Inline-JS
  gerendert); Feld-/Region-Kodierung sitzt am DOM (`data-region`, `data-f`,
  `data-radlex`/`data-en`).
- **Viewer-Chrome ausgelagert** nach `demo/ct-schaedel-nativ/demo.js`: Normalbefund-Makro,
  Tri-State-Reveal, Live-Vorschau, Beurteilungs-Vorschlag, Kopier-/FHIR-/Reset-Buttons,
  Status-Badge. Verdrahtung via `addEventListener` statt Inline-`onclick`.
- Demo wird nun aus dem kanonischen Template abgeleitet (`build-demo.js`,
  Lean-Guard bestanden); Core-Link nur in der Demo.
- Kleinkorrektur Kodierung: Bildqualität-Option „diagnostisch ausreichend" auf
  `RID13882` normalisiert (vormals Pseudo-Suffix `RID13882-good`).

### Entfernt
- `template.source.html` (B-Struktur-Quelle). Das kanonische `template.html`
  **ist** jetzt die Quelle der Wahrheit; kein separater Inline-CSS-Build mehr.

### Unverändert
- Feldinventar, RadLex-RIDs (42), `data-voice`-Tokens, FHIR-Bundle-Logik und
  additives Normalbefund-Modell verbatim erhalten (Round-Trip-fähig).

## [1.0.0] – 2026-06-19

### Hinzugefügt
- Erstversion CT Schädel nativ (CCT) als Notfall-Massentemplate.
- **Additives Normalbefund-Modell**: Tri-State pro Region (— / o. B. / Befund), kein klinischer Default. Normalbefund-Makro als bewusster Attestierungsakt.
- 7 Befundregionen in Befundungsreihenfolge: Blutung (EDH/SDH/SAB/ICB/IVB, Mehrfachauswahl), Ischämie (Stadium/Territorium/ASPECTS/hämorrh. Transformation), Raumforderung, Mittellinie & Herniation, Ventrikel/Liquorräume, Parenchym (Fazekas), Kalvaria/NNH/Weichteile.
- **Voice-Readiness**: einspaltiges lineares Layout, flache Struktur, `data-voice`-Tokens (deutsche Sprechform) auf Chips/Selects/Optionen, ein Freitext-Diktatfeld pro Region.
- Notfall-Akzent (`--notfall`) und Alert-Badge bei kritischen Regionen (Blutung, Ischämie, Mittellinie/Herniation).
- FHIR-Bundle-Export: nur beurteilte Regionen → Observation; attestierte Negativbefunde mit `interpretation=NEG` + Verification-Floor-Note.
- Live-Befundvorschau, Beurteilungs-Vorschlag (klickbar), Kopier-Funktion.

### Basis
- Felddefinitionen Ischämie/Blutung/Herniation/Fazekas aus DRG AK Befundung `041807.2.2104072101` (ct_stroke_nativ), CC BY 4.0; zur allgemeinen kraniellen Nativ-CT erweitert.

### Offen / nächste Schritte
- **RadLex-Verifikationspass** der neuro-spezifischen RIDs (aktuell provisorisch, s. RADLEX-MAPPING.md).
- Klinischer Pilottest im HJK-Routinebetrieb, Reibungssammlung, Feldschärfung.
- Demoserver-Test mit T. Wagner: Render-Treue → Kodierungs-Überleben → Voice-Token-Adressierbarkeit (Carbon bzw. Sectra).
- Reviewer-Eintrag nach erster klinischer Durchsicht.
