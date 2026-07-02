# Changelog – Röntgen Knie präoperativ vor TEP

## [1.5] – 2026-07-01
### Geändert (Architektur, keine klinische Inhaltsänderung)
- Migration auf **A-Struktur**: `template.html` ist jetzt kanonisch und **nackt** –
  deklaratives MRRT mit `rr-*`-Struktur-Hooks, **ohne** Stylesheet-Link, `<style>`
  oder `<script>`. Es ist das Plattform-/Import-Gesicht und die Quelle der Wahrheit.
- Interaktivität (Modus-Umschaltung, CPAK, Live-Vorschau, JSON/FHIR-Export) nach
  `demo/knie-prae-tep/demo.js` ausgelagert; Buttons per `addEventListener` verdrahtet
  (kein Inline-`onclick` mehr im Template).
- `demo/knie-prae-tep/index.html` wird nun aus `template.html` via
  `shared/scripts/build-demo.js` abgeleitet (Core-Link + Fonts + Demo-JS injiziert).
- `template.source.html` abgekündigt (entfällt; der Inline-CSS-Build via
  `inline-css.js` ist gegenstandslos).
- RadLex/LOINC-Kodierung unverändert (byte-identisch zur Vorversion verifiziert).

## [1.3] – 2026-06-08
### Geändert
- Refaktoriert gegen `radreport-core.css` v1.0.0 (externer Link, `--rr-*`-Tokens, `.rr-*`-Klassen)
- Umbenennung zu `template.source.html`
- frontmatter.yaml, CHANGELOG.md, RADLEX-MAPPING.md ergänzt

## [1.3.0] – 2026-05-24
### Neu
- Vollständiges RadLex-Mapping: LOINC-Codes auf Achsenmessfeldern (LP410789-0, LP35279-5, LP410785-8)
- KL-Selects: RID49516/17/18 für drei Kompartimente
- CPAK-Ergebnis als RID49519-Observation im FHIR-Bundle
- FHIR mit doppelter Kodierung: LOINC + RadLex pro Observation
- JSON-Export ergänzt
- `data-radlex` + `data-en` auf allen Dropdown-Optionen

## [1.2] – 2026-05-20
### Neu
- CPAK-Kalkulator (MacDessi 2021): aHKA + JLO → Phänotyp I–IX live
- LAMA/Hybrid-Modus mit visueller Kennzeichnung KI-befüllter Felder
- Kellgren-Lawrence Zusammenfassungs-Grid (medial/lateral/PF)
- Patellofemoral-Sektion (Insall-Salvati, Caton-Deschamps, Tilt, Dejour) – kollabierbar
- Tibialer Slope – kollabierbar
- FHIR-Export (DiagnosticReport + Observations)
- Live-Vorschau, Beurteilungsvorschlag (klickbar)
