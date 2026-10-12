import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/AuthCard";
import { AuthForm } from "@/components/AuthForm";
import { safeReturnPath } from "@/lib/redirect";
import { getCurrentUser } from "@/server/context";

export const metadata: Metadata = { title: "Créer un compte", robots: { index: false } };

export default async function RegisterPage({ searchParams }: PageProps<"/compte/inscription">) {
  const query = await searchParams;
  const returnTo = safeReturnPath(Array.isArray(query.retour) ? query.retour[0] : query.retour);
  if (await getCurrentUser()) redirect(returnTo);

  return (
    <AuthCard title="Créer un compte" intro="Pour écrire, publier, garder des brouillons et aimer des poèmes. Lire reste possible sans compte.">
      <AuthForm mode="register" returnTo={returnTo} />
    </AuthCard>
  );
}
