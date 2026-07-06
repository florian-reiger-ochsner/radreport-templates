# Röntgen Thorax – a.p. liegend / Intensiv (ICU / portable chest)

**ID:** HJK-MRRT-ROE-THORAX-LIEGEND
**Version:** 1.0
**Status:** Pilot

## Auf einen Blick

Zweigeteilte Struktur — kanonisch ist die Quelle, die Demo ist abgeleitet:

- 📄 **[`template.html`](./template.html)** — kanonisch, Quelle der Wahrheit (nacktes MRRT, voll kodiert). **Inhaltliche Änderungen hier.**
- 🖥 **[Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/roentgen-thorax-liegend/)** — gerendertes Schaufenster (GitHub Pages), abgeleitet aus `template.html`. **Gebaut, nicht von Hand editieren.**
- 📁 [`demo/roentgen-thorax-liegend/index.html`](../../../../demo/roentgen-thorax-liegend/index.html) — Quelltext der Demo im Repo.

## Zweck

Strukturierte Befundvorlage für die **a.p.-Liegend-/Bettaufnahme des Thorax** – den klassischen „ICU / portable chest". Abgespalten vom aufrechten `thorax-standard` (p.a. ± lateral), weil der Liegendbefund primär eine **Lage- und Device-Kontrolle** ist und ein an die Rückenlage angepasstes Zeichen-Vokabular braucht. Beides zusammen ergibt einen eigenständigen Befundtyp, den auch RSNA und andere Bibliotheken separat führen.

Primär entwickelt für HJK Wien, konzipiert für die Vinzenz-Gruppe.

## Was dieses Template vom `thorax-standard` unterscheidet

| Aspekt | thorax-standard (aufrecht) | thorax-liegend (dieses Template) |
|---|---|---|
| Führende Region | Zwerchfell → Pleura → Herz → Lunge → Skelett | **Lage-/Device-Kontrolle** → Lunge/Stauung → Pleura → Herz → Skelett |
| Herzgröße | CTR-Kategorien (≤ 0,5 / grenzwertig / > 0,55) | **keine CTR** – nur orientierende Herzsilhouette (a.p. projektionsbedingt vergrößert) |
| Pleuraerguss | Meniskus / Randwinkelverlegung, Höhengraduierung | **Liegend-Zeichen**: flächige Verschleierung, apikale Kappe, laterale Randlinie |
| Pneumothorax | apikal/mantelförmig, Kollapsgrad | **Liegend-Zeichen**: tief-anteriorer Randwinkel (deep sulcus sign), basal/anteromedial |
| Pulmonale Stauung | Nebenaspekt unter Herz/Mediastinum | **Leitbefund** in der Lungen-Region (Cephalisation → interstitiell → alveolär) |
| Devices | eingeklappter Zusatzblock am Ende | **erste, aufgeklappte Region** mit Device-Stack, ICU-Reihenfolge (Atemweg/Sonden/Vaskulär …) |

Ca. 80 % der Anatomiefelder (Lunge, Pleura, Herz/Mediastinum, Skelett/Weichteile) überschneiden sich bewusst mit `thorax-standard`; die Trennung ist die akzeptierte Konsequenz eines eigenständigen Befundtyps (self-contained, klares mentales Modell, passendes Vokabular).

## Befundungsmodell (additive Attestierung)

Wie `thorax-standard` und `CT/schaedel-nativ`: kein Feld ist normal vorbelegt. Die fünf Domänen sind **Tri-State-Regionen** — `—` (unbeurteilt) · `o. B.` (attestiert) · `Befund` (Detail). Eine unbeurteilte Region erzeugt keinen Satz; eine positive Normalaussage entsteht nur durch bewusste Attestierung.

- **1-Klick-Normalbefund:** „✓ Normalbefund attestieren" setzt alle offenen Regionen auf o. B. — inklusive „keine einliegenden Fremdmaterialien".
- **Verification Floor:** Der FHIR-Export kodiert o. B. als `interpretation = NEG` (attestierter Negativbefund), Befunde als `POS`.
- **Voice-ready + HUD:** `data-voice` auf allen Feldern; Button „🎙 Voice-Hints" blendet Sprechbefehle ein.

## Projektionen / Aufnahmemodus

- a.p. liegend (Default)
- a.p. halb aufrecht (sitzend)
- mobil (Bettaufnahme)
- Inspiration eingeschränkt (Zusatzmarker)

## Befund-Domänen (Reihenfolge = Befundungsreihenfolge)

| # | Sektion | Inhalt |
|---|---|---|
| 1 | **Lage- / Device-Kontrolle** | Multi-Stack, ICU-Reihenfolge: Atemweg (ETT/Trach) · Sonden (MS/PEG) · Vaskulär (ZVK/PICC/Port/Dialyse/Art./IABP/Impella) · Kardial (SM/ICD/CRT) · Drainage (Thorax-/Perikarddrainage) · Sonstige. Je Device: Lage + 4-stufige Beurteilung. |
| 2 | Lunge / Parenchym & Stauung | Pulmonale Stauung/Ödem (Leitbefund) + Multi-Parenchym-Stack (Konsolidierung, ARDS-Muster, Atelektase/Dystelektase, GGO, Rundherde …) |
| 3 | Pleura | Erguss + Pneumothorax mit **Liegend-Zeichen** je Seite, Schwarte, Kalk, Tumor |
| 4 | Herz / Mediastinum | Herzsilhouette orientierend (keine CTR), Gefäßstiel/venöse Zeichen, Mediastinum, Hili |
| 5 | Skelett / Weichteile | Knochen, Thoraxwand (Weichteilemphysem ICU-relevant) |
| — | Vergleich | Datum, Verlaufsbeurteilung |
| — | Beurteilung | Auto-Modus aus Feldern (Device-Fehllage/Spannungspneu zuerst), Freitext umschaltbar |

## RadLex-Terminierung

Alle Dropdown-Optionen und Checkboxen tragen `data-radlex` (RID) und `data-en` (englischer RadLex-Term). Liegend-spezifische Zeichen (deep sulcus sign, apikale Kappe …) sind als radiographische Zeichen des jeweiligen Grundkonzepts kodiert (Pneumothorax RID5352, Erguss RID4872) – die Beschreibung sitzt im Label, der Code bleibt registry-verbatim. Vollständige Tabelle: [RADLEX-MAPPING.md](./RADLEX-MAPPING.md)

## Output

- **Fließtext** – Copy/Paste in die Befundungsplattform/PACS
- **FHIR Bundle R4** – DiagnosticReport (LOINC **36589-0** *Portable XR Chest AP single view* als Default-Override; Untersuchungstyp i. d. R. vom RIS/Auftrag gesetzt) + Observations pro Device, Stauung, Parenchym, Pleura; RadLex-kodiert, NEG/POS-Verification-Floor

## Architektur (A-Struktur)

```
thorax-liegend/
├── template.html          # KANONISCH – nacktes MRRT, rr-*-Hooks, voll kodiert, JS-/CSS-frei
├── frontmatter.yaml       # Maschinenlesbare Metadaten
├── README.md              # Diese Datei
├── CHANGELOG.md           # Versionshistorie (SemVer)
└── RADLEX-MAPPING.md      # RID-Tabelle mit Status je Konzept

demo/roentgen-thorax-liegend/
├── demo.js                # Viewer-Chrome (Preview, Makros, Stacks, FHIR-Demo)
└── index.html             # ABGELEITET via shared/scripts/build-demo.js – NICHT von Hand editieren
```

Inhaltliche Änderung **immer** im kanonischen `template.html`, danach
`node shared/scripts/build-demo.js templates/Roentgen/Thorax/thorax-liegend/template.html demo/roentgen-thorax-liegend/index.html demo.js`.

## Quellen

- Fleischner Society: MacMahon H et al. Guidelines for Management of Incidental Pulmonary Nodules. Radiology 2017;284(1):228-243
- Hansell DM et al. Fleischner Society: Glossary of Terms for Thoracic Imaging. Radiology 2008;246(3):697-722
- Liegend-/Supine-Zeichen (deep sulcus sign, apikale Kappe, flächige Verschleierung) nach gängiger ICU-/Thorax-Röntgenliteratur.

## Versionshistorie

Siehe [CHANGELOG.md](./CHANGELOG.md)
