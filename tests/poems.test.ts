import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Db } from "@/db/client";
import { poems } from "@/db/schema";
import { registerUser } from "@/server/auth";
import {
  AUTO_HIDE_REPORTS,
  PoemAccessError,
  PoemValidationError,
  createMemberPoem,
  deleteMemberPoem,
  favoriteIds,
  getAuthorBySlug,
  getPoemBySlug,
  listAuthors,
  listFavorites,
  listOwnPoems,
  listPoems,
  listReports,
  moderate,
  poemOfTheDay,
  reportPoem,
  setFavorite,
  updateMemberPoem,
  validatePoemInput,
} from "@/server/poems";
import type { PoemInput } from "@/server/poems";

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

async function member(name: string, email = `${name.toLowerCase()}@exemple.test`) {
  return registerUser(db, { email, password: "mot de passe solide", name });
}

describe("bibliothèque", () => {
  it("charge les poètes, les poèmes du domaine public et les références", async () => {
    const authors = await listAuthors(db);
    expect(authors.length).toBeGreaterThanOrEqual(15);
    expect(authors.find((author) => author.slug === "charles-baudelaire")?.poemCount).toBeGreaterThan(5);

    const classics = await listPoems(db, { origin: "classic", pageSize: 60 });
    const references = await listPoems(db, { origin: "reference" });
    expect(classics.total).toBeGreaterThan(50);
    expect(references.total).toBeGreaterThan(0);
    expect(classics.items.every((poem) => poem.body.length > 50 && poem.sourceUrl?.startsWith("https://"))).toBe(true);
    expect(references.items.every((poem) => poem.body === "" && poem.sourceUrl?.startsWith("https://"))).toBe(true);
  });

  it("est rejouable sans doublon", async () => {
    const before = (await listPoems(db, { pageSize: 60 })).total;
    const { seedLibrary } = await import("@/db/seed");
    const again = await seedLibrary(db);
    expect(again.poems).toBe(0);
    expect((await listPoems(db, { pageSize: 60 })).total).toBe(before);
  });

  it("cherche sans tenir compte des accents ni de la casse, dans le titre, l'auteur et le texte", async () => {
    const byTitle = await listPoems(db, { q: "albatros" });
    expect(byTitle.items.map((poem) => poem.title)).toContain("L’Albatros");
    const byAuthor = await listPoems(db, { q: "GERARD DE NERVAL" });
    expect(byAuthor.items.every((poem) => poem.authorName === "Gérard de Nerval")).toBe(true);
    expect(byAuthor.total).toBeGreaterThan(0);
    expect((await listPoems(db, { q: "sanglots longs" })).items[0]?.title).toMatch(/automne/i);
  });

  it("filtre par poète, par thème et pagine", async () => {
    const verlaine = await listPoems(db, { authorSlug: "paul-verlaine", pageSize: 3 });
    expect(verlaine.items).toHaveLength(3);
    expect(verlaine.total).toBeGreaterThan(3);
    expect(verlaine.pageCount).toBeGreaterThan(1);
    const second = await listPoems(db, { authorSlug: "paul-verlaine", pageSize: 3, page: 2 });
    expect(second.items.map((p) => p.id)).not.toEqual(verlaine.items.map((p) => p.id));
    const mer = await listPoems(db, { theme: "mer", pageSize: 60 });
    expect(mer.items.every((poem) => poem.theme === "mer")).toBe(true);
    expect((await getAuthorBySlug(db, "victor-hugo"))?.name).toBe("Victor Hugo");
  });

  it("neutralise les caractères spéciaux de la recherche", async () => {
    expect((await listPoems(db, { q: "100%" })).total).toBe(0);
    expect((await listPoems(db, { q: "_" })).total).toBe(0);
  });

  it("propose le même poème du jour toute la journée, puis un autre le lendemain", async () => {
    const morning = await poemOfTheDay(db, new Date("2026-09-24T01:00:00Z"));
    const evening = await poemOfTheDay(db, new Date("2026-09-24T23:00:00Z"));
    const next = await poemOfTheDay(db, new Date("2026-09-25T01:00:00Z"));
    expect(morning?.id).toBe(evening?.id);
    expect(next?.id).not.toBe(morning?.id);
    expect(morning?.origin).toBe("classic");
  });
});

describe("poèmes de membres", () => {
  it("publie un poème sous le nom d'auteur, jamais l'e-mail", async () => {
    const alice = await member("Alice");
    const poem = await createMemberPoem(db, alice, INPUT);
    expect(poem.status).toBe("published");
    expect(poem.authorName).toBe("Alice");
    expect(poem.slug).toMatch(/^ce-que-dit-la-pluie-[0-9a-f]{6}$/);
    const view = await getPoemBySlug(db, poem.slug);
    expect(view?.authorName).toBe("Alice");
    expect(JSON.stringify(view)).not.toContain("alice@exemple.test");
    expect((await listPoems(db, { q: "doigt qui frappe" })).items.map((p) => p.id)).toContain(poem.id);
  });

  it("garde un brouillon privé, visible de son seul auteur (et d'un administrateur)", async () => {
    const alice = await member("Alice");
    const bob = await member("Bob");
    const draft = await createMemberPoem(db, alice, { ...INPUT, publish: false });
    expect(draft.status).toBe("draft");
    expect(draft.publishedAt).toBeNull();
    expect(await getPoemBySlug(db, draft.slug)).toBeUndefined();
    expect(await getPoemBySlug(db, draft.slug, bob)).toBeUndefined();
    expect((await getPoemBySlug(db, draft.slug, alice))?.id).toBe(draft.id);
    expect((await getPoemBySlug(db, draft.slug, { id: bob.id, role: "admin" }))?.id).toBe(draft.id);
    expect((await listPoems(db, { q: "pluie" })).items.map((p) => p.id)).not.toContain(draft.id);
  });

  it("refuse les poèmes invalides", () => {
    expect(() => validatePoemInput({ ...INPUT, title: " " })).toThrow(PoemValidationError);
    expect(() => validatePoemInput({ ...INPUT, body: "court" })).toThrow(/au moins/);
    expect(() => validatePoemInput({ ...INPUT, body: "x".repeat(6001) })).toThrow(/dépasser/);
    expect(() => validatePoemInput({ ...INPUT, body: "vers\n".repeat(201) })).toThrow(/lignes/);
    expect(() => validatePoemInput({ ...INPUT, theme: "inconnu" })).toThrow(/Thème/);
    expect(validatePoemInput({ ...INPUT, body: "un vers  \r\n\r\n\r\n\r\nun autre vers encore" }).body).toBe("un vers\n\nun autre vers encore");
  });

  it("ne laisse modifier ou supprimer un poème qu'à son auteur", async () => {
    const alice = await member("Alice");
    const bob = await member("Bob");
    const poem = await createMemberPoem(db, alice, INPUT);

    await expect(updateMemberPoem(db, bob, poem.id, { ...INPUT, title: "Volé" })).rejects.toBeInstanceOf(PoemAccessError);
    await expect(deleteMemberPoem(db, bob, poem.id)).rejects.toBeInstanceOf(PoemAccessError);

    const updated = await updateMemberPoem(db, alice, poem.id, { ...INPUT, title: "Ce que dit l'orage" });
    expect(updated.title).toBe("Ce que dit l'orage");
    expect(updated.slug).toBe(poem.slug);
    await deleteMemberPoem(db, alice, poem.id);
    expect(await getPoemBySlug(db, poem.slug)).toBeUndefined();
  });

  it("ne laisse pas éditer un poème de la bibliothèque, même en connaissant son identifiant", async () => {
    const alice = await member("Alice");
    const [classic] = await db.select().from(poems).where(eq(poems.origin, "classic")).limit(1);
    await expect(updateMemberPoem(db, alice, classic.id, INPUT)).rejects.toBeInstanceOf(PoemAccessError);
    await expect(deleteMemberPoem(db, alice, classic.id)).rejects.toBeInstanceOf(PoemAccessError);
  });

  it("dépublier un poème le repasse en brouillon, republier garde la date d'origine", async () => {
    const alice = await member("Alice");
    const poem = await createMemberPoem(db, alice, INPUT);
    const draft = await updateMemberPoem(db, alice, poem.id, { ...INPUT, publish: false });
    expect(draft.status).toBe("draft");
    const again = await updateMemberPoem(db, alice, poem.id, INPUT);
    expect(again.status).toBe("published");
    expect(again.publishedAt).not.toBeNull();
    expect((await listOwnPoems(db, alice)).map((p) => p.id)).toEqual([poem.id]);
  });
});

describe("favoris", () => {
  it("ajoute, retire, et ne compte qu'une fois", async () => {
    const alice = await member("Alice");
    const bob = await member("Bob");
    const [classic] = (await listPoems(db, { origin: "classic" })).items;

    await setFavorite(db, alice, classic.id, true);
    await setFavorite(db, alice, classic.id, true);
    await setFavorite(db, bob, classic.id, true);
    expect((await favoriteIds(db, alice, [classic.id])).has(classic.id)).toBe(true);
    expect((await getPoemBySlug(db, classic.slug))?.favoriteCount).toBe(2);
    expect((await listFavorites(db, alice)).map((p) => p.id)).toEqual([classic.id]);

    await setFavorite(db, alice, classic.id, false);
    expect((await getPoemBySlug(db, classic.slug))?.favoriteCount).toBe(1);
    expect(await favoriteIds(db, null, [classic.id])).toEqual(new Set());
  });

  it("classe les poèmes les plus aimés en premier", async () => {
    const alice = await member("Alice");
    const items = (await listPoems(db, { origin: "classic", sort: "recent", pageSize: 5 })).items;
    const target = items[3];
    await setFavorite(db, alice, target.id, true);
    expect((await listPoems(db, { origin: "classic", sort: "populaire" })).items[0].id).toBe(target.id);
  });

  it("refuse de mettre en favori un poème non publié", async () => {
    const alice = await member("Alice");
    const bob = await member("Bob");
    const draft = await createMemberPoem(db, alice, { ...INPUT, publish: false });
    await setFavorite(db, bob, draft.id, true);
    expect(await favoriteIds(db, bob, [draft.id])).toEqual(new Set());
  });
});

describe("signalements et modération", () => {
  it("n'accepte qu'un signalement ouvert par lecteur et par poème", async () => {
    const alice = await member("Alice");
    const bob = await member("Bob");
    const poem = await createMemberPoem(db, alice, INPUT);
    expect(await reportPoem(db, { poemId: poem.id, reporterId: bob.id, reason: "spam", note: "" })).toEqual({ recorded: true, hidden: false });
    expect(await reportPoem(db, { poemId: poem.id, reporterId: bob.id, reason: "spam", note: "" })).toEqual({ recorded: false, hidden: false });
    expect(await listReports(db)).toHaveLength(1);
  });

  it("masque un poème de membre à partir de plusieurs signalements distincts", async () => {
    const author = await member("Alice");
    const poem = await createMemberPoem(db, author, INPUT);
    let hidden = false;
    for (let i = 0; i < AUTO_HIDE_REPORTS; i += 1) {
      const reader = await member(`Lecteur${i}`);
      hidden = (await reportPoem(db, { poemId: poem.id, reporterId: reader.id, reason: "plagiat", note: "copié" })).hidden;
    }
    expect(hidden).toBe(true);
    expect(await getPoemBySlug(db, poem.slug)).toBeUndefined();
    expect((await getPoemBySlug(db, poem.slug, author))?.status).toBe("hidden");
    await expect(updateMemberPoem(db, author, poem.id, INPUT)).rejects.toBeInstanceOf(PoemAccessError);
  });

  it("ne masque jamais un poème de la bibliothèque, même signalé", async () => {
    const [classic] = (await listPoems(db, { origin: "classic" })).items;
    for (let i = 0; i < AUTO_HIDE_REPORTS + 1; i += 1) {
      const reader = await member(`Lecteur${i}`);
      await reportPoem(db, { poemId: classic.id, reporterId: reader.id, reason: "autre", note: "" });
    }
    expect((await getPoemBySlug(db, classic.slug))?.status).toBe("published");
  });

  it("permet à l'administrateur de rétablir, masquer ou supprimer", async () => {
    const author = await member("Alice");
    const poem = await createMemberPoem(db, author, INPUT);
    for (let i = 0; i < AUTO_HIDE_REPORTS; i += 1) {
      const reader = await member(`Lecteur${i}`);
      await reportPoem(db, { poemId: poem.id, reporterId: reader.id, reason: "spam", note: "" });
    }
    const [report] = await listReports(db);

    await moderate(db, report.id, "dismiss");
    expect((await getPoemBySlug(db, poem.slug))?.status).toBe("published");
    expect(await listReports(db)).toHaveLength(0);
    expect((await listReports(db, "closed")).length).toBeGreaterThan(0);

    const reader = await member("Nouveau");
    await reportPoem(db, { poemId: poem.id, reporterId: reader.id, reason: "illegal", note: "" });
    const [second] = await listReports(db);
    await moderate(db, second.id, "hide");
    expect(await getPoemBySlug(db, poem.slug)).toBeUndefined();

    const [again] = await listReports(db, "closed");
    await moderate(db, again.id, "delete");
    expect((await db.select().from(poems).where(eq(poems.id, poem.id))).length).toBe(0);
  });

  it("ne supprime pas un poème de la bibliothèque par la modération", async () => {
    const [classic] = (await listPoems(db, { origin: "classic" })).items;
    const reader = await member("Lecteur");
    await reportPoem(db, { poemId: classic.id, reporterId: reader.id, reason: "autre", note: "" });
    const [report] = await listReports(db);
    await moderate(db, report.id, "delete");
    expect((await getPoemBySlug(db, classic.slug))?.id).toBe(classic.id);
  });
});
