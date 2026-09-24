import { cache } from "react";

import { cookies } from "next/headers";

import { getDb } from "@/db/client";
import type { User } from "@/db/schema";
import { getSessionUser } from "@/server/auth";

export const SESSION_COOKIE = "boeme_session";

const isProduction = process.env.NODE_ENV === "production";

export function cookieOptions(expires?: Date) {
  return { httpOnly: true, sameSite: "lax" as const, secure: isProduction, path: "/", ...(expires ? { expires } : {}) };
}

/** Membre connecté (au plus une lecture en base par requête). */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return getSessionUser(await getDb(), token);
});
