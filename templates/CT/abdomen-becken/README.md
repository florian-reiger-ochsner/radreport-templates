# CT Abdomen + Becken

**ID:** HJK-MRRT-CT-ABDBECKEN
**Version:** 2.0
**Status:** Pilot · A-Struktur

## Auf einen Blick

Zweigeteilte Struktur — kanonisch ist die Quelle, die Demo ist abgeleitet:

- 📄 **[`template.html`](./template.html)** — kanonisch, Quelle der Wahrheit (nacktes MRRT, voll kodiert). **Inhaltliche Änderungen hier.**
- 🖥 **[Live-Demo](https://florian-reiger-ochsner.github.io/radreport-templates/demo/ct-abdomen/)** — gerendertes Schaufenster (GitHub Pages), abgeleitet aus `template.html`. **Gebaut, nicht von Hand editieren.**
- 📁 [`demo/ct-abdomen/index.html`](../../../demo/ct-abdomen/index.html) — Quelltext der Demo im Repo.

## Zweck

Strukturierte Befundvorlage **CT Abdomen + Becken**. Basis ist die organsystematische Befundung (11 Organsysteme); Akutes Abdomen und Onkologie/RECIST sind optionale, immer zugängliche Sektionen. Alle KM-Phasen wählbar.

> **A-Struktur / Modiswitch aufgelöst (v2.0):** Der frühere 3-Kontext-Umschalter (allg/notfall/onko) entfällt. Die Notfall-Checkliste und der onkologische Kontext/RECIST sind optionale `<details>`-Sektionen. Textbausteine und Ampel-Status schalten **inhaltsgetrieben** (Notfall-Positiva bzw. RECIST-Daten vorhanden), nicht mehr über einen Modus.

## Sektionen

| Sektion | Besonderheit |
|---|---|
| Organsystematik (Basis) | 11 Organsysteme, RadLex-kodierte Felder, Organ-Navigation (Demo) |
| Akutes Abdomen (optional) | 8-Punkte-Notfall-Checkliste (Perforation, Ileus, Ischämie, Appendizitis…), Alert-Badge bei positivem Befund |
| Onkologie / RECIST (optional) | RECIST-1.1-Tabelle (bis 5 Zielläsionen), SLD-Summe automatisch, Gesamtansprechen CR/PR/SD/PD |

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
