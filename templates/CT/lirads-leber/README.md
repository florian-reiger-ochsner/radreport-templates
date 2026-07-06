# CT Leber – LI-RADS v2018

**ID:** HJK-MRRT-CT-LEBER-LIRADS
**Version:** 1.3
**Struktur:** A (kanonisch nacktes `template.html` + abgeleitete Demo)
**Status:** Pilot, didaktisch nach Schima/Kopf/Eisenhuber RöFo 2023
**Lizenz:** Creative Commons Attribution 4.0 International (CC BY 4.0)

## Zweck

Strukturierte Befundvorlage für die mehrphasige KM-CT der Leber bei Patienten
mit erhöhtem HCC-Risiko nach **LI-RADS v2018** (American College of Radiology),
didaktisch aufbereitet nach dem 4-Schritte-Algorithmus von **Schima/Kopf/
Eisenhuber (Fortschr Röntgenstr 2023; 195: 486–494)**.

## A-Struktur

Das kanonische `template.html` ist **nacktes, kodiertes MRRT** – nur das
Eingabeformular, kein CSS/JS. Das gesamte Viewer-Chrome wird in der Demo von
`demo/ct-lirads-leber/demo.js` zur Laufzeit erzeugt:

- **Mode-Switch** (Manuell / Geführt / Direkt),
- **Läsions-Tabs** – der Läsionsblock ist im kanonischen File **einmal**
  deklariert (`data-lesion="1"`); `demo.js` multipliziert ihn auf bis zu drei
  Index-Observationen,
- **LR-Kategorie-Box + 4-Schritte-Berechnungsanzeige** je Läsion (Algorithmus
  `calculateLR` verbatim aus dem abgelösten Inline-Template portiert),
- **Live-Vorschau + Export**.

Inhaltliche Änderungen immer im kanonischen `template.html`, danach
`build-demo.js` laufen lassen.

## Modi

| Modus | Zielgruppe | Funktion |
|---|---|---|
| **Manuell** | Geübter Befunder | Alle Haupt-/Hilfskriterien direkt setzen, LR automatisch berechnet |
| **Geführt** | Einarbeitung, Lehrkontext | Schritt-für-Schritt nach Schima 2023, Schritte nacheinander eingeblendet |
| **Direkt** | Senior-Befunder | LR-Kategorie direkt zuweisen, Begründung im Freitext |

## Abspaltung der LTx-Evaluation (v1.3)

Der vormalige vierte Modus **„LTx-Evaluation"** (§16-TPG/Mailand) wurde in ein
eigenständiges Template ausgelagert: **`HJK-MRRT-LTX-HCC-EVAL`**
(`templates/CT/ltx-hcc-evaluation/`). Gründe: der Modus-Switch ist im nackten
A-Formular nicht abbildbar; die LTx-Evaluation ist ein eigenes Feldset
(§16-TPG/Mailand statt LI-RADS-Merkmale) und traced auf eine separate DRG-Quelle
(`gen_ltx_hcc.html`, Pinto dos Santos et al. 2017).

## Kodierung

Registry-korroboriert kodiert (`data-radlex`): Läsionsgröße (RID13432 / LOINC
21889-1), Segment (RID29237), Verlaufstrend. **Wichtig:** die LI-RADS-
spezifischen RIDs des Inline-Vorgängers waren in sich widersprüchlich belegt und
sind bis zur Registry-Verifikation als `data-radlex-status="local"` geführt.
Details, Kandidaten und die dokumentierten Widersprüche: `RADLEX-MAPPING.md`.

## Paket-Bestandteile

| Datei | Rolle |
|---|---|
| `template.html` | kanonisch, nackt, kodiert, JS-/CSS-frei |
| `frontmatter.yaml` | maschinenlesbare Metadaten |
| `README.md` | dieses Dokument |
| `CHANGELOG.md` | Semantic Versioning |
| `RADLEX-MAPPING.md` | Kodierungsstatus je Konzept |
| `demo/ct-lirads-leber/index.html` | abgeleitet via `build-demo.js` |
| `demo/ct-lirads-leber/demo.js` | Viewer-Chrome + LR-Algorithmus |

## Demo bauen

```
node shared/scripts/build-demo.js \
  templates/CT/lirads-leber/template.html \
  demo/ct-lirads-leber/index.html \
  demo.js
```

## Offene Punkte

- Registry-Verifikation der Kandidat-RIDs (`RADLEX-MAPPING.md`).
- Fachliches Review (geplant: Schima/Kopf/Eisenhuber).
- Geplant: MRT-Varianten (extrazellulär, hepatobiliär), derzeit nicht
  implementiert: CEUS-LI-RADS, Pediatric-LI-RADS.

## Versionshistorie

Siehe `CHANGELOG.md`.
