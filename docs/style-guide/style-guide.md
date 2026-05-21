# Style Guide

## Sprache

- **Deutsch** mit lateinischer Nomenklatur
- **Telegrammstil**, aktiv
- **Englische Akronyme** beibehalten wenn etabliert (HKA, CPAK, mLDFA, KL, vdH-SS, LI-RADS), beim ersten Auftreten ausschreiben

## Struktur (klassisch)

1. Technik
2. Klinische Angabe / Fragestellung
3. Befund (organbezogen)
4. Beurteilung

## Beurteilung

- **Fließtext**, keine Nummerierung
- **Keine automatischen Empfehlungen** (Empfehlungen dem zuweisenden Kliniker überlassen)
- Synthese, nicht Wiederholung des Befunds

## Seitenangaben

- `re.` / `li.` als Kurzform
- `bds.` nur, wenn anatomisch/diagnostisch sinnvoll

## Geschlecht

- Neutral wo möglich
- Sonst Platzhalter `{{Patient/in}}`

## Normalbefund

- Als Fließtext vorgegeben
- Pathologien überschreiben / ergänzen
- Kollabierte (`<details>`) Sektionen für optionale Items

## Platzhalter

- Syntax: `{{...}}`
- Beispiel: `{{HKA_Wert}}°` oder `{{KL_Grad_medial}}`

## Klassifikationen

Standardisiert nach Quelle (siehe `docs/klassifikationen/`):

| Klassifikation | Quelle |
|---|---|
| Bosniak v2019 | Silverman 2019 |
| Pfirrmann | Pfirrmann 2001 |
| Modic | Modic 1988 |
| ASAS | Rudwaleit 2009 |
| Kellgren-Lawrence | KL 1957 |
| Fleischner | Lynch 2018 |
| ATS/ERS/JRS/ALAT | Raghu 2018 |
| LI-RADS v2018 | ACR 2018 |
| CPAK | MacDessi 2021 |
| Tönnis | Tönnis 1976 |
| Brooker | Brooker 1973 |
| Gruen | Gruen 1979 |
| DeLee-Charnley | DeLee 1976 |

## Visueller Look (Live-Demos)

- Schrift: Source Sans 3 (UI), Source Serif 4 (Befundtext)
- Akzentfarbe: `#2c5f8d` (medizinisches Mittelblau)
- Viel Whitespace, klare Hierarchie
- KI-Felder visuell distinkt (heller Tint + Badge)
