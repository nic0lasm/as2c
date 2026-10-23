// Crée ou met à jour l'environnement et l'agent Claude utilisés par la page d'édition.
// Lancé par le workflow « Éditeur AS2C » avant chaque déploiement : il est idempotent.
// Entrées : ANTHROPIC_API_KEY, MODELE (facultatif). Sorties : environment_id et agent_id,
// écrits dans $GITHUB_OUTPUT quand il existe, sinon affichés.
import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";

const NOM = "as2c-editeur";
const MODELE = process.env.MODELE || "claude-opus-5-5";
const consignes = readFileSync(new URL("../agent/consignes.md", import.meta.url), "utf8");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Le bac à sable n'a besoin d'aucun accès sortant : Git passe par le proxy d'Anthropic,
// qui ajoute le jeton GitHub hors du conteneur.
const configEnvironnement = {
  type: "cloud",
  networking: { type: "limited", allow_package_managers: false, allow_mcp_servers: false, allowed_hosts: [] },
};

const outils = [
  {
    type: "agent_toolset_20260401",
    default_config: { enabled: true, permission_policy: { type: "always_allow" } },
    configs: [
      { name: "web_fetch", enabled: false },
      { name: "web_search", enabled: false },
    ],
  },
  {
    type: "custom",
    name: "proposer_publication",
    description:
      "À appeler une fois la modification préparée, vérifiée et envoyée sur sa branche modif/…. " +
      "La page montre le résumé à Sébastien avec deux boutons : publier directement sur le site, ou demander " +
      "à Nicolas de relire. La réponse indique son choix et le résultat (publié, relecture demandée, encore à modifier, erreur).",
    input_schema: {
      type: "object",
      properties: {
        branche: { type: "string", description: "Nom de la branche envoyée, par exemple modif/2026-10-24-horaires." },
        resume: { type: "string", description: "Ce qui change sur le site, en une à trois phrases simples pour Sébastien." },
        pages: {
          type: "array",
          items: { type: "string" },
          description: "Pages touchées, en mots simples (par exemple « Contact », « pied de page de toutes les pages »).",
        },
      },
      required: ["branche", "resume", "pages"],
    },
  },
];

async function trouver(liste) {
  for await (const element of liste) if (element.name === NOM) return element;
  return null;
}

let environnement = await trouver(client.beta.environments.list());
if (!environnement) {
  environnement = await client.beta.environments.create({ name: NOM, config: configEnvironnement });
  console.log(`Environnement créé : ${environnement.id}`);
} else {
  environnement = await client.beta.environments.update(environnement.id, { config: configEnvironnement });
  console.log(`Environnement à jour : ${environnement.id}`);
}

// L'empreinte de la configuration, rangée dans les métadonnées de l'agent, dit s'il faut le mettre à jour.
const empreinte = createHash("sha256").update(JSON.stringify({ MODELE, consignes, outils })).digest("hex");
const config = { model: MODELE, system: consignes, tools: outils, metadata: { empreinte } };

let agent = await trouver(client.beta.agents.list());
if (!agent) {
  agent = await client.beta.agents.create({ name: NOM, ...config });
  console.log(`Agent créé : ${agent.id} (version ${agent.version})`);
} else if (agent.metadata?.empreinte !== empreinte) {
  agent = await client.beta.agents.update(agent.id, { version: agent.version, ...config });
  console.log(`Agent mis à jour : ${agent.id} (version ${agent.version})`);
} else {
  console.log(`Agent inchangé : ${agent.id} (version ${agent.version})`);
}

const sorties = `environment_id=${environnement.id}\nagent_id=${agent.id}\n`;
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, sorties);
else process.stdout.write(sorties);
