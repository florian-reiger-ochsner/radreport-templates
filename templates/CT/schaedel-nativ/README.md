# CT Schädel nativ (CCT)

Strukturierte Befundvorlage für die native Schädel-CT. Notfall-Massentemplate für den Routinebetrieb (hohe Stückzahl, hohe Normalbefundrate).

**ID:** `HJK-MRRT-CT-SCHAEDEL-NATIV-v1.0` · **Status:** Pilot · **Modalität:** CT · **Region:** Schädel

---

## Öffentliche Basis

Felddefinitionen für Ischämie, Blutung, Herniation und Fazekas-Graduierung basieren auf der finalisierten DRG-AK-Befundung-Vorlage **`041807.2.2104072101` (ct_stroke_nativ)**, CC BY 4.0. Die HJK-Adaption erweitert die stroke-fokussierte Quelle zur **allgemeinen kraniellen Nativ-CT** (Blutungstypen EDH/SDH/SAB/ICB/IVB, Raumforderung, Kalvaria/NNH/Weichteile) und ergänzt die HJK-Wertschöpfungsschicht: RadLex-Kodierung, FHIR-Export, additives Normalbefund-Modell, Voice-Readiness.

Der Eigenanteil liegt **nicht** in den Felddefinitionen, sondern in der Integrations-, Kodierungs- und Verifikationsschicht.

---

## Designprinzip: additive Klickökonomie

Auf Wunsch von W. Schima ist das oberste Designziel die **Klickminimierung ohne Wechsel zwischen Scrollen und Klicken** – idealerweise spätere Sprachbefüllung (Fluency).

Das Template kehrt die übliche Klickökonomie um:

| | übliches Struktur-Template | dieses Template (additiv) |
|---|---|---|
| Normalbefund | jedes Feld durchklicken | **1 Akt** (Normalbefund-Makro) |
| Pathologie | Pathologie aus Default „normal" heraussuchen | nur die vorhandene Region auf „Befund" + Detail |
| Default | oft „kein Nachweis" vorbelegt | **kein Default** – Anzeigezustand = unbeurteilt (—) |

Jede Region hat drei Zustände:

- **— (unbeurteilt)** — Initialzustand. Trägt **keine klinische Aussage** und erzeugt **keinen** Satz im Befund. Das ist bewusst kein diagnostischer Default.
- **o. B. (attestiert)** — bewusster ärztlicher Akt. Erzeugt den expliziten Negativsatz („Keine intrakranielle Blutung.").
- **Befund** — öffnet die Detailfelder der Region inline.

Der **Normalbefund-Makro** (`✓ Normalbefund attestieren`) setzt alle noch offenen Regionen in einem Akt auf „o. B." – bereits als „Befund" markierte Regionen bleiben unangetastet. Damit ist der Komplett-Normalbefund ein Ein-Klick-Vorgang, aber als **Attestierung**, nicht als stilles Default. Das ist der Verification-Floor in alltagstauglicher Form.

### Warum „kein Default" hier besonders zählt

Bei der CCT ist „Keine Blutung" die folgenreichste Negativaussage überhaupt. Sie darf nie vorbelegt sein – sie muss ein bewusster, attestierter Akt bleiben. Das additive Modell löst die Spannung zwischen „schneller Normalbefund" und „kein klinischer Default" sauber auf: schnell **und** attestiert.

---

## Voice-Readiness (Vorbereitung, kein v1-Blocker)

Das Template ist **voice-ready** gebaut, die produktive Fluency-Anbindung ist aber bewusst **nicht** Bedingung für v1:

- **lineares, einspaltiges Layout** — Leseachse = Diktatachse, kein horizontales Scrollen
- **Reihenfolge = Befundungsreihenfolge**
- **flache Struktur** — keine tief verschachtelten, vor der Sprach-Engine versteckten Felder; Region-Status immer sichtbar
- **`data-voice`-Tokens** (deutsche Sprechform) auf Status-Chips, Selects und Optionen – z. B. `data-voice="blutung unauffällig"`, `data-voice="subarachnoidal"`
- **ein Freitext-Diktatfeld pro Region** für den ungewöhnlichen Fall

> **Offene empirische Frage (gehört in den Demoserver-Test mit T. Wagner):** Ob die MRRT-Feldstruktur im produktiven Reporting-System (Carbon bzw. Sectra) als ansprechbare Tokens überlebt und ob Fluency diese befüllen kann. Das ist keine Doku-, sondern eine Testfrage – dritte Checkpoint-Dimension neben Render-Treue und Kodierungs-Überleben. Architektur „Sprache zuerst, NLP extrahiert Struktur" wird **abgelehnt** (bricht den Verification-Floor): die strukturierten Felder sind die primäre Aussage, Sprache ist Eingabemethode.

---

## Regionen (Befundungsreihenfolge)

1. **Intrakranielle Blutung** — EDH/SDH/SAB/ICB/IVB (Mehrfachauswahl, koexistierend), Seite, Dicke, Alter *(kritisch)*
2. **Ischämie / Infarkt** — Stadium, Gefäßterritorium, Seite, ASPECTS (optional), hämorrhagische Transformation *(kritisch)*
3. **Raumforderung / fokale Läsion** — Lokalisation, Größe, perifokales Ödem
4. **Mittellinie & raumfordernde Wirkung** — MLS (mm), Herniationsmuster, basale Zisternen *(kritisch)*
5. **Ventrikel & Liquorräume** — innere/äußere Liquorräume, Hydrozephalus
6. **Hirnparenchym allgemein** — Fazekas, alte Defekte
7. **Kalvaria · NNH · Weichteile** — Fraktur, NNH/Mastoid, Weichteile

Kritische Regionen lösen bei „Befund" den `--notfall`-Akzent und ein Alert-Badge aus.

---

## Output

- **Fließtext** (Technik / Befund / Beurteilung) – kopierbar
- **FHIR-Bundle** (`document`): DiagnosticReport + Observations
  - nur **beurteilte** Regionen erzeugen eine Observation (unbeurteilte „—" nicht)
  - attestierte Negativbefunde tragen `interpretation = NEG` und eine `note`, die den Negativbefund als **ärztlich attestiert** kennzeichnet → Verification-Floor maschinenlesbar
  - RadLex-kodiert (`system: http://radlex.org`), LOINC `30799-1` (CT Head)

---

## Bewusste Scope-Entscheidungen (gegen Vergrößerung)

- **Keine KI-/Voice-Anbindung in v1.** Voice-Readiness ja, produktive Anbindung erst nach Demoserver-Test. `ki-tools: []`.
- **Keine automatische ASPECTS-Berechnung.** ASPECTS bleibt optionales manuelles Feld – keine KI-Vorbelegung in v1.
- **Keine vorgezogene FHIR-Provenance-Schicht** (preliminary vs. verified) – das gehört systemisch gelöst, nicht pro Template improvisiert.

---

## Build

```bash
node shared/scripts/inline-css.js templates/CT/schaedel-nativ/template.source.html
# → templates/CT/schaedel-nativ/template.html  (MRRT-konform, CSS inlined)
cp templates/CT/schaedel-nativ/template.html demo/ct-schaedel-nativ/index.html
```

**Demo:** `florian-reiger-ochsner.github.io/radreport-templates/demo/ct-schaedel-nativ/`

---

## ⚠ Vor Produktiveinsatz

Die RadLex-RIDs der neuro-spezifischen Terme sind **provisorisch** und noch **nicht gegen den RadLex-Browser verifiziert** (siehe `RADLEX-MAPPING.md`, Spalte Status). Vor jeder produktiven/klinischen Nutzung ist ein Verifikationspass erforderlich. Lateralitäts-Codes sind aus dem bestehenden Repo-Bestand übernommen (konsistent, ebenfalls zu verifizieren).
