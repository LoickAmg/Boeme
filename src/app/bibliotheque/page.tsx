import type { Metadata } from "next";

import { Pagination } from "@/components/Pagination";
import { PoemCard } from "@/components/PoemCard";
import { getDb } from "@/db/client";
import { THEMES, isThemeId, themeLabel } from "@/lib/themes";
import { listAuthors, listPoems } from "@/server/poems";
import type { PoemSort } from "@/server/poems";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bibliothèque",
  description: "Poèmes du domaine public avec leurs sources : recherchez par titre, poète, thème ou vers.",
};

const SORTS: Array<{ id: PoemSort; label: string }> = [
  { id: "recent", label: "Plus récents" },
  { id: "populaire", label: "Plus aimés" },
  { id: "titre", label: "Titre (A → Z)" },
];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LibraryPage({ searchParams }: PageProps<"/bibliotheque">) {
  const query = await searchParams;
  const q = first(query.q)?.trim().slice(0, 100) ?? "";
  const theme = first(query.theme);
  const authorSlug = first(query.poete);
  const sort = SORTS.some((option) => option.id === first(query.tri)) ? (first(query.tri) as PoemSort) : "recent";
  const page = Math.max(Number.parseInt(first(query.page) ?? "1", 10) || 1, 1);

  const db = await getDb();
  const [result, authors] = await Promise.all([
    // La bibliothèque : poèmes du domaine public et références (les poèmes de membres ont leur propre page).
    listPoems(db, { q, theme: isThemeId(theme) ? theme : undefined, authorSlug, sort, page, excludeOrigin: "member" }),
    listAuthors(db),
  ]);

  const params = { q, theme: isThemeId(theme) ? theme : undefined, poete: authorSlug, tri: sort === "recent" ? undefined : sort };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-5xl italic text-ink">Bibliothèque</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Des poèmes du domaine public, avec leur recueil, leur année et un lien vers la source. Les poèmes encore protégés ne sont que signalés : le texte n&apos;est pas reproduit.
      </p>

      <form method="get" role="search" className="mt-8 grid gap-4 rounded-2xl border border-linen-deep/60 bg-ivory-soft/40 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm font-semibold lg:col-span-2">
          Recherche
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Titre, poète, un vers…"
            className="rounded-xl border border-linen-deep bg-ivory px-4 py-2.5 text-base font-normal placeholder:text-ink-faint"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Thème
          <select name="theme" defaultValue={isThemeId(theme) ? theme : ""} className="rounded-xl border border-linen-deep bg-ivory px-3 py-2.5 text-base font-normal">
            <option value="">Tous</option>
            {THEMES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Poète
          <select name="poete" defaultValue={authorSlug ?? ""} className="rounded-xl border border-linen-deep bg-ivory px-3 py-2.5 text-base font-normal">
            <option value="">Tous</option>
            {authors
              .filter((author) => author.poemCount > 0)
              .map((author) => (
                <option key={author.id} value={author.slug}>
                  {author.name}
                </option>
              ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Trier par
          <select name="tri" defaultValue={sort} className="rounded-xl border border-linen-deep bg-ivory px-3 py-2.5 text-base font-normal">
            {SORTS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end sm:col-span-2 lg:col-span-3">
          <button type="submit" className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep">
            Appliquer
          </button>
        </div>
      </form>

      <p className="mt-8 text-sm text-ink-soft" role="status">
        {result.total === 0 ? "Aucun poème ne correspond." : `${result.total} poème${result.total > 1 ? "s" : ""}`}
        {isThemeId(theme) ? ` · thème « ${themeLabel(theme)} »` : ""}
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {result.items.map((poem) => (
          <PoemCard key={poem.id} poem={poem} />
        ))}
      </div>

      <Pagination basePath="/bibliotheque" params={params} page={result.page} pageCount={result.pageCount} />
    </div>
  );
}
