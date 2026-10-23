// La page unique : écran du code d'accès, puis la discussion avec Claude.
// Aucun script ni style externe : tout est en ligne, autorisé par le nonce de la CSP.

export function page(nonce: string): string {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="data:,">
<title>Édition du site AS2C</title>
<style nonce="${nonce}">${STYLE}</style>
</head>
<body>
<main id="connexion" class="carte" hidden>
  <h1>Édition du site AS2C</h1>
  <p>Saisissez votre code d'accès.</p>
  <form id="form-code">
    <label for="code" class="invisible">Code d'accès</label>
    <input id="code" name="code" type="password" autocomplete="current-password" required autofocus>
    <button type="submit">Entrer</button>
  </form>
  <p id="erreur-code" class="erreur" role="alert"></p>
</main>

<div id="discussion" hidden>
  <header>
    <div>
      <strong>Édition du site AS2C</strong>
      <a href="https://www.as2cpatrimoine.com" target="_blank" rel="noopener">voir le site</a>
    </div>
    <nav>
      <button type="button" id="nouvelle" class="discret">Nouvelle discussion</button>
      <button type="button" id="deconnexion" class="discret">Quitter</button>
    </nav>
  </header>
  <section id="fil" aria-live="polite">
    <div class="bulle claude" id="accueil">
      <p><strong>Bonjour Sébastien,</strong> je suis votre assistant personnel pour le site AS2C. Je m'occupe de le modifier pour vous, selon vos instructions.</p>
      <p>Dites-moi simplement ce que vous voulez changer, par exemple : « Sur la page Qui sommes-nous, remplace le deuxième paragraphe par… » ou « Ajoute un article sur la SCPI avec ce texte… ».</p>
      <p>Je vous montre toujours le changement avant de le faire. Une fois prêt, vous choisirez : <strong>le publier directement sur le site</strong>, ou <strong>demander à Nicolas de le relire</strong>.</p>
    </div>
  </section>
  <p id="statut" class="statut" hidden><span class="point"></span><span id="statut-texte">Claude travaille…</span>
    <button type="button" id="arreter" class="discret">Arrêter</button></p>
  <form id="form-message">
    <label for="texte" class="invisible">Votre message</label>
    <textarea id="texte" rows="3" placeholder="Votre demande…" required></textarea>
    <button type="submit" id="envoyer">Envoyer</button>
  </form>
</div>
<script nonce="${nonce}">${SCRIPT}</script>
</body>
</html>`;
}

const STYLE = `
:root { --bleu: #1e3a5f; --bleu-fonce: #0f2241; --or: #c8a04a; --fond: #fafaf6; --texte: #1d2430; --gris: #6b7280; --bord: #e3e1d8; }
* { box-sizing: border-box; }
html, body { height: 100%; }
body { margin: 0; background: var(--fond); color: var(--texte); font: 16px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
[hidden] { display: none !important; }
.invisible { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
button { font: inherit; cursor: pointer; border: 0; border-radius: 8px; background: var(--bleu); color: #fff; padding: 10px 18px; }
button:hover { background: var(--bleu-fonce); }
button:disabled { opacity: .5; cursor: default; }
button.discret { background: transparent; color: var(--bleu); padding: 6px 10px; }
button.discret:hover { background: #ecebe4; }
input, textarea { font: inherit; width: 100%; padding: 10px 12px; border: 1px solid var(--bord); border-radius: 8px; background: #fff; color: var(--texte); }
input:focus, textarea:focus, button:focus-visible { outline: 2px solid var(--or); outline-offset: 1px; }
.carte { max-width: 380px; margin: 18vh auto 0; padding: 32px 28px; background: #fff; border: 1px solid var(--bord); border-radius: 14px; }
.carte h1 { margin: 0 0 6px; font-size: 1.3rem; color: var(--bleu); }
.carte form { display: flex; gap: 8px; margin-top: 14px; }
.erreur { color: #b42318; min-height: 1.5em; margin: 10px 0 0; }
#discussion { display: flex; flex-direction: column; height: 100%; max-width: 820px; margin: 0 auto; }
header { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--bord); }
header strong { color: var(--bleu); margin-right: 10px; }
header a { color: var(--gris); font-size: .9rem; }
#fil { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.choix { align-self: stretch; background: #fff; border: 2px solid var(--or); border-radius: 12px; padding: 14px 16px; }
.choix h2 { margin: 0 0 6px; font-size: 1rem; color: var(--bleu); }
.choix p { margin: 0 0 8px; }
.choix ul { margin: 0 0 12px; padding-left: 1.2em; color: var(--gris); }
.boutons { display: flex; flex-wrap: wrap; gap: 8px; }
.boutons button { flex: 1 1 220px; padding: 12px 14px; font-weight: 600; }
.boutons .relire { background: #fff; color: var(--bleu); border: 2px solid var(--bleu); }
.boutons .relire:hover { background: #eef2f7; }
.choix .encore { margin-top: 8px; }
.choix .fait { color: var(--gris); font-style: italic; margin: 0; }
.bulle { max-width: 88%; padding: 10px 14px; border-radius: 12px; white-space: normal; overflow-wrap: anywhere; }
.bulle p { margin: 0 0 .6em; } .bulle p:last-child { margin: 0; }
.bulle ul { margin: .2em 0 .6em; padding-left: 1.2em; }
.bulle code { font-size: .9em; background: rgba(0,0,0,.06); padding: 1px 4px; border-radius: 4px; }
.moi { align-self: flex-end; background: var(--bleu); color: #fff; }
.moi a { color: #fff; }
.claude { align-self: flex-start; background: #fff; border: 1px solid var(--bord); }
.claude a { color: var(--bleu); }
.info { align-self: center; color: var(--gris); font-size: .9rem; text-align: center; }
.statut { display: flex; align-items: center; gap: 8px; margin: 0; padding: 4px 16px; color: var(--gris); font-size: .9rem; }
#statut-texte { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.point { width: 8px; height: 8px; border-radius: 50%; background: var(--or); animation: pulse 1.2s infinite ease-in-out; }
@keyframes pulse { 50% { opacity: .25; } }
#form-message { display: flex; gap: 8px; align-items: flex-end; padding: 12px 16px 16px; border-top: 1px solid var(--bord); }
#form-message textarea { resize: none; max-height: 40vh; }
@media (max-width: 560px) { header { flex-wrap: wrap; } .bulle { max-width: 100%; } }
@media (prefers-reduced-motion: reduce) { .point { animation: none; } }
`;

const SCRIPT = `
"use strict";
const $ = (id) => document.getElementById(id);
const fil = $("fil");
let occupe = false;

async function api(route, donnees) {
  return fetch("/as2c/api/" + route, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-AS2C": "1" },
    body: JSON.stringify(donnees || {}),
    credentials: "same-origin",
  });
}

function echapper(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Mise en forme minimale : paragraphes, listes, gras, code et liens https.
function mettreEnForme(texte) {
  const blocs = echapper(texte).split(/\\n{2,}/);
  return blocs.map((bloc) => {
    const lignes = bloc.split("\\n");
    const enLigne = (l) => l
      .replace(/\\*\\*(.+?)\\*\\*/g, "<strong>$1</strong>")
      .replace(/\`([^\`]+)\`/g, "<code>$1</code>")
      .replace(/(https:\\/\\/[^\\s<)]+[^\\s<).,;:!?])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    if (lignes.every((l) => /^\\s*([-*•]|\\d+\\.)\\s+/.test(l))) {
      return "<ul>" + lignes.map((l) => "<li>" + enLigne(l.replace(/^\\s*([-*•]|\\d+\\.)\\s+/, "")) + "</li>").join("") + "</ul>";
    }
    return "<p>" + lignes.map(enLigne).join("<br>") + "</p>";
  }).join("");
}

function ajouter(role, texte) {
  const div = document.createElement("div");
  div.className = "bulle " + role;
  div.innerHTML = role === "info" ? echapper(texte) : mettreEnForme(texte);
  fil.appendChild(div);
  fil.scrollTop = fil.scrollHeight;
}

function travail(actif, texte) {
  occupe = actif;
  $("statut").hidden = !actif;
  $("statut-texte").textContent = texte || "Claude travaille…";
  $("envoyer").disabled = actif || attente;
}

// Une proposition prête attend un des deux boutons : la zone de saisie est bloquée en attendant.
let attente = false;
function bloquerSaisie(oui) {
  attente = oui;
  $("texte").disabled = oui;
  $("texte").placeholder = oui ? "Choisissez une des options ci-dessus." : "Votre demande…";
  $("envoyer").disabled = oui || occupe;
}

function afficherChoix(c) {
  const carte = document.createElement("div");
  carte.className = "choix";
  carte.innerHTML = "<h2>La modification est prête</h2><p>" + echapper(c.resume) + "</p>" +
    (c.pages.length ? "<ul>" + c.pages.map((p) => "<li>" + echapper(p) + "</li>").join("") + "</ul>" : "") +
    '<div class="boutons"><button type="button" class="publier">Je veux publier directement sur le site</button>' +
    '<button type="button" class="relire">Je veux demander à Nicolas de relire</button></div>' +
    '<button type="button" class="discret encore">Je veux encore changer quelque chose</button>';
  const decider = async (choix, libelle, attenteTexte) => {
    carte.querySelectorAll("button").forEach((b) => (b.disabled = true));
    carte.querySelector(".boutons").outerHTML = '<p class="fait">Votre choix : ' + echapper(libelle) + "</p>";
    carte.querySelector(".encore").remove();
    bloquerSaisie(false);
    travail(true, attenteTexte);
    try { await lireFlux(await api("choix", { id: c.id, choix })); }
    catch { ajouter("info", "La connexion a été coupée. Rechargez la page pour voir où en est Claude."); travail(false); }
  };
  carte.querySelector(".publier").addEventListener("click", () => decider("publier", "publier directement sur le site", "Publication en cours…"));
  carte.querySelector(".relire").addEventListener("click", () => decider("relire", "demander à Nicolas de relire", "Envoi de la demande à Nicolas…"));
  carte.querySelector(".encore").addEventListener("click", () => decider("modifier", "encore changer quelque chose", "Claude vous écoute…"));
  fil.appendChild(carte);
  fil.scrollTop = fil.scrollHeight;
  bloquerSaisie(true);
}

async function lireFlux(reponse) {
  if (!reponse.ok || !reponse.body) {
    const d = await reponse.json().catch(() => ({}));
    if (reponse.status === 401) return afficherConnexion();
    ajouter("info", d.erreur || "Une erreur est survenue.");
    return travail(false);
  }
  travail(true);
  const lecteur = reponse.body.pipeThrough(new TextDecoderStream()).getReader();
  let tampon = "";
  for (;;) {
    const { value, done } = await lecteur.read();
    if (done) break;
    tampon += value;
    const lignes = tampon.split("\\n");
    tampon = lignes.pop();
    for (const ligne of lignes) {
      if (!ligne.trim()) continue;
      let e;
      try { e = JSON.parse(ligne); } catch { continue; }
      if (e.t === "texte") { ajouter("claude", e.texte); travail(true); }
      else if (e.t === "outil") travail(true, e.resume + "…");
      else if (e.t === "choix") afficherChoix(e.choix);
      else if (e.t === "info" || e.t === "erreur") ajouter("info", e.message);
      else if (e.t === "etat" && e.etat === "budget") ajouter("info", "Cette discussion a atteint son plafond de dépense. Cliquez sur « Nouvelle discussion » pour continuer.");
      else if (e.t === "etat" && e.etat === "termine") ajouter("info", "Cette discussion est terminée. La prochaine demande en ouvrira une nouvelle.");
    }
  }
  travail(false);
  if (!attente) $("texte").focus();
}

function afficherConnexion() {
  $("discussion").hidden = true;
  $("connexion").hidden = false;
  $("code").focus();
}

async function afficherDiscussion() {
  $("connexion").hidden = true;
  $("discussion").hidden = false;
  const r = await api("etat");
  if (r.status === 401) return afficherConnexion();
  const d = await r.json();
  for (const b of d.historique || []) ajouter(b.role, b.texte);
  if (d.choix) afficherChoix(d.choix);
  else if (d.enCours) lireFlux(await api("suivre"));
  else $("texte").focus();
}

$("form-code").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  $("erreur-code").textContent = "";
  const r = await api("connexion", { code: $("code").value });
  if (r.ok) { $("code").value = ""; return afficherDiscussion(); }
  const d = await r.json().catch(() => ({}));
  $("erreur-code").textContent = d.erreur || "Code incorrect.";
});

$("form-message").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const texte = $("texte").value.trim();
  if (!texte || occupe || attente) return;
  $("texte").value = "";
  ajouter("moi", texte);
  travail(true, "Claude lit votre demande…");
  try { await lireFlux(await api("message", { texte })); }
  catch { ajouter("info", "La connexion a été coupée. Rechargez la page pour voir où en est Claude."); travail(false); }
});

$("texte").addEventListener("keydown", (ev) => {
  if (ev.key === "Enter" && !ev.shiftKey && !ev.isComposing) { ev.preventDefault(); $("form-message").requestSubmit(); }
});

$("nouvelle").addEventListener("click", async () => {
  if ((occupe || attente) && !confirm("Une modification est en cours. Commencer quand même une nouvelle discussion ?")) return;
  await api("nouvelle");
  fil.querySelectorAll(".bulle:not(#accueil), .choix").forEach((n) => n.remove());
  bloquerSaisie(false);
  travail(false);
});

$("arreter").addEventListener("click", () => api("arreter"));

$("deconnexion").addEventListener("click", async () => {
  await api("deconnexion");
  location.reload();
});

afficherDiscussion();
`;
