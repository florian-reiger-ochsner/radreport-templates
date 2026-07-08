#!/usr/bin/env python3
"""xml-sanitize.py – Sanierung kanonischer template.html zu polyglot-XHTML.

Rein mechanische XML-Wohlgeformtheits-Fixes, DOM-semantisch identisch
(Struktur/Text/Kodierung unveraendert):
  1. Void-Elemente selbstschliessen  (<input ...>  -> <input ... />)
  2. Boolean-Attribute mit Wert       (checked      -> checked="checked")
  3. Benannte Entities numerisch       (&nbsp;       -> &#160;)
  4. '<' und bare '&' in Attributwerten escapen (< -> &lt;, & -> &amp;)

Arbeitet quote-bewusst und ausschliesslich innerhalb von Start-Tags; Attribut-
werte, die '>' enthalten (z. B. placeholder="z.B. >1/3"), bleiben intakt.

Usage:
  python3 shared/scripts/xml-sanitize.py <datei ...>            # Dry-Run (nur Report)
  python3 shared/scripts/xml-sanitize.py --apply <datei ...>    # schreibt Fixes

Empfohlener Workflow: neue Templates gleich wohlgeformt schreiben. Dieses Skript
ist die Notausstieg-Reparatur (z. B. bei Migration von Alt-Files). Die harten
Gates sind build-demo.js (xmllint-Guard) und .githooks/pre-commit. Nach --apply
immer den Diff pruefen und mit `xmllint --noout` gegenchecken.
"""
import re, sys

VOID = {"meta","input","br","hr","img","link","col","area","base","embed","source","track","wbr"}
BOOL = ["checked","selected","multiple","disabled","required","readonly","autofocus","novalidate","hidden","open","reversed","default"]

# Start-Tag: Name + Attributabschnitt (quoted Strings schuetzen '>'), optional schon /
TAG = re.compile(r'<(?P<name>[a-zA-Z][\w:-]*)(?P<attrs>(?:"[^"]*"|\'[^\']*\'|[^>"\'])*?)(?P<slash>\s*/?)>')

# Segmentierung des Attributstrings in quoted vs. unquoted
SEG = re.compile(r'"[^"]*"|\'[^\']*\'')
BOOL_RE = re.compile(r'(?<![\w-])(' + '|'.join(BOOL) + r')(?![\w=-])')
# bare '&' (nicht Beginn einer gueltigen Entity)
BARE_AMP = re.compile(r'&(?!#\d+;|#x[0-9a-fA-F]+;|[a-zA-Z][a-zA-Z0-9]*;)')

def fix_bool_in_unquoted(text):
    return BOOL_RE.sub(lambda m: f'{m.group(1)}="{m.group(1)}"', text)

def fix_attrs(attrs):
    out, last = [], 0
    for m in SEG.finditer(attrs):
        out.append(fix_bool_in_unquoted(attrs[last:m.start()]))
        # quoted Wert: '<' ist in XML-Attributwerten unzulaessig -> &lt;
        out.append(m.group(0).replace('<', '&lt;'))
        last = m.end()
    out.append(fix_bool_in_unquoted(attrs[last:]))
    return ''.join(out)

def repl_tag(m):
    name = m.group('name')
    attrs = fix_attrs(m.group('attrs'))
    slash = m.group('slash')
    if name.lower() in VOID:
        return f'<{name}{attrs.rstrip()} />'
    return f'<{name}{attrs}{slash}>'

def sanitize(src):
    # 1) bare '&' global escapen (schuetzt bestehende Entities inkl. &nbsp;)
    out = BARE_AMP.sub('&amp;', src)
    # 2) Tags: Void self-close, Boolean-Attrs, '<' in Attributwerten
    out = TAG.sub(repl_tag, out)
    # 3) benannte HTML-Entity ohne XML-Definition -> numerisch
    out = out.replace('&nbsp;', '&#160;')
    return out

if __name__ == '__main__':
    apply = '--apply' in sys.argv
    files = [a for a in sys.argv[1:] if not a.startswith('-')]
    if not files:
        print(__doc__)
        sys.exit(2)
    changed = 0
    for f in files:
        s = open(f, encoding='utf-8').read()
        o = sanitize(s)
        if o != s:
            changed += 1
            if apply:
                open(f, 'w', encoding='utf-8').write(o)
                print(f'[fixed]     {f}')
            else:
                print(f'[would-fix] {f}')
        else:
            print(f'[ok]        {f}')
    print(f'--- {changed}/{len(files)} geaendert (apply={apply})')
    # Dry-Run mit Fund -> exit 1 (fuer CI/Guard nutzbar)
    sys.exit(1 if (changed and not apply) else 0)
