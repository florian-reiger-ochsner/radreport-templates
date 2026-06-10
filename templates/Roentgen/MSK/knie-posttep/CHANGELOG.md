# Changelog – Röntgen Knie postoperativ nach KTEP

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
