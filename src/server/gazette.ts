import { and, desc, eq, gte, sql } from "drizzle-orm";

import type { Db } from "@/db/client";
import { corpses, favorites, poemReads, poems, users } from "@/db/schema";

export interface GazettePoem {
  slug: string;
  title: string;
  authorName: string;
  userId: string | null;
  count: number;
}

export interface Gazette {
  /** Poèmes publiés par les membres ces sept derniers jours. */
  newPoems: number;
  newMembers: number;
  /** Le poème de membre le plus aimé de la semaine (cœurs reçus pendant la semaine). */
  mostLoved: GazettePoem | null;
  /** Le poème de membre qui a eu le plus de lecteurs pendant la semaine. */
  mostRead: GazettePoem | null;
  /** Cadavres exquis qui attendent leurs vers. */
  openCorpses: number;
  /** Un vers d'un poème de membre récent, qui « fait parler ». */
  whisper: { verse: string; slug: string; authorName: string } | null;
}

const WEEK_MS = 7 * 86_400_000;

/** La « Gazette de Boème » : les nouvelles de la semaine, tirées des vraies données du site. */
export async function weeklyGazette(db: Db, now = new Date()): Promise<Gazette> {
  const since = new Date(now.getTime() - WEEK_MS);
  const memberPublished = and(eq(poems.origin, "member"), eq(poems.status, "published"));

  const [[{ newPoems }], [{ newMembers }], loved, read, [{ openCorpses }], recent] = await Promise.all([
    db
      .select({ newPoems: sql<number>`count(*)::int` })
      .from(poems)
      .where(and(memberPublished, gte(poems.publishedAt, since))),
    db
      .select({ newMembers: sql<number>`count(*)::int` })
      .from(users)
      .where(gte(users.createdAt, since)),
    db
      .select({ slug: poems.slug, title: poems.title, authorName: poems.authorName, userId: poems.userId, count: sql<number>`count(*)::int` })
      .from(favorites)
      .innerJoin(poems, eq(poems.id, favorites.poemId))
      .where(and(memberPublished, gte(favorites.createdAt, since)))
      .groupBy(poems.id)
      .orderBy(desc(sql`count(*)`), desc(poems.publishedAt))
      .limit(1),
    db
      .select({ slug: poems.slug, title: poems.title, authorName: poems.authorName, userId: poems.userId, count: sql<number>`count(distinct ${poemReads.reader})::int` })
      .from(poemReads)
      .innerJoin(poems, eq(poems.id, poemReads.poemId))
      .where(and(memberPublished, gte(poemReads.day, since.toISOString().slice(0, 10))))
      .groupBy(poems.id)
      .orderBy(desc(sql`count(distinct ${poemReads.reader})`), desc(poems.publishedAt))
      .limit(1),
    db
      .select({ openCorpses: sql<number>`count(*)::int` })
      .from(corpses)
      .where(eq(corpses.status, "open")),
    db
      .select({ slug: poems.slug, body: poems.body, authorName: poems.authorName })
      .from(poems)
      .where(memberPublished)
      .orderBy(desc(poems.publishedAt))
      .limit(12),
  ]);

  // Le vers du jour : choisi parmi les poèmes récents, le même toute la journée.
  const day = Math.floor(now.getTime() / 86_400_000);
  const lines = recent.flatMap((poem) =>
    poem.body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length >= 12 && line.length <= 90)
      .map((verse) => ({ verse, slug: poem.slug, authorName: poem.authorName })),
  );
  const whisper = lines.length > 0 ? lines[day % lines.length] : null;

  return { newPoems, newMembers, mostLoved: loved[0] ?? null, mostRead: read[0] ?? null, openCorpses, whisper };
}
