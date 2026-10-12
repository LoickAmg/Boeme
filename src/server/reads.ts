import { createHash } from "node:crypto";

import { sql } from "drizzle-orm";

import type { Db } from "@/db/client";

import { dayKey } from "./poems";

/** Robots, aperçus de liens et outils : leurs passages ne sont pas des lectures. */
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|curl|wget|python|node-fetch|headless|lighthouse/i;

export function isBot(userAgent: string | null): boolean {
  return !userAgent || BOT.test(userAgent);
}

/**
 * Empreinte d'un lecteur : son compte s'il est connecté (il compte alors pour une seule personne
 * sur tous ses appareils), sinon son adresse IP et son navigateur. Toujours salée avec APP_SECRET :
 * ni l'adresse IP, ni l'identifiant du membre ne sont stockés.
 */
export function readerKey(input: { userId?: string | null; ip?: string | null; userAgent?: string | null }, secret = process.env.APP_SECRET ?? "dev-secret"): string {
  const who = input.userId ? `membre|${input.userId}` : `visiteur|${input.ip ?? "?"}|${input.userAgent ?? ""}`;
  return createHash("sha256").update(`${secret}|lecture|${who}`).digest("hex").slice(0, 32);
}

/**
 * Compte une lecture d'un poème de membre publié : au plus une par lecteur et par jour, jamais
 * celles de l'auteur. Le nombre de lecteurs distincts n'augmente qu'à la première lecture.
 * Une seule instruction SQL : deux requêtes simultanées ne comptent pas deux fois.
 * Renvoie vrai si une lecture a été comptée.
 */
export async function recordRead(db: Db, poemId: number, reader: string, viewerId: string | null, now = new Date()): Promise<boolean> {
  const day = dayKey(now);
  const result = await db.execute(sql`
    with target as (
      select id from poems
      where id = ${poemId} and status = 'published' and origin = 'member'
        and (${viewerId}::uuid is null or user_id is distinct from ${viewerId}::uuid)
    ),
    seen_before as (
      select 1 from poem_reads where poem_id = ${poemId} and reader = ${reader} limit 1
    ),
    inserted as (
      insert into poem_reads (poem_id, reader, day)
      select id, ${reader}, ${day} from target
      on conflict do nothing
      returning poem_id
    )
    update poems set
      view_count = view_count + 1,
      reader_count = reader_count + (case when exists (select 1 from seen_before) then 0 else 1 end)
    where id in (select poem_id from inserted)
    returning id
  `);
  return rowCount(result) > 0;
}

function rowCount(result: unknown): number {
  const rows = (result as { rows?: unknown[] }).rows ?? (Array.isArray(result) ? result : []);
  return rows.length;
}

/** Totaux d'un auteur sur l'ensemble de ses poèmes publiés. */
export async function authorReadTotals(db: Db, userId: string): Promise<{ views: number; readers: number }> {
  const result = await db.execute(sql`
    select coalesce(sum(view_count), 0)::int as views,
           (select count(distinct r.reader)::int from poem_reads r join poems p on p.id = r.poem_id where p.user_id = ${userId}) as readers
    from poems where user_id = ${userId} and origin = 'member' and status = 'published'
  `);
  const rows = (result as { rows?: Array<{ views: number; readers: number }> }).rows ?? (result as unknown as Array<{ views: number; readers: number }>);
  return { views: Number(rows[0]?.views ?? 0), readers: Number(rows[0]?.readers ?? 0) };
}
