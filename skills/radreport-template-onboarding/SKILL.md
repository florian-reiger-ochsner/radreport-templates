---
name: radreport-template-onboarding
description: >
  Konvertiert ein bestehendes Radiologie-Befundvorlage-HTML in das HJK
  radreport-templates Repo-Format (A-Struktur) und committed es über den
  lokalen Cowork-Git-Workflow. Verwende diesen Skill immer wenn der Nutzer ein
  neues Template ins Repo laden, anpassen oder "die gleiche Behandlung zukommen
  lassen" möchte – auch wenn nur eine HTML-Datei hochgeladen wird oder der
  Nutzer sagt "bring das ins Repo", "mach das repo-konform" oder ähnliches.
  Der Skill deckt: Zerlegung in kanonisches (nacktes) template.html + abgeleitete
  Demo, Klassen-Hooks, volle Kodierung, FHIR-URI, Defaults-Check,
  JS-Syntax-Validierung, Metadaten-Paket und lokalen Git-Commit.
---

# radreport-template-onboarding

Konvertiert beliebige Template-HTML in das `radreport-templates` Repo-Format
(**A-Struktur**) und committed alle Dateien über den **lokalen Git-Workflow**
im ausgecheckten Cowork-Repo.

> Vor jedem Lauf `CLAUDE.md` im Repo-Root lesen — sie ist verbindlich und
> präzisiert die hier zusammengefassten Konventionen.

---

## Kontext: A-Struktur (kanonisch nackt, Demo abgeleitet)

Zwei Gesichter je Template:

- **KANONISCH = `template.html`** — nacktes deklaratives MRRT, **Quelle der
  Wahrheit**, das Plattform-/Import-Gesicht:
  - `.rr-*`-Klassen bleiben als **Struktur-Hooks** (Klassen sind Struktur, kein
    Styling).
  - **Kein** `<link rel="stylesheet">`, **kein** `<style>`, **kein** `<script>`.
  - Volle Kodierung: `data-radlex` (RID) **und** `data-en` auf jeder `<option>`,
    LOINC auf Messwerten. MRRT-Metadaten (`rrt:*`, `dcterms.*`) im `<head>`.
- **ABGELEITET = `demo/<demo-id>/index.html`** — sekundäres Schaufenster-/
  Zitier-Gesicht:
  - = kanonisches File **plus** Core-Link im `<head>` (plus optional Demo-JS).
  - Wird via `build-demo.js` erzeugt, **nie** von Hand.
  - Self-contained lauffähig, GitHub-Pages-tauglich.

**Entfällt:** `template.source.html` und der Inline-CSS-Build (`inline-css.js`).
Das kanonische `template.html` IST die Quelle; die Demo ist die Ableitung.

### CSS-Architektur (nur Demo trägt CSS)
- **Single Source of Truth:** `shared/styles/radreport-core.css`
- **Token-Präfix:** `--rr-*`  ·  **Klassen-Präfix:** `.rr-*`
- **Template-spezifisches CSS** (nur in der Demo): Präfix `rr-<templatename>-*`
- Der Core-Link (`../../shared/styles/radreport-core.css`) lebt ausschließlich
  in `demo/<demo-id>/index.html`.

### FHIR-URI
```
http://hjk.wien/fhir/CodeSystem/radiology-templates
```
Ersetzt überall: `http://radlex.org/fhir`

### Keine klinischen Voreinstellungen
- Kein `selected`-Attribut auf klinischen Feldern (KL-Grade, Diagnosen, Scores).
- Erlaubt: Protokoll-Projektionen (`proj_*`), Technik-Felder.
- Checkboxen statt Select, wenn mehrere Befunde gleichzeitig möglich sind.

### Institutsausschluss
Kein MR/CT Institut Dr. Karner im Repo. CT-Gerät-Standard: Siemens Somatom Force.

### Repo-Pfad-Schema
```
templates/{Modalität}/{template-id}/   z.B. templates/CT/schaedel-nativ/
demo/{demo-id}/                         z.B. demo/ct-schaedel-nativ/
```

---

## Schritt 0 – Repo bereitstellen (lokaler Git-Workflow)

Cowork arbeitet direkt im ausgecheckten Repo `radreport-templates`.

```bash
cd <repo>
git pull          # Session-Start
```

Kein PAT, kein REST-API-Upload. Alle Datei-Operationen laufen im lokalen
Arbeitsbaum; committet wird mit `git`.

---

## Schritt 1 – Konformitäts-Check

Vor der Konvertierung prüfen (Ausgangs-HTML):

```python
checks = {
    'rr-*-Klassen vorhanden/mappbar': 'app' in src or 'input-pane' in src,
    'FHIR hjk.wien':                  'hjk.wien' in src,   # sonst ersetzen
    'Keine Defaults':                 'keine selected-Attribute auf klinischen Feldern',
    'Kein Karner':                    'Karner' not in src,
}
```

JS-Syntax (falls Ausgangsdatei Skript enthält, das in die Demo wandert):
```bash
node --check /tmp/check.js
```

---

## Schritt 2 – Zerlegen: kanonisch (nackt) vs. Demo (gestylt)

Aus dem Ausgangs-HTML zwei Fassungen ableiten:

**Kanonisch `template.html`** (Quelle der Wahrheit):
- Alle `<style>`-Blöcke, Stylesheet-`<link>`s und `<script>`-Blöcke **entfernen**.
- Struktur + `.rr-*`-Hooks + Formularfelder + Kodierung + MRRT-Metadaten
  **behalten**.
- Ergebnis muss den Lean-Check von `build-demo.js` bestehen (kein
  `<link rel=stylesheet>`, kein `<style>`, kein `<script>`).

**Demo** wird nicht von Hand geschrieben, sondern in Schritt 4 abgeleitet.
Falls das Ausgangs-HTML Vorschau-/Interaktivitäts-JS mitbringt, dieses in eine
separate `demo/<demo-id>/demo.js` auslagern (optional) und beim Build einbinden.

---

## Schritt 3 – Klassen-Hooks + Kodierung sicherstellen

Rohe Klassen auf die `rr-*`-Hooks mappen (Struktur, kein Styling):

```python
CLASS_MAP = [
    (r'\bclass="app"',          'class="rr-app"'),
    (r'\bclass="input-pane"',   'class="rr-input-pane"'),
    (r'\bclass="preview-pane"', 'class="rr-preview-pane"'),
    (r'\bclass="doc-title"',    'class="rr-doc-title"'),
    (r'\bclass="doc-meta"',     'class="rr-doc-sub"'),
    (r'\bclass="title-rule"',   'class="rr-title-rule"'),
    (r'\bclass="hint"(?!-)',    'class="rr-helper-info"'),
    (r'\bclass="btn-row"',      'class="rr-actions"'),
    (r'\bclass="btn-p"',        'class="rr-btn"'),
    (r'\bclass="btn-s"',        'class="rr-btn-secondary"'),
    (r'\bclass="rl"',           'class="rr-rl-badge"'),
    (r'\bclass="ebox"',         'class="rr-export-area"'),
    (r'\bclass="prev-lbl"',     'class="rr-preview-title"'),
]
```

RadLex-Disziplin (ausnahmslos, gilt kanonisch und in der Demo): jede `<option>`
trägt `data-radlex` (RID) **und** `data-en`. FHIR-System `http://radlex.org`,
CodeSystem-URI `http://hjk.wien/fhir/CodeSystem/radiology-templates`. LOINC nur
auf Messwerten/Report-Typ.

Token-Mapping betrifft nur CSS und damit **nur die Demo/Core** — im kanonischen
Template gibt es kein CSS. Falls Demo-spezifisches CSS aus alten `var(--x)`-Namen
stammt, auf `--rr-*` umstellen (`var(--bg)`→`var(--rr-bg)`, `var(--accent)`→
`var(--rr-accent)`, `var(--ink)`→`var(--rr-ink)`, usw.).

---

## Schritt 4 – Demo ableiten (build-demo.js)

Die Demo NICHT von Hand bauen. Aus dem kanonischen `template.html` ableiten:

```bash
node shared/scripts/build-demo.js \
  templates/{Modalität}/{template-id}/template.html \
  demo/{demo-id}/index.html
# optional mit Demo-Skript:
node shared/scripts/build-demo.js \
  templates/{Modalität}/{template-id}/template.html \
  demo/{demo-id}/index.html \
  demo.js
```

`build-demo.js` injiziert Font-Links + Core-Stylesheet-Link in den `<head>` und
markiert die Datei als abgeleitet. Es bricht ab, wenn das kanonische Template
nicht lean ist — das ist der Guard gegen versehentliches CSS/JS im kanonischen
File.

---

## Schritt 5 – Metadaten-Paket

Jedes Template braucht dieses Paket:

```
templates/{Modalität}/{template-id}/
├── template.html          # KANONISCH – nackt, rr-Hooks, kodiert, kein CSS/JS
├── frontmatter.yaml       # Schema siehe unten
├── README.md              # Zweck, Domänen, Quellen, Versionshistorie
├── CHANGELOG.md           # Semantic Versioning
└── RADLEX-MAPPING.md      # RID-Tabelle (✅/🟡/🔲)

demo/{demo-id}/
└── index.html             # ABGELEITET via build-demo.js (Core-Link)
```

### frontmatter.yaml Schema

```yaml
id: HJK-MRRT-{MODALITÄT}-{REGION}-{VARIANTE}
version: 1.0
status: pilot
modalitaet: CT | Roentgen | MRT
region: Freitext
indikation: Kurzbeschreibung
sprache: de
autoren:
  - florian-reiger-ochsner
reviewer: []
geprueft: YYYY-MM-DD
naechste-pruefung: YYYY-MM-DD
loinc-codes:
  - code: "XXXXX-X"
    description: Beschreibung
output:
  - fliesstext
  - fhir-bundle
radlex-coverage: vollstaendig | teilweise
```

### RADLEX-MAPPING.md Status-Legende

- ✅ Verifiziert – offizieller RadLex-Term, RID geprüft
- 🟡 Lokal/plausibel – plausibler Code, noch nicht formal geprüft
- 🔲 Ausstehend – Placeholder

---

## Schritt 6 – Commit (lokaler Git-Workflow)

Kein API-Upload. Im ausgecheckten Repo committen:

```bash
node --check shared/scripts/build-demo.js         # falls Skript berührt
# Lean-Check läuft implizit über build-demo.js (bricht bei CSS/JS im Kanon ab)

git add templates/{Modalität}/{template-id}/ demo/{demo-id}/
git commit -m "feat({template-id}): kanonisches template.html v{version} + abgeleitete Demo"
git push
```

### Commit-Message-Konvention

```
feat({template-id}): kanonisches template.html v{version} – rr-Hooks, kodiert
build(demo/{demo-id}): Demo v{version} aus template.html abgeleitet
docs({template-id}): README.md / CHANGELOG.md / RADLEX-MAPPING.md
fix({template-id}): <kurze Beschreibung des Fixes>
```

---

## Schritt 7 – README.md im Repo aktualisieren

Nach jedem neuen Template:
1. Neue Zeile in Template-Übersichts-Tabelle (inkl. Live-Demo-Link).
2. Neuer Eintrag in Repo-Struktur-Codeblock.
3. Ggf. Eintrag in Phase-Checklist.

---

## Häufige Fehler und Fixes

### Kanonisches Template ist nicht lean
`build-demo.js` bricht mit „nicht lean" ab. Ursache: `<style>`, Stylesheet-`<link>`
oder `<script>` blieben im kanonischen `template.html`. → CSS/JS entfernen; Styling
gehört in Core/Demo, Interaktivität in optionales `demo.js`.

### JS-Syntax: Doppelter Fallback (nur Demo-JS)
`build_js_getter` kann `|| 'X', 'Y')` erzeugen statt `|| 'Y')`.
Fix: `re.sub(r"(\.filter\(Boolean\)\.join\(', '\) \|\| )'[^']*', '([^']*)'", r"\1'\2'", src)`

### typEl nach Select→Checkbox-Migration
Wenn ein Select durch Checkboxen ersetzt wird, alle `typEl?.value`-Referenzen im
(Demo-)JS durch Checkbox-IDs ersetzen.

### gv() auf umgebaute Checkboxen
Nach Select→Checkbox: `gv('feldname')` durch Checkbox-Array-Getter ersetzen:
```js
const val = ['cb_id1','cb_id2','cb_id3']
  .filter(id => document.getElementById(id)?.checked)
  .map(id => document.getElementById(id)?.nextElementSibling?.textContent?.trim())
  .filter(Boolean).join(', ') || 'unauffällig';
```

---

## Sicherheit

- Lokaler Git-Workflow: keine PATs, keine Tokens im Repo.
- Token/Secrets niemals im Klartext, nirgends in committeten Dateien.
