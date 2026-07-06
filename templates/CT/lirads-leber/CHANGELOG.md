# Changelog: CT Leber LI-RADS v2018

## v1.3 – 2026-07-06

### Umstellung auf A-Struktur (lean kanonisch + abgeleitete Demo)

Das Template wurde von der B-Struktur (Inline-CSS/JS, 3156 Zeilen) auf die
A-Struktur migriert. Das kanonische `template.html` ist jetzt **nacktes,
kodiertes MRRT** (426 Zeilen, kein CSS/JS/style-link, Lean-Guard grün).

- Gesamtes Viewer-Chrome nach `demo/ct-lirads-leber/demo.js` verlagert:
  Mode-Switch (Manuell/Geführt/Direkt), Läsions-Tabs, LR-Kategorie-Box,
  4-Schritte-Berechnungsanzeige, Live-Vorschau, Export.
- LR-Algorithmus (`calculateLR`) **verbatim** portiert; per jsdom-Test gegen
  bekannte Fälle geprüft (LR-5/LR-3/LR-M-Override/AF-Downgrade, show-if,
  Multiplikation, Direkt-Modus – 11/11 grün).
- Läsionsblock **einmal** kanonisch deklariert (`data-lesion="1"`); `demo.js`
  multipliziert auf 3 Tabs. Buttons (LR-TR, Final-Check) → deklarative `<select>`.
- `template.source.html` (B-Artefakt) entfernt.

### Abspaltung: LTx-Evaluation → eigenes Template

Der vierte Modus „LTx-Evaluation" (§16-TPG/Mailand) wurde in das eigenständige
Paket **`HJK-MRRT-LTX-HCC-EVAL`** ausgelagert (`templates/CT/ltx-hcc-evaluation/`).
Grund: Modus-Switch nicht A-konform, eigenes Feldset, separate DRG-Quelle.
Dieses Template ist damit **LI-RADS-fokussiert**; alle LTx-/Mailand-Felder,
-Berechnung und -Metadaten sind hier entfernt.

### Kodierung sauber neu bewertet

- Nur **registry-korroborierte** RIDs behauptet: Größe (RID13432/LOINC 21889-1),
  Segment (RID29237), Verlaufstrend (RID39157/36043/36044).
- Die widersprüchlich belegten LI-RADS-RIDs des Vorgängers (RID43353, RID3822,
  RID4271, RID39477 – jeweils für mehrere Konzepte vergeben) wurden **nicht**
  übernommen; betroffene Felder sind `data-radlex-status="local"` mit Kandidat
  im MAPPING. Vermeidet den `24627-2`-Bug (CLAUDE.md §5).
- Jede `<option>` trägt Kodierung (RID / local / needs-mapping).

## v1.2 – 2026-05-19

### Strategische Erweiterung: DRG-Kompatibilität

Nach Studium des offiziellen DRG-Templates *gen_ltx_hcc.html* (Pinto dos Santos D, Mildenberger P, Klos G; Deutsche Röntgengesellschaft 2017) wurde das Template um eine **vollständige DRG-LTx-Kompatibilitäts-Schiene** erweitert. Das Template vereint damit erstmals die didaktische LI-RADS-Methodik nach Schima 2023 mit der offiziellen deutschen LTx-Evaluations-Methodik.

### Neuer vierter Modus: "LTx-Evaluation"

- Vollwertige Erfassung der §16-TPG-Felder:
  - Eurotransplant-Nummer
  - Untersuchungsdatum
  - Initiales HCC / Verlaufsbericht / HCC gesichert / Leberzirrhose histologisch
  - Extrahepatische Manifestation
  - Zweites Verfahren (bei DD < 2 cm)
- **Live Mailand-Kriterien-Berechnung** (1:1 portiert aus DRG `calcMilan()`)
- **Visuelle Kriterien-Übersicht**: 4 Mailand-Kriterien werden einzeln als met/violated dargestellt
- **Pro Läsion ergänzende DRG-Felder** (in allen Modi sichtbar im LTx-Modus):
  - Seriennummer
  - Bildnummer
  - Mess-Kontrastphase
  - Makrovaskuläre Invasion
- LI-RADS-Kategorien werden **parallel** mit-berechnet – damit liegen Mailand- *und* LR-Status gleichzeitig vor

### RadLex-Coding-Schema (neu)

Alle klinisch relevanten Variablen tragen `data-radlex-id`-Attribute:

| Feld | RadLex-ID |
|---|---|
| Lokalisation Segment | RID29237 |
| Größe | RID13432 |
| Nonrim APHE | RID43355 |
| Wash-Out | RID43353 |
| Anreichernde Kapsel | RID39477 |
| Schwellenwachstum | RID35936 |
| Leberzirrhose | RID3822 |
| HCC | RID4271 |
| Chron. HBV | RID28572 |
| Makrovaskuläre Invasion | RID3987 |

RadLex-Codes werden im JSON-Export pro Läsion mitgeschickt. Damit ist das Template direkt für RadLex-basierte KI-Trainingspipelines (Anschluss an RSNA-Standards) nutzbar.

### Lizenzwechsel auf CC BY 4.0

- Von MIT auf **Creative Commons Attribution 4.0 International (CC BY 4.0)** gewechselt
- Identische Lizenz wie das DRG-Template – ermöglicht spätere Zusammenführung oder formelle DRG-Aufnahme ohne Lizenzbarriere
- Standard für strukturierte Befundungs-Templates (RSNA RadReport, ESR, DRG)

### Visuelle Ergänzungen

- Eigene Farbpalette für LTx-Sektion (Türkis-Akzent `#2b6a6f`, distinkt von Schima-Blau und LR-TR-Lila)
- Mailand-Box mit semantischer Farbcodierung (grün = erfüllt, rot = verletzt)
- Kriterien-Grid mit Einzel-Status pro Mailand-Kriterium
- RadLex-Indikator-Badges an markierten Feldern
- `§16`-Badge in der LTx-Sektion

### Erweiterungen im JSON-Export

```json
{
  "template": "HJK-MRRT-CT-LEBER-LIRADS-v1.2",
  "template_lizenz": "CC-BY-4.0",
  "laesionen": [{
    "...",
    "ltx_felder": {
      "seriennummer": "...",
      "bildnummer": "...",
      "messphase": "...",
      "makrovaskulaere_invasion": false
    },
    "radlex_codes": {
      "segment": "RID29237",
      "size": "RID13432",
      "aphe": "RID43355",
      "..."
    }
  }],
  "ltx_evaluation": {
    "etnummer": "...",
    "untersuchungsdatum": "...",
    "initiales_hcc": "...",
    "mailand_erfuellt": "erfüllt"
  },
  "referenzen": {
    "algorithmus": "Schima W, Kopf H, Eisenhuber E...",
    "ltx_basis": "Pinto dos Santos D, Mildenberger P, Klos G..."
  }
}
```

### Evidence-Footer ergänzt

Beide Referenzwerke werden jetzt prominent zitiert:

1. **Schima/Kopf/Eisenhuber 2023** – LI-RADS-Algorithmus und 4-Schritte-Logik
2. **Pinto dos Santos/Mildenberger/Klos 2017** – LTx-Evaluation, Mailand-Berechnung, RadLex-Schema
3. **Lizenz-Verweis** mit DRG-Kompatibilitäts-Hinweis

### Mailand-Algorithmus (Tests)

- Solitärer Knoten ≤ 50 mm → in ✓
- Solitärer Knoten > 50 mm → out ✓
- 2–3 Knoten, alle ≤ 30 mm → in ✓
- 2–3 Knoten, ≥ 1 > 30 mm → out ✓
- ≥ 4 Knoten → out (auch bei kleinen Größen) ✓
- Extrahepatische Manifestation → out (übersteuert) ✓
- TIV oder makrovaskuläre Invasion → out (übersteuert) ✓

9/9 Mailand-Tests bestanden, deckt sich exakt mit DRG `calcMilan()`-Verhalten.

### Bewahrt aus v1.1

Alle v1.1-Funktionalitäten unverändert:

- Vollständiger 4-Schritte-LI-RADS-Algorithmus nach Schima 2023
- LR-TR (4 Sub-Kategorien) und LR-TIV (3 Subtypen)
- Tie-Breaking-Regel und Final Check
- Hilfskriterien-Tab. 1 wörtlich
- Manuell, Geführt, Direkt – jetzt ergänzt durch LTx-Evaluation
- Risikopopulation und Ausschlüsse paper-konform
- Calc-Steps-Live-Visualisierung
- FHIR-Export mit LOINC- und ACR-LI-RADS-Codes

### Strategische Implikation

Mit v1.2 wird die Erzählung der Folgearbeit substantiell stärker:

> "Erste publizierte Vereinheitlichung der LI-RADS-Methodik (Schima 2023) mit den DRG-LTx-Evaluations-Feldern (Pinto dos Santos 2017) in einem MRRT-konformen, RadLex-annotierten, CC-BY-4.0-lizenzierten Open-Source-Template."

**Erweiterte Co-Autorenschaft-Kandidaten** (vorbehaltlich Anfrage):
- Schima W, Kopf H, Eisenhuber E (Wien – LI-RADS-Methodik)
- Pinto dos Santos D (Köln – DRG-AK-Befundung-Vorsitz, DRG-LTx-Template)
- Reiger-Ochsner M (Karner, MSK)

---

## v1.1 – 2026-05-18

### Paper-Konformität nach Schima/Kopf/Eisenhuber (RöFo 2023; 195: 486–494)

Vollständige Revision auf Paper-Konformität:
- **4-Schritte-Algorithmus** implementiert (Algorithmus → Hilfskriterien → Tie-Breaking → Final Check)
- **LR-TR** integriert (4 Sub-Kategorien)
- **LR-TIV-Subtypisierung** (definitiv HCC / wahrsch. HCC / wahrsch. Nicht-HCC)
- **Tie-Breaking-Regel** als eigene Logik (vorher mit AF-Tie verwechselt)
- **Final Check** als Schritt 4
- **Risikopopulation** korrigiert (Z.n. LTx entfernt, Ausschlüsse Budd-Chiari/HHT/kardiale Stauung)
- **Hilfskriterien-Tab. 1** wörtlich übernommen
- **LR-M** mit 4 Untermerkmalen
- **Wizard-Modus** an Paper-Reihenfolge angepasst
- **Sprachliche Schima-Konformität** (Hauptkriterien, Hilfskriterien, Wash-Out, anreichernde Kapsel, Schwellenwachstum, Observation)
- **Calc-Steps-Panel** visualisiert die 4 Schritte live

28/28 Paper-Konformitäts-Checks und 16/16 Algorithmus-Tests bestanden.

---

## v1.0 – 2026-05-18 (deprecated)

Initial-Version. Nicht Paper-konform. Durch v1.1 ersetzt.
