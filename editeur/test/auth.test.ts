import { test } from "node:test";
import assert from "node:assert/strict";
import { cleDeSignature, codeValide, lireCookie, signer, verifier } from "../src/auth.ts";

test("un jeton signé se vérifie et garde la discussion", async () => {
  const cle = await cleDeSignature("code-de-test-long", "sel");
  const valeur = await signer(cle, { exp: 2000, sid: "sesn_abc" });
  assert.deepEqual(await verifier(cle, valeur, 1000), { exp: 2000, sid: "sesn_abc" });
});

test("un jeton expiré, modifié ou signé avec un autre code est refusé", async () => {
  const cle = await cleDeSignature("code-de-test-long", "sel");
  const valeur = await signer(cle, { exp: 2000 });
  assert.equal(await verifier(cle, valeur, 2000), null);
  const [corps, signature] = valeur.split(".");
  const falsifie = Buffer.from(JSON.stringify({ exp: 9999 })).toString("base64url");
  assert.equal(await verifier(cle, `${falsifie}.${signature}`, 1000), null);
  assert.equal(await verifier(cle, `${corps}.${signature}.x`, 1000), null);
  const autreCle = await cleDeSignature("autre-code-long", "sel");
  assert.equal(await verifier(autreCle, valeur, 1000), null);
  assert.equal(await verifier(cle, undefined, 1000), null);
  assert.equal(await verifier(cle, "n'importe quoi", 1000), null);
});

test("un identifiant de discussion inattendu est refusé", async () => {
  const cle = await cleDeSignature("code-de-test-long", "sel");
  const valeur = await signer(cle, { exp: 2000, sid: "../../etc" });
  assert.equal(await verifier(cle, valeur, 1000), null);
});

test("comparaison du code", async () => {
  assert.equal(await codeValide("bon-code-123", "bon-code-123"), true);
  assert.equal(await codeValide("mauvais", "bon-code-123"), false);
  assert.equal(await codeValide("", "bon-code-123"), false);
});

test("lecture du cookie", () => {
  assert.equal(lireCookie("a=1; as2c_editeur=x.y; b=2", "as2c_editeur"), "x.y");
  assert.equal(lireCookie(null, "as2c_editeur"), undefined);
});
