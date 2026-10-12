import Link from "next/link";
import type { ReactNode } from "react";

import { ProvenanceBadge } from "@/components/Provenance";
import { excerpt } from "@/lib/text";
import type { PoemView } from "@/server/poems";

/**
 * Page d'essai d'un « grain de folie » (poème vivant, carte-poème) : on choisit un poème — ceux du
 * jour, une recherche ou un tirage au hasard — et on lance l'expérience sans quitter la page.
 */
export function TryPoems({
  path,
  q,
  today,
  poems,
  action,
}: {
  path: string;
  q: string;
  today: PoemView[];
  poems: PoemView[];
  action: (poem: PoemView) => ReactNode;
}) {
  const card = (poem: PoemView) => (
    <li key={poem.id} className="flex flex-col rounded-2xl border border-linen-deep/60 bg-ivory-soft/60 px-5 py-5">
      <ProvenanceBadge origin={poem.origin} sourceUrl={poem.sourceUrl} className="self-start" />
      <p className="mt-3 font-serif text-2xl leading-snug text-ink">{poem.title}</p>
      <p className="text-sm text-ink-soft">{poem.authorName}</p>
      <p className="mt-3 whitespace-pre-line font-serif text-lg leading-relaxed text-ink-soft">{excerpt(poem.body, 3)}</p>
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-5 text-sm">
        {action(poem)}
        <Link href={`/poemes/${poem.slug}`} className="text-ink-soft underline underline-offset-4 hover:text-ink">
          Lire le poème
        </Link>
      </div>
    </li>
  );

  return (
    <div className="flex flex-col gap-10">
      {today.length > 0 && !q && (
        <section aria-labelledby="du-jour">
          <h2 id="du-jour" className="font-serif text-3xl text-ink">
            Avec les poèmes du jour
          </h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">{today.map(card)}</ul>
        </section>
      )}

      <section aria-labelledby="choisir">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="choisir" className="font-serif text-3xl text-ink">
            {q ? `Résultats pour « ${q} »` : "Ou avec un autre poème"}
          </h2>
          <form method="get" action={path} role="search" className="flex w-full gap-2 sm:w-auto">
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Un titre, un poète, un vers…"
              aria-label="Chercher un poème"
              className="min-w-0 flex-1 rounded-full border border-linen-deep bg-ivory px-4 py-2.5 text-base placeholder:text-ink-faint sm:w-72"
            />
            <button type="submit" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ivory hover:bg-rose-deep">
              Chercher
            </button>
          </form>
        </div>
        {poems.length === 0 ? (
          <p className="mt-5 text-ink-soft">Aucun poème ne correspond. Essayez un autre mot.</p>
        ) : (
          <ul className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{poems.map(card)}</ul>
        )}
        <p className="mt-5 text-sm">
          <Link href={path} className="font-semibold text-rose-deep underline underline-offset-4">
            {q ? "← Revenir au tirage au hasard" : "↻ Tirer d'autres poèmes au hasard"}
          </Link>
        </p>
      </section>

      <p className="rounded-2xl border border-linen-deep/60 bg-linen/40 px-5 py-4 text-sm text-ink-soft">
        Astuce : le bouton se trouve aussi en bas de chaque poème, dans la bibliothèque comme dans la communauté — y compris les vôtres.
      </p>
    </div>
  );
}
