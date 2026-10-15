import { desc, eq, sql } from "drizzle-orm";

import type { Db } from "@/db/client";
import { FEEDBACK_KINDS, FEEDBACK_STATUSES, feedback } from "@/db/schema";
import type { Feedback, User } from "@/db/schema";
import { FEEDBACK_KIND_OPTIONS } from "@/lib/feedback";

export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const FEEDBACK_KIND_LABELS = Object.fromEntries(FEEDBACK_KIND_OPTIONS.map((kind) => [kind.id, kind.label])) as Record<FeedbackKind, string>;

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  nouveau: "Nouveau",
  lu: "Lu",
  traite: "Traité",
};

export const FEEDBACK_MIN = 5;
export const FEEDBACK_MAX = 3000;

export class FeedbackError extends Error {
  constructor(
    message: string,
    readonly field: "message" | "kind" | "contact",
  ) {
    super(message);
    this.name = "FeedbackError";
  }
}

export function isFeedbackKind(value: unknown): value is FeedbackKind {
  return typeof value === "string" && (FEEDBACK_KINDS as readonly string[]).includes(value);
}

/** Garde seulement le chemin interne de la page (ni domaine, ni paramètres, ni ancre). */
export function cleanPagePath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "";
  return value.split(/[?#]/)[0].slice(0, 200);
}

export async function submitFeedback(
  db: Db,
  author: Pick<User, "id" | "name"> | null,
  input: { kind: string; message: string; page?: string; contact?: string; name?: string },
): Promise<Feedback> {
  if (!isFeedbackKind(input.kind)) throw new FeedbackError("Choisissez le type de retour.", "kind");
  const message = input.message.replace(/\r\n/g, "\n").trim();
  if (message.length < FEEDBACK_MIN) throw new FeedbackError("Écrivez au moins quelques mots.", "message");
  if (message.length > FEEDBACK_MAX) throw new FeedbackError(`${FEEDBACK_MAX} caractères au plus.`, "message");
  const contact = author ? "" : (input.contact ?? "").trim().toLowerCase().slice(0, 160);
  if (contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) throw new FeedbackError("Adresse e-mail invalide (ou laissez le champ vide).", "contact");

  const [row] = await db
    .insert(feedback)
    .values({
      kind: input.kind,
      message,
      page: cleanPagePath(input.page),
      userId: author?.id ?? null,
      authorName: author ? author.name : (input.name ?? "").trim().slice(0, 60),
      contact,
    })
    .returning();
  return row;
}

export async function listFeedback(db: Db, options: { status?: FeedbackStatus; limit?: number } = {}): Promise<Feedback[]> {
  return db
    .select()
    .from(feedback)
    .where(options.status ? eq(feedback.status, options.status) : undefined)
    .orderBy(desc(feedback.createdAt), desc(feedback.id))
    .limit(Math.min(options.limit ?? 200, 500));
}

export async function countNewFeedback(db: Db): Promise<number> {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(feedback).where(eq(feedback.status, "nouveau"));
  return row.n;
}

export async function setFeedbackStatus(db: Db, id: number, status: FeedbackStatus): Promise<void> {
  await db.update(feedback).set({ status }).where(eq(feedback.id, id));
}

export async function deleteFeedback(db: Db, id: number): Promise<void> {
  await db.delete(feedback).where(eq(feedback.id, id));
}
