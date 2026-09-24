import type { Metadata } from "next";

import { GeneratorForm } from "@/components/GeneratorForm";
import { getCurrentUser } from "@/server/context";

export const metadata: Metadata = {
  title: "Générateur de poèmes",
  description: "Une page blanche ? Choisissez une ambiance, une structure et une longueur : le générateur propose un premier jet à retravailler.",
};

export default async function GeneratorPage({ searchParams }: PageProps<"/generateur">) {
  const [user, query] = await Promise.all([getCurrentUser(), searchParams]);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-5xl italic text-ink">Générateur</h1>
      <p className="mt-3 mb-10 max-w-2xl leading-relaxed text-ink-soft">
        Une page blanche ? Choisissez une langue, une ambiance, une structure et une longueur : le générateur propose un premier jet. Ce n&apos;est qu&apos;un point de départ, à retravailler avant de publier.
      </p>
      {query.limite && (
        <p role="alert" className="mb-6 rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
          Vous avez atteint la limite de brouillons pour aujourd&apos;hui.
        </p>
      )}
      <GeneratorForm signedIn={Boolean(user)} />
    </div>
  );
}
