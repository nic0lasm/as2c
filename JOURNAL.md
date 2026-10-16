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
