# AS2C Patrimoine — Site web v2 — Guide de déploiement OVH

Ce dossier contient la version finale du site web AS2C Patrimoine, prête pour OVH. Tout est vérifié, audité, et zéro lien cassé.

## ✅ Ce qui est inclus dans cette livraison

- **189 pages HTML** (accueil, contact, cabinet, simulateur, FAQ, 9 catégories, 171 articles, mentions légales, 404 enrichie)
- **279 images** dans `assets/img/` (~80 Mo)
- **Recherche intégrée** côté client (raccourci `⌘K` / `Ctrl+K`)
- **Navigation entièrement responsive** (PC, tablette, mobile, petit mobile)
- **CTA collant en mobile** pour booster la conversion
- **SEO complet** : sitemap (186 URLs), robots, schemas.org (FinancialService + Article + Breadcrumb + FAQ), Open Graph, Twitter Card, canonical
- **`.htaccess` minimal et compatible OVH** (compression, cache, redirection)
- **Bannière cookies** discrète (information seulement, aucun tracking)
- **Placeholder Google Analytics + Search Console** prêt à remplir
- **Domaine canonique** : `https://www.as2cpatrimoine.com` (sans tiret)

## 🚨 IMPORTANT — Avant le déploiement DNS

D'après notre échange, le problème actuel est que le domaine `as2cpatrimoine.com` ne pointe pas encore vers ton hébergement `ascpatu.cluster121.hosting.ovh.net`. Sans cette étape, peu importe ce que tu uploades, tu auras un 404 nginx.

### Fix DNS — 5 minutes

1. **Manager OVH** → menu de gauche → **Web Cloud → Noms de domaine**
2. Clique sur `as2cpatrimoine.com`
3. Onglet **Serveurs Web** (ou **Cibles d'hébergement**)
4. Associe le domaine à `ascpatu.cluster121.hosting.ovh.net`
5. Attendre 30 min à 4 h de propagation

Pour vérifier : [dnschecker.org/#A/as2cpatrimoine.com](https://dnschecker.org/#A/as2cpatrimoine.com)

## 📤 Déploiement des fichiers

### Méthode 1 : FileZilla (recommandée, vu ce que tu utilises déjà)

1. Connecte-toi avec tes identifiants OVH (Hôte : `ftp.cluster121.hosting.ovh.net`, port 21)
2. **Site distant** → va dans `/www/`
3. **Vide le dossier `/www/`** (sélectionne tout → Supprimer)

   ⚠️ Notamment : supprime tout ancien `simulateur-défiscalisation.html` (avec accent) qui pourrait subsister.

4. **Site local** → ouvre le dossier `as2c-patrimoine-site-v2` (issu de la décompression du ZIP)
5. Sélectionne **tout le contenu** du dossier (pas le dossier lui-même)
6. Glisse-dépose dans `/www/`

   ⚠️ Cible visée : `/www/index.html` doit exister. Pas `/www/as2c-patrimoine-site-v2/index.html`.

7. Le transfert prend ~10-15 minutes (80 Mo).

### Méthode 2 : Espace OVH + ZIP (plus rapide)

1. **Manager OVH** → **Web Cloud → Hébergements** → ton hébergement → **FTP-SSH** → **Explorateur de fichiers**
2. Ouvre `/www/` → sélectionne tout → Supprimer
3. **Uploader** le ZIP `as2c-patrimoine-site.zip`
4. Clic droit sur le ZIP → **Extraire** → choisir `/www/`
5. Supprime le ZIP après extraction

## ⚙️ Personnalisations à faire (10 minutes)

### Obligatoire — Formulaire de contact

Le formulaire est sur **Formspree** (gratuit, 50 envois/mois).

1. Va sur [formspree.io](https://formspree.io) → inscription gratuite avec `contact@as2cpatrimoine.com`
2. Crée un nouveau formulaire — tu obtiens une URL du type `https://formspree.io/f/xkgwzpqr`
3. Dans `contact.html` (que tu peux éditer localement ou directement dans FileZilla par double-clic), remplace **2 occurrences** de `https://formspree.io/f/YOUR_FORM_ID` par ton URL
4. Re-upload `contact.html`

### Recommandé — Google Search Console + Analytics

#### Search Console (suivi SEO Google)

1. [search.google.com/search-console](https://search.google.com/search-console) → ajoute la propriété `https://www.as2cpatrimoine.com/`
2. Choisis la méthode "Balise HTML"
3. Copie le `content="..."` de la balise meta
4. **Recherche-remplace** dans tous les `.html` :
   - Cherche : `<!-- <meta name="google-site-verification" content="VOTRE_CODE_ICI"> -->`
   - Remplace : `<meta name="google-site-verification" content="TON_CODE_RÉEL_ICI">`
5. Re-upload, puis valide dans Search Console
6. **Soumets le sitemap** : `https://www.as2cpatrimoine.com/sitemap.xml`

#### Google Analytics 4 (statistiques)

1. [analytics.google.com](https://analytics.google.com) → crée une propriété GA4 pour le site
2. Récupère ton ID `G-XXXXXXXXXX`
3. À la fin de chaque page HTML (juste avant `</body>`), il y a un bloc en commentaire :

   ```html
   <!-- Google Analytics 4 - remplacez G-XXXXXXXXXX par votre ID
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   ...
   -->
   ```

4. **Décommente** ce bloc (retire `<!--` au début et `-->` à la fin) et **remplace** `G-XXXXXXXXXX` par ton ID dans les 2 occurrences
5. Recherche-remplace dans tous les fichiers via VS Code (Cmd+Shift+H)

### Optionnel — Logo personnalisé

Le logo est un placeholder typographique élégant dans `assets/logo.svg`. Si tu retrouves le logo original AS2C, remplace simplement ce fichier (même nom) — il est utilisé partout automatiquement.

## 🔒 Activer HTTPS (gratuit, 5 min)

Une fois le DNS propagé :

1. **Manager OVH** → **Hébergements → ton hébergement → Multisite**
2. Sur la ligne `as2cpatrimoine.com`, clic ⚙️ → **Activer SSL** (Let's Encrypt)
3. Attendre 1 à 24 h

## 🔍 Tester le site

Une fois en ligne, vérifier :

- [ ] La home s'affiche : `https://www.as2cpatrimoine.com/`
- [ ] Le menu fonctionne en PC et en mobile
- [ ] La recherche (icône loupe ou `⌘K`) renvoie des résultats
- [ ] Un formulaire de contact envoie bien un email à toi
- [ ] La page 404 affiche les articles suggérés (essaie : `/test-404.html`)
- [ ] HTTPS actif (cadenas vert)
- [ ] Test mobile responsive : ouvre Chrome DevTools (F12) → toggle device toolbar → tester iPhone, iPad

### Outils de validation

- **Schema.org** : [validator.schema.org](https://validator.schema.org/) — colle ton URL → vérifier que FAQPage, Article, BreadcrumbList sont reconnus
- **Lighthouse** : Chrome DevTools → onglet Lighthouse → générer rapport. Objectif : Performance > 90, SEO > 95, Accessibilité > 90
- **PageSpeed** : [pagespeed.web.dev](https://pagespeed.web.dev/) → test mobile + desktop

## 📁 Arborescence finale

```
www/
├── index.html                              ← Accueil
├── contact.html
├── qui-sommes-nous.html
├── simulateur-defiscalisation.html
├── faq.html
├── mentions-legales.html
├── politique-confidentialite.html
├── 404.html                                ← page erreur enrichie
├── details-*.html                          ← 171 articles
├── gestion-de-patrimoine-*.html            ← 9 catégories
├── sitemap.xml                             (186 URLs)
├── robots.txt
├── search-index.json                       (recherche client)
├── .htaccess                               (config Apache)
└── assets/
    ├── css/style.css                       (44 KB)
    ├── js/main.js                          (8 KB)
    ├── logo.svg
    └── img/                                (275 fichiers, 79 Mo)
```

## 🆘 Si quelque chose cloche

| Symptôme | Cause probable | Solution |
|---|---|---|
| 404 nginx | DNS non propagé ou Multisite mal configuré | Voir section "Fix DNS" ci-dessus |
| 500 Internal Server Error | `.htaccess` incompatible | Renomme le `.htaccess` en `.htaccess.bak` pour tester |
| Style cassé / pas d'images | Dossier `assets/` mal uploadé | Vérifie que `/www/assets/css/style.css` existe |
| Formulaire ne fonctionne pas | Formspree ID non remplacé | Voir section "Personnalisations" |
| Site lent au premier chargement | Normal — chargement des 80 Mo d'images | Optimisable plus tard (WebP, CDN) |

## 📈 Pour aller plus loin

- **Optimisation images** : convertir en WebP (gain ~40%) avec [squoosh.app](https://squoosh.app) ou Sharp
- **CDN** : Cloudflare gratuit accélère le site en France et améliore le SEO
- **CMS d'édition** : si tu veux éditer le site sans toucher au code, on peut passer à Decap CMS sans casser le SEO
- **Newsletter** : Mailchimp ou Brevo (Sendinblue) gratuits jusqu'à 500-1000 contacts
- **Témoignages clients** : ajouter une section dédiée sur la home pour booster la conversion

---

🏛️ **Bon déploiement.** En cas de souci, l'erreur vient presque toujours du DNS ou de l'emplacement des fichiers dans `/www/`.
