import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/AuthCard";
import { AuthForm } from "@/components/AuthForm";
import { safeReturnPath } from "@/lib/redirect";
import { getCurrentUser } from "@/server/context";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/compte/connexion">) {
  const query = await searchParams;
  const returnTo = safeReturnPath(Array.isArray(query.retour) ? query.retour[0] : query.retour);
  if (await getCurrentUser()) redirect(returnTo);

  return (
    <AuthCard title="Connexion" intro="Heureux de vous revoir.">
      <AuthForm mode="login" returnTo={returnTo} />
    </AuthCard>
  );
}
