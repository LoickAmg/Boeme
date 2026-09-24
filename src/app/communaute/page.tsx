import type { Metadata } from "next";
import Link from "next/link";

import { Pagination } from "@/components/Pagination";
import { PoemCard } from "@/components/PoemCard";
import { getDb } from "@/db/client";
import { THEMES, isThemeId } from "@/lib/themes";
import { listPoems } from "@/server/poems";
import type { PoemSort } from "@/server/poems";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Communauté",
  description: "Les poèmes écrits et publiés par les membres de Boème.",
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CommunityPage({ searchParams }: PageProps<"/communaute">) {
  const query = await searchParams;
  const theme = first(query.theme);
  const sort: PoemSort = first(query.tri) === "populaire" ? "populaire" : "recent";
  const page = Math.max(Number.parseInt(first(query.page) ?? "1", 10) || 1, 1);

  const result = await listPoems(await getDb(), { origin: "member", theme: isThemeId(theme) ? theme : undefined, sort, page });
  const params = { theme: isThemeId(theme) ? theme : undefined, tri: sort === "recent" ? undefined : sort };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-5xl italic text-ink">Communauté</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Les poèmes écrits par les membres, publiés sous leur responsabilité. Un poème vous gêne ? Signalez-le depuis sa page.
      </p>
      <p className="mt-4">
        <Link href="/ecrire" className="inline-block rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-rose-soft">
          Publier mon poème
        </Link>
      </p>

      <form method="get" className="mt-8 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Thème
          <select name="theme" defaultValue={isThemeId(theme) ? theme : ""} className="rounded-xl border border-linen-deep bg-ivory-soft px-3 py-2.5 text-base font-normal">
            <option value="">Tous</option>
            {THEMES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Trier par
          <select name="tri" defaultValue={sort} className="rounded-xl border border-linen-deep bg-ivory-soft px-3 py-2.5 text-base font-normal">
            <option value="recent">Plus récents</option>
            <option value="populaire">Plus aimés</option>
          </select>
        </label>
        <button type="submit" className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep">
          Appliquer
        </button>
      </form>

      {result.items.length === 0 ? (
        <p className="mt-10 text-ink-soft">Aucun poème pour l&apos;instant. Le vôtre pourrait être le premier.</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {result.items.map((poem) => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      )}

      <Pagination basePath="/communaute" params={params} page={result.page} pageCount={result.pageCount} />
    </div>
  );
}
