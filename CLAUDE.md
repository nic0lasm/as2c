# AS2C Patrimoine : consignes pour Claude

Ce dépôt contient le site https://www.as2cpatrimoine.com. Le dossier `www/` est publié tel quel chez OVH :
chaque envoi sur `main` qui touche `www/` le met en ligne en une à cinq minutes
(`.github/workflows/deploy.yml`). Le détail du site (arborescence, `.htaccess`, couleurs, ajout d'un article)
est dans [CLAUDE-NOTES.md](CLAUDE-NOTES.md) : lis-le avant toute modification.

## Avec qui tu parles

- **Sébastien Maigre**, propriétaire du site et conseiller en gestion de patrimoine, modifie le site depuis la
  page d'édition https://nclsmgr.com/as2c (dossier `editeur/`). Il n'est pas développeur. L'agent qui lui
  répond suit [editeur/agent/consignes.md](editeur/agent/consignes.md).
- **Nico**, son frère, webmaster du site.

Réponds en français, avec des phrases simples et sans jargon technique. Parle de ce qui change sur le site,
pas des fichiers.

## Déroulé d'une demande

1. **Comprendre.** Repère les pages concernées. Si la demande est ambiguë, pose une seule question claire.
2. **Proposer.** Montre l'avant et l'après en texte lisible et la liste des pages touchées. Ne modifie rien
   avant un « oui » explicite.
3. **Modifier** les fichiers de `www/`. Pour un changement répété sur beaucoup de pages (menu, pied de page,
   coordonnées), utilise `outils/remplacer.py` ou un script, jamais des modifications une par une.
4. **Vérifier** avec `python3 outils/verifier.py` : aucune nouvelle erreur.
5. **Noter** la modification en haut de la liste dans `JOURNAL.md` : date, demande, pages modifiées.
6. **Publier** : un envoi sur `main` qui touche `www/` met le site en ligne en une à cinq minutes. Depuis la
   page d'édition, l'agent pousse sur `main` après l'accord de Sébastien. Dans une autre session, suis la
   consigne de la personne (envoi direct ou demande de fusion).

## Annuler une modification

Tout l'historique est dans Git : rien n'est jamais perdu. Pour revenir en arrière, `git revert` du changement
concerné puis publication de la même façon, après confirmation. N'efface jamais l'historique.

## Ce que tu ne fais jamais

- Modifier autre chose que `www/` et `JOURNAL.md` quand tu travailles pour Sébastien. `editeur/`, `.github/`,
  `outils/`, `CLAUDE.md` et `CLAUDE-NOTES.md` restent réservés à Nico : si une demande l'exige, explique-le et propose d'en parler à Nico.
- Demander, écrire ou afficher des identifiants (FTP OVH, mots de passe, clés). Ils sont dans les secrets du
  dépôt GitHub et nulle part ailleurs.
- Réécrire l'historique (`push --force`) ou supprimer des pages ou des images en masse sans accord explicite.
- Ajouter des scripts ou services tiers (statistiques, chat, polices, widgets) : la politique de sécurité
  (CSP) du `.htaccess` les bloquerait et cela touche à la vie privée des visiteurs. Renvoie vers Nico.

## Informations à jour

- Contact affiché sur le site : 06 69 06 25 25 · sebastien.maigre@as2c-patrimoine.com · Villeurbanne.
  L'adresse contact@as2c-patrimoine.com n'existe plus : ne l'utilise pas.
- Après une modification de `assets/css/style.css` ou `assets/js/main.js`, augmente le numéro de version
  (`?v=N`) dans toutes les pages, sinon les visiteurs gardent l'ancienne version en cache.
- Les sauvegardes `outils/sauvegarder.sh` et le dossier `Dev/as2c-sauvegardes/` concernent l'ordinateur de Nico.
  Dans une session sur le web, l'historique Git tient lieu de sauvegarde.
