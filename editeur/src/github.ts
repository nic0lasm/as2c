// Publication et demande de relecture, faites par le Worker avec le jeton GitHub, jamais par l'agent.
// Avant l'une ou l'autre, le Worker vérifie lui-même que la modification ne touche que le site.

export interface Proposition {
  branche: string;
  resume: string;
  pages: string[];
}

export type Resultat = { ok: true; texte: string; lien?: string } | { ok: false; texte: string };

const BRANCHE_VALIDE = /^modif\/[a-z0-9][a-z0-9-]{0,62}$/;
const FICHIERS_MAX = 300;

/** Un fichier peut être publié depuis la page s'il fait partie du site ou du journal. */
export function fichierAutorise(chemin: string): boolean {
  return chemin === "JOURNAL.md" || (chemin.startsWith("www/") && !chemin.split("/").includes(".."));
}

export function brancheValide(branche: string): boolean {
  return BRANCHE_VALIDE.test(branche);
}

export class GitHub {
  private readonly depot: string;
  private readonly jeton: string;
  private readonly base: string;

  constructor(depot: string, jeton: string, base = "https://api.github.com") {
    this.depot = depot;
    this.jeton = jeton;
    this.base = base;
  }

  private appel(chemin: string, init: RequestInit = {}): Promise<Response> {
    return fetch(`${this.base}/repos/${this.depot}${chemin}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.jeton}`,
        "Content-Type": "application/json",
        "User-Agent": "as2c-editeur",
        "X-GitHub-Api-Version": "2022-11-28",
        ...init.headers,
      },
    });
  }

  /** Refuse une branche vide, inconnue, trop grosse ou qui touche autre chose que www/ et JOURNAL.md. */
  async controler(branche: string): Promise<{ ok: true; fichiers: number } | { ok: false; texte: string }> {
    if (!brancheValide(branche)) return { ok: false, texte: `Nom de modification invalide : ${branche}.` };
    const reponse = await this.appel(`/compare/main...${branche}`);
    if (reponse.status === 404) return { ok: false, texte: "La modification préparée est introuvable." };
    if (!reponse.ok) return { ok: false, texte: `GitHub a répondu ${reponse.status} à la vérification.` };
    const comparaison = (await reponse.json()) as {
      ahead_by: number;
      files?: { filename: string; previous_filename?: string }[];
    };
    const fichiers = comparaison.files ?? [];
    if (comparaison.ahead_by === 0 || fichiers.length === 0) return { ok: false, texte: "La modification ne change rien au site." };
    if (fichiers.length >= FICHIERS_MAX) {
      return { ok: false, texte: "La modification touche trop de fichiers pour être vérifiée ici : Nicolas doit la relire." };
    }
    const interdits = fichiers
      .flatMap((f) => [f.filename, f.previous_filename])
      .filter((chemin): chemin is string => !!chemin && !fichierAutorise(chemin));
    if (interdits.length) {
      return { ok: false, texte: `La modification touche des fichiers hors du site (${interdits.slice(0, 3).join(", ")}) : refusée.` };
    }
    return { ok: true, fichiers: fichiers.length };
  }

  async publier(p: Proposition): Promise<Resultat> {
    const controle = await this.controler(p.branche);
    if (!controle.ok) return controle;
    const reponse = await this.appel("/merges", {
      method: "POST",
      body: JSON.stringify({ base: "main", head: p.branche, commit_message: `Publication par Sébastien : ${p.resume}`.slice(0, 400) }),
    });
    if (reponse.status === 409) {
      return { ok: false, texte: "Le site a changé entre-temps et la modification ne s'applique plus telle quelle. Il faut la refaire." };
    }
    if (reponse.status !== 201 && reponse.status !== 204) return { ok: false, texte: `GitHub a refusé la publication (${reponse.status}).` };
    await this.appel(`/git/refs/heads/${p.branche}`, { method: "DELETE" }).catch(() => undefined);
    return { ok: true, texte: "Publié. Le site sera à jour d'ici cinq minutes." };
  }

  async demanderRelecture(p: Proposition): Promise<Resultat> {
    const controle = await this.controler(p.branche);
    if (!controle.ok) return controle;
    const titre = `Relecture : ${p.resume.replace(/\s+/g, " ")}`;
    const corps = [
      "**Sébastien demande ta relecture** depuis la page d'édition https://nclsmgr.com/as2c.",
      "",
      `**Ce qui change :** ${p.resume}`,
      "",
      "**Pages touchées :**",
      ...p.pages.map((page) => `- ${page}`),
      "",
      "Pour publier, fusionne cette demande : le site est mis à jour dans les cinq minutes. Pour refuser, ferme-la.",
    ].join("\n");
    const reponse = await this.appel("/pulls", {
      method: "POST",
      body: JSON.stringify({ title: titre.length > 120 ? `${titre.slice(0, 117)}…` : titre, head: p.branche, base: "main", body: corps }),
    });
    if (reponse.status === 201) {
      const pr = (await reponse.json()) as { html_url: string };
      return { ok: true, texte: "Demande envoyée à Nicolas. Il est prévenu par e-mail et publiera après relecture.", lien: pr.html_url };
    }
    if (reponse.status === 422) {
      // Une demande existe déjà pour cette modification : elle a été mise à jour par le dernier envoi.
      const [proprietaire] = this.depot.split("/");
      const existantes = await this.appel(`/pulls?state=open&head=${proprietaire}:${encodeURIComponent(p.branche)}`);
      const liste = existantes.ok ? ((await existantes.json()) as { html_url: string }[]) : [];
      if (liste[0]) {
        return { ok: true, texte: "La demande de relecture envoyée à Nicolas est mise à jour. Il est prévenu par e-mail.", lien: liste[0].html_url };
      }
    }
    return { ok: false, texte: `GitHub a refusé la demande de relecture (${reponse.status}).` };
  }
}
