# Changelog – Röntgen Knie präoperativ vor TEP

## [1.6] – 2026-07-21
### Korrigiert (RadLex-Kodierung – Registry-verifiziert gegen NCBO BioPortal)
- **Neun falsch geratene RID-Codes ersetzt.** Registry-Abgleich (`validate-codes.js
  --resolve`) deckte auf, dass die bisherigen RIDs auf fremde Konzepte zeigten:
  a.p. RID10395 (*marking for intervention*) → **RID28784** (anteroposterior projection);
  seitlich RID10412 (*thrombectomy*) → **RID10523** (lateral projection);
  Osteophyt RID4757 (*dextroscoliosis*) → **RID5076** (osteophyte);
  Gelenkserguss RID34769 (*viral pneumonia*) → **RID4872** (effusion);
  osteoporotisch RID3406 (*dacryoadenitis*) → **RID5389** (osteoporosis);
  Verlauf stabil RID39157 → **RID39268** (unchanged), progredient RID36043 → **RID29041**
  (disease progression), regredient RID36044 → **RID39105** (improved).
- **KL-Grad 0** RID5352 (*pneumothorax*) entfernt → `local` (KL-Score sitzt am Feld via
  LOINC LP410785-8; KL-Grade sind kein eigenständiges RadLex-Konzept).
- **Bisher `local`, jetzt registry-verifiziert (✅):** Freikörper **RID5367**
  (intraarticular osseous body), Baker-Zyste **RID3892**, Chondrokalzinose **RID5398**,
  osteopen **RID5388** (osteopenia).
- `RADLEX-MAPPING.md` synchronisiert: geratene RID495xx/RID517x-Platzhalter (teils
  *Milzinfarkt*-Codes) entfernt, ✅ nur noch mit BioPortal-Beleg. Subchondrale Zyste/
  Sklerose, Weichteilverkalkung, Messwinkel und CPAK bleiben bewusst `local`.
- `data-en` an mehreren Feldern an den echten RadLex-Term angeglichen (effusion,
  intraarticular osseous body, osteopenia, unchanged, disease progression, improved).
- Feld-`id`s unverändert → Provenance/Vorbefund-Carryover stabil.

## [1.5] – 2026-07-01
### Geändert (Architektur, keine klinische Inhaltsänderung)
- Migration auf **A-Struktur**: `template.html` ist jetzt kanonisch und **nackt** –
  deklaratives MRRT mit `rr-*`-Struktur-Hooks, **ohne** Stylesheet-/Font-Link,
  `<style>` oder `<script>`. Plattform-/Import-Gesicht und Quelle der Wahrheit.
- **Kanonisch = nur das kodierte Eingabeformular.** Viewer-Chrome aus dem Template
  entfernt (Modus-Schalter, Helfertext, CPAK-Ergebnisbox, KL-Summary-Grid,
  Vorschau-Pane, Export-Buttons, Pflichtfeld-Marker) — ohne JS war das tote UI.
- Sämtliches Chrome + Interaktivität (Modus-Umschaltung, CPAK, Live-Vorschau,
  Validierung, JSON/FHIR-Export) in `demo/knie-prae-tep/demo.js`; das Chrome wird
  dort zur Laufzeit an `id`-Anker (`row_achsen`, `row_kl`, `side_toggle`) injiziert,
  Buttons per `addEventListener` verdrahtet (kein Inline-`onclick`).
- `demo/knie-prae-tep/index.html` wird aus `template.html` via
  `shared/scripts/build-demo.js` abgeleitet (Core-Link + Fonts + Demo-JS injiziert).
- `template.source.html` abgekündigt (entfällt; Inline-CSS-Build via
  `inline-css.js` gegenstandslos).
- RadLex/LOINC-Kodierung unverändert (byte-identisch zur Vorversion verifiziert).
- Demo im Headless-DOM getestet: Chrome baut fehlerfrei auf, CPAK/Vorschau/FHIR
  funktionieren.

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
