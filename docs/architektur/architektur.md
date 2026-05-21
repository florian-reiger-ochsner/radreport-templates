# Technische Architektur

## Überblick

```
┌────────────────────────────────────────────────────────┐
│  TEMPLATE-EBENE (Source of Truth)                      │
│  HTML5 (IHE MRRT), RadLex/LOINC/SNOMED-kodiert         │
│  Metadaten im <meta>-Header                            │
└──────────────────────┬─────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌─────────────┐ ┌──────────────┐ ┌─────────────────────┐
│ GitHub      │ │ Reporting-   │ │ Andere MRRT-Systeme │
│ Pages-Demo  │ │ Plattform    │ │ (Vendor-Indep.)     │
└─────────────┘ └──────┬───────┘ └─────────────────────┘
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
   ┌─────────────────┐    ┌──────────────────┐
   │ DICOM SR Input  │    │ FHIR Export      │
   │ (Modalitäten)   │    │ DiagnosticReport │
   │ Messwerte       │    │ + Observations   │
   └─────────────────┘    └────────┬─────────┘
                                   │
                        ┌──────────┴─────────┐
                        ▼                    ▼
                 ┌──────────────┐    ┌──────────────┐
                 │  KIS / ePA   │    │  KI-Tools,   │
                 │  Dashboards  │    │  Forschung   │
                 │              │    │  Data Mining │
                 └──────────────┘    └──────────────┘
```

## Standards (verbindlich)

| Ebene | Standard | Zweck |
|---|---|---|
| Template-Format | IHE MRRT (HTML5 + XML) | **Source of Truth**, portabel, vendor-independent |
| Terminologie radiologisch | RadLex | RSNA-Standard, in modernen Reporting-Plattformen unterstützt |
| Mess-/Laborwerte | LOINC | FHIR-Pflicht |
| Klinische Konzepte | SNOMED CT | International, FHIR-kompatibel |
| Thorax-Glossar | Fleischner 2008/2018 | Etablierter Thorax-Standard |
| CDEs | RSNA RadElement | Standardisierte Datenfelder |
| KI-Tool-Input | DICOM SR | IB Lab Suite, andere |
| Export | FHIR (DiagnosticReport + Observations) | KIS-/Forschungs-Anbindung |

## Vorlagen-Struktur

Jede Vorlage liegt unter `templates/<MOD>/<REGION>/<vorlage>/`:

```
knie-praetep/
├── README.md           # fachliche Doku, Klassifikationen, Quellen
├── template.html       # MRRT-HTML, Source of Truth, im Browser lauffähig
├── frontmatter.yaml    # Metadaten (id, version, codes, autoren, naechste-pruefung)
├── CHANGELOG.md        # Versionsverlauf
└── tests/              # (optional) Beispieldaten
```

Die `frontmatter.yaml` dient als **maschinenlesbare Metadatensammlung** (ein zweiter Spiegel der `<meta>`-Tags im HTML), praktisch für Build-/Lint-Skripte und Übersichts-Generierung. Sie ist **nicht** Quelle der Vorlage – die Vorlage selbst ist im HTML.

## Frontmatter-Schema (YAML)

```yaml
id: RR-MRRT-KNIE-PRAETEP
version: 1.2
status: pilot
modalitaet: Roentgen
region: Knie
indikation: Praeoperative Planung TEP bei Primaerarthrose
autoren:
  - florian-reiger-ochsner
reviewer: []
geprueft: 2026-05-12
naechste-pruefung: 2026-11-12
klassifikationen:
  - Kellgren-Lawrence
  - CPAK (MacDessi 2021)
referenzen:
  - "MacDessi SJ et al. Bone Joint J 2021;103-B(3):329-337"
ki-tools:
  - LAMA (IB Lab)
  - KOALA (IB Lab, Testphase)
standorte:
  - (Standort wird vom anwendenden Haus eingetragen)
loinc-codes:
  - LP410789-0 (HKA)
  - LP35279-5 (LLD)
  - LP410785-8 (KL Score)
```

## Demo-Hosting

GitHub Pages liefert für jede Vorlage unter `demo/<name>/` eine lauffähige Live-Version. URL-Schema:

```
https://florian-reiger-ochsner.github.io/radreport-templates/<vorlage>/
```

Übersicht aller Demos: Startseite des Pages-Site.

## Linting und Validierung (optional, später)

Statt einer Build-Pipeline ist mittelfristig sinnvoll:

- **HTML-Validator** (Konsistenz, MRRT-Konformität)
- **LOINC-/RadLex-Code-Check** (gibt es den verwendeten Code wirklich?)
- **Frontmatter-Schema-Validator** (alle Pflichtfelder gefüllt, Ablaufdatum nicht überschritten)

Werkzeuge: Node-/Python-Skripte, in GitHub Actions eingebunden. Kommt mit wachsender Vorlagenzahl.

## Integration in Reporting-Plattformen

- Templates lassen sich in IHE-MRRT-konforme Befundungsplattformen direkt importieren (z.B. Siemens Syngo Carbon, andere MRRT-fähige Systeme)
- Konfiguration und Mapping erfolgt mit dem jeweiligen Implementierungsteam des Hauses
- Schnittstelle zu KIS / ePA: FHIR (DiagnosticReport, Observations)
- LOINC-Mapping ist im FHIR-Profil hinterlegt, hausspezifische Anpassungen möglich
