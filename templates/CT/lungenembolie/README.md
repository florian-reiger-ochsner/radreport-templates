# CT Lungenarterien (CTPA)

**ID:** HJK-MRRT-CT-LUNGENEMBOLIE
**Version:** 1.0
**Status:** Pilot
**Quelle:** DRG AK Befundung AG Thoraxdiagnostik 041807.2.1806120000 (CC BY 4.0), adaptiert
**Demo:** [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/ct-lungenembolie/)

## Zweck

Strukturierte Befundvorlage **CT Pulmonalisangiographie (CTPA)** zum Ausschluss/Nachweis einer Lungenembolie. Kernfeature: automatischer RV/LV-Ratio-Kalkulator mit ESC-2019-Risikostratifizierung.

## RV/LV-Ratio-Kalkulator

RV- und LV-Durchmesser eingeben → Ratio live berechnet:
- ≥ 1,0: erhöhtes Risiko (rot) nach ESC 2019
- < 1,0: niedriges Risiko (grün)

## LE-Nachweis-Toggle

⚠ Positiv · ✓ Negativ · ? Fraglich – mit farbigem Pill in der Vorschau und kontextsensitivem Beurteilungsvorschlag.

## Lokalisation

- Ebene: Zentral · Lobär · Segmental · Subsegmental (Chips)
- Anatomisch: Truncus/A. pulm. re./li. · OL/ML/UL re. · OL-Lingula/UL li.

## Weitere Befunde

Truncus pulmonalis-Durchmesser · Pleura · Parenchym (Infarktpneumonie, Hampton's Hump) · Atemwege · Lymphknoten · Herz/Gefäße · Oberbauch · Knochen · KM-Rückstau (VCI/Lebervenen)

## Output

- Fließtext
- FHIR Bundle R4 (LOINC 24634-8 + SNOMED 59282003), RV/LV-Ratio mit `interpretation: High` wenn ≥ 1,0

## Lizenz

Basierend auf DRG AK Befundung AG Thoraxdiagnostik, Template 041807.2.1806120000, CC BY 4.0.

## Quellen

- DRG AK Befundung AG Thoraxdiagnostik. https://github.com/DRGagit/ak_befundung
- Konstantinides SV et al. ESC Guidelines on Acute PE. Eur Heart J 2020;41(4):543-603

## Versionshistorie

Siehe [CHANGELOG.md](./CHANGELOG.md)
