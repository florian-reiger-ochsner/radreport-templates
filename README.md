# radreport-templates

**MRRT-konforme strukturierte Befundvorlagen für die deutschsprachige Radiologie**
HTML5 · RadLex · FHIR R4 · Vendor-neutral

**Autor:** Florian Reiger-Ochsner, Facharzt für Radiologie, Stv. Vorstand Radiologie, Herz-Jesu-Krankenhaus Wien
**Stand:** Juni 2026

---

## Ziel

Strukturierte, standards-konforme Befundvorlagen als wiederverwendbare Datenpunkte –
nicht als proprietäre Dokumente. Der Befund wird vom Endprodukt zum FHIR-Observation.

- **MRRT-konform** (IHE Integrating the Healthcare Enterprise)
- **RadLex-terminiert** – jede `<option>` mit `data-radlex` (RID) und `data-en`
- **FHIR R4 Export** – DiagnosticReport + Observations, LOINC-kodiert
- **Vendor-neutral** – Carbon-ready, Syngo-kompatibel (Copy/Paste), ELGA/EHDS-anschlussfähig
- **Checkbox-basiert** – Mehrfachauswahl wo klinisch sinnvoll, keine klinischen Voreinstellungen

---

## Technologie-Stack

| Ebene | Standard |
|---|---|
| Template-Format | IHE MRRT (HTML5) |
| Terminologie | RadLex · LOINC · SNOMED CT · Fleischner 2017 · LI-RADS v2018 |
| KI-Tool-Input | DICOM SR (LAMA, KOALA – IB Lab) |
| Export | FHIR R4 DiagnosticReport + Observations |
| FHIR-URI | `http://hjk.wien/fhir/CodeSystem/radiology-templates` |
| CSS | `shared/styles/radreport-core.css` (Single Source of Truth) |

---

## Repositoriumsstruktur

```
.
├── shared/
│   ├── styles/
│   │   └── radreport-core.css      # Globale CSS-Tokens (--rr-*) und Klassen (.rr-*)
│   └── scripts/
│       └── inline-css.js           # Build: source.html → template.html (CSS inline)
├── templates/
│   ├── Roentgen/
│   │   ├── MSK/
│   │   │   ├── knie-praetep/       # Röntgen Knie prä-TEP v1.4
│   │   │   └── knie-posttep/       # Röntgen Knie post-KTEP v1.1
│   │   └── Thorax/
│   │       └── thorax-standard/    # Röntgen Thorax v1.3
│   └── CT/
│       ├── abdomen-becken/         # CT Abdomen + Becken v1.0
│       ├── urolithiasis/           # CT Urolithiasis v1.0 (DRG CC BY 4.0)
│       ├── lungenembolie/          # CT Lungenarterien/CTPA v1.0 (DRG CC BY 4.0)
│       ├── lirads-leber/           # CT/MRT Leber LI-RADS v1.2
│       └── schaedel-nativ/         # CT Schädel nativ v1.0
├── demo/                           # GitHub Pages Live-Demos
│   ├── knie-prae-tep/
│   ├── knie-posttep/
│   ├── roentgen-thorax/
│   ├── ct-abdomen/
│   ├── ct-urolithiasis/
│   ├── ct-lungenembolie/
│   ├── ct-lirads-leber/
│   └── ct-schaedel-nativ/
└── docs/                           # Architektur, Style Guide
```

---

## Template-Übersicht

| Template | ID | Version | Demo |
|---|---|---|---|
| Röntgen Knie prä-TEP | HJK-MRRT-KNIE-PRAETEP | v1.4 | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/knie-prae-tep/) |
| Röntgen Knie post-KTEP | HJK-MRRT-KNIE-POSTTEP | v1.1 | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/knie-posttep/) |
| Röntgen Thorax | HJK-MRRT-ROE-THORAX | v1.3 | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/roentgen-thorax/) |
| CT Abdomen + Becken | HJK-MRRT-CT-ABDBECKEN | v1.0 | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/ct-abdomen/) |
| CT Urolithiasis | HJK-MRRT-CT-UROLITHIASIS | v1.0 | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/ct-urolithiasis/) |
| CT Lungenarterien (CTPA) | HJK-MRRT-CT-LUNGENEMBOLIE | v1.0 | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/ct-lungenembolie/) |
| CT/MRT Leber LI-RADS | HJK-MRRT-CT-LEBER-LIRADS | v1.2 | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/ct-lirads-leber/) |
| CT Schädel nativ | HJK-MRRT-CT-SCHAEDEL-NATIV | v1.0 | [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/ct-schaedel-nativ/) |

---

## Template-Paket-Schema

Jedes Template enthält:

```
template-name/
├── template.source.html   # Authored source – externer CSS-Link
├── template.html          # MRRT/Carbon-Build – CSS inline
├── frontmatter.yaml       # Maschinenlesbare Metadaten
├── README.md              # Zweck, Domänen, Quellen
├── CHANGELOG.md           # Versionshistorie
└── RADLEX-MAPPING.md      # RID-Tabelle (✅ verifiziert · 🟡 lokal · 🔲 ausstehend)
```

### Architektur-Konventionen

- **CSS:** `radreport-core.css` ist die einzige globale CSS-Datei. Template-spezifisches CSS
  verwendet den Präfix `rr-<templatename>-*`.
- **Keine klinischen Voreinstellungen:** Kein `selected`-Attribut auf klinischen Feldern.
  Protokoll-Projektionen (`proj_*`) sind ausgenommen.
- **Checkboxen statt Select** überall wo mehrere Befunde gleichzeitig möglich sind.
- **RadLex non-negotiable:** `data-radlex` (RID) + `data-en` auf allen Dropdown-Optionen.
- **FHIR-Provenance:** KI-generierte Werte werden als `preliminary` gekennzeichnet,
  radiologisch validierte als `final`.

---

## KI-Integration

| Tool | Hersteller | Status | Output |
|---|---|---|---|
| LAMA | IB Lab | Produktiv lizenziert | DICOM SR (Achsenmessungen Knie) |
| KOALA | IB Lab | Testlizenz | DICOM SR (KL-Grading, geplant) |
| HIPPO, FLAMINGO, SQUIRREL | IB Lab | Testlizenz | – |

---

## Roadmap

**Phase 1 (laufend):**
- [x] Röntgen Knie prä-TEP
- [x] Röntgen Knie post-KTEP (inkl. EndoCert-Modus)
- [x] Röntgen Thorax
- [x] CT Abdomen + Becken
- [x] CT Urolithiasis
- [x] CT Lungenarterien
- [x] CT/MRT Leber LI-RADS
- [x] CT Schädel nativ

**Phase 2 (geplant):**
- [ ] MRT Knie allgemein
- [ ] MRT LWS
- [ ] MRT Sakroiliakalgelenke (ASAS/Rheuma)
- [ ] CT Thorax Fleischner/Lung-RADS
- [ ] MyKnee CT (CPAK, Torsion, Slope)

---

## Mitmachen

Beiträge willkommen – bevorzugt via Issue oder Pull Request.

- Workflow: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Style Guide: [docs/style-guide/](./docs/style-guide/)

---

## Lizenz

Dual-License – die Lizenz richtet sich nach dem Asset-Typ:

| Bestandteil | Lizenz |
| --- | --- |
| Software (`shared/scripts/`, Build-/Utility-Skripte, `*.js`) | [MIT](LICENSE-MIT) |
| Template- und Doku-Inhalt (`*.html`, `*.source.html`, `*.css`, `*.yaml`, `*.md`, RadLex/LOINC-Mappings) | [CC BY 4.0](LICENSE-CC-BY-4.0) |

Bei kombinierten Dateien (HTML-Template mit Inline-JavaScript) gilt CC BY 4.0
für die Datei als Ganzes; der MIT-Grant gilt zusätzlich für die eingebetteten
Software-Anteile. Details: [LICENSE](LICENSE).

DRG-basierte Templates (CT Urolithiasis, CT Lungenarterien) enthalten Material,
das ursprünglich von der Deutschen Röntgengesellschaft unter CC BY 4.0
lizenziert wurde – Attribution in den jeweiligen Template-READMEs.
Quelle: <https://github.com/DRGagit/ak_befundung>
