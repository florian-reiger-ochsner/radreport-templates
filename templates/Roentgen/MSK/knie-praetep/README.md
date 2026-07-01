# Röntgen Knie präoperativ vor TEP

**ID:** HJK-MRRT-KNIE-PRAETEP
**Version:** 1.3
**Status:** Pilot
**Demo:** [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/knie-prae-tep/)

## Zweck

Strukturierte Befundvorlage für die **präoperative Planung einer Knie-TEP bei Primärarthrose**. Erfasst Beinachse, Arthrosegrad und patellofemoralen Status standardisiert und liefert daraus einen CPAK-Phänotyp sowie einen klickbaren Beurteilungsvorschlag. RadLex/LOINC-kodiert mit FHIR-R4-Export.

## Modi

| Modus | Beschreibung |
|---|---|
| Manuell | Vollständig manuelle Eingabe aller Messwerte und Klassifikationen |
| LAMA-vorbefüllt | Achsenmessungen aus LAMA (IB Lab, DICOM SR) übernommen |
| Hybrid-Validierung | KI-vorbefüllte Felder visuell markiert, manuelle Freigabe |

## Sektionen

| Sektion | Inhalt |
|---|---|
| Technik | Projektionen: AP stehend, seitlich, Patella tangential (opt.), Ganzbein einseitig kalibriert, Rosenberg (opt.) |
| Achsenvermessung | HKA, MAD, LLD, mLDFA, mMPTA, JLCA |
| Arthrosegrad – Kellgren-Lawrence | KL medial / lateral / patellofemoral als 3-Spalten-Grid |
| Patellofemoraler Status (optional) | Insall-Salvati, Caton-Deschamps, Patella alta/baja, Patellatilt, Trochleadysplasie (Dejour) – kollabierbar |
| Tibialer Slope (optional) | kollabierbar |
| Zusatzbefunde | Osteophyten, subchondrale Zysten/Sklerose, freie Gelenkkörper, Erguss, Baker-Zyste, Chondrokalzinose |
| Knochenstruktur | – |
| Klinische Angabe / Voruntersuchung / Freitext | Kontext und Ergänzungen |

## Klassifikationen

- **Kellgren-Lawrence** (Ann Rheum Dis 1957) – pro Kompartiment medial / lateral / patellofemoral
- **CPAK** (MacDessi 2021) – aHKA + JLO → Phänotyp I–IX, live berechnet

## KI-Tools

| Tool | Status | Output |
|---|---|---|
| LAMA (IB Lab) | produktiv-lizenziert | DICOM SR |
| KOALA (IB Lab) | Testphase | DICOM SR |

## Kodierung

RadLex auf allen diskreten Befunden, LOINC auf Achsenmessungen und Report-Typ. Details und Verifikationsstatus siehe [RADLEX-MAPPING.md](./RADLEX-MAPPING.md).

| Ressource | Code | System |
|---|---|---|
| DiagnosticReport | 24650-4 | http://loinc.org |
| Observations | RID* | http://radlex.org |
| Achsenmessungen | LP* | http://loinc.org |

## Output

- Fließtext (Syngo/Carbon kompatibel, keine Flags im Text)
- JSON strukturiert
- FHIR Bundle R4 (DiagnosticReport + Observations, doppelte Kodierung LOINC + RadLex)

## Quellen

- Kellgren JH, Lawrence JS. Ann Rheum Dis 1957;16:494-502
- MacDessi SJ et al. Bone Joint J 2021;103-B(3):329-337
- Paley D. Principles of Deformity Correction. Springer 2002
- IB Lab GmbH. LAMA Conformance Statement (DICOM SR)

## Versionshistorie

Siehe [CHANGELOG.md](./CHANGELOG.md)
