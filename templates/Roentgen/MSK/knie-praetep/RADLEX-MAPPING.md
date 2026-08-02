# RadLex-Mapping – Röntgen Knie präoperativ vor TEP

> **LOINC-Korrektur 2026-08-02:** Zuvor gelistete LOINC-Codes wurden gegen loinc.org geprueft und als falsch/unbelegbar entfernt (siehe CHANGELOG). Messfelder tragen lokales CodeSystem + `data-en`; verifizierte LOINC-Codes sind ein nachgelagerter Schritt (resolve-loinc.js). Historische Tabellen unten koennen entfernte Codes noch nennen.

Status: ✅ verifiziert · 🟡 lokal/plausibel · 🔲 ausstehend

> **Registry-Verifikation (2026-07-21):** RIDs gegen NCBO BioPortal (Ontologie
> RADLEX) geprüft, `system: http://radlex.org`. ✅ = RID existiert und sein
> englischer RadLex-Term (`Preferred_name`) deckt sich mit `data-en`. Frühere,
> geratene RIDs waren grob falsch (z. B. „osteophyte" RID4757 = *dextroscoliosis*,
> RID5172 = *Infarkt*; „loose body" RID5175 = *Milzinfarkt*) und wurden ersetzt.
> Prüfbar mit `node shared/scripts/validate-codes.js --resolve`.

## Seite

| Feld | RadLex-Term (`data-en`) | RID | Status |
|---|---|---|---|
| Seite re. | right | RID5825 | ✅ |
| Seite li. | left | RID5824 | ✅ |

## Technik / Projektionen

| Feld | RadLex-Term (`data-en`) | RID | Status |
|---|---|---|---|
| a.p. stehend | anteroposterior projection | RID28784 | ✅ |
| seitlich | lateral projection | RID10523 | ✅ |
| Patella tangential | patella tangential view | – (local) | 🟡 |
| Ganzbein-Standaufnahme | long leg standing radiograph | – (local) | 🟡 |
| Rosenberg-Aufnahme | Rosenberg view (PA 45° flexion) | – (local) | 🟡 |
| Kalibrationskugel | calibration sphere | – (local) | 🟡 |

## Quantitative Messfelder (`<input type="number">`)

Binding sitzt am **input-Element**: `data-en` immer; `data-loinc` wo ein Code
belegt ist; sonst `data-radlex-status="local"`. **Kein RID geraten** – die
früheren RID495xx waren nicht registry-verifizierte Platzhalter und wurden
entfernt. Für diese Felder ist das RadLex-RID-Mapping ausstehend (lokales
CodeSystem; LOINC-Parts wo belegt).

| Feld (id) | `data-en` (Element) | LOINC | RID | Status | Hinweis |
|---|---|---|---|---|---|
| mMPTA (`mmpta`) | mechanical medial proximal tibial angle | – | – (local) | 🟡 | **CPAK-Eingang** |
| mLDFA (`mldfa`) | mechanical lateral distal femoral angle | – | – (local) | 🟡 | **CPAK-Eingang** |
| HKA (`hka`) | hip-knee-ankle angle | LP410789-0 | – (local) | 🟡 | LOINC-Part belegt |
| LLD (`lld`) | leg length discrepancy | LP35279-5 | – (local) | 🟡 | LOINC-Part belegt |
| MAD (`mad`) | mechanical axis deviation | – | – (local) | 🟡 | lokal, ausstehend |
| JLCA (`jlca`) | joint line convergence angle | – | – (local) | 🟡 | lokal, ausstehend |
| Tibialer Slope (`slope`) | posterior tibial slope | – | – (local) | 🟡 | lokal, ausstehend |

> **Offener Folgeschritt:** LOINC-Parts (HKA, LLD) sowie RadLex-RIDs für die
> Winkelmaße gegen die jeweilige Registry verifizieren; erst dann 🟡→✅.

## Klassifikationen

KL-Grade und CPAK sind Score-/Ableitungskonzepte ohne eigenständigen RadLex-RID
je Ausprägung → `local`. Der KL-Score ist am Feld über LOINC `LP410785-8`
gebunden; CPAK wird nachgelagert aus mMPTA/mLDFA abgeleitet.

| Feld | `data-en` | LOINC | RID | Status |
|---|---|---|---|---|
| KL 0 (keine) | no osteoarthritis (KL 0) | LP410785-8 | – (local) | 🟡 |
| KL 1–4 | doubtful/mild/moderate/severe osteoarthritis (KL n) | LP410785-8 | – (local) | 🟡 |
| CPAK-Phänotyp | CPAK phenotype (MacDessi 2021) | – | – (local) | 🟡 |

## Patellofemoral

Klinische Klassifikationskonzepte ohne verifizierten RadLex-RID → `local`.

| Feld | `data-en` | RID | Status |
|---|---|---|---|
| Insall-Salvati | patella normal height (Insall-Salvati) | – (local) | 🟡 |
| Patella alta | patella alta | – (local) | 🟡 |
| Patella baja | patella baja | – (local) | 🟡 |
| Patella-Tilt | normal/lateral/medial patellar tilt | – (local) | 🟡 |
| Trochleadysplasie (Dejour) | Dejour type A–D trochlear dysplasia | – (local) | 🟡 |

## Zusatzbefunde

| Befund | RadLex-Term (`data-en`) | RID | Status |
|---|---|---|---|
| Osteophyten | osteophyte | RID5076 | ✅ |
| Subchondrale Zysten | subchondral cyst | – (local) | 🟡 |
| Subchondrale Sklerose | subchondral sclerosis | – (local) | 🟡 |
| Freikörper | intraarticular osseous body | RID5367 | ✅ |
| Gelenkserguss | effusion | RID4872 | ✅ |
| Baker-Zyste | Baker cyst | RID3892 | ✅ |
| Weichteilverkalkungen | soft tissue calcification | – (local) | 🟡 |
| Chondrokalzinose | chondrocalcinosis | RID5398 | ✅ |

> Subchondrale Zyste/Sklerose haben in RadLex kein vorkombiniertes Konzept
> (nur „cyst" RID3890 / „sclerosis" RID5227 + „subchondral bone" RID6120 separat)
> → bewusst `local`.

## Knochenstruktur

| Feld | RadLex-Term (`data-en`) | RID | Status |
|---|---|---|---|
| altersentsprechend | age-appropriate bone density | – (local) | 🟡 |
| osteopen | osteopenia | RID5388 | ✅ |
| osteoporotisch | osteoporosis | RID5389 | ✅ |

## Verlauf (Voruntersuchung)

| Feld | RadLex-Term (`data-en`) | RID | Status |
|---|---|---|---|
| weitgehend stabil | unchanged | RID39268 | ✅ |
| Befundprogredienz | disease progression | RID29041 | ✅ |
| Befundregredienz | improved | RID39105 | ✅ |

## FHIR-Kodierung

| Ressource | Code | System |
|---|---|---|
| DiagnosticReport | 24650-4 | http://loinc.org |
| Observations (RadLex) | RID* | http://radlex.org |
| Achsenmessungen (LOINC) | LP* | http://loinc.org |


## Attestierung / dataAbsentReason (v1.7, SPEC-ADDENDUM-A)

Die KI-Messfelder tragen eine feldgebundene Attestierungs-Extension
(`http://hjk.wien/fhir/StructureDefinition/ai-attestation`). Bei Ablehnung
(`active-rejected`) wird die Observation **ohne** `value[x]` mit `dataAbsentReason`
über eine lokale CodeSystem-URI gefuehrt:

| CodeSystem | Code | Bedeutung |
|---|---|---|
| `…/measurement-absent-reason` | `insufficient-acquisition` | unzureichende Ganzbeinaufnahme |
| `…/measurement-absent-reason` | `rotation-malposition` | Rotationsfehlstellung |
| `…/measurement-absent-reason` | `calibration-missing` | Kalibrationskugel nicht erkennbar |
| `…/measurement-absent-reason` | `incomplete-imaging` | unvollständige Abbildung |

> **Provisorisch (Addendum A12):** lokale Erweiterung vs. FHIR-Standard
> `dataAbsentReason` (`unknown`/`not-applicable`/`error`) bei Implementierung
> entscheiden. Ohne gewaehlten Grund faellt der Export auf HL7 `unknown` zurueck.
