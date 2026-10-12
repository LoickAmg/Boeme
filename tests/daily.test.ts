import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Db } from "@/db/client";
import { registerUser } from "@/server/auth";
import {
  FeatureError,
  communityPoemOfTheDay,
  createMemberPoem,
  featureDayOf,
  featurePoem,
  poemsOfTheDay,
  setFavorite,
  unfeaturePoem,
  upcomingFeatures,
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

const poem = (title: string, publish = true): PoemInput => ({
  title,
  body: "Un vers qui marche sous la pluie\nUn autre qui rentre à la maison",
  theme: "",
  language: "fr",
  publish,
  generated: false,
});

const DAY = new Date("2026-10-12T10:00:00Z");
const NEXT_DAY = new Date("2026-10-13T10:00:00Z");

describe("poèmes du jour", () => {
  it("un classique chaque jour, et un poème de la communauté dès qu'il en existe", async () => {
    const empty = await poemsOfTheDay(db, DAY);
    expect(empty.classic?.origin).toBe("classic");
    expect(empty.community).toBeUndefined();
    expect(empty.spotlight).toBe("classic");

    const alice = await registerUser(db, { email: "alice@exemple.test", password: "mot de passe solide", name: "Alice" });
    await createMemberPoem(db, alice, poem("Brouillon secret", false));
    await createMemberPoem(db, alice, poem("Publié"));
    const today = await poemsOfTheDay(db, DAY);
    expect(today.community?.title).toBe("Publié");
    expect(today.featured).toBe(false);
  });

  it("la vedette alterne d'un jour à l'autre, et le tirage ne change pas dans la journée", async () => {
    const alice = await registerUser(db, { email: "alice@exemple.test", password: "mot de passe solide", name: "Alice" });
    for (const title of ["Un", "Deux", "Trois", "Quatre"]) await createMemberPoem(db, alice, poem(title));
    const a = await poemsOfTheDay(db, DAY);
    const b = await poemsOfTheDay(db, new Date("2026-10-12T23:30:00Z"));
    const c = await poemsOfTheDay(db, NEXT_DAY);
    expect(a.community?.id).toBe(b.community?.id);
    expect(a.spotlight).not.toBe(c.spotlight);
  });

  it("les poèmes aimés ont plus de chances d'être tirés", async () => {
    const alice = await registerUser(db, { email: "alice@exemple.test", password: "mot de passe solide", name: "Alice" });
    const loved = await createMemberPoem(db, alice, poem("Aimé"));
    await createMemberPoem(db, alice, poem("Discret"));
    for (let i = 0; i < 20; i++) {
      const reader = await registerUser(db, { email: `lecteur${i}@exemple.test`, password: "mot de passe solide", name: `Lecteur ${i}` });
      await setFavorite(db, reader, loved.id, true);
    }
    let lovedDays = 0;
    for (let d = 0; d < 60; d++) {
      const pick = await communityPoemOfTheDay(db, new Date(DAY.getTime() + d * 86_400_000));
      if (pick?.poem.id === loved.id) lovedDays++;
    }
    // 21 chances contre 1 : très largement majoritaire, sans exclure l'autre.
    expect(lovedDays).toBeGreaterThan(45);
  });
});

describe("mise à l'honneur par un administrateur", () => {
  it("prend la place du tirage, passe en vedette, et fait la queue jour après jour", async () => {
    const admin = await registerUser(db, { email: "admin@exemple.test", password: "mot de passe solide", name: "Admin" });
    const alice = await registerUser(db, { email: "alice@exemple.test", password: "mot de passe solide", name: "Alice" });
    const first = await createMemberPoem(db, alice, poem("Premier choix"));
    const second = await createMemberPoem(db, alice, poem("Second choix"));
    for (const t of ["Aube", "Brume", "Ciel"]) await createMemberPoem(db, alice, poem(t));

    expect(await featurePoem(db, admin, first.id, DAY)).toBe("2026-10-12");
    expect(await featurePoem(db, admin, second.id, DAY)).toBe("2026-10-13");
    // Déjà programmé : même jour, pas de doublon.
    expect(await featurePoem(db, admin, first.id, DAY)).toBe("2026-10-12");

    const today = await poemsOfTheDay(db, DAY);
    expect(today.community?.id).toBe(first.id);
    expect(today.featured).toBe(true);
    expect(today.spotlight).toBe("community");
    expect((await poemsOfTheDay(db, NEXT_DAY)).community?.id).toBe(second.id);
    expect((await upcomingFeatures(db, DAY)).map((f) => f.title)).toEqual(["Premier choix", "Second choix"]);

    await unfeaturePoem(db, second.id);
    expect(await featureDayOf(db, second.id)).toBeUndefined();
  });

  it("refuse les classiques et les brouillons", async () => {
    const admin = await registerUser(db, { email: "admin@exemple.test", password: "mot de passe solide", name: "Admin" });
    const draft = await createMemberPoem(db, admin, poem("Brouillon", false));
    await expect(featurePoem(db, admin, draft.id, DAY)).rejects.toBeInstanceOf(FeatureError);
    const classic = await poemsOfTheDay(db, DAY);
    await expect(featurePoem(db, admin, classic.classic!.id, DAY)).rejects.toBeInstanceOf(FeatureError);
  });
});
