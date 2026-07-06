# RadLex-Mapping – CT Abdomen + Becken (v2.0)

Status: ✅ verifiziert · 🟡 lokal/plausibel · 🔲 ausstehend

**Kodierpolitik (A-Struktur):** Jede Option trägt `data-en` (englischer RadLex-Term).
`data-radlex` nur mit einem sauberen RID (`RIDxxxx`, ohne Suffix). Nicht
registry-verifizierte Konzepte werden als `data-radlex-status="local"` geführt –
**kein RID-Raten**. Normal-/Negativ-Zustände, Technik-Parameter, Markennamen,
Lateralitäts-Varianten und quantitative RECIST-Messfelder sind bewusst `local`,
bis der Code registry-verbatim belegt ist.

## Verifizierte / plausible Konzept-RIDs

| Befund | RadLex-Term | RID | Status |
|---|---|---|---|
| Leberparenchym | liver parenchyma | RID1240 | ✅ |
| Steatose | hepatic steatosis | RID5097 | ✅ |
| Zirrhose | cirrhosis | RID5098 | ✅ |
| Fokale Leberläsion | focal liver lesion | RID1248 | ✅ |
| Lebermetastase | liver metastasis | RID5105 | ✅ |
| HCC | hepatocellular carcinoma | RID5106 | ✅ |
| Intrahepatische Gallenwege dilatiert | intrahepatic biliary dilatation | RID5108 | ✅ |
| Cholelithiasis | cholelithiasis | RID5120 | ✅ |
| Akute Cholezystitis | acute cholecystitis | RID5121 | ✅ |
| Pankreaskarzinom | pancreatic ductal carcinoma | RID5134 | ✅ |
| NET | pancreatic neuroendocrine tumor | RID5135 | ✅ |
| IPMN | intraductal papillary mucinous neoplasm | RID5136 | ✅ |
| Pseudozyste | pancreatic pseudocyst | RID5138 | ✅ |
| Akute Pankreatitis | acute pancreatitis | RID5131 | ✅ |
| Retroperitoneale LK | retroperitoneal lymph nodes | RID1448 | ✅ |
| Lymphadenopathie retroperitoneal | retroperitoneal lymphadenopathy | RID5190 | ✅ |
| Peritonealkarzinose | peritoneal carcinomatosis | RID5200 | ✅ |
| Pneumoperitoneum | pneumoperitoneum | RID5202 | ✅ |
| Aszites | ascites | RID1461 | ✅ |
| Hydronephrose | hydronephrosis | RID5153 | 🟡 |
| Nephrolithiasis | nephrolithiasis | RID5154 | 🟡 |
| Nierenzellkarzinom | renal cell carcinoma | RID5151 | 🟡 |
| Splenomegalie | splenomegaly | RID5140 | 🟡 |
| Bauchaortenaneurysma | abdominal aortic aneurysm | RID5181 | 🟡 |
| Pfortaderthrombose | portal vein thrombosis | RID5183 | 🟡 |
| Divertikulitis | diverticulitis | RID5171 | 🟡 |
| Appendizitis | appendicitis | RID5173 | 🟡 |

> Die RID5xxx-Codes dieses Templates stammen aus der v1.0-Kuratierung und sind
> als 🟡 zu behandeln, solange nicht einzeln gegen die RadLex-Registry
> verifiziert. Anzeige-Label ↔ `data-en` wurde in v2.0 abgeglichen.

## Bewusst lokal geführt (`data-radlex-status="local"`)

| Gruppe | Beispiele | Grund |
|---|---|---|
| Normal-/Negativ-Zustände | „unauffällig", „nicht dilatiert", „kein Aszites", „keine fokale Läsion" | Negation/Normalbefund ist kein eigener RID (vormals ungültige `-norm`/`-neg`-Suffixe) |
| Technik-Parameter | Schichtdicke 5/3/1 mm, Rekonstruktion axial/MPR, Qualitätsstufen | keine belegten RIDs; am Container `RID498xx` |
| KM-Markennamen | Ultravist 370, Imeron 400, Omnipaque 350 … | Produktnamen; `data-en` = Wirkstoff |
| Lateralität | Adenom re./li. (RID5156), Adnex-RF re./li. (RID5214), Leistenhernie re./li. (RID5226) | Seite ist kein RID-Axis; re./li. teilen den Basis-RID |
| Tumorentitäten (Onko-Kontext) | Colon-/Rektum-/Magen-/Pankreaskarzinom … | Freitext-nahe Entitätsauswahl |
| RECIST-Messfelder | LA/KA (mm), Verlauf neu/stabil/regredient/progredient | quantitativ am Input; Ansprechen (CR/PR/SD/PD) bleibt RID498xx |
| Nicht-Zielläsionen | stabil/rückläufig/progredient/neu | kein belegter RID |

## RECIST (Ansprechen)

| Feld | RadLex-Term | RID | Status |
|---|---|---|---|
| Gesamtansprechen | RECIST overall response | RID49860 | 🟡 |
| Complete Response | complete response | RID49861 | 🟡 |
| Partial Response | partial response | RID49862 | 🟡 |
| Stable Disease | stable disease | RID49863 | 🟡 |
| Progressive Disease | progressive disease | RID49864 | 🟡 |

## FHIR-Kodierung

| Ressource | Code | System |
|---|---|---|
| DiagnosticReport | 30652-8 | http://loinc.org |
| Observations (RadLex) | RIDxxxx | http://radlex.org |
| Observations (local) | local:&lt;en&gt; | http://hjk.wien/fhir/CodeSystem/radiology-templates |
| Notfall-Positiva | + interpretation `A` (Abnormal) | http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation |
