# Code-Treue-Lint — RadLex/LOINC

Zwei Schichten, damit der Round-Trip **lokal und deterministisch** bleibt und
der Registry-Abgleich trotzdem an einer echten Quelle hängt.

```
Schicht 1  validate-codes.js   offline, verbatim   Template ⇄ RADLEX-MAPPING.md
Schicht 2  resolve-radlex.js   online, BioPortal   RID → prefLabel → radlex-cache.json
             └── validate-codes.js --resolve  lintet OFFLINE gegen den Cache
```

## Schicht 1 — `shared/scripts/validate-codes.js` (offline)

Fängt die *valid-but-wrong*-Falle: ein Code kann existieren und trotzdem das
falsche Label tragen. Geprüft wird die **Display-Treue** — der am Code hängende
englische RadLex-Term (`data-en` am Element = Term-Spalte im Mapping):

| Prüfung | Wirkung |
|---|---|
| `[STRUKTUR]` fehlendes `data-en`, ungültiges RID/LOINC-Format, echter RID **und** `data-radlex-status` zugleich | harter Fehler → exit 1 |
| `[DISPLAY]` Code in Template **und** Mapping → Displays müssen verbatim gleich sein | harter Fehler → exit 1 |
| `[ABDECKUNG]` Template-Code ohne Mapping-Eintrag / umgekehrt; RID-Basis-Divergenz | Report |
| `[STATUS]` Konzept im Template `local`, im Mapping aber ✅verified | Report (`--strict-status` → Fehler) |

```bash
node shared/scripts/validate-codes.js templates/Roentgen/MSK/knie-praetep
node shared/scripts/validate-codes.js <dir> --json          # maschinenlesbar
node shared/scripts/validate-codes.js <dir> --strict-status  # STATUS hart
```

Ohne Argument läuft der Default gegen `knie-praetep`. Kein Netz, keine
Abhängigkeiten — CI-/pre-commit-tauglich.

## Schicht 2 — `shared/scripts/resolve-radlex.js` (BioPortal)

Erdet die verwendeten RIDs an NCBO BioPortal (Ontologie RADLEX) und schreibt
`radlex-cache.json`. Gegen diesen Cache lintet Schicht 1 mit `--resolve` weiter
**offline** — der Netz-Call ist ein bewusster Refresh, kein Teil des Round-Trips.

```bash
# API-Key kostenlos: https://bioportal.bioontology.org/account
export BIOPORTAL_APIKEY=xxxxxxxx
node shared/scripts/resolve-radlex.js templates/Roentgen/MSK/knie-praetep
node shared/scripts/validate-codes.js templates/Roentgen/MSK/knie-praetep --resolve

node shared/scripts/resolve-radlex.js <dir> --dry-run    # nur RIDs+URLs, kein Key
node shared/scripts/resolve-radlex.js <dir> --diagnose 3 # Rohfelder der ersten 3 RIDs zeigen
node shared/scripts/resolve-radlex.js --all              # alle Templates scannen
RADLEX_MOCK=mock.json node shared/scripts/resolve-radlex.js <dir>   # Offline-Test
```

- **Klassen-URI-Schema:** `http://www.radlex.org/RID/RID<n>` (BioPortal, mit `www.`) · FHIR-`system`: `http://radlex.org`
- **Sprache:** Die BioPortal-RADLEX-Submission liefert `prefLabel` **deutsch**. Der
  Resolver zieht das englische Feld (`Preferred_name` → `englishLabel`) aus den
  Properties; `--resolve` matcht `data-en` gegen `englishLabel` **oder** prefLabel
  **oder** Synonyme. `--diagnose N` zeigt die Rohfelder, falls das englische Feld
  anders heißt als erwartet.
- **Key** kommt ausschließlich aus `env BIOPORTAL_APIKEY` — nie im Code/Repo.
- **`--resolve`-Fehler:** RID nicht im Cache, in BioPortal nicht gefunden, oder
  prefLabel ≠ Template-Display → exit 1. Das hebt ein Konzept mit Beleg von
  🟡 `local` auf ✅ `verified`.
- LOINC-Parts (`LP*`) laufen über einen separaten LOINC-Dienst — nicht Teil
  dieses RadLex-Resolvers.

## `radlex-cache.json`

Wird **committet** (offline-Snapshot für CI), aber nur aus einem echten
BioPortal-Lauf — kein `RADLEX_MOCK`-Ergebnis einchecken. Struktur:

```json
{
  "codeSystem": "http://radlex.org",
  "source": "NCBO BioPortal (ontologies/RADLEX)",
  "generated": "…ISO…",
  "counts": { "total": 0, "resolved": 0, "notFound": 0, "errors": 0 },
  "terms": { "RID4757": { "uri": "…", "prefLabel": "osteophyte", "synonyms": [], "sources": ["…"] } }
}
```
