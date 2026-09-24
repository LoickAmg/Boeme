import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/AuthForm";
import { safeReturnPath } from "@/lib/redirect";
import { getCurrentUser } from "@/server/context";

export const metadata: Metadata = { title: "Créer un compte", robots: { index: false } };

export default async function RegisterPage({ searchParams }: PageProps<"/compte/inscription">) {
  const query = await searchParams;
  const returnTo = safeReturnPath(Array.isArray(query.retour) ? query.retour[0] : query.retour);
  if (await getCurrentUser()) redirect(returnTo);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-5xl italic text-ink">Créer un compte</h1>
      <p className="mt-3 mb-8 max-w-xl text-ink-soft">
        Un compte permet d&apos;écrire, de publier, de garder des brouillons et de mettre des poèmes en favoris. Lire est possible sans compte.
      </p>
      <AuthForm mode="register" returnTo={returnTo} />
    </div>
  );
}
