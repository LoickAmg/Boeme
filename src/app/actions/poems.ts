"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getDb } from "@/db/client";
import { GENERATOR_TO_LIBRARY_THEME } from "@/lib/poetry/labels";
import { THEME_IDS as GENERATOR_THEME_IDS } from "@/lib/poetry/types";
import type { ThemeId as GeneratorThemeId } from "@/lib/poetry/types";
import { safeReturnPath } from "@/lib/redirect";
import { requireUser } from "@/server/guard";
import {
  PoemAccessError,
  PoemValidationError,
  createMemberPoem,
  deleteMemberPoem,
  isReportReason,
  reportPoem,
  setFavorite,
  updateMemberPoem,
} from "@/server/poems";
import { hitRateLimit } from "@/server/rate-limit";

export interface PoemFormState {
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
}

const PUBLISH_PER_DAY = 20;

/** Enregistre un poème (nouveau ou existant) comme brouillon ou le publie, selon le bouton pressé. */
export async function savePoemAction(_previous: PoemFormState, formData: FormData): Promise<PoemFormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const id = Number(raw.id);
  const user = await requireUser(Number.isInteger(id) && id > 0 ? `/ecrire/${id}` : "/ecrire");
  const values = { title: raw.title ?? "", body: raw.body ?? "", theme: raw.theme ?? "", language: raw.language ?? "fr" };

  const db = await getDb();
  const publish = raw.intent === "publish";
  if (publish) {
    const limit = await hitRateLimit(db, `publish:${user.id}`, { max: PUBLISH_PER_DAY, windowSeconds: 86_400 });
    if (!limit.allowed) return { message: `Vous avez atteint la limite de ${PUBLISH_PER_DAY} publications par jour. Réessayez demain.`, values };
  }

  const input = {
    title: raw.title ?? "",
    body: raw.body ?? "",
    theme: raw.theme ?? "",
    language: raw.language === "en" ? ("en" as const) : ("fr" as const),
    publish,
    generated: raw.generated === "1",
  };

  let slug: string;
  try {
    const poem = Number.isInteger(id) && id > 0 ? await updateMemberPoem(db, user, id, input) : await createMemberPoem(db, user, input);
    slug = poem.slug;
  } catch (error) {
    if (error instanceof PoemValidationError) return { errors: { [error.field]: error.message }, values };
    if (error instanceof PoemAccessError) return { message: error.message, values };
    throw error;
  }

  redirect(publish ? `/poemes/${slug}?publie=1` : "/compte?brouillon=1");
}

export async function deletePoemAction(formData: FormData): Promise<void> {
  const user = await requireUser("/compte");
  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) {
    try {
      await deleteMemberPoem(await getDb(), user, id);
    } catch (error) {
      if (!(error instanceof PoemAccessError)) throw error;
    }
  }
  redirect("/compte?supprime=1");
}

export async function toggleFavoriteAction(formData: FormData): Promise<void> {
  const retour = safeReturnPath(formData.get("retour"), "/bibliotheque");
  const user = await requireUser(retour);
  const poemId = Number(formData.get("poemId"));
  if (Number.isInteger(poemId) && poemId > 0) await setFavorite(await getDb(), user, poemId, formData.get("on") === "1");
  redirect(retour);
}

export interface ReportState {
  message?: string;
  done?: boolean;
}

export async function reportPoemAction(_previous: ReportState, formData: FormData): Promise<ReportState> {
  const poemId = Number(formData.get("poemId"));
  const user = await requireUser(safeReturnPath(formData.get("retour"), "/bibliotheque"));
  const reason = formData.get("reason");
  if (!Number.isInteger(poemId) || poemId < 1 || !isReportReason(reason)) return { message: "Choisissez une raison." };

  const db = await getDb();
  const limit = await hitRateLimit(db, `report:${user.id}`, { max: 30, windowSeconds: 3600 });
  if (!limit.allowed) return { message: "Trop de signalements en peu de temps. Réessayez plus tard." };

  const result = await reportPoem(db, { poemId, reporterId: user.id, reason, note: String(formData.get("note") ?? "") });
  if (!result.recorded) return { done: true, message: "Vous avez déjà signalé ce poème, merci : il sera relu." };
  return { done: true, message: "Merci, votre signalement sera relu par la modération." };
}

const generatedSchema = z.object({
  content: z.string().trim().min(20).max(4000),
  theme: z.enum(GENERATOR_THEME_IDS),
  language: z.enum(["fr", "en"]),
});

/** Transforme un poème généré en brouillon du membre, qu'il retravaille ensuite dans l'éditeur. */
export async function startFromGeneratedAction(formData: FormData): Promise<void> {
  const user = await requireUser("/generateur");
  const parsed = generatedSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/generateur");

  const theme = parsed.data.theme as GeneratorThemeId;
  const limit = await hitRateLimit(await getDb(), `draft:${user.id}`, { max: 30, windowSeconds: 86_400 });
  if (!limit.allowed) redirect("/generateur?limite=1");

  const draft = await createMemberPoem(await getDb(), user, {
    title: "Sans titre",
    body: parsed.data.content,
    theme: GENERATOR_TO_LIBRARY_THEME[theme],
    language: parsed.data.language,
    publish: false,
    generated: true,
  });
  redirect(`/ecrire/${draft.id}`);
}
