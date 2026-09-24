"use server";

import { redirect } from "next/navigation";

import { getDb } from "@/db/client";
import { requireAdmin } from "@/server/guard";
import { moderate } from "@/server/poems";
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
