# Röntgen Knie postoperativ nach KTEP

**ID:** HJK-MRRT-KNIE-POSTTEP
**Version:** 1.1
**Status:** Pilot
**Demo:** [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/knie-posttep/)

## Zweck

Strukturierte Befundvorlage für die **postoperative radiologische Beurteilung nach Knie-TEP**. Vier Kontexte in einem Template: Intraoperativ (EndoCert-Pflicht), Früh-postoperativ, Verlaufskontrolle, Revisionsverdacht.

## Kontexte

| Kontext | Zeitfenster | Besonderheit |
|---|---|---|
| Intraoperativ / EndoCert | OP-Tag | EndoCert-Checkliste (6 Punkte), Pflichtdokumentation |
| Früh-postoperativ | 0–6 Wochen | Komplikationsausschluss |
| Verlaufskontrolle | 6 Wo – 2 Jahre | Ewald-Zonen, Lysesaum-Progredienz |
| Revisionsverdacht | beliebig | Loosening, Infektion, Malalignment |

## EndoCert-Checkliste (Intraop-Modus)

1. Implantat korrekt positioniert
2. Zementierung vollständig
3. Keine periprothetische Fraktur
4. Kein Hinweis auf Luxation
5. Alignment ohne dringlichen Korrekturbedarf
6. Patella zentriert (falls Patellaersatz)

## Implantat-Presets (Zimmer Biomet HJK-Standard)

- Persona PS · Persona CR
- NexGen LPS · NexGen CR-Flex

## Ewald-Zonen (Verlauf/Revision)

10 Zonen (F1–F5 Femur, T1–T5 Tibia) nach Knee Society Roentgenographic Evaluation.
Pro Zone: Lysesaum-Ausmaß · Osteolyse · Verlauf.

## Output

- Fließtext (Syngo/Carbon kompatibel, keine Flags im Text)
- JSON strukturiert
- FHIR Bundle R4 mit EndoCert-Tag

## Quellen

- Ewald FC. Arthroplasty 1989;4(3):265-272
- MacDessi SJ et al. Bone Joint J 2021;103-B(3):329-337

## Versionshistorie

Siehe [CHANGELOG.md](./CHANGELOG.md)
