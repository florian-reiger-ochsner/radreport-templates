# RadLex-Mapping – CT Lungenarterien (CTPA)

Status: ✅ verifiziert · 🟡 lokal/plausibel · 🔲 ausstehend

> **Registry-Verifikation (2026-07-31):** RIDs gegen NCBO BioPortal (RADLEX) geprüft,
> `system: http://radlex.org`. Suffix-Konvention aufgelöst (Feld/Anker trägt das
> Konzept, Optionswerte/Grade/Lokalisations-Sublagen sind lokal). Wo RadLex kein
> exaktes Konzept führt, ist der tragfähige Oberbegriff kodiert oder das Feld `local`.
> Frühere RIDs waren großteils geraten (RID5352 „pneumothorax" statt Lungenembolie,
> RID49850/49851 aus erfundenem Bereich); jetzt u. a. pulmonary embolism RID4834,
> pulmonary infarction RID34889, Hampton hump sign RID35261 korrekt belegt.

## Registry-verifiziert (RadLex-RID)

| Konzept (`data-en`) | RID | Status |
|---|---|---|
| Hampton hump sign | RID35261 | ✅ |
| airway | RID1245 | ✅ |
| compression | RID4741 | ✅ |
| consolidation | RID43255 | ✅ |
| emphysema | RID4799 | ✅ |
| ground-glass opacity | RID28531 | ✅ |
| left ventricle | RID1392 | ✅ |
| lymphadenopathy | RID3798 | ✅ |
| mediastinal lymph node | RID28891 | ✅ |
| osteolysis | RID5382 | ✅ |
| pericardial effusion | RID38588 | ✅ |
| pleura | RID1362 | ✅ |
| pleural effusion | RID34539 | ✅ |
| pulmonary arterial trunk | RID35839 | ✅ |
| pulmonary embolism | RID4834 | ✅ |
| pulmonary infarction | RID34889 | ✅ |
| right ventricle | RID1389 | ✅ |
| sclerosis | RID5227 | ✅ |
| thickening | RID28509 | ✅ |
| upper abdomen | RID29990 | ✅ |

## Lokal (Werte/Grade/Lokalisation/kein exaktes Konzept)

| Konzept (`data-en`) | Status |
|---|---|
| adequate contrast | 🟡 |
| bolus quality | 🟡 |
| central pulmonary embolism | 🟡 |
| contrast medium volume | 🟡 |
| contrast reflux | 🟡 |
| degenerative changes | 🟡 |
| heart vessels unremarkable | 🟡 |
| inadequate contrast | 🟡 |
| indeterminate for pulmonary embolism | 🟡 |
| interventricular septum shift | 🟡 |
| lobar pulmonary embolism | 🟡 |
| lung parenchyma normal | 🟡 |
| mild right heart strain | 🟡 |
| no pulmonary embolism | 🟡 |
| no right heart strain | 🟡 |
| osseous structures unremarkable | 🟡 |
| right heart strain | 🟡 |
| segmental pulmonary embolism | 🟡 |
| significant right heart strain | 🟡 |
| suboptimal bolus | 🟡 |
| subsegmental pulmonary embolism | 🟡 |

## FHIR-Kodierung

| Ressource | Code | System |
|---|---|---|
| DiagnosticReport | 24634-8 | http://loinc.org |
| Condition (Lungenembolie) | 59282003 | http://snomed.info/sct |
| Observations (RadLex) | RID* | http://radlex.org |
| RV-/LV-Ø | 79900-0 / 79901-8 | http://loinc.org |
