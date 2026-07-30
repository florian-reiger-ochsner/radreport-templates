# RadLex-Mapping – Röntgen Thorax liegend (ICU / portable)

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
| congestion | RID4863 | ✅ |
| consolidation | RID43255 | ✅ |
| degenerative disorder | RID5043 | ✅ |
| dialysis catheter | RID50530 | ✅ |
| emphysema | RID4799 | ✅ |
| endotracheal tube | RID5557 | ✅ |
| foreign body | RID5425 | ✅ |
| fracture | RID4650 | ✅ |
| ground-glass opacity | RID28531 | ✅ |
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
| surgical drain | RID5610 | ✅ |
| thickening | RID28509 | ✅ |
| thoracostomy tube | RID5573 | ✅ |
| tracheostomy tube | RID5560 | ✅ |

## Lokal (kein exaktes RadLex-Konzept)

| Konzept (`data-en`) | Status |
|---|---|
| PEG tube | 🟡 |
| cardiac size not assessable supine | 🟡 |
| cardiomegaly | 🟡 |
| hilar enlargement | 🟡 |
| mediastinal shift | 🟡 |
| mediastinal widening | 🟡 |
| status post sternotomy | 🟡 |
| subcutaneous emphysema | 🟡 |
| tracheal deviation | 🟡 |
| vascular pedicle width | 🟡 |
| ventricular assist device | 🟡 |

## FHIR-Kodierung

| Ressource | Code | System |
|---|---|---|
| DiagnosticReport | 24647-0 | http://loinc.org |
| Observations (RadLex) | RID* | http://radlex.org |
