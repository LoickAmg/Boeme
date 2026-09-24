import { notFound, redirect } from "next/navigation";

import type { User } from "@/db/schema";

import { getCurrentUser } from "./context";

/** Exige un membre connecté ; sinon renvoie vers la connexion, puis de retour sur `returnTo`. */
export async function requireUser(returnTo: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/compte/connexion?retour=${encodeURIComponent(returnTo)}`);
  return user;
}

/**
 * Réserve une page ou une action à l'administrateur. À appeler au début de
 * chaque action serveur de modération : masquer un lien ne protège rien, car
 * une action peut être appelée directement.
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser("/admin/moderation");
  if (user.role !== "admin") notFound();
  return user;
}
