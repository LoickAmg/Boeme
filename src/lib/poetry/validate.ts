import { LENGTH_IDS, STRUCTURE_IDS, THEME_IDS } from "./types";
import type { GeneratePoemInput, Language, LengthId, StructureId, ThemeId } from "./types";

const LANGUAGES: readonly Language[] = ["fr", "en"];

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

/**
 * Valide un corps de requête arbitraire (JSON parsé) en GeneratePoemInput.
 * Renvoie null si un champ manque ou a une valeur hors des listes
 * autorisées — jamais de texte libre accepté ici, uniquement des valeurs
 * de la liste prédéfinie (thème, structure, longueur, langue).
 */
export function parseGeneratePoemInput(body: unknown): GeneratePoemInput | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const { language, theme, structure, length } = body as Record<string, unknown>;

  if (
    !isOneOf<Language>(language, LANGUAGES) ||
    !isOneOf<ThemeId>(theme, THEME_IDS) ||
    !isOneOf<StructureId>(structure, STRUCTURE_IDS) ||
    !isOneOf<LengthId>(length, LENGTH_IDS)
  ) {
    return null;
  }

  return { language, theme, structure, length };
}
