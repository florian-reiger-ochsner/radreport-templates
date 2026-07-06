# Changelog: LTx-Evaluation HCC

Semantic Versioning (MAJOR.MINOR.PATCH).

## v1.0 – 2026-07-06

### Neu: eigenständiges Paket (Abspaltung aus LI-RADS)

Erstausgabe als eigenständiges A-Struktur-Template. Abgespalten aus
`HJK-MRRT-CT-LEBER-LIRADS`, wo die LTx-Evaluation vormals der vierte Modus war.

**Begründung der Abspaltung:**

- Bei der A-Migration des LI-RADS-Templates lässt sich der Modus-Switch im
  nackten kanonischen Formular nicht abbilden.
- Die LTx-Evaluation ist ein **eigenes Feldset** (§16-TPG/Mailand statt
  LI-RADS-Merkmale APHE/Washout/Threshold-Growth) und kollabiert nicht in das
  LI-RADS-Formular.
- Sie traced ohnehin auf eine separate DRG-Quelle (`gen_ltx_hcc.html`).

### Enthalten

- Anmeldung/Kontext: Eurotransplant-Nummer, Untersuchungsdatum, Modalität,
  Meldungstyp (Initiales HCC / Verlaufsbericht).
- Diagnosesicherung: HCC gesichert, Leberzirrhose histologisch, Zweitverfahren.
- Tumorlast: Anzahl HCC-Knoten, Durchmesser Knoten 1–3
  (`RID13432` / LOINC `21889-1`), extrahepatische Manifestation, makrovaskuläre
  Invasion.
- Voruntersuchungs-Vergleich (optional) inkl. Verlaufstrend
  (`RID39157`/`RID36043`/`RID36044`).
- Freitext-Ergänzung.

### A-Struktur-Konformität

- `template.html` ist lean: kein `<link rel="stylesheet">`, kein `<style>`,
  kein `<script>`.
- Mailand-Kriterien-Box, Kriterien-Grid, Compliance-Verdikt, Vorschau und
  Export-Buttons werden zur Laufzeit von `demo.js` erzeugt.
- Andock-Anker im Formular: `row_anmeldung`, `row_tumorlast`, `mailand_anchor`.

### Kodierung

- Knoten-Durchmesser verifiziert kodiert (`RID13432`, LOINC `21889-1`).
- §16-TPG-spezifische Felder bewusst `local`/`needs-mapping` – kein geratenes
  RID (CLAUDE.md §2). Details in `RADLEX-MAPPING.md`.
- RID29896 aus dem LI-RADS-Quelltemplate für „extrahepatische Manifestation"
  **nicht** übernommen (dort widersprüchlich zugleich für „Mosaikmuster"
  vergeben); als `local` geführt.
