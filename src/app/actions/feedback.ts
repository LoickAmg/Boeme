"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { site, siteUrl } from "@/config/site";
import { getDb } from "@/db/client";
import { getCurrentUser } from "@/server/context";
import { FEEDBACK_KIND_LABELS, FeedbackError, deleteFeedback, isFeedbackKind, setFeedbackStatus, submitFeedback } from "@/server/feedback";
import { FEEDBACK_STATUSES } from "@/db/schema";
import { requireAdmin } from "@/server/guard";
import { feedbackMail, mailConfigured, sendMail } from "@/server/mail";
import { hitRateLimit } from "@/server/rate-limit";
import { clientFingerprint } from "@/server/request";

export interface FeedbackState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
}

/** Destinataire des alertes : FEEDBACK_EMAIL, sinon l'administrateur, sinon l'adresse de contact. */
function feedbackRecipient(): string {
  return process.env.FEEDBACK_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim() || site.contactEmail;
}

export async function sendFeedbackAction(_previous: FeedbackState, formData: FormData): Promise<FeedbackState> {
  const values = {
    kind: String(formData.get("kind") ?? ""),
    message: String(formData.get("message") ?? ""),
    contact: String(formData.get("contact") ?? ""),
    name: String(formData.get("name") ?? ""),
  };
  // Champ piège invisible : seuls les robots le remplissent. On fait comme si tout s'était bien passé.
  if (String(formData.get("site_web") ?? "")) return { ok: true };

  const db = await getDb();
  const limit = await hitRateLimit(db, `feedback:${clientFingerprint(await headers())}`, { max: 10, windowSeconds: 3600 });
  if (!limit.allowed) return { message: "Merci pour tous ces retours ! Vous en avez envoyé beaucoup : réessayez dans une heure.", values };

  const user = await getCurrentUser();
  let saved;
  try {
    saved = await submitFeedback(db, user, { ...values, page: String(formData.get("page") ?? "") });
  } catch (error) {
    if (error instanceof FeedbackError) return { errors: { [error.field]: error.message }, values };
    throw error;
  }

  // L'e-mail part après la réponse : le visiteur n'attend pas Gmail, et un échec d'envoi
  // ne fait pas perdre le retour (il reste dans la page « Retours »).
  if (mailConfigured()) {
    const kind = isFeedbackKind(saved.kind) ? FEEDBACK_KIND_LABELS[saved.kind] : saved.kind;
    after(async () => {
      try {
        await sendMail(
          feedbackMail({
            to: feedbackRecipient(),
            kind,
            message: saved.message,
            page: saved.page,
            from: saved.authorName ? `${saved.authorName}${user ? " (membre)" : ""}` : "",
            contact: saved.contact,
            adminUrl: `${siteUrl()}/admin/retours`,
          }),
        );
      } catch (error) {
        console.error("Alerte e-mail du retour impossible", error);
      }
    });
  }
  revalidatePath("/admin/retours");
  return { ok: true, message: "Votre retour est bien arrivé : il sera lu avec attention." };
}

export async function manageFeedbackAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  const db = await getDb();
  const action = String(formData.get("action") ?? "");
  if (action === "supprimer") await deleteFeedback(db, id);
  else if ((FEEDBACK_STATUSES as readonly string[]).includes(action)) await setFeedbackStatus(db, id, action as (typeof FEEDBACK_STATUSES)[number]);
  revalidatePath("/admin/retours");
}
