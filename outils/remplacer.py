#!/usr/bin/env python3
"""Remplace un texte dans toutes les pages du site (www), en plusieurs variantes.
Usage : python3 remplacer.py liste   -> affiche les fichiers concernés (sans modifier)
        python3 remplacer.py appliquer
Les paires ANCIEN -> NOUVEAU sont définies ci-dessous pour chaque changement."""
import os, sys
WWW = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'www'))
PAIRES = [
    ('04 81 68 50 55', '06 69 06 25 25'),
    ('+33481685055', '+33669062525'),
    ('0481685055', '0669062525'),
    ('04.81.68.50.55', '06.69.06.25.25'),
]
touches = []
for d, _, fs in os.walk(WWW):
    for f in fs:
        if not f.endswith(('.html', '.json', '.xml', '.js', '.txt')):
            continue
        p = os.path.join(d, f)
        t = open(p, encoding='utf-8').read()
        n = t
        for a, b in PAIRES:
            n = n.replace(a, b)
        if n != t:
            touches.append(os.path.relpath(p, os.path.dirname(WWW)))
            if sys.argv[1:] == ['appliquer']:
                open(p, 'w', encoding='utf-8').write(n)
print('\n'.join(sorted(touches)))
print(len(touches), 'fichier(s)', file=sys.stderr)
