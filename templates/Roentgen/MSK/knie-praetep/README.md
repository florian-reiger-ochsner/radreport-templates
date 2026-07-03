# Röntgen Knie präoperativ vor TEP

**ID:** HJK-MRRT-KNIE-PRAETEP
**Version:** 1.5
**Status:** Pilot
**Struktur:** A – kanonisches `template.html` (nackt, JS-frei) + abgeleitete Demo via `build-demo.js`
**Demo:** [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/knie-prae-tep/)

## Zweck

Strukturierte Befundvorlage für die **präoperative Planung einer Knie-TEP bei Primärarthrose**. Erfasst Beinachse, Arthrosegrad und patellofemoralen Status standardisiert und liefert daraus einen CPAK-Phänotyp sowie einen klickbaren Beurteilungsvorschlag. RadLex/LOINC-kodiert mit FHIR-R4-Export.

## Vorbefüllung und Feldstatus

Es gibt **keine globalen Betriebsarten**. Die Vorbefüllung ist eine **einmalige
Aktion** (Achsenmessungen aus LAMA, IB Lab, DICOM SR werden übernommen), kein
dauerhafter Modus. Jedes Feld trägt anschließend einen **feldgranularen Status**:

| Feldstatus | Bedeutung |
|---|---|
| unbestätigt | vorbefüllter Wert, noch nicht befundend bestätigt |
| aktiv bestätigt | Wert vom Befundenden übernommen |
| korrigiert | vorbefüllter Wert manuell überschrieben |

Manuelle Eingabe ohne Vorbefüllung ist jederzeit möglich; ein leeres Feld ist
schlicht unbefüllt.

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
- FHIR Bundle R4 (DiagnosticReport + Observations, doppelte Kodierung LOINC + RadLex)

## Quellen

- Kellgren JH, Lawrence JS. Ann Rheum Dis 1957;16:494-502
- MacDessi SJ et al. Bone Joint J 2021;103-B(3):329-337
- Paley D. Principles of Deformity Correction. Springer 2002
- IB Lab GmbH. LAMA Conformance Statement (DICOM SR)

## Versionshistorie

Siehe [CHANGELOG.md](./CHANGELOG.md)
