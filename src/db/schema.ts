import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const USER_ROLES = ["member", "admin"] as const;

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    /** Nom d'auteur affiché publiquement (jamais l'adresse e-mail). */
    name: text("name").notNull(),
    bio: text("bio").notNull().default(""),
    role: text("role", { enum: USER_ROLES }).notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

/** L'identifiant stocké est l'empreinte SHA-256 du jeton du cookie : une fuite de la base ne donne aucune session. */
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

/**
 * Jeton de réinitialisation du mot de passe : seule son empreinte SHA-256 est stockée, il expire
 * vite et ne sert qu'une fois.
 */
export const passwordResets = pgTable(
  "password_resets",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("password_resets_user_idx").on(table.userId)],
);

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});

/** Poètes de la bibliothèque (œuvres du domaine public). */
export const authors = pgTable(
  "authors",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    bornYear: integer("born_year"),
    diedYear: integer("died_year"),
    bio: text("bio").notNull().default(""),
    sourceUrl: text("source_url"),
  },
  (table) => [uniqueIndex("authors_slug_unique").on(table.slug)],
);

/**
 * Trois provenances :
 *  - `classic`   : poème du domaine public, texte intégral, avec sa source ;
 *  - `reference` : poème encore protégé, sans texte : titre, auteur et lien vers la source ;
 *  - `member`    : poème écrit par un membre, publié sous sa responsabilité.
 * `generated` vaut 1 quand le point de départ vient du générateur (le membre a pu le retravailler).
 */
export const POEM_ORIGINS = ["classic", "reference", "member"] as const;
export const POEM_STATUSES = ["draft", "published", "hidden"] as const;

export const poems = pgTable(
  "poems",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    origin: text("origin", { enum: POEM_ORIGINS }).notNull(),
    status: text("status", { enum: POEM_STATUSES }).notNull().default("published"),
    /** Nom affiché : poète de la bibliothèque, ou nom d'auteur du membre au moment de la publication. */
    authorName: text("author_name").notNull(),
    authorId: integer("author_id").references(() => authors.id, { onDelete: "set null" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    collection: text("collection").notNull().default(""),
    year: integer("year"),
    language: varchar("language", { length: 2 }).notNull().default("fr"),
    theme: text("theme").notNull().default(""),
    sourceUrl: text("source_url"),
    generated: integer("generated").notNull().default(0),
    /** Lectures (un lecteur compte une fois par jour) et lecteurs distincts : tenus à jour par `recordRead`. */
    viewCount: integer("view_count").notNull().default(0),
    readerCount: integer("reader_count").notNull().default(0),
    /** Titre, auteur, thème et corps sans accents ni majuscules : la recherche s'y fait par simple sous-chaîne. */
    searchText: text("search_text").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("poems_slug_unique").on(table.slug),
    index("poems_status_published_idx").on(table.status, table.publishedAt),
    index("poems_author_idx").on(table.authorId),
    index("poems_user_idx").on(table.userId),
  ],
);

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    poemId: integer("poem_id")
      .notNull()
      .references(() => poems.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.poemId] })],
);

export const REPORT_REASONS = ["plagiat", "illegal", "haineux", "spam", "autre"] as const;
export const REPORT_STATUSES = ["open", "resolved", "dismissed"] as const;

export const reports = pgTable(
  "reports",
  {
    id: serial("id").primaryKey(),
    poemId: integer("poem_id")
      .notNull()
      .references(() => poems.id, { onDelete: "cascade" }),
    reporterId: uuid("reporter_id").references(() => users.id, { onDelete: "set null" }),
    reason: text("reason", { enum: REPORT_REASONS }).notNull(),
    note: text("note").notNull().default(""),
    status: text("status", { enum: REPORT_STATUSES }).notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("reports_status_idx").on(table.status, table.createdAt)],
);

/**
 * Poème de membre mis à l'honneur par un administrateur pour un jour donné (AAAA-MM-JJ, UTC) :
 * il prend la place du poème de la communauté tiré au sort ce jour-là. Un poème n'est mis à
 * l'honneur qu'une fois.
 */
export const dailyFeatures = pgTable(
  "daily_features",
  {
    day: varchar("day", { length: 10 }).primaryKey(),
    poemId: integer("poem_id")
      .notNull()
      .references(() => poems.id, { onDelete: "cascade" }),
    chosenBy: uuid("chosen_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("daily_features_poem_unique").on(table.poemId)],
);

/**
 * Cadavre exquis : poème collectif écrit vers par vers. Tant qu'il est ouvert, chacun ne voit
 * que le dernier vers ; une fois le nombre de vers atteint, il se révèle en entier.
 */
export const CORPSE_STATUSES = ["open", "complete"] as const;

export const corpses = pgTable(
  "corpses",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    theme: text("theme").notNull().default(""),
    targetLines: integer("target_lines").notNull().default(12),
    status: text("status", { enum: CORPSE_STATUSES }).notNull().default("open"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("corpses_slug_unique").on(table.slug), index("corpses_status_idx").on(table.status, table.createdAt)],
);

export const corpseLines = pgTable(
  "corpse_lines",
  {
    id: serial("id").primaryKey(),
    corpseId: integer("corpse_id")
      .notNull()
      .references(() => corpses.id, { onDelete: "cascade" }),
    /** Rang du vers (1, 2, 3…) : unique par cadavre, ce qui empêche deux vers simultanés au même rang. */
    position: integer("position").notNull(),
    line: text("line").notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    authorName: text("author_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("corpse_lines_position_unique").on(table.corpseId, table.position)],
);

/**
 * Lecture d'un poème de membre : un lecteur (empreinte salée, jamais l'adresse IP ni l'identifiant
 * en clair) au plus une fois par jour et par poème.
 */
export const poemReads = pgTable(
  "poem_reads",
  {
    poemId: integer("poem_id")
      .notNull()
      .references(() => poems.id, { onDelete: "cascade" }),
    reader: text("reader").notNull(),
    day: varchar("day", { length: 10 }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.poemId, table.reader, table.day] })],
);

export const poemsRelations = relations(poems, ({ one }) => ({
  author: one(authors, { fields: [poems.authorId], references: [authors.id] }),
  user: one(users, { fields: [poems.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type Author = typeof authors.$inferSelect;
export type Poem = typeof poems.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Corpse = typeof corpses.$inferSelect;
export type CorpseLine = typeof corpseLines.$inferSelect;
