import type { Metadata } from "next";
import Link from "next/link";

import { getDb } from "@/db/client";
import { lifespan } from "@/lib/text";
import { listAuthors } from "@/server/poems";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Poètes",
  description: "Les poètes de la bibliothèque, de Charles d'Orléans à Apollinaire.",
};

export default async function AuthorsPage() {
  const authors = (await listAuthors(await getDb())).filter((author) => author.poemCount > 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-5xl italic text-ink">Poètes</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">Rangés par date de naissance, du Moyen Âge au début du XXe siècle.</p>
      <ul className="mt-10 grid gap-4 md:grid-cols-2">
        {authors.map((author) => (
          <li key={author.id}>
            <Link href={`/poetes/${author.slug}`} className="flex h-full flex-col rounded-2xl border border-linen-deep/60 bg-ivory-soft/40 px-6 py-5 transition-colors hover:border-rose">
              <span className="font-serif text-2xl text-ink">{author.name}</span>
              <span className="text-xs text-ink-soft">
                {lifespan(author.bornYear, author.diedYear)} · {author.poemCount} poème{author.poemCount > 1 ? "s" : ""}
              </span>
              <span className="mt-3 text-sm leading-relaxed text-ink-soft">{author.bio}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
