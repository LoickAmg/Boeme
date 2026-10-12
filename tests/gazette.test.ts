import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Db } from "@/db/client";
import { registerUser } from "@/server/auth";
import { weeklyGazette } from "@/server/gazette";
import { createMemberPoem, setFavorite } from "@/server/poems";
import type { PoemInput } from "@/server/poems";
import { readerKey, recordRead } from "@/server/reads";

import { createTestDb, resetDb } from "./helpers";

let db: Db;

beforeAll(async () => {
  db = await createTestDb();
});

beforeEach(async () => {
  await resetDb(db, { seeded: true });
});

const INPUT: PoemInput = {
  title: "Ce que dit la pluie",
  body: "La pluie tombe sur le toit\nComme un doigt qui frappe à ma porte",
  theme: "",
  language: "fr",
  publish: true,
  generated: false,
};

describe("la gazette de la semaine", () => {
  it("raconte la semaine avec les vraies données", async () => {
    const alice = await registerUser(db, { email: "alice@exemple.test", password: "mot de passe solide", name: "Alice" });
    const bob = await registerUser(db, { email: "bob@exemple.test", password: "mot de passe solide", name: "Bob" });
    const loved = await createMemberPoem(db, alice, INPUT);
    const other = await createMemberPoem(db, alice, { ...INPUT, title: "Autre chose" });
    await setFavorite(db, bob, loved.id, true);
    await recordRead(db, other.id, readerKey({ ip: "1" }), null);
    await recordRead(db, other.id, readerKey({ ip: "2" }), null);

    const gazette = await weeklyGazette(db);
    expect(gazette.newPoems).toBe(2);
    expect(gazette.newMembers).toBe(2);
    expect(gazette.mostLoved).toMatchObject({ title: "Ce que dit la pluie", count: 1 });
    expect(gazette.mostRead).toMatchObject({ title: "Autre chose", count: 2 });
    expect(gazette.whisper?.verse).toMatch(/pluie|doigt/);
  });

  it("reste lisible quand la semaine est calme", async () => {
    const gazette = await weeklyGazette(db);
    expect(gazette).toMatchObject({ newPoems: 0, newMembers: 0, mostLoved: null, mostRead: null, whisper: null, openCorpses: 0 });
  });
});
