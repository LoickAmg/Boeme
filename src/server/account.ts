import { and, eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { poems, users } from "@/db/schema";
import type { User } from "@/db/schema";

export const BIO_MAX = 500;

export async function updateBio(db: Db, user: Pick<User, "id">, bio: string): Promise<string> {
  const clean = bio.replace(/\r\n?/g, "\n").trim().slice(0, BIO_MAX);
  await db.update(users).set({ bio: clean }).where(eq(users.id, user.id));
  return clean;
}

/**
 * Supprime le compte et tout ce qui l'identifie : poèmes publiés ou en
 * brouillon, favoris, sessions (droit à l'effacement). Les signalements
 * déposés par le membre restent, mais anonymisés (le lien vers son compte
 * disparaît avec lui).
 */
export async function deleteAccount(db: Db, user: Pick<User, "id">): Promise<void> {
  await db.delete(poems).where(and(eq(poems.userId, user.id), eq(poems.origin, "member")));
  await db.delete(users).where(eq(users.id, user.id));
}
