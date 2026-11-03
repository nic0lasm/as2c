// Consommation d'une discussion : jetons (tokens) utilisés et dépense au prix public, comparée au plafond.
// Les chiffres viennent de la session chez Anthropic (champ usage, et événements session.usage en cours de route).

interface Montant {
  amount: string;
  currency: string;
}

/** Forme commune à session.usage (session) et à usage (événement session.usage). */
export interface Usage {
  input_tokens?: number;
  output_tokens?: number;
  cache_read_input_tokens?: number;
  cache_creation?: { ephemeral_1h_input_tokens?: number; ephemeral_5m_input_tokens?: number };
  list_cost?: Montant | null;
}

export interface Consommation {
  /** Total des jetons lus et écrits par Claude depuis le début de la discussion. */
  tokens: number;
  /** Dépense au prix public, en centimes de dollar ; null tant qu'Anthropic ne la fournit pas. */
  centimes: number | null;
  /** Plafond de la discussion, en centimes de dollar ; null si aucun plafond. */
  plafond: number | null;
}

function entier(valeur: unknown): number {
  return typeof valeur === "number" && Number.isFinite(valeur) && valeur > 0 ? Math.floor(valeur) : 0;
}

function centimes(montant: Montant | null | undefined): number | null {
  if (!montant || montant.currency !== "USD" || !/^\d{1,12}$/.test(montant.amount)) return null;
  return Number(montant.amount);
}

export function consommation(usage: Usage | null | undefined, budget: { max_list_cost: Montant } | null | undefined): Consommation {
  const u = usage ?? {};
  const tokens =
    entier(u.input_tokens) +
    entier(u.output_tokens) +
    entier(u.cache_read_input_tokens) +
    entier(u.cache_creation?.ephemeral_1h_input_tokens) +
    entier(u.cache_creation?.ephemeral_5m_input_tokens);
  return { tokens, centimes: centimes(u.list_cost), plafond: centimes(budget?.max_list_cost) };
}

/** Consommation d'une discussion qui n'a pas encore commencé. */
export function consommationVide(budgetUsd: string): Consommation {
  const plafond = Math.round(Number(budgetUsd || "5") * 100);
  return { tokens: 0, centimes: 0, plafond: Number.isFinite(plafond) && plafond > 0 ? plafond : null };
}
