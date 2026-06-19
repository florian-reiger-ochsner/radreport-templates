# RadLex-Mapping – CT Schädel nativ

Jede strukturierte Option im Template trägt `data-radlex` (RID) und `data-en` (englischer RadLex-Term). FHIR-Observations werden mit `system: http://radlex.org` kodiert.

## ⚠ Verifikationsstatus – ehrlich

Die hier gelisteten neuro-spezifischen RIDs sind **provisorisch zugewiesen** und wurden **noch nicht** gegen den offiziellen RadLex-Browser (radlex.org / BioPortal RADLEX) verifiziert. Sie folgen der Repo-Konvention (Basis-RID + ggf. lokaler Suffix wie `-good`, `-lim`), die tatsächlichen Nummern müssen aber vor Produktiveinsatz einzeln geprüft werden. Lokale Suffix-Codes (`RIDxxxx-yyy`) sind bewusste HJK-Erweiterungen, **keine** offiziellen RadLex-IDs.

**Status-Legende:**
`🟢 verifiziert` · `🔵 aus Repo-Bestand übernommen (konsistent, noch zu verifizieren)` · `🟡 zu verifizieren (offline nicht prüfbar)` · `⚪ lokaler HJK-Suffix (kein offizieller RID)`

| Konzept (de) | RID | data-en | Status |
|---|---|---|---|
| CT Schädel (Protokoll) | RID10337 | CT head | 🟡 |
| Bildqualität | RID13882 | image quality | 🟡 |
| Bildqualität – gut/eingeschränkt | RID13882-good / -lim | – | ⚪ |
| Messung (generisch) | RID13173 | measurement | 🟡 |
| Lateralität (Container) | RID5824 | laterality | 🔵 |
| rechts | RID5826 | right | 🔵 |
| links | RID5825 | left | 🔵 |
| beidseits | RID5827 | bilateral | 🔵 |
| **Intrakranielle Blutung** | RID4700 | intracranial hemorrhage | 🟡 |
| Intraparenchymale Blutung (ICB) | RID4701 | intraparenchymal hemorrhage | 🟡 |
| Epidurales Hämatom (EDH) | RID4702 | epidural hematoma | 🟡 |
| Subdurales Hämatom (SDH) | RID4703 | subdural hematoma | 🟡 |
| Intraventrikuläre Blutung (IVB) | RID4705 | intraventricular hemorrhage | 🟡 |
| Subarachnoidalblutung (SAB) | RID4706 | subarachnoid hemorrhage | 🟡 |
| Blutungsalter akut/subakut/chronisch | RID5733 / RID5734 / RID5735 | acute / subacute / chronic | 🟡 |
| **Zerebrale Ischämie** | RID5722 | cerebral ischemia | 🟡 |
| Infarktfrühzeichen | RID5760 | early infarct signs | 🟡 |
| Demarkierter Infarkt / alte Defekte | RID28793 | demarcated/old infarct | 🟡 |
| Gefäßterritorium | RID5798 | vascular territory | 🟡 |
| ACA / ACM / ACP-Territorium | RID5799 / RID5800 / RID5801 | ACA / MCA / PCA territory | 🟡 |
| ASPECTS | RID35795 | ASPECTS | 🟡 |
| Hämorrhagische Transformation | RID4707 | hemorrhagic transformation | 🟡 |
| **Mittellinienverlagerung** | RID5783 | midline shift | 🟡 |
| Herniation (Container) | RID5782 | herniation | 🟡 |
| Subfalzine Herniation | RID5784 | subfalcine herniation | 🟡 |
| Uncusherniation | RID5785 | uncal herniation | 🟡 |
| Basale Zisternen | RID6043 | basal cisterns | 🟡 |
| **Ventrikelsystem** | RID6042 | ventricular system | 🟡 |
| Ventrikel erweitert | RID5811 | dilated ventricles | 🟡 |
| Hydrozephalus | RID4724 | hydrocephalus | 🟡 |
| Äußere Liquorräume | RID6044 | external CSF spaces | 🟡 |
| Hirnparenchym | RID6434 | brain parenchyma | 🟡 |
| Mikroangiopathie / White Matter Disease (Fazekas) | RID35577 | white matter disease | 🟡 |
| Raumforderung | RID3798 | mass | 🟡 |
| Perilesionales Ödem | RID4675 | perilesional edema | 🟡 |
| Schädelfraktur / Kalvaria | RID4760 | skull fracture | 🟡 |
| NNH | RID8595 | paranasal sinuses | 🟡 |
| Weichteile | RID1241 | soft tissue | 🟡 |

## LOINC

| Konzept | LOINC | Status |
|---|---|---|
| CT Head | 30799-1 | 🟡 zu verifizieren |

## Verifikations-Workflow (vor Produktiveinsatz)

1. Jeden 🟡-RID im RadLex-Browser (radlex.org bzw. BioPortal) gegen den deutschen/englischen Term prüfen.
2. Korrekte RID eintragen oder Term anpassen; Status auf 🟢 setzen.
3. 🔵-Lateralitätscodes mit dem Repo-Bestand (z. B. urolithiasis) konsolidieren – einmal zentral verifizieren, dann überall identisch.
4. ⚪-Suffixe als lokale HJK-Granularität dokumentieren; sie bleiben bewusst außerhalb des offiziellen RadLex-Namensraums.
