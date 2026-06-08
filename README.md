# radreport-templates

Strukturierte Befundvorlagen für die deutschsprachige Radiologie nach IHE MRRT.

**Autor:** Florian Reiger-Ochsner, Facharzt für Radiologie, Wien
**Stand:** Juni 2026

Fokus: muskuloskelettale Radiologie, Rheumatologie-Imaging, internistische Radiologie. Anschlussfähig an KIS-/PACS-Systeme, KI-Tools (DICOM SR) und Forschungs-/Data-Mining-Workflows (FHIR).

## Technologie-Stack

| Ebene | Standard |
|---|---|
| Template-Format | IHE MRRT (HTML5/XML) als Source of Truth |
| Terminologie | RadLex, LOINC, SNOMED CT, Fleischner |
| Common Data Elements | RSNA RadElement |
| KI-Tool-Input | DICOM SR |
| Export | FHIR DiagnosticReport + Observations |

## Repositoriumsstruktur

```
.
├── templates/   # Befundvorlagen, geordnet nach Modalität → Region/Schwerpunkt
├── demo/        # Lauffähige HTML-Demos (via GitHub Pages erreichbar)
├── docs/        # Architektur, Style Guide
└── .github/     # Issue- und PR-Vorlagen, CI/CD
```

## Aktuelle Vorlagen

| Modalität | Region | Status | Demo |
|---|---|---|---|
| Röntgen | Knie prä-TEP | v1.4 | [Demo](./demo/knie-prae-tep/) |

Weitere Vorlagen folgen sukzessive.

## Mitmachen

Beiträge von Kolleg:innen sind willkommen.

- Workflow: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Konventionen und Stil: [docs/style-guide/](./docs/style-guide/)
- Technische Architektur: [docs/architektur/](./docs/architektur/)

## Lizenz

[MIT](./LICENSE)
