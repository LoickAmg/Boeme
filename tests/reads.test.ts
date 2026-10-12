import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Db } from "@/db/client";
import { registerUser } from "@/server/auth";
import { createMemberPoem, getPoemBySlug, listPoems } from "@/server/poems";
import type { PoemInput } from "@/server/poems";
import { authorReadTotals, isBot, readerKey, recordRead } from "@/server/reads";

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
  body: "La pluie tombe sur le toit\nComme un doigt qui frappe à ma porte\n\nJe ne sais plus qui j'attends",
  theme: "melancolie",
  language: "fr",
  publish: true,
  generated: false,
};

async function setup() {
  const author = await registerUser(db, { email: "alice@exemple.test", password: "mot de passe solide", name: "Alice" });
  const poem = await createMemberPoem(db, author, INPUT);
  return { author, poem };
}

const DAY1 = new Date("2026-10-10T10:00:00Z");
const DAY2 = new Date("2026-10-11T10:00:00Z");

describe("lectures", () => {
  it("compte une lecture par lecteur et par jour, et les lecteurs distincts", async () => {
    const { author, poem } = await setup();
    const bob = readerKey({ ip: "10.0.0.1", userAgent: "Firefox" });
    const carla = readerKey({ ip: "10.0.0.2", userAgent: "Firefox" });

    expect(await recordRead(db, poem.id, bob, null, DAY1)).toBe(true);
    expect(await recordRead(db, poem.id, bob, null, DAY1)).toBe(false);
    expect(await recordRead(db, poem.id, bob, null, DAY2)).toBe(true);
    expect(await recordRead(db, poem.id, carla, null, DAY2)).toBe(true);

    const view = await getPoemBySlug(db, poem.slug);
    expect(view?.viewCount).toBe(3);
    expect(view?.readerCount).toBe(2);
    expect(await authorReadTotals(db, author.id)).toEqual({ views: 3, readers: 2 });
  });

  it("ne compte ni l'auteur, ni un brouillon, ni un poème de la bibliothèque", async () => {
    const { author, poem } = await setup();
    expect(await recordRead(db, poem.id, readerKey({ userId: author.id }), author.id, DAY1)).toBe(false);

    const draft = await createMemberPoem(db, author, { ...INPUT, title: "Brouillon", publish: false });
    expect(await recordRead(db, draft.id, readerKey({ ip: "1.1.1.1" }), null, DAY1)).toBe(false);

    const classic = (await listPoems(db, { origin: "classic", pageSize: 1 })).items[0];
    expect(await recordRead(db, classic.id, readerKey({ ip: "1.1.1.1" }), null, DAY1)).toBe(false);
    expect((await getPoemBySlug(db, poem.slug))?.viewCount).toBe(0);
  });

  it("ne garde aucune adresse IP en clair", () => {
    const key = readerKey({ ip: "203.0.113.7", userAgent: "Safari" }, "secret");
    expect(key).not.toContain("203.0.113.7");
    expect(key).toHaveLength(32);
    expect(readerKey({ userId: "u1" }, "secret")).not.toBe(readerKey({ userId: "u1" }, "autre"));
  });

  it("trie la communauté par lecteurs", async () => {
    const { author, poem } = await setup();
    const other = await createMemberPoem(db, author, { ...INPUT, title: "Autre" });
    for (const ip of ["1", "2", "3"]) await recordRead(db, other.id, readerKey({ ip }), null, DAY1);
    await recordRead(db, poem.id, readerKey({ ip: "1" }), null, DAY1);
    const sorted = await listPoems(db, { origin: "member", sort: "lus" });
    expect(sorted.items.map((p) => p.id)).toEqual([other.id, poem.id]);
  });

  it("ignore les robots et les aperçus de liens", () => {
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isBot("facebookexternalhit/1.1")).toBe(true);
    expect(isBot("WhatsApp/2.23")).toBe(true);
    expect(isBot(null)).toBe(true);
    expect(isBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36")).toBe(false);
  });
});
