import { randomBytes } from "node:crypto";

import { and, asc, desc, eq, ilike, inArray, ne, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

import type { Db } from "@/db/client";
import { authors, favorites, poems, reports, users } from "@/db/schema";
import type { Poem, User } from "@/db/schema";
import { buildSearchText, normalizeForSearch, slugify } from "@/lib/slug";
import { isReportReason } from "@/lib/report";
import type { ReportReason } from "@/lib/report";
import { isThemeId } from "@/lib/themes";

export { isReportReason };
export type { ReportReason };

export const TITLE_MAX = 120;
export const BODY_MIN = 20;
export const BODY_MAX = 6000;
export const BODY_MAX_LINES = 200;
export const PAGE_SIZE = 12;
/** Signalements distincts qui masquent automatiquement un poème de membre, en attendant la relecture. */
export const AUTO_HIDE_REPORTS = 3;

export type PoemOrigin = Poem["origin"];

/** Poème tel que les pages l'affichent : l'auteur de la bibliothèque et le nombre de favoris en plus. */
export interface PoemView {
  id: number;
  slug: string;
  title: string;
  body: string;
  origin: PoemOrigin;
  status: Poem["status"];
  authorName: string;
  authorSlug: string | null;
  userId: string | null;
  collection: string;
  year: number | null;
  language: string;
  theme: string;
  sourceUrl: string | null;
  generated: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  favoriteCount: number;
}

const favoriteCount = sql<number>`(select count(*)::int from favorites f where f.poem_id = poems.id)`;

const viewColumns = {
  id: poems.id,
  slug: poems.slug,
  title: poems.title,
  body: poems.body,
  origin: poems.origin,
  status: poems.status,
  authorName: poems.authorName,
  authorSlug: authors.slug,
  userId: poems.userId,
  collection: poems.collection,
  year: poems.year,
  language: poems.language,
  theme: poems.theme,
  sourceUrl: poems.sourceUrl,
  generated: sql<boolean>`${poems.generated} = 1`,
  publishedAt: poems.publishedAt,
  createdAt: poems.createdAt,
  favoriteCount,
};

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export type PoemSort = "recent" | "populaire" | "titre";

export interface ListPoemsOptions {
  q?: string;
  origin?: PoemOrigin;
  /** Tout sauf cette provenance (la bibliothèque exclut les poèmes de membres). */
  excludeOrigin?: PoemOrigin;
  theme?: string;
  authorSlug?: string;
  userId?: string;
  sort?: PoemSort;
  page?: number;
  pageSize?: number;
}

export interface PoemPage {
  items: PoemView[];
  total: number;
  page: number;
  pageCount: number;
}

/** Poèmes publiés (jamais un brouillon ni un poème masqué), filtrés, triés et paginés. */
export async function listPoems(db: Db, options: ListPoemsOptions = {}): Promise<PoemPage> {
  const pageSize = Math.min(Math.max(options.pageSize ?? PAGE_SIZE, 1), 60);
  const page = Math.max(options.page ?? 1, 1);

  const conditions: SQL[] = [eq(poems.status, "published")];
  const needle = normalizeForSearch(options.q ?? "").trim();
  if (needle) conditions.push(ilike(poems.searchText, `%${escapeLike(needle)}%`));
  if (options.origin) conditions.push(eq(poems.origin, options.origin));
  if (options.excludeOrigin) conditions.push(ne(poems.origin, options.excludeOrigin));
  if (options.theme && isThemeId(options.theme)) conditions.push(eq(poems.theme, options.theme));
  if (options.authorSlug) conditions.push(eq(authors.slug, options.authorSlug));
  if (options.userId) conditions.push(eq(poems.userId, options.userId));
  const where = and(...conditions);

  const order =
    options.sort === "titre"
      ? [asc(poems.title)]
      : options.sort === "populaire"
        ? [desc(favoriteCount), desc(poems.publishedAt)]
        : [desc(poems.publishedAt), desc(poems.id)];

  const [items, [count]] = await Promise.all([
    db
      .select(viewColumns)
      .from(poems)
      .leftJoin(authors, eq(poems.authorId, authors.id))
      .where(where)
      .orderBy(...order)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ n: sql<number>`count(*)::int` }).from(poems).leftJoin(authors, eq(poems.authorId, authors.id)).where(where),
  ]);

  return { items, total: count.n, page, pageCount: Math.max(Math.ceil(count.n / pageSize), 1) };
}

/** Un poème par son identifiant d'URL. Les brouillons et poèmes masqués ne sont visibles que de leur auteur ou d'un administrateur. */
export async function getPoemBySlug(db: Db, slug: string, viewer?: Pick<User, "id" | "role"> | null): Promise<PoemView | undefined> {
  const [poem] = await db
    .select(viewColumns)
    .from(poems)
    .leftJoin(authors, eq(poems.authorId, authors.id))
    .where(eq(poems.slug, slug))
    .limit(1);
  if (!poem) return undefined;
  if (poem.status === "published") return poem;
  const allowed = viewer && (viewer.role === "admin" || (poem.userId !== null && poem.userId === viewer.id));
  return allowed ? poem : undefined;
}

/**
 * « Poème du jour » : un poème de la bibliothèque, le même toute la journée
 * (indice = numéro du jour modulo le nombre de poèmes), qui change à minuit UTC.
 */
export async function poemOfTheDay(db: Db, now = new Date()): Promise<PoemView | undefined> {
  const where = and(eq(poems.status, "published"), eq(poems.origin, "classic"));
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(poems).where(where);
  if (n === 0) return undefined;
  const dayNumber = Math.floor(now.getTime() / 86_400_000);
  const [poem] = await db
    .select(viewColumns)
    .from(poems)
    .leftJoin(authors, eq(poems.authorId, authors.id))
    .where(where)
    .orderBy(asc(poems.id))
    .limit(1)
    .offset(dayNumber % n);
  return poem;
}

export interface AuthorSummary {
  id: number;
  slug: string;
  name: string;
  bornYear: number | null;
  diedYear: number | null;
  bio: string;
  sourceUrl: string | null;
  poemCount: number;
}

export async function listAuthors(db: Db): Promise<AuthorSummary[]> {
  return db
    .select({
      id: authors.id,
      slug: authors.slug,
      name: authors.name,
      bornYear: authors.bornYear,
      diedYear: authors.diedYear,
      bio: authors.bio,
      sourceUrl: authors.sourceUrl,
      poemCount: sql<number>`(select count(*)::int from poems p where p.author_id = authors.id and p.status = 'published')`,
    })
    .from(authors)
    .orderBy(asc(authors.bornYear));
}

export async function getAuthorBySlug(db: Db, slug: string): Promise<AuthorSummary | undefined> {
  return (await listAuthors(db)).find((author) => author.slug === slug);
}

export interface PoemInput {
  title: string;
  body: string;
  theme: string;
  language: "fr" | "en";
  publish: boolean;
  generated: boolean;
}

export class PoemValidationError extends Error {
  constructor(
    public readonly field: "title" | "body" | "theme",
    message: string,
  ) {
    super(message);
    this.name = "PoemValidationError";
  }
}

/** Nettoie le texte d'un poème : fins de ligne unifiées, espaces de fin retirés, lignes vides consécutives réduites à une. */
export function cleanBody(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function validatePoemInput(input: PoemInput): PoemInput {
  const title = input.title.trim().replace(/\s+/g, " ");
  const body = cleanBody(input.body);

  if (title.length < 2) throw new PoemValidationError("title", "Le titre est obligatoire.");
  if (title.length > TITLE_MAX) throw new PoemValidationError("title", `Le titre ne peut pas dépasser ${TITLE_MAX} caractères.`);
  if (body.length < BODY_MIN) throw new PoemValidationError("body", `Le poème doit contenir au moins ${BODY_MIN} caractères.`);
  if (body.length > BODY_MAX) throw new PoemValidationError("body", `Le poème ne peut pas dépasser ${BODY_MAX} caractères.`);
  if (body.split("\n").length > BODY_MAX_LINES) throw new PoemValidationError("body", `Le poème ne peut pas dépasser ${BODY_MAX_LINES} lignes.`);
  if (input.theme && !isThemeId(input.theme)) throw new PoemValidationError("theme", "Thème inconnu.");

  return { ...input, title, body };
}

/** Écrit un poème de membre. Publier fixe la date de publication ; un brouillon reste privé. */
export async function createMemberPoem(db: Db, user: Pick<User, "id" | "name">, rawInput: PoemInput): Promise<Poem> {
  const input = validatePoemInput(rawInput);
  const [poem] = await db
    .insert(poems)
    .values({
      slug: `${slugify(input.title) || "poeme"}-${randomBytes(3).toString("hex")}`,
      title: input.title,
      body: input.body,
      origin: "member",
      status: input.publish ? "published" : "draft",
      authorName: user.name,
      userId: user.id,
      language: input.language,
      theme: input.theme,
      generated: input.generated ? 1 : 0,
      searchText: buildSearchText(input.title, user.name, input.body),
      publishedAt: input.publish ? new Date() : null,
    })
    .returning();
  return poem;
}

export class PoemAccessError extends Error {
  constructor() {
    super("Poème introuvable ou réservé à son auteur.");
    this.name = "PoemAccessError";
  }
}

async function ownedPoem(db: Db, user: Pick<User, "id">, id: number): Promise<Poem> {
  const [poem] = await db.select().from(poems).where(and(eq(poems.id, id), eq(poems.userId, user.id), eq(poems.origin, "member"))).limit(1);
  if (!poem) throw new PoemAccessError();
  return poem;
}

/**
 * Modifie son propre poème. Un poème masqué par la modération ne peut pas être
 * modifié ni republié par son auteur : seul un administrateur le rétablit.
 */
export async function updateMemberPoem(db: Db, user: Pick<User, "id" | "name">, id: number, rawInput: PoemInput): Promise<Poem> {
  const current = await ownedPoem(db, user, id);
  if (current.status === "hidden") throw new PoemAccessError();
  const input = validatePoemInput(rawInput);

  const status = input.publish ? "published" : "draft";
  const [poem] = await db
    .update(poems)
    .set({
      title: input.title,
      body: input.body,
      language: input.language,
      theme: input.theme,
      status,
      searchText: buildSearchText(input.title, current.authorName, input.body),
      publishedAt: status === "published" ? (current.publishedAt ?? new Date()) : null,
      updatedAt: new Date(),
    })
    .where(eq(poems.id, id))
    .returning();
  return poem;
}

export async function deleteMemberPoem(db: Db, user: Pick<User, "id">, id: number): Promise<void> {
  await ownedPoem(db, user, id);
  await db.delete(poems).where(eq(poems.id, id));
}

/** Poèmes d'un membre (brouillons compris) pour sa page personnelle. */
export async function listOwnPoems(db: Db, user: Pick<User, "id">): Promise<PoemView[]> {
  return db
    .select(viewColumns)
    .from(poems)
    .leftJoin(authors, eq(poems.authorId, authors.id))
    .where(and(eq(poems.userId, user.id), eq(poems.origin, "member")))
    .orderBy(desc(poems.updatedAt));
}

export async function getMemberProfile(db: Db, id: string): Promise<{ id: string; name: string; bio: string; createdAt: Date } | undefined> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
  const [member] = await db.select({ id: users.id, name: users.name, bio: users.bio, createdAt: users.createdAt }).from(users).where(eq(users.id, id)).limit(1);
  return member;
}

// --- Favoris -----------------------------------------------------------------

export async function setFavorite(db: Db, user: Pick<User, "id">, poemId: number, on: boolean): Promise<void> {
  if (on) {
    const [poem] = await db.select({ id: poems.id }).from(poems).where(and(eq(poems.id, poemId), eq(poems.status, "published"))).limit(1);
    if (!poem) return;
    await db.insert(favorites).values({ userId: user.id, poemId }).onConflictDoNothing();
  } else {
    await db.delete(favorites).where(and(eq(favorites.userId, user.id), eq(favorites.poemId, poemId)));
  }
}

export async function favoriteIds(db: Db, user: Pick<User, "id"> | null | undefined, poemIds: number[]): Promise<Set<number>> {
  if (!user || poemIds.length === 0) return new Set();
  const rows = await db
    .select({ poemId: favorites.poemId })
    .from(favorites)
    .where(and(eq(favorites.userId, user.id), inArray(favorites.poemId, poemIds)));
  return new Set(rows.map((row) => row.poemId));
}

export async function listFavorites(db: Db, user: Pick<User, "id">): Promise<PoemView[]> {
  return db
    .select(viewColumns)
    .from(favorites)
    .innerJoin(poems, eq(favorites.poemId, poems.id))
    .leftJoin(authors, eq(poems.authorId, authors.id))
    .where(and(eq(favorites.userId, user.id), eq(poems.status, "published")))
    .orderBy(desc(favorites.createdAt));
}

// --- Signalements et modération ----------------------------------------------

/**
 * Enregistre un signalement (un par lecteur et par poème). Quand assez de
 * lecteurs différents signalent un poème de membre, il est masqué sans attendre
 * la relecture : mieux vaut retirer trop vite un poème légitime, qu'un
 * administrateur rétablit, que laisser un contenu illicite en ligne.
 */
export async function reportPoem(
  db: Db,
  input: { poemId: number; reporterId: string; reason: ReportReason; note: string },
): Promise<{ recorded: boolean; hidden: boolean }> {
  const [poem] = await db.select().from(poems).where(and(eq(poems.id, input.poemId), eq(poems.status, "published"))).limit(1);
  if (!poem) return { recorded: false, hidden: false };

  const [already] = await db
    .select({ id: reports.id })
    .from(reports)
    .where(and(eq(reports.poemId, input.poemId), eq(reports.reporterId, input.reporterId), eq(reports.status, "open")))
    .limit(1);
  if (already) return { recorded: false, hidden: false };

  await db.insert(reports).values({ poemId: input.poemId, reporterId: input.reporterId, reason: input.reason, note: input.note.trim().slice(0, 500) });

  if (poem.origin !== "member") return { recorded: true, hidden: false };
  const [{ n }] = await db
    .select({ n: sql<number>`count(distinct ${reports.reporterId})::int` })
    .from(reports)
    .where(and(eq(reports.poemId, input.poemId), eq(reports.status, "open")));
  if (n >= AUTO_HIDE_REPORTS) {
    await db.update(poems).set({ status: "hidden", updatedAt: new Date() }).where(eq(poems.id, input.poemId));
    return { recorded: true, hidden: true };
  }
  return { recorded: true, hidden: false };
}

export interface ReportView {
  id: number;
  reason: ReportReason;
  note: string;
  status: "open" | "resolved" | "dismissed";
  createdAt: Date;
  poemId: number;
  poemSlug: string;
  poemTitle: string;
  poemStatus: Poem["status"];
  poemOrigin: PoemOrigin;
  authorName: string;
  reporterName: string | null;
}

export async function listReports(db: Db, status: "open" | "closed" = "open"): Promise<ReportView[]> {
  return db
    .select({
      id: reports.id,
      reason: reports.reason,
      note: reports.note,
      status: reports.status,
      createdAt: reports.createdAt,
      poemId: poems.id,
      poemSlug: poems.slug,
      poemTitle: poems.title,
      poemStatus: poems.status,
      poemOrigin: poems.origin,
      authorName: poems.authorName,
      reporterName: users.name,
    })
    .from(reports)
    .innerJoin(poems, eq(reports.poemId, poems.id))
    .leftJoin(users, eq(reports.reporterId, users.id))
    .where(status === "open" ? eq(reports.status, "open") : ne(reports.status, "open"))
    .orderBy(desc(reports.createdAt))
    .limit(200);
}

export type ModerationAction = "hide" | "restore" | "dismiss" | "delete";

/**
 * Décision de l'administrateur sur un signalement : masquer, rétablir le poème,
 * classer sans suite (ce qui rétablit un poème masqué automatiquement), ou supprimer le poème d'un membre. Tous les signalements
 * ouverts du même poème sont clos avec la décision.
 */
export async function moderate(db: Db, reportId: number, action: ModerationAction): Promise<void> {
  const [report] = await db.select().from(reports).where(eq(reports.id, reportId)).limit(1);
  if (!report) return;

  if (action === "delete") {
    // La suppression d'un poème de la bibliothèque n'a pas de sens ici : on ne retire que les poèmes de membres.
    await db.delete(poems).where(and(eq(poems.id, report.poemId), eq(poems.origin, "member")));
    return;
  }

  if (action === "hide") await db.update(poems).set({ status: "hidden", updatedAt: new Date() }).where(eq(poems.id, report.poemId));
  if (action === "restore" || action === "dismiss") {
    const [poem] = await db.select().from(poems).where(eq(poems.id, report.poemId)).limit(1);
    if (poem?.status === "hidden") await db.update(poems).set({ status: "published", publishedAt: poem.publishedAt ?? new Date(), updatedAt: new Date() }).where(eq(poems.id, report.poemId));
  }

  await db
    .update(reports)
    .set({ status: action === "hide" ? "resolved" : "dismissed" })
    .where(and(eq(reports.poemId, report.poemId), eq(reports.status, "open")));
}

export async function countOpenReports(db: Db): Promise<number> {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(reports).where(eq(reports.status, "open"));
  return row.n;
}
