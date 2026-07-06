# RadLex-Mapping – Röntgen Thorax a.p. liegend / Intensiv

Vollständige RID-Tabelle für alle kodierten Felder in `template.html`.

Status-Legende:
- ✅ Verifiziert – offizieller RadLex-Term, RID geprüft
- 🟡 Lokal – plausibler Code, noch nicht formal geprüft
- 🔲 Ausstehend / lokal – kein RID vergeben (`data-radlex-status="local"`)

Liegend-spezifische **Zeichen** (deep sulcus sign, apikale Kappe, flächige
Verschleierung, „bat-wing") sind als radiographische Zeichen des jeweiligen
**Grundkonzepts** kodiert – der Code bleibt registry-verbatim (z. B. Pneumothorax
RID5352), die Zeichenbeschreibung sitzt ausschließlich im angezeigten Label. Es
wird kein RID geraten.

---

## Region-Anker (Tri-State-Attestierung)

| Region (id) | RadLex-Term (EN) | RID | Status |
|---|---|---|---|
| Lage-/Device-Kontrolle (`rg-devices`) | support and monitoring devices | — (`local`) | 🔲 |
| Lunge / Parenchym & Stauung (`rg-lunge`) | lung | RID1301 | 🟡 |
| Pleura (`rg-pleura`) | pleura | RID5350 | 🟡 |
| Herz / Mediastinum (`rg-herzmediastinum`) | heart and mediastinum | RID1385 | 🟡 |
| Skelett / Weichteile (`rg-skelett`) | osseous structures and soft tissue | RID13573 | 🟡 |
| DiagnosticReport (RadLex-Sekundärcode) | chest radiograph | RID10211 | 🟡 |

## Technik

| Feld | Term (EN) | RID | Status |
|---|---|---|---|
| Aufnahmequalität (`qual`) | image quality | RID13882 | 🟡 |

## Lunge / Parenchym & Stauung

| Angezeigtes Label | RadLex-Term (EN) | RID | Status |
|---|---|---|---|
| Pulmonale Stauung / Lungenödem (`lunge_stau`, alle Grade) | pulmonary vascular congestion | RID5056 | ✅ |
| Konsolidierung | consolidation | RID4803 | ✅ |
| Flächige Transparenzminderung / Infiltrat | opacity | RID28530 | ✅ |
| Lobuläre / segmentale Verschattung | lobular consolidation | RID4804 | 🟡 |
| Diffuse bilaterale Verschattung (ARDS-Muster) | opacity | RID28530 | 🟡 (ARDS als lokale Interpretation auf `opacity`) |
| Milchglastrübung (Ground-Glass-Opacity) | ground-glass opacity | RID4800 | ✅ |
| Atelektase | atelectasis | RID28493 | ✅ |
| Dys-/Plattenatelektase (basal) | atelectasis | RID28493 | 🟡 (Sub-Ausprägung auf `atelectasis`) |
| Lungenemphysem | pulmonary emphysema | RID4799 | ✅ |
| Überblähung / Air Trapping | air trapping | RID5050 | ✅ |
| Solitärer Rundherd | solitary pulmonary nodule | RID4941 | ✅ |
| Multiple Rundherde | multiple pulmonary nodules | RID5231 | ✅ |
| Kaverne / Herdschatten mit Kaverne | cavitary lesion | RID5234 | 🟡 |

## Pleura (Liegend-Zeichen)

| Angezeigtes Label | RadLex-Term (EN) | RID | Status |
|---|---|---|---|
| Erguss – alle Liegend-Graduierungen (`pl_erguss`, `pl_erg_re/li`) | pleural effusion | RID4872 | ✅ (Zeichen im Label, Code = Grundkonzept) |
| Pneumothorax – alle Liegend-Graduierungen (`pl_ptx`, `pl_ptx_re/li`) | pneumothorax | RID5352 | ✅ (deep sulcus sign etc. im Label) |
| Schwarte/Verdickung | pleural thickening | RID5355 | ✅ |
| Pleurakalk | pleural calcification | RID5356 | ✅ |
| Pleuratumor/RF | pleural mass | RID34948 | 🟡 |

## Herz / Mediastinum (keine CTR)

| Angezeigtes Label | RadLex-Term (EN) | RID | Status |
|---|---|---|---|
| Herzsilhouette – „nicht sicher vergrößert (liegend)" | cardiac size not assessable supine | RID1786 (`data-en` abweichend) | 🟡 |
| Herzsilhouette – „orientierend verbreitert" | cardiomegaly | RID1786 | ✅ |
| Gefäßstiel verbreitert (`gefstiel`) | vascular pedicle width | — (`local`) | 🔲 |
| Obere Einflussstauung/-umverteilung (`vcs_stau`) | pulmonary vascular congestion | RID5056 | ✅ |
| Mediastinum verbreitert | mediastinal widening | RID34952 | ✅ |
| Mediastinale Raumforderung | mediastinal mass | RID4961 | ✅ |
| Trachealdeviation | tracheal deviation | RID5347 | ✅ |
| Shift kontralateral | mediastinal shift | RID34952 | 🟡 (auf `mediastinal widening`-Code) |
| Hili vergrößert | hilar enlargement | RID5080 | ✅ |
| Hili verschattet (Stauung) | hilar opacity | RID5082 | 🟡 |

## Skelett / Weichteile

| Angezeigtes Label | RadLex-Term (EN) | RID | Status |
|---|---|---|---|
| Degenerativ WS | degenerative changes spine | RID5222 | ✅ |
| Wirbelkörperfraktur / Sinterung | vertebral compression fracture | RID34669 | 🟡 (gegen RadLex-Browser zu prüfen) |
| Rippenfraktur | rib fracture | RID5232 | ✅ |
| Sternumfraktur | sternal fracture | RID5233 | 🟡 |
| Ossäre Destruktion / V.a. Metastase | osseous destruction | RID5238 | ✅ |
| Kyphoskoliose | kyphoscoliosis | RID5241 | ✅ |
| St.p. Sternotomie | status post sternotomy | RID49557 | 🟡 |
| Weichteilemphysem | subcutaneous emphysema | RID5204 | ✅ |
| Weichteilverdichtung/RF | soft tissue mass | RID5206 | 🟡 |
| St.p. Mastektomie re. | status post mastectomy right | RID49560 | 🟡 |
| St.p. Mastektomie li. | status post mastectomy left | RID49560 | 🟡 |

## Devices (Lage-/Device-Kontrolle)

| Device-Typ | RadLex-Term (EN) | RID | Status |
|---|---|---|---|
| Endotrachealtubus (ETT) | endotracheal tube | RID49620 | 🟡 |
| Tracheostoma-Kanüle | tracheostomy tube | RID49621 | 🟡 |
| Magensonde (MS) | nasogastric tube | RID49630 | 🟡 |
| Jejunalsonde | jejunal tube | RID49631 | 🟡 |
| Ernährungssonde (PEG) | PEG tube | RID49632 | 🟡 |
| ZVK (alle Zugangswege) | central venous catheter | RID49600 | 🟡 |
| Port-Katheter | port catheter | RID49601 | 🟡 |
| Dialysekatheter | dialysis catheter | RID49602 | 🟡 |
| PICC-Line | PICC line | RID49603 | 🟡 |
| Arterienkatheter | arterial catheter | RID49604 | 🟡 |
| IABP | intra-aortic balloon pump | RID49605 | 🟡 |
| Impella / VAD | ventricular assist device | RID49606 | 🟡 |
| Schrittmacher (SM) | cardiac pacemaker | RID49610 | 🟡 |
| ICD | implantable cardioverter defibrillator | RID49611 | 🟡 |
| CRT-D | cardiac resynchronization therapy | RID49612 | 🟡 |
| Loop-Recorder | implantable loop recorder | RID49613 | 🟡 |
| Thoraxdrainage re. | chest tube right | RID49640 | 🟡 |
| Thoraxdrainage li. | chest tube left | RID49640 | 🟡 |
| Perikarddrainage | pericardial drain | RID49641 | 🟡 |
| Sonstige / Fremdmaterial | foreign body / device | RID49699 | 🟡 |

## Vergleich

| Feld | Term (EN) | RID | Status |
|---|---|---|---|
| Verlaufsbeurteilung (`vgl_verlauf`) | interval change | RID49820 | 🟡 |

## FHIR-Kodierung

| Ressource | Code | System |
|---|---|---|
| DiagnosticReport (Default) | 36589-0 (Portable XR Chest AP single view) | http://loinc.org |
| DiagnosticReport (RadLex-Sekundär) | RID10211 (chest radiograph) | http://radlex.org |
| Observations (alle) | RID* | http://radlex.org |
| Bundle meta tag | radlex-coded | http://hjk.wien/fhir/CodeSystem/radiology-templates |

---

*Template HJK-MRRT-ROE-THORAX-LIEGEND-v1.0 · Stand 2026-07-06*

> Die 🟡/🔲-Codes der Device-Gruppe, der Region-Anker und der lokalen Felder
> (`gefstiel`, `rg-devices`, supine cardiac size) sind gegen den RadLex-Browser zu
> verifizieren bzw. bei Registrierung eines belegten Codes zu ergänzen. „Kein RID
> raten" – lokale Felder bleiben `local`, bis der Code registry-verbatim belegt ist.
