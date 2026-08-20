import { describe, expect, it } from "vitest";

import { LENGTH_IDS, STRUCTURE_IDS, THEME_IDS } from "@/lib/poetry/types";
import { DICTIONARIES } from "./dictionary";
import { UI_LOCALES } from "./locale";

describe("DICTIONARIES", () => {
  it("has a non-empty translation for every key, in both locales", () => {
    for (const locale of UI_LOCALES) {
      const dict = DICTIONARIES[locale];

      expect(dict.metaTitle.trim().length).toBeGreaterThan(0);
      expect(dict.metaDescription.trim().length).toBeGreaterThan(0);
      expect(dict.footer.trim().length).toBeGreaterThan(0);

      for (const value of Object.values(dict.nav)) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
      for (const value of Object.values(dict.home)) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
      for (const value of Object.values(dict.gallery)) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
      for (const value of Object.values(dict.generator)) {
        expect(value.trim().length).toBeGreaterThan(0);
      }

      for (const language of ["fr", "en"] as const) {
        expect(dict.languages[language].trim().length).toBeGreaterThan(0);
      }
      for (const theme of THEME_IDS) {
        expect(dict.themes[theme].label.trim().length).toBeGreaterThan(0);
        expect(dict.themes[theme].hint.trim().length).toBeGreaterThan(0);
      }
      for (const structure of STRUCTURE_IDS) {
        expect(dict.structures[structure].label.trim().length).toBeGreaterThan(0);
        expect(dict.structures[structure].hint.trim().length).toBeGreaterThan(0);
      }
      for (const length of LENGTH_IDS) {
        expect(dict.lengths[length].trim().length).toBeGreaterThan(0);
      }
      for (const source of ["maison", "llm"] as const) {
        expect(dict.sources[source].trim().length).toBeGreaterThan(0);
      }
      expect(dict.dateLocale.trim().length).toBeGreaterThan(0);
    }
  });

  it("uses a distinct dateLocale per UI locale", () => {
    expect(DICTIONARIES.fr.dateLocale).not.toBe(DICTIONARIES.en.dateLocale);
  });
});
