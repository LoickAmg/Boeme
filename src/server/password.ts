import { createHash, randomBytes } from "node:crypto";

import { and, eq, gt, lt, ne } from "drizzle-orm";

import type { Db } from "@/db/client";
import { passwordResets, sessions, users } from "@/db/schema";
import type { User } from "@/db/schema";

import { hashPassword, normalizeEmail, validatePassword, verifyPassword } from "./auth";

/** Durée de validité d'un lien de réinitialisation. */
export const RESET_MINUTES = 60;

export class PasswordError extends Error {
  constructor(
    message: string,
    readonly field: "current" | "password" | "token",
  ) {
    super(message);
    this.name = "PasswordError";
  }
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Change le mot de passe d'un membre connecté, après vérification de l'actuel. Toutes ses autres
 * sessions sont fermées (un appareil volé ou oublié est déconnecté), sauf `keepSessionToken`.
 */
export async function changePassword(
  db: Db,
  user: Pick<User, "id">,
  input: { current: string; next: string },
  keepSessionToken?: string,
): Promise<void> {
  const [row] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!row || !(await verifyPassword(input.current, row.passwordHash))) throw new PasswordError("Le mot de passe actuel est incorrect.", "current");
  const problem = validatePassword(input.next);
  if (problem) throw new PasswordError(problem, "password");
  if (input.next === input.current) throw new PasswordError("Choisissez un mot de passe différent de l'actuel.", "password");

  await db.update(users).set({ passwordHash: await hashPassword(input.next) }).where(eq(users.id, user.id));
  const keep = keepSessionToken ? sha256(keepSessionToken) : "";
  await db.delete(sessions).where(and(eq(sessions.userId, user.id), ne(sessions.id, keep)));
  await db.delete(passwordResets).where(eq(passwordResets.userId, user.id));
}

/**
 * Prépare une réinitialisation pour l'adresse donnée. Renvoie le jeton (à envoyer par e-mail) et
 * le compte, ou `null` si aucun compte n'existe : l'appelant affiche alors exactement le même
 * message, pour ne pas révéler qui est inscrit. Un nouveau lien annule les précédents.
 */
export async function createPasswordReset(db: Db, emailInput: string, now = new Date()): Promise<{ token: string; user: Pick<User, "id" | "name" | "email"> } | null> {
  const [user] = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.email, normalizeEmail(emailInput))).limit(1);
  if (!user) return null;
  const token = randomBytes(32).toString("base64url");
  await db.delete(passwordResets).where(eq(passwordResets.userId, user.id));
  await db.insert(passwordResets).values({ id: sha256(token), userId: user.id, expiresAt: new Date(now.getTime() + RESET_MINUTES * 60_000) });
  return { token, user };
}

/** Le jeton est-il encore valable ? (pour afficher le formulaire ou un message d'expiration) */
export async function resetTokenIsValid(db: Db, token: string, now = new Date()): Promise<boolean> {
  if (!token || token.length > 100) return false;
  const [row] = await db
    .select({ id: passwordResets.id })
    .from(passwordResets)
    .where(and(eq(passwordResets.id, sha256(token)), gt(passwordResets.expiresAt, now)))
    .limit(1);
  return Boolean(row);
}

/**
 * Utilise un jeton : nouveau mot de passe, jeton consommé (suppression atomique : il ne sert
 * qu'une fois, même avec deux envois simultanés), toutes les sessions fermées.
 * Renvoie l'identifiant du membre, pour ouvrir une nouvelle session.
 */
export async function resetPassword(db: Db, token: string, password: string, now = new Date()): Promise<string> {
  const problem = validatePassword(password);
  if (problem) throw new PasswordError(problem, "password");
  if (!token || token.length > 100) throw new PasswordError("Ce lien n'est pas valable.", "token");

  const [used] = await db
    .delete(passwordResets)
    .where(and(eq(passwordResets.id, sha256(token)), gt(passwordResets.expiresAt, now)))
    .returning({ userId: passwordResets.userId });
  if (!used) throw new PasswordError("Ce lien a expiré ou a déjà servi. Demandez-en un nouveau.", "token");

  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, used.userId));
  await db.delete(sessions).where(eq(sessions.userId, used.userId));
  await db.delete(passwordResets).where(eq(passwordResets.userId, used.userId));
  return used.userId;
}

export async function purgeExpiredResets(db: Db, now = new Date()): Promise<void> {
  await db.delete(passwordResets).where(lt(passwordResets.expiresAt, now));
}
