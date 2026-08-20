"use client";

import type { Poem } from "@/db/schema";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Language, StructureId, ThemeId } from "@/lib/poetry/types";

function formatDate(date: Date, dateLocale: string): string {
  return new Intl.DateTimeFormat(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

interface PoemCardProps {
  poem: Poem;
}

export function PoemCard({ poem }: PoemCardProps) {
  const { dict } = useLocale();
  const theme = dict.themes[poem.theme as ThemeId];
  const structure = dict.structures[poem.structure as StructureId];
  const language = dict.languages[poem.language as Language];
  const createdAt =
    poem.createdAt instanceof Date ? poem.createdAt : new Date(poem.createdAt);

  return (
    <article className="rounded-2xl border border-linen-deep/60 bg-ivory-soft/60 px-6 py-6 shadow-[0_1px_2px_rgba(58,51,45,0.06)] sm:px-8 sm:py-8">
      <p className="whitespace-pre-line font-serif text-xl leading-relaxed text-ink sm:text-2xl">
        {poem.content}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-linen-deep/50 pt-4 text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-rose" aria-hidden />
          {theme?.label ?? poem.theme}
        </span>
        <span aria-hidden>·</span>
        <span>{structure?.label ?? poem.structure}</span>
        <span aria-hidden>·</span>
        <span>{language ?? poem.language}</span>
        <span aria-hidden>·</span>
        <time dateTime={createdAt.toISOString()}>{formatDate(createdAt, dict.dateLocale)}</time>
      </div>
    </article>
  );
}
