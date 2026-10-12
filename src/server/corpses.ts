import { randomBytes } from "node:crypto";

import { and, asc, count, desc, eq, sql } from "drizzle-orm";

import type { Db } from "@/db/client";
import { corpseLines, corpses } from "@/db/schema";
import type { Corpse, User } from "@/db/schema";
import { slugify } from "@/lib/slug";
import { isThemeId } from "@/lib/themes";

/**
 * Cadavre exquis : un poème écrit à plusieurs, vers par vers. Tant qu'il est ouvert, on ne voit
 * que le dernier vers écrit ; quand le nombre de vers prévu est atteint, il se révèle en entier.
 * Règles : pas deux vers d'affilée du même membre, et pas plus d'un quart des vers (au moins 2)
 * par membre, pour que le poème reste collectif.
 */

export const CORPSE_LENGTHS = [8, 12, 16, 20] as const;
export const LINE_MIN = 3;
export const LINE_MAX = 140;
export const CORPSE_TITLE_MAX = 80;
export const REMOVED_LINE = "— vers retiré par la modération —";

export class CorpseError extends Error {
  constructor(
    message: string,
    public readonly field: "title" | "line" | "general" = "general",
  ) {
    super(message);
    this.name = "CorpseError";
  }
}

export function maxLinesPerMember(targetLines: number): number {
  return Math.max(2, Math.floor(targetLines / 4));
}

function cleanLine(raw: string): string {
  const line = raw.replace(/\s+/g, " ").trim();
  if (line.length < LINE_MIN) throw new CorpseError(`Un vers doit faire au moins ${LINE_MIN} caractères.`, "line");
  if (line.length > LINE_MAX) throw new CorpseError(`Un vers ne peut pas dépasser ${LINE_MAX} caractères.`, "line");
  return line;
}

export interface CorpseSummary {
  id: number;
  slug: string;
  title: string;
  theme: string;
  targetLines: number;
  status: Corpse["status"];
  lineCount: number;
  contributors: number;
  /** Dernier vers (seul visible tant que le cadavre est ouvert). */
  lastLine: string | null;
  /** Premiers vers, pour un cadavre révélé. */
  opening: string[];
  createdAt: Date;
  completedAt: Date | null;
}

async function summarize(db: Db, corpse: Corpse): Promise<CorpseSummary> {
  const lines = await db.select().from(corpseLines).where(eq(corpseLines.corpseId, corpse.id)).orderBy(asc(corpseLines.position));
  return {
    id: corpse.id,
    slug: corpse.slug,
    title: corpse.title,
    theme: corpse.theme,
    targetLines: corpse.targetLines,
    status: corpse.status,
    lineCount: lines.length,
    contributors: new Set(lines.map((l) => l.userId ?? l.authorName)).size,
    lastLine: lines.length ? lines[lines.length - 1].line : null,
    opening: corpse.status === "complete" ? lines.slice(0, 4).map((l) => l.line) : [],
    createdAt: corpse.createdAt,
    completedAt: corpse.completedAt,
  };
}

/** Lance un cadavre exquis, avec son premier vers. */
export async function startCorpse(
  db: Db,
  user: Pick<User, "id" | "name">,
  input: { title: string; theme: string; targetLines: number; firstLine: string },
): Promise<Corpse> {
  const title = input.title.replace(/\s+/g, " ").trim();
  if (title.length < 2) throw new CorpseError("Le titre est obligatoire.", "title");
  if (title.length > CORPSE_TITLE_MAX) throw new CorpseError(`Le titre ne peut pas dépasser ${CORPSE_TITLE_MAX} caractères.`, "title");
  const targetLines = (CORPSE_LENGTHS as readonly number[]).includes(input.targetLines) ? input.targetLines : 12;
  const line = cleanLine(input.firstLine);
  const theme = input.theme && isThemeId(input.theme) ? input.theme : "";

  const [corpse] = await db
    .insert(corpses)
    .values({ slug: `${slugify(title) || "cadavre"}-${randomBytes(3).toString("hex")}`, title, theme, targetLines, createdBy: user.id })
    .returning();
  await db.insert(corpseLines).values({ corpseId: corpse.id, position: 1, line, userId: user.id, authorName: user.name });
  return corpse;
}

/** Ce qu'un membre peut faire sur un cadavre ouvert (et pourquoi pas, sinon). */
export async function canContribute(db: Db, corpse: Corpse, user: Pick<User, "id"> | null): Promise<{ allowed: boolean; reason?: string }> {
  if (corpse.status !== "open") return { allowed: false, reason: "Ce cadavre exquis est terminé." };
  if (!user) return { allowed: false, reason: "Connectez-vous pour écrire le vers suivant." };
  const [last] = await db.select().from(corpseLines).where(eq(corpseLines.corpseId, corpse.id)).orderBy(desc(corpseLines.position)).limit(1);
  if (last?.userId === user.id) return { allowed: false, reason: "Vous avez écrit le dernier vers : laissez un autre membre continuer." };
  const [mine] = await db
    .select({ n: count() })
    .from(corpseLines)
    .where(and(eq(corpseLines.corpseId, corpse.id), eq(corpseLines.userId, user.id)));
  if (mine.n >= maxLinesPerMember(corpse.targetLines)) {
    return { allowed: false, reason: `Vous avez déjà écrit ${mine.n} vers de ce poème : place aux autres !` };
  }
  return { allowed: true };
}

/** Ajoute le vers suivant ; le cadavre se révèle quand il atteint sa longueur. */
export async function addCorpseLine(db: Db, user: Pick<User, "id" | "name">, corpseId: number, rawLine: string): Promise<{ complete: boolean }> {
  const line = cleanLine(rawLine);
  for (let attempt = 0; attempt < 3; attempt++) {
    const [corpse] = await db.select().from(corpses).where(eq(corpses.id, corpseId)).limit(1);
    if (!corpse) throw new CorpseError("Cadavre exquis introuvable.");
    const check = await canContribute(db, corpse, user);
    if (!check.allowed) throw new CorpseError(check.reason ?? "Impossible d'ajouter ce vers.");
    const [{ n }] = await db.select({ n: count() }).from(corpseLines).where(eq(corpseLines.corpseId, corpseId));
    // Le rang est unique : deux membres qui écrivent en même temps ne prennent pas la même
    // place (le second réessaie au rang suivant).
    const inserted = await db
      .insert(corpseLines)
      .values({ corpseId, position: n + 1, line, userId: user.id, authorName: user.name })
      .onConflictDoNothing()
      .returning({ id: corpseLines.id });
    if (!inserted.length) continue;
    if (n + 1 >= corpse.targetLines) {
      await db.update(corpses).set({ status: "complete", completedAt: new Date() }).where(and(eq(corpses.id, corpseId), eq(corpses.status, "open")));
      return { complete: true };
    }
    return { complete: false };
  }
  throw new CorpseError("Quelqu'un vient d'écrire en même temps que vous : réessayez.");
}

export async function getCorpseBySlug(db: Db, slug: string): Promise<Corpse | undefined> {
  const [corpse] = await db.select().from(corpses).where(eq(corpses.slug, slug)).limit(1);
  return corpse;
}

/** Vers visibles : le dernier seulement tant que le cadavre est ouvert, tous une fois révélé. */
export async function visibleLines(db: Db, corpse: Corpse): Promise<{ position: number; line: string; authorName: string; userId: string | null }[]> {
  const rows = await db
    .select({ position: corpseLines.position, line: corpseLines.line, authorName: corpseLines.authorName, userId: corpseLines.userId })
    .from(corpseLines)
    .where(eq(corpseLines.corpseId, corpse.id))
    .orderBy(asc(corpseLines.position));
  return corpse.status === "complete" ? rows : rows.slice(-1);
}

export async function listCorpses(db: Db, status: Corpse["status"], limit = 24): Promise<CorpseSummary[]> {
  const rows = await db
    .select()
    .from(corpses)
    .where(eq(corpses.status, status))
    .orderBy(status === "open" ? desc(corpses.createdAt) : desc(corpses.completedAt))
    .limit(limit);
  return Promise.all(rows.map((row) => summarize(db, row)));
}

export async function corpseSummary(db: Db, corpse: Corpse): Promise<CorpseSummary> {
  return summarize(db, corpse);
}

// --- Modération -----------------------------------------------------------------

export async function removeCorpseLine(db: Db, corpseId: number, position: number): Promise<void> {
  await db
    .update(corpseLines)
    .set({ line: REMOVED_LINE })
    .where(and(eq(corpseLines.corpseId, corpseId), eq(corpseLines.position, position)));
}

export async function deleteCorpse(db: Db, corpseId: number): Promise<void> {
  await db.delete(corpses).where(eq(corpses.id, corpseId));
}

/** Nombre de cadavres ouverts (pour l'accueil). */
export async function openCorpseCount(db: Db): Promise<number> {
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(corpses).where(eq(corpses.status, "open"));
  return n;
}
