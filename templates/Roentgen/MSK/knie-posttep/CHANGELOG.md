# Changelog – Röntgen Knie postoperativ nach KTEP

## [LOINC-Korrektur] - 2026-08-02
### Korrigiert (LOINC gegen loinc.org verifiziert, "nie raten")
- Geratene/ungueltige LOINC-Codes entfernt: LP410789-0 (=Revised Prenatal Distress Questionnaire), 24650-4 (=Thorax lat.-decub.-Roentgen).
- Betroffene Felder auf lokales CodeSystem (`http://hjk.wien/fhir/CodeSystem/radiology-templates`) + `data-en` zurueckgefuehrt; `loinc-codes` in frontmatter geleert. Verifizierte LOINC-Codes bei Bedarf via resolve-loinc.js gegen fhir.loinc.org nachtragen.

## [1.2] – 2026-07-21
### Korrigiert (RadLex-Kodierung – Registry-verifiziert gegen NCBO BioPortal)
- **Gesamte RadLex-Kodierung neu belegt** (Rebuild 8/8, letztes Template). Frühere RIDs
  waren großteils geraten und trafen Fremdkonzepte.
- **22 Felder registry-verifiziert**: Arthroplastik (arthroplasty RID1845, unicompartmental
  arthroplasty RID1846, fully constrained implant RID6414), Achsen/Fehlstellung (varus
  deformity RID4769, valgus deformity RID4768, flexion deformity RID4765, alignment RID38801),
  Patella (tilt RID4782, subluxation RID4778, patella infera/„baja" RID39260), Komplikationen
  (arthroplasty loosening RID4619, osteolysis RID5382, heterotopic ossification RID5226,
  effusion RID4872), Knochen (osteopenia RID5388, osteoporosis RID5389), Verlauf/Timing
  (postoperative change RID4591, postoperative RID5729, intraoperative RID39334), Aufnahme
  (anteroposterior projection RID28784, lateral projection RID10523, image quality RID10).
- **Implantat-Details bewusst lokal** (Fixation zementiert/zementfrei/hybrid, Zementmantel
  Femur/Tibia, Constraint-Typ, Overhang/Offset, Slope): RadLex führt hierfür keine
  spezifischen Prothesen-Konzepte; kodiert als `data-radlex-status="local"`.
- Konvention: Feld/Select trägt das Oberkonzept, Optionswerte/Grade sind lokal. `RADLEX-MAPPING.md`
  aus dem finalen Template regeneriert; offline- und `--resolve`-Validierung fehlerfrei.
- Round-trip-stabil: Struktur/`rr-*`-Hooks/Andock-Anker unverändert.

## [1.1.1] – 2026-07-06
### Geändert (Architektur: Umstellung auf A-Struktur)
- `template.html` ist jetzt **kanonisch nacktes MRRT**: kein `<link rel="stylesheet">`, kein `<style>`, kein `<script>`, keine Inline-Handler. Nur das kodierte Eingabeformular mit `rr-*`/Struktur-Hooks und Andock-Ankern (`#preset-bar`, `#ec-checklist`, `#ewald-tbody`, `#flag-grid`, `#ctx-hint`, `#align-intraop-hint`, `#beurt-vorschlag`).
- Viewer-Chrome (Preview-Pane, Preset-Schnellwahl, EndoCert-Badge/-Checkliste, Ewald-Tabelle, Komplikations-Flags, Beurteilungs-Vorschlag, Kopier-/FHIR-/JSON-/Reset-Buttons, Status-Badge) sowie das template-spezifische CSS werden zur Laufzeit von **`demo/knie-posttep/demo.js`** erzeugt und via `addEventListener` verdrahtet.
- Demo neu abgeleitet über `shared/scripts/build-demo.js` (Core-Link nur in der Demo).
### Entfernt
- `template.source.html` (abgelöste B-Struktur/Inline-CSS-Artefakt).
### Neu / Korrektur
- Farbtokens `--accent-deep`, `--endocert`, `--endocert-pale` verbindlich in der Demo gesetzt (waren im Inline-Template undefiniert → EndoCert-/Tabellen-Akzente wurden nicht gerendert).
- `data-en` (RadLex-Term) auf bisher unvollständig kodierten Optionen ergänzt: Patellakomponente (RID49783-norm/49784/49785), Zementmantel Femur/Tibia (RID49800/49801/49802/49803/49804/49805). Kodierung sonst unverändert (round-trip-stabil).

## [1.1] – 2026-06-08
### Geändert
- Refaktoriert gegen `radreport-core.css` v1.0.0
- Umbenennung zu `template.source.html`
### Neu
- Intraop-Kontext (EndoCert): Zeitpunkt-Select, Operateur-Feld, 6-Punkte-Checkliste
- Komponentenstellung im Intraop-Modus ausgeblendet (nicht beurteilbar liegend)
- Knochenstruktur im Intraop-Modus ausgeblendet (präoperatives Wissen)
- Periprothetische Beurteilung im Intraop-Modus ausgeblendet
- Implantat-Presets (4 Zimmer Biomet Standardsysteme HJK)
- Preset-Button deaktiviert bei manueller Feldänderung

## [1.0] – 2026-05-28
### Initial
- Vier Kontexte: Früh-postop, Verlauf, Revision + EndoCert-Intraop
- Implantat-Identifikation mit Constraint-Level und Fixation
- Komponentenstellung quantitativ (LAMA-Felder) + qualitativ
- Ewald-Zonen (10 Zonen, vereinfacht Stufe 1)
- Komplikations-Flags (8, intern – kein Fließtext-Output für Syngo-Kompatibilität)
- EndoCert-Checkliste mit ✓/✗/n.a.-Toggle und farbigem Status-Badge
- FHIR-Bundle mit EndoCert-Tag und Abnormal-Interpretation bei Flags
