# Journal des modifications du site AS2C

Chaque entrée : date, demande, fichiers modifiés, sauvegarde, fichiers à envoyer sur OVH.
Les heures des sauvegardes sont en heure UTC (heure française moins 2 h en été, moins 1 h en hiver).

---

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

## 16/10/2026 — Nouvelle adresse e-mail
- Demande : remplacer contact@ par sebastien.maigre@ partout (bloc « Prendre RDV » et ailleurs).
- Modifié : 187 pages, 385 occurrences de contact@as2cpatrimoine.com remplacées par sebastien.maigre@as2cpatrimoine.com (texte, liens mailto, données Google).
- Note : domaine conservé sans tiret (as2cpatrimoine.com), comme le reste du site.
- Sauvegarde : `as2c-sauvegardes/2026-10-16_095208_email-sebastien-maigre/`.
- Mise en ligne : automatique via GitHub.
