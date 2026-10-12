"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { siteUrl } from "@/config/site";
import { getDb } from "@/db/client";
import { createSession } from "@/server/auth";
import { SESSION_COOKIE, cookieOptions } from "@/server/context";
import { requireAdmin, requireUser } from "@/server/guard";
import { mailConfigured, passwordResetMail, sendMail } from "@/server/mail";
import { PasswordError, RESET_MINUTES, changePassword, createPasswordReset, purgeExpiredResets, resetPassword } from "@/server/password";
import { hitRateLimit } from "@/server/rate-limit";
import { clientFingerprint, fingerprintOf } from "@/server/request";

export interface PasswordState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
  /** Lien de réinitialisation créé par l'administrateur (affiché une seule fois). */
  link?: string;
}

const emailField = z.string().trim().toLowerCase().email("Adresse e-mail invalide.").max(160);

function resetLink(token: string): string {
  return `${siteUrl()}/compte/nouveau-mot-de-passe?jeton=${encodeURIComponent(token)}`;
}

export async function changePasswordAction(_previous: PasswordState, formData: FormData): Promise<PasswordState> {
  const user = await requireUser("/compte");
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!current) return { errors: { current: "Indiquez votre mot de passe actuel." } };
  if (next !== confirm) return { errors: { confirm: "Les deux mots de passe ne correspondent pas." } };

  const db = await getDb();
  const limit = await hitRateLimit(db, `password-change:${user.id}`, { max: 8, windowSeconds: 900 });
  if (!limit.allowed) return { message: "Trop de tentatives. Réessayez dans quelques minutes." };

  try {
    await changePassword(db, user, { current, next }, (await cookies()).get(SESSION_COOKIE)?.value);
  } catch (error) {
    if (error instanceof PasswordError) return { errors: { [error.field]: error.message } };
    throw error;
  }
  return { ok: true, message: "Mot de passe changé. Vos autres appareils ont été déconnectés." };
}

const SENT =
  "Si un compte existe avec cette adresse, un e-mail vient de partir avec un lien pour choisir un nouveau mot de passe. Pensez à regarder dans les indésirables.";

export async function forgotPasswordAction(_previous: PasswordState, formData: FormData): Promise<PasswordState> {
  const parsed = emailField.safeParse(formData.get("email"));
  if (!parsed.success) return { errors: { email: "Adresse e-mail invalide." }, values: { email: String(formData.get("email") ?? "") } };
  const email = parsed.data;

  if (!mailConfigured() && process.env.NODE_ENV === "production") {
    return { message: "L'envoi d'e-mails n'est pas encore activé sur Boème. Écrivez-nous depuis la page Contact : nous vous enverrons un lien." };
  }

  const db = await getDb();
  const [byClient, byAccount] = await Promise.all([
    hitRateLimit(db, `reset-ip:${clientFingerprint(await headers())}`, { max: 6, windowSeconds: 3600 }),
    hitRateLimit(db, `reset-account:${fingerprintOf(email)}`, { max: 3, windowSeconds: 3600 }),
  ]);
  if (!byClient.allowed) return { message: "Trop de demandes depuis cette connexion. Réessayez dans une heure.", values: { email } };
  // Même réponse que si l'e-mail était parti : rien n'indique si l'adresse a un compte.
  if (!byAccount.allowed) return { ok: true, message: SENT };

  await purgeExpiredResets(db);
  const reset = await createPasswordReset(db, email);
  if (reset) {
    try {
      await sendMail(passwordResetMail({ to: reset.user.email, name: reset.user.name, link: resetLink(reset.token), minutes: RESET_MINUTES }));
    } catch (error) {
      console.error("Envoi de l'e-mail de réinitialisation impossible", error);
      return { message: "L'e-mail n'a pas pu partir. Réessayez dans quelques minutes.", values: { email } };
    }
  }
  return { ok: true, message: SENT };
}

export async function resetPasswordAction(_previous: PasswordState, formData: FormData): Promise<PasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password !== String(formData.get("confirm") ?? "")) return { errors: { confirm: "Les deux mots de passe ne correspondent pas." } };

  const db = await getDb();
  const limit = await hitRateLimit(db, `reset-use:${clientFingerprint(await headers())}`, { max: 10, windowSeconds: 900 });
  if (!limit.allowed) return { message: "Trop de tentatives. Réessayez dans quelques minutes." };

  let userId: string;
  try {
    userId = await resetPassword(db, token, password);
  } catch (error) {
    if (error instanceof PasswordError) return error.field === "token" ? { message: error.message } : { errors: { [error.field]: error.message } };
    throw error;
  }
  const { token: session, expiresAt } = await createSession(db, userId);
  (await cookies()).set(SESSION_COOKIE, session, cookieOptions(expiresAt));
  redirect("/compte?mot-de-passe=1");
}

/**
 * Secours quand l'envoi d'e-mails n'est pas configuré : l'administrateur crée le lien et le
 * transmet lui-même au membre (après avoir vérifié que la demande vient bien de lui).
 */
export async function adminResetLinkAction(_previous: PasswordState, formData: FormData): Promise<PasswordState> {
  await requireAdmin();
  const parsed = emailField.safeParse(formData.get("email"));
  if (!parsed.success) return { errors: { email: "Adresse e-mail invalide." } };
  const db = await getDb();
  const reset = await createPasswordReset(db, parsed.data);
  if (!reset) return { message: "Aucun compte avec cette adresse.", values: { email: parsed.data } };
  return { ok: true, link: resetLink(reset.token), message: `Lien pour ${reset.user.name}, valable ${RESET_MINUTES} minutes, une seule fois. Transmettez-le uniquement à cette personne.` };
}
