# CLAUDE.md — Arbeitskonventionen `radreport-templates`

Dieses Repo enthält standardbasierte strukturierte Radiologie-Befundvorlagen
(MRRT-HTML5, RadLex/LOINC-Kodierung, FHIR-R4-Export). Diese Datei ist der
verbindliche Kontext für jede Cowork-Session. Vor jeder Änderung lesen.

---

## 1. Architektur — A-Struktur: kanonisch ist nackt, Demo ist abgeleitet

Zwei Gesichter je Template, klar getrennt:

- **KANONISCH = `template.html` — das Plattform-/Import-Gesicht.**
  Nacktes, deklaratives MRRT. Das ist die **Quelle der Wahrheit**.
  - Behält die `.rr-*`-Klassen **als Struktur-Hooks** — Klassen sind Struktur,
    kein Styling. Feld-Container, Panes, Badges tragen ihre `rr-*`-Klasse, damit
    die Demo daran andocken kann.
  - Trägt **keinen** `<link>` auf ein Stylesheet, **kein** `<style>`, **kein**
    `<script>`. Kein CSS, keine Interaktivität im kanonischen File.
  - Enthält: deklaratives MRRT (`<select>`/`<input type=number>`/`<input
    type=text>`), **volle Kodierung** (`data-radlex` RID **und** `data-en`, LOINC
    auf Messwerten) sowie die MRRT-Metadaten (`rrt:*`, `dcterms.*`).
  - **Nur das kodierte Eingabeformular.** Viewer-Chrome gehört NICHT ins
    kanonische File — konkret: Live-Vorschau/Preview-Pane, Modus-/Workflow-
    Schalter, berechnete Anzeige-Boxen (CPAK, Score-Summaries), Export-/Aktions-
    Buttons und JS-getriebene Validierungs-Marker. Solche Elemente wären ohne
    Skript tote UI. Sie werden in der Demo von `demo.js` zur Laufzeit erzeugt.
    Für Andockpunkte dürfen im Formular deklarative `id`-Anker stehen
    (z. B. `row_achsen`, `row_kl`).

- **ABGELEITET = `demo/<demo-id>/index.html` — das Zitier-/Schaufenster-Gesicht.**
  Sekundär. **Nie** Quelle der Wahrheit.
  - = das kanonische File **plus** externem Core-Link im `<head>`
    (`<link rel="stylesheet" href="../../shared/styles/radreport-core.css">`),
    plus Demo-JS (`demo.js`) für Vorschau/Interaktivität. Das Demo-JS **baut das
    Viewer-Chrome zur Laufzeit** (Preview-Pane, Modus-Schalter, berechnete
    Boxen, Buttons, Validierung) und verdrahtet es — es steckt nicht im
    kanonischen Formular. Buttons werden per `addEventListener` verdrahtet, nicht
    per Inline-`onclick`.
  - Self-contained lauffähig, GitHub-Pages-tauglich.
  - **Pro Template** (nicht nur für Vorzeige-Templates).
  - Wird **gebaut**, nicht von Hand gepflegt: erzeugt aus dem kanonischen
    `template.html` via `shared/scripts/build-demo.js`. Direktes Editieren der
    Demo bricht die Ableitung.

- **SSOT für Styling:** `shared/styles/radreport-core.css`. Klassen `.rr-*`,
  Custom Properties `--rr-*`. Niemals eine zweite Stildefinition anlegen. Der
  Core-Link lebt **ausschließlich in der Demo** — das kanonische Template bleibt
  stylefrei.

> Konsequenz: Inhaltliche Änderung **immer** im kanonischen `template.html`,
> danach `build-demo.js` laufen lassen, um `demo/<demo-id>/index.html` neu zu
> erzeugen. Wer die Demo direkt ändert, bricht die SSOT-Ableitung.

> Hinweis Migration: `template.source.html` und `inline-css.js` gehören zur
> abgelösten B-Struktur (gebautes Inline-CSS-Artefakt). Sie sind abgekündigt.
> Bestehende Templates werden **nicht** in einem Rutsch migriert, sondern je
> Template beim nächsten Anfassen auf A umgestellt (nacktes `template.html` +
> abgeleitete Demo, `source.html` entfällt).

---

## 2. Kodierung — nicht verhandelbar (gilt für kanonisch UND Demo)

- **RadLex-Pflicht, ausnahmslos:** Jede `<option>` in Dropdowns/Selects bekommt
  `data-radlex` (RID-Code) **und** `data-en` (englischer RadLex-Term). Keine
  Ausnahmen, auch nicht bei Updates bestehender Templates. Die Kodierung sitzt im
  kanonischen `template.html`; die Demo erbt sie unverändert.
- **Quantitative Messfelder** (`<input type="number">`) tragen die Kodierung am
  **input-Element** selbst — Rechner und FHIR-Export dürfen sich nicht auf die
  lokale HTML-`id` verlassen. Regel, konsistent mit der select-Disziplin:
  `data-en` (englischer RadLex-Term) **immer**; `data-loinc="<LOINC-Part>"` wo
  ein Code belegt ist; sonst `data-radlex-status="local"`. **Kein RID raten** —
  ein local-Feld bleibt `local`, bis der Code registry-verbatim belegt ist.
- **FHIR-Export:** Alle Observations werden mit `system: 'http://radlex.org'`
  kodiert. LOINC nur dort, wo es der korrekte Code-Raum ist (z. B. Report-Typ,
  Messwerte).
- **FHIR CodeSystem-URI:** `http://hjk.wien/fhir/CodeSystem/radiology-templates`
- **Round-Trip-Fähigkeit erhalten:** diskrete Observations, stabile Feld-IDs,
  RID konsistent. Feld-IDs nicht ohne Grund umbenennen (bricht Provenance/
  Vorbefund-Carryover späterer Versionen).

---

## 3. Template-Paket — Pflichtbestandteile je Template

Jedes neue Template wird als komplettes Paket angelegt. Fünf Dateien im
Template-Ordner (`templates/<…>/<name>/`), die Demo separat unter `demo/`:

1. `template.html` — **kanonisch**, lean, `rr-*`-Hooks, JS-frei, ohne
   Stylesheet-Link/`<style>`, voll kodiert (RadLex RID + `data-en`, LOINC auf
   Messwerten), MRRT-Metadaten.
2. `frontmatter.yaml` — maschinenlesbare Metadaten.
3. `README.md` — Zweck, Domänen, Quellen, Versionshistorie.
4. `CHANGELOG.md` — Semantic Versioning.
5. `RADLEX-MAPPING.md` — Status je Konzept: ✅ verifiziert / 🟡 lokal-plausibel /
   🔲 ausstehend.
6. `demo/<demo-id>/index.html` — **abgeleitet** aus `template.html` via
   `build-demo.js`, Core-Link im `<head>`, self-contained, GitHub-Pages-tauglich,
   **sekundär**.

**Entfällt:** `template.source.html` als eigenes Konzept. Das kanonische
`template.html` **ist** die Quelle; die Demo ist die Ableitung. Es gibt keinen
separaten Inline-Build mehr.

Kein Template gilt als fertig, solange ein Bestandteil fehlt.

---

## 4. Inhaltliche Leitplanken

- **Öffentliche Basis zuerst:** Vor dem Neubau von Felddefinitionen prüfen, ob
  eine Vorlage in **DRG AK Befundung** (`DRGagit/ak_befundung`, CC BY 4.0) oder
  **RSNA RadReport** existiert. Der Wertbeitrag dieses Repos ist die
  Integrations-/Kodierungs-/Datenfluss-Schicht (RadLex/LOINC/FHIR), nicht das
  Wiedererfinden von Feldern.
- **Vendor-Neutralität:** Keine fixe Plattform benennen. Befundungsplattform/
  PACS generisch; Carbon/Siemens bzw. Sectra nur als austauschbare Konsumenten
  unter mehreren. Sectra bleibt lebende Alternative.
- **Keine institutsspezifischen Inhalte** (kein Karner-spezifischer Text).
- **CT-Gerätestandard:** Siemens Somatom Force.
- **Keine klinisch vorbefüllten Defaults** in ausgelieferten Templates.
- **Keine Strategie/Politik im Repo.** Namen erscheinen ausschließlich zur
  Autorenschaft/Attribution, nie in Sequenzierungs- oder Stakeholder-Kontext.

---

## 5. Qualitätssicherung — vor jedem Commit

- `node --check` auf jede geänderte `.js`-Datei (Build-Skripte). Das kanonische
  `template.html` selbst trägt **kein** Inline-JS mehr; Demo-JS (falls vorhanden)
  ebenfalls per `node --check` prüfen.
- **Lean-Check des kanonischen Templates:** `template.html` darf keinen
  `<link rel="stylesheet">`, kein `<style>` und kein `<script>` enthalten.
  `build-demo.js` bricht ab, wenn doch — dieser Guard ist die Existenzprüfung.
- **Hinweis:** Ein automatisierter Code-Lint (`tools/validate-codes.js`) ist
  derzeit **nicht** im Repo vorhanden — `tools/` existiert nicht. Die einzigen
  Skripte liegen unter `shared/scripts/`. Die Code-/Display-Prüfung erfolgt bis
  auf Weiteres manuell (siehe nächster Punkt). Sobald der Linter angelegt ist,
  diesen Hinweis ersetzen.
- **Display-Diff gegen `RADLEX-MAPPING.md`:** Existenzprüfung allein fängt den
  Fehlerfall „gültiger Code, falsches handgetipptes Label" nicht (vgl. der
  `24627-2`-Bug). Angezeigtes Label gegen Mapping abgleichen.
- **Demo neu abgeleitet**, wenn das kanonische `template.html` geändert wurde
  (`node shared/scripts/build-demo.js <template.html> <demo/index.html>`).

---

## 6. Git-Workflow

- Session-Start: `git pull`.
- Pro logischer Einheit committen, aussagekräftige Message
  (was + warum, nicht „update"). Beispiel:
  `"CT Schädel nativ v1.0: RadLex-Mapping ergänzt, LOINC korrigiert"`.
- Session-Ende: `git push`.
- **Lokaler Git-Workflow ist Default** (Cowork arbeitet direkt im ausgecheckten
  Repo). Der frühere REST-API-Upload-Weg entfällt.
- Direkt auf `main` ist in dieser kontrollierten Bauphase legitim; optional
  ein Feature-Branch pro neuem Template für sauberere History.
- Token/Secrets niemals im Klartext, nirgends in committeten Dateien.
