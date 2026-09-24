import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

import type { Db } from "@/db/client";
import * as schema from "@/db/schema";
import { seedLibrary } from "@/db/seed";

/** Postgres réel en mémoire (WebAssembly), migré comme en production. */
export async function createTestDb(options: { seeded?: boolean } = {}): Promise<Db> {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  const typed = db as unknown as Db;
  if (options.seeded) await seedLibrary(typed);
  return typed;
}

/** Remet la base à zéro sans la recréer : bien plus rapide que de relancer PGlite avant chaque test. */
export async function resetDb(db: Db, options: { seeded?: boolean } = {}): Promise<void> {
  await db.execute(sql`
    truncate table reports, favorites, poems, authors, sessions, users, rate_limits
    restart identity cascade
  `);
  if (options.seeded) await seedLibrary(db);
}

export { schema };
