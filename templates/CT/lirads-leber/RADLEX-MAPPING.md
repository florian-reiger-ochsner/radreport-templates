# RadLex-Mapping – CT Leber LI-RADS v2018

Status: ✅ verifiziert · 🟡 lokal/plausibel · 🔲 ausstehend

> **Wichtiger Hinweis (v1.3):** Bei der A-Migration wurde festgestellt, dass die
> RadLex-RIDs des abgelösten Inline-Templates **in sich widersprüchlich** belegt
> waren – derselbe RID stand für unterschiedliche Konzepte (Beispiele unten).
> Gemäß CLAUDE.md §2 („kein RID raten") und §5 (Display-Diff, `24627-2`-Bug)
> werden nur **registry-korroborierte** RIDs behauptet. Alle strittigen/
> unbestätigten Konzepte sind im Template als `data-radlex-status="local"`
> geführt, mit Kandidat-RID hier dokumentiert. Ein dedizierter
> Registry-Verifikationspass (RadLex/BioPortal) steht aus.

## Registry-korroboriert kodiert (✅)

| Feld | RadLex-Term | RID | LOINC | Status |
|---|---|---|---|---|
| Läsionsgröße / Durchmesser | lesion size | RID13432 | 21889-1 | ✅ |
| Lokalisation / Segment | hepatic segment | RID29237 | – | ✅ |
| Verlauf – stabil | stable | RID39157 | – | ✅ |
| Verlauf – Progredienz | progression of disease | RID36043 | – | ✅ |
| Verlauf – Regredienz | regression of disease | RID36044 | – | ✅ |

## Local – Kandidaten ausstehend zur Verifikation (🔲)

### Hauptkriterien
| Feld | data-en | Kandidat-RID (unbestätigt) | Status |
|---|---|---|---|
| Nonrim APHE | nonrim arterial phase hyperenhancement | RID43355 | 🔲 local |
| Nonperipherer Wash-Out | nonperipheral washout | RID43353 (widersprüchlich, s. u.) | 🔲 local |
| Anreichernde Kapsel | enhancing capsule | RID39477 (widersprüchlich, s. u.) | 🔲 local |
| Schwellenwachstum | threshold growth | RID35936 | 🔲 local |

### Sonderkategorien, Hilfskriterien, LR-TR, TIV-Subtyp
Alle als `data-radlex-status="local"` mit `data-en` geführt (kein belastbarer
RID im Quelltemplate). Betrifft u. a. TIV, LR-M-Merkmale, sämtliche Ancillary
Features (`af_*`), LR-TR-Subkategorien. Kandidaten sind hier bewusst nicht
geraten.

### Risikopopulation / Hintergrundleber
| Feld | data-en | Kandidat-RID (unbestätigt) | Status |
|---|---|---|---|
| Leberzirrhose (Risiko) | cirrhosis | RID3822 (widersprüchlich, s. u.) | 🔲 local |
| Chronische HBV | chronic hepatitis B | RID28572 | 🔲 local |
| HCC (Risiko/aktuell) | hepatocellular carcinoma | RID4271 (widersprüchlich, s. u.) | 🔲 local |

## Dokumentierte RID-Widersprüche im Quelltemplate (nicht übernommen)

| RID | belegt für … | zugleich belegt für … |
|---|---|---|
| RID43353 | Wash-Out (Formular) | „LR-M category" + „Pfortader-Tumorzapfen" (Mapping) |
| RID3822 | Leberzirrhose (Formular) | „APHE" (Mapping) |
| RID4271 | HCC (Formular) | „Enhancing capsule" (Mapping) |
| RID39477 | Kapsel (Formular) | „LR-1 category" + „LI-RADS Kategorie" (Mapping) |

## FHIR-Kodierung

| Ressource | Code | System |
|---|---|---|
| Läsionsgröße Observation | RID13432 / 21889-1 | http://radlex.org / http://loinc.org |
| Segment Observation | RID29237 | http://radlex.org |
| LI-RADS Kategorie (berechnet) | LP202113-1 | http://loinc.org |
| Bundle meta tag | HJK-MRRT-CT-LEBER-LIRADS-v1.3 | http://hjk.wien/fhir/CodeSystem/radiology-templates |

## Offene Punkte

- Registry-Verifikation der Kandidat-RIDs (RadLex 4.3 / BioPortal), danach
  `local` → `verified` und `data-radlex` setzen.
- Widersprüche oben auflösen: pro Konzept genau einen registry-verbatim RID.

## Normative Referenz

Schima W, Kopf H, Eisenhuber E. LI-RADS leicht gemacht. Fortschr Röntgenstr 2023; 195: 486–494.
ACR LI-RADS v2018 CT/MRI Core.

---

*Aktualisiert: 2026-07-06 · Template HJK-MRRT-CT-LEBER-LIRADS-v1.3*
