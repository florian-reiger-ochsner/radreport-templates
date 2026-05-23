# RadLex-Mapping – Template Planungsröntgen Knie vor TEP v1.3

Diese Tabelle dokumentiert den **tatsächlichen Codierungsstand** jedes Konzepts im Template. Sie ist Grundlage für die Nachpflege gegen den RadLex Term Browser (https://radlex.org/) vor v1.4.

## Legende

| Status | Bedeutung |
|---|---|
| ✅ **verified** | RID stammt aus der RSNA RadLex Core Ontology, manuell verifiziert |
| ⚠️ **assumed** | RID ist plausibel und in Sekundärliteratur dokumentiert, aber nicht primär gegen radlex.org verifiziert |
| 🟡 **local** | Kein passender RadLex-Term bekannt → lokales CodeSystem `http://hjk.local/CodeSystem/vinzenz-radiologie` |
| ❌ **needs-mapping** | Leerwert / Negation, eigenständiges Konzept (noch) nicht codiert |

## Anatomie / Body Site

| Konzept | RID | Status | Quelle |
|---|---|---|---|
| Knee (joint) | RID2472 | ✅ verified | RadLex Core Ontology, stabil seit ≥ v3 |
| Left | RID5824 | ✅ verified | RadLex laterality terms |
| Right | RID5825 | ✅ verified | RadLex laterality terms |

## Modality / Procedure

| Konzept | Code | System | Status |
|---|---|---|---|
| Conventional radiography (DX) | – | DICOM modality | – |
| Knee X-ray | RPID218 | RadLex Playbook (jetzt LOINC) | ⚠️ assumed – gegen aktuelle Playbook-Version prüfen |
| Knee X-ray, preoperative | 36572-4 | LOINC | ⚠️ assumed – verifizieren |
| Radiology category | LP29684-5 | LOINC | ✅ verified |

## Technik / Projektionen

| Konzept | RID | Status | Anmerkung |
|---|---|---|---|
| Anteroposterior projection | RID10395 | ⚠️ assumed | gegen RadLex-Browser verifizieren |
| Lateral projection | RID10412 | ⚠️ assumed | gegen RadLex-Browser verifizieren |
| Patella tangential view | – | 🟡 local | kein gefundener RadLex-Term |
| Long leg standing radiograph | – | 🟡 local | kein gefundener RadLex-Term |
| Rosenberg view (PA 45° flexion) | – | 🟡 local | kein gefundener RadLex-Term |
| Calibration sphere | – | 🟡 local | kein gefundener RadLex-Term |

## Messungen / Winkel

| Konzept | Code | System | Status |
|---|---|---|---|
| Hip-knee-ankle angle (HKA) | LP410789-0 | LOINC | ⚠️ assumed – verifizieren |
| Leg length discrepancy | LP35279-5 | LOINC | ⚠️ assumed – verifizieren |
| Kellgren-Lawrence score | LP410785-8 | LOINC | ⚠️ assumed – verifizieren |
| Mechanical axis deviation (MAD) | MAD | local | 🟡 |
| mLDFA | mLDFA | local | 🟡 |
| mMPTA | mMPTA | local | 🟡 |
| JLCA | JLCA | local | 🟡 |
| Posterior tibial slope | tibial-slope | local | 🟡 |

## Diagnostische Konzepte / Befunde

| Konzept | RID | Status |
|---|---|---|
| Osteophyte | RID4757 | ⚠️ assumed – gegen RadLex-Browser verifizieren |
| Joint effusion | RID34769 | ⚠️ assumed – gegen RadLex-Browser verifizieren |
| Osteoporosis | RID3406 | ⚠️ assumed – gegen RadLex-Browser verifizieren |
| No osteoarthritis (KL 0) | RID5352 | ⚠️ assumed – gegen RadLex-Browser verifizieren |
| Subchondral cyst | – | 🟡 local |
| Subchondral sclerosis | – | 🟡 local |
| Intraarticular loose body | – | 🟡 local |
| Baker cyst | – | 🟡 local |
| Soft tissue calcification | – | 🟡 local |
| Chondrocalcinosis | – | 🟡 local |

## Klassifikationen

| Konzept | Status | Anmerkung |
|---|---|---|
| Kellgren-Lawrence Grade 1–4 | 🟡 local | keine RIDs gefunden – `kl-{kompartiment}-grade-{n}` |
| CPAK Typ I–IX (MacDessi 2021) | 🟡 local | keine RIDs – `CPAK` als String-Observation mit aHKA/JLO als Components |
| Insall-Salvati (Patella alta/baja/normal) | 🟡 local | – |
| Caton-Deschamps (Patella alta/baja/normal) | 🟡 local | – |
| Dejour Typ A–D (Trochleadysplasie) | 🟡 local | – |
| Patella-Tilt (normal/lateralisiert/medialisiert) | 🟡 local | – |

## Verlauf

| Konzept | RID | Status |
|---|---|---|
| Stable | RID39157 | ⚠️ assumed |
| Progression of disease | RID36043 | ⚠️ assumed |
| Regression of disease | RID36044 | ⚠️ assumed |

---

## To-Do für v1.4

1. Alle ⚠️ **assumed**-RIDs einzeln gegen https://radlex.org/ (Term Browser) verifizieren
2. Falsche RIDs durch tatsächlich gültige ersetzen ODER auf 🟡 local zurückstufen
3. Klassifikationen mit fehlenden RIDs: Issue im RSNA-Tracker einreichen (KL-Grade 1–4, Dejour-Typen sind klinisch etabliert genug, um einen Mapping-Antrag zu rechtfertigen)
4. SNOMED-CT-Mapping für die Hauptdiagnose (Gonarthrose) ergänzen: SNOMED `239872002` (Osteoarthritis of knee) – im FHIR-Bundle als zusätzliche Condition-Resource sinnvoll
5. Anschlussarbeit für andere Templates (LWS, ISG, Hand-Rheuma): gleicher Aufbau, gleiche Statuskennzeichnung

## Methodischer Hinweis

Die Statuskennzeichnung `assumed` ist nicht "produktionsreif" im strengen Sinn – sie ist aber besser als das Wegmappen auf `local`, weil sie eine **explizite Hypothese** dokumentiert, die in einer Stunde am RadLex-Browser systematisch geprüft werden kann. Lieber ehrlich kennzeichnen als sauber wirkende, aber falsche Codes ausliefern.
