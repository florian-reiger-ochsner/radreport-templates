# Changelog – Röntgen Knie präoperativ vor TEP

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
