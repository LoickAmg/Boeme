import type { Language, LengthId, StructureId, ThemeId } from "./types";

/** Libellés français du générateur : ambiances, structures, longueurs, langues du poème. */
export const GENERATOR_THEMES: Record<ThemeId, { label: string; hint: string }> = {
  tendre: { label: "Tendre", hint: "douceur, gestes discrets" },
  melancolique: { label: "Mélancolique", hint: "pluie, nostalgie douce" },
  reveur: { label: "Rêveur", hint: "nuages, songes, étoiles" },
  lumineux: { label: "Lumineux", hint: "matin clair, espérance" },
  apaisant: { label: "Apaisant", hint: "thé chaud, silence cosy" },
};

export const GENERATOR_STRUCTURES: Record<StructureId, { label: string; hint: string }> = {
  haiku: { label: "Haïku", hint: "3 vers, 5-7-5" },
  vers_libre: { label: "Vers libre", hint: "sans rimes, phrasé naturel" },
  forme_courte_rimee: { label: "Forme courte rimée", hint: "distiques rimés" },
};

export const GENERATOR_LENGTHS: Record<LengthId, string> = {
  court: "Court",
  moyen: "Moyen",
  long: "Long",
};

export const GENERATOR_LANGUAGES: Record<Language, string> = {
  fr: "Français",
  en: "English",
};

/** Ambiance du générateur → thème de la bibliothèque le plus proche (pour classer un poème enregistré). */
export const GENERATOR_TO_LIBRARY_THEME: Record<ThemeId, string> = {
  tendre: "amour",
  melancolique: "melancolie",
  reveur: "reve",
  lumineux: "nature",
  apaisant: "nature",
};
