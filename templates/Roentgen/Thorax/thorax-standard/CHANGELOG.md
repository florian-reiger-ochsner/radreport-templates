# Changelog – Röntgen Thorax

Alle relevanten Änderungen werden hier dokumentiert.
Format: [Semantic Versioning](https://semver.org/lang/de/)

---

## [1.3] – 2026-06-08

### Geändert
- Template vollständig gegen `radreport-core.css` v1.0.0 refaktoriert
- Alle internen CSS-Tokens (`--bg`, `--accent` etc.) auf `--rr-*`-Tokens migriert
- Alle Layout-Klassen (`.app`, `.input-pane` etc.) auf `.rr-*`-Klassen migriert
- Template-spezifisches CSS auf `rr-thorax-*`-Präfix normiert
- `<style>`-Block auf template-exklusive Komponenten reduziert
- Umbenennung zu `template.source.html` (Repo-Konvention)

### Neu
- `frontmatter.yaml` nach Repo-Schema
- `RADLEX-MAPPING.md` mit vollständiger RID-Tabelle
- GitHub Pages Demo

---

## [1.2] – 2026-05-28

### Neu
- **Multi-Device-Stack**: Beliebig viele Devices hinzufügbar (ersetzt statisches Checkbox-Tabellen-System)
- 24 Device-Typen in 6 Gruppen (Vaskulär, Kardial, Atemweg, Sonden, Drainage, Sonstige)
- Automatischer Lage-Placeholder je nach gewähltem Device-Typ
- 4-stufige Beurteilung pro Device (korrekt / kontrollbedürftig / Fehllage / Fehllage dringlich)
- FHIR-Export: Eine Observation pro Device mit `component` für Lage und Beurteilung

---

## [1.1] – 2026-05-24

### Neu
- **Multi-Parenchym-Stack**: Beliebig viele Parenchym-Befunde gleichzeitig (z.B. Emphysem + Rundherd)
- Fleischner-Terminologie als eigene Gruppe im Parenchym-Dropdown
- Vollständiges RadLex-Mapping auf allen Dropdowns (`data-radlex` + `data-en`)
- FHIR-Export: Separate Observation pro Parenchym-Befund mit RID-Code
- Pleura-Subselects: Erguss-Ausmaß und Pneumothorax-Ausmaß kontextuell eingeblendet
- Identifier im FHIR-Bundle auf `v1.2` gesetzt

---

## [1.0] – 2026-05-20

### Initial
- Erstveröffentlichung
- Domänen: Lunge, Pleura, Herz/Mediastinum, Zwerchfell, Skelett/Weichteile, Devices, Vergleich
- Statisches Device-System (Checkboxen → Tabelle)
- FHIR-Export (DiagnosticReport + 2 Observations)
- Live-Vorschau, Copy/Paste, Reset
