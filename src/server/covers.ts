import { and, eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { poemCovers, poems } from "@/db/schema";
import type { User } from "@/db/schema";

/** Taille maximale d'une couverture déjà réduite par le navigateur. */
export const COVER_MAX_BYTES = 450 * 1024;

const SIGNATURES: Array<{ mime: string; test: (b: Buffer) => boolean }> = [
  { mime: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: "image/webp", test: (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP" },
];

export class CoverError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CoverError";
  }
}

/**
 * Lit une couverture envoyée en « data URL ». Le type annoncé ne fait pas foi : seuls les octets
 * (signature JPEG, PNG ou WebP) décident ; tout le reste (SVG, HTML…) est refusé.
 */
export function parseCover(dataUrl: string): { mime: string; data: string } {
  const match = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl.trim());
  if (!match) throw new CoverError("Image de couverture illisible : choisissez une photo JPEG, PNG ou WebP.");
  const bytes = Buffer.from(match[1], "base64");
  if (bytes.length === 0 || bytes.length > COVER_MAX_BYTES) throw new CoverError("Image de couverture trop lourde, même réduite. Essayez une autre photo.");
  const kind = SIGNATURES.find((s) => s.test(bytes));
  if (!kind) throw new CoverError("Ce fichier n'est pas une image JPEG, PNG ou WebP.");
  return { mime: kind.mime, data: bytes.toString("base64") };
}

async function ownPoem(db: Db, user: Pick<User, "id">, poemId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: poems.id })
    .from(poems)
    .where(and(eq(poems.id, poemId), eq(poems.userId, user.id), eq(poems.origin, "member")))
    .limit(1);
  return Boolean(row);
}

export async function setCover(db: Db, user: Pick<User, "id">, poemId: number, dataUrl: string): Promise<void> {
  const cover = parseCover(dataUrl);
  if (!(await ownPoem(db, user, poemId))) throw new CoverError("Ce poème ne vous appartient pas.");
  await db
    .insert(poemCovers)
    .values({ poemId, ...cover, updatedAt: new Date() })
    .onConflictDoUpdate({ target: poemCovers.poemId, set: { ...cover, updatedAt: new Date() } });
}

export async function removeCover(db: Db, user: Pick<User, "id">, poemId: number): Promise<void> {
  if (!(await ownPoem(db, user, poemId))) return;
  await db.delete(poemCovers).where(eq(poemCovers.poemId, poemId));
}

/** La couverture, si le poème est visible par ce lecteur (publié, ou son auteur, ou un administrateur). */
export async function readCover(db: Db, poemId: number, viewer: Pick<User, "id" | "role"> | null): Promise<{ mime: string; bytes: Buffer; updatedAt: Date; isPublic: boolean } | null> {
  const [row] = await db
    .select({ mime: poemCovers.mime, data: poemCovers.data, updatedAt: poemCovers.updatedAt, status: poems.status, userId: poems.userId })
    .from(poemCovers)
    .innerJoin(poems, eq(poems.id, poemCovers.poemId))
    .where(eq(poemCovers.poemId, poemId))
    .limit(1);
  if (!row) return null;
  const isPublic = row.status === "published";
  if (!isPublic && !(viewer && (viewer.role === "admin" || viewer.id === row.userId))) return null;
  return { mime: row.mime, bytes: Buffer.from(row.data, "base64"), updatedAt: row.updatedAt, isPublic };
}
