import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/AuthForm";
import { safeReturnPath } from "@/lib/redirect";
import { getCurrentUser } from "@/server/context";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/compte/connexion">) {
  const query = await searchParams;
  const returnTo = safeReturnPath(Array.isArray(query.retour) ? query.retour[0] : query.retour);
  if (await getCurrentUser()) redirect(returnTo);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <h1 className="mb-8 font-serif text-5xl italic text-ink">Connexion</h1>
      <AuthForm mode="login" returnTo={returnTo} />
    </div>
  );
}
