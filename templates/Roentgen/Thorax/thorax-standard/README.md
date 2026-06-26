# Röntgen Thorax

**ID:** HJK-MRRT-ROE-THORAX
**Version:** 2.1
**Status:** Pilot
**Demo:** [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/roentgen-thorax/)

## Zweck

Strukturierte Befundvorlage für den **Röntgen-Thorax (p.a. ± lateral)** im klinischen Alltag. Organ-systematische Befundung mit vollständiger RadLex-Terminierung, Multi-Parenchym-Stack (mehrere Lungenbefunde gleichzeitig, Fleischner-konform) und dynamischem Device-Stack (beliebig viele Fremdkörper/Katheter).

Primär entwickelt für HJK Wien, konzipiert für Vinzenz-Gruppe.

## Befundungsmodell (v2.0 – additive Attestierung)

Ab v2.0 folgt das Template demselben additiven Modell wie `CT/schaedel-nativ`: kein Feld ist normal vorbelegt. Die fünf Domänen sind **Tri-State-Regionen** — `—` (unbeurteilt) · `o. B.` (attestiert) · `Befund` (Detail). Eine unbeurteilte Region erzeugt keinen Satz; eine positive Normalaussage entsteht nur durch bewusste Attestierung, nicht durch Auslassen.

- **1-Klick-Normalbefund:** „✓ Normalbefund attestieren" setzt alle offenen Regionen auf o. B. — schnell wie ein Diktat des Normalfalls, aber als Attestierung. Bereits gesetzte Befunde bleiben unangetastet.
- **Verification Floor:** Der FHIR-Export kodiert o. B. als `interpretation = NEG` (ärztlich attestierter Negativbefund) und Befunde als `POS`. Stille Default-Normalbefunde gibt es nicht mehr.
- **Voice-ready + HUD:** `data-voice` auf allen Feldern; der Button „🎙 Voice-Hints" blendet die Sprechbefehle pro Feld ein, ohne vom Bild wegschauen zu müssen.

## Projektionen

- p.a. stehend
- Seitlich (li.)
- a.p. liegend
- Exspirations-Aufnahme

## Befund-Domänen

| Sektion | Inhalt |
|---|---|
| Lunge / Parenchym | Multi-Stack: beliebig viele Befunde, Fleischner-Terminologie (GGO, Konsolidierung, Honigwaben, Crazy Paving, Rundherde, Emphysem …) |
| Pleura | Erguss (Ausmaß), Pneumothorax (Ausmaß), Schwarte, Kalk, Tumor |
| Herz / Mediastinum | CTR-Kategorie, Konfiguration, Mediastinum, Hili re./li., Aorta |
| Zwerchfell | Stellung bds., Sinus phrenicocostales |
| Skelett / Weichteile | Knochen, Thoraxwand |
| Devices | Multi-Stack: 24 Device-Typen in 6 Gruppen, je mit Lage + Beurteilung |
| Vergleich | Datum, Verlaufsbeurteilung |
| Beurteilung | Auto-Modus aus Feldern, Freitext-Modus umschaltbar |

## RadLex-Terminierung

Alle Dropdown-Optionen sind mit `data-radlex` (RID-Code) und `data-en` (englischer RadLex-Term) annotiert.
Vollständige Mapping-Tabelle: [RADLEX-MAPPING.md](./RADLEX-MAPPING.md)

## Fleischner-Terminologie (Parenchym)

Parenchym-Befunde folgen der Fleischner-Society-Nomenklatur:

| Deutsch | RadLex-Term | RID |
|---|---|---|
| Milchglastrübung | ground-glass opacity | RID4800 |
| Konsolidierung | consolidation | RID4803 |
| Retikuläres Muster | reticular pattern | RID5177 |
| Honigwabenmuster | honeycombing | RID5180 |
| Crazy-Paving-Muster | crazy paving pattern | RID5179 |
| Lungenemphysem | pulmonary emphysema | RID4799 |
| Solitärer Rundherd | solitary pulmonary nodule | RID4941 |
| Atelektase | atelectasis | RID28493 |

## Device-Katalog

24 Device-Typen in 6 Gruppen (Vaskulär / Kardial / Atemweg / Sonden / Drainage / Sonstige).
Jeder Device-Typ mit RadLex-Code, vorausgefülltem Lage-Placeholder und 4-stufiger Beurteilung
(korrekte Lage / kontrollbedürftig / Fehllage / Fehllage dringlich).

## Output

- **Fließtext** – Copy/Paste in Syngo / Carbon
- **FHIR Bundle R4** – DiagnosticReport (LOINC 36643-5) + Observations pro Parenchym-Befund, Pleura, Zwerchfell, Device; RadLex-kodiert

## Architektur

```
thorax-standard/
├── template.source.html   # Authored source – externer CSS-Link
├── template.html          # MRRT/Carbon-Build – CSS inline (via inline-css.js)
├── frontmatter.yaml       # Maschinenlesbare Template-Metadaten
├── README.md              # Diese Datei
├── CHANGELOG.md           # Versionshistorie
└── RADLEX-MAPPING.md      # Vollständige RID-Tabelle
```

`template.source.html` verwendet `../../shared/styles/radreport-core.css` als externen Link.
Der Build-Schritt (`node shared/scripts/inline-css.js`) erzeugt die self-contained `template.html`
für MRRT-konforme Systeme (Syngo Carbon).

## Quellen

- Fleischner Society: MacMahon H et al. Guidelines for Management of Incidental Pulmonary Nodules. Radiology 2017;284(1):228-243
- Hansell DM et al. Fleischner Society: Glossary of Terms for Thoracic Imaging. Radiology 2008;246(3):697-722

## Versionshistorie

Siehe [CHANGELOG.md](./CHANGELOG.md)
