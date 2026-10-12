import type { Metadata } from "next";
import Link from "next/link";

import { OwnPoems } from "@/components/OwnPoems";
import { getDb } from "@/db/client";
import { requireUser } from "@/server/guard";
import { listOwnPoems } from "@/server/poems";

export const metadata: Metadata = { title: "Tous mes poèmes", robots: { index: false } };
export const dynamic = "force-dynamic";

const FILTERS = [
  { id: "tous", label: "Tous" },
  { id: "publies", label: "Publiés" },
  { id: "brouillons", label: "Brouillons" },
] as const;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AllMyPoemsPage({ searchParams }: PageProps<"/compte/poemes">) {
  const [user, query] = await Promise.all([requireUser("/compte/poemes"), searchParams]);
  const layout = first(query.vue) === "liste" ? "liste" : "grille";
  const filter = FILTERS.find((f) => f.id === first(query.filtre))?.id ?? "tous";
  const q = (first(query.q) ?? "").trim().slice(0, 100).toLowerCase();

  const all = await listOwnPoems(await getDb(), user);
  const poems = all
    .filter((poem) => (filter === "publies" ? poem.status === "published" : filter === "brouillons" ? poem.status === "draft" : true))
    .filter((poem) => !q || `${poem.title}\n${poem.body}`.toLowerCase().includes(q));
  const href = (changes: Record<string, string>) => {
    const params = new URLSearchParams({ vue: layout, filtre: filter, ...(q ? { q } : {}), ...changes });
    if (params.get("vue") === "grille") params.delete("vue");
    if (params.get("filtre") === "tous") params.delete("filtre");
    const text = params.toString();
    return `/compte/poemes${text ? `?${text}` : ""}`;
  };
  const pill = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-ink text-ivory" : "border border-linen-deep bg-ivory-soft text-ink-soft hover:border-rose hover:text-ink"}`;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <Link href="/compte" className="text-sm font-medium text-ink-soft hover:text-ink">
        ← Mon espace
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl italic text-ink">Tous mes poèmes</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {all.length} poème{all.length > 1 ? "s" : ""} · {all.filter((p) => p.status === "published").length} publié
            {all.filter((p) => p.status === "published").length > 1 ? "s" : ""} · {all.filter((p) => p.status === "draft").length} brouillon
            {all.filter((p) => p.status === "draft").length > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/ecrire" className="rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-rose-soft">
          Écrire un poème
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Filtrer" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link key={f.id} href={href({ filtre: f.id })} aria-current={filter === f.id ? "true" : undefined} className={pill(filter === f.id)}>
              {f.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <form method="get" role="search" className="flex gap-2">
            {layout === "liste" && <input type="hidden" name="vue" value="liste" />}
            {filter !== "tous" && <input type="hidden" name="filtre" value={filter} />}
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Chercher dans mes poèmes"
              aria-label="Chercher dans mes poèmes"
              className="w-52 rounded-full border border-linen-deep bg-ivory px-4 py-2 text-sm placeholder:text-ink-faint"
            />
          </form>
          <div role="group" aria-label="Affichage" className="flex rounded-full border border-linen-deep bg-ivory-soft p-1">
            <Link href={href({ vue: "grille" })} aria-current={layout === "grille" ? "true" : undefined} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${layout === "grille" ? "bg-ink text-ivory" : "text-ink-soft"}`}>
              ▦ Grille
            </Link>
            <Link href={href({ vue: "liste" })} aria-current={layout === "liste" ? "true" : undefined} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${layout === "liste" ? "bg-ink text-ivory" : "text-ink-soft"}`}>
              ☰ Liste
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {poems.length === 0 ? <p className="text-ink-soft">Aucun poème ne correspond.</p> : <OwnPoems poems={poems} layout={layout} />}
      </div>
    </div>
  );
}
