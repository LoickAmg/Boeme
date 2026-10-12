import type { NextRequest } from "next/server";

import { getDb } from "@/db/client";
import { getCurrentUser } from "@/server/context";
import { readCover } from "@/server/covers";

/** GET /api/poemes/:id/couverture : l'image de couverture d'un poème de membre. */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/poemes/[id]/couverture">) {
  const { id } = await ctx.params;
  const poemId = Number(id);
  if (!Number.isInteger(poemId) || poemId <= 0) return new Response(null, { status: 404 });

  const cover = await readCover(await getDb(), poemId, await getCurrentUser());
  if (!cover) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(cover.bytes), {
    headers: {
      "Content-Type": cover.mime,
      "Content-Length": String(cover.bytes.length),
      // L'adresse change avec la version (?v=…) : on peut la garder longtemps ; un brouillon reste privé.
      "Cache-Control": cover.isPublic ? "public, max-age=86400, stale-while-revalidate=604800" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
