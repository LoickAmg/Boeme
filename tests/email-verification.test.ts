import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Db } from "@/db/client";
import { emailVerifications } from "@/db/schema";
import { registerUser } from "@/server/auth";
import { EmailVerificationError, confirmEmail, createEmailVerification, emailVerificationTokenIsValid, purgeExpiredEmailVerifications } from "@/server/email-verification";

import { createTestDb, resetDb } from "./helpers";

let db: Db;

beforeAll(async () => {
  db = await createTestDb();
});

beforeEach(async () => {
  await resetDb(db);
});

async function alice() {
  return registerUser(db, { email: "alice@exemple.test", password: "mot de passe correct", name: "Alice" });
}

describe("confirmation de l'adresse e-mail", () => {
  it("ne vérifie pas l'adresse à l'inscription", async () => {
    const user = await alice();
    expect(user.emailVerifiedAt).toBeNull();
  });

  it("ne stocke que l'empreinte du jeton", async () => {
    const user = await alice();
    const token = await createEmailVerification(db, user.id);
    const rows = await db.select().from(emailVerifications);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).not.toBe(token);
    expect(await emailVerificationTokenIsValid(db, token)).toBe(true);
  });

  it("confirme une seule fois et marque l'adresse comme vérifiée", async () => {
    const user = await alice();
    const token = await createEmailVerification(db, user.id);

    const confirmed = await confirmEmail(db, token);
    expect(confirmed.emailVerifiedAt).not.toBeNull();
    await expect(confirmEmail(db, token)).rejects.toBeInstanceOf(EmailVerificationError);
  });

  it("refuse un jeton expiré", async () => {
    const user = await alice();
    const past = new Date(Date.now() - 50 * 3600_000);
    const token = await createEmailVerification(db, user.id, past);
    expect(await emailVerificationTokenIsValid(db, token)).toBe(false);
    await expect(confirmEmail(db, token)).rejects.toBeInstanceOf(EmailVerificationError);
  });

  it("refuse un jeton inconnu ou trop long", async () => {
    await expect(confirmEmail(db, "jeton-inexistant")).rejects.toBeInstanceOf(EmailVerificationError);
    await expect(confirmEmail(db, "x".repeat(200))).rejects.toBeInstanceOf(EmailVerificationError);
  });

  it("un nouveau lien annule le précédent", async () => {
    const user = await alice();
    const first = await createEmailVerification(db, user.id);
    const second = await createEmailVerification(db, user.id);
    expect(await emailVerificationTokenIsValid(db, first)).toBe(false);
    expect(await emailVerificationTokenIsValid(db, second)).toBe(true);
  });

  it("purge les jetons expirés", async () => {
    const user = await alice();
    const past = new Date(Date.now() - 50 * 3600_000);
    await createEmailVerification(db, user.id, past);
    await purgeExpiredEmailVerifications(db);
    expect(await db.select().from(emailVerifications)).toHaveLength(0);
  });
});
