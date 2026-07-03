# RadLex-Mapping – Röntgen Knie präoperativ vor TEP

Status: ✅ verifiziert · 🟡 lokal/plausibel · 🔲 ausstehend

## Quantitative Messfelder (`<input type="number">`)

Binding sitzt am **input-Element**: `data-en` immer; `data-loinc` wo ein Code
belegt ist; sonst `data-radlex-status="local"`. **Kein RID geraten** – für die
fünf local-Felder ist das RadLex/LOINC-Mapping ausstehend (lokales CodeSystem,
FHIR-Export über den lokalen CodeSystem-URI). Die local-RIDs unten sind
lokale Platzhalter-Codes, **nicht** registry-verifiziert.

| Feld (id) | `data-en` (Element) | Binding am input | LOINC | RID (lokal) | Status | Hinweis |
|---|---|---|---|---|---|---|
| mMPTA (`mmpta`) | mechanical medial proximal tibial angle | `data-radlex-status="local"` | – | RID49508 | 🟡 | **CPAK-Eingang** |
| mLDFA (`mldfa`) | mechanical lateral distal femoral angle | `data-radlex-status="local"` | – | RID49507 | 🟡 | **CPAK-Eingang** |
| HKA (`hka`) | hip-knee-ankle angle | `data-loinc="LP410789-0"` | LP410789-0 | RID49504 | 🟡 | LOINC-Part belegt |
| LLD (`lld`) | leg length discrepancy | `data-loinc="LP35279-5"` | LP35279-5 | RID49506 | 🟡 | LOINC-Part belegt |
| MAD (`mad`) | mechanical axis deviation | `data-radlex-status="local"` | – | RID49505 | 🟡 | lokal, ausstehend |
| JLCA (`jlca`) | joint line convergence angle | `data-radlex-status="local"` | – | RID49509 | 🟡 | lokal, ausstehend |
| Tibialer Slope (`slope`) | posterior tibial slope | `data-radlex-status="local"` | – | RID49526 | 🟡 | lokal, ausstehend |

> **Offener Folgeschritt:** Für die fünf local-Felder (mMPTA, mLDFA, MAD, JLCA,
> Slope) RadLex-RID bzw. LOINC gegen die Registry registry-verbatim verifizieren;
> erst dann von `local` auf `verified` (✅) heben. Bis dahin ist `local`
> ausreichend für Rechner-Eingang (CPAK) und FHIR-Export.

## Klassifikationen

| Feld | RadLex-Term | RID | LOINC | Status |
|---|---|---|---|---|
| KL medial | Kellgren-Lawrence grade medial | RID49516 | LP410785-8 | 🟡 |
| KL lateral | Kellgren-Lawrence grade lateral | RID49517 | – | 🟡 |
| KL PF | Kellgren-Lawrence grade patellofemoral | RID49518 | – | 🟡 |
| CPAK-Phänotyp | CPAK phenotype MacDessi 2021 | RID49519 | – | 🟡 |

## Patellofemoral

| Feld | RadLex-Term | RID | Status |
|---|---|---|---|
| Insall-Salvati | Insall-Salvati ratio | RID49520 | 🟡 |
| Patella alta | patella alta | RID49521 | 🟡 |
| Patella baja | patella baja | RID49522 | 🟡 |
| Patellatilt | patellar tilt | RID49524 | 🟡 |
| Trochleadysplasie (Dejour) | trochlear dysplasia Dejour | RID49525 | 🟡 |

> Tibialer Slope (`slope`) ist ein quantitatives Messfeld → siehe Tabelle
> „Quantitative Messfelder" oben.

## Zusatzbefunde

| Befund | RadLex-Term | RID | Status |
|---|---|---|---|
| Osteophyten | osteophyte | RID5172 | ✅ |
| Subchondrale Zysten | subchondral cyst | RID5173 | ✅ |
| Subchondrale Sklerose | subchondral sclerosis | RID5174 | ✅ |
| Freie Gelenkkörper | loose body | RID5175 | ✅ |
| Gelenkerguss | joint effusion | RID4872 | ✅ |
| Baker-Zyste | Baker cyst | RID5176 | ✅ |
| Chondrokalzinose | chondrocalcinosis | RID5061 | ✅ |

## FHIR-Kodierung

| Ressource | Code | System |
|---|---|---|
| DiagnosticReport | 24650-4 | http://loinc.org |
| Observations | RID* | http://radlex.org |
| Achsenmessungen | LP* | http://loinc.org |
