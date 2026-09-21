import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

/**
 * Connexion en clair uniquement vers une base locale ; sinon TLS avec
 * vérification du certificat (une connexion chiffrée sans vérification
 * n'est pas protégée contre un intermédiaire).
 */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function sslOptionFor(connectionString: string): boolean {
  try {
    return !LOCAL_HOSTS.has(new URL(connectionString).hostname);
  } catch {
    return true;
  }
}

declare global {
  var __poemDbPool: Pool | undefined;
}

/**
 * Un seul Pool réutilisé entre les requêtes (et entre les rechargements à
 * chaud en dev) plutôt qu'une connexion par requête — recommandé pour
 * Next.js en environnement serverless comme en Node classique.
 */
function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL n'est pas définie. Configure-la (Postgres local en dev, " +
        "Vercel Postgres en production) — voir le README.",
    );
  }

  if (!global.__poemDbPool) {
    global.__poemDbPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      ssl: sslOptionFor(process.env.DATABASE_URL),
    });
  }

  return global.__poemDbPool;
}

let cachedDb: ReturnType<typeof drizzle<typeof schema>> | undefined;

/**
 * Initialisation paresseuse : `getPool()` (et donc la vérification de
 * DATABASE_URL) ne se déclenche qu'au premier vrai accès à `db`, jamais au
 * simple `import` de ce module — sinon une page statique qui importe ce
 * fichier sans jamais l'utiliser ferait planter `next build` en l'absence
 * de base de données configurée au moment du build.
 */
export function getDb() {
  if (!cachedDb) {
    cachedDb = drizzle(getPool(), { schema });
  }
  return cachedDb;
}
