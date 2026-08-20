export const LANGUAGES = ["fr", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

export const THEME_IDS = ["tendre", "melancolique", "reveur", "lumineux", "apaisant"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export const STRUCTURE_IDS = ["haiku", "vers_libre", "forme_courte_rimee"] as const;
export type StructureId = (typeof STRUCTURE_IDS)[number];

export const LENGTH_IDS = ["court", "moyen", "long"] as const;
export type LengthId = (typeof LENGTH_IDS)[number];

export interface ThemeBank {
  /** Vers de 5 syllabes, pour le haïku (positions 1 et 3). */
  haiku5: string[];
  /** Vers de 7 syllabes, pour le haïku (position 2). */
  haiku7: string[];
  versLibre: {
    ouverture: string[];
    milieu: string[];
    cloture: string[];
  };
  /** Distiques rimés (2 vers qui riment ensemble), assemblables entre eux. */
  couplets: [string, string][];
}

export type ThemeBanks = Record<ThemeId, ThemeBank>;

export interface GeneratePoemInput {
  language: Language;
  theme: ThemeId;
  structure: StructureId;
  length: LengthId;
}

/** "maison" = généré localement (banques de mots) ; "llm" = via l'API LLM optionnelle. */
export type PoemSource = "maison" | "llm";

export interface GeneratedPoem {
  content: string;
  source: PoemSource;
}
