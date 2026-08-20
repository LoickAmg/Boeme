-- Migration initiale : table des poèmes de la galerie publique.
-- Écrite à la main (pas de drizzle-kit en dépendance — voir README pour
-- pourquoi) mais reflète exactement src/db/schema.ts. Idempotente :
-- relancer ce fichier sur une base déjà à jour ne fait rien.

CREATE TABLE IF NOT EXISTS "poems" (
  "id" SERIAL PRIMARY KEY,
  "content" TEXT NOT NULL,
  "language" VARCHAR(2) NOT NULL,
  "theme" VARCHAR(40) NOT NULL,
  "structure" VARCHAR(20) NOT NULL,
  "source" VARCHAR(10) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "poems_created_at_idx" ON "poems" ("created_at" DESC);
