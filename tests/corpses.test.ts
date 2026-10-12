import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Db } from "@/db/client";
import { registerUser } from "@/server/auth";
import {
  CorpseError,
  REMOVED_LINE,
  addCorpseLine,
  canContribute,
  getCorpseBySlug,
  listCorpses,
  maxLinesPerMember,
  removeCorpseLine,
  startCorpse,
  visibleLines,
} from "@/server/corpses";

import { createTestDb, resetDb } from "./helpers";

let db: Db;

beforeAll(async () => {
  db = await createTestDb();
});

beforeEach(async () => {
  await resetDb(db);
});

const member = (name: string) => registerUser(db, { email: `${name.toLowerCase()}@exemple.test`, password: "mot de passe solide", name });

describe("cadavre exquis", () => {
  it("ne montre que le dernier vers tant qu'il est ouvert, puis se révèle en entier", async () => {
    const [alice, bob, chloe, dan] = [await member("Alice"), await member("Bob"), await member("Chloé"), await member("Dan")];
    const corpse = await startCorpse(db, alice, { title: "Le grand voyage", theme: "voyage", targetLines: 8, firstLine: "Le train partait sans moi ce matin" });
    expect(corpse.targetLines).toBe(8);

    const writers = [bob, chloe, dan, alice, bob, chloe, dan];
    for (let i = 0; i < writers.length; i++) {
      const result = await addCorpseLine(db, writers[i], corpse.id, `Vers numéro ${i + 2}`);
      const current = (await getCorpseBySlug(db, corpse.slug))!;
      const visible = await visibleLines(db, current);
      if (i < writers.length - 1) {
        expect(result.complete).toBe(false);
        expect(visible).toHaveLength(1);
        expect(visible[0].line).toBe(`Vers numéro ${i + 2}`);
      } else {
        expect(result.complete).toBe(true);
        expect(current.status).toBe("complete");
        expect(visible.map((v) => v.line)).toEqual(["Le train partait sans moi ce matin", ...writers.map((_, k) => `Vers numéro ${k + 2}`)]);
      }
    }
    expect((await listCorpses(db, "complete"))[0].contributors).toBe(4);
    await expect(addCorpseLine(db, bob, corpse.id, "Trop tard")).rejects.toBeInstanceOf(CorpseError);
  });

  it("pas deux vers d'affilée, et pas plus d'un quart du poème par membre", async () => {
    const [alice, bob, chloe] = [await member("Alice"), await member("Bob"), await member("Chloé")];
    const corpse = await startCorpse(db, alice, { title: "Brumes", theme: "", targetLines: 12, firstLine: "Il pleut sur la ville endormie" });
    await expect(addCorpseLine(db, alice, corpse.id, "Encore moi")).rejects.toThrow(/dernier vers/);
    expect(maxLinesPerMember(12)).toBe(3);
    await addCorpseLine(db, bob, corpse.id, "Les toits brillent sous la lune");
    await addCorpseLine(db, alice, corpse.id, "Et je compte les gouttes");
    await addCorpseLine(db, bob, corpse.id, "Une à une, sans fin");
    await addCorpseLine(db, alice, corpse.id, "Comme on compte les jours");
    // Alice a trois vers sur douze : elle ne peut plus écrire.
    await addCorpseLine(db, chloe, corpse.id, "Qui passent sans nous voir");
    expect((await canContribute(db, (await getCorpseBySlug(db, corpse.slug))!, alice)).allowed).toBe(false);
    expect((await canContribute(db, (await getCorpseBySlug(db, corpse.slug))!, null)).reason).toMatch(/Connectez-vous/);
  });

  it("valide les vers et le titre", async () => {
    const alice = await member("Alice");
    await expect(startCorpse(db, alice, { title: "", theme: "", targetLines: 12, firstLine: "Un premier vers" })).rejects.toBeInstanceOf(CorpseError);
    await expect(startCorpse(db, alice, { title: "Titre", theme: "", targetLines: 12, firstLine: "ah" })).rejects.toBeInstanceOf(CorpseError);
    const odd = await startCorpse(db, alice, { title: "Longueur inconnue", theme: "pas-un-theme", targetLines: 99, firstLine: "Un premier vers" });
    expect(odd.targetLines).toBe(12);
    expect(odd.theme).toBe("");
  });

  it("la modération retire un vers sans casser l'ordre", async () => {
    const [alice, bob] = [await member("Alice"), await member("Bob")];
    const corpse = await startCorpse(db, alice, { title: "Titre", theme: "", targetLines: 8, firstLine: "Un premier vers" });
    await addCorpseLine(db, bob, corpse.id, "Un vers à retirer");
    await removeCorpseLine(db, corpse.id, 2);
    expect((await visibleLines(db, corpse))[0]).toMatchObject({ position: 2, line: REMOVED_LINE });
  });
});
