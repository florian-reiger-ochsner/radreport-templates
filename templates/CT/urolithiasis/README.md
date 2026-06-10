# CT Urolithiasis

**ID:** HJK-MRRT-CT-UROLITHIASIS
**Version:** 1.0
**Status:** Pilot
**Quelle:** DRG AK Befundung 041807.2.2203092150 (CC BY 4.0), adaptiert
**Demo:** [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/ct-urolithiasis/)

## Zweck

Strukturierte Befundvorlage **CT Urolithiasis** (Steinsuche, nativ). Basiert auf dem konsentierten DRG-Template, erweitert um Multi-Stein-Stack, DECT-Substanzbestimmung und FHIR-Export.

## Multi-Stein-Stack

Jedes Konkrement einzeln dokumentieren:
- Typ · Seite · Lokalisation (11 Positionen nach DRG)
- Maximaldurchmesser · Volumen · Dichte (HU)
- Substanz nach DECT · Soft-tissue-rim-sign · Zentrale Dichteabsenkung · Comet-tail-sign

## Harntransportstörung

NBKS-Aufweitung Grad 0–4 · Ureter-Aufweitung nach Drittel + Durchmesser · Perirenales Ödem – jeweils beidseits getrennt.

## Output

- Fließtext
- FHIR Bundle R4 (LOINC 24634-8), eine Observation pro Konkrement

## Lizenz

Basierend auf DRG AK Befundung, Template 041807.2.2203092150, CC BY 4.0.
Quellennennung im `dcterms.source`-Metatag.

## Quellen

- DRG AK Befundung. https://github.com/DRGagit/ak_befundung
- Türk C et al. EAU Guidelines on Urolithiasis 2022

## Versionshistorie

Siehe [CHANGELOG.md](./CHANGELOG.md)
