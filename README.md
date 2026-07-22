# radreport-templates

**MRRT-konforme strukturierte Befundvorlagen für die deutschsprachige Radiologie**
HTML5 · RadLex · FHIR R4 · Vendor-neutral

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21075538.svg)](https://doi.org/10.5281/zenodo.21075538)
[![License: CC BY 4.0](https://img.shields.io/badge/Content-CC%20BY%204.0-blue.svg)](https://creativecommons.org/licenses/by/4.0/)
[![License: MIT](https://img.shields.io/badge/Code-MIT-green.svg)](https://opensource.org/licenses/MIT)

**Autor:** Florian Reiger-Ochsner, Facharzt für Radiologie, Stv. Vorstand Radiologie, Herz-Jesu-Krankenhaus Wien
**Stand:** Juli 2026

---

## Ziele

Strukturierte Befundvorlagen, in denen radiologische Befundung und KI-Auswertung in einem kodierten, FHIR-fähigen Datensatz zusammenlaufen. 

---

## Technologie

| Ebene | Standard |
|---|---|
| Template-Format | IHE MRRT (HTML5) |
| Terminologie | RadLex · LOINC · SNOMED CT · Fleischner 2017 · LI-RADS v2018 |
| KI-Tool-Input | DICOM SR |
| Export (Zielformat) | FHIR R4: DiagnosticReport + Observations (+ Provenance), plattformseitig |
| FHIR-URI | `http://hjk.wien/fhir/CodeSystem/radiology-templates` |
| CSS | `shared/styles/radreport-core.css` (Single Source of Truth) |

---

## Repositoriumsstruktur

```
.
├── shared/
│   ├── styles/
│   │   └── radreport-core.css      # Globale CSS-Tokens (--rr-*) und Klassen (.rr-*)
│   ├── scripts/
│   │   ├── build-demo.js           # Build: kanonisches template.html → demo/<id>/index.html (Core-Link)
│   │   ├── validate-codes.js       # Code-Treue-Lint: Display-Abgleich Template ⇄ Mapping (+ --resolve, --all)
│   │   ├── resolve-radlex.js       # RID-Auflösung gegen NCBO BioPortal → radlex-cache.json
│   │   ├── suggest-radlex.js       # RID-Vorschläge je data-en-Konzept (BioPortal-Suche, Top-5)
│   │   └── apply-decisions.js      # wendet RadLex-Entscheidungen aufs Template an
│   └── codesystems/
│       ├── radlex-cache.json       # BioPortal-Snapshot der verwendeten RIDs (Offline-Lint)
│       └── README.md               # Zwei-Schichten-Lint-Workflow
├── templates/
│   ├── Roentgen/
│   │   ├── MSK/
│   │   │   ├── knie-praetep/       # Röntgen Knie prä-TEP v1.6 (RadLex ✅ verifiziert)
│   │   │   └── knie-posttep/       # Röntgen Knie post-KTEP v1.1.1
│   │   └── Thorax/
│   │       ├── thorax-standard/    # Röntgen Thorax (p.a.) v2.3 (RadLex ✅ verifiziert)
│   │       └── thorax-liegend/     # Röntgen Thorax liegend (ICU/portable) v1.0
│   └── CT/
│       ├── abdomen-becken/         # CT Abdomen + Becken v2.0
│       ├── urolithiasis/           # CT Urolithiasis v1.1 (DRG CC BY 4.0)
│       ├── lungenembolie/          # CT Lungenarterien/CTPA v1.0 (DRG CC BY 4.0)
│       ├── lirads-leber/           # CT Leber LI-RADS v1.3 (A-Struktur)
│       ├── ltx-hcc-evaluation/     # CT Leber LTx-Evaluation HCC v1.0 (DRG CC BY 4.0)
│       └── schaedel-nativ/         # CT Schädel nativ v1.2
├── demo/                           # GitHub Pages Live-Demos
│   ├── knie-prae-tep/
│   ├── knie-posttep/
│   ├── roentgen-thorax/
│   ├── roentgen-thorax-liegend/
│   ├── ct-abdomen/
│   ├── ct-urolithiasis/
│   ├── ct-lungenembolie/
│   ├── ct-lirads-leber/
│   ├── ct-ltx-hcc-evaluation/
│   └── ct-schaedel-nativ/
└── docs/                           # Architektur, Style Guide
```

---

## Template-Übersicht

Je Template zwei Gesichter, beide als gerenderte Seite auf GitHub Pages verlinkt:
**Kanonisch** = das nackte `template.html` (Quelle der Wahrheit; als Import-/
Plattform-Gesicht bewusst ungestylt) · **Demo** = das daraus abgeleitete,
gestylte Schaufenster (gebaut, nicht von Hand editieren).

Die Spalte **RadLex** zeigt den Verifizierungsstand der Kodierung:
✅ registry-verifiziert (NCBO BioPortal) · 🔧 Codes in Verifikation (Rebuild läuft).

| Template | ID | Version | RadLex | Kanonisch | Demo |
|---|---|---|---|---|---|
| Röntgen Knie prä-TEP | HJK-MRRT-KNIE-PRAETEP | v1.6 | ✅ | [`template.html`](https://florian-reiger-ochsner.github.io/radreport-templates/templates/Roentgen/MSK/knie-praetep/template.html) | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/knie-prae-tep/) |
| Röntgen Thorax (p.a.) | HJK-MRRT-ROE-THORAX | v2.3 | ✅ | [`template.html`](https://florian-reiger-ochsner.github.io/radreport-templates/templates/Roentgen/Thorax/thorax-standard/template.html) | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/roentgen-thorax/) |
| Röntgen Knie post-KTEP | HJK-MRRT-KNIE-POSTTEP | v1.1.1 | 🔧 | [`template.html`](https://florian-reiger-ochsner.github.io/radreport-templates/templates/Roentgen/MSK/knie-posttep/template.html) | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/knie-posttep/) |
| Röntgen Thorax liegend (ICU/portable) | HJK-MRRT-ROE-THORAX-LIEGEND | v1.0 | 🔧 | [`template.html`](https://florian-reiger-ochsner.github.io/radreport-templates/templates/Roentgen/Thorax/thorax-liegend/template.html) | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/roentgen-thorax-liegend/) |
| CT Abdomen + Becken | HJK-MRRT-CT-ABDBECKEN | v2.0 | 🔧 | [`template.html`](https://florian-reiger-ochsner.github.io/radreport-templates/templates/CT/abdomen-becken/template.html) | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/ct-abdomen/) |
| CT Urolithiasis | HJK-MRRT-CT-UROLITHIASIS | v1.1 | 🔧 | [`template.html`](https://florian-reiger-ochsner.github.io/radreport-templates/templates/CT/urolithiasis/template.html) | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/ct-urolithiasis/) |
| CT Lungenarterien (CTPA) | HJK-MRRT-CT-LUNGENEMBOLIE | v1.0 | 🔧 | [`template.html`](https://florian-reiger-ochsner.github.io/radreport-templates/templates/CT/lungenembolie/template.html) | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/ct-lungenembolie/) |
| CT Leber LI-RADS | HJK-MRRT-CT-LEBER-LIRADS | v1.3 | 🔧 | [`template.html`](https://florian-reiger-ochsner.github.io/radreport-templates/templates/CT/lirads-leber/template.html) | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/ct-lirads-leber/) |
| CT Leber LTx-Evaluation HCC | HJK-MRRT-LTX-HCC-EVAL | v1.0 | 🔧 | [`template.html`](https://florian-reiger-ochsner.github.io/radreport-templates/templates/CT/ltx-hcc-evaluation/template.html) | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/ct-ltx-hcc-evaluation/) |
| CT Schädel nativ | HJK-MRRT-CT-SCHAEDEL-NATIV | v1.2 | 🔧 | [`template.html`](https://florian-reiger-ochsner.github.io/radreport-templates/templates/CT/schaedel-nativ/template.html) | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/ct-schaedel-nativ/) |

---

## Template-Paket-Schema

A-Struktur: das **kanonische** `template.html` ist nackt (Quelle der Wahrheit),
die **Demo** ist daraus abgeleitet und sekundär.

```
template-name/
├── template.html          # KANONISCH – lean deklaratives MRRT, rr-*-Hooks, ohne CSS/JS, voll kodiert
├── frontmatter.yaml       # Maschinenlesbare Metadaten
├── README.md              # Zweck, Domänen, Quellen
├── CHANGELOG.md           # Versionshistorie
└── RADLEX-MAPPING.md      # RID-Tabelle (✅ verifiziert · 🟡 lokal · 🔲 ausstehend)

demo/<demo-id>/
└── index.html             # ABGELEITET – kanonisches File + Core-Link (build-demo.js), self-contained
```

### Architektur-Konventionen

- **Kanonisch = nackt:** `template.html` trägt keine `<link>`/`<style>`/`<script>`.
  Die `.rr-*`-Klassen bleiben als reine Struktur-Hooks erhalten. Styling lebt nur
  in der abgeleiteten Demo.
- **CSS:** `radreport-core.css` ist die einzige globale CSS-Datei und wird
  **ausschließlich in der Demo** verlinkt. Template-spezifisches CSS (nur Demo)
  verwendet den Präfix `rr-<templatename>-*`.
- **Keine klinischen Voreinstellungen:** Kein `selected`-Attribut auf klinischen Feldern.
  Protokoll-Projektionen (`proj_*`) sind ausgenommen.
- **Checkboxen statt Select** überall wo mehrere Befunde gleichzeitig möglich sind.
- **RadLex non-negotiable:** `data-radlex` (RID) + `data-en` auf allen Dropdown-Optionen.
- **FHIR-Provenance:** KI-generierte Werte werden als `preliminary` gekennzeichnet,
  radiologisch validierte als `final`.

---


## RadLex-Kodierung & Verifikation

Die RadLex-Codes werden gegen die **echte Registry** (NCBO BioPortal, Ontologie
RADLEX) verifiziert, nicht nur auf Existenz geprüft. Ein Code-Treue-Lint gleicht
den am Feld hängenden englischen Term (`data-en`) verbatim gegen das RadLex-
prefLabel ab und fängt so die „valid-but-wrong"-Falle (gültiger Code, falsches
Konzept):

```bash
node shared/scripts/resolve-radlex.js --all      # RIDs → radlex-cache.json (BioPortal)
node shared/scripts/validate-codes.js --all --resolve
```

Wo RadLex kein exaktes Konzept führt, wird bewusst der klinisch tragfähige
Oberbegriff kodiert (Lokalisation/Spezifik über den Feldnamen) oder das Feld
`local` belassen — statt einen unpassenden Code zu erzwingen.

**Status:** `knie-praetep` und `thorax-standard` sind vollständig registry-
verifiziert (✅). Für die übrigen Templates läuft die Verifikation/Neubelegung
der Kodierung (🔧); die Vorlagen selbst sind nutzbar, die RadLex-RIDs dort aber
noch nicht registry-bestätigt.

---

## Standards & Pflege

Template-Aufbau und Konventionen folgen dem internen Style Guide.

- Style Guide: [docs/style-guide/](./docs/style-guide/)
- Code-Fidelity-Lint: [shared/codesystems/](./shared/codesystems/)

---

## Zitieren

Bei Verwendung bitte zitieren:

> Reiger-Ochsner, F. (2026). *radreport-templates: Standards-based structured
> radiology reporting templates (MRRT/RadLex/LOINC/FHIR)*. Zenodo.
> https://doi.org/10.5281/zenodo.21075538

Maschinenlesbare Zitationsmetadaten: [`CITATION.cff`](CITATION.cff)


## Lizenz

Dual-License – die Lizenz richtet sich nach dem Asset-Typ:

| Bestandteil | Lizenz |
| --- | --- |
| Software (`shared/scripts/`, Build-/Utility-Skripte, `*.js`) | [MIT](LICENSE-MIT) |
| Template- und Doku-Inhalt (`*.html`, `*.css`, `*.yaml`, `*.md`, RadLex/LOINC-Mappings) | [CC BY 4.0](LICENSE-CC-BY-4.0) |

Bei kombinierten Dateien (HTML-Template mit Inline-JavaScript) gilt CC BY 4.0
für die Datei als Ganzes; der MIT-Grant gilt zusätzlich für die eingebetteten
Software-Anteile. Details: [LICENSE](LICENSE).

DRG-basierte Templates (CT Urolithiasis, CT Lungenarterien, CT Leber LTx-Evaluation HCC) enthalten Material,
das ursprünglich von der Deutschen Röntgengesellschaft unter CC BY 4.0
lizenziert wurde – Attribution in den jeweiligen Template-READMEs.
(Hinweis: CT Leber LI-RADS enthält seit v1.3 kein DRG-Material mehr – die
§16-TPG/LTx-Evaluation wurde nach HJK-MRRT-LTX-HCC-EVAL ausgelagert.)
Quelle: <https://github.com/DRGagit/ak_befundung>
