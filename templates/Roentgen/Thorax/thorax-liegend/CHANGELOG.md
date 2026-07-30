# Changelog – Röntgen Thorax a.p. liegend / Intensiv

Alle nennenswerten Änderungen an diesem Template. Format nach
[Keep a Changelog](https://keepachangelog.com/de/1.0.0/), Versionierung nach
[Semantic Versioning](https://semver.org/lang/de/).

## [1.1] – 2026-07-21
### Korrigiert (RadLex-Kodierung – Registry-verifiziert gegen NCBO BioPortal)
- **Gesamte RadLex-Kodierung neu belegt** (Rebuild 2/8). Der Registry-Audit zeigte, dass
  praktisch alle bisherigen RIDs auf Fremdkonzepte zeigten (ground-glass RID4800 =
  pneumocephalus, CVK RID49600 = injection treatment, Konsolidierung RID4803 = pneumoperitoneum).
- **37 Befund-Felder registry-verifiziert** neu kodiert; Hybrid-Oberbegriffe wo RadLex kein
  exaktes Konzept führt (mass RID3874, thickening RID28509, fracture RID4650, congestion RID4863).
- **11 Felder auf `local` demoted** (Kardiomegalie, Mediastinalshift/-verbreiterung, VAD, PEG,
  Weichteilemphysem, Trachealverlagerung, cardiac size not assessable supine, vascular pedicle width u. a.).
- **Region-Anker korrigiert:** lung RID1301 (war korrekt), pleura RID1362 (war RID5350),
  image quality RID10 (war RID13882); Kombi-Anker (heart and mediastinum, osseous structures
  and soft tissue, cardiac size, interval change) auf `local`, da kein Einzelkonzept.
- `RADLEX-MAPPING.md` neu aus den verifizierten Codes generiert. Konzepte weitgehend
  konsistent mit thorax-standard v2.3. Feld-`id`s unverändert.

## [1.0] – 2026-07-06

### Hinzugefügt – Neues Template (Abspaltung aus `thorax-standard`)

Eigenständiges Template für die **a.p.-Liegend-/Bettaufnahme (ICU / portable chest)**,
abgespalten vom aufrechten `thorax-standard` (HJK-MRRT-ROE-THORAX). Begründung der
Trennung: Der Liegendbefund ist primär eine **Lage-/Device-Kontrolle**, und das
Zeichen-Vokabular der Rückenlage (Erguss/Pneumothorax, keine CTR) weicht so weit ab,
dass ein gemeinsames Template für beide Nutzungen unübersichtlich würde.

- **Lage-/Device-Kontrolle als führende Region** (erste Tri-State-Region, aufgeklappt),
  mit Device-Stack in ICU-Reihenfolge: Atemweg → Sonden → Vaskulär → Kardial →
  Drainage → Sonstige. Je Device: Lage/Spitze + 4-stufige Beurteilung
  (korrekt / kontrollbedürftig / Fehllage / Fehllage dringlich).
- **Liegend-Zeichen-Vokabular Pleura**: Erguss als flächige Verschleierung / apikale
  Kappe / laterale Randlinie; Pneumothorax als tief-anteriorer Randwinkel
  (deep sulcus sign) / scharfe Herz-/Zwerchfellkontur, basal/anteromedial. Je Seite
  graduiert. Spannungspneumothorax löst Notfall-Hinweis aus.
- **Keine CTR-Wertung**: Herz-Region nur orientierende Herzsilhouette
  (a.p. projektionsbedingt vergrößert), plus Gefäßstiel / obere Einflussstauung.
- **Pulmonale Stauung als Leitbefund** in der Lungen-Region (Cephalisation →
  interstitielles Ödem, Kerley-B → alveoläres Ödem, „bat-wing"), RID5056.
- **Parenchym-Stack** an ICU angepasst: ARDS-Muster (diffus bilateral),
  Dys-/Plattenatelektase ergänzt.
- **Additives Attestierungsmodell** (Tri-State-Regionen, 1-Klick-Normalbefund-Makro),
  Multi-Parenchym- und Device-Stack, Voice-Tokens + Voice-Hints-HUD,
  FHIR-Demo-Mapping mit NEG/POS-Verification-Floor.
- **LOINC-Default 36589-0** *Portable XR Chest AP single view* (Overrides: 36572-6
  *XR Chest AP*, 36554-4 *XR Chest Single view*).
- Vollständige RadLex-Kodierung (RID + `data-en`) auf allen Optionen/Checkboxen.
- A-Struktur: kanonisches `template.html` JS-/CSS-frei; Demo abgeleitet via
  `build-demo.js` mit `demo.js`.

### Übernommen aus `thorax-standard` v2.1

Anatomie-Domänen Lunge/Pleura/Herz-Mediastinum/Skelett-Weichteile, Device-Katalog,
Fleischner-Terminologie und die Tri-State-/Stack-Architektur sind bewusst
kompatibel gehalten (parallele Feld-IDs), um Doppelpflege der geteilten Konzepte
gering zu halten. Round-Trip-fähige, stabile Feld-IDs.

### Zugehörige Änderung in `thorax-standard`

Mit dieser Abspaltung wird `thorax-standard` auf **rein aufrecht** bereinigt
(a.p.-Liegend-Projektion und die Liegend-Qualitätsoption entfallen dort) – siehe
`thorax-standard/CHANGELOG.md`.
