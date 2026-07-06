# Radreport – Shared Stylesheet

**Datei:** `radreport-core.css`
**Version:** 1.0.0
**Stand:** 2026-07-06
**Maintainer:** Florian Reiger-Ochsner (HJK)

---

## Worum es geht

Single Source of Truth für die visuellen Eigenschaften aller Befundvorlagen.
Klassen (`.rr-*`) und Design-Tokens (`--rr-*`) liegen zentral hier, statt in
jedem Template dupliziert zu werden. Der Core-Link lebt **ausschließlich in der
abgeleiteten Demo** — das kanonische `template.html` bleibt stylefrei.

## Architektur (A-Struktur)

Zwei Gesichter je Template, klar getrennt (siehe `CLAUDE.md §1`):

| Datei | CSS-Einbindung |
|---|---|
| **Kanonisch** `template.html` (Quelle der Wahrheit) | **keine** — kein `<link>`, kein `<style>`, kein `<script>`. Die `.rr-*`-Klassen bleiben nur als Struktur-Hooks. |
| **Abgeleitet** `demo/<id>/index.html` (Schaufenster) | externer `<link>` auf `radreport-core.css`, von `build-demo.js` in den `<head>` injiziert. |

Das CSS wird also **nicht** mehr ins Template inline gebaut. Es wird
ausschließlich in der Demo referenziert.

### Repo-Struktur

```
radreport-templates/
├── shared/
│   ├── styles/
│   │   ├── radreport-core.css     ← Single Source of Truth
│   │   └── README.md              ← dieses File
│   └── scripts/
│       └── build-demo.js          ← Build: kanonisch → Demo (injiziert Core-Link)
├── templates/
│   └── Roentgen/MSK/knie-praetep/
│       └── template.html          ← KANONISCH, nackt, ohne CSS/JS
└── demo/
    └── knie-prae-tep/
        └── index.html             ← ABGELEITET, mit Core-Link im <head>
```

> **Abgekündigt (B-Struktur):** `template.source.html` als separate Quelle und
> `shared/scripts/inline-css.js` (Inline-CSS-Build) gehören zur abgelösten
> B-Struktur. Das Skript liegt noch im Repo, wird aber nicht mehr verwendet.
> Bestehende Templates werden je beim nächsten Anfassen auf A umgestellt.

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

In den Template-Demos setzt `build-demo.js` diesen Core-Link automatisch. Für
handgepflegte Demos/Leitfäden die Pfad-Tiefe nach Bedarf anpassen (`../../` von
`demo/<id>/`).

### B) In Templates – gar kein CSS

Das kanonische `template.html` trägt **kein** Stylesheet. `build-demo.js` bricht
ab, wenn doch ein `<link>`/`<style>`/`<script>` enthalten ist — dieser Guard ist
die Lean-Prüfung des kanonischen Templates.

### Build-Workflow

Inhalt immer im kanonischen `template.html` ändern, danach die Demo neu ableiten
und beide committen:

```bash
# Nach Änderung am kanonischen template.html ODER an radreport-core.css:
node shared/scripts/build-demo.js \
  templates/Roentgen/MSK/knie-praetep/template.html \
  demo/knie-prae-tep/index.html
git add templates/Roentgen/MSK/knie-praetep/template.html demo/knie-prae-tep/index.html
git commit -m "chore(ktep): Demo nach Stylesheet-Update neu abgeleitet"
```

Optional mit eigenem Demo-Skript für Vorschau/Interaktivität:

```bash
node shared/scripts/build-demo.js \
  templates/Roentgen/MSK/knie-praetep/template.html \
  demo/knie-prae-tep/index.html \
  demo.js
```

## Naming-Conventions

Alle Klassen und CSS-Variablen tragen das `rr-` Prefix. Verhindert Kollisionen
mit plattform-internem CSS (z. B. Carbon/Sectra) bei späterer Integration.

| Pattern | Zweck |
|---|---|
| `:root { --rr-* }` | Design-Tokens (Farben, Spacing, Fonts) |
| `.rr-*` | Komponenten-Klassen (`.rr-app`, `.rr-input-pane`, `.rr-result-box`) |
| `.rr-is-*` | Status-Modifier (`.rr-is-active`, `.rr-is-required-empty`) |
| `.rr-u-*` | Utility-Klassen, sparsam einzusetzen (`.rr-u-mt-lg`) |
| `.rr-<templatename>-*` | Template-spezifisches CSS (nur in der Demo) |

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

Da `build-demo.js` ein explizites Paar `template.html → demo/<id>/index.html`
erwartet, iteriert eine Automatisierung über die Template→Demo-Zuordnung. Beispiel
(`.github/workflows/build-demos.yml`), Zuordnung als Mapping gepflegt:

```yaml
name: Build Demos
on:
  push:
    paths:
      - 'templates/**/template.html'
      - 'shared/styles/radreport-core.css'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - name: Demos ableiten
        run: |
          # je Template ein explizites Paar (kanonisch → Demo-ID)
          node shared/scripts/build-demo.js templates/Roentgen/MSK/knie-praetep/template.html demo/knie-prae-tep/index.html
          # … weitere Templates analog
      - name: Committen
        run: |
          git config user.name "github-actions"
          git config user.email "actions@github.com"
          git add demo/**/index.html
          git diff --staged --quiet || git commit -m "build: Demos neu abgeleitet"
          git push
```

Empfehlung: erst manuell ableiten, später automatisieren wenn der Workflow stabil läuft.

## Versionierung des Stylesheets

Bei Änderungen an `radreport-core.css`:
- Token-Änderung (Farbe, Spacing) → Patch (1.0.0 → 1.0.1), alle Demos neu ableiten
- Neue Komponente hinzugefügt → Minor (1.0.0 → 1.1.0), Demos bei nächster Gelegenheit neu ableiten
- Breaking Change (Klassen-Rename) → Major (1.0.0 → 2.0.0), alle Demos müssen neu abgeleitet werden

Version steht im Datei-Header. Bei Major-Bumps: Migrations-Tabelle in CHANGELOG dokumentieren.
