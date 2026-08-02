> **Repo-Hinweis (nicht normativ, 2026-08-02).** Dieses Dokument ist die
> maßgebliche geschriebene Fassung der Verification-Floor-Spezifikation im
> Repo. Die im Text referenzierte Basis-Spezifikation v0.1 liegt (noch) nicht
> als eigene Datei im Repo; ihre Inhalte sind über die hier angegebenen
> Ersetzungen/Erweiterungen sowie im Manuskript dokumentiert. Wo dieses
> Addendum „ersetzt/erweitert Abschnitt X der Basisspezifikation" sagt, gilt
> der hier stehende Text. Umgesetzt ist dieser Stand in der Vorlage
> `knie-praetep` v1.7.

# Addendum A zur Verification-Floor-Spezifikation — Feldzustände am Messwert
**Status:** normativ, erweitert `validation/SPEC.md` v0.1
**Version:** A-1.0 · **Datum:** 2026-08-02
**Zielort:** `validation/SPEC-ADDENDUM-A.md`; SPEC.md erhält einen Verweis in Abschnitt 2.1
**Änderungen an v0.1:** Abschnitt 2.1 wird um einen Status erweitert, Abschnitt 2.2 neu gefasst, Abschnitt 3 um zwei Assertions ergänzt. Alles Übrige bleibt unverändert gültig.

---

## A1. Anlass und Geltungsbereich
Die eingefrorene Spezifikation beschreibt Attestierung als Eigenschaft eines Feldwerts, lässt aber drei Fragen offen, die bei der Umsetzung eines Messwertfelds mit KI-Vorbelegung sofort auftreten:

1. Was geschieht mit dem angezeigten Berichtstext, wenn kein Attestierungsakt stattgefunden hat?
2. Wie wird ausgedrückt, dass ein Wert *nicht beurteilbar* ist — im Unterschied zu *nicht bearbeitet*?
3. Was bedeutet „unveränderlicher KI-Wert" bei anzuwendenden Konventionstransformationen?

Dieses Addendum beantwortet sie normativ. Es beschreibt **kanonische Semantik**, keine Oberfläche. Bedienelemente, Reiter und Moduswahl sind Darstellungsfragen; verbindlich ist ausschließlich, welcher Zustand daraus entsteht und was er emittiert.

---

## A2. Die fünf Feldzustände
Ersetzt Abschnitt 2.1 der Basisspezifikation.

| Zustand | Bedeutung | Angezeigter Wert | Emittierte Observation | Referenzlabel |
|---|---|---|---|---|
| `active-confirmed` | Vorschlag durch expliziten Akt übernommen | Vorschlagswert | ja | **ja** |
| `active-corrected` | Vorschlag durch expliziten Akt geändert | eigener Wert | ja | **ja** |
| `active-rejected` | Wert ist **nicht beurteilbar**; Vorschlag wird verworfen, kein Ersatz | keiner | ja, mit `dataAbsentReason` | nein — aber eigenständig auswertbar |
| `passive-accepted` | Vorschlag übernommen ohne Interaktionsereignis | Vorschlagswert | ja | nein |
| `not-attested` | kein Feldwert und kein Vorschlag | keiner | **nein** | entfällt |

**`manual-entered`** aus v0.1 bleibt unverändert gültig für Felder ohne KI-Beteiligung und qualifiziert weiterhin als Referenzlabel.

### A2.1 Zu `active-rejected`
Der neue Zustand deckt den Fall ab, dass ein Vorschlag vorliegt, aber weder bestätigt noch durch einen eigenen Wert ersetzt werden kann — unzureichende Ganzbeinaufnahme, Rotationsfehlstellung, nicht erkennbare Kalibrationskugel, unvollständige Abbildung.

Er ist **kein** Fehlerzustand, sondern eine Aussage: *Ich habe geprüft und kann den Wert nicht verantworten.* Genau das kann ein System, das nur Bestätigen und Korrigieren kennt, nicht ausdrücken — und füllt die Nicht-Auflösbarkeit dann auf.

Ablehnungen sind für die Auswertung eigenständig wertvoll: Eine Häufung an einem Feld weist auf Akquisitions- oder Modellprobleme hin, lange bevor sich das in Diskordanzen zeigt. Sie sind daher zu erfassen und getrennt auszuweisen, nicht zu verwerfen.

### A2.2 Erhalt des Vorschlags
In **allen** Zuständen mit Vorschlag — einschließlich `active-rejected` — bleibt der ursprüngliche Wert in `aiSource.rawValue` erhalten. Ein überschriebener oder abgelehnter Vorschlag darf nach dem Export nicht verloren sein.

---

## A3. Ableitungsregel (ersetzt Abschnitt 2.2)
Der Status wird weiterhin **abgeleitet, nicht gesetzt**.

```
wenn kein Vorschlag und kein Feldwert            → not-attested
sonst wenn aiSource == null                      → manual-entered
sonst wenn interactionEvent == null              → passive-accepted
sonst wenn interactionEvent.kind == 'reject'     → active-rejected
sonst wenn value == transform(aiSource.rawValue) → active-confirmed
sonst                                            → active-corrected
```

`interactionEvent.kind` ist eines von `confirm` | `correct` | `reject`. Die Reihenfolge der Prüfungen ist verbindlich: Die Ablehnung wird vor dem Wertvergleich ausgewertet, da bei ihr kein Wert vorliegt.

---

## A4. Anzeige-Export-Konsistenz *(neue Kernregel)*
> **Jeder im Berichtstext angezeigte Wert muss durch eine emittierte Observation gedeckt sein, und jede emittierte Observation muss einem angezeigten Wert oder einer expliziten Abwesenheitsangabe entsprechen.**

Diese Regel schließt eine Lücke, die andernfalls unbemerkt bliebe: ein Bericht, der „HKA 174,2°" ausweist, während der Export zu diesem Feld nichts enthält. Der Zuweiser läse dann einen Wert, den die Daten nicht kennen — schlechter als eine stille Auffüllung, weil ohne Auffälligkeit.

Praktische Folge: Ein unbearbeiteter Vorschlag wird **nicht unterschlagen**, sondern als `passive-accepted` mit Observation emittiert und aus der Referenzmenge ausgeschlossen. Durchwinken bleibt zulässig; es wird lediglich anders gezählt.

`not-attested` erzeugt weiterhin keine Observation — dort wird aber auch nichts angezeigt, die Regel bleibt gewahrt.

---

## A5. Transformationen und der Begriff „unveränderlich"
Der Vorschlagswert ist **nicht überschreibbar**. Er ist nicht **untransformiert**.

Wo eine dokumentierte Konventionsanpassung gilt, wird der transformierte Wert angezeigt und verglichen; der Rohwert bleibt in `aiSource.rawValue`, die Anpassung in `aiSource.transform`.

Verbindlicher Fall: **HKA-Vorzeichenkonvention.** Externe Ausgaben führen Varus positiv, die interne aHKA-Konvention Varus negativ. Die Inversion ist ein expliziter, getesteter Pipeline-Schritt (`sign-inversion-applied`), der **vor** der Anzeige erfolgt.

Ein Template, das den Rohwert anzeigt und ihn zugleich „unveränderlich" nennt, baut den Fehler ein, den der Pflicht-Vorcheck verhindern soll. Die Unveränderlichkeit bezieht sich auf die Nicht-Überschreibbarkeit durch den Benutzer, nicht auf die Konvention.

**Unverändert gültig:** CPAK wird nie als vorberechneter Wert konsumiert, sondern intern aus aHKA und JLO abgeleitet.

---

## A6. Invarianten der Erfassung
Verbindlich für jede Oberfläche, unabhängig von ihrer Gestaltung:

1. **Ein Auswahlakt pro Feld.** Die drei aktiven Zustände schließen einander aus. Zwei unabhängige Bedienelemente (etwa Kontrollkästchen *und* Korrekturfeld) erlauben widersprüchliche Kombinationen und sind unzulässig.
2. **Keine Vorauswahl.** Kein Zustand ist voreingestellt. Der Ausgangszustand ist `passive-accepted` durch Unterlassung, nicht durch Vorbelegung eines Bedienelements.
3. **Das Korrekturfeld ist erst nach Auswahl der Korrektur eingabefähig.** Andernfalls kann es neben einer Bestätigung befüllt sein.
4. **Der Vorschlag bleibt sichtbar**, auch nach Korrektur oder Ablehnung. Er ist Kontext, nicht Entwurf.
5. **Jeder Zustandswechsel erzeugt ein Interaktionsereignis** mit Art und Zeitstempel. Der Zeitstempel dokumentiert den Bezug auf einen bestimmten Zustand des Vorschlags — zusammen mit Modellversion und Rohwert. Er belegt **keine** Reihenfolge; bei Vorbelegung steht diese ohnehin fest.

---

## A7. Vorlagenvariante und Modus
Die verwendete Vorlagenversion **und** die aktive Variante gehören in die Provenance. Andernfalls ist einem Datensatz später nicht anzusehen, unter welchen Bedingungen er entstand.

Für einen verblindeten Anbietervergleich genügt ein umschaltbarer Modus **nicht**. Verblindung ist eine Konstruktions-, keine Aufzeichnungsfrage: Erforderlich ist eine eigene Vorlagenvariante, die die betreffenden Felder gar nicht enthält. Eine Variante, die sie nur ausblendet, bleibt umschaltbar und damit unbelegbar.

Getrennt werden dabei **Empfang und Anzeige**, nicht Empfang und Nichtempfang: Die KI-Ausgabe muss ankommen und gespeichert werden, sonst gibt es nichts zu vergleichen.

---

## A8. FHIR-Abbildung
**Verbindlich:**
- Attestierung als `Observation.extension`, feldgebunden — nicht als `Provenance.activity`
- `active-rejected` → `Observation` **ohne** `value[x]`, mit `dataAbsentReason`. Der Code des lokalen Grundes (etwa unzureichende Aufnahme) wird über die lokale CodeSystem-URI geführt
- Rohwert, Modellversion, Quellartefakt und Transformation in jedem Zustand mit Vorschlag auflösbar

**Provisorisch, bei Implementierung zu entscheiden:**
- konkreter `dataAbsentReason`-Code (`unknown`, `not-applicable`, `error`) gegenüber einer lokalen Erweiterung mit Grundangabe
- Repräsentation von `interactionEvent.kind` als eigene Sub-Extension oder abgeleitet aus dem Statuswert

---

## A9. Fixtures — Ergänzung zum Katalog

| ID | Konstellation | Abgeleiteter Status | Observations | `value[x]` | Im LoA-Set |
|---|---|---|---|---|---|
| 09 | Vorschlag abgelehnt, kein Ersatzwert | `active-rejected` | 1 | nein, `dataAbsentReason` | nein |
| 10 | Vorschlag abgelehnt, Vorschlag bleibt in `rawValue` auflösbar | `active-rejected` | 1 | nein | nein |
| 11 | Unbearbeitetes Feld mit Vorschlag; Anzeige und Export beide vorhanden | `passive-accepted` | 1 | ja | nein |
| 12 | Korrektur bei gleichzeitig angewandter Vorzeicheninversion | `active-corrected` | 1 | ja | ja |

Fixture 12 ist die Kante, an der eine naive Implementierung scheitert: Sie muss die Inversion anwenden, *bevor* sie Korrektur von Bestätigung unterscheidet — und darf die Korrektur nicht als Konventionsartefakt verschlucken.

---

## A10. Assertions — Ergänzung

| ID | Assertion | Prüfkriterium |
|---|---|---|
| **A5** *(neu gefasst)* | Keine stille Auffüllung | `not-attested` erzeugt keine Observation. `active-rejected` erzeugt eine Observation **ohne** `value[x]`. Ein Vorschlag darf nie als Wert erscheinen, ohne dass ein Zustand ihn deckt |
| **A6** *(neu)* | Anzeige-Export-Konsistenz | Für jeden im Berichtstext angezeigten Feldwert existiert genau eine Observation mit diesem Wert; für jede Observation mit `value[x]` existiert ein angezeigter Wert |
| **A7** *(neu)* | Erhalt des Vorschlags | `aiSource.rawValue` ist nach dem Roundtrip in allen Zuständen mit Vorschlag unverändert auflösbar, einschließlich `active-rejected` |

A1 bis A4 der Basisspezifikation bleiben unverändert.

---

## A11. Zuordnung zu den prüfbaren Eigenschaften des Manuskripts

| Eigenschaft (Tab. 2) | Deckung hier |
|---|---|
| 1 Code-Treue | A1 der Basisspezifikation |
| 2 Feldgranularität | A8, `Observation.extension` |
| 3 Herkunftsnachweis | A2.2, A5 |
| 4 Akttyp-Unterscheidung | A2, A3 — jetzt vier statt drei Ausprägungen |
| 5 Keine stille Auffüllung | A5 neu gefasst, A6 |
| 6 Codierte Eingabe | A6 Invariante 2 und 4 |
| 7 Erhalt des Vorschlags | A2.2, A7 |

---

## A12. Offene Prüfpunkte

| Punkt | Bemerkung |
|---|---|
| **LOINC `LP410789-0` und `LP35279-5`** | LP-Präfixe bezeichnen in LOINC Parts, nicht notwendig vollständige Observation-Codes. Vor Übernahme in weitere Templates gegen die LOINC-Datenbank prüfen und gegebenenfalls durch einen Observation-Code ersetzen oder als Component führen |
| RID-Verifikation | `data-radlex-status="local"` ist für Kalkulation und Export ausreichend; verifizierte RIDs sind ein nachgelagerter Interoperabilitätsschritt. Nie raten |
| MAD, mLDFA, mMPTA, JLCA | derzeit ohne Code. Vor der Erweiterung entscheiden, ob lokale CodeSystem-URI oder LOINC/RadLex |
| `dataAbsentReason`-Vokabular | lokale Gründe für Nicht-Beurteilbarkeit definieren (unzureichende Aufnahme, Rotationsfehlstellung, Kalibration fehlend) |

---

## A13. Scope-Grenze
Dieses Addendum betrifft die kanonische Semantik des Messwertfelds. Es deckt **nicht** ab:

- die Gestaltung der Oberfläche über die Invarianten in A6 hinaus
- die lokale LoA-Validierung mit realen Daten (eigene Sequenz, Ethikvorlauf)
- das Protokoll des verblindeten Anbietervergleichs (eigene Arbeit; hier stehen nur die Konstruktionsbedingungen, A7)

Der Vorrang bleibt unverändert: FHIR-Roundtrip grün, dann Feasibility-Demo, dann alles Weitere.
