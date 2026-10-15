import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Db } from "@/db/client";
import { deleteAccount } from "@/server/account";
import { registerUser } from "@/server/auth";
import { FeedbackError, cleanPagePath, countNewFeedback, deleteFeedback, listFeedback, setFeedbackStatus, submitFeedback } from "@/server/feedback";

import { createTestDb, resetDb } from "./helpers";

let db: Db;

beforeAll(async () => {
  db = await createTestDb();
});

beforeEach(async () => {
  await resetDb(db);
});

describe("retours des lecteurs", () => {
  it("enregistre le retour d'un membre avec son nom, sans adresse de contact", async () => {
    const alice = await registerUser(db, { email: "alice@exemple.test", password: "mot de passe solide", name: "Alice" });
    const saved = await submitFeedback(db, alice, { kind: "bug", message: "  Le bouton ne marche pas  ", page: "/poemes/x?publie=1#haut", contact: "autre@exemple.test" });
    expect(saved).toMatchObject({ kind: "bug", message: "Le bouton ne marche pas", page: "/poemes/x", authorName: "Alice", contact: "", status: "nouveau" });
  });

  it("accepte un visiteur anonyme, avec nom et adresse facultatifs", async () => {
    const saved = await submitFeedback(db, null, { kind: "idee", message: "Un mode sombre ?", name: "Zoé", contact: "ZOE@Exemple.test" });
    expect(saved).toMatchObject({ userId: null, authorName: "Zoé", contact: "zoe@exemple.test" });
  });

  it("refuse un type inconnu, un message vide ou trop long, une adresse invalide", async () => {
    await expect(submitFeedback(db, null, { kind: "pub", message: "Bonjour à tous" })).rejects.toMatchObject({ field: "kind" });
    await expect(submitFeedback(db, null, { kind: "avis", message: "  ok " })).rejects.toBeInstanceOf(FeedbackError);
    await expect(submitFeedback(db, null, { kind: "avis", message: "x".repeat(3001) })).rejects.toMatchObject({ field: "message" });
    await expect(submitFeedback(db, null, { kind: "avis", message: "Très joli site", contact: "pas-une-adresse" })).rejects.toMatchObject({ field: "contact" });
  });

  it("ne garde que le chemin interne de la page", () => {
    expect(cleanPagePath("https://ailleurs.test/piege")).toBe("");
    expect(cleanPagePath("//ailleurs.test")).toBe("");
    expect(cleanPagePath("/communaute?tri=lus")).toBe("/communaute");
  });

  it("se trie, se marque lu ou traité, se supprime", async () => {
    const first = await submitFeedback(db, null, { kind: "avis", message: "Premier retour" });
    await submitFeedback(db, null, { kind: "suggestion", message: "Second retour" });
    expect(await countNewFeedback(db)).toBe(2);
    await setFeedbackStatus(db, first.id, "traite");
    expect(await countNewFeedback(db)).toBe(1);
    expect((await listFeedback(db, { status: "traite" })).map((f) => f.id)).toEqual([first.id]);
    await deleteFeedback(db, first.id);
    expect(await listFeedback(db)).toHaveLength(1);
  });

  it("garde les retours d'un compte supprimé, mais sans son nom", async () => {
    const bob = await registerUser(db, { email: "bob@exemple.test", password: "mot de passe solide", name: "Bob" });
    await submitFeedback(db, bob, { kind: "avis", message: "J'adore la gazette" });
    await deleteAccount(db, bob);
    const [kept] = await listFeedback(db);
    expect(kept).toMatchObject({ message: "J'adore la gazette", userId: null, authorName: "" });
  });
});
