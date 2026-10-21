import { createHash, randomBytes } from "node:crypto";

import { and, eq, gt, lt } from "drizzle-orm";

import type { Db } from "@/db/client";
import { emailVerifications, users } from "@/db/schema";
import type { User } from "@/db/schema";

/** Durée de validité d'un lien de confirmation : plus long qu'une réinitialisation de mot de passe, un e-mail se lit parfois plus tard. */
export const VERIFICATION_HOURS = 48;

export class EmailVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailVerificationError";
  }
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Prépare un lien de confirmation pour ce compte. Un nouvel envoi annule les précédents
 * (un seul lien valable à la fois).
 */
export async function createEmailVerification(db: Db, userId: string, now = new Date()): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await db.delete(emailVerifications).where(eq(emailVerifications.userId, userId));
  await db.insert(emailVerifications).values({ id: sha256(token), userId, expiresAt: new Date(now.getTime() + VERIFICATION_HOURS * 60 * 60_000) });
  return token;
}

/** Le jeton est-il encore valable ? (pour afficher le bouton de confirmation ou un message d'expiration) */
export async function emailVerificationTokenIsValid(db: Db, token: string, now = new Date()): Promise<boolean> {
  if (!token || token.length > 100) return false;
  const [row] = await db
    .select({ id: emailVerifications.id })
    .from(emailVerifications)
    .where(and(eq(emailVerifications.id, sha256(token)), gt(emailVerifications.expiresAt, now)))
    .limit(1);
  return Boolean(row);
}

/**
 * Utilise un jeton de confirmation : jeton consommé (suppression atomique, il ne sert qu'une
 * fois), adresse marquée comme vérifiée. Renvoie le membre concerné.
 */
export async function confirmEmail(db: Db, token: string, now = new Date()): Promise<User> {
  if (!token || token.length > 100) throw new EmailVerificationError("Ce lien n'est pas valable.");

  const [used] = await db
    .delete(emailVerifications)
    .where(and(eq(emailVerifications.id, sha256(token)), gt(emailVerifications.expiresAt, now)))
    .returning({ userId: emailVerifications.userId });
  if (!used) throw new EmailVerificationError("Ce lien a expiré ou a déjà servi. Demandez-en un nouveau depuis votre espace.");

  const [user] = await db
    .update(users)
    .set({ emailVerifiedAt: now })
    .where(eq(users.id, used.userId))
    .returning();
  return user;
}

export async function purgeExpiredEmailVerifications(db: Db, now = new Date()): Promise<void> {
  await db.delete(emailVerifications).where(lt(emailVerifications.expiresAt, now));
}
