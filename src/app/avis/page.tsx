import type { Metadata } from "next";

import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { isFeedbackKindId } from "@/lib/feedback";
import { getCurrentUser } from "@/server/context";

export const metadata: Metadata = {
  title: "Votre avis",
  description: "Une suggestion, un problème, une idée pour Boème ? Écrivez-nous ici : chaque retour est lu.",
  alternates: { canonical: "/avis" },
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FeedbackPage({ searchParams }: PageProps<"/avis">) {
  const [user, query] = await Promise.all([getCurrentUser(), searchParams]);
  const kind = first(query.type);
  const from = first(query.depuis);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-deep">Votre avis compte</p>
      <h1 className="mt-2 font-serif text-5xl italic text-ink">Un retour, une idée ?</h1>
      <p className="mt-4 text-ink-soft">
        Boème grandit avec ses lecteurs et ses plumes. Une suggestion, un problème rencontré, une envie, un coup de cœur : écrivez-le ici, il arrive directement à
        l&apos;équipe. Le bouton « Un avis ? », en bas à droite de chaque page, fait la même chose sans quitter votre lecture.
      </p>
      <div className="relative mt-10 rounded-[2rem] border border-linen-deep/70 bg-ivory-soft/60 px-6 py-8 sm:px-9">
        <span aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[1.6rem] border border-gold/30" />
        <FeedbackForm signedIn={Boolean(user)} defaultKind={isFeedbackKindId(kind) ? kind : "suggestion"} from={from?.startsWith("/") ? from : undefined} />
      </div>
    </div>
  );
}
