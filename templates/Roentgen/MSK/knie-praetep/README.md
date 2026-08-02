# Röntgen Knie präoperativ vor TEP

**ID:** HJK-MRRT-KNIE-PRAETEP
**Version:** 1.7
**Status:** Pilot

## Auf einen Blick

Zweigeteilte Struktur — kanonisch ist die Quelle, die Demo ist abgeleitet:

- 📄 **[`template.html`](./template.html)** — kanonisch, Quelle der Wahrheit (nacktes MRRT, voll kodiert). **Inhaltliche Änderungen hier.**
- 🖥 **[Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/knie-prae-tep/)** — gerendertes Schaufenster (GitHub Pages), abgeleitet aus `template.html`. **Gebaut, nicht von Hand editieren.**
- 📁 [`demo/knie-prae-tep/index.html`](../../../../demo/knie-prae-tep/index.html) — Quelltext der Demo im Repo.

## Zweck

Strukturierte Befundvorlage für die **präoperative Planung einer Knie-TEP bei Primärarthrose**. Erfasst Beinachse, Arthrosegrad und patellofemoralen Status standardisiert und liefert daraus einen CPAK-Phänotyp sowie einen klickbaren Beurteilungsvorschlag. RadLex/LOINC-kodiert mit FHIR-R4-Export.

## Vorbefüllung und Feldzustände (Verification Floor, SPEC-ADDENDUM-A)

Es gibt **keine stille Auffüllung**. Ein KI-Vorschlag (Achsenmessung aus LAMA,
IB Lab, DICOM SR) wird nie ungeprüft als Feldwert übernommen. Jedes Messfeld
löst kanonisch in **einen von fünf Zuständen** auf; der Status wird **abgeleitet,
nicht gesetzt** (Ableitungsregel A3):

| Zustand | Bedeutung | Export | Referenzlabel |
|---|---|---|---|
| `active-confirmed` | Vorschlag per Auswahlakt bestätigt | Observation mit Wert | ja |
| `active-corrected` | Vorschlag per Auswahlakt geändert | Observation mit Wert | ja |
| `active-rejected` | **nicht beurteilbar**, kein Ersatzwert | Observation **ohne** `value[x]`, mit `dataAbsentReason` | nein |
| `passive-accepted` | durchgewinkt, kein Interaktionsereignis | Observation mit Wert | nein |
| `not-attested` | kein Wert, kein Vorschlag | keine Observation | – |
| `manual-entered` | Feld ohne KI-Beteiligung | Observation mit Wert | ja |

**Ein Auswahlakt pro Feld** (bestätigen / korrigieren / nicht beurteilbar) —
sich gegenseitig ausschließend, keine Vorauswahl; das Korrekturfeld ist erst
nach Auswahl von „Korrigieren" eingabefähig; der Vorschlag bleibt in jedem
Zustand sichtbar; jeder Zustandswechsel erzeugt ein Interaktionsereignis mit
Zeitstempel. Der **Rohwert** bleibt in allen Zuständen mit Vorschlag in
`aiSource.rawValue` erhalten. Ausgeführt in `demo/knie-prae-tep/demo.js`; die
Bedienoberfläche ist eine Darstellungsfrage, verbindlich ist der abgeleitete
Zustand und was er emittiert.

> **HKA-Vorzeichenkonvention (durch FR zu bestätigen):** Für HKA ist im Template
> ein Transform-Schritt `sign-inversion-applied` deklariert (`data-ai-transform`
> im kanonischen Template). Demo-Annahme: externer Rohwert als varus-positive
> Abweichung → interner absoluter Tragachsenwinkel (`180 − Rohwert`, `<180° =
> Varus`), Rohwert bleibt erhalten. Die **konkrete LAMA-Ausgabekonvention** ist
> noch nicht verifiziert (nicht geraten) — vor Pilotbetrieb gegen das LAMA
> Conformance Statement prüfen und den Transform ggf. anpassen. Der Mechanismus
> (Transform vor Anzeige, Rohwert-Erhalt, Korrektur ≠ Bestätigung nach Transform)
> ist unabhängig davon umgesetzt und getestet (Fixture 12).

## Sektionen

| Sektion | Inhalt |
|---|---|
| Technik | Projektionen: AP stehend, seitlich, Patella tangential (opt.), Ganzbein einseitig kalibriert, Rosenberg (opt.) |
| Achsenvermessung | HKA, MAD, LLD, mLDFA, mMPTA, JLCA |
| Arthrosegrad – Kellgren-Lawrence | KL medial / lateral / patellofemoral als 3-Spalten-Grid |
| Patellofemoraler Status (optional) | Insall-Salvati, Caton-Deschamps, Patella alta/baja, Patellatilt, Trochleadysplasie (Dejour) – kollabierbar |
| Tibialer Slope (optional) | kollabierbar |
| Zusatzbefunde | Osteophyten, subchondrale Zysten/Sklerose, freie Gelenkkörper, Erguss, Baker-Zyste, Chondrokalzinose |
| Knochenstruktur | – |
| Klinische Angabe / Voruntersuchung / Freitext | Kontext und Ergänzungen |

## Klassifikationen

- **Kellgren-Lawrence** (Ann Rheum Dis 1957) – pro Kompartiment medial / lateral / patellofemoral
- **CPAK** (MacDessi 2021) – nachgelagerte / Demo-Funktion, **kein Template-Live-Feature**.
  Ableitung aus den Primär-Eingängen mMPTA/mLDFA (im Template): `aHKA = mMPTA − mLDFA`,
  `JLO = mMPTA + mLDFA` → Phänotyp I–IX

## KI-Tools

| Tool | Status | Output |
|---|---|---|
| LAMA (IB Lab) | produktiv-lizenziert | DICOM SR |
| KOALA (IB Lab) | Testphase | DICOM SR |

## Kodierung

RadLex auf allen diskreten Befunden, LOINC auf Achsenmessungen und Report-Typ. Details und Verifikationsstatus siehe [RADLEX-MAPPING.md](./RADLEX-MAPPING.md).

| Ressource | Code | System |
|---|---|---|
| DiagnosticReport | 24650-4 | http://loinc.org |
| Observations | RID* | http://radlex.org |
| Achsenmessungen | LP* | http://loinc.org |

## Output

- Fließtext (Syngo/Carbon kompatibel, keine Flags im Text)
- JSON strukturiert
- FHIR Bundle R4 (DiagnosticReport + Observations, doppelte Kodierung LOINC + RadLex; Messwert-Observations mit feldgebundener `ai-attestation`-Extension, `aiSource`-Provenance und – bei Ablehnung – `dataAbsentReason`)

## Quellen

- Kellgren JH, Lawrence JS. Ann Rheum Dis 1957;16:494-502
- MacDessi SJ et al. Bone Joint J 2021;103-B(3):329-337
- Paley D. Principles of Deformity Correction. Springer 2002
- IB Lab GmbH. LAMA Conformance Statement (DICOM SR)

## Versionshistorie

Siehe [CHANGELOG.md](./CHANGELOG.md)
