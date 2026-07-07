# Changelog – CT Urolithiasis

## [1.1] – 2026-07-06
### Changed – Migration B → A-Struktur
- `template.html` ist jetzt kanonisch nacktes MRRT: kein `<link rel="stylesheet">`, kein `<style>`, kein `<script>`. Nur das kodierte Eingabeformular mit `rr-*`-Struktur-Hooks.
- Viewer-Chrome (Live-Vorschau, Beurteilungsvorschlag, Status-Badge, Aktions-/Export-Buttons, FHIR-Ausgabe) wird nun in der Demo von `demo.js` zur Laufzeit erzeugt.
- Konkrement-Block **einmal deklarativ** im Template (voll kodiert, `data-field`/`data-stein`); `demo.js` klont ihn für weitere Konkremente (Add/Del) – die 11 Lokalisationen liegen jetzt als deklarative `<option>` im kanonischen File statt im JS-Array.
- `demo/ct-urolithiasis/index.html` wird via `shared/scripts/build-demo.js` aus `template.html` **abgeleitet** (Core-Link + `demo.js`).
- `template.source.html` (B-Artefakt) entfernt.
- Klassen-Mapping auf Core: `.sh`→`.rr-h2-wrap`, `.row/.grid*`→`.rr-row*`, `.lbl`→`.rr-lbl`; eigene Feature-Klassen (`.rr-stein-*`, `.rr-seiten-*`, `.rr-checkgrid`) von `demo.js` gestylt.
- Fix: „Basaler Thorax" wird im Befundtext jetzt aus den Checkboxen gebildet (zuvor referenzierte das Inline-Script ein nicht existentes Feld `thorax`).
- `data-en` an allen `<option>` ergänzt (RadLex-Pflicht §2); keine RIDs geraten – unbelegte Konzepte bleiben `data-radlex-status="local"`.

## [1.0] – 2026-06-08
### Initial
- Basierend auf DRG-Template 041807.2.2203092150 (CC BY 4.0)
- Multi-Stein-Stack: beliebig viele Konkremente, je vollständiges DRG-Datenschema
- Harntransportstörung beidseits im Grid (NBKS-Grad, Ureter-Drittel + Ø, perirenales Ödem)
- DECT-Substanzbestimmung (Calcium / Harnsäure / Sonstige)
- Umgebungsbefunde kollabierbar (Bauchorgane, Gefäße, Lymphknoten, Skelett, basaler Thorax)
- Beurteilungsvorschlag automatisch aus Hauptstein + Harntransport
- FHIR-Bundle R4 (LOINC 24634-8), eine Observation pro Konkrement mit Komponenten
- DRG-Lizenzattribution in dcterms.source und FHIR-Bundle-Tag
