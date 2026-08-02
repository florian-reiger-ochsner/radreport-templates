# RadLex-Mapping – Röntgen Knie post-TEP

> **LOINC-Korrektur 2026-08-02:** Zuvor gelistete LOINC-Codes wurden gegen loinc.org geprueft und als falsch/unbelegbar entfernt (siehe CHANGELOG). Messfelder tragen lokales CodeSystem + `data-en`; verifizierte LOINC-Codes sind ein nachgelagerter Schritt (resolve-loinc.js). Historische Tabellen unten koennen entfernte Codes noch nennen.

Status: ✅ verifiziert · 🟡 lokal/plausibel · 🔲 ausstehend

> **Registry-Verifikation (2026-07-21):** RIDs gegen NCBO BioPortal (RADLEX) geprüft,
> `system: http://radlex.org`. Suffix-Konvention aufgelöst (Feld trägt das Konzept,
> Optionswerte/Grade sind lokal). Wo RadLex kein exaktes Konzept führt, ist der
> tragfähige Oberbegriff kodiert oder das Feld `local`. Implantat-Details (Fixation,
> Zementmantel, Constraint-Typ) sind bewusst lokal – RadLex führt hierfür keine
> spezifischen Prothesen-Konzepte. Frühere RIDs waren großteils geraten.

## Registry-verifiziert (RadLex-RID)

| Konzept (`data-en`) | RID | Status |
|---|---|---|
| alignment | RID38801 | ✅ |
| anteroposterior projection | RID28784 | ✅ |
| arthroplasty loosening | RID4619 | ✅ |
| arthroplasty | RID1845 | ✅ |
| effusion | RID4872 | ✅ |
| flexion deformity | RID4765 | ✅ |
| fully constrained implant | RID6414 | ✅ |
| heterotopic ossification | RID5226 | ✅ |
| image quality | RID10 | ✅ |
| intraoperative | RID39334 | ✅ |
| lateral projection | RID10523 | ✅ |
| osteolysis | RID5382 | ✅ |
| osteopenia | RID5388 | ✅ |
| osteoporosis | RID5389 | ✅ |
| patella infera | RID39260 | ✅ |
| postoperative change | RID4591 | ✅ |
| postoperative | RID5729 | ✅ |
| subluxation | RID4778 | ✅ |
| tilt | RID4782 | ✅ |
| unicompartmental arthroplasty | RID1846 | ✅ |
| valgus deformity | RID4768 | ✅ |
| varus deformity | RID4769 | ✅ |

## Lokal (Werte/Grade/kein exaktes Konzept)

| Konzept (`data-en`) | Status |
|---|---|
| anterior femoral notching | 🟡 |
| bone quality | 🟡 |
| cemented femoral component | 🟡 |
| cemented tibial component | 🟡 |
| cementless femoral component | 🟡 |
| cementless tibial component | 🟡 |
| central tibial position | 🟡 |
| complete femoral cement mantle | 🟡 |
| complete tibial cement mantle | 🟡 |
| cruciate retaining | 🟡 |
| femoral cement mantle defect | 🟡 |
| femoral cement mantle | 🟡 |
| femoral component coronal alignment assessment | 🟡 |
| femoral component fixation | 🟡 |
| femoral component sagittal alignment | 🟡 |
| femoral extension | 🟡 |
| full length lower limb radiograph | 🟡 |
| hip-knee-ankle angle postoperative | 🟡 |
| hybrid fixation | 🟡 |
| immediate postoperative recovery | 🟡 |
| incomplete femoral cement mantle | 🟡 |
| incomplete tibial cement mantle | 🟡 |
| interval change | 🟡 |
| intraoperative radiograph timing | 🟡 |
| knee arthroplasty type | 🟡 |
| knee implant constraint | 🟡 |
| lateral tibial offset | 🟡 |
| lateral tibial overhang | 🟡 |
| medial tibial offset | 🟡 |
| medial tibial overhang | 🟡 |
| mild anterior notching | 🟡 |
| minor periprosthetic lucency | 🟡 |
| neutral femoral alignment | 🟡 |
| neutral femoral sagittal position | 🟡 |
| neutral postoperative alignment | 🟡 |
| neutral tibial alignment | 🟡 |
| new or progressive finding | 🟡 |
| no anterior notching | 🟡 |
| no heterotopic ossification | 🟡 |
| no joint effusion | 🟡 |
| no patellar resurfacing | 🟡 |
| no periprosthetic lucency | 🟡 |
| no significant interval change | 🟡 |
| normal bone | 🟡 |
| normal patellar height | 🟡 |
| normal patellar tracking | 🟡 |
| normal tibial slope | 🟡 |
| patellar component assessment | 🟡 |
| patellar component well seated | 🟡 |
| patellar component | 🟡 |
| patellar height postoperative | 🟡 |
| patellar resurfacing | 🟡 |
| patellar tracking | 🟡 |
| periprosthetic assessment | 🟡 |
| posterior stabilized | 🟡 |
| postoperative knee alignment | 🟡 |
| progressive osteolysis on follow-up | 🟡 |
| reduced tibial slope | 🟡 |
| significant anterior notching | 🟡 |
| significant periprosthetic lucency | 🟡 |
| skyline view patella | 🟡 |
| tibial cement mantle defect | 🟡 |
| tibial cement mantle | 🟡 |
| tibial component coronal alignment assessment | 🟡 |
| tibial component fixation | 🟡 |
| tibial component position | 🟡 |
| tibial component posterior slope | 🟡 |

## FHIR-Kodierung

| Ressource | Code | System |
|---|---|---|
| DiagnosticReport | LP410789-0 | http://loinc.org |
| Observations (RadLex) | RID* | http://radlex.org |
