import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Db } from "@/db/client";
import { passwordResets, sessions } from "@/db/schema";
import { authenticate, createSession, getSessionUser, registerUser } from "@/server/auth";
import { PasswordError, changePassword, createPasswordReset, resetPassword, resetTokenIsValid } from "@/server/password";

import { createTestDb, resetDb } from "./helpers";

let db: Db;

beforeAll(async () => {
  db = await createTestDb();
});

beforeEach(async () => {
  await resetDb(db);
});

const OLD = "ancien mot de passe";
const NEW = "nouveau mot de passe";

async function alice() {
  return registerUser(db, { email: "alice@exemple.test", password: OLD, name: "Alice" });
}

describe("changement de mot de passe", () => {
  it("exige le mot de passe actuel", async () => {
    const user = await alice();
    await expect(changePassword(db, user, { current: "faux mot de passe", next: NEW })).rejects.toMatchObject({ field: "current" });
    expect(await authenticate(db, "alice@exemple.test", OLD)).not.toBeNull();
  });

  it("refuse un mot de passe trop court ou identique", async () => {
    const user = await alice();
    await expect(changePassword(db, user, { current: OLD, next: "court" })).rejects.toBeInstanceOf(PasswordError);
    await expect(changePassword(db, user, { current: OLD, next: OLD })).rejects.toMatchObject({ field: "password" });
  });

  it("change le mot de passe et ferme les autres sessions, sauf la courante", async () => {
    const user = await alice();
    const current = await createSession(db, user.id);
    const other = await createSession(db, user.id);
    await changePassword(db, user, { current: OLD, next: NEW }, current.token);

    expect(await authenticate(db, "alice@exemple.test", OLD)).toBeNull();
    expect(await authenticate(db, "alice@exemple.test", NEW)).not.toBeNull();
    expect(await getSessionUser(db, current.token)).not.toBeNull();
    expect(await getSessionUser(db, other.token)).toBeNull();
  });
});

describe("mot de passe oublié", () => {
  it("ne crée rien pour une adresse inconnue", async () => {
    expect(await createPasswordReset(db, "personne@exemple.test")).toBeNull();
  });

  it("ne stocke que l'empreinte du jeton", async () => {
    await alice();
    const reset = await createPasswordReset(db, "  ALICE@exemple.test ");
    const rows = await db.select().from(passwordResets);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).not.toBe(reset?.token);
    expect(await resetTokenIsValid(db, reset!.token)).toBe(true);
  });

  it("réinitialise une seule fois et ferme toutes les sessions", async () => {
    const user = await alice();
    const session = await createSession(db, user.id);
    const reset = await createPasswordReset(db, "alice@exemple.test");

    expect(await resetPassword(db, reset!.token, NEW)).toBe(user.id);
    expect(await authenticate(db, "alice@exemple.test", NEW)).not.toBeNull();
    expect(await getSessionUser(db, session.token)).toBeNull();
    await expect(resetPassword(db, reset!.token, "encore un autre mot")).rejects.toMatchObject({ field: "token" });
  });

  it("refuse un jeton expiré", async () => {
    await alice();
    const past = new Date(Date.now() - 2 * 3600_000);
    const reset = await createPasswordReset(db, "alice@exemple.test", past);
    expect(await resetTokenIsValid(db, reset!.token)).toBe(false);
    await expect(resetPassword(db, reset!.token, NEW)).rejects.toMatchObject({ field: "token" });
  });

  it("un nouveau lien annule le précédent", async () => {
    await alice();
    const first = await createPasswordReset(db, "alice@exemple.test");
    const second = await createPasswordReset(db, "alice@exemple.test");
    expect(await resetTokenIsValid(db, first!.token)).toBe(false);
    expect(await resetTokenIsValid(db, second!.token)).toBe(true);
  });

  it("garde le lien valable si le nouveau mot de passe est refusé", async () => {
    const user = await alice();
    const reset = await createPasswordReset(db, "alice@exemple.test");
    await expect(resetPassword(db, reset!.token, "court")).rejects.toMatchObject({ field: "password" });
    expect(await resetTokenIsValid(db, reset!.token)).toBe(true);
    expect(await db.select().from(sessions).where(eq(sessions.userId, user.id))).toHaveLength(0);
  });
});
