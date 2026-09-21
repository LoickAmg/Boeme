#!/usr/bin/env node
// Applique drizzle/0000_init.sql à la base pointée par DATABASE_URL.
// Idempotent (CREATE TABLE/INDEX IF NOT EXISTS) — relançable sans risque.
//
// Usage : DATABASE_URL=postgresql://... node scripts/migrate.mjs
// (ou, plus simple : renseigne DATABASE_URL dans .env, ce script le lit tout seul)

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

const here = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(here, "..", "drizzle", "0000_init.sql");
const envPath = path.join(here, "..", ".env");

/**
 * Contrairement à Next.js (qui charge .env automatiquement), un script
 * Node "brut" comme celui-ci ne le fait pas nativement sur toutes les
 * versions de Node — on le lit donc nous-mêmes, sans dépendance
 * supplémentaire. Les vraies variables d'environnement déjà présentes
 * (ex. en CI, ou en prod) restent prioritaires sur le fichier.
 */
function loadDotEnvIfPresent() {
  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();
    // Retire des guillemets englobants éventuels ("valeur" ou 'valeur').
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadDotEnvIfPresent();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL n'est pas définie (ni en variable d'environnement, ni dans .env).");
    process.exit(1);
  }

  const sql = readFileSync(sqlPath, "utf8");
  const client = new Client({
    connectionString,
    ssl: !["localhost", "127.0.0.1", "[::1]"].includes(new URL(connectionString).hostname),
  });

  await client.connect();
  try {
    await client.query(sql);
    console.log(`Migration appliquée depuis ${path.relative(process.cwd(), sqlPath)}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Échec de la migration :", error);
  process.exit(1);
});
