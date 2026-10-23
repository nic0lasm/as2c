// Crée ou met à jour l'environnement et l'agent Claude utilisés par la page d'édition.
// Lancé par le workflow « Éditeur AS2C » avant chaque déploiement : il est idempotent.
// Entrées : ANTHROPIC_API_KEY, MODELE (facultatif). Sorties : environment_id et agent_id,
// écrits dans $GITHUB_OUTPUT quand il existe, sinon affichés.
import Anthropic from "@anthropic-ai/sdk";
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

let agent = await trouver(client.beta.agents.list());
if (!agent) {
  agent = await client.beta.agents.create({ name: NOM, model: MODELE, system: consignes, tools: outils });
  console.log(`Agent créé : ${agent.id} (version ${agent.version})`);
} else {
  const modeleActuel = typeof agent.model === "string" ? agent.model : agent.model?.id;
  const outilsActuels = JSON.stringify(agent.tools ?? []);
  if (agent.system !== consignes || modeleActuel !== MODELE || !outilsActuels.includes('"always_allow"')) {
    agent = await client.beta.agents.update(agent.id, {
      version: agent.version,
      model: MODELE,
      system: consignes,
      tools: outils,
    });
    console.log(`Agent mis à jour : ${agent.id} (version ${agent.version})`);
  } else {
    console.log(`Agent inchangé : ${agent.id} (version ${agent.version})`);
  }
}

const sorties = `environment_id=${environnement.id}\nagent_id=${agent.id}\n`;
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, sorties);
else process.stdout.write(sorties);
