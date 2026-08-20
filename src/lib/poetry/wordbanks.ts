import { wordBanksEn } from "./wordbanks.en";
import { wordBanksFr } from "./wordbanks.fr";
import type { Language, ThemeBank, ThemeId } from "./types";

const BANKS_BY_LANGUAGE: Record<Language, Record<ThemeId, ThemeBank>> = {
  fr: wordBanksFr,
  en: wordBanksEn,
};

/** Point d'entrée unique du générateur pour accéder aux vers d'un thème/langue. */
export function getThemeBank(language: Language, theme: ThemeId): ThemeBank {
  return BANKS_BY_LANGUAGE[language][theme];
}
