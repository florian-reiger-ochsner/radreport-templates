# Radreport – Shared Stylesheet

**Datei:** `radreport-core.css`
**Version:** 1.0.0
**Stand:** 2026-05-23
**Maintainer:** Florian Reiger-Ochsner (HJK)

---

## Worum es geht

Single Source of Truth für visuelle Eigenschaften aller Befundvorlagen. Statt CSS in jedem Template inline zu duplizieren, liegt es zentral hier und wird je nach Kontext entweder per `<link>` referenziert oder per Build inline injiziert.

## Architektur

Hybrid-Ansatz wegen IHE MRRT-Constraint:

| Datei-Typ | CSS-Einbindung |
|---|---|
| MRRT-Template (Import in Carbon) | inline `<style>` via Build |
| GitHub Pages Demo, Messleitfäden, Doku | externes `<link>` |

### Repo-Struktur

```
radreport-templates/
├── shared/
│   ├── styles/
│   │   ├── radreport-core.css     ← Single Source of Truth
│   │   └── README.md            ← dieses File
│   └── scripts/
│       └── inline-css.js        ← Build-Skript
├── templates/
│   └── Roentgen/MSK/knie-praetep/
│       ├── template.source.html ← Quelle mit <link>
│       └── template.html        ← Build-Output mit inline CSS
└── demo/
    └── knie-prae-tep/
        └── index.html           ← nutzt externes CSS direkt
```

## Verwendung

### A) In Demos, Messleitfäden, GitHub Pages – externes CSS

```html
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&family=Source+Serif+4:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../shared/styles/radreport-core.css">
</head>
```

Pfad-Tiefe nach Bedarf anpassen (`../../` von `demo/knie-prae-tep/`, `../../../../` von `templates/Roentgen/MSK/knie-praetep/`).

### B) In MRRT-Templates – inline CSS via Build

1. Quelldatei heißt `template.source.html` und enthält den `<link>` auf `radreport-core.css`
2. Build:
   ```bash
   node shared/scripts/inline-css.js templates/Roentgen/MSK/knie-praetep/template.source.html
   ```
3. Erzeugt: `template.html` mit injiziertem `<style>`-Block

### Build-Workflow

Quelle → Build → Commit, beide Dateien committen:

```bash
# Nach Änderungen an template.source.html ODER radreport-core.css:
node shared/scripts/inline-css.js templates/Roentgen/MSK/knie-praetep/template.source.html
git add templates/Roentgen/MSK/knie-praetep/template.source.html
git add templates/Roentgen/MSK/knie-praetep/template.html
git commit -m "chore(ktep): rebuild MRRT after stylesheet update"
```

Optional automatisierbar per GitHub Action (siehe weiter unten).

## Naming-Conventions

Alle Klassen und CSS-Variablen tragen das `rr-` Prefix. Verhindert Kollisionen mit Carbon-internem CSS bei späterer Integration.

| Pattern | Zweck |
|---|---|
| `:root { --rr-* }` | Design-Tokens (Farben, Spacing, Fonts) |
| `.rr-*` | Komponenten-Klassen (`.rr-app`, `.rr-input-pane`, `.rr-result-box`) |
| `.rr-is-*` | Status-Modifier (`.rr-is-active`, `.rr-is-required-empty`) |
| `.rr-u-*` | Utility-Klassen, sparsam einzusetzen (`.rr-u-mt-lg`) |

## Generische Komponenten

Bewusst über das KTEP-Template hinaus gedacht – nutzbar für künftige Templates:

| Klasse | Anwendung |
|---|---|
| `.rr-result-box` | CPAK · LI-RADS-Kategorie · RECIST-Response · RAMRIS-Score |
| `.rr-grade-summary` | KL (3 Spalten) · Lung-RADS (4 Lappen) · RAMRIS (6 Knochen) · BI-RADS (2 Quadranten) – automatisch via `auto-fit` |
| `.rr-side-toggle` | re./li., apikal/basal, Quadranten, jede paarweise Auswahl |
| `.rr-mode-switch` | Manuell/KI/Hybrid bei allen KI-integrierten Templates |
| `.rr-rl-badge` | RadLex- bzw. LOINC-Code-Marker in Sektions-Headern |
| `.rr-req-indicator` | Pflichtfeld-Marker bei kritischen diagnostischen Klassifikationen |

## Design-Tokens (Auszug)

```css
--rr-accent:       #2c5f8d;   /* HJK Clinical Light Theme primary */
--rr-bg-alt:       #f7f8fa;   /* Preview-Pane Hintergrund */
--rr-font-sans:    "Source Sans 3", system-ui;
--rr-font-serif:   "Source Serif 4", Georgia;
--rr-radius:       6px;
--rr-space-md:     1rem;
```

Vollständige Liste siehe Sektion 1 in `radreport-core.css`.

## Optional: Automatisierter Build per GitHub Action

`.github/workflows/build-templates.yml`:

```yaml
name: Build MRRT Templates
on:
  push:
    paths:
      - 'templates/**/*.source.html'
      - 'shared/styles/radreport-core.css'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - name: Build all templates
        run: |
          find templates -name "*.source.html" -exec node shared/scripts/inline-css.js {} \;
      - name: Commit built templates
        run: |
          git config user.name "github-actions"
          git config user.email "actions@github.com"
          git add templates/**/*.html
          git diff --staged --quiet || git commit -m "build: regenerate MRRT templates"
          git push
```

Empfehlung: erst manuell builden, später automatisieren wenn der Workflow stabil läuft.

## Versionierung des Stylesheets

Bei Änderungen an `radreport-core.css`:
- Token-Änderung (Farbe, Spacing) → Patch (1.0.0 → 1.0.1), alle Templates rebuilden
- Neue Komponente hinzugefügt → Minor (1.0.0 → 1.1.0), Templates können bei nächster Gelegenheit aktualisieren
- Breaking Change (Klassen-Rename) → Major (1.0.0 → 2.0.0), alle Templates müssen migriert werden

Version steht im Datei-Header. Bei Major-Bumps: Migrations-Tabelle in CHANGELOG dokumentieren.
