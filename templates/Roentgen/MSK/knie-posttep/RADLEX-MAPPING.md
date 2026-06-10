# RadLex-Mapping – Röntgen Knie postoperativ nach KTEP

Status: ✅ verifiziert · 🟡 lokal/plausibel · 🔲 ausstehend

## Implantat-Identifikation

| Feld | RadLex-Term | RID | Status |
|---|---|---|---|
| Prothesentyp allgemein | knee arthroplasty type | RID49700 | 🟡 |
| Bikondylär (KTEP) | total knee arthroplasty bicondylar | RID49701 | 🟡 |
| Unikondylär medial | unicompartmental knee arthroplasty medial | RID49702 | 🟡 |
| Unikondylär lateral | unicompartmental knee arthroplasty lateral | RID49703 | 🟡 |
| Scharnierprothese | constrained hinge knee arthroplasty | RID49704 | 🟡 |
| CR-Constraint | cruciate retaining | RID49707 | 🟡 |
| PS-Constraint | posterior stabilized | RID49708 | 🟡 |
| Fixation zementiert | cemented fixation | RID49713 | 🟡 |
| Fixation zementfrei | cementless fixation | RID49714 | 🟡 |
| Patellaersatz | patellar resurfacing | RID49720 | 🟡 |

## Komponentenstellung

| Feld | RadLex-Term | RID | LOINC | Status |
|---|---|---|---|---|
| Femur coronar | femoral component coronal alignment | RID49730 | LP410789-0 | 🟡 |
| Tibia coronar | tibial component coronal alignment | RID49750 | – | 🟡 |
| HKA postoperativ | hip-knee-ankle angle postoperative | RID49504 | LP410789-0 | 🟡 |
| Gesamtalignment | postoperative knee alignment | RID49770 | – | 🟡 |
| Anteriores Notching | anterior femoral notching | RID49740 | – | 🟡 |
| Tibialer Slope Komp. | tibial component posterior slope | RID49756 | – | 🟡 |

## Periprothetisch / Ewald-Zonen

| Feld | RadLex-Term | RID | Status |
|---|---|---|---|
| Periprothetische Gesamtbeurteilung | periprosthetic assessment | RID49790 | 🟡 |
| Kein Lysesaum | no periprosthetic lucency | RID49790-norm | 🟡 |
| Signifikanter Lysesaum ≥ 2 mm | significant periprosthetic lucency | RID49792 | 🟡 |
| Progrediente Osteolyse | progressive osteolysis | RID49793 | 🟡 |

## Komplikations-Flags

| Flag | RadLex-Term | RID | Severity | Status |
|---|---|---|---|---|
| Periprothetische Fraktur | periprosthetic fracture | RID49830 | alert | 🟡 |
| Luxation | prosthesis dislocation | RID49831 | alert | 🟡 |
| Lockerungszeichen | prosthetic loosening | RID49832 | warn | 🟡 |
| V.a. periprothet. Infektion | periprosthetic infection | RID49833 | alert | 🟡 |
| Relevantes Malalignment | prosthetic malalignment | RID49834 | warn | 🟡 |

## Weichteile / Allgemein

| Feld | RadLex-Term | RID | Status |
|---|---|---|---|
| Gelenkerguss | joint effusion | RID4872 | ✅ |
| Heterotope Ossifikationen | heterotopic ossification | RID5060 | ✅ |
| Knochenstruktur | bone quality | RID13573 | ✅ |

## FHIR-Kodierung

| Ressource | Code | System |
|---|---|---|
| DiagnosticReport | 24650-4 | http://loinc.org |
| Observations | RID* | http://radlex.org |
| Bundle meta tag (EndoCert) | endocert-documentation | http://endocert.de/fhir |
