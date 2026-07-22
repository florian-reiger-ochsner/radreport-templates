# RadLex-Mapping – Röntgen Thorax stehend (p.a. / seitlich)

Status: ✅ verifiziert · 🟡 lokal/plausibel · 🔲 ausstehend

> **Registry-Verifikation (2026-07-21):** RIDs gegen NCBO BioPortal (Ontologie RADLEX)
> geprüft; `system: http://radlex.org`. Wo RadLex kein exaktes Konzept führt, ist
> bewusst der klinisch tragfähige Oberbegriff kodiert (Lokalisation/Spezifik über den
> Feldnamen) oder das Feld `local` belassen. Frühere, geratene RIDs (z. B. „ground-glass
> opacity" RID4800 = *pneumocephalus*, „central venous catheter" RID49600 = *injection
> treatment*) waren grob falsch und wurden ersetzt. Prüfbar mit
> `node shared/scripts/validate-codes.js templates/Roentgen/Thorax/thorax-standard --resolve`.

## Registry-verifiziert (RadLex-RID)

| Konzept (`data-en`) | RID | Status |
|---|---|---|
| air trapping | RID28537 | ✅ |
| atelectasis | RID28493 | ✅ |
| automated implantable cardiac defibrillator | RID5434 | ✅ |
| calcification | RID5196 | ✅ |
| cardiac rhythm therapy device | RID5431 | ✅ |
| catheter | RID5576 | ✅ |
| cavitary | RID7475 | ✅ |
| central venous catheter | RID5578 | ✅ |
| compression fracture | RID4658 | ✅ |
| consolidation | RID43255 | ✅ |
| crazy-paving pattern | RID43256 | ✅ |
| degenerative disorder | RID5043 | ✅ |
| dialysis catheter | RID50530 | ✅ |
| dilation | RID4743 | ✅ |
| emphysema | RID4799 | ✅ |
| endotracheal tube | RID5557 | ✅ |
| enlargement | RID3775 | ✅ |
| foreign body | RID5425 | ✅ |
| fracture | RID4650 | ✅ |
| ground-glass opacity | RID28531 | ✅ |
| honeycomb lung | RID35280 | ✅ |
| implantable device | RID5429 | ✅ |
| intraaortic balloon pump | RID5587 | ✅ |
| jejunostomy tube | RID50341 | ✅ |
| kyphoscoliosis | RID4760 | ✅ |
| mass | RID3874 | ✅ |
| mastectomy | RID49910 | ✅ |
| nasogastric tube | RID5566 | ✅ |
| opacity | RID28530 | ✅ |
| osteolysis | RID5382 | ✅ |
| pacemaker | RID5436 | ✅ |
| peripheral intravenous central catheter | RID5581 | ✅ |
| pleural effusion | RID34539 | ✅ |
| pneumothorax | RID5352 | ✅ |
| port | RID50336 | ✅ |
| pulmonary nodule | RID50149 | ✅ |
| reticular pattern | RID43271 | ✅ |
| reticulonodular pattern | RID43272 | ✅ |
| surgical drain | RID5610 | ✅ |
| thickening | RID28509 | ✅ |
| thoracostomy tube | RID5573 | ✅ |
| tracheostomy tube | RID5560 | ✅ |

## Lokal (kein exaktes RadLex-Konzept)

| Konzept (`data-en`) | Status |
|---|---|
| PEG tube | 🟡 |
| aortic configuration | 🟡 |
| borderline cardiomegaly | 🟡 |
| cardiomegaly | 🟡 |
| costophrenic angle blunting bilateral | 🟡 |
| costophrenic angle blunting left | 🟡 |
| costophrenic angle blunting right | 🟡 |
| diaphragm normal | 🟡 |
| elevated hemidiaphragm bilateral | 🟡 |
| elevated left hemidiaphragm | 🟡 |
| elevated right hemidiaphragm | 🟡 |
| heart size normal | 🟡 |
| hilar enlargement | 🟡 |
| mediastinal shift | 🟡 |
| mediastinal widening | 🟡 |
| micronodules | 🟡 |
| mitral configuration | 🟡 |
| status post sternotomy | 🟡 |
| subcutaneous emphysema | 🟡 |
| tracheal deviation | 🟡 |
| ventricular assist device | 🟡 |

## FHIR-Kodierung

| Ressource | Code | System |
|---|---|---|
| DiagnosticReport | 24648-8 | http://loinc.org |
| Observations (RadLex) | RID* | http://radlex.org |
