# Changelog – CT Lungenarterien (CTPA)

## [LOINC-Korrektur] - 2026-08-02
### Korrigiert (LOINC gegen loinc.org verifiziert, "nie raten")
- Geratene/ungueltige LOINC-Codes entfernt: 24634-8 (=portables Thorax-Roentgen, nicht CTPA), 79900-0 und 79901-8 (leer). 48065-7 (Fibrin D-Dimer) bleibt gueltig..
- Betroffene Felder auf lokales CodeSystem (`http://hjk.wien/fhir/CodeSystem/radiology-templates`) + `data-en` zurueckgefuehrt; `loinc-codes` in frontmatter geleert. Verifizierte LOINC-Codes bei Bedarf via resolve-loinc.js gegen fhir.loinc.org nachtragen.

## [1.1] – 2026-07-31
### Korrigiert (RadLex-Kodierung – Registry-verifiziert gegen NCBO BioPortal)
- **Gesamte RadLex-Kodierung neu belegt.** Frühere RIDs waren großteils geraten und
  trafen Fremdkonzepte – u. a. `RID5352` („pneumothorax") für die Lungenembolie selbst
  sowie der erfundene Bereich `RID49850`/`RID49851` (KM-Menge/Bolus).
- **20 Felder registry-verifiziert**: pulmonary embolism RID4834, pulmonary infarction
  RID34889, Hampton hump sign RID35261, consolidation RID43255, ground-glass opacity
  RID28531, emphysema RID4799, pleural effusion RID34539, pericardial effusion RID38588,
  mediastinal lymph node RID28891, lymphadenopathy RID3798, sclerosis RID5227, osteolysis
  RID5382, airway RID1245, thickening RID28509, compression RID4741, pleura RID1362,
  upper abdomen RID29990; Rechtsherz-Struktur als right ventricle RID1389, left ventricle
  RID1392, pulmonary arterial trunk RID35839 (LOINC-Messcodes bleiben erhalten).
- **Bewusst lokal**: LE-Lokalisations-Sublagen (zentral/lobär/segmental/subsegmental),
  Rechtsherzbelastung qualitativ, IVS-Shift, KM-Rückstau/Kontrastreflux, Bolus-Qualität,
  KM-Menge, degenerative Veränderungen, alle Normal-/Negations-Optionen – RadLex führt
  hierfür kein tragfähiges Konzept (`data-radlex-status="local"`).
- Suffix-Konvention (`RID…-neg`/`-cen` etc.) vollständig aufgelöst. `RADLEX-MAPPING.md`
  aus dem finalen Template regeneriert; xmllint, Offline-Lint und `--resolve` fehlerfrei.
- Round-trip-stabil: Struktur, `rr-*`-Hooks und Andock-Anker (`anchor_rvlv`) unverändert.

## [1.0.1] – 2026-07-06 — A-Struktur-Migration
### Changed
- Umstellung von B-Struktur (Inline-CSS-Build) auf A-Struktur: kanonisches
  `template.html` ist jetzt nacktes, JS-/CSS-freies MRRT (nur kodiertes
  Formular, `rr-*`-Struktur-Hooks). Kein `<style>`, kein `<link rel=stylesheet>`,
  kein `<script>` mehr im kanonischen File.
- Viewer-Chrome (RV/LV-Ratio-Box, LE-Pill, Live-Vorschau, Beurteilungsvorschlag,
  Export-/Aktions-Buttons, FHIR-Ausgabe, Status-Badge) in
  `demo/ct-lungenembolie/demo.js` ausgelagert und zur Laufzeit aufgebaut.
  Andock-Anker im Formular: `anchor_rvlv`.
- LE-Nachweis-Toggle auf `rr-side-toggle` umgestellt, ohne klinischen Default
  (kein vorbelegtes „keine LE").
- Demo `demo/ct-lungenembolie/index.html` wird nun via `build-demo.js` aus dem
  kanonischen Template abgeleitet (nicht mehr von Hand gepflegt).
- `template.source.html` entfernt (abgelöste B-Struktur).
### Fixed
- Befund-Builder liest Lungenparenchym jetzt korrekt aus den Checkboxen
  (vormals Referenz auf nicht existierendes Feld `parenchym`).
- Beurteilungsvorschlag: undefinierte Variable `rhb` durch qualitative
  Rechtsherzbelastung (`rhb_qual`) ersetzt.
- RadLex-/LOINC-Kodierung unverändert erhalten (Round-Trip-fähig).

## [1.0] – 2026-06-08
### Initial
- Basierend auf DRG-Template 041807.2.1806120000 (CC BY 4.0), AG Thoraxdiagnostik
- RV/LV-Ratio-Kalkulator live (ESC 2019: ≥ 1,0 = erhöhtes Risiko, grün/rot)
- LE-Nachweis-Toggle: ⚠ Positiv / ✓ Negativ / ? Fraglich mit Pill in Preview
- Lokalisation zweistufig: Ebene (Chips) + anatomische Checkboxen
- Zeichen älterer Embolien (dil. Bronchialarterien, wandständige Thromben, Webs/Bands)
- Truncus pulmonalis-Ø, IVS-Shift, KM-Rückstau
- Weitere Thorax-Befunde: Pleura, Parenchym (Infarktpneumonie, Hampton's Hump), Atemwege, LK, Herz/Gefäße, Oberbauch, Knochen
- Kontextsensitiver Beurteilungsvorschlag
- FHIR-Bundle R4 (LOINC 24634-8 + SNOMED 59282003), RV/LV mit `interpretation: High`
- DRG-Lizenzattribution in dcterms.source und FHIR-Bundle-Tag
