// Page d'édition du site AS2C, servie sur https://nclsmgr.com/as2c par un Worker Cloudflare.
// Le navigateur ne parle qu'à ce Worker ; lui seul détient la clé API Anthropic et le jeton GitHub.
// Le travail (lecture, modification, vérification) est fait par un agent Claude hébergé par Anthropic,
// dans un bac à sable où le dépôt nic0lasm/as2c est cloné. L'agent prépare chaque modification sur une
// branche ; c'est Sébastien qui choisit, par un bouton, de la publier ou de la faire relire par Nicolas,
// et c'est le Worker qui exécute ce choix après avoir vérifié que seules les pages du site changent.
import Anthropic from "@anthropic-ai/sdk";
import {
  DUREE_SECONDES,
  NOM_COOKIE,
  cleDeSignature,
  codeValide,
  cookie,
  lireCookie,
  signer,
  verifier,
  type Jeton,
} from "./auth";
import { GitHub, brancheValide, type Proposition, type Resultat } from "./github";
import { page } from "./page";

export interface Env {
  ANTHROPIC_API_KEY: string;
  AS2C_GITHUB_TOKEN: string;
  CODE_ACCES: string;
  AGENT_ID: string;
  ENVIRONMENT_ID: string;
  DEPOT: string;
  BUDGET_USD: string;
  /** Pour les essais locaux seulement : adresse d'une fausse API. */
  ANTHROPIC_BASE_URL?: string;
  GITHUB_API_URL?: string;
  LIMITE_CONNEXION: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

const LONGUEUR_MIN_CODE = 12;

const ENTETES_SECURITE: Record<string, string> = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "noindex, nofollow",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

function json(donnees: unknown, statut = 200, entetes: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(donnees), {
    status: statut,
    headers: { ...ENTETES_SECURITE, "Content-Type": "application/json; charset=utf-8", ...entetes },
  });
}

function configurationIncomplete(env: Env): string | null {
  for (const nom of ["ANTHROPIC_API_KEY", "AS2C_GITHUB_TOKEN", "CODE_ACCES", "AGENT_ID", "ENVIRONMENT_ID"] as const) {
    if (!env[nom]) return `${nom} manquant`;
  }
  if (env.CODE_ACCES.length < LONGUEUR_MIN_CODE) return `CODE_ACCES trop court (${LONGUEUR_MIN_CODE} caractères minimum)`;
  return null;
}

export default {
  async fetch(requete: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(requete.url);
    // La route Cloudflare « nclsmgr.com/as2c* » attrape aussi /as2cxyz : on rend la main au site.
    if (url.pathname !== "/as2c" && !url.pathname.startsWith("/as2c/")) return fetch(requete);
    if (url.pathname === "/as2c/") return Response.redirect(`${url.origin}/as2c`, 301);

    const probleme = configurationIncomplete(env);
    if (probleme) {
      console.error(`Configuration incomplète : ${probleme}`);
      return new Response("Page d'édition en cours de configuration.", { status: 503, headers: ENTETES_SECURITE });
    }

    if (url.pathname === "/as2c") {
      if (requete.method !== "GET" && requete.method !== "HEAD") return new Response(null, { status: 405 });
      const nonce = crypto.randomUUID().replace(/-/g, "");
      return new Response(page(nonce), {
        headers: {
          ...ENTETES_SECURITE,
          "Content-Type": "text/html; charset=utf-8",
          "Content-Security-Policy": [
            "default-src 'none'",
            `script-src 'nonce-${nonce}'`,
            `style-src 'nonce-${nonce}'`,
            "connect-src 'self'",
            "img-src 'self' data:",
            "form-action 'self'",
            "base-uri 'none'",
            "frame-ancestors 'none'",
          ].join("; "),
        },
      });
    }

    // Toutes les routes d'API sont en POST, avec un en-tête que seul notre script envoie :
    // un autre site ne peut pas l'ajouter sans autorisation CORS, ce qui bloque les requêtes forgées.
    if (requete.method !== "POST" || requete.headers.get("X-AS2C") !== "1") return json({ erreur: "Requête refusée." }, 403);

    const cle = await cleDeSignature(env.CODE_ACCES, env.AS2C_GITHUB_TOKEN);
    const maintenant = Math.floor(Date.now() / 1000);
    const jeton = await verifier(cle, lireCookie(requete.headers.get("Cookie"), NOM_COOKIE), maintenant);
    const route = url.pathname.slice("/as2c/api/".length);

    if (route === "connexion") return connexion(requete, env, cle, maintenant);
    if (!jeton) return json({ erreur: "Session expirée, saisissez le code à nouveau." }, 401);
    if (route === "deconnexion") return json({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, baseURL: env.ANTHROPIC_BASE_URL || undefined });
    try {
      return await routeConnectee(route, requete, env, ctx, client, cle, jeton, maintenant);
    } catch (erreur) {
      console.error(`Échec de /as2c/api/${route}`, erreur);
      return json({ erreur: "Claude est injoignable pour le moment. Réessayez dans quelques minutes." }, 502);
    }
  },
} satisfies ExportedHandler<Env>;


async function routeConnectee(
  route: string,
  requete: Request,
  env: Env,
  ctx: ExecutionContext,
  client: Anthropic,
  cle: CryptoKey,
  jeton: Jeton,
  maintenant: number,
): Promise<Response> {
  switch (route) {
    case "etat":
      return etat(client, jeton);
    case "nouvelle":
      return json({ ok: true }, 200, { "Set-Cookie": cookie(await signer(cle, { exp: jeton.exp }), jeton.exp - maintenant) });
    case "message":
      return message(requete, env, ctx, client, cle, jeton, maintenant);
    case "choix":
      if (!jeton.sid) return json({ erreur: "Aucune discussion en cours." }, 400);
      return choix(requete, env, ctx, client, jeton.sid);
    case "suivre":
      if (!jeton.sid) return json({ erreur: "Aucune discussion en cours." }, 400);
      return flux(ctx, client, jeton.sid, null, {});
    case "arreter":
      if (jeton.sid) await client.beta.sessions.events.send(jeton.sid, { events: [{ type: "user.interrupt" }] });
      return json({ ok: true });
    default:
      return json({ erreur: "Introuvable." }, 404);
  }
}

async function connexion(requete: Request, env: Env, cle: CryptoKey, maintenant: number): Promise<Response> {
  const ip = requete.headers.get("CF-Connecting-IP") ?? "inconnue";
  const { success } = await env.LIMITE_CONNEXION.limit({ key: `connexion:${ip}` });
  if (!success) return json({ erreur: "Trop d'essais. Réessayez dans une minute." }, 429);
  const corps = (await requete.json().catch(() => null)) as { code?: unknown } | null;
  const saisi = typeof corps?.code === "string" ? corps.code.trim() : "";
  if (!saisi || !(await codeValide(saisi, env.CODE_ACCES))) return json({ erreur: "Code incorrect." }, 401);
  const valeur = await signer(cle, { exp: maintenant + DUREE_SECONDES });
  return json({ ok: true }, 200, { "Set-Cookie": cookie(valeur, DUREE_SECONDES) });
}

/** Les événements de la discussion, réduits à ce que la page utilise. */
interface Evenement {
  type: string;
  id?: string;
  name?: string;
  input?: unknown;
  content?: unknown;
  custom_tool_use_id?: string;
  evaluated_permission?: string;
  stop_reason?: { type: string; event_ids?: string[] };
}

interface Bulle {
  role: "moi" | "claude" | "info";
  texte: string;
}

interface Choix extends Proposition {
  id: string;
}

const OUTIL_CHOIX = "proposer_publication";

function texteDe(contenu: unknown): string {
  if (!Array.isArray(contenu)) return "";
  return contenu
    .filter((bloc): bloc is { type: "text"; text: string } => bloc?.type === "text" && typeof bloc.text === "string")
    .map((bloc) => bloc.text)
    .join("\n\n");
}

/** Lit la proposition envoyée par l'agent ; null si elle est incomplète. */
function proposition(e: Evenement): Choix | null {
  const entree = (e.input ?? {}) as Record<string, unknown>;
  if (e.name !== OUTIL_CHOIX || !e.id || typeof entree.branche !== "string" || typeof entree.resume !== "string") return null;
  const pages = Array.isArray(entree.pages) ? entree.pages.filter((x): x is string => typeof x === "string").slice(0, 50) : [];
  return { id: e.id, branche: entree.branche, resume: entree.resume.slice(0, 1000), pages };
}

/** Relit la discussion : bulles à afficher, et proposition qui attend encore le choix de Sébastien. */
async function relire(client: Anthropic, sid: string): Promise<{ historique: Bulle[]; enAttente: Choix | null; choisis: Set<string> }> {
  const historique: Bulle[] = [];
  const propositions = new Map<string, Choix>();
  const choisis = new Set<string>();
  for await (const brut of client.beta.sessions.events.list(sid)) {
    const e = brut as Evenement;
    if (e.type === "user.message") historique.push({ role: "moi", texte: texteDe(e.content) });
    else if (e.type === "agent.message") historique.push({ role: "claude", texte: texteDe(e.content) });
    else if (e.type === "agent.custom_tool_use") {
      const p = proposition(e);
      if (p) propositions.set(p.id, p);
    } else if (e.type === "user.custom_tool_result" && e.custom_tool_use_id) {
      choisis.add(e.custom_tool_use_id);
      historique.push({ role: "info", texte: texteDe(e.content).split("\n")[0] ?? "" });
    }
  }
  const enAttente = [...propositions.values()].filter((p) => !choisis.has(p.id)).pop() ?? null;
  return { historique, enAttente, choisis };
}

async function etat(client: Anthropic, jeton: Jeton): Promise<Response> {
  if (!jeton.sid) return json({ connecte: true, historique: [], enCours: false });
  try {
    const session = await client.beta.sessions.retrieve(jeton.sid);
    if (session.status === "terminated") return json({ connecte: true, historique: [], enCours: false });
    const { historique, enAttente } = await relire(client, jeton.sid);
    return json({
      connecte: true,
      historique,
      choix: enAttente,
      enCours: !enAttente && (session.status === "running" || session.status === "rescheduling"),
    });
  } catch (erreur) {
    console.error("Lecture de la discussion impossible", erreur);
    return json({ connecte: true, historique: [], enCours: false });
  }
}

async function message(
  requete: Request,
  env: Env,
  ctx: ExecutionContext,
  client: Anthropic,
  cle: CryptoKey,
  jeton: Jeton,
  maintenant: number,
): Promise<Response> {
  const corps = (await requete.json().catch(() => null)) as { texte?: unknown } | null;
  const texte = typeof corps?.texte === "string" ? corps.texte.trim() : "";
  if (!texte) return json({ erreur: "Message vide." }, 400);
  if (texte.length > 20000) return json({ erreur: "Message trop long." }, 400);

  let sid = jeton.sid;
  if (sid) {
    const session = await client.beta.sessions.retrieve(sid).catch(() => null);
    if (!session || session.status === "terminated") sid = undefined;
    // Une proposition attend un bouton : un message écrit ne peut pas passer avant.
    else if ((await relire(client, sid)).enAttente) {
      return json({ erreur: "Choisissez d'abord une des options proposées ci-dessus." }, 409);
    }
  }
  const entetes: Record<string, string> = {};
  if (!sid) {
    const date = new Date().toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
    const centimes = Math.round(Number(env.BUDGET_USD || "5") * 100);
    const session = await client.beta.sessions.create({
      agent: env.AGENT_ID,
      environment_id: env.ENVIRONMENT_ID,
      title: `Page d'édition AS2C, ${date}`,
      metadata: { origine: "nclsmgr.com/as2c" },
      budget: { type: "limit", max_list_cost: { amount: String(centimes), currency: "USD" } },
      resources: [
        {
          type: "github_repository",
          url: `https://github.com/${env.DEPOT}`,
          authorization_token: env.AS2C_GITHUB_TOKEN,
          mount_path: "/workspace/as2c",
          checkout: { type: "branch", name: "main" },
        },
      ],
    });
    sid = session.id;
    entetes["Set-Cookie"] = cookie(await signer(cle, { exp: jeton.exp, sid }), jeton.exp - maintenant);
  }

  const id = sid;
  const envoyer = () =>
    client.beta.sessions.events.send(id, { events: [{ type: "user.message", content: [{ type: "text", text: texte }] }] });
  return flux(ctx, client, id, envoyer, entetes);
}

/**
 * Exécute le bouton choisi par Sébastien sur une proposition de l'agent, puis rend la réponse à l'agent.
 * La proposition est relue chez Anthropic : la page n'envoie que son identifiant et le choix.
 */
async function choix(requete: Request, env: Env, ctx: ExecutionContext, client: Anthropic, sid: string): Promise<Response> {
  const corps = (await requete.json().catch(() => null)) as { id?: unknown; choix?: unknown } | null;
  const decision = corps?.choix;
  if (typeof corps?.id !== "string" || (decision !== "publier" && decision !== "relire" && decision !== "modifier")) {
    return json({ erreur: "Choix invalide." }, 400);
  }
  const { enAttente } = await relire(client, sid);
  if (!enAttente || enAttente.id !== corps.id) return json({ erreur: "Ce choix a déjà été fait." }, 409);

  let resultat: Resultat;
  if (decision === "modifier") {
    resultat = { ok: true, texte: "Vous voulez encore changer quelque chose : dites-le à Claude." };
  } else if (!brancheValide(enAttente.branche)) {
    resultat = { ok: false, texte: "La modification préparée porte un nom invalide : demandez à Claude de la refaire." };
  } else {
    const github = new GitHub(env.DEPOT, env.AS2C_GITHUB_TOKEN, env.GITHUB_API_URL || undefined);
    resultat = decision === "publier" ? await github.publier(enAttente) : await github.demanderRelecture(enAttente);
  }

  const pourAgent = {
    publier: "Sébastien a choisi « Je veux publier directement sur le site ».",
    relire: "Sébastien a choisi « Je veux demander à Nicolas de relire ».",
    modifier: "Sébastien veut encore changer quelque chose avant de choisir : demande-lui quoi.",
  }[decision];
  const lien = resultat.ok && resultat.lien ? ` ${resultat.lien}` : "";
  const contenu = `${resultat.texte}${lien}\n${pourAgent}${resultat.ok ? "" : " L'opération a échoué : explique-le simplement."}`;
  const envoyer = () =>
    client.beta.sessions.events.send(sid, {
      events: [
        {
          type: "user.custom_tool_result",
          custom_tool_use_id: enAttente.id,
          content: [{ type: "text", text: contenu }],
          is_error: !resultat.ok,
        },
      ],
    });
  return flux(ctx, client, sid, envoyer, {}, { t: resultat.ok ? "info" : "erreur", message: `${resultat.texte}${lien}` });
}

/** Résumé lisible d'une action de l'agent, affiché sous « Claude travaille ». */
function resumeOutil(nom: string, entree: unknown): string {
  const e = (entree ?? {}) as Record<string, unknown>;
  const cible = [e.file_path, e.path, e.pattern, e.command].find((v): v is string => typeof v === "string") ?? "";
  const court = cible.replace("/workspace/as2c/", "").replace(/\s+/g, " ").slice(0, 90);
  const verbe: Record<string, string> = {
    read: "Lecture",
    edit: "Modification",
    write: "Écriture",
    glob: "Recherche de fichiers",
    grep: "Recherche",
    bash: "Commande",
  };
  if (nom === "bash" && /git push/.test(court)) return "Mise de côté de la modification";
  if (nom === "bash" && /verifier\.py/.test(court)) return "Vérification du site";
  return `${verbe[nom] ?? nom}${court ? ` : ${court}` : ""}`;
}

/**
 * Relaie les événements de la discussion au navigateur, une ligne JSON par événement, jusqu'à ce
 * que Claude ait fini ou attende un choix. Le flux est ouvert avant l'envoi pour ne rien manquer.
 */
function flux(
  ctx: ExecutionContext,
  client: Anthropic,
  sid: string,
  envoyer: (() => Promise<unknown>) | null,
  entetes: Record<string, string>,
  premier?: unknown,
): Response {
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const ecrivain = writable.getWriter();
  const encodeur = new TextEncoder();
  const ecrire = (donnees: unknown) => ecrivain.write(encodeur.encode(JSON.stringify(donnees) + "\n"));
  // Une ligne vide régulière garde la connexion ouverte pendant les longues étapes.
  const battement = setInterval(() => ecrivain.write(encodeur.encode("\n")).catch(() => {}), 20000);

  const travail = (async () => {
    try {
      if (premier) await ecrire(premier);
      // Le flux est ouvert d'abord ; si ses en-têtes tardent, l'envoi part quand même après 2 s.
      const ouverture = client.beta.sessions.events.stream(sid);
      if (envoyer) {
        await Promise.race([ouverture.catch(() => {}), new Promise((r) => setTimeout(r, 2000))]);
        await envoyer();
      }
      const evenements = await ouverture;
      await ecrire({ t: "etat", etat: "travail" });
      const confirmations = new Set<string>();
      for await (const brut of evenements) {
        const e = brut as Evenement;
        if (e.type === "agent.message") {
          const texte = texteDe(e.content);
          if (texte) await ecrire({ t: "texte", texte });
        } else if (e.type === "agent.tool_use") {
          if (e.evaluated_permission === "ask" && e.id) confirmations.add(e.id);
          await ecrire({ t: "outil", resume: resumeOutil(e.name ?? "", e.input) });
        } else if (e.type === "agent.custom_tool_use") {
          const p = proposition(e);
          if (p) await ecrire({ t: "choix", choix: p });
          else if (e.id) {
            await client.beta.sessions.events.send(sid, {
              events: [
                {
                  type: "user.custom_tool_result",
                  custom_tool_use_id: e.id,
                  content: [{ type: "text", text: `Outil inconnu ou paramètres incomplets. Utilise ${OUTIL_CHOIX} avec branche, resume et pages.` }],
                  is_error: true,
                },
              ],
            });
          }
        } else if (e.type === "session.error") {
          await ecrire({ t: "erreur", message: "Un incident est survenu côté Claude. Il réessaie si possible." });
        } else if (e.type === "session.status_terminated") {
          await ecrire({ t: "etat", etat: "termine" });
          break;
        } else if (e.type === "session.status_idle") {
          const raison = e.stop_reason?.type;
          if (raison === "requires_action") {
            // Les outils de l'agent sont en « always_allow » : une demande de validation est refusée.
            // Une proposition, elle, attend le bouton de Sébastien : on rend la main à la page.
            const ids = (e.stop_reason?.event_ids ?? []).filter((id) => confirmations.has(id));
            if (ids.length) {
              await client.beta.sessions.events.send(sid, {
                events: ids.map((id) => ({ type: "user.tool_confirmation" as const, tool_use_id: id, result: "deny" as const })),
              });
              continue;
            }
            await ecrire({ t: "etat", etat: "choix" });
            break;
          }
          await ecrire({ t: "etat", etat: raison === "budget_reached" ? "budget" : "pret" });
          break;
        }
      }
    } catch (erreur) {
      console.error("Relais interrompu", erreur);
      await ecrire({ t: "erreur", message: "La liaison avec Claude a été interrompue. Rechargez la page." }).catch(() => {});
    } finally {
      clearInterval(battement);
      await ecrivain.close().catch(() => {});
    }
  })();
  ctx.waitUntil(travail);

  return new Response(readable, {
    headers: { ...ENTETES_SECURITE, "Content-Type": "application/x-ndjson; charset=utf-8", ...entetes },
  });
}
