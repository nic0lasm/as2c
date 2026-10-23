# Page d'édition AS2C : https://nclsmgr.com/as2c

Sébastien ouvre https://nclsmgr.com/as2c, saisit un code, puis demande en français les changements du site
à son assistant Claude. Claude propose l'avant/après, attend son accord, prépare la modification sur une
branche `modif/…` et la vérifie. Sébastien choisit ensuite avec un bouton :

- **« Je veux publier directement sur le site »** : le Worker fusionne la branche dans `main`, et `deploy.yml`
  envoie le site chez OVH en quelques minutes ;
- **« Je veux demander à Nicolas de relire »** : le Worker ouvre une demande de fusion, et `relecture.yml` y
  mentionne @nic0lasm, ce qui t'envoie un e-mail GitHub. Tu fusionnes ou tu fermes.

Avant l'un ou l'autre, le Worker vérifie lui-même que la branche ne touche que `www/` et `JOURNAL.md`.
L'agent n'envoie jamais rien sur `main`.

## Fonctionnement

```
Navigateur ──► Cloudflare, route nclsmgr.com/as2c* ──► Worker as2c-editeur (ce dossier)
                                                          │  clé API, jeton GitHub, code : secrets du Worker
                                                          ▼
                                         Agent Claude hébergé par Anthropic (Managed Agents)
                                         bac à sable sans accès sortant, dépôt as2c cloné
                                                          │  git push d'une branche modif/… (jeton ajouté hors du bac à sable)
                                                          ▼
                     bouton « publier »  ──► le Worker fusionne dans main ──► deploy.yml ──► OVH
                     bouton « relire »   ──► le Worker ouvre une demande de fusion ──► e-mail à Nico
```

- Le serveur de nclsmgr.com n'est pas touché : la route Cloudflare intercepte `/as2c` avant lui.
- Le code d'accès donne un cookie signé valable 30 jours (HttpOnly, Secure, SameSite=Strict, limité à `/as2c`).
  Cinq essais par minute et par adresse IP au plus. Changer le code déconnecte tout le monde.
- Chaque discussion est une session de l'agent, plafonnée à `BUDGET_USD` dollars (5 par défaut, `wrangler.toml`).
- Les consignes de l'agent sont dans [agent/consignes.md](agent/consignes.md).
- Les discussions se relisent dans la console Anthropic (Managed Agents > Sessions).

## Mise en place (une seule fois)

1. **Clé API Anthropic** : sur https://console.anthropic.com, ajouter du crédit, puis créer une clé dans « API keys ».
2. **Jeton GitHub** : https://github.com/settings/personal-access-tokens/new, jeton « fine-grained »,
   accès au seul dépôt `nic0lasm/as2c`, permissions **Contents : Read and write** et
   **Pull requests : Read and write**, rien d'autre.
   Sans la permission « Workflows », l'agent ne peut pas modifier les workflows du dépôt.
3. **Jeton Cloudflare** : https://dash.cloudflare.com/profile/api-tokens, modèle « Edit Cloudflare Workers »,
   limité à ton compte et à la zone `nclsmgr.com`. Noter aussi l'**Account ID** (page d'accueil du compte).
4. **Code d'accès** : une phrase d'au moins 12 caractères, par exemple quatre mots au hasard.
5. Ajouter les cinq secrets dans https://github.com/nic0lasm/as2c/settings/secrets/actions :
   `ANTHROPIC_API_KEY`, `AS2C_GITHUB_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CODE_ACCES`.
6. Vérifier que les e-mails de GitHub sont activés pour les mentions
   (https://github.com/settings/notifications, « Participating, @mentions and custom » : Email).
7. Lancer le workflow : Actions > « Éditeur AS2C » > Run workflow. Il crée l'agent, déploie le Worker et
   installe ses secrets. À relancer après chaque modification de ce dossier ou d'un secret.

## Changer le code, couper l'accès

- Nouveau code : modifier le secret `CODE_ACCES`, relancer le workflow.
- Couper tout de suite : supprimer la route `nclsmgr.com/as2c*` du Worker dans le tableau de bord Cloudflare,
  ou révoquer le jeton GitHub (plus rien ne peut alors être publié).
- Les branches `modif/…` publiées sont supprimées ; celles envoyées en relecture restent jusqu'à la fusion
  (option « Automatically delete head branches » dans les réglages du dépôt pour les nettoyer).

## Développement

```sh
npm ci
npm test && npm run typecheck
npx wrangler dev   # avec un fichier .dev.vars (non versionné) contenant les secrets
```

`ANTHROPIC_BASE_URL` et `GITHUB_API_URL` dans `.dev.vars` permettent de viser de fausses API pour essayer la page sans frais.
