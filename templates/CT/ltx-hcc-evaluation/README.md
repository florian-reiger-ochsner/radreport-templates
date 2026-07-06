# LTx-Evaluation HCC – Mailand-Kriterien &amp; §16-TPG

Strukturierte MRRT-Befundvorlage für die bildgebende Evaluation von HCC-Patienten
zur Lebertransplantations-Anmeldung nach **§16-TPG-Richtlinie** (Bundesärztekammer)
und **Mailand-Kriterien**.

- **ID:** `HJK-MRRT-LTX-HCC-EVAL`
- **Version:** 1.0 (Status: pilot)
- **Lizenz:** CC BY 4.0

## Auf einen Blick

Zweigeteilte Struktur — kanonisch ist die Quelle, die Demo ist abgeleitet:

- 📄 **[`template.html`](./template.html)** — kanonisch, Quelle der Wahrheit (nacktes MRRT, voll kodiert). **Inhaltliche Änderungen hier.**
- 🖥 **[Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/ct-ltx-hcc-evaluation/)** — gerendertes Schaufenster (GitHub Pages), abgeleitet aus `template.html`. **Gebaut, nicht von Hand editieren.**
- 📁 [`demo/ct-ltx-hcc-evaluation/index.html`](../../../demo/ct-ltx-hcc-evaluation/index.html) — Quelltext der Demo im Repo.

## Zweck &amp; Abgrenzung

Das Template erfasst die für die Eurotransplant-Anmeldung erforderlichen Angaben:
Meldungstyp, Diagnosesicherung, Tumorlast (Knotenzahl und -durchmesser),
extrahepatische Manifestation und makrovaskuläre Invasion. Aus diesen Eingaben
wird die **Mailand-Konformität** und die §16-TPG-Compliance abgeleitet.

Die Ableitung selbst (Mailand-Kriterien-Box, Kriterien-Grid, Compliance-Verdikt)
ist **Viewer-Chrome** und lebt in `demo/ct-ltx-hcc-evaluation/demo.js` – nicht im
kanonischen Template. Das kanonische `template.html` trägt ausschließlich das
kodierte Eingabeformular (A-Struktur, siehe CLAUDE.md §1).

## Herkunft

Dieses Paket wurde als eigenständiges Template aus
`HJK-MRRT-CT-LEBER-LIRADS` **abgespalten** (dort vormals der vierte Modus
„LTx-Evaluation"). Grund: Bei der Umstellung des LI-RADS-Templates auf die
A-Struktur lässt sich ein Modus-Switch im nackten Formular nicht abbilden; die
LTx-Evaluation ist zudem ein **eigenes Feldset** (§16-TPG/Mailand statt
LI-RADS-Merkmale) und traced ohnehin auf eine separate DRG-Quelle.

## Quelle

Feldsatz und Mailand-Logik sind anschlussfähig an das offizielle DRG-Template:

> Pinto dos Santos D, Mildenberger P, Klos G. „LTx-Evaluation HCC"
> (`gen_ltx_hcc.html`, Identifier 041807.5), Deutsche Röntgengesellschaft 2017.
> CC BY 4.0.

## Mailand-Kriterien (Konsens 1996)

Solitärer Knoten ≤ 50 mm **oder** bis zu drei Knoten, alle ≤ 30 mm; keine
extrahepatische Manifestation; keine makrovaskuläre Invasion. Patienten
innerhalb der Mailand-Kriterien sind grundsätzlich für eine Lebertransplantation
qualifiziert (Standard-Exception nach §16 TPG). Mehr als drei Knoten liegen
außerhalb der Mailand-Kriterien.

## Kodierung

Quantitative Knoten-Durchmesser tragen `data-radlex="RID13432"` (lesion size)
und `data-loinc="21889-1"`. §16-TPG-spezifische Workflow-/Compliance-Felder sind
bewusst `local`/`needs-mapping` gehalten – es wird kein RID geraten (CLAUDE.md
§2). Status je Konzept: siehe `RADLEX-MAPPING.md`.

## Paket-Bestandteile

| Datei | Rolle |
|---|---|
| `template.html` | kanonisch, nackt, kodiert, JS-/CSS-frei |
| `frontmatter.yaml` | maschinenlesbare Metadaten |
| `README.md` | dieses Dokument |
| `CHANGELOG.md` | Semantic Versioning |
| `RADLEX-MAPPING.md` | Kodierungsstatus je Konzept |
| `demo/ct-ltx-hcc-evaluation/index.html` | abgeleitet via `build-demo.js` |
| `demo/ct-ltx-hcc-evaluation/demo.js` | Viewer-Chrome + Mailand-Berechnung |

## Demo bauen

```
node shared/scripts/build-demo.js \
  templates/CT/ltx-hcc-evaluation/template.html \
  demo/ct-ltx-hcc-evaluation/index.html \
  demo.js
```

## Offene Punkte

- RadLex-RIDs für extrahepatische Manifestation und makrovaskuläre Invasion
  registry-verbatim verifizieren (siehe `RADLEX-MAPPING.md`).
- Fachliches Review (geplant: D. Pinto dos Santos, DRG).

## Versionshistorie

Siehe `CHANGELOG.md`.
