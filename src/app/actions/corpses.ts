"use server";

import { redirect } from "next/navigation";

import { getDb } from "@/db/client";
import { CorpseError, addCorpseLine, deleteCorpse, removeCorpseLine, startCorpse } from "@/server/corpses";
import { requireAdmin, requireUser } from "@/server/guard";
import { hitRateLimit } from "@/server/rate-limit";

export interface CorpseFormState {
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
}

const STARTS_PER_DAY = 5;
const LINES_PER_DAY = 60;

export async function startCorpseAction(_previous: CorpseFormState, formData: FormData): Promise<CorpseFormState> {
  const user = await requireUser("/cadavre-exquis");
  const values = {
    title: String(formData.get("title") ?? ""),
    theme: String(formData.get("theme") ?? ""),
    targetLines: String(formData.get("targetLines") ?? "12"),
    firstLine: String(formData.get("firstLine") ?? ""),
  };
  const db = await getDb();
  const limit = await hitRateLimit(db, `corpse-start:${user.id}`, { max: STARTS_PER_DAY, windowSeconds: 86_400 });
  if (!limit.allowed) return { message: `Vous avez lancé ${STARTS_PER_DAY} cadavres exquis aujourd'hui : laissez-les vivre, et revenez demain.`, values };

  let slug: string;
  try {
    const corpse = await startCorpse(db, user, { ...values, targetLines: Number(values.targetLines) });
    slug = corpse.slug;
  } catch (error) {
    if (error instanceof CorpseError) return error.field === "general" ? { message: error.message, values } : { errors: { [error.field === "line" ? "firstLine" : error.field]: error.message }, values };
    throw error;
  }
  redirect(`/cadavre-exquis/${slug}?lance=1`);
}

export async function addLineAction(_previous: CorpseFormState, formData: FormData): Promise<CorpseFormState> {
  const slug = String(formData.get("slug") ?? "");
  const user = await requireUser(`/cadavre-exquis/${slug}`);
  const corpseId = Number(formData.get("corpseId"));
  const line = String(formData.get("line") ?? "");
  const db = await getDb();
  const limit = await hitRateLimit(db, `corpse-line:${user.id}`, { max: LINES_PER_DAY, windowSeconds: 86_400 });
  if (!limit.allowed) return { message: "Beaucoup de vers aujourd'hui ! Revenez demain.", values: { line } };

  let complete = false;
  try {
    ({ complete } = await addCorpseLine(db, user, corpseId, line));
  } catch (error) {
    if (error instanceof CorpseError) return error.field === "line" ? { errors: { line: error.message }, values: { line } } : { message: error.message, values: { line } };
    throw error;
  }
  redirect(`/cadavre-exquis/${slug}?${complete ? "revele=1" : "ecrit=1"}`);
}

/** Modération : retirer un vers (son rang est conservé) ou supprimer tout le cadavre. */
export async function moderateCorpseAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const corpseId = Number(formData.get("corpseId"));
  const slug = String(formData.get("slug") ?? "");
  const db = await getDb();
  if (!Number.isInteger(corpseId) || corpseId <= 0) redirect("/cadavre-exquis");
  if (formData.get("action") === "delete") {
    await deleteCorpse(db, corpseId);
    redirect("/cadavre-exquis");
  }
  const position = Number(formData.get("position"));
  if (Number.isInteger(position) && position > 0) await removeCorpseLine(db, corpseId, position);
  redirect(`/cadavre-exquis/${encodeURIComponent(slug)}`);
}
