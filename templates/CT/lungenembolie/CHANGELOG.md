# Changelog – CT Lungenarterien (CTPA)

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
