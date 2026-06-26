# RadLex-Mapping – Röntgen Thorax

Verifizierungsstatus:
- ✅ Verifiziert – offizieller RadLex-Term (v3.7 OWL), RID bestätigt
- 🟡 Plausibel – RID bekannt, Term-Formulierung oder Qualifier abweichend
- 🔲 Ausstehend – manuell gegen radlex.org/RID prüfen
- ⚠ Kein data-radlex – Feld noch nicht kodiert

---

## Pleura

| Deutsch | RadLex-Term (EN) | RID | Status | Anmerkung |
|---|---|---|---|---|
| Pleuraerguss | pleural effusion | RID4872 | ✅ | |
| Pneumothorax | pneumothorax | RID5352 | ✅ | |
| Pleuraschwarte / -verdickung | pleural thickening | RID5355 | ✅ | |
| Pleurakalk | pleural calcification | RID5356 | ✅ | |
| Pleuratumor / Raumforderung | pleural mass | RID34948 | ✅ | |

## Herz

| Deutsch | RadLex-Term (EN) | RID | Status | Anmerkung |
|---|---|---|---|---|
| Herzgröße (allgemein) | cardiac size | RID1786 | 🔲 | manuell gegen radlex.org prüfen |
| Linksbetonte Konfiguration | left heart enlargement | RID5069 | ✅ | |
| Rechtsbetonte Konfiguration | right heart enlargement | RID5070 | ✅ | |
| Mitralform | mitral configuration | RID5072 | 🟡 | offizieller Term "mitral heart configuration" – data-en passt |
| Aortenform | aortic configuration | RID5073 | 🟡 | analog RID5072 |

## Mediastinum / Hili

| Deutsch | RadLex-Term (EN) | RID | Status | Anmerkung |
|---|---|---|---|---|
| Mediastinale Verbreiterung | mediastinal widening | RID34952 | ✅ | |
| Mediastinale Raumforderung | mediastinal mass | RID4961 | ✅ | |
| Trachealdeviation | tracheal deviation | RID5347 | ✅ | |
| Hilusvergrößerung | hilar enlargement | RID5080 | ✅ | |
| Hilusverschwommene Kontur | hilar opacity | RID5082 | 🟡 | manche OWL-Versionen "hilar haziness" – inhaltlich identisch |

## Aorta

| Deutsch | RadLex-Term (EN) | RID | Status | Anmerkung |
|---|---|---|---|---|
| Aortenkalzifikation / elongiert | aortic calcification | RID5090 | ✅ | |
| Aortenerweiterung | aortic dilatation | RID5091 | ✅ | |

## Zwerchfell

| Deutsch | RadLex-Term (EN) | RID | Status | Anmerkung |
|---|---|---|---|---|
| Zwerchfell (anatomisch) | diaphragm | RID1303 | 🟡 | RID1303 = anatomischer Term; "normal" ist Qualifier, kein eigener RID |
| Zwerchfellhochstand | elevated hemidiaphragm | RID5310 | ✅ | Seitenqualifier (re./li.) als data-en Ergänzung korrekt |
| Sinusverlegung | costophrenic angle blunting | RID5312 | ✅ | Seitenqualifier als data-en Ergänzung korrekt |

## Skelett

| Deutsch | RadLex-Term (EN) | RID | Status | Anmerkung |
|---|---|---|---|---|
| Wirbelsäule degenerativ | degenerative changes spine | RID5222 | ✅ | |
| Rippenfraktur | rib fracture | RID5232 | ✅ | |
| Sternumfraktur | sternal fracture | RID5233 | 🟡 | RID existiert; Label in verschiedenen OWL-Versionen leicht abweichend |
| Wirbelkörperfraktur (Kompression) | vertebral compression fracture | RID34669 | ✅ | |
| Ossäre Destruktion | osseous destruction | RID5238 | ✅ | |
| Kyphoskoliose | kyphoscoliosis | RID5241 | ✅ | |
| St.p. Sternotomie | status post sternotomy | RID49557 | 🟡 | RID49xxx = repo-intern; kein offizieller RadLex-RID – Ersatz-RID prüfen |

## Weichteile

| Deutsch | RadLex-Term (EN) | RID | Status | Anmerkung |
|---|---|---|---|---|
| Weichteilemphysem | subcutaneous emphysema | RID5204 | ✅ | |
| Weichteilverdichtung / Raumforderung | soft tissue mass | RID5206 | 🟡 | data-en korrekt; Thoraxwand-Spezifizierung ist Freitext |
| St.p. Mastektomie | status post mastectomy | RID49560 | 🟡 | RID49xxx = repo-intern; kein offizieller RadLex-RID |

## Verlauf

| Deutsch | RadLex-Term (EN) | RID | Status | Anmerkung |
|---|---|---|---|---|
| Verlaufsbeurteilung | interval change | RID49820 | 🔲 | manuell prüfen |

## Technik (nicht kodiert – Freitextfelder)

| Feld | Anmerkung |
|---|---|
| Aufnahmequalität (gut/eingeschränkt) | ⚠ data-radlex fehlt – RID13882 "image quality" möglich |
| Fragestellung (Verlauf, Pneumonie etc.) | ⚠ klinische Indikation – RadLex-Kodierung optional |

## Offene Punkte

- **RID1786** (cardiac size): manuell auf radlex.org/RID1786 prüfen
- **RID13882** (image quality): manuell auf radlex.org/RID13882 prüfen  
- **RID49820** (interval change): manuell auf radlex.org/RID49820 prüfen
- **RID49557/49560** (St.p. Sternotomie/Mastektomie): offizielle RIDs für "status post"-Terme suchen
- Aufnahmequalitäts-Select: `data-radlex="RID13882"` und `data-en="image quality"` ergänzen

## FHIR-Kodierung

| Ressource | Code | System |
|---|---|---|
| DiagnosticReport | 24627-2 | http://loinc.org |
| Observations (alle) | RID* | http://radlex.org |
| Bundle meta tag | HJK-MRRT-ROE-THORAX-v2.1 | http://hjk.wien/fhir/CodeSystem/radiology-templates |

---

*Geprüft: 2026-06-26 · Template HJK-MRRT-ROE-THORAX-v2.1 · 32 kodierte Felder*
