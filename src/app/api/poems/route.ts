import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { poems } from "@/db/schema";
import { countPoemsSince, getRecentPoems } from "@/db/queries";
import { clientIpFrom } from "@/lib/clientIp";
import {
  DEFAULT_GLOBAL_HOURLY_LIMIT,
  GENERATION_LIMIT_PER_IP,
  GENERATION_WINDOW_MS,
} from "@/lib/constants";
import { createRateLimiter } from "@/lib/rateLimit";
import { parsePaginationLimit, parsePaginationOffset } from "@/lib/pagination";
import { generatePoem } from "@/lib/poetry";
import { parseGeneratePoemInput } from "@/lib/poetry/validate";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;
const HOUR_MS = 60 * 60 * 1000;

const perIpLimiter = createRateLimiter({ windowMs: GENERATION_WINDOW_MS, max: GENERATION_LIMIT_PER_IP });

function globalHourlyLimit(): number {
  const configured = Number.parseInt(process.env.POEM_GLOBAL_HOURLY_LIMIT ?? "", 10);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_GLOBAL_HOURLY_LIMIT;
}

function tooManyRequests(message: string, retryAfterSeconds: number) {
  return NextResponse.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

/** GET /api/poems?limit=12&offset=0 — liste paginée pour la galerie, la plus récente en premier. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parsePaginationLimit(searchParams, { defaultLimit: DEFAULT_LIMIT, maxLimit: MAX_LIMIT });
  const offset = parsePaginationOffset(searchParams);

  try {
    const page = await getRecentPoems(limit, offset);
    return NextResponse.json(page);
  } catch (error) {
    console.error("[api/poems][GET] Échec de lecture en base :", error);
    return NextResponse.json(
      { error: "Impossible de charger la galerie pour le moment." },
      { status: 500 },
    );
  }
}

/** POST /api/poems — génère un poème (thème/structure/longueur/langue prédéfinis), le publie, le renvoie. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
  }

  const input = parseGeneratePoemInput(body);
  if (!input) {
    return NextResponse.json(
      { error: "Paramètres invalides (language, theme, structure, length attendus)." },
      { status: 400 },
    );
  }

  const ipCheck = perIpLimiter(clientIpFrom(request.headers));
  if (!ipCheck.allowed) {
    return tooManyRequests(
      "Trop de poèmes générés depuis cette adresse. Réessaie dans quelques minutes.",
      ipCheck.retryAfterSeconds,
    );
  }

  try {
    if ((await countPoemsSince(new Date(Date.now() - HOUR_MS))) >= globalHourlyLimit()) {
      return tooManyRequests("La galerie a atteint son quota de poèmes pour cette heure. Reviens plus tard.", 600);
    }

    const generated = await generatePoem(input);
    const db = getDb();
    const [saved] = await db
      .insert(poems)
      .values({
        content: generated.content,
        language: input.language,
        theme: input.theme,
        structure: input.structure,
        source: generated.source,
      })
      .returning();

    return NextResponse.json({ poem: saved }, { status: 201 });
  } catch (error) {
    console.error("[api/poems][POST] Échec de génération/sauvegarde :", error);
    return NextResponse.json(
      { error: "La génération du poème a échoué. Réessaie dans un instant." },
      { status: 500 },
    );
  }
}
