import { generateHomemadePoem } from "./generator";
import { generateLlmPoem, isLlmConfigured } from "./llm";
import type { GeneratedPoem, GeneratePoemInput } from "./types";

export { THEME_IDS, STRUCTURE_IDS, LENGTH_IDS } from "./types";
export type {
  GeneratedPoem,
  GeneratePoemInput,
  Language,
  LengthId,
  PoemSource,
  StructureId,
  ThemeId,
} from "./types";

/**
 * Point d'entrée unique de génération : essaie l'API LLM si elle est
 * configurée (clé présente), et retombe silencieusement — mais en loggant
 * côté serveur — sur le générateur maison si elle échoue ou n'est pas
 * configurée. La génération ne casse donc jamais, avec ou sans clé API.
 */
export async function generatePoem(input: GeneratePoemInput): Promise<GeneratedPoem> {
  if (isLlmConfigured()) {
    try {
      return await generateLlmPoem(input);
    } catch (error) {
      console.warn(
        "[poetry] Génération LLM en échec, repli sur le générateur maison :",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return generateHomemadePoem(input);
}
