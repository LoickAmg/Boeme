import { readFileSync } from "node:fs";
import path from "node:path";

import { inArray, sql } from "drizzle-orm";

import { buildSearchText, slugify } from "@/lib/slug";

import type { Db } from "./client";
import { authors, poems } from "./schema";

interface LibraryFile {
  authors: Array<{ slug: string; name: string; born: number; died: number; bio: string; wiki: string }>;
  classics: Array<{
    author: string;
    title: string;
    body: string;
    collection: string;
    year: number;
    theme: string;
    url: string;
  }>;
  references: Array<{ author: string; title: string; collection: string; year: number; theme: string; url: string }>;
}

/** Apostrophe typographique dans les titres saisis à la main (les textes de Wikisource l'ont déjà). */
function typographic(title: string): string {
  return title.replace(/'/g, "’");
}

function readLibrary(): LibraryFile {
  const file = path.join(process.cwd(), "data", "classics.json");
  return JSON.parse(readFileSync(file, "utf8")) as LibraryFile;
}

/**
 * Charge la bibliothèque (poètes, poèmes du domaine public, références) depuis
 * `data/classics.json`. Idempotent : une entrée déjà présente (même identifiant
 * d'URL) est laissée telle quelle, donc rejouable à chaque déploiement.
 */
export async function seedLibrary(db: Db, library: LibraryFile = readLibrary()): Promise<{ authors: number; poems: number }> {
  await db
    .insert(authors)
    .values(
      library.authors.map((author) => ({
        slug: author.slug,
        name: author.name,
        bornYear: author.born,
        diedYear: author.died,
        bio: author.bio,
        sourceUrl: `https://fr.wikipedia.org/wiki/${author.wiki}`,
      })),
    )
    .onConflictDoNothing();

  const stored = await db
    .select({ id: authors.id, slug: authors.slug, name: authors.name })
    .from(authors)
    .where(inArray(authors.slug, library.authors.map((author) => author.slug)));
  const byAuthorSlug = new Map(stored.map((row) => [row.slug, row]));

  const rows: Array<typeof poems.$inferInsert> = [];

  for (const poem of library.classics) {
    const author = byAuthorSlug.get(poem.author);
    if (!author) continue;
    rows.push({
      slug: `${slugify(poem.title)}-${author.slug}`,
      title: typographic(poem.title),
      body: poem.body,
      origin: "classic",
      status: "published",
      authorName: author.name,
      authorId: author.id,
      collection: poem.collection,
      year: poem.year,
      language: "fr",
      theme: poem.theme,
      sourceUrl: poem.url,
      searchText: buildSearchText(poem.title, author.name, poem.collection, poem.body),
      publishedAt: new Date(),
    });
  }

  for (const reference of library.references) {
    rows.push({
      slug: `${slugify(reference.title)}-${slugify(reference.author)}`,
      title: typographic(reference.title),
      body: "",
      origin: "reference",
      status: "published",
      authorName: reference.author,
      collection: reference.collection,
      year: reference.year,
      language: "fr",
      theme: reference.theme,
      sourceUrl: reference.url,
      searchText: buildSearchText(reference.title, reference.author, reference.collection),
      publishedAt: new Date(),
    });
  }

  // Par paquets : un seul INSERT géant dépasserait la limite de paramètres de Postgres.
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 20) {
    const result = await db
      .insert(poems)
      .values(rows.slice(i, i + 20))
      .onConflictDoNothing()
      .returning({ id: poems.id });
    inserted += result.length;
  }

  return { authors: stored.length, poems: inserted };
}

/** Nombre de poèmes de la bibliothèque déjà en base (utile pour les scripts). */
export async function countPoems(db: Db): Promise<number> {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(poems);
  return row.n;
}
