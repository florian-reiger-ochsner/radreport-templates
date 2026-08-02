# Changelog – CT Abdomen + Becken

## [LOINC-Korrektur] - 2026-08-02
### Korrigiert (LOINC gegen loinc.org verifiziert, "nie raten")
- Geratene/ungueltige LOINC-Codes entfernt: 30652-8 (auf loinc.org leer/unbelegt).
- Betroffene Felder auf lokales CodeSystem (`http://hjk.wien/fhir/CodeSystem/radiology-templates`) + `data-en` zurueckgefuehrt; `loinc-codes` in frontmatter geleert. Verifizierte LOINC-Codes bei Bedarf via resolve-loinc.js gegen fhir.loinc.org nachtragen.

## [2.1] – 2026-07-21
### Korrigiert (RadLex-Kodierung – Registry-verifiziert gegen NCBO BioPortal)
- **Gesamte RadLex-Kodierung neu belegt** (Rebuild 7/8, umfangreichstes Template, 202 Konzepte).
  Fast alle bisherigen RIDs trafen Fremdkonzepte (RID5104 „focal steatosis" = migrated disc extrusion,
  RID5131 „acute pancreatitis" = Cockayne-Syndrom, RID5181 „AAA" = dysbaric osteonecrosis).
- **98 Felder registry-verifiziert** über alle Organe: Leber (HCC RID4271, cholangiocarcinoma RID4266,
  cirrhosis RID3822, steatosis RID5217, hepatomegaly RID34593), Galle (cholelithiasis RID4990,
  choledocholithiasis RID4992), Pankreas (IPMN RID4157, MCN RID4164, pancreatitis RID3529, pNET RID4483),
  Niere/NN (renal cyst RID35811, angiomyolipoma RID4343, pyelonephritis RID3547, adrenal adenoma RID4214),
  Darm (appendicitis RID3383, diverticulitis RID3409, obstruction RID4962), Gefäße (aortic dissection RID3320,
  portal hypertension RID34614), Kontrastmittel (iohexol/iomeprol/iopromide/iodixanol), Phasen, RECIST-Response.
- **Hybrid-Oberbegriffe** wo kein exaktes Konzept (mass RID3874, metastasis RID5231, cyst RID3890,
  hemangioma RID3969, carcinoma RID4247, thickening RID28509, ascites RID1541, lymphadenopathy RID3798).
- **80 Werte/Normalbefunde/RECIST-Felder auf `local`**.
- `RADLEX-MAPPING.md` neu generiert. Feld-`id`s unverändert.

## [2.0] – 2026-07-06
### Geändert – Umstellung auf A-Struktur (Breaking)
- `template.html` ist jetzt **kanonisch nacktes MRRT**: kein `<style>`, kein `<script>`, kein Stylesheet-Link. Reines kodiertes Eingabeformular mit `rr-*`-Struktur-Hooks.
- Gesamtes Viewer-Chrome (Organ-Navigation, Live-Vorschau, Ampel-Status, Textbausteine, FHIR-Export, Buttons) nach `demo/ct-abdomen/demo.js` verlagert, zur Laufzeit erzeugt. Demo via `build-demo.js` abgeleitet.
- **Modiswitch (3 Kontexte allg/notfall/onko) aufgelöst.** Notfall-Checkliste und onkologischer Kontext/RECIST sind nun optionale, immer zugängliche `<details>`-Sektionen; Basis ist die Organsystematik. Textbausteine und Ampel schalten inhaltsgetrieben (Notfall-Positiva bzw. RECIST-Daten) statt über einen Modus.
- RECIST-Zielläsionen deklarativ als 5 statische Zeilen im kanonischen Template (SLD-Summe berechnet demo.js); Notfall-Items deklarativ & kodiert (zuvor JS-generiert).

### Kodierung
- `data-en` (englischer RadLex-Term) auf **allen** Optionen/Feldern ergänzt (zuvor 39/116).
- Ungültige Pseudo-RIDs (Suffixe `-norm`/`-neg`/`-li`) entfernt und als `data-radlex-status="local"` geführt (kein RID-Raten); Lateralitäts-Varianten teilen den Basis-RID. Quantitative RECIST-Felder am Input kodiert.

### Behoben
- Textbaustein-Bugs der v1.0: `buildBefund` las nicht existente IDs (`milz_par`, `gef_ao_*`, `gef_pf_*`, `peri_bef`, `becken_gynae`). Bausteine jetzt konsistent mit dem kanonischen Markup (Checkbox-/Select-Felder).

### Entfällt
- `template.source.html` (B-Struktur-Artefakt) entfernt.

## [1.0] – 2026-06-08
### Initial
- Drei Kontexte: Onkologisches Staging/RECIST, Akutes Abdomen, Allgemein
- RECIST 1.1: dynamische Zielläsions-Tabelle (max. 5), automatische SLD-Summe
- Notfall-Checkliste: 8 Punkte mit ⚠/✓/n.b.-Toggle, Alert-Badge bei positivem Befund
- 11 Organ-Tabs mit RadLex-kodierten Selects
- Alle KM-Phasen als Toggle-Chips kombinierbar
- Vergleichsuntersuchung und Zufallsbefunde (kollabierbar)
- Beurteilungsvorschlag kontextspezifisch (RECIST-Text, Notfall-Positiv-Text, allgemein)
- FHIR-Bundle R4 (LOINC 30652-8), Notfall-Observations mit `interpretation: Abnormal`
