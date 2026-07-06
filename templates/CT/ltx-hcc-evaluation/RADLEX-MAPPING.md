# RadLex-Mapping – LTx-Evaluation HCC

Status: ✅ verifiziert · 🟡 lokal/plausibel · 🔲 ausstehend

Dieses Template ist §16-TPG-/Mailand-spezifisch. Viele Felder sind Workflow-
oder Compliance-Status-Angaben, für die kein eigenständiges RadLex-Konzept
existiert; sie sind bewusst `local`/`needs-mapping` gehalten (kein RID geraten,
siehe CLAUDE.md §2).

## Quantitative Messfelder

| Feld | RadLex-Term | RID | LOINC | Status |
|---|---|---|---|---|
| Knoten-Durchmesser (1–3) | lesion size | RID13432 | 21889-1 | ✅ |
| Anzahl HCC-Knoten | number of tumor nodules | – | – | 🔲 local |

## Tumorlast / Mailand-Eingänge

| Feld | RadLex-Term (data-en) | RID-Kandidat | Status |
|---|---|---|---|
| Extrahepatische Manifestation | extrahepatic metastasis | RID29896 (unbestätigt) | 🔲 local |
| Makrovaskuläre Invasion | macrovascular invasion | RID3987 (unbestätigt, vgl. LI-RADS-Paket) | 🔲 local |

> Hinweis: Im abgelösten LI-RADS-Quelltemplate trug „Extrahepatische
> Manifestation" `data-radlex-id="RID29896"`. RID29896 ist dort jedoch
> zugleich für „Mosaikmuster" vergeben (widersprüchlich). Deshalb hier **nicht**
> übernommen, sondern als `local` geführt bis registry-verbatim bestätigt.

## Meldungs-/Diagnosestatus (§16-TPG-Workflow)

| Feld | data-en | Status |
|---|---|---|
| Meldungstyp Initiales HCC | initial HCC listing | 🔲 local |
| Meldungstyp Verlaufsbericht | follow-up report listed patient | 🔲 local |
| HCC gesichert | hepatocellular carcinoma confirmed | 🔲 local |
| Leberzirrhose histologisch gesichert | cirrhosis histologically confirmed | 🔲 local |
| Modalität / Zweitverfahren (CT/MRT/US) | computed tomography / magnetic resonance imaging / ultrasound | 🔲 local |

## Verlaufs-Trend (Voruntersuchung)

| Wert | RadLex-Term | RID | Status |
|---|---|---|---|
| weitgehend stabil | stable | RID39157 | ✅ |
| Befundprogredienz | progression of disease | RID36043 | ✅ |
| Befundregredienz | regression of disease | RID36044 | ✅ |

## FHIR-Kodierung

| Ressource | Code | System |
|---|---|---|
| Knoten-Durchmesser Observation | RID13432 | http://radlex.org |
| Knoten-Durchmesser Observation | 21889-1 | http://loinc.org |
| Bundle meta tag | HJK-MRRT-LTX-HCC-EVAL-v1.0 | http://hjk.wien/fhir/CodeSystem/radiology-templates |

## Offene Punkte (vor Statuswechsel pilot → freigegeben)

- RID für „extrahepatic metastasis" registry-verbatim verifizieren.
- RID für „macrovascular invasion" / „vascular invasion" (Kandidat RID3987)
  registry-verbatim verifizieren; im LI-RADS-Paket inkonsistent belegt.
- Modalitäts-RIDs (CT/MRT/US) verifizieren, falls kodiert werden soll.
- LOINC für „number of tumor nodules" prüfen.

## Normative Referenz

Mazzaferro V et al. NEJM 1996; 334: 693-699 (Mailand-Kriterien).
§16-TPG-Richtlinie, Bundesärztekammer.
DRG-Template gen_ltx_hcc.html (Pinto dos Santos et al. 2017, CC BY 4.0).

---

*Generiert: 2026-07-06 · Template HJK-MRRT-LTX-HCC-EVAL-v1.0*
