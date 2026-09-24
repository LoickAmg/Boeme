import type { Metadata } from "next";

import { PoemForm } from "@/components/PoemForm";
import { requireUser } from "@/server/guard";

export const metadata: Metadata = { title: "Écrire un poème", robots: { index: false } };

export default async function WritePage() {
  await requireUser("/ecrire");

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-5xl italic text-ink">Écrire un poème</h1>
      <p className="mt-3 mb-10 max-w-2xl text-ink-soft">
        Enregistrez-le en brouillon tant qu&apos;il n&apos;est pas prêt : personne d&apos;autre que vous ne le voit. Publiez-le quand vous le souhaitez.
      </p>
      <PoemForm initial={{ title: "", body: "", theme: "", language: "fr", generated: false, published: false }} />
    </div>
  );
}
