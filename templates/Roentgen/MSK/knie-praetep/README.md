# Röntgen Knie präoperativ vor TEP

**ID:** HJK-MRRT-KNIE-PRAETEP
**Version:** 1.3
**Status:** Pilot
**Demo:** [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/knie-praetep/)

## Zweck

Strukturierte Befundvorlage für das **Planungsröntgen Knie vor TEP** bei Primärarthrose. Automatische CPAK-Berechnung (MacDessi 2021) aus aHKA und JLO. KI-Integration via IB Lab LAMA (DICOM SR).

## Projektionen

- Knie a.p. stehend
- Knie seitlich
- Patella tangential (optional)
- Ganzbein-Standaufnahme einseitig (Kalibrationskugel obligat)
- Rosenberg-Aufnahme PA 45° (optional)

## Klassifikationen / Messungen

| Maß / Klassifikation | Quelle |
|---|---|
| HKA, MAD, LLD, mLDFA, mMPTA, JLCA | LAMA via DICOM SR |
| CPAK-Phänotyp (Typ I–IX) | MacDessi SJ et al. Bone Joint J 2021 |
| Kellgren-Lawrence (medial / lateral / PF) | Kellgren & Lawrence 1957 |
| Insall-Salvati, Caton-Deschamps (optional) | – |
| Dejour-Klassifikation (optional) | – |
| Tibialer Slope (optional) | – |

## KI-Integration

- **IB Lab LAMA** (produktiv lizenziert) → DICOM SR: HKA, MAD, LLD, mLDFA, mMPTA, JLCA
- **IB Lab KOALA** (Testphase) → KL-Grading (geplant)

**Modi:** Manuell · LAMA vorbefüllt · Hybrid (Validierung)

## Output

- Fließtext (Copy/Paste Syngo/Carbon)
- JSON strukturiert
- FHIR Bundle R4 (LOINC-kodiert)

## Architektur

```
knie-praetep/
├── template.source.html   # Authored source – externer CSS-Link
├── template.html          # MRRT/Carbon-Build (inline CSS)
├── frontmatter.yaml
├── README.md
├── CHANGELOG.md
└── RADLEX-MAPPING.md
```

## Quellen

- MacDessi SJ et al. CPAK classification. Bone Joint J 2021;103-B(3):329-337
- Kellgren JH, Lawrence JS. Ann Rheum Dis 1957;16:494-502
- IB Lab GmbH. LAMA Conformance Statement

## Versionshistorie

Siehe [CHANGELOG.md](./CHANGELOG.md)
