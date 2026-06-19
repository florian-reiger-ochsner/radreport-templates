# Changelog – CT Schädel nativ

Format orientiert an Keep a Changelog. Versionierung: SemVer.

## [1.0.0] – 2026-06-19

### Hinzugefügt
- Erstversion CT Schädel nativ (CCT) als Notfall-Massentemplate.
- **Additives Normalbefund-Modell**: Tri-State pro Region (— / o. B. / Befund), kein klinischer Default. Normalbefund-Makro als bewusster Attestierungsakt.
- 7 Befundregionen in Befundungsreihenfolge: Blutung (EDH/SDH/SAB/ICB/IVB, Mehrfachauswahl), Ischämie (Stadium/Territorium/ASPECTS/hämorrh. Transformation), Raumforderung, Mittellinie & Herniation, Ventrikel/Liquorräume, Parenchym (Fazekas), Kalvaria/NNH/Weichteile.
- **Voice-Readiness**: einspaltiges lineares Layout, flache Struktur, `data-voice`-Tokens (deutsche Sprechform) auf Chips/Selects/Optionen, ein Freitext-Diktatfeld pro Region.
- Notfall-Akzent (`--notfall`) und Alert-Badge bei kritischen Regionen (Blutung, Ischämie, Mittellinie/Herniation).
- FHIR-Bundle-Export: nur beurteilte Regionen → Observation; attestierte Negativbefunde mit `interpretation=NEG` + Verification-Floor-Note.
- Live-Befundvorschau, Beurteilungs-Vorschlag (klickbar), Kopier-Funktion.

### Basis
- Felddefinitionen Ischämie/Blutung/Herniation/Fazekas aus DRG AK Befundung `041807.2.2104072101` (ct_stroke_nativ), CC BY 4.0; zur allgemeinen kraniellen Nativ-CT erweitert.

### Offen / nächste Schritte
- **RadLex-Verifikationspass** der neuro-spezifischen RIDs (aktuell provisorisch, s. RADLEX-MAPPING.md).
- Klinischer Pilottest im HJK-Routinebetrieb, Reibungssammlung, Feldschärfung.
- Demoserver-Test mit T. Wagner: Render-Treue → Kodierungs-Überleben → Voice-Token-Adressierbarkeit (Carbon bzw. Sectra).
- Reviewer-Eintrag nach erster klinischer Durchsicht.
