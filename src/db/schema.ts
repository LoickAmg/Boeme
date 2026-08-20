import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Une seule table : les poèmes publiés dans la galerie publique. Pas de
 * compte utilisateur, pas de modération manuelle — le vocabulaire vient
 * soit du générateur maison (banques de mots choisies à la main), soit
 * d'une API LLM appelée avec un thème prédéfini (jamais de texte libre
 * envoyé au modèle), donc pas de surface d'abus par saisie libre.
 */
export const poems = pgTable("poems", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  language: varchar("language", { length: 2 }).notNull(), // "fr" | "en"
  theme: varchar("theme", { length: 40 }).notNull(),
  structure: varchar("structure", { length: 20 }).notNull(), // "haiku" | "vers_libre" | "forme_courte_rimee"
  source: varchar("source", { length: 10 }).notNull(), // "maison" | "llm"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Poem = typeof poems.$inferSelect;
export type NewPoem = typeof poems.$inferInsert;
