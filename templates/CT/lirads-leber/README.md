# CT Leber – LI-RADS v2018 + DRG-LTx-Kompatibilität

**ID:** HJK-MRRT-CT-LEBER-LIRADS
**Version:** 1.2
**Status:** Pilot, Paper-konform nach Schima/Kopf/Eisenhuber RöFo 2023, DRG-kompatibel nach Pinto dos Santos et al. 2017
**Lizenz:** Creative Commons Attribution 4.0 International (CC BY 4.0)

## Zweck

Strukturierte Befundvorlage für die **mehrphasige KM-CT der Leber bei Patienten mit erhöhtem HCC-Risiko**. Sie vereint:

1. **LI-RADS v2018** (American College of Radiology) – Vollständiger 4-Schritte-Algorithmus nach der didaktischen Aufbereitung von **Schima/Kopf/Eisenhuber (Fortschr Röntgenstr 2023; 195: 486–494)**
2. **DRG-LTx-Evaluation** – Befundungsfelder und Mailand-Kriterien-Berechnung nach dem offiziellen DRG-Template *gen_ltx_hcc.html* (**Pinto dos Santos D, Mildenberger P, Klos G, 2017**, CC BY 4.0), umgesetzt zur §16-TPG-Richtlinie der Bundesärztekammer für Lebertransplantations-Anmeldungen

Diese Vereinigung ist der zentrale wissenschaftliche Beitrag der Implementierung: Statt zweier paralleler, sich überschneidender Templates entsteht ein einziges, das sowohl die didaktische LI-RADS-Linie als auch die offizielle deutsche Transplantations-Linie abdeckt.

## Wissenschaftlicher Hintergrund

Diese Implementierung dient als **Referenz-Umsetzung** sowohl der Schima/Kopf/Eisenhuber-Methodik als auch der DRG-LTx-Felder. Sie ist Grundlage für die geplante Folgearbeit (siehe `docs/folgearbeit-skizze.md`).

**Designprinzip:** Jede Algorithmus-Logik, jede Schritt-Reihenfolge, jede Terminologie folgt den Original-Publikationen. Die Mailand-Berechnung ist exakt aus der `calcMilan()`-Funktion des DRG-Templates portiert. Abweichungen sind im Abschnitt "Implementierungsentscheidungen" dokumentiert.

## Vier Modi

| Modus | Zielgruppe | Funktion |
|---|---|---|
| **Manuell** | Geübter LI-RADS-Befunder | Alle Hauptkriterien + Hilfskriterien-Tab. 1 direkt setzen, Tie-Breaking + Final Check zugänglich |
| **Geführt (Made Easy)** | LI-RADS-Einarbeitung, Lehrkontext | 7-Schritte-Wizard nach Schima 2023: TIV → LR-M → APHE → MF → AF → Tie → Final |
| **Direkt** | Senior-Befunder mit klinischer Gewissheit | Manuelle LR-Zuweisung, begründende Merkmale als Freitext |
| **LTx-Evaluation** *(neu in v1.2)* | LTx-Board, §16-TPG-Anmeldung | ET-Nummer, Mailand-Compliance-Felder, makrovaskuläre Invasion pro Läsion, automatische Mailand-Berechnung. **LI-RADS-Kategorien werden parallel mit-berechnet.** |

Alle vier Modi nutzen dieselbe LR-Berechnungs-Engine. Im LTx-Modus werden zusätzlich DRG-spezifische Felder (Seriennummer, Bildnummer, Mess-KM-Phase, makrovaskuläre Invasion) erfasst.

## Mailand-Kriterien (DRG-konform)

Live-Berechnung nach den Original-Mailand-Kriterien:

- Solitärer Knoten ≤ 50 mm **ODER**
- Bis zu 3 Knoten, alle ≤ 30 mm
- **UND** keine extrahepatische Manifestation
- **UND** keine makrovaskuläre Invasion

Diese Logik ist 1:1 aus der `calcMilan()`-Funktion des DRG-Templates portiert. Verletzte Kriterien werden im UI farblich markiert (grün = erfüllt, rot = verletzt).

## RadLex-Coding *(neu in v1.2)*

Jede klinisch relevante Variable trägt eine `data-radlex-id`-Annotation:

| Feld | RadLex-ID | Bezeichnung |
|---|---|---|
| Lokalisation Segment | RID29237 | segment of liver |
| Größe | RID13432 | diameter |
| Nonrim APHE | RID43355 | arterial phase hyperenhancement |
| Wash-Out | RID43353 | portal venous phase hypoenhancement |
| Anreichernde Kapsel | RID39477 | pseudocapsule (liver) |
| Schwellenwachstum | RID35936 | growth |
| Leberzirrhose | RID3822 | cirrhosis |
| HCC | RID4271 | hepatocellular carcinoma |
| Chron. HBV | RID28572 | hepatitis B |
| Makrovask. Invasion | RID3987 | vascular invasion |

Die RadLex-Codes werden auch im JSON-Export pro Läsion mitgeschickt. Das macht den Output direkt für RadLex-basierte KI-Trainingspipelines nutzbar (Anschluss an RSNA-Standards).

## Kategorien-Spektrum

| Kategorie | Bedeutung |
|---|---|
| **LR-1** | definitiv benigne |
| **LR-2** | wahrscheinlich benigne |
| **LR-3** | intermediäre Wahrscheinlichkeit für HCC |
| **LR-4** | wahrscheinlich HCC |
| **LR-5** | definitiv HCC |
| **LR-M** | maligne, nicht HCC-spezifisch |
| **LR-TIV (definitiv HCC)** | Tumor in Vene mit Bezug zu LR-5 |
| **LR-TIV (wahrsch. HCC)** | Tumor in Vene, Standard |
| **LR-TIV (wahrsch. Nicht-HCC)** | Tumor in Vene mit Targetoid-Nachbarschaft |
| **LR-TR nonviable** | behandelt, avital |
| **LR-TR equivocal** | behandelt, unklar |
| **LR-TR viable** | behandelt, vitaler Residualtumor |
| **LR-TR nonevaluable** | behandelt, nicht beurteilbar |
| **LR-NC** | nicht kategorisierbar |
| **Mailand-Status** *(parallel)* | erfüllt / nicht erfüllt mit Begründung |

## Strukturelle Eckpunkte

- **Bis zu 3 Index-Observationen** strukturiert kategorisierbar (Tab-Navigation)
- **Weitere Observationen** als Freitext am Ende
- **Pro Observation:** Lokalisation (Segment, RadLex-tagged), Größe (RadLex-tagged), Treated-Toggle, Hauptkriterien (alle RadLex-tagged), optional Hilfskriterien
- **Im LTx-Modus zusätzlich pro Läsion:** Seriennummer, Bildnummer, Mess-KM-Phase, makrovaskuläre Invasion (RadLex-tagged)
- **Treated-Pfad:** Aktiviert LR-TR-Sub-Kategorien
- **TIV-Vorrang mit Subtypisierung** nach Schima 2023
- **LR-M-Pfad:** Targetoid, infiltrativ, Nekrose, Diffusion
- **Tie-Breaking-Regel:** Explizit als eigener Mechanismus
- **AF-Upgrade nie bis LR-5**

## Output

- **Fließtext** für Copy/Paste ins PACS
- **JSON** mit Algorithmus-Trace, RadLex-Codes und LTx-Daten
- **FHIR Bundle** (DiagnosticReport + Observations mit LOINC-, ACR-LI-RADS- und RadLex-Codes)

## Implementierungsentscheidungen

| Entscheidung | Begründung | Quelle |
|---|---|---|
| 4-Schritte-Algorithmus nach Schima 2023 | Didaktische Klarheit | Schima 2023, Abb. 1 |
| Bis zu 3 strukturierte Observationen | Praktikabilität (DRG: 5, dort weil §16-Bogen) | Implementierungs-Wahl, abweichend von DRG |
| Mailand-Berechnungs-Logik | DRG-Original 1:1 portiert | Pinto dos Santos 2017, `calcMilan()` |
| RadLex-Coding-Schema | DRG-Konvention übernommen | Pinto dos Santos 2017, RadLex-Mappings |
| CC BY 4.0 Lizenz | DRG-Kompatibilität für spätere Zusammenführung | Pinto dos Santos 2017 |
| LR-TR im selben Template (nicht separat) | Schima 2023 behandelt LR-TR als integralen Algorithmus-Bestandteil | Schima 2023 |
| LR-TIV-Subtypisierung | Schima-spezifische Erweiterung | Schima 2023, Abb. 9 |
| Direkt-Modus | Senior-Workflow-Beschleunigung | Implementierungs-Wahl |
| Calc-Steps-Panel | Didaktische Transparenz | Erweiterung |

## Lizenz und Quellen-Anerkennung

Dieses Template steht unter **Creative Commons Attribution 4.0 International (CC BY 4.0)** – derselben Lizenz wie das DRG-Template. Damit ist eine spätere Zusammenführung oder formelle Aufnahme in das DRG-Repository ohne Lizenzbarriere möglich.

### Primärreferenzen

- **Schima W, Kopf H, Eisenhuber E.** LI-RADS leicht gemacht (LI-RADS Made Easy). *Fortschr Röntgenstr* 2023; 195: 486–494. DOI: 10.1055/a-1990-5924
- **Pinto dos Santos D, Mildenberger P, Klos G.** Befundungstemplate für LTx-Evaluation bei HCC. DRG-Template *gen_ltx_hcc.html*, Identifier 041807.5.1706140000, Deutsche Röntgengesellschaft, 2017. CC BY 4.0. https://github.com/DRGagit/ak_befundung
- American College of Radiology. **CT/MRI LI-RADS v2018 Core**. ACR, 2018.

### Weitere Quellen

- Chernyak V et al. *Radiology* 2018; 289: 816–830
- Van der Pol CB et al. *Radiology* 2022; 302: 326–335
- Ringe KI et al. Strukturierte Befundung in der Radiologie. *Rofo* 2021. (26 %-Adoptions-Rate)

## Folgearbeit-Vorbereitung

Mit v1.2 wird die wissenschaftliche Erzählung der geplanten Folgearbeit substantiell stärker:

> "Erste publizierte Vereinheitlichung der LI-RADS-v2018-Methodik nach Schima/Kopf/Eisenhuber mit den DRG-LTx-Evaluations-Feldern nach Pinto dos Santos et al. – als CC-BY-4.0-lizenziertes, MRRT-konformes, RadLex-annotiertes Open-Source-Template."

**Erweiterte Co-Autorenschaft-Kandidaten** (Diskussion vorbehalten):

| Person | Begründung |
|---|---|
| W. Schima, H. Kopf, E. Eisenhuber | LI-RADS-Methodik-Verankerung |
| D. Pinto dos Santos | DRG-Template-Verankerung, AK-Befundung-Vorsitz |
| M. Reiger-Ochsner | Reader-Studie, Befunddurchsicht |

Eine Vorab-Kontaktaufnahme mit Pinto dos Santos vor einer formellen Co-Autorschafts-Anfrage ist empfehlenswert. Schima und Pinto dos Santos kennen sich mit hoher Wahrscheinlichkeit aus DRG/ÖRG/ESR-Zusammenhängen – Schima könnte den Erstkontakt herstellen.

## Limitierungen v1.2

- Nur CT (MRT extrazellulär + hepatobiliär in v2.0 geplant)
- Kein CEUS-LI-RADS (bewusst ausgespart)
- Wizard-Modus deckt nicht alle 21 Hilfskriterien ab (vollständig im Manuell-Modus)
- Maximal 3 strukturierte Läsionen (DRG: bis 5; bewusste Implementierungs-Wahl wegen LR-Strukturierungs-Praxis)
- LR-M-Untermerkmale werden in der UI gleich behandelt
- LTx-Modus enthält keine TACE-/Post-Therapie-Subkategorisierung (dafür ist LR-TR im LI-RADS-Algorithmus zuständig)

## Versionshistorie

Siehe [CHANGELOG.md](./CHANGELOG.md)
