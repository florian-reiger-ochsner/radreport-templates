# RadLex-Mapping – CT Lungenarterien (CTPA)

Status: ✅ verifiziert · 🟡 lokal/plausibel · 🔲 ausstehend

## LE-Nachweis

| Befund | RadLex-Term | RID | SNOMED | Status |
|---|---|---|---|---|
| Lungenembolie positiv | pulmonary embolism | RID5352 | 59282003 | ✅ |
| Keine LE | no pulmonary embolism | RID5352-neg | – | 🟡 |
| Zentral | central pulmonary embolism | RID5352-cen | – | 🟡 |
| Lobär | lobar pulmonary embolism | RID5352-lob | – | 🟡 |
| Segmental | segmental pulmonary embolism | RID5352-seg | – | 🟡 |
| Subsegmental | subsegmental pulmonary embolism | RID5352-sub | – | 🟡 |

## Rechtsherzbelastung

| Feld | RadLex-Term | RID | LOINC | Status |
|---|---|---|---|---|
| RV-Durchmesser | right ventricular diameter | RID5069 | 79900-0 | ✅ |
| LV-Durchmesser | left ventricular diameter | RID5073 | 79901-8 | ✅ |
| RV/LV-Ratio | RV/LV ratio | RID5076 | – | 🟡 |
| IVS-Shift | interventricular septum shift | RID5075 | – | 🟡 |
| KM-Rückstau in VCI | contrast reflux to IVC | RID5077 | – | 🟡 |
| Truncus pulmonalis dilatiert | dilated pulmonary trunk | RID5079 | – | 🟡 |

## Parenchym / Pleura

| Befund | RadLex-Term | RID | Status |
|---|---|---|---|
| Infarktpneumonie | pulmonary infarct | RID5085 | ✅ |
| Hampton's Hump | Hampton hump | RID5086 | ✅ |
| Milchglastrübung | ground-glass opacity | RID4800 | ✅ |
| Pleuraerguss | pleural effusion | RID4872 | ✅ |

## FHIR-Kodierung

| Ressource | Code | System |
|---|---|---|
| DiagnosticReport | 24634-8 | http://loinc.org |
| LE-Observation | RID5352 + SNOMED 59282003 | http://radlex.org + http://snomed.info/sct |
| RV/LV-Observation | RID5076, interpretation: High wenn ≥ 1.0 | http://radlex.org |
| Bundle meta (DRG) | drg-cc-by-4.0 | http://drg.de |
