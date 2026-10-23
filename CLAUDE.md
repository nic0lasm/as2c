# AS2C Patrimoine : consignes pour Claude

Ce dépôt contient le site https://www.as2cpatrimoine.com. Le dossier `www/` est publié tel quel chez OVH :
chaque envoi sur `main` qui touche `www/` le met en ligne en une à cinq minutes
(`.github/workflows/deploy.yml`). Le détail du site (arborescence, `.htaccess`, couleurs, ajout d'un article)
est dans [CLAUDE-NOTES.md](CLAUDE-NOTES.md) : lis-le avant toute modification.

## Avec qui tu parles

Deux personnes utilisent ce dépôt avec toi :
- **Sébastien Maigre**, propriétaire du site et conseiller en gestion de patrimoine. Il n'est pas développeur.
- **Nico**, son frère, webmaster du site.

Réponds en français, avec des phrases simples et sans jargon technique (pas de « commit », « branche »,
« merge » ou « PR » sans les expliquer). Parle de ce qui change sur le site, pas des fichiers.

## Déroulé d'une demande

1. **Comprendre.** Repère les pages concernées. Si la demande est ambiguë (quelle page, quel texte), pose une
   seule question claire.
2. **Proposer.** Montre l'avant et l'après en texte lisible : le texte actuel, puis le texte proposé, et la liste
   des pages touchées. Ne modifie rien avant un « oui » explicite.
3. **Modifier** les fichiers de `www/`. Pour un changement répété sur beaucoup de pages (menu, pied de page,
   coordonnées), utilise `outils/remplacer.py` ou un script, jamais des modifications une par une.
4. **Vérifier** avec `python3 outils/verifier.py`. Il doit finir sans nouvelle erreur. Relis aussi le rendu du
   code HTML modifié (balises fermées, accents, liens).
5. **Noter** la modification en haut de la liste dans `JOURNAL.md` : date, demande, pages modifiées.
6. **Préparer la publication** : envoie les changements sur ta branche de travail et ouvre une demande de fusion
   (pull request) vers `main`, avec un résumé en français de ce qui change sur le site.
7. **Publier** seulement quand la personne le confirme (« publie », « c'est bon », « mets en ligne ») : fusionne
   la demande dans `main`. Dis ensuite que le site sera à jour d'ici quelques minutes, et donne l'adresse de la
   page à vérifier (par exemple https://www.as2cpatrimoine.com/contact.html).

## Annuler une modification

Tout l'historique est dans Git : rien n'est jamais perdu. Pour revenir en arrière, crée une modification
inverse (`git revert` du changement concerné) sur une nouvelle branche, ouvre une demande de fusion et
publie-la de la même façon après confirmation. N'efface jamais l'historique.

## Ce que tu ne fais jamais

- Modifier autre chose que `www/` et `JOURNAL.md`. `.github/`, `outils/`, `CLAUDE.md` et `CLAUDE-NOTES.md`
  restent réservés à Nico : si une demande l'exige, explique-le et propose d'en parler à Nico.
- Demander, écrire ou afficher des identifiants (FTP OVH, mots de passe, clés). Ils sont dans les secrets du
  dépôt GitHub et nulle part ailleurs.
- Pousser directement sur `main`, réécrire l'historique (`push --force`) ou supprimer des pages ou des images en
  masse sans accord explicite.
- Ajouter des scripts ou services tiers (statistiques, chat, polices, widgets) : la politique de sécurité
  (CSP) du `.htaccess` les bloquerait et cela touche à la vie privée des visiteurs. Renvoie vers Nico.

## Informations à jour

- Contact affiché sur le site : 06 69 06 25 25 · sebastien.maigre@as2c-patrimoine.com · Villeurbanne.
  L'adresse contact@as2c-patrimoine.com n'existe plus : ne l'utilise pas.
- Après une modification de `assets/css/style.css` ou `assets/js/main.js`, augmente le numéro de version
  (`?v=N`) dans toutes les pages, sinon les visiteurs gardent l'ancienne version en cache.
- Les sauvegardes `outils/sauvegarder.sh` et le dossier `Dev/as2c-sauvegardes/` concernent l'ordinateur de Nico.
  Dans une session sur le web, l'historique Git tient lieu de sauvegarde.
