// Jeton de connexion signé, gardé dans un cookie HttpOnly.
// La clé de signature dérive du code d'accès : changer le code déconnecte tout le monde.

export interface Jeton {
  /** Fin de validité, en secondes depuis l'époque Unix. */
  exp: number;
  /** Identifiant de la discussion en cours chez Anthropic, s'il y en a une. */
  sid?: string;
}

export const NOM_COOKIE = "as2c_editeur";
export const DUREE_SECONDES = 30 * 24 * 3600;

const encodeur = new TextEncoder();

function enBase64Url(octets: Uint8Array): string {
  let binaire = "";
  for (const o of octets) binaire += String.fromCharCode(o);
  return btoa(binaire).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function depuisBase64Url(texte: string): Uint8Array {
  const b64 = texte.replace(/-/g, "+").replace(/_/g, "/");
  const binaire = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(binaire, (c) => c.charCodeAt(0));
}

export async function cleDeSignature(codeAcces: string, sel: string): Promise<CryptoKey> {
  const brut = await crypto.subtle.digest("SHA-256", encodeur.encode(`as2c-editeur|${codeAcces}|${sel}`));
  return crypto.subtle.importKey("raw", brut, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signer(cle: CryptoKey, jeton: Jeton): Promise<string> {
  const corps = enBase64Url(encodeur.encode(JSON.stringify(jeton)));
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", cle, encodeur.encode(corps)));
  return `${corps}.${enBase64Url(signature)}`;
}

export async function verifier(cle: CryptoKey, valeur: string | undefined, maintenant: number): Promise<Jeton | null> {
  if (!valeur) return null;
  const [corps, signature, reste] = valeur.split(".");
  if (!corps || !signature || reste !== undefined) return null;
  let ok = false;
  try {
    ok = await crypto.subtle.verify("HMAC", cle, depuisBase64Url(signature), encodeur.encode(corps));
  } catch {
    return null;
  }
  if (!ok) return null;
  try {
    const jeton = JSON.parse(new TextDecoder().decode(depuisBase64Url(corps))) as Jeton;
    if (typeof jeton.exp !== "number" || jeton.exp <= maintenant) return null;
    if (jeton.sid !== undefined && !/^[A-Za-z0-9_-]{1,128}$/.test(jeton.sid)) return null;
    return jeton;
  } catch {
    return null;
  }
}

/** Compare le code saisi au code attendu en temps constant (empreintes de même longueur). */
export async function codeValide(saisi: string, attendu: string): Promise<boolean> {
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encodeur.encode(saisi)),
    crypto.subtle.digest("SHA-256", encodeur.encode(attendu)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let difference = 0;
  for (let i = 0; i < x.length; i++) difference |= x[i]! ^ y[i]!;
  return difference === 0;
}

export function lireCookie(entete: string | null, nom: string): string | undefined {
  if (!entete) return undefined;
  for (const morceau of entete.split(";")) {
    const [cle, ...valeur] = morceau.trim().split("=");
    if (cle === nom) return valeur.join("=");
  }
  return undefined;
}

export function cookie(valeur: string, maxAge: number): string {
  return `${NOM_COOKIE}=${valeur}; Path=/as2c; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}
