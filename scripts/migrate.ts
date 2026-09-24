import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

import type { Db } from "../src/db/client";
import { seedLibrary } from "../src/db/seed";
import * as schema from "../src/db/schema";

/**
 * Applique les migrations SQL (dossier drizzle/) à la base pointée par
 * DATABASE_URL, puis charge la bibliothèque de poèmes si elle est absente
 * (idempotent). Sans DATABASE_URL, il n'y a rien à faire : le développement
 * local utilise une base embarquée qui se migre toute seule.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("DATABASE_URL absente : migrations ignorées (base locale embarquée).");
    return;
  }
  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations appliquées.");

    const result = await seedLibrary(db as unknown as Db);
    console.log(`Bibliothèque vérifiée : ${result.poems} poème(s) ajouté(s), ${result.authors} poètes.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Échec des migrations :", error);
  process.exit(1);
});
