"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getDb } from "@/db/client";
import { deleteAccount, updateBio } from "@/server/account";
import { SESSION_COOKIE } from "@/server/context";
import { requireUser } from "@/server/guard";

export interface ProfileState {
  message?: string;
  error?: string;
}

export async function saveBioAction(_previous: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await requireUser("/compte");
  await updateBio(await getDb(), user, String(formData.get("bio") ?? ""));
  return { message: "Présentation enregistrée." };
}

/** Effacement du compte : demande de taper « SUPPRIMER » pour éviter un clic malheureux. */
export async function deleteAccountAction(_previous: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await requireUser("/compte");
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "SUPPRIMER") {
    return { error: "Tapez SUPPRIMER pour confirmer." };
  }
  await deleteAccount(await getDb(), user);
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/?compte-supprime=1");
}
