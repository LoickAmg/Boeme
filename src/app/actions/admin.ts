"use server";

import { redirect } from "next/navigation";

import { safeReturnPath } from "@/lib/redirect";

import { getDb } from "@/db/client";
import { requireAdmin } from "@/server/guard";
import { featurePoem, moderate, unfeaturePoem } from "@/server/poems";
import type { ModerationAction } from "@/server/poems";

const ACTIONS: ModerationAction[] = ["hide", "restore", "dismiss", "delete"];

export async function moderateAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const reportId = Number(formData.get("reportId"));
  const action = String(formData.get("action") ?? "") as ModerationAction;
  if (Number.isInteger(reportId) && reportId > 0 && ACTIONS.includes(action)) {
    await moderate(await getDb(), reportId, action);
  }
  redirect("/admin/moderation");
}

/** « Mettre à l'honneur » un poème de membre (premier jour libre), ou annuler. */
export async function featureAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const poemId = Number(formData.get("poemId"));
  const back = safeReturnPath(String(formData.get("retour") ?? ""), "/admin/moderation");
  if (Number.isInteger(poemId) && poemId > 0) {
    const db = await getDb();
    if (formData.get("annuler")) await unfeaturePoem(db, poemId);
    else await featurePoem(db, admin, poemId).catch(() => undefined);
  }
  redirect(back);
}
