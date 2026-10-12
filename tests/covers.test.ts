import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Db } from "@/db/client";
import { registerUser } from "@/server/auth";
import { CoverError, parseCover, readCover, removeCover, setCover } from "@/server/covers";
import { createMemberPoem, getPoemBySlug } from "@/server/poems";
import type { PoemInput } from "@/server/poems";

import { createTestDb, resetDb } from "./helpers";

let db: Db;

beforeAll(async () => {
  db = await createTestDb();
});

beforeEach(async () => {
  await resetDb(db);
});

// Plus petit JPEG reconnaissable : la signature suffit au contrôle.
const JPEG = `data:image/jpeg;base64,${Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46]).toString("base64")}`;

const INPUT: PoemInput = {
  title: "La lune au balcon",
  body: "La lune au balcon se penche\nEt compte les toits endormis\n\nUn chat la suit des yeux",
  theme: "",
  language: "fr",
  publish: false,
  generated: false,
};

async function setup() {
  const alice = await registerUser(db, { email: "alice@exemple.test", password: "mot de passe solide", name: "Alice" });
  const bob = await registerUser(db, { email: "bob@exemple.test", password: "mot de passe solide", name: "Bob" });
  const poem = await createMemberPoem(db, alice, INPUT);
  return { alice, bob, poem };
}

describe("couvertures", () => {
  it("n'accepte que de vraies images JPEG, PNG ou WebP", () => {
    expect(parseCover(JPEG).mime).toBe("image/jpeg");
    expect(() => parseCover("data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=")).toThrow(CoverError);
    // Annoncé comme JPEG, mais c'est du HTML : refusé sur les octets.
    expect(() => parseCover(`data:image/jpeg;base64,${Buffer.from("<html>").toString("base64")}`)).toThrow(CoverError);
    expect(() => parseCover(`data:image/jpeg;base64,${Buffer.alloc(500 * 1024, 0xff).toString("base64")}`)).toThrow(/lourde/);
  });

  it("seul l'auteur pose ou retire la couverture de son poème", async () => {
    const { alice, bob, poem } = await setup();
    await expect(setCover(db, bob, poem.id, JPEG)).rejects.toBeInstanceOf(CoverError);
    await setCover(db, alice, poem.id, JPEG);
    expect((await getPoemBySlug(db, poem.slug, alice))?.coverVersion).toBeGreaterThan(0);

    await removeCover(db, bob, poem.id);
    expect(await readCover(db, poem.id, alice)).not.toBeNull();
    await removeCover(db, alice, poem.id);
    expect(await readCover(db, poem.id, alice)).toBeNull();
  });

  it("la couverture d'un brouillon reste privée", async () => {
    const { alice, bob, poem } = await setup();
    await setCover(db, alice, poem.id, JPEG);
    expect(await readCover(db, poem.id, null)).toBeNull();
    expect(await readCover(db, poem.id, bob)).toBeNull();
    expect((await readCover(db, poem.id, alice))?.isPublic).toBe(false);
  });
});
