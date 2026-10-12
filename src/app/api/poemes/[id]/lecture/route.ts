import type { NextRequest } from "next/server";

import { getDb } from "@/db/client";
import { getCurrentUser } from "@/server/context";
import { hitRateLimit } from "@/server/rate-limit";
import { isBot, readerKey, recordRead } from "@/server/reads";
import { clientFingerprint } from "@/server/request";

/**
 * POST /api/poemes/:id/lecture : envoyé par la page d'un poème de membre après quelques secondes
 * de lecture (les robots, qui n'exécutent pas le JavaScript ou s'annoncent comme tels, ne comptent
 * pas). Au plus une lecture par lecteur et par jour ; l'auteur ne se compte pas lui-même.
 */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/poemes/[id]/lecture">) {
  const { id } = await ctx.params;
  const poemId = Number(id);
  if (!Number.isInteger(poemId) || poemId <= 0) return new Response(null, { status: 400 });

  // Uniquement depuis les pages du site.
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return new Response(null, { status: 403 });
  const userAgent = request.headers.get("user-agent");
  if (isBot(userAgent)) return new Response(null, { status: 204 });

  const db = await getDb();
  const limit = await hitRateLimit(db, `read:${clientFingerprint(request.headers)}`, { max: 300, windowSeconds: 3600 });
  if (!limit.allowed) return new Response(null, { status: 204 });

  const user = await getCurrentUser();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
  await recordRead(db, poemId, readerKey({ userId: user?.id, ip, userAgent }), user?.id ?? null);
  return new Response(null, { status: 204 });
}
