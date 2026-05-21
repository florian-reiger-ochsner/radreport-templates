# Mitarbeit am Repo

## Voraussetzung

GitHub-Account mit Schreibrechten am Repo. Falls noch nicht eingerichtet, kurz bei [@maintainer] melden.

## Workflow im Überblick

1. **Issue anlegen** – Bevor du eine neue Vorlage baust oder größere Änderungen machst, eröffne ein Issue. So sieht jeder, was läuft, und doppelte Arbeit wird vermieden.
2. **Branch anlegen** – Pro Vorlage / Änderung einen eigenen Branch, kein direktes Arbeiten auf `main`.
3. **Pull Request** – Wenn du fertig bist, öffne einen PR gegen `main`. Lint-Checks laufen automatisch, mindestens 1 Review ist Pflicht.
4. **Review und Merge** – Nach Freigabe wird gemerged. CODEOWNERS regelt automatisch, wer reviewen muss.

## Branch-Namensschema

```
feature/<modalitaet>-<region>-<kurzbeschreibung>   # neue Vorlage
revision/<modalitaet>-<region>-<grund>             # bestehende Vorlage anpassen
site/<standort>-<thema>                            # standortspezifische Änderung
docs/<thema>                                       # nur Doku
```

**Beispiel:** `feature/roe-knie-praetep`, `revision/mrt-lws-pfirrmann-update`, `docs/style-guide-radlex`

## Commit-Nachrichten

Kurz, im Imperativ, deutsch oder englisch konsistent. Beispiele:

- `Knie prä-TEP: Kalibrationskugel ergänzt`
- `LI-RADS: Major Features als Auswahl umgesetzt`
- `Docs: Pfirrmann-Klassifikation referenziert`

## Vorlage anlegen oder bearbeiten

Eine Vorlage besteht aus einem Verzeichnis unter `templates/<MOD>/<REGION>/`:

```
templates/Roentgen/MSK/knie-praetep/
├── README.md           # fachliche Doku, Klassifikationen, Quellen
├── template.html       # MRRT-Template (Source of Truth), im Browser lauffähig
├── CHANGELOG.md        # Versionsverlauf
└── frontmatter.yaml    # Metadaten (id, version, codes, autoren, naechste-pruefung)
```

Optional, mit wachsendem Repo:

```
└── tests/              # Beispieldaten, Validierungsfälle
```

## Versionierung

- Vorlagen tragen eine Versionsnummer (`v1.0`, `v1.1`, `v1.2`)
- Breaking Changes erhöhen die Major-Version
- Versions-Tag bei Release: `git tag knie-praetep-v1.2 && git push --tags`

## Naming-Konventionen

- Verzeichnisnamen: `kebab-case`, kleingeschrieben, keine Umlaute (`knie-praetep`, nicht `Knie-prä-TEP`)
- Dateinamen: gleiches Schema
- Innerhalb von Dokumenten: lateinische Nomenklatur, Klassifikationen wie definiert

## Bei Fragen

Issue eröffnen oder direkt ansprechen. Das Projekt ist klein und überschaubar – keine Bürokratie, lieber kurz austauschen als langes Review.
