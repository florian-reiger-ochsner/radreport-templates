# CT Abdomen + Becken

**ID:** HJK-MRRT-CT-ABDBECKEN
**Version:** 1.0
**Status:** Pilot
**Demo:** [Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/ct-abdomen/)

## Zweck

Strukturierte Befundvorlage **CT Abdomen + Becken** mit drei klinischen Kontexten: Onkologisches Staging/RECIST, Akutes Abdomen/Notfall, Allgemein. Alle KM-Phasen wählbar. Organ-systematische Tab-Navigation.

## Kontexte

| Kontext | Besonderheit |
|---|---|
| Onkologisches Staging / RECIST | RECIST-1.1-Tabelle (bis 5 Zielläsionen), SLD-Summe automatisch, Gesamtansprechen CR/PR/SD/PD |
| Akutes Abdomen / Notfall | 8-Punkte-Notfall-Checkliste (Perforation, Ileus, Ischämie, Appendizitis…), Alert-Badge bei positivem Befund |
| Allgemein | Organsystematische Befundung, Zufallsbefunde |

## Organe (11 Tabs)

Leber · GB/Gallenwege · Pankreas · Milz · Nieren/NN · GI-Trakt · Gefäße · Lymphknoten · Peritoneum · Becken · Skelett/Weichteile

## KM-Phasen

Nativ · Arteriell · Portal-venös · Spätphase · Nativ+PV (beliebig kombinierbar)

## Output

- Fließtext
- FHIR Bundle R4 (LOINC 30652-8)

## Quellen

- Eisenhauer EA et al. RECIST 1.1. Eur J Cancer 2009;45(2):228-247

## Versionshistorie

Siehe [CHANGELOG.md](./CHANGELOG.md)
