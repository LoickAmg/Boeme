import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Db } from "@/db/client";
import { favorites, poems, reports, sessions, users } from "@/db/schema";
import { excerpt, lifespan, verseCount } from "@/lib/text";
import { BIO_MAX, deleteAccount, updateBio } from "@/server/account";
import { createSession, registerUser } from "@/server/auth";
import { createMemberPoem, listPoems, reportPoem, setFavorite } from "@/server/poems";

import { createTestDb, resetDb } from "./helpers";

let db: Db;

beforeAll(async () => {
  db = await createTestDb();
});

beforeEach(async () => {
  await resetDb(db, { seeded: true });
});

const POEM = { title: "Ce que dit la pluie", body: "La pluie tombe sur le toit\nComme un doigt qui frappe", theme: "", language: "fr" as const, publish: true, generated: false };

describe("compte", () => {
  it("enregistre une présentation nettoyée et plafonnée", async () => {
    const user = await registerUser(db, { email: "a@exemple.test", password: "mot de passe solide", name: "Alice" });
    expect(await updateBio(db, user, "  Bonjour\r\nmonde  ")).toBe("Bonjour\nmonde");
    expect((await updateBio(db, user, "x".repeat(BIO_MAX + 50))).length).toBe(BIO_MAX);
  });

  it("efface le compte, ses poèmes, ses favoris et ses sessions, sans toucher aux autres ni à la bibliothèque", async () => {
    const alice = await registerUser(db, { email: "a@exemple.test", password: "mot de passe solide", name: "Alice" });
    const bob = await registerUser(db, { email: "b@exemple.test", password: "mot de passe solide", name: "Bob" });
    const [classic] = (await listPoems(db, { origin: "classic" })).items;

    const poem = await createMemberPoem(db, alice, POEM);
    const bobPoem = await createMemberPoem(db, bob, { ...POEM, title: "Autre poème" });
    await setFavorite(db, alice, classic.id, true);
    await setFavorite(db, bob, poem.id, true);
    await createSession(db, alice.id);
    await reportPoem(db, { poemId: bobPoem.id, reporterId: alice.id, reason: "spam", note: "" });

    const librarySize = (await listPoems(db, { pageSize: 60 })).total;
    await deleteAccount(db, alice);

    expect(await db.select().from(users).where(eq(users.id, alice.id))).toHaveLength(0);
    expect(await db.select().from(poems).where(eq(poems.id, poem.id))).toHaveLength(0);
    expect(await db.select().from(sessions).where(eq(sessions.userId, alice.id))).toHaveLength(0);
    expect(await db.select().from(favorites).where(eq(favorites.userId, alice.id))).toHaveLength(0);
    expect(await db.select().from(favorites).where(eq(favorites.poemId, poem.id))).toHaveLength(0);

    // Le signalement déposé reste, sans lien vers le compte effacé.
    const remaining = await db.select().from(reports);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].reporterId).toBeNull();

    expect((await db.select().from(poems).where(eq(poems.id, bobPoem.id))).length).toBe(1);
    expect((await listPoems(db, { pageSize: 60 })).total).toBe(librarySize - 1);
    expect(await db.select().from(users).where(eq(users.id, bob.id))).toHaveLength(1);
  });
});

describe("aides d'affichage", () => {
  it("coupe un poème en aperçu", () => {
    expect(excerpt("a\nb\n\nc\nd\ne\nf", 4)).toBe("a\nb\nc\nd\n…");
    expect(excerpt("a\nb", 4)).toBe("a\nb");
    expect(verseCount("a\n\nb\nc")).toBe(3);
  });

  it("formate les dates de vie d'un poète", () => {
    expect(lifespan(1821, 1867)).toBe("1821 – 1867");
    expect(lifespan(null, null)).toBe("");
  });
});
