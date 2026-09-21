import { count, desc, gte } from "drizzle-orm";

import { getDb } from "./index";
import { poems, type Poem } from "./schema";

export interface PoemPage {
  poems: Poem[];
  hasMore: boolean;
}

/**
 * Liste paginée des poèmes, du plus récent au plus ancien. Partagée entre
 * la route API (galerie chargée côté client) et les pages serveur (rendu
 * initial), pour n'écrire la requête qu'une seule fois.
 */
export async function getRecentPoems(limit: number, offset = 0): Promise<PoemPage> {
  const db = getDb();
  // Un poème de plus que demandé pour savoir s'il en reste, sans COUNT(*) séparé.
  const rows = await db
    .select()
    .from(poems)
    .orderBy(desc(poems.createdAt))
    .limit(limit + 1)
    .offset(offset);

  const hasMore = rows.length > limit;
  return { poems: rows.slice(0, limit), hasMore };
}

/** Nombre de poèmes publiés depuis `since` (plafond global de génération). */
export async function countPoemsSince(since: Date): Promise<number> {
  const db = getDb();
  const [row] = await db.select({ total: count() }).from(poems).where(gte(poems.createdAt, since));
  return row?.total ?? 0;
}
