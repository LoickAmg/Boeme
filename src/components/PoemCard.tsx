import Link from "next/link";

import type { PoemView } from "@/server/poems";
import { excerpt } from "@/lib/text";
import { themeLabel } from "@/lib/themes";

const ORIGIN_LABEL = { classic: "Bibliothèque", reference: "À découvrir", member: "Communauté" } as const;

export function PoemCard({ poem }: { poem: PoemView }) {
  const theme = themeLabel(poem.theme);

  return (
    <article className="relative flex flex-col rounded-2xl border border-linen-deep/60 bg-ivory-soft/60 px-6 py-6 shadow-[0_1px_2px_rgba(58,51,45,0.06)] transition-shadow hover:shadow-[0_4px_14px_rgba(58,51,45,0.09)]">
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
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Poème encore protégé par le droit d&apos;auteur : le texte n&apos;est pas reproduit ici, seulement un lien vers sa source.
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-5 text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-rose" aria-hidden />
          {ORIGIN_LABEL[poem.origin]}
        </span>
        {theme && (
          <>
            <span aria-hidden>·</span>
            <span>{theme}</span>
          </>
        )}
        {poem.collection && (
          <>
            <span aria-hidden>·</span>
            <span className="italic">{poem.collection}</span>
          </>
        )}
        {poem.favoriteCount > 0 && (
          <>
            <span aria-hidden>·</span>
            <span>
              {poem.favoriteCount} favori{poem.favoriteCount > 1 ? "s" : ""}
            </span>
          </>
        )}
      </div>
    </article>
  );
}
