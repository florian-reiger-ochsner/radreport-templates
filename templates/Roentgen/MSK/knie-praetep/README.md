# Röntgen Knie präoperativ vor TEP

**ID:** RR-MRRT-KNIE-PRAETEP
**Version:** 1.2
**Status:** Pilot
**Demo:** [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/knie-prae-tep/)

## Zweck

Strukturierte Befundvorlage für das **Planungsröntgen Knie vor TEP** bei Primärarthrose. Integriert automatische Achsen- und Längenvermessung über IB Lab LAMA via DICOM SR.

## Projektionen

- Knie a.p. stehend
- Knie seitlich
- Patella tangential
- Ganzbein-Standaufnahme (einseitig)
- Rosenberg-Aufnahme (PA 45° Flex) optional
- **Kalibrationskugel obligat** für millimetergenaue Längenmessung

## Klassifikationen / Messungen

| Was | Klassifikation / Maß |
|---|---|
| Beinachse | HKA, MAD, mLDFA, mMPTA, JLCA, BLD |
| Achsenphänotyp | CPAK (MacDessi 2021) automatisch berechnet aus aHKA + JLO |
| Arthrosegrad | Kellgren-Lawrence (medial / lateral / patellofemoral) |
| Patella-Höhe (optional) | Insall-Salvati, Caton-Deschamps |
| Patella-Tilt (optional) | qualitativ |
| Trochleadysplasie (optional) | Dejour |
| Tibialer Slope (optional) | sagittal |

## KI-Integration

- **IB Lab LAMA** (produktiv lizenziert) → DICOM SR für HKA, MAD, LLD, mLDFA, mMPTA, JLCA
- **IB Lab KOALA** (Testphase) → KL-Grading (geplant)

Drei Modi im Template:

- **Manuell** – Fallback, alle Felder selbst eingeben
- **LAMA vorbefüllt** – Werte aus DICOM SR übernommen, Radiologe validiert
- **Hybrid** – KI-Vorschlag sichtbar, manuelle Eintragung = bewusstes Validieren

## Indikation

Nur Primärarthrose. Revisionsplanung ist ein **separates Template** (in Entwicklung).

## Output

- **Fließtext** für Copy/Paste ins PACS
- **JSON** strukturiert (Backup, KI-Training)
- **FHIR Bundle** (DiagnosticReport + Observations mit LOINC)

## Quellen

- MacDessi SJ et al. Coronal Plane Alignment of the Knee (CPAK) classification. Bone Joint J 2021;103-B(3):329-337
- Paley D. Principles of Deformity Correction. Springer 2002
- Kellgren JH, Lawrence JS. Radiological assessment of osteo-arthrosis. Ann Rheum Dis 1957;16:494-502
- IB Lab GmbH. LAMA Conformance Statement (DICOM SR)

## Versionshistorie

Siehe [CHANGELOG.md](./CHANGELOG.md)
