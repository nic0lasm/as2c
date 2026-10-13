#!/usr/bin/env python3
"""Vérifie le site AS2C (dossier www) : liens internes, images, sitemap, index de recherche.
Usage : python3 verifier.py   (depuis n'importe où)
Ne modifie aucun fichier."""
import os, re, json, sys
from urllib.parse import unquote, urlparse

WWW = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'www')
WWW = os.path.normpath(WWW)

def resoudre(nom):
    """Reproduit les règles .htaccess : URL publique -> fichier réel."""
    nom = nom.lstrip('/')
    if nom == '':
        nom = 'index.html'
    if re.match(r'^details-.+\.html$', nom):
        return os.path.join(WWW, 'articles', nom)
    if re.match(r'^gestion-de-patrimoine-.+\.html$', nom):
        return os.path.join(WWW, 'categories', nom)
    return os.path.join(WWW, nom)

pages = []
for d, _, fs in os.walk(WWW):
    for f in fs:
        if f.endswith('.html'):
            pages.append(os.path.join(d, f))

manquants = {}
placeholders = []
attr = re.compile(r'(?:href|src)="([^"]+)"')
for p in pages:
    html = open(p, encoding='utf-8', errors='replace').read()
    rel = os.path.relpath(p, WWW)
    for m in ('YOUR_FORM_ID', 'G-XXXXXXXXXX', 'VOTRE_CODE_ICI', 'lorem ipsum'):
        if m.lower() in html.lower() and '<!--' not in html[max(0, html.lower().find(m.lower())-400):html.lower().find(m.lower())]:
            placeholders.append((rel, m))
    for url in attr.findall(html):
        u = urlparse(url)
        if u.scheme or url.startswith(('#', 'mailto:', 'tel:', 'javascript:', '//')):
            if 'as2cpatrimoine.com' in u.netloc:
                url = u.path
            else:
                continue
        chemin = unquote(urlparse(url).path)
        if not chemin:
            continue
        cible = resoudre(chemin)
        if not os.path.exists(cible):
            manquants.setdefault(chemin, set()).add(rel)

print(f"Pages HTML : {len(pages)}")
imgs = [k for k in manquants if k.startswith(('assets/', '/assets/'))]
liens = [k for k in manquants if k not in imgs]
print(f"\nRessources manquantes (images/fichiers) : {len(imgs)}")
for k in sorted(imgs):
    print(f"  - {k}  (dans {len(manquants[k])} page(s), ex. {sorted(manquants[k])[0]})")
print(f"\nLiens internes cassés : {len(liens)}")
for k in sorted(liens):
    print(f"  - {k}  (dans {len(manquants[k])} page(s), ex. {sorted(manquants[k])[0]})")

# sitemap
sm = open(os.path.join(WWW, 'sitemap.xml'), encoding='utf-8').read()
locs = re.findall(r'<loc>https?://[^/]+/([^<]*)</loc>', sm)
absents = [l for l in locs if not os.path.exists(resoudre(unquote(l)))]
publics = set()
for p in pages:
    n = os.path.basename(p)
    if n != '404.html':
        publics.add(n)
hors_sitemap = sorted(publics - set(unquote(l) or 'index.html' for l in locs))
print(f"\nSitemap : {len(locs)} URL, {len(absents)} pointent vers un fichier absent, {len(hors_sitemap)} page(s) absente(s) du sitemap")
for l in absents: print("  - absent :", l)
for l in hors_sitemap: print("  - hors sitemap :", l)

# index de recherche
idx = json.load(open(os.path.join(WWW, 'search-index.json'), encoding='utf-8'))
mort = [e['u'] for e in idx if not os.path.exists(resoudre(e['u']))]
print(f"\nIndex de recherche : {len(idx)} entrées, {len(mort)} vers une page absente")
for u in mort: print("  -", u)

print(f"\nÀ compléter (valeurs d'exemple encore actives) : {len(placeholders)}")
for r, m in placeholders: print(f"  - {r} : {m}")

# images non utilisées
toutes = set()
for p in pages:
    toutes |= set(re.findall(r'assets/img/([^"?\s)]+)', open(p, encoding='utf-8', errors='replace').read()))
dispo = set(os.listdir(os.path.join(WWW, 'assets', 'img')))
print(f"\nImages : {len(dispo)} dans assets/img, {len(dispo - toutes)} non utilisées par les pages")
