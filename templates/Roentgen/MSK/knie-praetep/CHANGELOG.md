# Changelog: Röntgen Knie präoperativ vor TEP

## v1.3.1 – 2026-05-23

### Korrigiert – Defaults-Hygiene (Patient Safety)

- **KL-Selects** (medial, lateral, patellofemoral): keine Default-Werte mehr. Leere Option ist Default und Pflichtfeld.
- **Seitenangabe**: leere Option ergänzt ("– bitte wählen –"), kein automatisches „re." mehr.
- **Knochenstruktur**: leere Option ergänzt, kein „altersentsprechend" als Default mehr.
- **Klinische Angabe**: Textfeld leer (vorher „Schmerzhafte Gonarthrose, präoperative Planung TEP" vorbefüllt).

**Hintergrund:** In v1.3 waren in den drei KL-Selects Default-Werte aktiv (medial 4, lateral 1, PF 2). Diese stammten aus dem UI-Aufbau und wären in produktiver Nutzung ein Befundungsrisiko: der generierte Befundtext hätte Default-Werte als aktive Befunde interpretiert. Konsequente Bereinigung im Sinne der für strukturierte Befundung geltenden Anchoring-Vermeidung.

### Neu – Pflichtfeld-Validierung (visuell)

- Roter pulsierender Punkt-Indikator an allen Pflichtfeldern, solange leer.
- Pflichtfelder optisch hervorgehoben (roter Rand) bis Eingabe erfolgt.
- Befundtext und Beurteilung werden erst generiert, wenn Seite gewählt ist.
- Auto-Beurteilung wird erst generiert, wenn mindestens ein KL-Wert gesetzt ist.
- FHIR/JSON-Export blockt mit klarer Fehlermeldung, solange Seite fehlt.

### Erweitert – Beurteilungslogik

- Beurteilungstext jetzt auch für KL ≤ 1 sinnvoll: „Keine bzw. allenfalls fragliche radiologische Arthrosezeichen".
- Der EndoCert-Konformitätssatz erscheint unabhängig vom Arthrosegrad (gehört zur Achsenvermessung, nicht zur Diagnose).
- TEP-Indikationssatz erscheint nur ab KL ≥ 3 (vorher unbedingt, was inkonsistent war).

### Defaults-Policy (neu, repo-weit verbindlich)

Aufnahme in den Style-Guide:

| Feldtyp | Default-Erlaubt? |
|---|---|
| Diagnostische Klassifikation (KL, Dejour, Patella-Höhe, Tilt, Bone Quality) | ❌ nie |
| Klinische Angabe / Indikation | ❌ nie |
| Seitenangabe | ❌ nie |
| Verlaufstrend | ❌ nie (Voruntersuchung patientenspezifisch) |
| Technik-Standardprojektionen | ✅ ja erlaubt, da Protokoll-fix |
| Optionale Zusatzprojektionen (z. B. Rosenberg) | ✅ nein erlaubt als Default |
| Modus-Schalter (Manuell/LAMA/Hybrid) | ✅ Manuell als sicherer Default |

## v1.3 – 2026-05-21

### Neu – RadLex-Codierung (non-negotiable Standard)

- **Body Region / Modality Coding im `<head>`**: RadLex Knee = `RID2472` ergänzt
- **Seitenangabe**: `data-radlex` (RID5824 li., RID5825 re.) + `data-en`
- **Alle qualitativen Select-Optionen** tragen jetzt:
  - `data-radlex` (RID, wo eine verifizierte RSNA-Ontologie-RID vorliegt) ODER
  - `data-radlex-status="local"` mit `data-en` (lokales CodeSystem, RadLex-Mapping ausstehend)
  - `data-radlex-status="needs-mapping"` für Negationen/Leerwerte
- **Zusatzbefund-Checkboxen** mit RadLex bzw. lokalem Code-System
- **FHIR-Export**:
  - `bodySite` mit RadLex-Coding (RID2472 + Seite) auf jeder Observation
  - Qualitative Felder als `valueCodeableConcept` mit RadLex- bzw. lokalem Coding
  - KL-Grade jetzt mit doppeltem Coding (LOINC + RadLex/local) und `interpretation`
  - CPAK als String-Observation mit aHKA/JLO als Components
  - DiagnosticReport-Code mit LOINC + RadLex Playbook (RPID218)
  - Bundle mit StructureDefinition-Profil-URL

### Neu – EndoCert-Konformität

- Beurteilung enthält automatisch den Standardsatz zur EndoCert-konformen Achsenvermessung (Tragachsenwinkel kalibriert, Vorabdokumentation für postoperative Verlaufskontrolle)
- "HKA" wird im Befundtext als "Tragachsenwinkel (HKA)" formuliert – konform zur EndoCert-Terminologie (Kapitel 4.2.1.2)

### UI / UX

- RadLex-Badges an Sektionsüberschriften (RID/LOINC sichtbar)
- CodeSystem-Legende unterhalb des Formulars (verified / local / needs-mapping)

### Bekannte offene Punkte (siehe `RADLEX-MAPPING.md`)

- Für die meisten KL-Grad-Stufen (1–4), Dejour-Typen, CPAK-Typen, Patella-Höhe-Klassifikationen existieren in RadLex aktuell **keine RIDs**. Diese Werte tragen `data-radlex-status="local"` und verweisen auf `http://hjk.local/CodeSystem/vinzenz-radiologie`.
- Nächster Schritt: systematische Validierung aller RIDs gegen den RadLex Term Browser (https://radlex.org/) vor v1.4

## v1.2 – 2026-05-12

### Geändert
- Bezeichnung „Knieröntgen" → „Planungsröntgen Knie"
- Seiten-Toggle: nur `re.` / `li.` (Entfernung von `bds.`)
- Ganzbein-Aufnahme: einseitig (statt bds.)

### Neu
- Kalibrationskugel als Standardelement (Größe HJK-intern fix definiert)
- Strukturiertes Technik-Feld im JSON/FHIR-Export

## v1.1 – 2026-05-12

### Geändert
- Visueller Look komplett überarbeitet
- Schriften: Source Sans 3 / Source Serif 4
- Akzentfarbe: medizinisches Mittelblau (#2c5f8d)
- Großzügiges Padding, klare Hierarchie
- KL-Summary-Anzeige ergänzt
- Buttons mit Hover- und Feedback-Effekt

## v1.0 – 2026-05-12

### Initial
- MRRT-Template (HTML5) mit Metadaten
- Drei Modi: Manuell / LAMA vorbefüllt / Hybrid
- CPAK-Berechnung nach MacDessi 2021
- Live-Fließtext-Vorschau
- JSON- und FHIR-Bundle-Export
- KL-Grading pro Kompartiment
- Optionale Sektionen: PF-Status, Slope, VU-Vergleich
