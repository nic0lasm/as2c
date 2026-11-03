import { test } from "node:test";
import assert from "node:assert/strict";
import { consommation, consommationVide } from "../src/consommation.ts";

test("additionne tous les jetons et lit la dépense et le plafond", () => {
  const c = consommation(
    {
      input_tokens: 1200,
      output_tokens: 800,
      cache_read_input_tokens: 50000,
      cache_creation: { ephemeral_5m_input_tokens: 3000, ephemeral_1h_input_tokens: 1000 },
      list_cost: { amount: "62", currency: "USD" },
    },
    { max_list_cost: { amount: "500", currency: "USD" } },
  );
  assert.deepEqual(c, { tokens: 56000, centimes: 62, plafond: 500 });
});

test("champs absents ou invalides", () => {
  assert.deepEqual(consommation(undefined, null), { tokens: 0, centimes: null, plafond: null });
  assert.deepEqual(
    consommation({ input_tokens: -3, output_tokens: Number.NaN, list_cost: { amount: "1.5", currency: "USD" } }, {
      max_list_cost: { amount: "500", currency: "EUR" },
    }),
    { tokens: 0, centimes: null, plafond: null },
  );
});

test("discussion pas encore commencée", () => {
  assert.deepEqual(consommationVide("5"), { tokens: 0, centimes: 0, plafond: 500 });
  assert.deepEqual(consommationVide(""), { tokens: 0, centimes: 0, plafond: 500 });
  assert.deepEqual(consommationVide("zéro"), { tokens: 0, centimes: 0, plafond: null });
});
