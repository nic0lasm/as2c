# Journal des modifications du site AS2C

Chaque entrée : date, demande, fichiers modifiés, sauvegarde, fichiers à envoyer sur OVH.
Les heures des sauvegardes sont en heure UTC (heure française moins 2 h en été, moins 1 h en hiver).

---

## 03/11/2026 — Retrait du mot « indépendant » pour décrire AS2C
- Demande : l'organisme de contrôle considère qu'AS2C n'est pas complètement indépendant ; ne plus présenter le cabinet comme « indépendant » (le conseil « indépendant » est réservé aux conseillers rémunérés uniquement par honoraires).
- Remplacements : « cabinet indépendant » → « cabinet autonome » (bas de page des 187 pages, descriptions Google) ; accueil : « Cabinet de gestion de patrimoine à Lyon », « Autonome et membre de la CNCGP », « 100 % sur mesure » ; « Qui sommes-nous » : « crée son propre cabinet », et la phrase « n'a pas d'intérêt financier… » réécrite ; FAQ et une quinzaine d'articles : « conseil objectif », « en toute autonomie », « expert en patrimoine », « membre de la CNCGP » au lieu de « certifié/agréé » dans ces phrases.
- Non modifiés : les articles où « indépendant » décrit les clients (juriste, coach sportif…), les adresses web des articles.
- Fichiers du site modifiés : 187 pages HTML et `www/search-index.json`.
- Proposition détaillée : https://claude.ai/artifact/8cmYVSpwfrna3sToxQTq7j

## 03/11/2026 — Chiffre « 2 » de AS2C à la taille des lettres
- Demande : que le « 2 » de « AS2C » ait la même taille que les lettres A, S et C (la police des titres affichait des chiffres de hauteur minuscule).
- Fichiers du site modifiés : `www/assets/css/style.css` (chiffres à hauteur de majuscule), version du style passée à `?v=5` dans les 187 pages.
- Préparé depuis la page d'édition.

## 23/10/2026 — Citation de la page d'accueil
- Demande : remplacer « autant que j'apprécie de vous le fournir » par « autant que j'apprécie vous le fournir » dans la citation de l'accueil.
- Fichiers du site modifiés : `www/index.html`.
- Préparé depuis la page d'édition.

## 13/10/2026 — Mise en place du suivi
- Demande : analyser le site et mettre en place un système de mise à jour depuis la discussion.
- Fichiers du site modifiés : **aucun**.
- Ajoutés (hors site) : `CLAUDE-NOTES.md`, `JOURNAL.md`, `outils/sauvegarder.sh`, `outils/verifier.py`.
- Sauvegarde : `as2c-sauvegardes/2026-10-13_140723_initiale-site-complet/www.zip` (site complet).
- À envoyer sur OVH : rien.

## 13/10/2026 — Publication automatique via GitHub
- Demande : que les modifications dictées soient mises en ligne directement.
- Le dépôt GitHub `nic0lasm/as2c` contient maintenant ce dossier (l'ancienne version à plat reste dans l'historique Git).
- Ajouté : `.github/workflows/deploy.yml` (envoi FTP automatique de `www/` vers OVH à chaque commit), `README.md`.
- Fichiers du site modifiés : aucun.
- Mise en ligne : automatique (premier envoi = site complet).

## 13/10/2026 — Nouveau numéro de téléphone
- Demande : remplacer partout le numéro de téléphone par 06 69 06 25 25.
- Modifié : 187 pages (texte « 04 81 68 50 55 » et liens d'appel `tel:+33481685055`).
- Outil ajouté : `outils/remplacer.py`.
- Sauvegarde : `as2c-sauvegardes/2026-10-13_144648_telephone-0669062525/`.
- Mise en ligne : automatique via GitHub.

## 16/10/2026 — Nouvelle adresse e-mail (annulée)
- Demande : remplacer contact@ par sebastien.maigre@ partout, puis annulation demandée par Nico quelques minutes après.
- Le passage à sebastien.maigre@as2cpatrimoine.com a été publié puis annulé : les 187 pages sont revenues à contact@as2cpatrimoine.com.
- Sauvegarde utilisée : `as2c-sauvegardes/2026-10-16_095208_email-sebastien-maigre/`.
- Mise en ligne : automatique via GitHub.

## 16/10/2026 — Adresse e-mail avec tiret
- Demande : afficher contact@as2c-patrimoine.com (avec tiret) partout, choix confirmé par Nico.
- Modifié : 187 pages, 385 occurrences de contact@as2cpatrimoine.com (texte, liens mailto, données Google).
- Non modifié : sebastien.maigre@as2cpatrimoine.com, présent une fois dans l'article « À vendre T2 Villeurbanne » (n° 103).
- Sauvegarde : `as2c-sauvegardes/2026-10-16_100130_email-contact-avec-tiret/`.
- Mise en ligne : automatique via GitHub.

## 16/10/2026 — Adresse e-mail : sebastien.maigre@as2c-patrimoine.com
- Demande : contact@ n'existe plus, mettre sebastien.maigre@as2c-patrimoine.com partout.
- Modifié : 187 pages, 386 occurrences (385 contact@as2c-patrimoine.com + 1 sebastien.maigre@as2cpatrimoine.com dans l'article n° 103).
- Sauvegarde : `as2c-sauvegardes/2026-10-16_100226_email-sebastien-maigre-avec-tiret/`.
- Mise en ligne : automatique via GitHub.
