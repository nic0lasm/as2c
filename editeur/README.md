# Page d'édition AS2C : https://nclsmgr.com/as2c

Sébastien ouvre https://nclsmgr.com/as2c, saisit un code, puis demande en français les changements du site
à Claude. Claude propose l'avant/après, attend son accord, modifie `www/`, vérifie, puis publie sur `main` :
le workflow `deploy.yml` envoie le site chez OVH en quelques minutes.

## Fonctionnement

```
Navigateur ──► Cloudflare, route nclsmgr.com/as2c* ──► Worker as2c-editeur (ce dossier)
                                                          │  clé API, jeton GitHub, code : secrets du Worker
                                                          ▼
                                         Agent Claude hébergé par Anthropic (Managed Agents)
                                         bac à sable sans accès sortant, dépôt as2c cloné
                                                          │  git push (jeton ajouté hors du bac à sable)
                                                          ▼
                                         GitHub main ──► deploy.yml ──► OVH
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
   accès au seul dépôt `nic0lasm/as2c`, permission **Contents : Read and write** et rien d'autre.
   Sans la permission « Workflows », l'agent ne peut pas modifier les workflows du dépôt.
3. **Jeton Cloudflare** : https://dash.cloudflare.com/profile/api-tokens, modèle « Edit Cloudflare Workers »,
   limité à ton compte et à la zone `nclsmgr.com`. Noter aussi l'**Account ID** (page d'accueil du compte).
4. **Code d'accès** : une phrase d'au moins 12 caractères, par exemple quatre mots au hasard.
5. Ajouter les cinq secrets dans https://github.com/nic0lasm/as2c/settings/secrets/actions :
   `ANTHROPIC_API_KEY`, `AS2C_GITHUB_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CODE_ACCES`.
6. Lancer le workflow : Actions > « Éditeur AS2C » > Run workflow. Il crée l'agent, déploie le Worker et
   installe ses secrets. À relancer après chaque modification de ce dossier ou d'un secret.

## Changer le code, couper l'accès

- Nouveau code : modifier le secret `CODE_ACCES`, relancer le workflow.
- Couper tout de suite : supprimer la route `nclsmgr.com/as2c*` du Worker dans le tableau de bord Cloudflare,
  ou révoquer le jeton GitHub (Claude ne peut alors plus rien publier).

## Développement

```sh
npm ci
npm test && npm run typecheck
npx wrangler dev   # avec un fichier .dev.vars (non versionné) contenant les secrets
```

`ANTHROPIC_BASE_URL` dans `.dev.vars` permet de viser une fausse API pour essayer la page sans frais.
