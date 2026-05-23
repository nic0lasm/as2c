# AS2C Patrimoine — Guide de déploiement sur OVH

Ce dossier contient l'intégralité du site web statique d'**AS2C Patrimoine**. Il est conçu pour être téléversé tel quel sur ton hébergement OVH.

---

## 1. Avant de déployer — 4 personnalisations rapides

Avant l'upload, ouvre ces 4 fichiers dans un éditeur (VS Code, Notepad++, TextEdit…) et remplace les **valeurs en placeholder** :

### 1.1 Téléphone, email, adresse

Recherche-remplace dans **tous les fichiers `.html`** (Cmd+Shift+F dans VS Code) :

| Cherche | Remplace par |
|---|---|
| `06 12 34 56 78` | Ton numéro réel |
| `contact@as2c-patrimoine.com` | Ton email réel |
| `Villeurbanne — Métropole de Lyon` | Ton adresse complète (optionnel) |

> Astuce VS Code : ouvre le dossier, presse **Cmd+Shift+H**, coche « Match whole word », puis « Replace All ».

### 1.2 Formulaire de contact (Formspree)

Le formulaire est branché sur **Formspree**, un service gratuit (50 envois/mois) qui transmet les messages à ton email sans serveur.

1. Va sur [https://formspree.io](https://formspree.io) et crée un compte gratuit avec ton email.
2. Crée un nouveau formulaire — Formspree génère un endpoint du type `https://formspree.io/f/xkgwzpqr`.
3. Dans `contact.html`, remplace `https://formspree.io/f/YOUR_FORM_ID` par ton vrai endpoint.

### 1.3 Numéro de carte T et coordonnées professionnelles

Dans `qui-sommes-nous.html` et `mentions-legales.html`, vérifie ces mentions :

- Carte T : `CPI 6901 2019 000 041 064`
- ORIAS (si applicable)
- Adresse complète du cabinet

### 1.4 Logo (optionnel)

Le logo actuel est un placeholder vectoriel sobre dans `assets/logo.svg`. Si tu retrouves le logo original AS2C, **remplace simplement le fichier `assets/logo.svg`** (garde le même nom) — il sera utilisé partout automatiquement.

---

## 2. Téléversement sur OVH — 2 méthodes

### Méthode 1 : Espace client OVH (le plus simple)

1. Connecte-toi sur [https://www.ovh.com/manager](https://www.ovh.com/manager)
2. Va dans **Web Cloud → Hébergements → ton domaine**
3. Onglet **FTP-SSH** → bouton **Explorateur de fichiers**
4. Va dans `/www/` (la racine de ton site)
5. **Sélectionne tout l'ancien contenu** (s'il y en a) → Supprimer
6. Glisse-dépose **le contenu de ce dossier** (pas le dossier, son contenu)

   > ⚠️ Important : tu dois te retrouver avec `/www/index.html`, pas `/www/site_build/index.html`.

### Méthode 2 : Client FTP (FileZilla)

1. Télécharge **FileZilla** (gratuit) : [https://filezilla-project.org](https://filezilla-project.org)
2. Récupère tes identifiants FTP dans l'espace client OVH (onglet **FTP-SSH** → bouton ⚙️ → « Mot de passe »)
3. Connecte-toi à FileZilla avec :
   - **Hôte** : `ftp.cluster0XX.hosting.ovh.net` (donné par OVH)
   - **Identifiant** : ton login OVH
   - **Mot de passe** : celui généré
   - **Port** : 21
4. À gauche, navigue vers ce dossier local. À droite, va dans `/www/`.
5. Vide `/www/` puis glisse tout le contenu local → distant.

### Méthode 3 : Archive ZIP (le plus rapide)

Si OVH te le permet :

1. Va dans l'**Explorateur de fichiers** OVH
2. Téléverse `as2c-patrimoine-site.zip` (fourni)
3. Clic droit → **Extraire** → choisis `/www/`
4. Supprime le ZIP après extraction

---

## 3. Activer HTTPS (gratuit, 5 min)

Dans l'espace OVH :

1. **Web Cloud → Hébergements → ton domaine → Multisite**
2. Sur ton domaine, clique sur ⚙️ → **Activer le SSL**
3. Attendre 1 à 24h que Let's Encrypt génère le certificat
4. Une fois actif, modifie le `.htaccess` à la racine — décommente ces 3 lignes au début :

   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

   *(Elles sont déjà présentes en commentaire dans le fichier.)*

---

## 4. Structure du dossier

```
site_build/
├── index.html                              ← Accueil
├── contact.html                            ← Prendre RDV
├── qui-sommes-nous.html                    ← À propos
├── simulateur-defiscalisation.html         ← Simulateur
├── faq.html                                ← FAQ
├── mentions-legales.html
├── politique-confidentialite.html
├── 404.html                                ← Page d'erreur
├── details-*.html                          ← 170+ articles
├── gestion-de-patrimoine-*.html            ← 9 pages catégories
├── sitemap.xml                             ← Pour Google
├── robots.txt                              ← Pour les moteurs
├── .htaccess                               ← Config Apache (cache, sécurité)
└── assets/
    ├── css/style.css                       ← Design
    ├── js/main.js                          ← Interactions
    ├── logo.svg                            ← Logo (à remplacer si besoin)
    └── img/                                ← 275 images
```

---

## 5. Une fois en ligne — checklist

- [ ] Ouvre `https://www.as2c-patrimoine.com` — la home s'affiche
- [ ] Teste le formulaire de contact (envoie un test à toi-même)
- [ ] Va dans **Google Search Console** ([https://search.google.com/search-console](https://search.google.com/search-console)) et soumets ton sitemap : `https://www.as2c-patrimoine.com/sitemap.xml`
- [ ] Vérifie que le HTTPS s'active (cadenas vert dans le navigateur)
- [ ] Teste le site sur mobile (Chrome DevTools → mode mobile)

---

## 6. Modifier le site plus tard

Pour ajouter un article, modifier un texte, etc. :

- **Modif simple** : ouvre le fichier `.html` concerné dans un éditeur, modifie, ré-upload via OVH.
- **Modif structurelle** : modifie `site_data.csv`, relance le script `python3 build_site.py`, et ré-upload tout.

Si tu veux passer à une interface d'édition (CMS), on peut migrer plus tard vers **Decap CMS** ou **Cloudflare Pages + headless CMS** sans casser le SEO.

---

## 7. SEO — comment préserver ce qui marche déjà

Les URLs ont été reconstruites pour matcher l'ancien site (format `details-mot+cle-ID.html`). Google devrait retrouver progressivement les pages.

Pour accélérer :

1. **Search Console** → Indexation → Inspection d'URL → soumets manuellement les pages clés
2. **Sitemap** → Re-soumets si tu modifies beaucoup
3. **Backlinks** → Si tu as une fiche Google Business Profile, vérifie que l'URL pointe bien sur la home

---

Bon déploiement ! 🏛️

— Si tu rencontres un blocage, l'erreur est presque toujours liée à un fichier mal téléversé (vérifie que `/www/index.html` existe à la racine, pas `/www/site_build/index.html`).
