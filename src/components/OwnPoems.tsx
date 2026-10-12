import Link from "next/link";

import { deletePoemAction } from "@/app/actions/poems";
import { PoemCover } from "@/components/PoemCover";
import { readsLabel } from "@/components/Provenance";
import { formatDate, shapeLabel } from "@/lib/text";
import type { PoemView } from "@/server/poems";

const STATUS = {
  published: { label: "Publié", className: "bg-[#4f7a54] text-ivory" },
  draft: { label: "Brouillon", className: "bg-linen-deep text-ink" },
  hidden: { label: "Masqué par la modération", className: "bg-rose-deep text-ivory" },
} as const;

function Actions({ poem }: { poem: PoemView }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      {poem.status !== "hidden" && (
        <Link href={`/ecrire/${poem.id}`} className="font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline">
          Modifier
        </Link>
      )}
      <form action={deletePoemAction}>
        <input type="hidden" name="id" value={poem.id} />
        <button type="submit" className="font-medium text-rose-deep underline-offset-4 hover:underline">
          Supprimer
        </button>
      </form>
    </div>
  );
}

function Details({ poem }: { poem: PoemView }) {
  const reads = poem.status === "published" ? (readsLabel(poem.viewCount, poem.readerCount) ?? "pas encore lu") : null;
  return (
    <p className="text-xs leading-relaxed text-ink-soft">
      {shapeLabel(poem.body)} · {formatDate(poem.publishedAt ?? poem.createdAt)}
      {poem.status === "published" ? ` · ♥ ${poem.favoriteCount} · ${reads}` : ""}
    </p>
  );
}

function Title({ poem }: { poem: PoemView }) {
  const href = poem.status === "published" ? `/poemes/${poem.slug}` : `/ecrire/${poem.id}`;
  return poem.status === "hidden" ? (
    <span>{poem.title}</span>
  ) : (
    <Link href={href} className="underline-offset-4 hover:underline">
      {poem.title}
    </Link>
  );
}

/** Mes poèmes, en grille (couvertures) ou en liste (compacte). */
export function OwnPoems({ poems, layout }: { poems: PoemView[]; layout: "grille" | "liste" }) {
  if (layout === "liste") {
    return (
      <ul className="flex flex-col gap-3">
        {poems.map((poem) => (
          <li key={poem.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-linen-deep/60 bg-ivory-soft/40 px-4 py-3">
            <PoemCover poem={poem} compact className="h-16 w-12 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 font-serif text-xl text-ink">
                <Title poem={poem} />
                <span className={`rounded-full px-2 py-0.5 font-sans text-[0.65rem] font-semibold uppercase tracking-wider ${STATUS[poem.status].className}`}>{STATUS[poem.status].label}</span>
              </p>
              <Details poem={poem} />
            </div>
            <Actions poem={poem} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {poems.map((poem) => (
        <li key={poem.id} className="flex flex-col overflow-hidden rounded-2xl border border-linen-deep/60 bg-ivory-soft/50 shadow-[0_1px_2px_rgba(58,51,45,0.06)]">
          <div className="relative">
            <PoemCover poem={poem} className="aspect-[4/3] w-full" />
            <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${STATUS[poem.status].className}`}>
              {STATUS[poem.status].label}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-2 px-5 py-4">
            <p className="font-serif text-2xl leading-snug text-ink">
              <Title poem={poem} />
            </p>
            <Details poem={poem} />
            <div className="mt-auto pt-2">
              <Actions poem={poem} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
