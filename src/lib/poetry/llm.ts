import type { GeneratedPoem, GeneratePoemInput, Language, LengthId, StructureId, ThemeId } from "./types";

/**
 * Intégration LLM optionnelle. Désactivée par défaut (aucune clé requise
 * pour que le site fonctionne) — s'active uniquement si POEM_LLM_API_KEY
 * est définie dans l'environnement. Compatible avec toute API respectant
 * le format "chat completions" d'OpenAI (OpenAI, mais aussi des relais
 * compatibles comme Groq, OpenRouter, Together AI, etc.) : seule l'URL et
 * le modèle changent, via POEM_LLM_API_URL / POEM_LLM_MODEL.
 *
 * Important pour la galerie publique : le thème envoyé au modèle vient
 * toujours d'une liste prédéfinie (ThemeId), jamais d'un texte libre saisi
 * par un visiteur — pas de surface d'injection/abus côté prompt.
 */

const DEFAULT_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_CONTENT_LENGTH = 2_000;

export function isLlmConfigured(): boolean {
  return Boolean(process.env.POEM_LLM_API_KEY);
}

const THEME_LABELS: Record<Language, Record<ThemeId, string>> = {
  fr: {
    tendre: "tendre, douceur amoureuse et gestes discrets",
    melancolique: "mélancolique, nostalgie douce, pluie et souvenirs",
    reveur: "rêveur, onirique, nuages et étoiles",
    lumineux: "lumineux, matin plein d'espoir et de clarté",
    apaisant: "apaisant, cocooning, thé chaud et silence tranquille",
  },
  en: {
    tendre: "tender, quiet affection and small gestures",
    melancolique: "wistful, gentle nostalgia, rain and memory",
    reveur: "dreamy, oneiric, clouds and stars",
    lumineux: "luminous, a hopeful bright morning",
    apaisant: "soothing, cozy, warm tea and quiet stillness",
  },
};

const STRUCTURE_INSTRUCTIONS: Record<Language, Record<StructureId, string>> = {
  fr: {
    haiku:
      "un haïku de exactement 3 vers, dans la convention syllabique 5/7/5 " +
      "(approximative, pas besoin d'un compte phonétique strict)",
    vers_libre: "un poème en vers libres, sans rimes obligatoires, phrasé naturel",
    forme_courte_rimee: "une forme courte avec des rimes (distiques ou quatrains rimés)",
  },
  en: {
    haiku:
      "a haiku of exactly 3 lines, following the 5/7/5 syllable convention " +
      "(approximate is fine, no need for strict phonetic counting)",
    vers_libre: "a free-verse poem, no rhyme required, natural phrasing",
    forme_courte_rimee: "a short rhymed form (rhyming couplets or quatrains)",
  },
};

const LENGTH_INSTRUCTIONS: Record<Language, Record<LengthId, string>> = {
  fr: {
    court: "très court (2 à 4 vers en tout, sauf pour le haïku qui reste à 3 vers)",
    moyen: "de longueur moyenne (environ 6 à 8 vers, sauf pour le haïku qui reste à 3 vers)",
    long: "un peu plus développé (environ 10 à 12 vers, sauf pour le haïku qui reste à 3 vers)",
  },
  en: {
    court: "very short (2 to 4 lines total, except haiku which stays at 3 lines)",
    moyen: "medium length (about 6 to 8 lines, except haiku which stays at 3 lines)",
    long: "a bit more developed (about 10 to 12 lines, except haiku which stays at 3 lines)",
  },
};

function buildPrompt(input: GeneratePoemInput): { system: string; user: string } {
  const languageName = input.language === "fr" ? "français" : "English";
  const system =
    input.language === "fr"
      ? "Tu es un poète discret, au style chic et sobre, dans une ambiance " +
        "cosy et douce (pense : lin, rose poudré, lumière d'ivoire). Tu " +
        "réponds uniquement avec le texte du poème, sans titre, sans " +
        "guillemets, sans note ni explication, sans markdown."
      : "You are a quiet, understated poet with a chic, cozy sensibility " +
        "(think: linen, powder pink, ivory light). Reply with only the " +
        "poem text itself — no title, no quotation marks, no notes or " +
        "explanations, no markdown.";

  const user =
    input.language === "fr"
      ? `Écris ${STRUCTURE_INSTRUCTIONS.fr[input.structure]}, en ${languageName}, ` +
        `sur un thème ${THEME_LABELS.fr[input.theme]}. Le poème doit être ` +
        `${LENGTH_INSTRUCTIONS.fr[input.length]}.`
      : `Write ${STRUCTURE_INSTRUCTIONS.en[input.structure]}, in ${languageName}, ` +
        `on a ${THEME_LABELS.en[input.theme]} theme. The poem should be ` +
        `${LENGTH_INSTRUCTIONS.en[input.length]}.`;

  return { system, user };
}

function sanitizeContent(raw: string): string {
  let content = raw.trim();
  // Retire un éventuel bloc de code markdown (```...```) que le modèle
  // pourrait ajouter malgré la consigne.
  if (content.startsWith("```")) {
    content = content.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim();
  }
  // Retire des guillemets englobants si le modèle a "cité" le poème.
  if (
    (content.startsWith('"') && content.endsWith('"')) ||
    (content.startsWith("«") && content.endsWith("»"))
  ) {
    content = content.slice(1, -1).trim();
  }
  // Normalise les sauts de ligne multiples excessifs.
  content = content.replace(/\n{3,}/g, "\n\n");

  if (content.length === 0) {
    throw new Error("Réponse LLM vide après nettoyage.");
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    throw new Error("Réponse LLM anormalement longue — rejetée par sécurité.");
  }
  return content;
}

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
}

/**
 * Tente une génération via l'API LLM configurée. Lève une erreur en cas
 * d'échec (clé absente, réseau, timeout, réponse invalide) — à l'appelant
 * de décider du repli vers le générateur maison.
 */
export async function generateLlmPoem(input: GeneratePoemInput): Promise<GeneratedPoem> {
  const apiKey = process.env.POEM_LLM_API_KEY;
  if (!apiKey) {
    throw new Error("POEM_LLM_API_KEY n'est pas définie — LLM désactivé.");
  }

  const apiUrl = process.env.POEM_LLM_API_URL || DEFAULT_API_URL;
  const model = process.env.POEM_LLM_MODEL || DEFAULT_MODEL;
  const { system, user } = buildPrompt(input);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.9,
        max_tokens: 300,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Appel LLM en échec : HTTP ${response.status}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error("Réponse LLM sans contenu exploitable.");
    }

    return { content: sanitizeContent(rawContent), source: "llm" };
  } finally {
    clearTimeout(timeout);
  }
}
