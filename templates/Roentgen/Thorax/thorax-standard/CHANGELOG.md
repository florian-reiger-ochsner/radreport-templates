# Changelog – Röntgen Thorax

Alle relevanten Änderungen werden hier dokumentiert.
Format: [Semantic Versioning](https://semver.org/lang/de/)

---

## [2.2] – 2026-07-06

### Geändert – Aufspaltung: Liegend-Befund ausgelagert

Die a.p.-Liegend-/Bettaufnahme (ICU / portable chest) wird ab dieser Version als
eigenständiges Template geführt: **`thorax-liegend`** (HJK-MRRT-ROE-THORAX-LIEGEND).
Begründung: Der Liegendbefund ist primär eine Lage-/Device-Kontrolle und braucht
ein an die Rückenlage angepasstes Zeichen-Vokabular (Erguss/Pneumothorax, keine
CTR) – ein Template für beide Nutzungen wäre für beide unübersichtlich.

`thorax-standard` ist damit **rein aufrecht** (p.a. ± lateral, Exspiration):

- **Entfernt:** Projektions-Chip „a.p. (liegend)" (`p_ap`) aus Technik.
- **Entfernt:** Aufnahmequalitäts-Option „eingeschränkt – Liegendaufnahme".
- **Demo-JS bereinigt:** `p_ap`-Verzweigungen in `buildTechnik()` und `update()`
  entfernt; Demo neu abgeleitet.
- **Metadaten:** `frontmatter.yaml` ohne `ap-liegend`, Querverweis (`verwandt`)
  auf das Liegend-Template ergänzt; README-Projektionen aktualisiert.

Keine Änderung an den geteilten Anatomie-Domänen, Feld-IDs oder deren Kodierung –
Round-Trip-Fähigkeit unberührt.

---

## [2.1.1] – 2026-07-03

### Geändert (Architektur, keine klinische Inhaltsänderung)
- **Migration auf A-Struktur.** `template.html` ist jetzt kanonisch und **nackt** –
  deklaratives, form-only MRRT mit `rr-tx-*`-Struktur-Hooks und **voller
  RadLex-Kodierung** (`data-radlex` RID + `data-en`) auf allen Optionen/Checkboxen,
  **ohne** Stylesheet-/Font-Link, `<style>` oder `<script>`. Es ist das
  Plattform-/Import-Gesicht und die Quelle der Wahrheit. Besteht den Lean-Check
  von `build-demo.js`.
- **Kodierung statt JS-Arrays.** Die zuvor per JavaScript generierten Formularteile
  (5 Tri-State-Regionen, Parenchym-Stack mit 16 Fleischner-Codes, Device-Stack mit
  24 Typen) sind als statisches deklaratives MRRT ausgeschrieben; die RadLex-Codes
  liegen jetzt im Markup, nicht mehr nur in `PAR_OPTIONS`/`DEV_TYPES`/`REGIONS`.
- **Chrome + Interaktivität nach `demo/roentgen-thorax/demo.js`.** Viewer-Chrome
  (Normalbefund-/Voice-Makro, Stack-Add/Delete, Aktions-Buttons, LOINC-Override,
  FHIR-Mapping-Box, Legende, Live-Vorschau, Status-Badge), das template-spezifische
  `rr-tx-*`-Stylesheet sowie die Tri-State-Show/Hide-Logik werden zur Laufzeit
  aufgebaut und per `addEventListener`/Delegation verdrahtet (kein Inline-`onclick`).
  Die Stacks klonen die kanonische Erst-Instanz; das FHIR-Mapping liest die Codes
  aus dem DOM (keine Code-Duplizierung).
- **`demo/roentgen-thorax/index.html`** wird aus `template.html` via
  `shared/scripts/build-demo.js` abgeleitet (Core-Link + Fonts + Demo-JS injiziert).
- **`template.source.html` entfällt** (abgekündigte B-Struktur; Inline-CSS-Build via
  `inline-css.js` gegenstandslos).
- RadLex-Kodierung inhaltlich unverändert: alle 72 Form-Konzept-Codes byte-stabil
  aus der Vorversion übernommen (Set-Diff gegen `template.source.html` verifiziert;
  einzige Nicht-Übernahmen `RID0`/`RID10211` sind FHIR-Report-Level in `demo.js`).
- Demo im Headless-DOM getestet: Chrome baut fehlerfrei auf; Tri-State, Stacks
  (Add/Delete), Normalbefund-Makro, Live-Vorschau, FHIR-Mapping und Reset
  funktionieren.

## [2.1] – 2026-06-25

### Neu (additiv, nicht-breaking)
- **Pleuraerguss seitengetrennt graduierbar.** Statt einer einzelnen Ausmaß-Angabe jetzt zwei Selects (rechts / links), jeweils klein / mittelgroß / groß / massiv. Damit sind **beidseitige, unterschiedlich ausgeprägte Ergüsse** abbildbar (z. B. „großer Pleuraerguss rechts und kleiner Pleuraerguss links"). Eine Seite leer = einseitig. Befundtext und FHIR-Export komponieren die Seiten zusammen.
- **Pneumothorax ebenfalls seitengetrennt** (rechts / links), gleiche Logik wie Erguss; beidseitiger Pneumothorax abbildbar, „Spannungspneumothorax" je Seite wählbar.
- **Gemeinsamer „Seite"-Schalter aufgeräumt.** Da Erguss und Pneumothorax ihre Seite jetzt selbst tragen, erscheint der allgemeine Seiten-Selektor nur noch, wenn Schwarte / Kalk / Tumor aktiv ist (und ist entsprechend beschriftet). Kein redundantes Seitenfeld mehr im Erguss-/Pneu-Kontext.
- **Wirbelkörperfraktur / Sinterung** als Knochen-Option ergänzt (`sk_wk`). Schließt die Lücke zwischen „degenerative WS" und den bereits vorhandenen Rippen-/Sternumfrakturen; relevant für osteoporotische Sinterung am Thoraxbild. RadLex `RID34669` 🟡 (zu verifizieren).
- **Freitext-Ergänzung je Region (generisch).** Jede Region (Lunge, Pleura, Herz/Mediastinum, Zwerchfell, Skelett) hat jetzt automatisch ein „Ergänzung (Freitext)"-Feld — für Details, die die strukturierten Felder nicht fassen (z. B. welche/wieviele Wirbelkörper eingebrochen, Höhenminderung). Wird an den Regionssatz angehängt und fließt in den FHIR-`presentedForm`-Narrativtext. Skelett hat einen kontextspezifischen Platzhalter. Das bisherige Pleura-Einzelfeld (`pl_ft`) ist in diese generische Lösung überführt (keine Funktionseinbuße). Devices behalten ihre per-Eintrag-Ergänzung.

### Geändert
- **Pulmonalvenöse Stauung dem Herz/Mediastinum zugeordnet** (vorher Parenchym-Option im Lungen-Stack). Jetzt graduierbar (gering / mittelgradig / hochgradig, je mit radiologischem Korrelat: Umverteilung / interstitielles / alveoläres Ödem). Entspricht dem Diktatfluss „Herz vergrößert, mittelgradige Stauungszeichen". RadLex `RID5056` bleibt; im FHIR-Export als eigene kodierte Observation am Herz.
- **Befundungs-/Ausgabereihenfolge** umgestellt auf Zwerchfell → Pleura → Herz/Mediastinum → Lunge → Skelett, zentral über die `ORDER`-Liste steuerbar. Gilt für Eingabe-UI und Befundtext gleichermaßen.
- **Untersuchungstyp-LOINC als überschreibbarer Default statt Konstante.** Der `DiagnosticReport.code` (Studienidentität) gehört architektonisch in die Auftrags-/Akquisitionsschicht (RIS/Gerät) und wird in der Plattformintegration von dort gesetzt. Das Template hält `36643-5` nur als Standalone-Fallback und bietet einen manuellen Override (verifizierte XR-Thorax-Codes: 36643-5 / 42272-5 / 24647-0 / 24648-8). Bewusst der einzige order-layer-Wert im Template — soll nicht um weitere Auftragsfelder (Accession, Patient, Projektion) wachsen.

### Behoben
- **LOINC-Code des DiagnosticReport korrigiert:** `24627-2` war fälschlich „CT Chest" (CT Thorax) — falsch für eine konventionelle Röntgenaufnahme; das `display` lautete bereits korrekt „2 views". Ersetzt durch `36643-5` „XR Chest 2 Views" (offizieller LOINC Long Common Name). Projektionsneutral (p.a.+seitlich), kompatibel mit dem geplanten Projektions-Schalter. Angepasst in FHIR-Code, Legende, README, frontmatter und RADLEX-MAPPING.

### Hinweis
- Rippen- und Sternumfraktur waren bereits seit v1.x vorhanden; neu ist ausschließlich die Wirbelkörper-/Sinterungsfraktur.

---

## [2.0] – 2026-06-20

### Geändert (Breaking – Architekturwechsel)
- **Additives Attestierungsmodell statt Default-Normal.** Die fünf Domänen (Lunge, Pleura, Herz/Mediastinum, Zwerchfell, Skelett/Weichteile) sind jetzt Tri-State-Regionen: — (unbeurteilt) · o. B. (attestiert) · Befund. Angleichung an das Muster von `CT/schaedel-nativ`.
- **Stille `|| "unauffällig"`-Defaults entfernt.** Eine nicht angefasste Region erzeugt keinen Satz mehr und keine positive Normalaussage. Ein normaler Befund entsteht nur noch durch bewusste Attestierung.
- **Verification Floor im FHIR-Export sichtbar:** jede Observation trägt `interpretation` NEG (attestierter Negativbefund) bzw. POS (Befund); o. B.-Regionen werden als ärztlich attestierte Negativbefunde kodiert statt weggelassen.
- Bundle-Meta-Tag auf `http://hjk.wien/fhir/CodeSystem/radiology-templates` vereinheitlicht.

### Neu
- **1-Klick-Normalbefund-Makro** („✓ Normalbefund attestieren") – setzt alle offenen Regionen in einem bewussten Akt auf o. B.; bereits gesetzte Befunde bleiben unangetastet.
- **Voice-ready:** `data-voice`-Sprechform auf allen Feldern und Region-Status (28 Tokens; v1.3 hatte 0).
- **Voice-Hints (HUD):** zuschaltbare Chips, die die Sprechbefehle pro Feld einblenden – ohne vom Bild wegschauen zu müssen.
- Kritischer-Befund-Logik: Pneumothorax, ossäre Destruktion und Device-Fehllage „dringlich" lösen Notfall-Akzent + Status-Badge aus.
- Devices und Vergleich als opt-in-Blöcke außerhalb der Normalbefund-Attestierung (kein „Kein Fremdmaterial"-Rauschen am ambulanten Bild).

### Erhalten
- 17 Parenchym-Optionen (Fleischner), 24-Device-Katalog, alle RID-Codes, LOINC 24627-2, Multi-Stacks, Auto-/Freitext-Beurteilung.

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
