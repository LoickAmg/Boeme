import Link from "next/link";

import { ProvenanceBadge, sourceName } from "@/components/Provenance";
import type { PoemView } from "@/server/poems";
import { excerpt } from "@/lib/text";
import { themeLabel } from "@/lib/themes";

export function PoemCard({ poem }: { poem: PoemView }) {
  const theme = themeLabel(poem.theme);
  const member = poem.origin === "member";

  return (
    <article
      className={`relative flex flex-col rounded-2xl border px-6 py-6 shadow-[0_1px_2px_rgba(58,51,45,0.06)] transition-shadow hover:shadow-[0_4px_14px_rgba(58,51,45,0.09)] ${
        // Un poème de membre : papier clair et filet rose ; un texte d'une source externe : vélin.
        member ? "border-rose/70 border-t-4 border-t-rose-deep bg-white/70" : "border-linen-deep/60 bg-ivory-soft/60"
      }`}
    >
      <ProvenanceBadge origin={poem.origin} sourceUrl={poem.sourceUrl} className="mb-3 self-start" />
      <h3 className="font-serif text-2xl leading-snug text-ink">
        <Link href={`/poemes/${poem.slug}`} className="after:absolute after:inset-0">
          {poem.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-ink-soft">
        {poem.authorSlug ? (
          <Link href={`/poetes/${poem.authorSlug}`} className="relative z-[1] underline-offset-4 hover:underline">
            {poem.authorName}
          </Link>
        ) : poem.userId ? (
          <Link href={`/membres/${poem.userId}`} className="relative z-[1] underline-offset-4 hover:underline">
            {poem.authorName}
          </Link>
        ) : (
          poem.authorName
        )}
        {poem.year ? <span className="text-ink-faint"> · {poem.year}</span> : null}
      </p>

      {poem.body ? (
        <p className="mt-4 whitespace-pre-line font-serif text-lg leading-relaxed text-ink">{excerpt(poem.body)}</p>
      ) : (
        <>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Poème encore protégé par le droit d&apos;auteur : Boème ne reproduit pas son texte. Il se lit sur le site de sa source.
          </p>
          {poem.sourceUrl && (
            <a
              href={poem.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-[1] mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep"
            >
              Lire la source ({sourceName(poem.sourceUrl)}) ↗
            </a>
          )}
        </>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-5 text-xs text-ink-soft">
        {theme && <span>{theme}</span>}
        {[
          poem.collection && <span className="italic">{poem.collection}</span>,
          member && poem.readerCount > 0 && (
            <span>
              {poem.readerCount} lecteur{poem.readerCount > 1 ? "s" : ""}
            </span>
          ),
          poem.favoriteCount > 0 && (
            <span title={`${poem.favoriteCount} personne${poem.favoriteCount > 1 ? "s aiment" : " aime"} ce poème`} className="text-rose-deep">
              ♥ {poem.favoriteCount}
            </span>
          ),
        ]
          .filter(Boolean)
          .map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3">
              {(i > 0 || theme) && <span aria-hidden>·</span>}
              {item}
            </span>
          ))}
      </div>
    </article>
  );
}
