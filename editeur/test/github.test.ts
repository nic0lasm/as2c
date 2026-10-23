import { test } from "node:test";
import assert from "node:assert/strict";
import { brancheValide, fichierAutorise } from "../src/github.ts";

test("seuls les fichiers du site et le journal peuvent être publiés", () => {
  assert.equal(fichierAutorise("www/contact.html"), true);
  assert.equal(fichierAutorise("www/articles/details-x-12.html"), true);
  assert.equal(fichierAutorise("JOURNAL.md"), true);
  assert.equal(fichierAutorise(".github/workflows/deploy.yml"), false);
  assert.equal(fichierAutorise("editeur/src/index.ts"), false);
  assert.equal(fichierAutorise("CLAUDE.md"), false);
  assert.equal(fichierAutorise("www/../editeur/x"), false);
  assert.equal(fichierAutorise("wwwx/a.html"), false);
});

test("nom de branche attendu", () => {
  assert.equal(brancheValide("modif/2026-10-24-horaires"), true);
  assert.equal(brancheValide("main"), false);
  assert.equal(brancheValide("modif/../main"), false);
  assert.equal(brancheValide("modif/Majuscule"), false);
  assert.equal(brancheValide("modif/"), false);
});
