# AS2C Patrimoine — notes de travail pour Claude

Site : https://www.as2cpatrimoine.com — hébergé chez OVH (Apache).
Webmaster : Nico. Règle : Claude ne travaille que dans `Desktop/Dev`.
Aucun identifiant OVH n'est stocké ici ni demandé.

## 1. Technologie
- **Site 100 % statique** : HTML + CSS + JavaScript, aucun CMS, aucune base de données, aucun PHP.
- Pas de générateur ni de gabarit : l'en-tête, le menu et le pied de page sont **recopiés dans chaque page**.
  Changer le menu ou le pied de page = modifier les 187 pages (Claude le fait par script).
- Polices Google Fonts (Cormorant Garamond + Inter). Version des fichiers CSS/JS : `?v=4`
  (augmenter ce numéro dans toutes les pages après une modif de `style.css` ou `main.js`, à cause du cache d'un an).

## 2. Arborescence (`as2c/www` = racine publique du site)
| Élément | Rôle |
|---|---|
| `index.html` | Accueil (expertises, présentation de Sébastien Maigre, 6 derniers articles) |
| `qui-sommes-nous.html`, `contact.html`, `faq.html`, `simulateur-defiscalisation.html` | Pages principales |
| `mentions-legales.html`, `politique-confidentialite.html`, `404.html` | Pages légales / erreur |
| `categories/` (9 pages) | Pages « expertise » : `gestion-de-patrimoine-<thème>-wNN.html` |
| `articles/` (170 pages) | Articles : `details-<titre+avec+des+plus>-NNN.html` (NNN = numéro unique) |
| `assets/css/style.css` | Feuille de style unique (couleurs dans `:root`) |
| `assets/js/main.js` | Menu mobile, recherche (⌘K), animations, formulaire de contact |
| `assets/img/` | 276 images (environ 200 ne sont plus utilisées par aucune page) |
| `search-index.json` | Index de la recherche interne (183 entrées) |
| `sitemap.xml`, `robots.txt` | Référencement (186 URL) |
| `.htaccess` | HTTPS forcé, cache, sécurité (CSP), redirections, réécriture d'URL |

**Point clé du `.htaccess`** : les URL publiques restent à la racine.
`/details-xxx.html` est servi depuis `articles/`, `/gestion-de-patrimoine-xxx.html` depuis `categories/`.
Tous les liens dans les pages s'écrivent donc **sans** `articles/` ni `categories/`.

Couleurs : bleu `#1e3a5f`, bleu foncé `#0f2241`, or `#c8a04a`, fond `#fafaf6`.
Contact affiché : 04 81 68 50 55 · contact@as2cpatrimoine.com · Villeurbanne.

## 3. Points à traiter (constatés le 13/10/2026)
1. **Formulaire de contact inactif** : `contact.html` envoie vers `https://formspree.io/f/YOUR_FORM_ID`
   (valeur d'exemple). Les messages des visiteurs n'arrivent nulle part. Il faut un vrai identifiant Formspree
   (ou une autre solution).
2. Google Analytics et Google Search Console sont en commentaire (valeurs d'exemple non remplies).
3. Environ 200 images inutilisées dans `assets/img/` (ménage possible, sans urgence).
4. Deux articles pointent vers `/nous-contacter/` : ça fonctionne grâce à une redirection, mais un lien direct vers `contact.html` serait plus propre.
5. Certaines catégories ont un extrait de carte incohérent sur l'accueil (ex. « Assurance vie » parle d'assurance emprunteur).

## 4. Procédure de modification (à suivre à chaque demande)
1. Nico décrit le changement dans la discussion.
2. Claude repère les fichiers concernés et **propose** le changement (avant/après). Rien n'est modifié sans l'accord de Nico.
3. Après accord : **sauvegarde** des fichiers concernés
   `bash outils/sauvegarder.sh "description" www/fichier1.html www/fichier2.html`
   → copie dans `Dev/as2c-sauvegardes/<date>_<description>/`.
4. Modification des fichiers.
5. Vérification : `python3 outils/verifier.py` (liens, images, sitemap, index de recherche).
6. Entrée ajoutée dans `JOURNAL.md` avec la **liste des fichiers à envoyer sur OVH**.
7. Nico envoie ces fichiers (FileZilla, dossier `www` d'OVH) et vérifie en ligne.

**Annuler une modification** : recopier les fichiers depuis le dossier de sauvegarde correspondant
(Claude peut le faire), puis les renvoyer sur OVH.

### Ajouter un nouvel article (fichiers à toucher)
- Créer `www/articles/details-<titre>-<numéro suivant>.html` en copiant un article existant de la même catégorie.
- Ajouter l'image dans `www/assets/img/`.
- Ajouter une carte dans la page catégorie (`www/categories/...`).
- Mettre à jour les « Dernières publications » de `index.html` si besoin.
- Ajouter l'URL dans `sitemap.xml` et une entrée dans `search-index.json`.

## 5. Dossiers de travail dans `Desktop/Dev`
- `as2c/www/` : le site (à envoyer sur OVH).
- `as2c/CLAUDE-NOTES.md`, `as2c/JOURNAL.md`, `as2c/outils/` : notes et outils, **à ne pas envoyer** sur OVH.
- `as2c-sauvegardes/` : sauvegardes avant chaque modification (la première, `initiale-site-complet`, contient tout `www` en .zip).
- `Claude work/` : autre projet, sans rapport avec AS2C. Claude n'y touche pas.
