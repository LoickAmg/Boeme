"use server";

import { headers } from "next/headers";

import { siteUrl } from "@/config/site";
import { getDb } from "@/db/client";
import type { Db } from "@/db/client";
import type { User } from "@/db/schema";
import { EmailVerificationError, VERIFICATION_HOURS, confirmEmail, createEmailVerification } from "@/server/email-verification";
import { requireUser } from "@/server/guard";
import { mailConfigured, sendMail, verificationMail } from "@/server/mail";
import { hitRateLimit } from "@/server/rate-limit";
import { clientFingerprint } from "@/server/request";

export interface VerificationState {
  ok?: boolean;
  message?: string;
}

function verificationLink(token: string): string {
  return `${siteUrl()}/compte/verification?jeton=${encodeURIComponent(token)}`;
}

/** Crée un lien et l'envoie, sans jamais faire échouer l'appelant (inscription ou renvoi). */
export async function sendVerificationEmail(db: Db, user: Pick<User, "id" | "name" | "email">): Promise<void> {
  if (!mailConfigured() && process.env.NODE_ENV === "production") return;
  try {
    const token = await createEmailVerification(db, user.id);
    await sendMail(verificationMail({ to: user.email, name: user.name, link: verificationLink(token), hours: VERIFICATION_HOURS }));
  } catch (error) {
    console.error("Envoi de l'e-mail de confirmation impossible", error);
  }
}

export async function verifyEmailAction(_previous: VerificationState, formData: FormData): Promise<VerificationState> {
  const token = String(formData.get("token") ?? "");

  const db = await getDb();
  const limit = await hitRateLimit(db, `verify-email:${clientFingerprint(await headers())}`, { max: 10, windowSeconds: 900 });
  if (!limit.allowed) return { message: "Trop de tentatives. Réessayez dans quelques minutes." };

  try {
    const user = await confirmEmail(db, token);
    return { ok: true, message: `Adresse confirmée : bienvenue, ${user.name}.` };
  } catch (error) {
    if (error instanceof EmailVerificationError) return { message: error.message };
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature imposée par useActionState, qui n'a besoin d'aucun des deux ici.
export async function resendVerificationAction(_previous: VerificationState, _formData: FormData): Promise<VerificationState> {
  const user = await requireUser("/compte");
  if (user.emailVerifiedAt) return { ok: true, message: "Votre adresse e-mail est déjà confirmée." };

  const db = await getDb();
  const limit = await hitRateLimit(db, `verify-resend:${user.id}`, { max: 5, windowSeconds: 3600 });
  if (!limit.allowed) return { message: "Trop de demandes. Réessayez dans quelques minutes." };

  await sendVerificationEmail(db, user);
  return { ok: true, message: "Un e-mail de confirmation vient de partir. Pensez à regarder dans les indésirables." };
}
