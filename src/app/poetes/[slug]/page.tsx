import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Pagination } from "@/components/Pagination";
import { PoemCard } from "@/components/PoemCard";
import { getDb } from "@/db/client";
import { lifespan } from "@/lib/text";
import { getAuthorBySlug, listPoems } from "@/server/poems";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/poetes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(await getDb(), slug);
  if (!author) return { title: "Poète introuvable", robots: { index: false } };
  return { title: author.name, description: author.bio, alternates: { canonical: `/poetes/${author.slug}` } };
}

export default async function AuthorPage({ params, searchParams }: PageProps<"/poetes/[slug]">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const db = await getDb();
  const author = await getAuthorBySlug(db, slug);
  if (!author) notFound();

  const page = Math.max(Number.parseInt(String(Array.isArray(query.page) ? query.page[0] : query.page ?? "1"), 10) || 1, 1);
  const result = await listPoems(db, { authorSlug: slug, sort: "titre", page, pageSize: 12 });

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{lifespan(author.bornYear, author.diedYear)}</p>
      <h1 className="mt-2 font-serif text-5xl italic text-ink">{author.name}</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">{author.bio}</p>
      {author.sourceUrl && (
        <p className="mt-3 text-sm">
          <a href={author.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-ink-soft underline underline-offset-4">
            En savoir plus sur Wikipédia ↗
          </a>
        </p>
      )}

      <h2 className="mt-12 font-serif text-3xl text-ink">
        {result.total} poème{result.total > 1 ? "s" : ""}
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {result.items.map((poem) => (
          <PoemCard key={poem.id} poem={poem} />
        ))}
      </div>
      <Pagination basePath={`/poetes/${slug}`} params={{}} page={result.page} pageCount={result.pageCount} />
    </div>
  );
}
