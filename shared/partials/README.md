# shared/partials

Geteilte, deklarative MRRT-Fragmente, die in mehrere kanonische `template.html`
gestempelt werden. **Single Source of Truth** für templateübergreifende Blöcke –
nie von Hand in die Templates kopieren, sondern über das zugehörige Stamp-Skript
verteilen, damit die Templates nicht auseinanderdriften.

## `ris-header.html` — RIS-/Signatur-Kopf

Administrative Auftrags-/RIS-Felder (Accession, Patient-ID, Untersuchungsdatum,
Zuweiser) und Signatur (signierender Befunder als generischer Practitioner-
Identifier + optionaler Klartext, Signaturdatum).

- Deklaratives, XML-wohlgeformtes MRRT. Kein CSS/JS. `rr-*`-Hooks, `fieldset`/
  `legend` (Styling-Reset in der Demo `demo.js`).
- **Administrative** Felder tragen `data-ris-source` (HL7/RIS-Mapping-Schlüssel),
  bewusst **kein** `data-radlex` (RadLex kodiert Befunde, nicht Auftragsmetadaten).
- Keine Defaults. In Produktion vom RIS/HL7 gefüllt, im Standalone überschreibbar.

### Stempeln

```bash
# in ein Template stempeln (idempotent; Marker rr:ris-header:start/end)
node shared/scripts/stamp-ris-header.js templates/CT/schaedel-nativ/template.html

# mehrere auf einmal
node shared/scripts/stamp-ris-header.js templates/**/template.html

# nur prüfen (CI/Vor-Commit), ob der Block aktuell ist
node shared/scripts/stamp-ris-header.js --check templates/CT/schaedel-nativ/template.html
```

Nach dem Stempeln **immer** die Demo neu ableiten
(`shared/scripts/build-demo.js`) — dort laufen Lean- und XML-Guard.

### FHIR-Anbindung (in `demo.js`)

`interpreter-id` → `Practitioner.identifier`
(`http://hjk.wien/fhir/sid/interpreter`) → `DiagnosticReport.resultsInterpreter`.
Damit ist die Auswertung „nur meine Befunde" über den FHIR-Suchparameter
`results-interpreter` möglich. Die konkrete Personenliste ist Deployment-Config,
**nicht** Repo-Inhalt.
