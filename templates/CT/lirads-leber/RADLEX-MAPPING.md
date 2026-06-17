# RadLex-Mapping – CT/MRT Leber LI-RADS

Status: ✅ verifiziert · 🟡 lokal/plausibel · 🔲 ausstehend

## LI-RADS Kategorien

| Kategorie | RadLex-Term | RID | Status |
|---|---|---|---|
| LR-1 (definitiv benigne) | LI-RADS category 1 | RID39477 | ✅ |
| LR-2 (wahrscheinlich benigne) | LI-RADS category 2 | RID39478 | ✅ |
| LR-3 (intermediate) | LI-RADS category 3 | RID39479 | ✅ |
| LR-4 (wahrscheinlich HCC) | LI-RADS category 4 | RID39480 | ✅ |
| LR-5 (definitiv HCC) | LI-RADS category 5 | RID39481 | ✅ |
| LR-M (malignom, nicht HCC-spezifisch) | LI-RADS category M | RID43353 | ✅ |
| LR-TIV (Tumorzapfen in Vene) | LI-RADS category TIV | RID43354 | ✅ |
| LR-TR (behandelte Läsion) | LI-RADS treated observation | RID45538 | 🟡 |
| LR-NC (nicht klassifizierbar) | LI-RADS non-categorizable | RID45539 | 🟡 |

## Läsions-Charakteristika (Hauptkriterien)

| Merkmal | RadLex-Term | RID | LOINC | Status |
|---|---|---|---|---|
| LI-RADS Kategorie | LI-RADS category | RID39477 | LP202113-1 | ✅ |
| Läsionsgröße | lesion size | RID13432 | 21889-1 | ✅ |
| Lokalisation / Segment | hepatic segment | RID29237 | – | ✅ |
| APHE (arterielle Hypervaskularisierung) | arterial phase hyperenhancement | RID3822 | – | ✅ |
| Wash-out | wash-out appearance | RID3987 | – | ✅ |
| Enhancing capsule | enhancing capsule | RID4271 | – | ✅ |
| Schwellenwachstum | threshold growth | RID35936 | – | ✅ |

## Hilfskriterien (Ancillary Features)

| Merkmal | RadLex-Term | RID | Status |
|---|---|---|---|
| Korona-Enhancement | corona enhancement | RID28572 | 🟡 |
| Mosaikmuster | mosaic architecture | RID29896 | 🟡 |

## Lebervenen / Pfortader

| Befund | RadLex-Term | RID | Status |
|---|---|---|---|
| Tumorzapfen Pfortader | portal vein tumor thrombus | RID43353 | ✅ |
| Lebervenen-Invasion | hepatic vein invasion | RID45540 | 🟡 |

## FHIR-Kodierung

| Ressource | Code | System |
|---|---|---|
| DiagnosticReport | 24571-9 (CT Abdomen) | http://loinc.org |
| DiagnosticReport Kategorie | LP29684-5 (Radiology) | http://loinc.org |
| LI-RADS Observation | LP202113-1 | http://loinc.org |
| Bundle meta tag | HJK-MRRT-CT-LEBER-LIRADS-v1.2 | http://hjk.wien/fhir/CodeSystem/radiology-templates |

## Normative Referenz

Schima W, Kopf H, Eisenhuber E. LI-RADS leicht gemacht. Fortschr Röntgenstr 2023; 195: 486–494.
ACR LI-RADS v2018 CT/MRI Core.

---

*Generiert: 2026-06-16 · Template HJK-MRRT-CT-LEBER-LIRADS-v1.2*
