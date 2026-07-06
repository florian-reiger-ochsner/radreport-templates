# Changelog – CT Abdomen + Becken

## [2.0] – 2026-07-06
### Geändert – Umstellung auf A-Struktur (Breaking)
- `template.html` ist jetzt **kanonisch nacktes MRRT**: kein `<style>`, kein `<script>`, kein Stylesheet-Link. Reines kodiertes Eingabeformular mit `rr-*`-Struktur-Hooks.
- Gesamtes Viewer-Chrome (Organ-Navigation, Live-Vorschau, Ampel-Status, Textbausteine, FHIR-Export, Buttons) nach `demo/ct-abdomen/demo.js` verlagert, zur Laufzeit erzeugt. Demo via `build-demo.js` abgeleitet.
- **Modiswitch (3 Kontexte allg/notfall/onko) aufgelöst.** Notfall-Checkliste und onkologischer Kontext/RECIST sind nun optionale, immer zugängliche `<details>`-Sektionen; Basis ist die Organsystematik. Textbausteine und Ampel schalten inhaltsgetrieben (Notfall-Positiva bzw. RECIST-Daten) statt über einen Modus.
- RECIST-Zielläsionen deklarativ als 5 statische Zeilen im kanonischen Template (SLD-Summe berechnet demo.js); Notfall-Items deklarativ & kodiert (zuvor JS-generiert).

### Kodierung
- `data-en` (englischer RadLex-Term) auf **allen** Optionen/Feldern ergänzt (zuvor 39/116).
- Ungültige Pseudo-RIDs (Suffixe `-norm`/`-neg`/`-li`) entfernt und als `data-radlex-status="local"` geführt (kein RID-Raten); Lateralitäts-Varianten teilen den Basis-RID. Quantitative RECIST-Felder am Input kodiert.

### Behoben
- Textbaustein-Bugs der v1.0: `buildBefund` las nicht existente IDs (`milz_par`, `gef_ao_*`, `gef_pf_*`, `peri_bef`, `becken_gynae`). Bausteine jetzt konsistent mit dem kanonischen Markup (Checkbox-/Select-Felder).

### Entfällt
- `template.source.html` (B-Struktur-Artefakt) entfernt.

## [1.0] – 2026-06-08
### Initial
- Drei Kontexte: Onkologisches Staging/RECIST, Akutes Abdomen, Allgemein
- RECIST 1.1: dynamische Zielläsions-Tabelle (max. 5), automatische SLD-Summe
- Notfall-Checkliste: 8 Punkte mit ⚠/✓/n.b.-Toggle, Alert-Badge bei positivem Befund
- 11 Organ-Tabs mit RadLex-kodierten Selects
- Alle KM-Phasen als Toggle-Chips kombinierbar
- Vergleichsuntersuchung und Zufallsbefunde (kollabierbar)
- Beurteilungsvorschlag kontextspezifisch (RECIST-Text, Notfall-Positiv-Text, allgemein)
- FHIR-Bundle R4 (LOINC 30652-8), Notfall-Observations mit `interpretation: Abnormal`
