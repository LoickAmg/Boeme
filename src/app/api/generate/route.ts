import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import { generatePoem } from "@/lib/poetry";
import { parseGeneratePoemInput } from "@/lib/poetry/validate";
import { hitRateLimit } from "@/server/rate-limit";
import { clientFingerprint } from "@/server/request";

/** Générations par visiteur et par fenêtre de 10 minutes. */
const PER_VISITOR = { max: 10, windowSeconds: 600 };
/**
 * Plafond global par heure, toutes adresses confondues : borne le coût d'une
 * clé LLM même face à quelqu'un qui change d'adresse. Surchargeable via
 * POEM_GLOBAL_HOURLY_LIMIT.
 */
const DEFAULT_GLOBAL_HOURLY_LIMIT = 300;

function globalHourlyLimit(): number {
  const configured = Number.parseInt(process.env.POEM_GLOBAL_HOURLY_LIMIT ?? "", 10);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_GLOBAL_HOURLY_LIMIT;
}

function tooManyRequests(message: string, retryAfterSeconds: number) {
  return NextResponse.json({ error: message }, { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } });
}

/**
 * POST /api/generate : génère un poème à partir de choix prédéfinis (langue,
 * ambiance, structure, longueur) et le renvoie, sans rien enregistrer. Le
 * visiteur décide ensuite de le retravailler dans l'éditeur ; le thème envoyé à
 * un éventuel modèle de langage ne vient jamais d'un texte libre.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
  }

  const input = parseGeneratePoemInput(body);
  if (!input) {
    return NextResponse.json({ error: "Paramètres invalides (language, theme, structure, length attendus)." }, { status: 400 });
  }

  try {
    const db = await getDb();
    const visitor = await hitRateLimit(db, `generate:${clientFingerprint(request.headers)}`, PER_VISITOR);
    if (!visitor.allowed) {
      return tooManyRequests("Trop de poèmes générés depuis cette adresse. Réessayez dans quelques minutes.", visitor.retryAfterSeconds);
    }
    const everyone = await hitRateLimit(db, "generate:all", { max: globalHourlyLimit(), windowSeconds: 3600 });
    if (!everyone.allowed) {
      return tooManyRequests("Le générateur a atteint son quota pour cette heure. Revenez plus tard.", everyone.retryAfterSeconds);
    }

    const generated = await generatePoem(input);
    return NextResponse.json({ poem: { content: generated.content, source: generated.source, ...input } });
  } catch (error) {
    console.error("[api/generate] Échec de génération :", error);
    return NextResponse.json({ error: "La génération du poème a échoué. Réessayez dans un instant." }, { status: 500 });
  }
}
